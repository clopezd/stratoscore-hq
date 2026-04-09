'use client'

import { useState } from 'react'
import { BarChart3, Scale, TrendingUp, Ruler, Save, Plus } from 'lucide-react'
import { WeightChart } from '@/features/fitsync/components/WeightChart'
import { MacroHistoryChart } from '@/features/fitsync/components/MacroHistoryChart'
import { WorkoutHistoryList } from '@/features/fitsync/components/WorkoutHistoryList'
import { WeeklySummary } from '@/features/fitsync/components/WeeklySummary'

type Tab = 'weight' | 'nutrition' | 'training'

export default function ProgressPage() {
  const [tab, setTab] = useState<Tab>('weight')
  const [showMetricInput, setShowMetricInput] = useState(false)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSaveMetric = async () => {
    // Save via API (uses localStorage for now, Supabase when tables are live)
    const metrics = JSON.parse(localStorage.getItem('fitsync_body_metrics') || '[]')
    metrics.push({
      date: new Date().toISOString().split('T')[0],
      weight_kg: weight ? Number(weight) : null,
      body_fat_pct: bodyFat ? Number(bodyFat) : null,
      waist_cm: waist ? Number(waist) : null,
    })
    localStorage.setItem('fitsync_body_metrics', JSON.stringify(metrics))
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowMetricInput(false) }, 1500)
  }

  const tabs: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: 'weight', label: 'Peso', icon: Scale },
    { value: 'nutrition', label: 'Nutrición', icon: TrendingUp },
    { value: 'training', label: 'Training', icon: BarChart3 },
  ]

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Progreso</h1>
        <button
          onClick={() => setShowMetricInput(!showMetricInput)}
          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Metric input */}
      {showMetricInput && (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
          <h3 className="text-sm font-medium text-zinc-300">Registrar medidas de hoy</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="80.0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Grasa (%)</label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={e => setBodyFat(e.target.value)}
                placeholder="15.0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Cintura (cm)</label>
              <input
                type="number"
                step="0.5"
                value={waist}
                onChange={e => setWaist(e.target.value)}
                placeholder="82"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={handleSaveMetric}
            disabled={!weight && !bodyFat && !waist}
            className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50'
            }`}
          >
            <Save size={16} />
            {saved ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs transition-colors ${
              tab === t.value
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'weight' && <WeightChart />}
      {tab === 'nutrition' && <MacroHistoryChart />}
      {tab === 'training' && <WorkoutHistoryList />}

      {/* Share weekly summary */}
      <WeeklySummary
        avgCalories={0}
        avgProtein={0}
        workouts={0}
        streak={0}
        weightChange={null}
      />
    </div>
  )
}
