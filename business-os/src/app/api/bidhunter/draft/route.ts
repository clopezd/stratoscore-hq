/**
 * POST /api/bidhunter/draft — Generate bid draft
 * PUT  /api/bidhunter/draft — Save edits / mark as final
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { generateBidDraft } from '@/features/bidhunter/agents/drafter'
import type { Opportunity, OpportunityScore, TicoProfile } from '@/features/bidhunter/types'

export const runtime = 'nodejs'
export const maxDuration = 120

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const { opportunity_id, tone, language } = await req.json()
    if (!opportunity_id) {
      return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Fetch opportunity + score + profile
    const [oppRes, profileRes] = await Promise.all([
      supabase
        .from('bh_opportunities')
        .select('*, bh_opportunity_scores(*)')
        .eq('id', opportunity_id)
        .single(),
      supabase
        .from('bh_tico_profile')
        .select('*')
        .limit(1)
        .single(),
    ])

    if (oppRes.error || !oppRes.data) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    if (profileRes.error || !profileRes.data) {
      return NextResponse.json({ error: 'Tico profile not found' }, { status: 400 })
    }

    const opp = oppRes.data as unknown as Opportunity & { bh_opportunity_scores: OpportunityScore[] }
    const score = Array.isArray(opp.bh_opportunity_scores)
      ? opp.bh_opportunity_scores[0]
      : opp.bh_opportunity_scores

    if (!score) {
      return NextResponse.json({ error: 'Opportunity must be scored first' }, { status: 400 })
    }

    const profile = profileRes.data as unknown as TicoProfile

    // Get current version count
    const { count } = await supabase
      .from('bh_bid_drafts')
      .select('*', { count: 'exact', head: true })
      .eq('opportunity_id', opportunity_id)

    const version = (count || 0) + 1

    // Generate draft
    const draft = await generateBidDraft(opp, score, profile, { tone, language })

    // Save to DB
    const { data: saved, error: saveErr } = await supabase
      .from('bh_bid_drafts')
      .insert({
        opportunity_id,
        version,
        cover_letter: draft.cover_letter,
        scope_of_work: draft.scope_of_work,
        pricing_breakdown: draft.pricing_breakdown,
        total_amount: draft.total_amount,
        tone: tone || 'professional',
        language: language || 'en',
      })
      .select()
      .single()

    if (saveErr) throw saveErr

    // Log
    await supabase.from('bh_pipeline_log').insert({
      action: 'draft_generated',
      details: { opportunity_id, version, tone, total_amount: draft.total_amount },
    })

    return NextResponse.json({ draft: saved })
  } catch (err) {
    console.error('Draft API error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const { id, cover_letter, scope_of_work, pricing_breakdown, total_amount, is_final } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Draft id required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const updates: Record<string, unknown> = { edited_at: new Date().toISOString() }

    if (cover_letter !== undefined) updates.cover_letter = cover_letter
    if (scope_of_work !== undefined) updates.scope_of_work = scope_of_work
    if (pricing_breakdown !== undefined) updates.pricing_breakdown = pricing_breakdown
    if (total_amount !== undefined) updates.total_amount = total_amount
    if (is_final !== undefined) updates.is_final = is_final

    const { data, error } = await supabase
      .from('bh_bid_drafts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If marking final, update opportunity status to bid_sent
    if (is_final && data) {
      await supabase
        .from('bh_opportunities')
        .update({ status: 'bid_sent' })
        .eq('id', data.opportunity_id)

      await supabase.from('bh_pipeline_log').insert({
        action: 'draft_finalized',
        details: { draft_id: id, opportunity_id: data.opportunity_id },
      })
    }

    return NextResponse.json({ draft: data })
  } catch (err) {
    console.error('Draft PUT error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
