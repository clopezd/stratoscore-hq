'use client'

import { Target, AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useWeeklyDashboard } from '../hooks/useWeeklyDashboard'
import type { WeeklyKPIs, WeeklyAlert, SkuAccuracy } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const GRADE_LABELS: Record<string, string> = {
  A: 'Excelente', B: 'Bueno', C: 'Aceptable', D: 'Pobre', F: 'Crítico'
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'border-red-500/50 bg-red-500/5',
  HIGH: 'border-orange-500/40 bg-orange-500/5',
  MEDIUM: 'border-amber-500/30 bg-amber-500/5',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent: string
}) {
  return (
    <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[11px] mt-0.5 text-gray-400">{sub}</p>
    </div>
  )
}

function KpiSection({ kpis }: { kpis: WeeklyKPIs }) {
  const gradeColor = GRADE_COLORS[kpis.mape_grade] ?? 'text-gray-400'
  const biasLabel = kpis.forecast_bias > 0 ? 'Sub-forecast (real > plan)' : kpis.forecast_bias < 0 ? 'Sobre-forecast (plan > real)' : 'Sin sesgo'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="inline-flex p-2 rounded-lg mb-3 bg-indigo-500/10">
          <Target size={15} className="text-indigo-300" />
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">MAPE Global</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white">{kpis.mape_global}%</p>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${gradeColor}`}>
            {kpis.mape_grade}
          </span>
        </div>
        <p className="text-[11px] mt-0.5 text-gray-400">{GRADE_LABELS[kpis.mape_grade]} - {kpis.period_label}</p>
      </div>

      <KpiCard
        label="Alertas activas"
        value={String(kpis.skus_with_alerts)}
        sub={`De ${kpis.total_skus_analyzed} SKUs analizados`}
        icon={<AlertTriangle size={15} className="text-amber-300" />}
        accent="bg-amber-500/10"
      />
      <KpiCard
        label="Order Book"
        value={fmt(kpis.total_order_book)}
        sub="Unidades en backlog"
        icon={<Package size={15} className="text-blue-300" />}
        accent="bg-blue-500/10"
      />
      <KpiCard
        label="Sesgo (Bias)"
        value={`${kpis.forecast_bias > 0 ? '+' : ''}${fmt(kpis.forecast_bias)}`}
        sub={biasLabel}
        icon={kpis.forecast_bias >= 0
          ? <TrendingUp size={15} className="text-emerald-300" />
          : <TrendingDown size={15} className="text-red-300" />}
        accent={kpis.forecast_bias >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}
      />
    </div>
  )
}

// ── Alerts Section ───────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: WeeklyAlert }) {
  const isSpike = alert.alert_type === 'DEMAND_SPIKE'
  return (
    <div className={`border rounded-lg p-3 ${SEVERITY_COLORS[alert.severity]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isSpike
            ? <ArrowUpRight size={16} className="text-emerald-400 shrink-0" />
            : <ArrowDownRight size={16} className="text-red-400 shrink-0" />}
          <span className="font-mono text-sm text-white truncate">{alert.part_number}</span>
        </div>
        <span className={`text-sm font-bold shrink-0 ${isSpike ? 'text-emerald-400' : 'text-red-400'}`}>
          {alert.change_pct > 0 ? '+' : ''}{alert.change_pct}%
        </span>
      </div>
      <div className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-3">
        <span>{fmt(alert.previous_value)} → {fmt(alert.current_value)} uds</span>
        <span>{alert.period}</span>
      </div>
    </div>
  )
}

