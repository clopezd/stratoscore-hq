'use server'

import { createClient } from '@/lib/supabase/server'
import type { FSMeal, FoodAnalysis, MealType, DailyMacros } from '../types'

export async function logMeal(meal: {
  name: string
  meal_type: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g?: number
  image_url?: string
  ai_analysis?: FoodAnalysis
  ai_confidence?: number
}): Promise<FSMeal | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('fs_meals')
    .insert({
      user_id: user.id,
      ...meal,
    })
    .select()
    .single()

  if (error) {
    console.error('[FitSync] Meal log error:', error)
    return null
  }
  return data
}

export async function getTodayMeals(): Promise<FSMeal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('fs_meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false })

  return data ?? []
}

export async function getMealsByDateRange(startDate: string, endDate: string): Promise<FSMeal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('fs_meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)
    .order('logged_at', { ascending: false })

  return data ?? []
}

export async function getDailyMacroHistory(days: number = 30): Promise<Array<{ date: string; consumed: DailyMacros }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('fs_meals')
    .select('logged_at, calories, protein_g, carbs_g, fat_g')
    .eq('user_id', user.id)
    .gte('logged_at', startDate.toISOString())
    .order('logged_at', { ascending: true })

  if (!data) return []

  // Group by date
  const grouped = new Map<string, DailyMacros>()
  for (const meal of data) {
    const date = new Date(meal.logged_at).toISOString().split('T')[0]
    const existing = grouped.get(date) || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    grouped.set(date, {
      calories: existing.calories + (meal.calories || 0),
      protein_g: existing.protein_g + Number(meal.protein_g || 0),
      carbs_g: existing.carbs_g + Number(meal.carbs_g || 0),
      fat_g: existing.fat_g + Number(meal.fat_g || 0),
    })
  }

  return Array.from(grouped.entries()).map(([date, consumed]) => ({ date, consumed }))
}

export async function deleteMeal(mealId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('fs_meals').delete().eq('id', mealId)
  return !error
}
