'use client'

import { useState, useEffect } from 'react'
import { Dumbbell, Clock, Flame, BarChart3 } from 'lucide-react'

interface WorkoutEntry {
  dayName: string
  startedAt: string
  finishedAt: string
  duration_min: number
  sets: Array<{ exercise_id: string; weight_kg: number; reps: number }>
}

export function WorkoutHistoryList() {
  const [history, setHistory] = useState<WorkoutEntry[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('fitsync_workout_history')
    if (raw) setHistory(JSON.parse(raw))
  }, [])

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell size={32} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-zinc-500 text-sm">No hay entrenamientos registrados</p>
        <p className="text-zinc-600 text-xs mt-1">Completa tu primer entrenamiento para ver el historial</p>
      </div>
    )
  }

  // Stats
  const totalWorkouts = history.length
  const totalSets = history.reduce((s, w) => s + (w.sets?.length || 0), 0)
  const avgDuration = Math.round(history.reduce((s, w) => s + (w.duration_min || 0), 0) / totalWorkouts)
  const totalVolume = history.reduce((s, w) =>
    s + (w.sets?.reduce((ss, set) => ss + (set.weight_kg || 0) * (set.reps || 0), 0) || 0), 0
  )

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-zinc-900 rounded-xl p-2.5 text-center border border-zinc-800">
          <p className="text-lg font-bold text-emerald-400">{totalWorkouts}</p>
          <p className="text-[9px] text-zinc-500">Workouts</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-2.5 text-center border border-zinc-800">
          <p className="text-lg font-bold text-blue-400">{totalSets}</p>
          <p className="text-[9px] text-zinc-500">Sets</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-2.5 text-center border border-zinc-800">
          <p className="text-lg font-bold text-amber-400">{avgDuration}m</p>
          <p className="text-[9px] text-zinc-500">Prom/sesión</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-2.5 text-center border border-zinc-800">
          <p className="text-lg font-bold text-rose-400">{(totalVolume / 1000).toFixed(1)}t</p>
          <p className="text-[9px] text-zinc-500">Vol. total</p>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-2">
        <h3 className="text-sm text-zinc-400">Historial reciente</h3>
        {history.map((w, i) => {
          const date = new Date(w.startedAt)
          const sessionVolume = w.sets?.reduce((s, set) => s + (set.weight_kg || 0) * (set.reps || 0), 0) || 0

          return (
            <div key={i} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{w.dayName}</p>
                  <p className="text-xs text-zinc-500">
                    {date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {w.duration_min}m
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 size={12} />
                    {w.sets?.length || 0} sets
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={12} />
                    {(sessionVolume / 1000).toFixed(1)}t
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
