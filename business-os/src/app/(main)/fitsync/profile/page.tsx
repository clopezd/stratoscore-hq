'use client'

import { useState } from 'react'
import { User, Save } from 'lucide-react'
import {
  type GoalType,
  type ActivityLevel,
  type SexType,
  type DietaryPreference,
  calculateTDEE,
  calculateMacroTargets,
} from '@/features/fitsync/types'

const GOALS: { value: GoalType; label: string }[] = [
  { value: 'muscle_gain', label: 'Ganar músculo' },
  { value: 'fat_loss', label: 'Perder grasa' },
  { value: 'maintain', label: 'Mantener' },
  { value: 'recomp', label: 'Recomposición' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligero (1-3 días/sem)' },
  { value: 'moderate', label: 'Moderado (3-5 días/sem)' },
  { value: 'active', label: 'Activo (6-7 días/sem)' },
  { value: 'very_active', label: 'Muy activo (2x/día)' },
]

export default function ProfilePage() {
  const [sex, setSex] = useState<SexType>('male')
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(80)
  const [height, setHeight] = useState(175)
  const [goal, setGoal] = useState<GoalType>('muscle_gain')
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [saved, setSaved] = useState(false)

  const tdee = calculateTDEE(sex, weight, height, age, activity)
  const macros = calculateMacroTargets(tdee, goal, weight)

  const handleSave = () => {
    // TODO: Save to Supabase fs_user_profiles
    localStorage.setItem('fitsync_profile', JSON.stringify({
      sex, age, weight, height, goal, activity, tdee, macros,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <User size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Tu Perfil</h1>
          <p className="text-sm text-zinc-500">Configura tus datos para calcular macros</p>
        </div>
      </div>

      {/* Sex */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Sexo</label>
        <div className="flex gap-2">
          {(['male', 'female'] as SexType[]).map(s => (
            <button
              key={s}
              onClick={() => setSex(s)}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                sex === s
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {s === 'male' ? 'Masculino' : 'Femenino'}
            </button>
          ))}
        </div>
      </div>

      {/* Age, Weight, Height */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Edad</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Altura (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Objetivo</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`py-2 rounded-lg text-sm transition-colors ${
                goal === g.value
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Nivel de actividad</label>
        <div className="space-y-1.5">
          {ACTIVITY_LEVELS.map(a => (
            <button
              key={a.value}
              onClick={() => setActivity(a.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activity === a.value
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculated results */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Targets calculados</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{tdee}</p>
            <p className="text-xs text-zinc-500">TDEE (kcal/día)</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{macros.calories}</p>
            <p className="text-xs text-zinc-500">Target (kcal/día)</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-zinc-800 rounded-lg p-2">
            <p className="text-lg font-bold text-blue-400">{macros.protein_g}g</p>
            <p className="text-[10px] text-zinc-500">Proteína</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2">
            <p className="text-lg font-bold text-amber-400">{macros.carbs_g}g</p>
            <p className="text-[10px] text-zinc-500">Carbos</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2">
            <p className="text-lg font-bold text-rose-400">{macros.fat_g}g</p>
            <p className="text-[10px] text-zinc-500">Grasa</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
          saved
            ? 'bg-emerald-500 text-white'
            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
        }`}
      >
        <Save size={18} />
        {saved ? 'Guardado!' : 'Guardar perfil'}
      </button>
    </div>
  )
}
