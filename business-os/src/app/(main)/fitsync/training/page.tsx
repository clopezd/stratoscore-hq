'use client'

import { useState } from 'react'
import { Dumbbell, Loader2, Play, Square, ChevronDown, ChevronUp, Sparkles, Trash2, Clock } from 'lucide-react'
import { useWorkoutPlan, useActiveWorkout } from '@/features/fitsync/hooks/useWorkout'
import { SetLogger } from '@/features/fitsync/components/SetLogger'
import { RestTimer } from '@/features/fitsync/components/RestTimer'
import type { Equipment, SplitType, WorkoutDay } from '@/features/fitsync/types/training'

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'machine', label: 'Máquinas' },
  { value: 'cable', label: 'Cables' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Bandas' },
]

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'push_pull_legs', label: 'Push/Pull/Legs' },
  { value: 'upper_lower', label: 'Upper/Lower' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'bro_split', label: 'Bro Split' },
  { value: 'functional', label: 'Funcional' },
]

export default function TrainingPage() {
  const { plan, generating, error, generatePlan, clearPlan } = useWorkoutPlan()
  const { active, startWorkout, logSet, removeSet, finishWorkout, cancelWorkout } = useActiveWorkout()

  // Generator form state
  const [showGenerator, setShowGenerator] = useState(!plan)
  const [goal, setGoal] = useState('muscle_gain')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [equipment, setEquipment] = useState<Equipment[]>(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'])
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [split, setSplit] = useState<SplitType>('push_pull_legs')

  // Expanded day
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const handleGenerate = () => {
    generatePlan({
      goal,
      level,
      equipment,
      days_per_week: daysPerWeek,
      preferred_split: split,
    })
    setShowGenerator(false)
  }

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    )
  }

  // ─── Active Workout View ──────────────────────────────────────
  if (active && plan) {
    const day = plan.days[active.dayIndex]
    const elapsed = Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60000)

    return (
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">{day.name}</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock size={14} />
              <span>{elapsed} min</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelWorkout}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={finishWorkout}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 flex items-center gap-2"
            >
              <Square size={16} />
              Terminar
            </button>
          </div>
        </div>

        {/* Rest Timer */}
        <RestTimer defaultSeconds={90} />

        {/* Exercises */}
        <div className="space-y-3">
          {day.exercises.map(ex => (
            <SetLogger
              key={ex.exercise_id}
              exerciseId={ex.exercise_id}
              exerciseName={ex.exercise_name}
              targetSets={ex.sets}
              targetRepsMin={ex.reps_min}
              targetRepsMax={ex.reps_max}
              loggedSets={active.sets}
              onLog={logSet}
              onRemove={removeSet}
            />
          ))}
        </div>
      </div>
    )
  }

  // ─── Plan View / Generator ────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Entrenamiento</h1>
        {plan && (
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Sparkles size={14} />
            {showGenerator ? 'Ver plan' : 'Nuevo plan'}
          </button>
        )}
      </div>

      {/* Generator */}
      {(showGenerator || !plan) && (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            Genera tu plan con IA
          </h2>

          {/* Goal */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'muscle_gain', l: 'Ganar músculo' },
                { v: 'fat_loss', l: 'Perder grasa' },
                { v: 'strength', l: 'Fuerza' },
                { v: 'general_fitness', l: 'Fitness general' },
              ].map(g => (
                <button
                  key={g.v}
                  onClick={() => setGoal(g.v)}
                  className={`py-1.5 rounded-lg text-xs transition-colors ${
                    goal === g.v ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {g.l}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Nivel</label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
                    level === l ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {l === 'beginner' ? 'Principiante' : l === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </button>
              ))}
            </div>
          </div>

          {/* Days per week */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Días por semana: {daysPerWeek}</label>
            <input
              type="range"
              min={2}
              max={6}
              value={daysPerWeek}
              onChange={e => setDaysPerWeek(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </div>

          {/* Split */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Tipo de split</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SPLIT_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSplit(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                    split === s.value ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Equipo disponible</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button
                  key={eq.value}
                  onClick={() => toggleEquipment(eq.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    equipment.includes(eq.value)
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || equipment.length === 0}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generando plan...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generar plan de entrenamiento
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">{error}</p>
          )}
        </div>
      )}

      {/* Plan display */}
      {plan && !showGenerator && (
        <div className="space-y-4">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h2 className="font-semibold text-zinc-200">{plan.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{plan.split_type}</span>
              <span className="text-xs text-zinc-500">{plan.days.length} días/semana</span>
            </div>
          </div>

          {/* Days */}
          {plan.days.map((day, i) => (
            <DayCard
              key={i}
              day={day}
              index={i}
              expanded={expandedDay === i}
              onToggle={() => setExpandedDay(expandedDay === i ? null : i)}
              onStart={() => startWorkout(i, day.name)}
            />
          ))}

          {/* Clear plan */}
          <button
            onClick={clearPlan}
            className="w-full py-2 text-sm text-zinc-600 hover:text-red-400 transition-colors"
          >
            Eliminar plan y generar uno nuevo
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Day Card Component ─────────────────────────────────────────

function DayCard({
  day,
  index,
  expanded,
  onToggle,
  onStart,
}: {
  day: WorkoutDay
  index: number
  expanded: boolean
  onToggle: () => void
  onStart: () => void
}) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <span className="text-sm font-bold text-emerald-400">{index + 1}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{day.name}</p>
            <p className="text-xs text-zinc-500">{day.focus} · {day.estimated_duration_min} min</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Exercise list */}
          <div className="space-y-2">
            {day.exercises.map((ex, j) => (
              <div key={j} className="flex items-center justify-between text-sm bg-zinc-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 w-4">{j + 1}</span>
                  <span className="text-zinc-300">{ex.exercise_name}</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {ex.sets}x{ex.reps_min}-{ex.reps_max}
                </span>
              </div>
            ))}
          </div>

          {/* Start workout button */}
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/30 flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Iniciar entrenamiento
          </button>
        </div>
      )}
    </div>
  )
}
