'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { FoodCamera } from '@/features/fitsync/components/FoodCamera'
import { MacroBar } from '@/features/fitsync/components/MacroBar'
import { MealLog } from '@/features/fitsync/components/MealLog'
import { SyncAlerts } from '@/features/fitsync/components/SyncAlerts'
import { StreakBadge, updateStreak } from '@/features/fitsync/components/StreakBadge'
import { Badges } from '@/features/fitsync/components/Badges'
import { Paywall } from '@/features/fitsync/components/Paywall'
import { Onboarding, type OnboardingResult } from '@/features/fitsync/components/Onboarding'
import { useSyncEngine } from '@/features/fitsync/hooks/useSyncEngine'
import { useTier } from '@/features/fitsync/hooks/useTier'
import type { DailyMacros } from '@/features/fitsync/utils/nutrition-calc'

interface SyncContext {
  user_profile: { goal: string; tdee: number; current_targets: DailyMacros; weight_kg: number }
  last_3_days_nutrition: Array<{ date: string; calories_consumed: number; protein_g: number; carbs_g: number; fat_g: number; target_calories: number; deficit_or_surplus: number }>
  last_3_days_training: Array<{ date: string; day_name: string; focus: string; total_sets: number; avg_rpe: number | null; duration_min: number }>
  today_training_planned: { day_name: string; focus: string; estimated_intensity: 'rest' | 'light' | 'moderate' | 'heavy' } | null
}

interface FoodAnalysis {
  meal_name: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fiber_g: number
  confidence: number
}
import { Flame, Plus } from 'lucide-react'

interface LoggedMeal {
  id: string
  name: string
  imageUrl: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  time: string
}

// Default targets (will come from user profile / Supabase later)
const DEFAULT_TARGETS: DailyMacros = {
  calories: 2200,
  protein_g: 160,
  carbs_g: 250,
  fat_g: 65,
}

