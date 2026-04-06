/**
 * KPI Service — BidHunter
 *
 * Calcula métricas de pipeline, funnel de conversión, y snapshots semanales.
 * Usa Supabase admin client (server-side only).
 */

import { createClient } from '@supabase/supabase-js'
import type { BidHunterKPIs, FunnelStage, WeeklySnapshot } from '../types'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function getKPIs(period?: 'week' | 'month' | 'quarter' | 'all'): Promise<BidHunterKPIs> {
  const supabase = getAdminClient()

  let query = supabase.from('bh_opportunities').select('status, estimated_value, actual_value, commission_earned, is_sdvosb_eligible')

  // Filter by period
  if (period && period !== 'all') {
    const now = new Date()
    let since: Date
    if (period === 'week') {
      since = new Date(now.getTime() - 7 * 86400000)
    } else if (period === 'month') {
      since = new Date(now.getTime() - 30 * 86400000)
    } else {
      since = new Date(now.getTime() - 90 * 86400000)
    }
    query = query.gte('created_at', since.toISOString())
  }

  const { data: opps, error } = await query
  if (error) throw error

  const rows = opps ?? []

  const stats: BidHunterKPIs = {
    total: rows.length,
    new: 0, scored: 0, interested: 0, bid_sent: 0, won: 0, lost: 0, discarded: 0,
    win_rate: 0, response_rate: 0,
    pipeline_value: 0, commission_earned: 0,
    avg_score: 0, sdvosb_count: 0,
  }

  for (const r of rows) {
    const s = r.status as string
    if (s in stats) (stats as Record<string, number>)[s]++
    if (r.estimated_value) stats.pipeline_value += Number(r.estimated_value)
    if (r.commission_earned) stats.commission_earned += Number(r.commission_earned)
    if (r.is_sdvosb_eligible) stats.sdvosb_count++
  }

  // Win rate: won / (won + lost)
  const decided = stats.won + stats.lost
  stats.win_rate = decided > 0 ? Math.round((stats.won / decided) * 100) : 0

  // Response rate: bid_sent / (scored + interested + bid_sent + won + lost)
  const actionable = stats.scored + stats.interested + stats.bid_sent + stats.won + stats.lost
  stats.response_rate = actionable > 0 ? Math.round(((stats.bid_sent + stats.won + stats.lost) / actionable) * 100) : 0

  // Avg score
  const { data: scores } = await supabase.from('bh_opportunity_scores').select('score')
  if (scores && scores.length > 0) {
    const sum = scores.reduce((acc, s) => acc + (s.score || 0), 0)
    stats.avg_score = Math.round(sum / scores.length)
  }

  return stats
}

export async function getConversionFunnel(): Promise<FunnelStage[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('bh_opportunities').select('status')
  if (error) throw error

  const rows = data ?? []
  const total = rows.length
  if (total === 0) return []

  const counts: Record<string, number> = { new: 0, scored: 0, interested: 0, bid_sent: 0, won: 0, lost: 0 }
  for (const r of rows) {
    if (r.status in counts) counts[r.status]++
  }

  // Funnel: each stage includes all opps that reached AT LEAST that stage
  const funnel: FunnelStage[] = [
    { stage: 'new', count: total, pct: 100 },
    { stage: 'scored', count: total - counts.new, pct: Math.round(((total - counts.new) / total) * 100) },
    { stage: 'interested', count: counts.interested + counts.bid_sent + counts.won, pct: Math.round(((counts.interested + counts.bid_sent + counts.won) / total) * 100) },
    { stage: 'bid_sent', count: counts.bid_sent + counts.won, pct: Math.round(((counts.bid_sent + counts.won) / total) * 100) },
    { stage: 'won', count: counts.won, pct: Math.round((counts.won / total) * 100) },
  ]

  return funnel
}

export async function getTimeSeriesData(weeks: number = 12): Promise<WeeklySnapshot[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('bh_kpi_snapshots')
    .select('week_start, win_rate, pipeline_value, bids_sent, won, commission_total')
    .order('week_start', { ascending: true })
    .limit(weeks)
  if (error) throw error
  return (data ?? []) as WeeklySnapshot[]
}

export async function snapshotCurrentWeek(): Promise<void> {
  const supabase = getAdminClient()

  // Week start = Monday of current week
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(now.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const kpis = await getKPIs('all')

  await supabase.from('bh_kpi_snapshots').upsert({
    week_start: weekStartStr,
    total_opportunities: kpis.total,
    scored: kpis.scored,
    interested: kpis.interested,
    bids_sent: kpis.bid_sent,
    won: kpis.won,
    lost: kpis.lost,
    win_rate: kpis.win_rate,
    response_rate: kpis.response_rate,
    pipeline_value: kpis.pipeline_value,
    commission_total: kpis.commission_earned,
    avg_score: kpis.avg_score,
    sdvosb_count: kpis.sdvosb_count,
  }, { onConflict: 'week_start' })
}

export async function getRecentActivity(days: number = 7) {
  const supabase = getAdminClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase
    .from('bh_pipeline_log')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data ?? []
}
