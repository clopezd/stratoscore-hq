'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Target, AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowDownRight, Search, Calendar, HelpCircle, CheckCircle2 } from 'lucide-react'
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

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function periodLabel(p: string) {
  const [y, m] = p.split('-')
  return `${MONTH_LABELS[m] ?? m} ${y}`
}

// ── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 cursor-help">
      <HelpCircle size={12} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-[11px] text-gray-300 leading-relaxed w-56 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-xl">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[#1a1a2e] border-b border-r border-white/10 rotate-45" />
      </span>
    </span>
  )
}

// ── Period Selector ──────────────────────────────────────────────────────────

function PeriodSelector({ periods, selected, onChange }: {
  periods: string[]
  selected: string | null
  onChange: (p: string | null) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Calendar size={14} className="text-gray-500" />
      <select
        value={selected ?? ''}
        onChange={e => onChange(e.target.value || null)}
        className="px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-white cursor-pointer appearance-none pr-7"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        <option value="">Último período</option>
        {periods.map(p => (
          <option key={p} value={p}>{periodLabel(p)}</option>
        ))}
      </select>
    </div>
  )
}

// ── SKU Search ───────────────────────────────────────────────────────────────

function SkuSearch({ allSkus }: { allSkus: SkuAccuracy[] }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const results = query.length >= 2
    ? allSkus.filter(s => s.part_number.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar SKU..."
          className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-gray-500 w-52"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-[#13131f] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
          {results.map(s => (
            <button
              key={s.part_number}
              onClick={() => {
                router.push(`/videndum/forecast-accuracy?sku=${s.part_number}`)
                setQuery('')
              }}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/[0.05] transition-colors border-b border-white/[0.03] last:border-0"
            >
              <div>
                <span className="font-mono text-xs text-white">{s.part_number}</span>
                {s.catalog_type && <span className="text-[10px] text-gray-500 ml-1.5">{s.catalog_type}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1 py-0.5 rounded border ${GRADE_COLORS[s.grade]}`}>{s.grade}</span>
                <span className="text-[10px] text-gray-400">{s.mape}%</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── KPI Cards ────────────────────────────────────────────────────────────────

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
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
          MAPE Global
          <Tooltip text="Mean Absolute Percentage Error. Mide qué tan lejos estuvo el forecast del resultado real. Menor = mejor. A(<10%) es excelente, F(>50%) requiere revisión urgente." />
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white">{kpis.mape_global}%</p>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${gradeColor}`}>
            {kpis.mape_grade}
          </span>
        </div>
        <p className="text-[11px] mt-0.5 text-gray-400">
          {GRADE_LABELS[kpis.mape_grade]} - {kpis.period_label}
          {kpis.mape_prev !== null && kpis.mape_prev !== undefined && (
            <span className={`ml-2 ${kpis.mape_global < kpis.mape_prev ? 'text-emerald-400' : kpis.mape_global > kpis.mape_prev ? 'text-red-400' : 'text-gray-500'}`}>
              {kpis.mape_global < kpis.mape_prev ? '↓ Mejoró' : kpis.mape_global > kpis.mape_prev ? '↑ Empeoró' : '= Igual'}
              {' '}(antes: {kpis.mape_prev}%)
            </span>
          )}
        </p>
      </div>

      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="inline-flex p-2 rounded-lg mb-3 bg-amber-500/10">
          <AlertTriangle size={15} className="text-amber-300" />
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
          Alertas activas
          <Tooltip text="SKUs con cambios mayores a 20% entre el mes actual y el anterior. Cambios grandes pueden indicar problemas de demanda o datos incorrectos." />
        </p>
        <p className="text-2xl font-bold text-white">{kpis.skus_with_alerts}</p>
        <p className="text-[11px] mt-0.5 text-gray-400">De {kpis.total_skus_analyzed} SKUs analizados</p>
      </div>

      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="inline-flex p-2 rounded-lg mb-3 bg-blue-500/10">
          <Package size={15} className="text-blue-300" />
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
          Order Book
          <Tooltip text="Total de unidades en backlog — órdenes confirmadas pendientes de entregar. Si es alto respecto al forecast, puede indicar producción insuficiente." />
        </p>
        <p className="text-2xl font-bold text-white">{fmt(kpis.total_order_book)}</p>
        <p className="text-[11px] mt-0.5 text-gray-400">Unidades en backlog</p>
      </div>

      <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="inline-flex p-2 rounded-lg mb-3 ${kpis.forecast_bias >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}">
          {kpis.forecast_bias >= 0
            ? <TrendingUp size={15} className="text-emerald-300" />
            : <TrendingDown size={15} className="text-red-300" />}
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
          Sesgo (Bias)
          <Tooltip text="Promedio de la diferencia entre real y forecast. Positivo = sub-forecast (vendemos más de lo planeado). Negativo = sobre-forecast (planeamos de más, riesgo de sobre-inventario)." />
        </p>
        <p className="text-2xl font-bold text-white">{kpis.forecast_bias > 0 ? '+' : ''}{fmt(kpis.forecast_bias)}</p>
        <p className="text-[11px] mt-0.5 text-gray-400">{biasLabel}</p>
      </div>
    </div>
  )
}

// ── Alerts Section ───────────────────────────────────────────────────────────

function AlertCard({ alert, onAcknowledge }: { alert: WeeklyAlert; onAcknowledge?: (id: string) => void }) {
  const router = useRouter()
  const isSpike = alert.alert_type === 'DEMAND_SPIKE'
  const isAcked = alert.acknowledged

  return (
    <div className={`border rounded-lg p-3 text-left w-full transition-all ${isAcked ? 'opacity-50 border-white/[0.06] bg-white/[0.01]' : SEVERITY_COLORS[alert.severity]}`}>
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => router.push(`/videndum/forecast-accuracy?sku=${alert.part_number}`)}
          className="flex items-center gap-2 min-w-0 hover:brightness-125 cursor-pointer"
        >
          {isSpike
            ? <ArrowUpRight size={16} className="text-emerald-400 shrink-0" />
            : <ArrowDownRight size={16} className="text-red-400 shrink-0" />}
          <span className="font-mono text-sm text-white truncate">{alert.part_number}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-bold ${isSpike ? 'text-emerald-400' : 'text-red-400'}`}>
            {alert.change_pct > 0 ? '+' : ''}{alert.change_pct}%
          </span>
          {alert.id && !isAcked && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id!)}
              title="Marcar como revisado"
              className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-emerald-400"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          {isAcked && (
            <span className="text-[10px] text-emerald-500/70 flex items-center gap-0.5">
              <CheckCircle2 size={10} /> Revisado
            </span>
          )}
        </div>
      </div>
      <div className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-3">
        <span>{fmt(alert.previous_value)} → {fmt(alert.current_value)} uds</span>
        <span>{alert.period}</span>
      </div>
    </div>
  )
}

function AlertsSection({ alerts, onAcknowledge }: { alerts: WeeklyAlert[]; onAcknowledge?: (id: string) => void }) {
  const [showAcked, setShowAcked] = useState(false)

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 text-center">
        <p className="text-emerald-400 font-medium">Sin alertas este período</p>
        <p className="text-sm text-gray-500 mt-1">Todos los SKUs dentro de rangos normales</p>
      </div>
    )
  }

  const visible = showAcked ? alerts : alerts.filter(a => !a.acknowledged)
  const ackedCount = alerts.filter(a => a.acknowledged).length

  const critical = visible.filter(a => a.severity === 'CRITICAL')
  const high = visible.filter(a => a.severity === 'HIGH')
  const medium = visible.filter(a => a.severity === 'MEDIUM')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Cambios Significativos
          <Tooltip text="SKUs cuya demanda real cambió más de 20% respecto al mes anterior. Marca como 'Revisado' cuando hayas tomado acción. Revisar si es tendencia real o dato atípico." />
        </h3>
        <div className="flex items-center gap-3">
          {ackedCount > 0 && (
            <button
              onClick={() => setShowAcked(!showAcked)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              {showAcked ? 'Ocultar revisadas' : `Mostrar revisadas (${ackedCount})`}
            </button>
          )}
          <span className="text-xs text-gray-500">{visible.length} alertas</span>
        </div>
      </div>
      {critical.length > 0 && (
        <div>
          <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-wider">Críticas (&gt;50%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {critical.map(a => <AlertCard key={a.id ?? a.part_number} alert={a} onAcknowledge={onAcknowledge} />)}
          </div>
        </div>
      )}
      {high.length > 0 && (
        <div>
          <p className="text-xs text-orange-400 font-semibold mb-2 uppercase tracking-wider">Altas (30-50%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {high.map(a => <AlertCard key={a.id ?? a.part_number} alert={a} onAcknowledge={onAcknowledge} />)}
          </div>
        </div>
      )}
      {medium.length > 0 && (
        <div>
          <p className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">Medias (20-30%)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {medium.map(a => <AlertCard key={a.id ?? a.part_number} alert={a} onAcknowledge={onAcknowledge} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Accuracy Table ───────────────────────────────────────────────────────────

function AccuracyTable({ title, skus, type }: { title: string; skus: SkuAccuracy[]; type: 'worst' | 'best' }) {
  if (!skus || skus.length === 0) return null
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
      <h4 className="text-sm font-semibold text-white mb-3">
        Distribución de Accuracy
        <Tooltip text="Cuántos SKUs caen en cada rango de error. Lo ideal es tener la mayoría en A y B. SKUs en D y F necesitan revisión del método de forecast." />
      </h4>
      <div className="space-y-2">
        {(distribution ?? []).map(d => {
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

function CatalogFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { label: 'Todos', value: 'all' },
    { label: 'INV', value: 'INV' },
    { label: 'PKG', value: 'PKG' },
  ]
  return (
    <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
      {opts.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs transition-colors ${
            value === o.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function WeeklyDashboard() {
  const { data, loading, error, refresh, selectedPeriod, changePeriod } = useWeeklyDashboard()
  const [catalogFilter, setCatalogFilter] = useState('all')

  const handleAcknowledge = useCallback(async (alertId: string) => {
    try {
      const res = await fetch('/api/videndum/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, acknowledged: true }),
      })
      if (!res.ok) throw new Error('Error al marcar alerta')
      refresh()
    } catch (e) {
      console.error('Error acknowledging alert:', e)
    }
  }, [refresh])

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

  // Apply catalog filter
  const filterByCatalog = (skus: SkuAccuracy[]) =>
    catalogFilter === 'all' ? skus : skus.filter(s => s.catalog_type === catalogFilter)

  const filteredAlerts = catalogFilter === 'all'
    ? (data.alerts ?? [])
    : (data.alerts ?? []).filter(a => a.catalog_type === catalogFilter)

  const filteredWorst = filterByCatalog(data.worst_skus ?? [])
  const filteredBest = filterByCatalog(data.best_skus ?? [])
  const allSkus = [...filteredWorst, ...filteredBest]

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Resumen Operativo</h2>
          <p className="text-sm text-gray-500">{data.kpis.period_label} — {data.kpis.total_skus_analyzed} SKUs analizados</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SkuSearch allSkus={allSkus} />
          <CatalogFilter value={catalogFilter} onChange={setCatalogFilter} />
          <PeriodSelector
            periods={data.available_periods ?? []}
            selected={selectedPeriod}
            onChange={changePeriod}
          />
          <button
            onClick={refresh}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Actualizar datos"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <KpiSection kpis={data.kpis} />

      {/* Alerts */}
      <AlertsSection alerts={filteredAlerts} onAcknowledge={handleAcknowledge} />

      {/* Accuracy Distribution + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AccuracyDistribution distribution={data.accuracy_distribution} />
        <div className="lg:col-span-2 space-y-4">
          <AccuracyTable title="Top 10 — Peor Accuracy (requieren atención)" skus={filteredWorst} type="worst" />
          <AccuracyTable title="Top 10 — Mejor Accuracy" skus={filteredBest} type="best" />
        </div>
      </div>
    </div>
  )
}
