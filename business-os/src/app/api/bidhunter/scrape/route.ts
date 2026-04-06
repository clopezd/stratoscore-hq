/**
 * POST /api/bidhunter/scrape
 *
 * Ejecuta el scraper de BuildingConnected.
 * Body: { email, password, maxPages? }
 *
 * Scrapes the bid board, inserts new opportunities, returns results.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeBuildingConnected } from '@/features/bidhunter/agents/scraper'

export const runtime = 'nodejs'
export const maxDuration = 300

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, maxPages } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const logs: string[] = []
    const onProgress = (msg: string) => { logs.push(msg) }

    // Run scraper
    const scraped = await scrapeBuildingConnected({
      email,
      password,
      maxPages: maxPages || 10,
      headless: true,
      onProgress,
    })

    if (scraped.length === 0) {
      return NextResponse.json({ message: 'No opportunities found', logs, imported: 0 })
    }

    const supabase = getAdminClient()

    // Check for duplicates by source_id or title
    const { data: existing } = await supabase
      .from('bh_opportunities')
      .select('source_id, title')

    const existingIds = new Set((existing ?? []).map(e => e.source_id).filter(Boolean))
    const existingTitles = new Set((existing ?? []).map(e => e.title.toLowerCase()))

    const now = new Date()
    const URGENT_DAYS = 3 // oportunidades que vencen en 3 días o menos → urgentes

    // Filter: remove duplicates and expired deadlines
    let expired = 0
    let urgent = 0

    const newOpps = scraped.filter(o => {
      // Duplicate check
      if (o.source_id && existingIds.has(o.source_id)) return false
      if (existingTitles.has(o.title.toLowerCase())) return false

      // Expired deadline check — discard if deadline already passed
      if (o.deadline) {
        const deadlineDate = new Date(o.deadline)
        if (!isNaN(deadlineDate.getTime()) && deadlineDate < now) {
          expired++
          return false
        }
      }

      return true
    })

    // Tag urgent opportunities (deadline within URGENT_DAYS)
    const oppsToInsert = newOpps.map(o => {
      let urgency: 'urgent' | 'soon' | 'normal' = 'normal'

      if (o.deadline) {
        const deadlineDate = new Date(o.deadline)
        if (!isNaN(deadlineDate.getTime())) {
          const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= URGENT_DAYS) {
            urgency = 'urgent'
            urgent++
          } else if (daysLeft <= 7) {
            urgency = 'soon'
          }
        }
      }

      // Prepend urgency tag to scope_notes
      let scopeNotes = o.scope_notes || ''
      if (urgency === 'urgent') {
        scopeNotes = `🚨 URGENTE — Vence en ${Math.ceil((new Date(o.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} días\n${scopeNotes}`
      } else if (urgency === 'soon') {
        scopeNotes = `⚠️ Próximo a vencer (${Math.ceil((new Date(o.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} días)\n${scopeNotes}`
      }

      return { ...o, status: 'new' as const, scope_notes: scopeNotes || null }
    })

    if (oppsToInsert.length === 0) {
      return NextResponse.json({
        message: `Scraped ${scraped.length} opportunities — ${expired > 0 ? `${expired} expired, ` : ''}rest already exist`,
        logs,
        scraped: scraped.length,
        imported: 0,
        expired,
      })
    }

    // Insert new opportunities
    const { data: inserted, error } = await supabase
      .from('bh_opportunities')
      .insert(oppsToInsert)
      .select('id, title')

    if (error) throw error

    // Log pipeline action
    await supabase.from('bh_pipeline_log').insert({
      action: 'scrape',
      details: {
        source: 'buildingconnected',
        scraped: scraped.length,
        imported: inserted?.length ?? 0,
        expired,
        urgent,
      },
    })

    // Auto-score imported opportunities in background
    if (inserted && inserted.length > 0) {
      const ids = inserted.map(o => o.id)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bidhunter/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }).catch(err => console.error('Auto-score after scrape failed:', err))
    }

    return NextResponse.json({
      message: `Scraped ${scraped.length}, imported ${inserted?.length ?? 0} new${expired > 0 ? `, ${expired} expired discarded` : ''}${urgent > 0 ? `, ${urgent} urgent` : ''} — scoring in progress`,
      logs,
      scraped: scraped.length,
      imported: inserted?.length ?? 0,
      duplicates: scraped.length - newOpps.length - expired,
      expired,
      urgent,
      opportunities: inserted,
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
