'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Body Metrics ───────────────────────────────────────────────

export async function logBodyMetric(metric: {
  weight_kg?: number
  body_fat_pct?: number
  waist_cm?: number
  chest_cm?: number
  arm_cm?: number
  notes?: string
}): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('fs_body_metrics')
    .upsert({
      user_id: user.id,
      date: today,
      ...metric,
    }, { onConflict: 'user_id,date' })

  if (error) {
    console.error('[FitSync] Body metric error:', error)
    return false
  }
  return true
}

export async function getBodyMetricHistory(days: number = 90): Promise<Array<{
  date: string
  weight_kg: number | null
  body_fat_pct: number | null
  waist_cm: number | null
  chest_cm: number | null
  arm_cm: number | null
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('fs_body_metrics')
    .select('date, weight_kg, body_fat_pct, waist_cm, chest_cm, arm_cm')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return (data ?? []).map(d => ({
    ...d,
    weight_kg: d.weight_kg ? Number(d.weight_kg) : null,
    body_fat_pct: d.body_fat_pct ? Number(d.body_fat_pct) : null,
    waist_cm: d.waist_cm ? Number(d.waist_cm) : null,
    chest_cm: d.chest_cm ? Number(d.chest_cm) : null,
    arm_cm: d.arm_cm ? Number(d.arm_cm) : null,
  }))
}

// ─── Sync Targets ───────────────────────────────────────────────

export async function saveDailyTarget(target: {
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
  training_intensity: string
  adjustment_reason: string
  sync_adjustments: any
}): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('fs_daily_targets')
    .upsert({
      user_id: user.id,
      date: today,
      ...target,
    }, { onConflict: 'user_id,date' })

  return !error
}

export async function getTodayTarget(): Promise<{
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
  training_intensity: string | null
  adjustment_reason: string | null
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('fs_daily_targets')
    .select('target_calories, target_protein_g, target_carbs_g, target_fat_g, training_intensity, adjustment_reason')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data
}
