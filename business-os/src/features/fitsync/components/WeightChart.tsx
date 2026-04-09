'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface WeightEntry {
  date: string
  weight_kg: number | null
  body_fat_pct: number | null
  waist_cm: number | null
}

export function WeightChart() {
  const [data, setData] = useState<WeightEntry[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('fitsync_body_metrics')
    if (raw) {
      setData(JSON.parse(raw))
    }
  }, [])

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale size={32} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-zinc-500 text-sm">No hay datos de peso registrados</p>
        <p className="text-zinc-600 text-xs mt-1">Toca + para registrar tu peso de hoy</p>
      </div>
    )
  }

  const weightData = data.filter(d => d.weight_kg !== null)
  const chartData = weightData.map(d => ({
    date: d.date.slice(5), // MM-DD
    peso: d.weight_kg,
    grasa: d.body_fat_pct,
  }))

  const first = weightData[0]?.weight_kg ?? 0
  const last = weightData[weightData.length - 1]?.weight_kg ?? 0
  const diff = last - first
  const TrendIcon = diff < -0.2 ? TrendingDown : diff > 0.2 ? TrendingUp : Minus
  const trendColor = diff < -0.2 ? 'text-emerald-400' : diff > 0.2 ? 'text-rose-400' : 'text-zinc-400'

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <p className="text-lg font-bold text-zinc-200">{last}</p>
          <p className="text-[10px] text-zinc-500">Peso actual (kg)</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
            <TrendIcon size={14} />
            <span className="text-lg font-bold">{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>
          </div>
          <p className="text-[10px] text-zinc-500">Cambio (kg)</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <p className="text-lg font-bold text-zinc-200">{weightData.length}</p>
          <p className="text-[10px] text-zinc-500">Registros</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm text-zinc-400 mb-3">Peso (kg)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 10, fill: '#71717a' }}
              width={35}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            {chartData.some(d => d.grasa) && (
              <Line type="monotone" dataKey="grasa" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
