'use client'

import { UtensilsCrossed } from 'lucide-react'

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

interface MealLogProps {
  meals: LoggedMeal[]
}

export function MealLog({ meals }: MealLogProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-8">
        <UtensilsCrossed size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-400 text-sm">No has registrado comidas hoy</p>
        <p className="text-gray-300 text-xs mt-1">Toca + para analizar tu primera comida</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-500">Comidas de hoy</h2>
      {meals.map(meal => (
        <div
          key={meal.id}
          className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
        >
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed size={20} className="text-gray-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{meal.name}</p>
            <p className="text-xs text-gray-400">{meal.time}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-emerald-600">{meal.calories}</p>
            <p className="text-[10px] text-gray-400">kcal</p>
          </div>
        </div>
      ))}
    </div>
  )
}
