'use client'

import { useState, useCallback } from 'react'
import type { WorkoutPlan, GenerateWorkoutRequest, LoggedSet } from '../types/training'

interface UseWorkoutReturn {
  plan: WorkoutPlan | null
  generating: boolean
  error: string | null
  generatePlan: (request: GenerateWorkoutRequest) => Promise<void>
  clearPlan: () => void
}

export function useWorkoutPlan(): UseWorkoutReturn {
  const [plan, setPlan] = useState<WorkoutPlan | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('fitsync_workout_plan')
    return saved ? JSON.parse(saved) : null
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePlan = useCallback(async (request: GenerateWorkoutRequest) => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/fitsync/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: WorkoutPlan = await res.json()
      setPlan(data)
      localStorage.setItem('fitsync_workout_plan', JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando plan')
    } finally {
      setGenerating(false)
    }
  }, [])

  const clearPlan = useCallback(() => {
    setPlan(null)
    localStorage.removeItem('fitsync_workout_plan')
  }, [])

  return { plan, generating, error, generatePlan, clearPlan }
}

// ─── Active Workout Session ─────────────────────────────────────

interface ActiveWorkout {
  dayIndex: number
  dayName: string
  startedAt: string
  sets: LoggedSet[]
}

interface UseActiveWorkoutReturn {
  active: ActiveWorkout | null
  startWorkout: (dayIndex: number, dayName: string) => void
  logSet: (set: Omit<LoggedSet, 'id'>) => void
  removeSet: (setId: string) => void
  finishWorkout: () => ActiveWorkout | null
  cancelWorkout: () => void
}

export function useActiveWorkout(): UseActiveWorkoutReturn {
  const [active, setActive] = useState<ActiveWorkout | null>(null)

  const startWorkout = useCallback((dayIndex: number, dayName: string) => {
    setActive({
      dayIndex,
      dayName,
      startedAt: new Date().toISOString(),
      sets: [],
    })
  }, [])

  const logSet = useCallback((set: Omit<LoggedSet, 'id'>) => {
    setActive(prev => {
      if (!prev) return null
      return {
        ...prev,
        sets: [...prev.sets, { ...set, id: crypto.randomUUID() }],
      }
    })
  }, [])

  const removeSet = useCallback((setId: string) => {
    setActive(prev => {
      if (!prev) return null
      return { ...prev, sets: prev.sets.filter(s => s.id !== setId) }
    })
  }, [])

  const finishWorkout = useCallback((): ActiveWorkout | null => {
    if (!active) return null
    const completed = { ...active }

    // Save to history
    const history = JSON.parse(localStorage.getItem('fitsync_workout_history') || '[]')
    history.unshift({
      ...completed,
      finishedAt: new Date().toISOString(),
      duration_min: Math.round((Date.now() - new Date(completed.startedAt).getTime()) / 60000),
    })
    localStorage.setItem('fitsync_workout_history', JSON.stringify(history.slice(0, 100)))

    setActive(null)
    return completed
  }, [active])

  const cancelWorkout = useCallback(() => setActive(null), [])

  return { active, startWorkout, logSet, removeSet, finishWorkout, cancelWorkout }
}
