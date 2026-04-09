'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface DayData {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function MacroHistoryChart() {
  const [data, setData] = useState<DayData[]>([])

  useEffect(() => {
    // Build from meal history in localStorage
    const mealsRaw = localStorage.getItem('fitsync_meal_history')
    if (!mealsRaw) return

    const meals: Array<{ date: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }> = JSON.parse(mealsRaw)

    const grouped = new Map<string, DayData>()
    for (const m of meals) {
      const existing = grouped.get(m.date) || { date: m.date, calories: 0, protein: 0, carbs: 0, fat: 0 }
      grouped.set(m.date, {
        date: m.date,
        calories: existing.calories + m.calories,
        protein: existing.protein + m.protein_g,
        carbs: existing.carbs + m.carbs_g,
        fat: existing.fat + m.fat_g,
      })
    }
    setData(Array.from(grouped.values()).slice(-14)) // Last 14 days
  }, [])

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp size={32} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-zinc-500 text-sm">No hay historial de nutrición</p>
        <p className="text-zinc-600 text-xs mt-1">Registra comidas para ver tus tendencias</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    date: d.date.slice(5),
    Calorías: d.calories,
    Proteína: d.protein,
    Carbos: d.carbs,
    Grasa: d.fat,
  }))

  const avgCalories = Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length)
  const avgProtein = Math.round(data.reduce((s, d) => s + d.protein, 0) / data.length)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <p className="text-lg font-bold text-emerald-400">{avgCalories}</p>
          <p className="text-[10px] text-zinc-500">Promedio kcal/día</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <p className="text-lg font-bold text-blue-400">{avgProtein}g</p>
          <p className="text-[10px] text-zinc-500">Promedio proteína/día</p>
        </div>
      </div>

      {/* Calories chart */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm text-zinc-400 mb-3">Calorías diarias</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={40} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="Calorías" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Macros chart */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm text-zinc-400 mb-3">Macronutrientes (g)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={35} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Proteína" fill="#60a5fa" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Carbos" fill="#fbbf24" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Grasa" fill="#f87171" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
