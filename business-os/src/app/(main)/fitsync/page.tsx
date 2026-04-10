'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Flame, Plus } from 'lucide-react'

// Error boundary to catch and display the actual error
class FitSyncErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <p className="font-bold text-red-700">Error in: {this.props.name}</p>
          <p className="text-red-600 text-xs mt-1">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

// Lazy imports to isolate failures
const MacroBar = React.lazy(() => import('@/features/fitsync/components/MacroBar').then(m => ({ default: m.MacroBar })))
const MealLog = React.lazy(() => import('@/features/fitsync/components/MealLog').then(m => ({ default: m.MealLog })))
const FoodCamera = React.lazy(() => import('@/features/fitsync/components/FoodCamera').then(m => ({ default: m.FoodCamera })))
const SyncAlerts = React.lazy(() => import('@/features/fitsync/components/SyncAlerts').then(m => ({ default: m.SyncAlerts })))
const StreakBadge = React.lazy(() => import('@/features/fitsync/components/StreakBadge').then(m => ({ default: m.StreakBadge })))
const Badges = React.lazy(() => import('@/features/fitsync/components/Badges').then(m => ({ default: m.Badges })))
const Paywall = React.lazy(() => import('@/features/fitsync/components/Paywall').then(m => ({ default: m.Paywall })))
const Onboarding = React.lazy(() => import('@/features/fitsync/components/Onboarding').then(m => ({ default: m.Onboarding })))

import type { DailyMacros } from '@/features/fitsync/utils/nutrition-calc'

interface FoodAnalysis {
  meal_name: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fiber_g: number
  confidence: number
}

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
  const [tier, setTier] = useState<string>('free')

  // Check onboarding + tier without hooks that might fail
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

    // Check tier
    fetch('/api/fitsync/checkout/verify')
      .then(r => r.json())
      .then(d => setTier(d.tier || 'free'))
      .catch(() => setTier('free'))
  }, [])

  const handleOnboardingComplete = useCallback((result: any) => {
    localStorage.setItem('fitsync_profile', JSON.stringify({
      sex: result.sex, age: result.age, weight: result.weight, height: result.height,
      goal: result.goal, activity: result.activity, equipment: result.equipment,
      tdee: result.tdee, macros: result.macros,
    }))
    setProfileTargets(result.macros)
    setShowOnboarding(false)
  }, [])

  if (showOnboarding) {
    return (
      <FitSyncErrorBoundary name="Onboarding">
        <React.Suspense fallback={<div className="p-8 text-center text-gray-400">Cargando onboarding...</div>}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </React.Suspense>
      </FitSyncErrorBoundary>
    )
  }

  const targets = profileTargets || DEFAULT_TARGETS

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
    setMeals(prev => [{
      id: crypto.randomUUID(),
      name: analysis.meal_name,
      imageUrl,
      calories: analysis.total_calories,
      protein_g: analysis.total_protein_g,
      carbs_g: analysis.total_carbs_g,
      fat_g: analysis.total_fat_g,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }, ...prev])
    setShowCamera(false)
  }, [])

  const caloriesPct = targets.calories > 0
    ? Math.min((consumed.calories / targets.calories) * 100, 100)
    : 0

  const isPaid = tier === 'pro' || tier === 'elite'

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

      {/* Each component wrapped in error boundary */}
      <React.Suspense fallback={null}>
        <FitSyncErrorBoundary name="StreakBadge">
          <StreakBadge />
        </FitSyncErrorBoundary>
      </React.Suspense>

      {/* Calorie ring - pure JSX, no component */}
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" strokeWidth="10"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - caloriesPct / 100)}`}
              className="transition-all duration-700" />
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
        <React.Suspense fallback={null}>
          <FitSyncErrorBoundary name="MacroBar-Protein">
            <MacroBar label="Proteína" current={consumed.protein_g} target={targets.protein_g} color="#60a5fa" />
          </FitSyncErrorBoundary>
          <FitSyncErrorBoundary name="MacroBar-Carbs">
            <MacroBar label="Carbohidratos" current={consumed.carbs_g} target={targets.carbs_g} color="#fbbf24" />
          </FitSyncErrorBoundary>
          <FitSyncErrorBoundary name="MacroBar-Fat">
            <MacroBar label="Grasa" current={consumed.fat_g} target={targets.fat_g} color="#f87171" />
          </FitSyncErrorBoundary>
        </React.Suspense>
      </div>

      {/* Camera */}
      {showCamera && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <React.Suspense fallback={<p className="text-gray-400 text-center py-4">Cargando cámara...</p>}>
            <FitSyncErrorBoundary name="FoodCamera">
              <FoodCamera onAnalysisComplete={handleAnalysisComplete} />
            </FitSyncErrorBoundary>
          </React.Suspense>
        </div>
      )}

      {/* Meal log */}
      <React.Suspense fallback={null}>
        <FitSyncErrorBoundary name="MealLog">
          <MealLog meals={meals} />
        </FitSyncErrorBoundary>
      </React.Suspense>

      {/* Badges */}
      <React.Suspense fallback={null}>
        <FitSyncErrorBoundary name="Badges">
          <Badges />
        </FitSyncErrorBoundary>
      </React.Suspense>
    </div>
  )
}
