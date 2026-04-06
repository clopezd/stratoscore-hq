/**
 * POST /api/bidhunter/add
 *
 * Adds one or more opportunities and auto-scores them.
 * Body: { opportunities: [...] } or single { title, gc_name, ... }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  try {
    const body = await req.json()
    const opps = body.opportunities || [body]

    if (!opps || opps.length === 0) {
      return NextResponse.json({ error: 'No opportunities provided' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const toInsert = opps.map((o: Record<string, unknown>) => ({
      title: o.title,
      description: o.description || null,
      gc_name: o.gc_name || null,
      gc_contact: o.gc_contact || null,
      location: o.location || null,
      state_code: o.state_code || null,
      deadline: o.deadline || null,
      estimated_value: o.estimated_value ? Number(o.estimated_value) : null,
      trades_required: o.trades_required || null,
      is_sdvosb_eligible: o.is_sdvosb_eligible || false,
      building_sqft: o.building_sqft ? Number(o.building_sqft) : null,
      building_height_floors: o.building_height_floors ? Number(o.building_height_floors) : null,
      scope_notes: o.scope_notes || null,
      source_platform: o.source_platform || 'buildingconnected',
      source_id: o.source_id || null,
      status: 'new',
    }))

    const { data: inserted, error } = await supabase
      .from('bh_opportunities')
      .insert(toInsert)
      .select('id, title')

    if (error) throw error

    await supabase.from('bh_pipeline_log').insert({
      action: opps.length > 1 ? 'bulk_add' : 'manual_add',
      details: { count: inserted?.length ?? 0 },
    })

    // Auto-score in background
    if (inserted && inserted.length > 0) {
      const ids = inserted.map(o => o.id)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/bidhunter/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }).catch(err => console.error('Auto-score after add failed:', err))
    }

    return NextResponse.json({
      message: `Added ${inserted?.length ?? 0} — scoring in progress`,
      count: inserted?.length ?? 0,
      opportunities: inserted,
    })
  } catch (err) {
    console.error('Add API error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
