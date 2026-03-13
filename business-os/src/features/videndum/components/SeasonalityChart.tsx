'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SeasonalityRow } from '../types'

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function SeasonalityChart({ data }: { data: SeasonalityRow[] }) {
  if (!data.length) return null

  const max = Math.max(...data.map(d => d.avg_revenue))
  const chartData = data.map(d => ({ ...d, month_name: MONTHS[d.month] }))

  return (
    <div className="bg-vid-card border border-vid rounded-xl p-6">
      <p className="text-xs font-medium text-vid-muted mb-1">Estacionalidad mensual</p>
      <p className="text-[10px] text-vid-subtle mb-4">Promedio de revenue por mes (registros mensuales)</p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={chartData} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--chart-tooltip-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 11,
              color: 'var(--foreground)',
            }}
            labelStyle={{ color: 'var(--foreground-muted)' }}
            formatter={(v: unknown) => [(v as number).toLocaleString(), 'Avg revenue']}
          />
          <Bar dataKey="avg_revenue" radius={[3, 3, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.avg_revenue === max ? '#f59e0b' : '#6366f1'}
                opacity={entry.avg_revenue === max ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
