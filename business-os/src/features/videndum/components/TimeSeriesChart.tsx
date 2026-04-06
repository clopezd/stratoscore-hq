'use client'

import React, { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { DateSegmentors } from './DateSegmentors'

interface TimeSeriesData {
  month_label: string
  year: number
  month: number
  total_forecast: number
  total_real: number
  variance_pct: number
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function TimeSeriesChart() {
  const [data, setData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedYear) params.append('year', selectedYear.toString())
    if (selectedMonth) params.append('month', selectedMonth.toString())

    setLoading(true)
    fetch(`/api/videndum/forecast-vs-real/timeseries?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setData(data.timeseries || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedYear, selectedMonth])

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
        </div>
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-6">
        <p className="text-sm text-amber-300">
          {error ? `Error: ${error}` : 'No hay datos suficientes para comparar'}
        </p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-white/90 font-semibold mb-2">{d.month_label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-blue-400">Forecast:</span>
            <span className="text-white/90 font-mono">{d.total_forecast.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400">Real:</span>
            <span className="text-white/90 font-mono">{d.total_real.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
            <span className="text-white/50">Varianza:</span>
            <span className={d.variance_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {d.variance_pct > 0 ? '+' : ''}{d.variance_pct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Segmentadores */}
      <DateSegmentors
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Evolución Temporal: Forecast vs Real</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-white/60">Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-white/60">Real</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month_label"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
            stroke="rgba(255,255,255,0.1)"
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="total_forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Forecast"
          />
          <Line
            type="monotone"
            dataKey="total_real"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Real"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Análisis rápido */}
      <div className="pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-white/40 mb-1">Meses analizados</p>
          <p className="text-lg font-semibold text-white/90">{data.length}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 mb-1">Forecast promedio</p>
          <p className="text-lg font-semibold text-blue-400">
            {Math.round(data.reduce((sum, d) => sum + d.total_forecast, 0) / data.length).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40 mb-1">Real promedio</p>
          <p className="text-lg font-semibold text-emerald-400">
            {Math.round(data.reduce((sum, d) => sum + d.total_real, 0) / data.length).toLocaleString()}
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
