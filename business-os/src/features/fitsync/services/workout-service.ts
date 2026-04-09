'use server'

import { createClient } from '@/lib/supabase/server'
import type { WorkoutPlan, LoggedSet } from '../types/training'

// ─── Plans ──────────────────────────────────────────────────────

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Deactivate old plans
  await supabase
    .from('fs_workout_plans')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data, error } = await supabase
    .from('fs_workout_plans')
    .insert({
      user_id: user.id,
      name: plan.name,
      description: plan.description,
      split_type: plan.split_type,
      days_per_week: plan.days.length,
      plan_data: plan,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[FitSync] Save plan error:', error)
    return null
  }
  return data.id
}

export async function getActivePlan(): Promise<{ id: string; plan: WorkoutPlan } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('fs_workout_plans')
    .select('id, plan_data')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!data) return null
  return { id: data.id, plan: data.plan_data as WorkoutPlan }
}

// ─── Workout Logs ───────────────────────────────────────────────

export async function startWorkoutLog(planId: string | null, dayName: string, focus: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('fs_workout_logs')
    .insert({
      user_id: user.id,
      plan_id: planId,
      day_name: dayName,
      focus,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[FitSync] Start workout error:', error)
    return null
  }
  return data.id
}

export async function logWorkoutSet(workoutLogId: string, set: {
  exercise_id: string
  exercise_name: string
  set_number: number
  reps: number
  weight_kg: number
  is_warmup?: boolean
  rpe?: number
}): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('fs_workout_log_sets')
    .insert({ workout_log_id: workoutLogId, ...set })

  if (error) console.error('[FitSync] Log set error:', error)
  return !error
}

export async function finishWorkoutLog(workoutLogId: string, perceivedEffort: number | null): Promise<boolean> {
  const supabase = await createClient()
  const startedAt = await supabase
    .from('fs_workout_logs')
    .select('started_at')
    .eq('id', workoutLogId)
    .single()

  const duration = startedAt.data
    ? Math.round((Date.now() - new Date(startedAt.data.started_at).getTime()) / 60000)
    : null

  const { error } = await supabase
    .from('fs_workout_logs')
    .update({
      finished_at: new Date().toISOString(),
      duration_min: duration,
      perceived_effort: perceivedEffort,
    })
    .eq('id', workoutLogId)

  return !error
}

export async function getWorkoutHistory(limit: number = 30): Promise<Array<{
  id: string
  day_name: string
  focus: string | null
  started_at: string
  finished_at: string | null
  duration_min: number | null
  perceived_effort: number | null
  set_count: number
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('fs_workout_logs')
    .select('id, day_name, focus, started_at, finished_at, duration_min, perceived_effort')
    .eq('user_id', user.id)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (!data) return []

  // Get set counts
  const ids = data.map(w => w.id)
  const { data: sets } = await supabase
    .from('fs_workout_log_sets')
    .select('workout_log_id')
    .in('workout_log_id', ids)

  const countMap = new Map<string, number>()
  sets?.forEach(s => countMap.set(s.workout_log_id, (countMap.get(s.workout_log_id) || 0) + 1))

  return data.map(w => ({
    ...w,
    set_count: countMap.get(w.id) || 0,
  }))
}

export async function getExerciseHistory(exerciseId: string): Promise<Array<{
  date: string
  max_weight: number
  total_reps: number
  sets: number
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('fs_workout_log_sets')
    .select('weight_kg, reps, workout_log_id, fs_workout_logs!inner(started_at, user_id)')
    .eq('exercise_id', exerciseId)
    .eq('fs_workout_logs.user_id', user.id)
    .order('fs_workout_logs(started_at)', { ascending: true })

  if (!data) return []

  // Group by date
  const grouped = new Map<string, { max_weight: number; total_reps: number; sets: number }>()
  for (const s of data as any[]) {
    const date = new Date(s.fs_workout_logs.started_at).toISOString().split('T')[0]
    const existing = grouped.get(date) || { max_weight: 0, total_reps: 0, sets: 0 }
    grouped.set(date, {
      max_weight: Math.max(existing.max_weight, Number(s.weight_kg || 0)),
      total_reps: existing.total_reps + (s.reps || 0),
      sets: existing.sets + 1,
    })
  }

  return Array.from(grouped.entries()).map(([date, stats]) => ({ date, ...stats }))
}
