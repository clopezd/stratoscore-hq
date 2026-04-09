'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { LoggedSet } from '../types/training'

interface SetLoggerProps {
  exerciseId: string
  exerciseName: string
  targetSets: number
  targetRepsMin: number
  targetRepsMax: number
  loggedSets: LoggedSet[]
  onLog: (set: Omit<LoggedSet, 'id'>) => void
  onRemove: (setId: string) => void
  lastWeight?: number
}

export function SetLogger({
  exerciseId,
  exerciseName,
  targetSets,
  targetRepsMin,
  targetRepsMax,
  loggedSets,
  onLog,
  onRemove,
  lastWeight,
}: SetLoggerProps) {
  const exerciseSets = loggedSets.filter(s => s.exercise_id === exerciseId)
  const [weight, setWeight] = useState(lastWeight ?? 0)
  const [reps, setReps] = useState(targetRepsMin)

  const handleLog = () => {
    onLog({
      exercise_id: exerciseId,
      set_number: exerciseSets.length + 1,
      reps,
      weight_kg: weight,
      is_warmup: false,
      rpe: null,
    })
  }

  const completed = exerciseSets.length
  const allDone = completed >= targetSets

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${allDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">{exerciseName}</p>
          <p className="text-xs text-zinc-500">
            {targetSets} x {targetRepsMin}-{targetRepsMax} reps
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          allDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
        }`}>
          {completed}/{targetSets}
        </span>
      </div>

      {/* Logged sets */}
      {exerciseSets.length > 0 && (
        <div className="space-y-1">
          {exerciseSets.map(s => (
            <div key={s.id} className="flex items-center justify-between text-xs bg-zinc-800/50 rounded px-2 py-1">
              <span className="text-zinc-400">Set {s.set_number}</span>
              <span className="text-zinc-300">{s.weight_kg}kg x {s.reps}</span>
              <button onClick={() => onRemove(s.id)} className="text-zinc-600 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      {!allDone && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-zinc-600">Peso (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              step={2.5}
              min={0}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-zinc-600">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(Number(e.target.value))}
              min={1}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleLog}
            className="mt-3 p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
