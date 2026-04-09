'use server'

import { createClient } from '@/lib/supabase/server'
import type { FSUserProfile, DailyMacros } from '../types'
import { calculateTDEE, calculateMacroTargets } from '../types'
import type { GoalType, ActivityLevel, SexType } from '../types'

export async function getProfile(): Promise<FSUserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('fs_user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function upsertProfile(profile: {
  sex: SexType
  birth_date: string
  height_cm: number
  current_weight_kg: number
  goal: GoalType
  activity_level: ActivityLevel
  dietary_preference?: string
  allergies?: string[]
  available_equipment?: string[]
  training_days_per_week?: number
}): Promise<FSUserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Calculate age from birth_date
  const birth = new Date(profile.birth_date)
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  const tdee = calculateTDEE(profile.sex, profile.current_weight_kg, profile.height_cm, age, profile.activity_level)
  const macros = calculateMacroTargets(tdee, profile.goal, profile.current_weight_kg)

  const { data, error } = await supabase
    .from('fs_user_profiles')
    .upsert({
      user_id: user.id,
      ...profile,
      tdee_kcal: tdee,
      target_calories: macros.calories,
      target_protein_g: macros.protein_g,
      target_carbs_g: macros.carbs_g,
      target_fat_g: macros.fat_g,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('[FitSync] Profile upsert error:', error)
    return null
  }
  return data
}

export async function getTargets(): Promise<DailyMacros> {
  const profile = await getProfile()
  if (!profile) {
    return { calories: 2200, protein_g: 160, carbs_g: 250, fat_g: 65 }
  }
  return {
    calories: profile.target_calories ?? 2200,
    protein_g: profile.target_protein_g ?? 160,
    carbs_g: profile.target_carbs_g ?? 250,
    fat_g: profile.target_fat_g ?? 65,
  }
}
