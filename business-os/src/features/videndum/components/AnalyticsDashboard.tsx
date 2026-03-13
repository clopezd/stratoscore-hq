'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Activity, Package, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import type { AnalyticsData, PipelineRow } from '../types'

const MONTH_LABELS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#13131f] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
      <p className="text-white/60 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-medium">{typeof p.value === 'number' && p.value < 10 ? p.value.toFixed(3) : fmt(Number(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, accent, trend,
}: {
  label: string; value: string; sub: string
  icon: React.ReactNode; accent: string; trend?: 'up' | 'down' | 'neutral'
}) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
  return (
    <div className="relative overflow-hidden bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accent}`}>{icon}</div>
      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className={`text-[11px] mt-0.5 ${trendColor}`}>{sub}</p>
    </div>
  )
}

// ── Tabla de Pipeline ─────────────────────────────────────────────────────────
function PipelineTable({ rows }: { rows: PipelineRow[] }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-xs font-medium text-white/50">Pipeline vs Backlog — Top 20 productos</p>
        <p className="text-[10px] text-white/25 mt-0.5">Order Book confirmado · Oportunidades ponderadas · Factor de cierre</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-4 py-2.5 text-white/30 font-medium">Part Number</th>
              <th className="text-center px-3 py-2.5 text-white/30 font-medium">Cat.</th>
              <th className="text-right px-4 py-2.5 text-white/30 font-medium">Order Book</th>
              <th className="text-right px-4 py-2.5 text-white/30 font-medium">Opp. Pond.</th>
              <th className="text-right px-4 py-2.5 text-white/30 font-medium">Opp. Bruta</th>
              <th className="text-right px-4 py-2.5 text-white/30 font-medium">Factor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const factor = r.pipeline_factor_pct
              const factorColor = factor === null ? 'text-white/30' : factor >= 50 ? 'text-emerald-400' : factor >= 25 ? 'text-amber-400' : 'text-red-400'
              return (
                <tr
                  key={`${r.part_number}-${r.catalog_type}-${i}`}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-white/80">{r.part_number}</td>
                  <td className="px-3 py-2.5 text-center">
                    {r.catalog_type && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        r.catalog_type === 'INV' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {r.catalog_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-indigo-300 font-medium">{fmt(r.order_book_qty)}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-300">{fmt(r.opportunities_qty)}</td>
                  <td className="px-4 py-2.5 text-right text-white/40">{fmt(r.opp_unfactored_qty)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${factorColor}`}>
                    {factor !== null ? `${factor}%` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/videndum/analytics')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: unknown) => {
        const j = json as { error?: string } & Partial<AnalyticsData>
        if (j.error) throw new Error(j.error)
        setData(j as AnalyticsData)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-72 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-red-300">Error al cargar Analytics</p>
          <p className="text-[11px] text-red-400/70 mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { monthly, pipeline, kpis } = data
  const b2bTrend = kpis.current_b2b === null ? 'neutral' : kpis.current_b2b >= 1 ? 'up' : 'down'
  const coverageTrend = kpis.coverage_ratio === null ? 'neutral' : kpis.coverage_ratio >= 1.5 ? 'up' : kpis.coverage_ratio >= 0.8 ? 'neutral' : 'down'
  const currentMonthLabel = kpis.current_month ? MONTH_LABELS[kpis.current_month] : '—'

  return (
    <div className="space-y-5">

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label={`Book-to-Bill — ${currentMonthLabel} ${kpis.current_year}`}
          value={kpis.current_b2b !== null ? kpis.current_b2b.toFixed(2) : '—'}
          sub={
            kpis.current_b2b === null ? 'sin datos'
            : kpis.current_b2b >= 1 ? 'entrada > facturación ✓'
            : 'facturación > entrada'
          }
          icon={<Activity size={15} className={kpis.current_b2b !== null && kpis.current_b2b >= 1 ? 'text-emerald-300' : 'text-amber-300'} />}
          accent={kpis.current_b2b !== null && kpis.current_b2b >= 1 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}
          trend={b2bTrend}
        />
        <KpiCard
          label="Order Book total"
          value={fmt(kpis.total_order_book)}
          sub="unidades en backlog activo"
          icon={<Package size={15} className="text-indigo-300" />}
          accent="bg-indigo-500/10"
          trend="neutral"
        />
        <KpiCard
          label="Pipeline ponderado"
          value={fmt(kpis.total_opportunities)}
          sub={`${fmt(kpis.total_opp_unfactored)} brutas sin ponderar`}
          icon={<TrendingUp size={15} className="text-purple-300" />}
          accent="bg-purple-500/10"
          trend="neutral"
        />
        <KpiCard
          label="Cobertura de Backlog"
          value={kpis.coverage_ratio !== null ? `${kpis.coverage_ratio.toFixed(2)}x` : '—'}
          sub="order_book / revenue mensual"
          icon={<Activity size={15} className="text-cyan-300" />}
          accent="bg-cyan-500/10"
          trend={coverageTrend}
        />
      </div>

      {/* ── Gráfico Revenue vs Order Intake mensual ──────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <p className="text-xs font-medium text-white/50 mb-0.5">
          Revenue vs Order Intake — Mensual {kpis.current_year}
        </p>
        <p className="text-[10px] text-white/25 mb-4">
          Barras = volumen · Línea = Book-to-Bill ratio · Fuente: videndum_full_context
        </p>
        {monthly.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-white/20">
            Sin datos mensuales disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
              />
              <YAxis
                yAxisId="vol"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <YAxis
                yAxisId="b2b"
                orientation="right"
                domain={[0, 'auto']}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={v => v.toFixed(2)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <Bar
                yAxisId="vol"
                dataKey="revenue_qty"
                name="Revenue"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
              <Bar
                yAxisId="vol"
                dataKey="order_intake_qty"
                name="Order Intake"
                fill="#22c55e"
                radius={[3, 3, 0, 0]}
                opacity={0.7}
              />
              <Line
                yAxisId="b2b"
                type="monotone"
                dataKey="book_to_bill"
                name="B2B Ratio"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b' }}
                strokeDasharray="4 2"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Tabla Pipeline: Opportunities vs Order Book ───────────────────────── */}
      {pipeline.length > 0
        ? <PipelineTable rows={pipeline} />
        : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-8 text-center">
            <Package size={20} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/20">Sin datos de pipeline disponibles</p>
          </div>
        )
      }
    </div>
  )
}
