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
    <div className="bg-[#13131f] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[180px]">
      <p className="text-white/60 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-medium">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: AnnualRow[] }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <p className="text-xs font-medium text-white/50 mb-1">Revenue vs Order Intake — Anual</p>
      <p className="text-[10px] text-white/25 mb-4">Barras = volumen · Línea = Book-to-Bill ratio</p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
          <YAxis
            yAxisId="vol"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <YAxis
            yAxisId="b2b"
            orientation="right"
            domain={[0, 2]}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickFormatter={v => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }}
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
