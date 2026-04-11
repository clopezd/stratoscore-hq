/**
 * GET /api/bidhunter/opportunities
 *
 * Lista oportunidades con scores. Soporta filtros via query params.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/supabase/auth-guard'

export const runtime = 'nodejs'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')
    const minScore = searchParams.get('min_score')
    const search = searchParams.get('search')

    const supabase = getAdminClient()

    let query = supabase
      .from('bh_opportunities')
      .select('*, bh_opportunity_scores(*)')
      .order('created_at', { ascending: false })
      .limit(500)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    let results = (data ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      bh_opportunity_scores: Array.isArray(r.bh_opportunity_scores)
        ? (r.bh_opportunity_scores as Record<string, unknown>[])[0] ?? null
        : r.bh_opportunity_scores,
    }))

    if (minScore) {
      const min = Number(minScore)
      results = results.filter((r: Record<string, unknown>) => {
        const scores = r.bh_opportunity_scores as Record<string, unknown> | null
        return scores && (scores.score as number) >= min
      })
    }

    // Sort by score desc
    results.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const scoreA = (a.bh_opportunity_scores as Record<string, unknown> | null)?.score as number ?? -1
      const scoreB = (b.bh_opportunity_scores as Record<string, unknown> | null)?.score as number ?? -1
      return scoreB - scoreA
    })

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('bh_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log status change
    if (updates.status) {
      await supabase.from('bh_pipeline_log').insert({
        action: `status_${updates.status}`,
        details: { opportunity_id: id, ...updates },
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
