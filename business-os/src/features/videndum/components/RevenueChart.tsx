'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { AnnualRow } from '../types'

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg p-3 text-xs shadow-xl min-w-[180px] border border-vid"
      style={{ backgroundColor: 'var(--chart-tooltip-bg)' }}
    >
      <p className="text-vid-muted font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-vid-fg font-medium">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: AnnualRow[] }) {
  return (
    <div className="bg-vid-card border border-vid rounded-xl p-6">
      <p className="text-xs font-medium text-vid-muted mb-1">Revenue vs Order Intake — Anual</p>
      <p className="text-[10px] text-vid-subtle mb-4">Barras = volumen · Línea = Book-to-Bill ratio</p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
          <YAxis
            yAxisId="vol"
            tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <YAxis
            yAxisId="b2b"
            orientation="right"
            domain={[0, 2]}
            tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
            tickFormatter={v => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--chart-axis)', paddingTop: 12 }}
          />
          <Bar yAxisId="vol" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.85} />
          <Bar yAxisId="vol" dataKey="order_intake" name="Order Intake" fill="#22c55e" radius={[3, 3, 0, 0]} opacity={0.7} />
          <Line
            yAxisId="b2b"
            type="monotone"
            dataKey="book_to_bill"
            name="B2B Ratio"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
