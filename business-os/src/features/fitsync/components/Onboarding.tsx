'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Flame, Dumbbell, Target, Sparkles } from 'lucide-react'
import { useLocale } from '../i18n/useLocale'
import {
  type GoalType,
  type ActivityLevel,
  type SexType,
  type Equipment,
  calculateTDEE,
  calculateMacroTargets,
} from '../utils/nutrition-calc'

interface OnboardingProps {
  onComplete: (profile: OnboardingResult) => void
}

export interface OnboardingResult {
  sex: SexType
  age: number
  weight: number
  height: number
  goal: GoalType
  activity: ActivityLevel
  equipment: Equipment[]
  tdee: number
  macros: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t, locale, setLocale } = useLocale()
  const [step, setStep] = useState(0)

  // Form state
  const [sex, setSex] = useState<SexType>('male')
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(80)
  const [height, setHeight] = useState(175)
  const [goal, setGoal] = useState<GoalType>('muscle_gain')
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [equipment, setEquipment] = useState<Equipment[]>(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'])

  const tdee = calculateTDEE(sex, weight, height, age, activity)
  const macros = calculateMacroTargets(tdee, goal, weight)

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq])
  }

  const handleFinish = () => {
    onComplete({ sex, age, weight, height, goal, activity, equipment, tdee, macros })
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <Flame size={40} className="text-emerald-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{t('onboarding_welcome')}</h1>
        <p className="text-zinc-500 mt-2">{t('onboarding_subtitle')}</p>
      </div>
      {/* Language toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setLocale('es')}
          className={`px-3 py-1.5 rounded-full text-xs ${locale === 'es' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-500'}`}
        >
          Español
        </button>
        <button
          onClick={() => setLocale('en')}
          className={`px-3 py-1.5 rounded-full text-xs ${locale === 'en' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-500'}`}
        >
          English
        </button>
      </div>
    </div>,

    // Step 1: Physical data
    <div key="physical" className="space-y-5 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Target size={20} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{t('onboarding_step1_title')}</h2>
          <p className="text-xs text-zinc-500">{t('onboarding_step1_desc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">{t('sex')}</label>
        <div className="flex gap-2">
          {(['male', 'female'] as SexType[]).map(s => (
            <button key={s} onClick={() => setSex(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${sex === s ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {s === 'male' ? t('male') : t('female')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">{t('age')}</label>
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">{t('weight')}</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">{t('height')}</label>
          <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">{t('activity_level')}</label>
        <div className="space-y-1.5">
          {([
            { v: 'sedentary' as const, k: 'activity_sedentary' as const },
            { v: 'light' as const, k: 'activity_light' as const },
            { v: 'moderate' as const, k: 'activity_moderate' as const },
            { v: 'active' as const, k: 'activity_active' as const },
            { v: 'very_active' as const, k: 'activity_very_active' as const },
          ]).map(a => (
            <button key={a.v} onClick={() => setActivity(a.v)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${activity === a.v ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {t(a.k)}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2: Goal
    <div key="goal" className="space-y-5 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Target size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{t('onboarding_step2_title')}</h2>
          <p className="text-xs text-zinc-500">{t('onboarding_step2_desc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {([
          { v: 'muscle_gain' as const, k: 'goal_muscle_gain' as const, icon: '💪', desc: { es: '+10% calorías, alta proteína', en: '+10% calories, high protein' } },
          { v: 'fat_loss' as const, k: 'goal_fat_loss' as const, icon: '🔥', desc: { es: '-20% calorías, máxima proteína', en: '-20% calories, max protein' } },
          { v: 'maintain' as const, k: 'goal_maintain' as const, icon: '⚖️', desc: { es: 'Mantener composición actual', en: 'Maintain current composition' } },
          { v: 'recomp' as const, k: 'goal_recomp' as const, icon: '🔄', desc: { es: 'Ganar músculo perdiendo grasa', en: 'Build muscle while losing fat' } },
        ]).map(g => (
          <button key={g.v} onClick={() => setGoal(g.v)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${goal === g.v ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : 'bg-zinc-800'}`}
          >
            <span className="text-2xl">{g.icon}</span>
            <div>
              <p className={`text-sm font-medium ${goal === g.v ? 'text-emerald-400' : 'text-zinc-300'}`}>{t(g.k)}</p>
              <p className="text-xs text-zinc-500">{g.desc[locale]}</p>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Equipment
    <div key="equipment" className="space-y-5 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Dumbbell size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{t('onboarding_step3_title')}</h2>
          <p className="text-xs text-zinc-500">{t('onboarding_step3_desc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {([
          { v: 'barbell' as const, k: 'eq_barbell' as const, icon: '🏋️' },
          { v: 'dumbbell' as const, k: 'eq_dumbbell' as const, icon: '💪' },
          { v: 'machine' as const, k: 'eq_machine' as const, icon: '⚙️' },
          { v: 'cable' as const, k: 'eq_cable' as const, icon: '🔗' },
          { v: 'bodyweight' as const, k: 'eq_bodyweight' as const, icon: '🤸' },
          { v: 'kettlebell' as const, k: 'eq_kettlebell' as const, icon: '🔔' },
          { v: 'band' as const, k: 'eq_band' as const, icon: '🎗️' },
        ]).map(eq => (
          <button key={eq.v} onClick={() => toggleEquipment(eq.v)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${equipment.includes(eq.v) ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : 'bg-zinc-800'}`}
          >
            <span className="text-xl">{eq.icon}</span>
            <span className={`text-sm ${equipment.includes(eq.v) ? 'text-emerald-400' : 'text-zinc-400'}`}>{t(eq.k)}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Results
    <div key="results" className="space-y-5 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Sparkles size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{t('onboarding_step4_title')}</h2>
          <p className="text-xs text-zinc-500">{t('onboarding_step4_desc')}</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{tdee}</p>
            <p className="text-xs text-zinc-500 mt-1">TDEE (kcal/{t('today').toLowerCase()})</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{macros.calories}</p>
            <p className="text-xs text-zinc-500 mt-1">Target (kcal/{t('today').toLowerCase()})</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xl font-bold text-blue-400">{macros.protein_g}g</p>
            <p className="text-[10px] text-zinc-500">{t('protein')}</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xl font-bold text-amber-400">{macros.carbs_g}g</p>
            <p className="text-[10px] text-zinc-500">{t('carbs')}</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xl font-bold text-rose-400">{macros.fat_g}g</p>
            <p className="text-[10px] text-zinc-500">{t('fat')}</p>
          </div>
        </div>
      </div>
    </div>,
  ]

  const isLast = step === steps.length - 1

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-6">
        {steps[step]}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center gap-1"
          >
            <ChevronLeft size={18} />
            {t('back')}
          </button>
        )}
        <button
          onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
          className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
        >
          {isLast ? t('lets_go') : t('next')}
          {!isLast && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