function AlertsSection({ alerts }: { alerts: WeeklyAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 text-center">
        <p className="text-emerald-400 font-medium">Sin alertas esta semana</p>
        <p className="text-sm text-gray-500 mt-1">Todos los SKUs dentro de rangos normales</p>
      </div>
    )
  }

  const critical = alerts.filter(a => a.severity === 'CRITICAL')
  const high = alerts.filter(a => a.severity === 'HIGH')
  const medium = alerts.filter(a => a.severity === 'MEDIUM')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Cambios Significativos
          <span className="text-sm font-normal text-gray-500 ml-2">(&gt;20% vs mes anterior)</span>
        </h3>
        <span className="text-xs text-gray-500">{alerts.length} alertas</span>
      </div>
      {critical.length > 0 && (
        <div>
          <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-wider">Críticas (&gt;50%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {critical.map(a => <AlertCard key={a.part_number} alert={a} />)}
          </div>
        </div>
      )}
      {high.length > 0 && (
        <div>
          <p className="text-xs text-orange-400 font-semibold mb-2 uppercase tracking-wider">Altas (30-50%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {high.map(a => <AlertCard key={a.part_number} alert={a} />)}
          </div>
        </div>
      )}
      {medium.length > 0 && (
        <div>
          <p className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">Medias (20-30%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {medium.map(a => <AlertCard key={a.part_number} alert={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Accuracy Table ───────────────────────────────────────────────────────────

function AccuracyTable({ title, skus, type }: { title: string; skus: SkuAccuracy[]; type: 'worst' | 'best' }) {
  if (skus.length === 0) return null
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-2">SKU</th>
              <th className="text-center px-2 py-2">Grade</th>
              <th className="text-right px-2 py-2">MAPE</th>
              <th className="text-right px-2 py-2">Forecast</th>
              <th className="text-right px-2 py-2">Real</th>
              <th className="text-right px-4 py-2">Varianza</th>
            </tr>
          </thead>
          <tbody>
            {skus.map(s => {
              const gc = GRADE_COLORS[s.grade] ?? ''
              return (
                <tr key={s.part_number} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 font-mono text-white text-xs">{s.part_number}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gc}`}>{s.grade}</span>
                  </td>
                  <td className="px-2 py-2 text-right text-white">{s.mape}%</td>
                  <td className="px-2 py-2 text-right text-gray-400">{fmt(s.forecast_qty)}</td>
                  <td className="px-2 py-2 text-right text-gray-400">{fmt(s.real_qty)}</td>
                  <td className={`px-4 py-2 text-right font-medium ${s.variance_pct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.variance_pct > 0 ? '+' : ''}{s.variance_pct}%
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

// ── Accuracy Distribution ────────────────────────────────────────────────────

function AccuracyDistribution({ distribution }: { distribution: { grade: string; count: number; pct: number }[] }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3">Distribución de Accuracy</h4>
      <div className="space-y-2">
        {distribution.map(d => {
          const gc = GRADE_COLORS[d.grade] ?? ''
          return (
            <div key={d.grade} className="flex items-center gap-3">
              <span className={`text-xs font-bold w-5 text-center px-1 py-0.5 rounded border ${gc}`}>{d.grade}</span>
              <div className="flex-1 bg-white/[0.05] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    d.grade === 'A' ? 'bg-emerald-500' :
                    d.grade === 'B' ? 'bg-blue-500' :
                    d.grade === 'C' ? 'bg-amber-500' :
                    d.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-16 text-right">{d.count} ({d.pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function WeeklyDashboard() {
  const { data, loading, error, refresh } = useWeeklyDashboard()

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/[0.03] rounded-xl" />)}
        </div>
        <div className="h-48 bg-white/[0.03] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="h-64 bg-white/[0.03] rounded-xl" />
          <div className="h-64 bg-white/[0.03] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 font-medium mb-2">Error cargando resumen</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Resumen Operativo</h2>
          <p className="text-sm text-gray-500">{data.kpis.period_label} — {data.kpis.total_skus_analyzed} SKUs analizados</p>
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Actualizar datos"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPIs */}
      <KpiSection kpis={data.kpis} />

      {/* Alerts */}
      <AlertsSection alerts={data.alerts} />

      {/* Accuracy Distribution + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AccuracyDistribution distribution={data.accuracy_distribution} />
        <div className="lg:col-span-2 space-y-4">
          <AccuracyTable title="Top 10 — Peor Accuracy (requieren atención)" skus={data.worst_skus} type="worst" />
          <AccuracyTable title="Top 10 — Mejor Accuracy" skus={data.best_skus} type="best" />
        </div>
      </div>
    </div>
  )
}