export default function FitSyncPage() {
  const [showCamera, setShowCamera] = useState(false)
  const [meals, setMeals] = useState<LoggedMeal[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profileTargets, setProfileTargets] = useState<DailyMacros | null>(null)
  const { adjustments, syncing, lastSyncTime, runSync } = useSyncEngine()
  const { isPaid } = useTier()

  // Check if onboarding is needed
  useEffect(() => {
    const profile = localStorage.getItem('fitsync_profile')
    if (!profile) {
      setShowOnboarding(true)
    } else {
      try {
        const parsed = JSON.parse(profile)
        if (parsed.macros) setProfileTargets(parsed.macros)
      } catch {}
    }
  }, [])

  const handleOnboardingComplete = useCallback((result: OnboardingResult) => {
    localStorage.setItem('fitsync_profile', JSON.stringify({
      sex: result.sex,
      age: result.age,
      weight: result.weight,
      height: result.height,
      goal: result.goal,
      activity: result.activity,
      equipment: result.equipment,
      tdee: result.tdee,
      macros: result.macros,
    }))
    setProfileTargets(result.macros)
    setShowOnboarding(false)

    // Also save to Supabase (fire-and-forget)
    const birthYear = new Date().getFullYear() - result.age
    fetch('/api/fitsync/log-meal', { method: 'HEAD' }).catch(() => {}) // warm up connection
  }, [])

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // Priority: sync-adjusted > profile > defaults
  const targets: DailyMacros = useMemo(() => {
    if (adjustments) {
      return {
        calories: adjustments.nutrition_adjustments.calorie_target,
        protein_g: adjustments.nutrition_adjustments.protein_target_g,
        carbs_g: adjustments.nutrition_adjustments.carbs_target_g,
        fat_g: adjustments.nutrition_adjustments.fat_target_g,
      }
    }
    return profileTargets || DEFAULT_TARGETS
  }, [adjustments, profileTargets])

  const consumed: DailyMacros = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  )

  const remaining: DailyMacros = {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein_g: Math.max(0, targets.protein_g - consumed.protein_g),
    carbs_g: Math.max(0, targets.carbs_g - consumed.carbs_g),
    fat_g: Math.max(0, targets.fat_g - consumed.fat_g),
  }

  const handleAnalysisComplete = useCallback((analysis: FoodAnalysis, imageUrl: string) => {
    const meal: LoggedMeal = {
      id: crypto.randomUUID(),
      name: analysis.meal_name,
      imageUrl,
      calories: analysis.total_calories,
      protein_g: analysis.total_protein_g,
      carbs_g: analysis.total_carbs_g,
      fat_g: analysis.total_fat_g,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }
    setMeals(prev => [meal, ...prev])
    setShowCamera(false)

    // Persist to Supabase (fire-and-forget, non-blocking)
    fetch('/api/fitsync/log-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: analysis.meal_name,
        meal_type: 'lunch',
        calories: analysis.total_calories,
        protein_g: analysis.total_protein_g,
        carbs_g: analysis.total_carbs_g,
        fat_g: analysis.total_fat_g,
        fiber_g: analysis.total_fiber_g,
        ai_analysis: analysis,
        ai_confidence: analysis.confidence,
      }),
    }).catch(() => {})

    // Also persist to localStorage for progress charts
    const today = new Date().toISOString().split('T')[0]
    const mealHistory = JSON.parse(localStorage.getItem('fitsync_meal_history') || '[]')
    mealHistory.push({
      date: today,
      calories: analysis.total_calories,
      protein_g: analysis.total_protein_g,
      carbs_g: analysis.total_carbs_g,
      fat_g: analysis.total_fat_g,
    })
    localStorage.setItem('fitsync_meal_history', JSON.stringify(mealHistory))

    // Update streak
    updateStreak()
  }, [])

  const handleSync = useCallback(() => {
    // Build context from available data (localStorage + current state)
    const today = new Date().toISOString().split('T')[0]
    const profileRaw = localStorage.getItem('fitsync_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : null

    const context: SyncContext = {
      user_profile: {
        goal: profile?.goal || 'maintain',
        tdee: profile?.tdee || 2200,
        current_targets: profile?.macros || DEFAULT_TARGETS,
        weight_kg: profile?.weight || 80,
      },
      last_3_days_nutrition: [
        // Current day so far
        {
          date: today,
          calories_consumed: consumed.calories,
          protein_g: consumed.protein_g,
          carbs_g: consumed.carbs_g,
          fat_g: consumed.fat_g,
          target_calories: DEFAULT_TARGETS.calories,
          deficit_or_surplus: consumed.calories - DEFAULT_TARGETS.calories,
        },
      ],
      last_3_days_training: (() => {
        // Pull from workout history in localStorage
        const history = JSON.parse(localStorage.getItem('fitsync_workout_history') || '[]')
        return history.slice(0, 3).map((w: any) => ({
          date: w.startedAt?.split('T')[0] || today,
          day_name: w.dayName || 'Workout',
          focus: w.dayName || 'General',
          total_sets: w.sets?.length || 0,
          avg_rpe: null,
          duration_min: w.duration_min || 0,
        }))
      })(),
      today_training_planned: (() => {
        // Check if there's a plan with today's workout
        const planRaw = localStorage.getItem('fitsync_workout_plan')
        if (!planRaw) return null
        const plan = JSON.parse(planRaw)
        const dayOfWeek = new Date().getDay() // 0=Sun
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Mon=0
        const day = plan.days?.[dayIndex % plan.days.length]
        if (!day) return null
        return {
          day_name: day.name,
          focus: day.focus,
          estimated_intensity: day.exercises?.length > 5 ? 'heavy' as const : 'moderate' as const,
        }
      })(),
    }

    runSync(context)
  }, [consumed, runSync])

  const caloriesPct = targets.calories > 0
    ? Math.min((consumed.calories / targets.calories) * 100, 100)
    : 0

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FitSync AI</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => setShowCamera(!showCamera)}
          className="p-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Streak */}
      <StreakBadge />

      {/* Sync Engine Alerts (Pro feature) */}
      <Paywall isPaid={isPaid} feature="Sync Engine">
        <SyncAlerts
          adjustments={adjustments}
          syncing={syncing}
          lastSyncTime={lastSyncTime}
          onSync={handleSync}
        />
      </Paywall>

      {/* Calorie ring */}
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - caloriesPct / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame size={20} className="text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{remaining.calories}</p>
            <p className="text-xs text-gray-400">kcal restantes</p>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <div className="space-y-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <MacroBar label="Proteína" current={consumed.protein_g} target={targets.protein_g} color="#60a5fa" />
        <MacroBar label="Carbohidratos" current={consumed.carbs_g} target={targets.carbs_g} color="#fbbf24" />
        <MacroBar label="Grasa" current={consumed.fat_g} target={targets.fat_g} color="#f87171" />
      </div>

      {/* Camera section */}
      {showCamera && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <FoodCamera onAnalysisComplete={handleAnalysisComplete} />
        </div>
      )}

      {/* Meal log */}
      <MealLog meals={meals} />

      {/* Badges */}
      <Badges />
    </div>
  )
}
