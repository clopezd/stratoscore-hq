'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import type { VarianceRow } from '../types'

interface VData {
  negative: VarianceRow[]
  positive: VarianceRow[]
  period: { min_year: string; max_year: string; min_month: string; max_month: string } | null
}

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: VarianceRow & { variance_pct: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = d.variance_pct < 0 ? '#ef4444' : '#22c55e'
  return (
    <div className="bg-[#13131f] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
      <p className="text-white font-mono font-medium mb-2">{d.part_number}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-white/40">Tipo</span>
          <span className="text-white/70">{d.catalog_type ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/40">Real</span>
          <span className="text-white/80">{d.actual_qty.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/40">Forecast</span>
          <span className="text-white/80">{d.forecast_qty.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6 pt-1 border-t border-white/[0.06]">
          <span className="text-white/40">Desviación</span>
          <span style={{ color }} className="font-semibold">
            {d.variance_pct > 0 ? '+' : ''}{d.variance_pct}%
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/40">Meses</span>
          <span className="text-white/50">{d.matched_months}</span>
        </div>
      </div>
    </div>
  )
}

function HBar({ data, title, emptyColor }: { data: VarianceRow[]; title: string; emptyColor: string }) {
  return (
    <div>
      <p className="text-[11px] text-white/40 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={data.length * 32 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="part_number"
            width={140}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Bar dataKey="variance_pct" radius={[0, 3, 3, 0]}>
            {data.map((row, i) => (
              <Cell
                key={i}
                fill={row.variance_pct < -30 ? '#ef4444' : row.variance_pct < 0 ? '#f59e0b' : emptyColor}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function VarianceChart() {
  const [data, setData] = useState<VData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'negative' | 'positive'>('negative')

  useEffect(() => {
    fetch('/api/videndum/variance')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const periodLabel = data?.period
    ? `${MONTHS[Number(data.period.min_month)]} ${data.period.min_year} – ${MONTHS[Number(data.period.max_month)]} ${data.period.max_year}`
    : ''

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-white/50">Desviación de Pronóstico</p>
        {periodLabel && (
          <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">
            {periodLabel}
          </span>
        )}
      </div>
      <p className="text-[10px] text-white/25 mb-4">(Real − Forecast) / Forecast · JOIN mensual</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white/[0.04] border border-white/[0.06] rounded-lg p-0.5 w-fit">
        {([['negative', '↓ Más negativa'], ['positive', '↑ Más positiva']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              tab === key
                ? key === 'negative'
                  ? 'bg-red-500/70 text-white font-medium'
                  : 'bg-emerald-500/70 text-white font-medium'
                : 'text-white/35 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="h-48 animate-pulse bg-white/[0.03] rounded-lg" />
      )}

      {!loading && data && (
        tab === 'negative'
          ? <HBar data={data.negative} title="Top 10 — real muy por debajo del plan" emptyColor="#f59e0b" />
          : <HBar data={data.positive} title="Top 10 — real muy por encima del plan" emptyColor="#22c55e" />
      )}

      {/* Leyenda colores */}
      {!loading && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/80" /> {'> −30%'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" /> 0% a −30%
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" /> Positiva
          </div>
        </div>
      )}
    </div>
  )
}
