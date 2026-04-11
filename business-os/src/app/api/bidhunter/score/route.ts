/**
 * POST /api/bidhunter/score
 *
 * Ejecuta scoring IA en oportunidades nuevas (status = 'new').
 * Opcionalmente acepta { ids: string[] } para scorear oportunidades específicas.
 *
 * Retorna array de scores generados.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { evaluateOpportunity, evaluateBatch, BATCH_SIZE } from '@/features/bidhunter/agents/evaluator'
import { getAggregatedExtraction } from '@/features/bidhunter/services/pdfService'
import { applyEnrichment } from '@/features/bidhunter/services/enrichmentService'
import { buildBidFormData, generateBidForm } from '@/features/bidhunter/services/bidFormService'
import type { Opportunity, TicoProfile, BidEstimate } from '@/features/bidhunter/types'

export const runtime = 'nodejs'
export const maxDuration = 120

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const body = await req.json().catch(() => ({}))
    const ids: string[] | undefined = body.ids
    const force: boolean = body.force === true // explicit force to re-score non-new

    const supabase = getAdminClient()

    // Get Tico profile
    const { data: profile, error: profileErr } = await supabase
      .from('bh_tico_profile')
      .select('*')
      .limit(1)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Tico profile not found' }, { status: 400 })
    }

    // Get opportunities to score — only status='new' unless force=true
    let query = supabase.from('bh_opportunities').select('*')

    if (ids && ids.length > 0) {
      query = query.in('id', ids)
      if (!force) query = query.eq('status', 'new')
    } else {
      query = query.eq('status', 'new')
    }

    const { data: opportunities, error: oppErr } = await query
    if (oppErr) throw oppErr

    if (!opportunities || opportunities.length === 0) {
      return NextResponse.json({ message: 'No opportunities to score', scores: [] })
    }

    const scores = []
    const highScores = []
    const typedOpps = opportunities as Opportunity[]
    const typedProfile = profile as unknown as TicoProfile

    // Phase 1: Enrich all opportunities and fetch PDF data
    const enrichedItems: Array<{
      opp: Opportunity
      pdfData: Awaited<ReturnType<typeof getAggregatedExtraction>>
      enrichResult: ReturnType<typeof applyEnrichment>
    }> = []

    for (const opp of typedOpps) {
      const origLocation = opp.location
      const origState = opp.state_code
      const origSDVOSB = opp.is_sdvosb_eligible
      const origTrades = opp.trades_required

      const oppRecord = opp as unknown as Record<string, unknown>
      const enrichResult = applyEnrichment(oppRecord)

      if (enrichResult.changed) {
        const updates: Record<string, unknown> = {}
        if (oppRecord.location && !origLocation) updates.location = oppRecord.location
        if (oppRecord.state_code && !origState) updates.state_code = oppRecord.state_code
        if (oppRecord.is_sdvosb_eligible && !origSDVOSB) updates.is_sdvosb_eligible = true
        if ((oppRecord.trades_required as string[])?.length && (!origTrades || origTrades.length === 0)) {
          updates.trades_required = oppRecord.trades_required
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('bh_opportunities').update(updates).eq('id', opp.id)
        }
      }

      const pdfData = await getAggregatedExtraction(opp.id)
      enrichedItems.push({ opp: oppRecord as unknown as Opportunity, pdfData, enrichResult })
    }

    // Phase 2: Score in batches of BATCH_SIZE
    // Items with PDF data get scored individually (need full context), rest in batches
    const withPdf = enrichedItems.filter(i => i.pdfData && i.pdfData.documents_count > 0)
    const withoutPdf = enrichedItems.filter(i => !i.pdfData || i.pdfData.documents_count === 0)

    // Score PDF-enriched items individually (they need full PDF context)
    for (const item of withPdf) {
      try {
        const result = await evaluateOpportunity(item.opp, typedProfile, item.pdfData)
        await saveScore(supabase, item, result, scores, highScores)
      } catch (err) {
        console.error(`Error scoring ${item.opp.id}:`, err)
        scores.push({ id: item.opp.id, title: item.opp.title, error: (err as Error).message })
      }
    }

    // Score non-PDF items in batches
    for (let i = 0; i < withoutPdf.length; i += BATCH_SIZE) {
      const batch = withoutPdf.slice(i, i + BATCH_SIZE)
      try {
        if (batch.length === 1) {
          const item = batch[0]
          const result = await evaluateOpportunity(item.opp, typedProfile)
          await saveScore(supabase, item, result, scores, highScores)
        } else {
          const batchItems = batch.map(b => ({ opportunity: b.opp, pdfData: b.pdfData }))
          const resultsMap = await evaluateBatch(batchItems, typedProfile)

          for (const item of batch) {
            const result = resultsMap.get(item.opp.id)
            if (result) {
              await saveScore(supabase, item, result, scores, highScores)
            } else {
              scores.push({ id: item.opp.id, title: item.opp.title, error: 'Not in batch response' })
            }
          }
        }
      } catch (err) {
        // Fallback: if batch fails, try individually
        console.error(`Batch scoring failed, falling back to individual:`, (err as Error).message)
        for (const item of batch) {
          try {
            const result = await evaluateOpportunity(item.opp, typedProfile)
            await saveScore(supabase, item, result, scores, highScores)
          } catch (innerErr) {
            console.error(`Error scoring ${item.opp.id}:`, innerErr)
            scores.push({ id: item.opp.id, title: item.opp.title, error: (innerErr as Error).message })
          }
        }
      }
    }

    // Send Telegram notifications for high scores
    if (highScores.length > 0) {
      await notifyTelegram(highScores)
    }

    return NextResponse.json({
      message: `Scored ${scores.length} opportunities (${Math.ceil(withoutPdf.length / BATCH_SIZE)} batches + ${withPdf.length} individual)`,
      high_scores: highScores.length,
      scores,
    })
  } catch (err) {
    console.error('Score API error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveScore(
  supabase: any,
  item: { opp: Opportunity; enrichResult: ReturnType<typeof applyEnrichment> },
  result: { score: number; justification: string; matching_services: string[]; sdvosb_bonus: boolean; bid_estimate: BidEstimate | null },
  scores: unknown[],
  highScores: unknown[],
) {
  const { error: scoreErr } = await supabase
    .from('bh_opportunity_scores')
    .upsert({
      opportunity_id: item.opp.id,
      score: result.score,
      justification: result.justification,
      matching_services: result.matching_services,
      sdvosb_bonus: result.sdvosb_bonus,
      bid_estimate: result.bid_estimate,
      scored_at: new Date().toISOString(),
    }, { onConflict: 'opportunity_id' })

  if (scoreErr) throw scoreErr

  await supabase
    .from('bh_opportunities')
    .update({ status: 'scored' })
    .eq('id', item.opp.id)

  await supabase.from('bh_pipeline_log').insert({
    action: 'score',
    details: {
      opportunity_id: item.opp.id,
      score: result.score,
      sdvosb_bonus: result.sdvosb_bonus,
      enrichment: item.enrichResult.changed ? {
        sdvosb_signals: item.enrichResult.signals,
        trades_detected: item.enrichResult.trades,
      } : null,
    },
  })

  scores.push({ id: item.opp.id, title: item.opp.title, ...result })

  if (result.score >= 80) {
    highScores.push({ id: item.opp.id, title: item.opp.title, ...result, opp: item.opp })
  }
}

async function notifyTelegram(
  highScores: Array<{
    id: string
    title: string
    score: number
    justification: string
    sdvosb_bonus: boolean
    bid_estimate: BidEstimate | null
    opp: Opportunity
  }>,
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.log('Telegram not configured, skipping notifications')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  for (const item of highScores) {
    // Generate pricing from bid form service (uses PDF data if available)
    let pricingLines: string[] = []
    let totalBid = 0
    let commission = 0

    try {
      const extraction = await getAggregatedExtraction(item.id)
      const formData = buildBidFormData(item.opp, extraction, item.bid_estimate)
      const result = generateBidForm(formData)
      const p = result.pricing

      if (p.exterior) {
        pricingLines.push(`📐 Ext: ${p.exterior.sqft.toLocaleString()} sqft × $${p.exterior.rate} = $${p.exterior.subtotal.toLocaleString()}`)
      }
      if (p.interior) {
        pricingLines.push(`📐 Int: ${p.interior.sqft.toLocaleString()} sqft × $${p.interior.rate} = $${p.interior.subtotal.toLocaleString()}`)
      }
      if (p.stucco) {
        pricingLines.push(`📐 Stucco: ${p.stucco.sqft.toLocaleString()} sqft × $${p.stucco.rate} = $${p.stucco.subtotal.toLocaleString()}`)
      }
      if (p.highRise) {
        pricingLines.push(`⚠️ Edificio >4 pisos — equipo extra`)
      }

      totalBid = p.total
      commission = p.commission5pct
    } catch {
      // Fallback to bid_estimate from scoring if bid form generation fails
      if (item.bid_estimate?.total_estimate) {
        totalBid = item.bid_estimate.total_estimate
        commission = Math.round(totalBid * 0.05)
      }
    }

    const deadline = item.opp.deadline
      ? new Date(item.opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : null
    const daysLeft = item.opp.deadline
      ? Math.ceil((new Date(item.opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const lines: string[] = [
      `🎯 *BidHunter — Score ${item.score}*${item.sdvosb_bonus ? ' 🏛 SDVOSB' : ''}`,
      ``,
      `*${item.title}*`,
      `GC: ${item.opp.gc_name || 'Unknown'}`,
      `📍 ${item.opp.location || '?'}${item.opp.state_code ? ', ' + item.opp.state_code : ''}`,
    ]

    if (pricingLines.length > 0) {
      lines.push(``)
      lines.push(...pricingLines)
    }

    if (totalBid > 0) {
      lines.push(``)
      lines.push(`💰 *Total: $${totalBid.toLocaleString()}* (incl. 7% tax)`)
      lines.push(`💵 *Tu comisión: $${commission.toLocaleString()}*`)
    }

    if (deadline && daysLeft != null) {
      lines.push(`⏰ Due: ${deadline} (${daysLeft} días)`)
    }

    lines.push(``)
    lines.push(`📋 Descargar Bid Form → BidHunter`)

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join('\n'),
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      })
    } catch (err) {
      console.error('Telegram notification failed:', err)
    }
  }
}
