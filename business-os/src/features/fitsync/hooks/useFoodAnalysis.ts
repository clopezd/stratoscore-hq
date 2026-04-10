'use client'

import { useState, useCallback } from 'react'
import type { MealType } from '../utils/nutrition-calc'

interface FoodAnalysis {
  meal_name: string
  items: Array<{ name: string; estimated_quantity_g: number; calories: number }>
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fiber_g: number
  confidence: number
  suggestions?: string
}

interface UseFoodAnalysisReturn {
  analysis: FoodAnalysis | null
  analyzing: boolean
  error: string | null
  analyzeFood: (file: File, mealType?: MealType) => Promise<FoodAnalysis | null>
  reset: () => void
}

export function useFoodAnalysis(): UseFoodAnalysisReturn {
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeFood = useCallback(async (file: File, mealType?: MealType): Promise<FoodAnalysis | null> => {
    setAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      if (mealType) formData.append('meal_type', mealType)

      const res = await fetch('/api/fitsync/analyze-food', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}`)
      }

      const data: FoodAnalysis = await res.json()
      setAnalysis(data)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error analizando comida'
      setError(msg)
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return { analysis, analyzing, error, analyzeFood, reset }
}
