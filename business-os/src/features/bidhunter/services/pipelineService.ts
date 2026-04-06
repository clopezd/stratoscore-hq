import { createClient } from '@/lib/supabase/client'
import type { OpportunityWithScore, OpportunityFilters, TicoProfile } from '../types'

const supabase = () => createClient()

export async function getOpportunities(filters?: Partial<OpportunityFilters>): Promise<OpportunityWithScore[]> {
  // Use API route (service role) to bypass RLS limits
  const params = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters?.search) params.set('search', filters.search)

  const res = await fetch(`/api/bidhunter/opportunities?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch opportunities')

  let results: OpportunityWithScore[] = await res.json()

  // Client-side filters
  if (filters?.stateCode) {
    results = results.filter(r => r.state_code === filters.stateCode)
  }
  if (filters?.trade) {
    results = results.filter(r => r.trades_required?.includes(filters.trade!))
  }
  if (filters?.sdvosbOnly) {
    results = results.filter(r => r.is_sdvosb_eligible)
  }
  if (filters?.minScore) {
    results = results.filter(r =>
      r.bh_opportunity_scores && r.bh_opportunity_scores.score >= filters.minScore!
    )
  }

  return results
}

export async function updateOpportunityStatus(id: string, status: string) {
  const { error } = await supabase()
    .from('bh_opportunities')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function getTicoProfile(): Promise<TicoProfile | null> {
  const { data, error } = await supabase()
    .from('bh_tico_profile')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as TicoProfile | null
}

export async function updateTicoProfile(id: string, updates: Partial<TicoProfile>) {
  const { error } = await supabase()
    .from('bh_tico_profile')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function logPipelineAction(action: string, details?: Record<string, unknown>) {
  await supabase()
    .from('bh_pipeline_log')
    .insert({ action, details })
}

export async function getOpportunityStats() {
  // Use API to get all opportunities and count by status
  const res = await fetch('/api/bidhunter/opportunities')
  if (!res.ok) throw new Error('Failed to fetch stats')
  const data: OpportunityWithScore[] = await res.json()

  const stats = { total: 0, new: 0, scored: 0, interested: 0, discarded: 0, bid_sent: 0, won: 0, lost: 0 }
  for (const row of data) {
    stats.total++
    const s = row.status as keyof typeof stats
    if (s in stats && s !== 'total') stats[s]++
  }
  return stats
}
