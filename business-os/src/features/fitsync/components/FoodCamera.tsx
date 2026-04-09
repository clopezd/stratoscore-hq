'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useFoodAnalysis } from '../hooks/useFoodAnalysis'
import type { FoodAnalysis, MealType } from '../types'

interface FoodCameraProps {
  onAnalysisComplete: (analysis: FoodAnalysis, imageUrl: string) => void
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'dinner', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
  { value: 'pre_workout', label: 'Pre-workout' },
  { value: 'post_workout', label: 'Post-workout' },
]

export function FoodCamera({ onAnalysisComplete }: FoodCameraProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analysis, analyzing, error, analyzeFood, reset } = useFoodAnalysis()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch')

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    const result = await analyzeFood(file, selectedMeal)
    if (result) {
      onAnalysisComplete(result, url)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleClear = () => {
    setPreview(null)
    reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Meal type selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MEAL_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelectedMeal(value)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              selectedMeal === value
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Camera / Upload area */}
      {!preview ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 transition-colors bg-gray-50"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Camera size={28} className="text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-medium">Toma una foto de tu comida</p>
              <p className="text-gray-400 text-sm mt-1">o sube una imagen de tu galería</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Food" className="w-full h-48 object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
          >
            <X size={16} />
          </button>
          {analyzing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="text-emerald-500 animate-spin" />
                <p className="text-sm text-gray-600">Analizando nutrición...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis result */}
      {analysis && !analyzing && (
        <div className="rounded-xl bg-white border border-gray-100 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{analysis.meal_name}</h3>
            <span className="text-xs text-gray-400">
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-emerald-50 rounded-lg p-2">
              <p className="text-lg font-bold text-emerald-600">{analysis.total_calories}</p>
              <p className="text-[10px] text-gray-500">kcal</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-lg font-bold text-blue-600">{analysis.total_protein_g}g</p>
              <p className="text-[10px] text-gray-500">Proteína</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-lg font-bold text-amber-600">{analysis.total_carbs_g}g</p>
              <p className="text-[10px] text-gray-500">Carbos</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-2">
              <p className="text-lg font-bold text-rose-600">{analysis.total_fat_g}g</p>
              <p className="text-[10px] text-gray-500">Grasa</p>
            </div>
          </div>

          <details className="text-sm">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-600">
              Ver desglose ({analysis.items.length} items)
            </summary>
            <ul className="mt-2 space-y-1">
              {analysis.items.map((item, i) => (
                <li key={i} className="flex justify-between text-gray-500">
                  <span>{item.name} ({item.estimated_quantity_g}g)</span>
                  <span className="text-gray-400">{item.calories} kcal</span>
                </li>
              ))}
            </ul>
          </details>

          {analysis.suggestions && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
              {analysis.suggestions}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 rounded-lg p-3">
          Error: {error}
        </div>
      )}
    </div>
  )
}
