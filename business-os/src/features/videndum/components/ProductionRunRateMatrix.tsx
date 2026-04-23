'use client'

import { Fragment, useEffect, useState, useMemo, useRef } from 'react'
import { Download, Factory, Info, Search, Loader2, RefreshCw, AlertCircle, Gauge, ListChecks, Target, ChevronDown, ChevronUp } from 'lucide-react'

interface WeekLabel {
  num: number
  calendar_week: number
  start: string
  end: string
  short: string
  months: { year: number; month: number; days: number }[]
}

interface MonthBreakdown {
  month_label: string
  year: number
  month: number
  baseline: number
  order_book: number
  pipeline: number
  momentum_factor: number
  inventory_applied: number
  demand: number
}

interface RunRateRow {
  part_number: string
  catalog_type: string | null
  weeks: number[]
  total: number
  avg_weekly: number
  historical_avg_weekly: number
  historical_months_observed: number
  delta_vs_historical_pct: number | null
  historical_mape_pct: number | null
  mape_months_observed: number
  driver: string
  monthly: MonthBreakdown[]
}

interface RunRateMatrix {
  generated_at: string
  start_date: string
  num_weeks: number
  num_months: number
  week_labels: WeekLabel[]
  month_labels: { year: number; month: number; label: string }[]
  rows: RunRateRow[]
  summary: {
    total_skus: number
    total_units: number
    by_driver: Record<string, number>
    monthly_totals: number[]
    avg_forecast_mape_pct: number | null
    skus_with_high_mape: number
    mape_window_months: number
  }
  assumptions: {
    start_date: string
    num_weeks: number
    active_sku_window_months: number
    momentum_clamp: [number, number]
    yoy_clamp: [number, number]
    inventory_coverage_target_weeks: number
  }
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const MONTH_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const DRIVER_COLORS: Record<string, string> = {
  'Order book firme': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Pipeline comercial': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'Histórico + forecast': 'text-gray-400 bg-white/5 border-white/10',
  'Ajuste por inventario alto': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
}

function driverClass(driver: string): string {
  if (driver.startsWith('Momentum al alza')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  if (driver.startsWith('Momentum a la baja')) return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  return DRIVER_COLORS[driver] ?? 'text-gray-400 bg-white/5 border-white/10'
}

type Severity = 'info' | 'ok' | 'warn' | 'alert'

interface Interpretation {
  severity: Severity
  headline: string
  reasons: string[]
  decision: string
}

function interpretRow(r: RunRateRow): Interpretation {
  const months = r.historical_months_observed
  const delta = r.delta_vs_historical_pct
  const hist = r.historical_avg_weekly
  const plan = r.avg_weekly
  const driver = r.driver
  const mape = r.historical_mape_pct
  const annualHist = hist * 52

  const isIntermittent = months > 0 && months < 6
  const noHistory = hist === 0 || months === 0
  const highMape = mape !== null && mape > 30

  // Severidad por magnitud de Δ y calidad de data
  let severity: Severity = 'ok'
  if (noHistory) severity = 'alert'
  else if (delta === null) severity = 'info'
  else if (Math.abs(delta) <= 10) severity = 'ok'
  else if (Math.abs(delta) <= 30) severity = 'info'
  else if (Math.abs(delta) <= 50) severity = 'warn'
  else severity = 'alert'
  if (isIntermittent && severity === 'ok') severity = 'info'
  // MAPE alto eleva severidad: ok → info, info → warn
  if (highMape) {
    if (severity === 'ok') severity = 'info'
    else if (severity === 'info') severity = 'warn'
  }

  const reasons: string[] = []

  // Calidad de data histórica
  if (noHistory) {
    reasons.push('Sin historia de ventas en los últimos 12 meses — el plan depende 100% del forecast, order book y pipeline.')
  } else if (isIntermittent) {
    reasons.push(
      `SKU intermitente: solo ${months} de 12 meses con venta. El Hist/sem=${fmt(hist)} se calcula como total_12m / 52 semanas (≈ ${fmt(Math.round(annualHist))} u/año concentradas en pocos meses), por eso se ve bajo.`,
    )
  } else if (months < 12) {
    reasons.push(`Historia parcial: ${months} de 12 meses con venta — la tendencia tiene algo de ruido.`)
  }

  // MAPE histórico del UK forecast (si está disponible)
  if (mape !== null) {
    if (mape <= 15) {
      reasons.push(`UK forecast ha sido confiable en este SKU: MAPE ${mape}% (últimos ${r.mape_months_observed}m). Puedes confiar más en el plan.`)
    } else if (mape <= 30) {
      reasons.push(`UK forecast tiene error moderado en este SKU: MAPE ${mape}% (últimos ${r.mape_months_observed}m).`)
    } else if (mape <= 50) {
      reasons.push(`⚠ UK forecast ha errado ${mape}% en promedio los últimos ${r.mape_months_observed}m — confiabilidad baja. Aterriza el plan contra el histórico real.`)
    } else {
      reasons.push(`⚠ UK forecast ha errado ${mape}% los últimos ${r.mape_months_observed}m — no es confiable para este SKU. Prioriza el Hist/sem y OB firme.`)
    }
  }

  // Driver dominante
  if (driver === 'Order book firme') {
    reasons.push('El plan está dominado por order book firme: hay backlog confirmado en los próximos meses empujando el run rate.')
  } else if (driver === 'Pipeline comercial') {
    reasons.push('El plan está dominado por pipeline comercial: oportunidades ponderadas por probabilidad están empujando el run rate.')
  } else if (driver === 'Histórico + forecast') {
    reasons.push('El plan está dominado por baseline (forecast UK o histórico + YoY). Ni order book ni pipeline son la causa principal.')
  } else if (driver === 'Ajuste por inventario alto') {
    reasons.push('El stock actual cubre más de 4 semanas de demanda — se descontó el exceso del run rate.')
  } else if (driver.startsWith('Momentum al alza')) {
    reasons.push(`${driver}: la tendencia reciente de order intake es más fuerte que la anterior.`)
  } else if (driver.startsWith('Momentum a la baja')) {
    reasons.push(`${driver}: la tendencia reciente de order intake cayó vs el período anterior.`)
  }

  // Magnitud del delta
  if (delta !== null) {
    if (Math.abs(delta) <= 10) {
      reasons.push(`Plan ${delta >= 0 ? 'ligeramente por encima' : 'ligeramente por debajo'} del histórico (${delta > 0 ? '+' : ''}${delta}%) — alineado con la tendencia.`)
    } else if (delta > 10 && delta <= 30) {
      reasons.push(`Plan +${delta}% sobre el histórico — incremento moderado, esperable con algo de backlog o forecast positivo.`)
    } else if (delta > 30 && delta <= 50) {
      reasons.push(`Plan +${delta}% sobre el histórico — incremento notable. Validar que OB/forecast justifiquen el salto.`)
    } else if (delta > 50) {
      reasons.push(`Plan +${delta}% sobre el histórico — salto alto. Validar con UK que el forecast soporta este volumen.`)
    } else if (delta < -10 && delta >= -30) {
      reasons.push(`Plan ${delta}% bajo el histórico — reducción moderada, típico con momentum a la baja o inventario alto.`)
    } else if (delta < -30 && delta >= -50) {
      reasons.push(`Plan ${delta}% bajo el histórico — reducción fuerte. Revisar stock actual y order intake.`)
    } else if (delta < -50) {
      reasons.push(`Plan ${delta}% bajo el histórico — caída grande. Probablemente inventario cubre parte de la demanda o hay caída clara de pedidos.`)
    }
  }

  // Headline
  let headline: string
  if (noHistory) {
    headline = `Sin historia reciente — plan de ${fmt(plan)} u/sem basado en forecast y backlog`
  } else if (delta === null || delta === 0) {
    headline = `Plan ${fmt(plan)} u/sem alineado con el histórico`
  } else if (delta > 0) {
    headline = `Plan ${fmt(plan)} u/sem · +${delta}% vs histórico (${fmt(hist)} u/sem)`
  } else {
    headline = `Plan ${fmt(plan)} u/sem · ${delta}% vs histórico (${fmt(hist)} u/sem)`
  }

  // Decisión práctica
  let decision: string
  if (noHistory) {
    decision = 'Decisión: confía en el plan solo si UK validó el forecast o el OB es firme. Sin historia no hay red de seguridad.'
  } else if (severity === 'alert' && delta !== null && delta > 0) {
    decision = 'Decisión: antes de aprobar, confirmar con UK que el forecast soporta este volumen. Si no, empieza con el Hist/sem y ajusta semana a semana.'
  } else if (severity === 'alert' && delta !== null && delta < 0) {
    decision = 'Decisión: revisa el inventario actual y el intake de los últimos 3 meses antes de bajar tanto. Podría ser un ajuste excesivo.'
  } else if (severity === 'warn') {
    decision = 'Decisión: aceptable, pero ancla el primer mes al Hist/sem y ajusta con la info real que vaya llegando.'
  } else if (isIntermittent) {
    decision = 'Decisión: en SKUs intermitentes el promedio semanal engaña. Usa el desglose mensual para planear solo en los meses con demanda real.'
  } else {
    decision = 'Decisión: plan razonable — produce según la recomendación semanal y monitorea desviaciones contra Prom/sem.'
  }

  return { severity, headline, reasons, decision }
}

const SEVERITY_STYLES: Record<Severity, { container: string; dot: string; label: string; title: string }> = {
  ok:    { container: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400',  label: 'ALINEADO',   title: 'text-emerald-200' },
  info:  { container: 'bg-sky-500/10 border-sky-500/30',         dot: 'bg-sky-400',      label: 'NOTA',       title: 'text-sky-200' },
  warn:  { container: 'bg-amber-500/10 border-amber-500/30',     dot: 'bg-amber-400',    label: 'REVISAR',    title: 'text-amber-200' },
  alert: { container: 'bg-rose-500/10 border-rose-500/30',       dot: 'bg-rose-400',     label: 'VALIDAR',    title: 'text-rose-200' },
}

const CAPACITY_STORAGE_KEY = 'videndum_runrate_weekly_capacity'

export function ProductionRunRateMatrix() {
  const [data, setData] = useState<RunRateMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeks, setWeeks] = useState(13)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [capacityWeekly, setCapacityWeekly] = useState<number | null>(null)
  const [actionQueueOpen, setActionQueueOpen] = useState(false)
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())

  // Cargar capacity desde localStorage al montar
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(CAPACITY_STORAGE_KEY) : null
      if (stored) {
        const n = parseInt(stored)
        if (!isNaN(n) && n > 0) setCapacityWeekly(n)
      }
    } catch { /* ignore */ }
  }, [])

  const saveCapacity = (v: number | null) => {
    setCapacityWeekly(v)
    try {
      if (v && v > 0) localStorage.setItem(CAPACITY_STORAGE_KEY, String(v))
      else localStorage.removeItem(CAPACITY_STORAGE_KEY)
    } catch { /* ignore */ }
  }

  const scrollToSku = (sku: string) => {
    setExpanded(sku)
    setTimeout(() => {
      const el = rowRefs.current.get(sku)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const load = async (w: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/videndum/production-runrate?weeks=${w}`)
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error ?? 'Error al cargar')
      setData(j as RunRateMatrix)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(weeks) }, [weeks])

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/videndum/production-runrate/export?weeks=${weeks}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? 'Error al descargar')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Videndum_RunRate_${data?.start_date ?? ''}_${weeks}sem.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al descargar')
    } finally {
      setDownloading(false)
    }
  }

  const filteredRows = useMemo(() => {
    if (!data) return []
    const q = search.trim().toUpperCase()
    if (!q) return data.rows
    return data.rows.filter(r => r.part_number.toUpperCase().includes(q))
  }, [data, search])

  // Bandeja de Decisiones Pendientes: SKUs con severidad warn/alert, ordenados por volumen × severidad
  const actionItems = useMemo(() => {
    if (!data) return []
    const severityWeight: Record<Severity, number> = { alert: 3, warn: 2, info: 1, ok: 0 }
    return data.rows
      .map(r => ({ row: r, interp: interpretRow(r) }))
      .filter(x => x.interp.severity === 'alert' || x.interp.severity === 'warn')
      .sort((a, b) => {
        const sw = severityWeight[b.interp.severity] - severityWeight[a.interp.severity]
        if (sw !== 0) return sw
        return b.row.total - a.row.total
      })
      .slice(0, 15)
  }, [data])

  // Capacity: plan promedio semanal + peak semanal
  const capacitySummary = useMemo(() => {
    if (!data || !capacityWeekly) return null
    const weeklyTotals = Array.from({ length: data.num_weeks }, (_, w) =>
      data.rows.reduce((s, r) => s + (r.weeks[w] ?? 0), 0),
    )
    const peak = Math.max(...weeklyTotals)
    const avg = weeklyTotals.reduce((s, v) => s + v, 0) / weeklyTotals.length
    const peakWeekIdx = weeklyTotals.indexOf(peak)
    const utilization = avg / capacityWeekly
    const peakUtilization = peak / capacityWeekly
    return {
      weeklyTotals,
      peak: Math.round(peak),
      avg: Math.round(avg),
      peakWeekIdx,
      utilization,
      peakUtilization,
    }
  }, [data, capacityWeekly])

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
            <Factory size={14} /> Plan de Producción Semanal
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Run Rate Matrix</h1>
          <p className="text-sm text-white/50 mt-1">
            Recomendación de producción semanal por SKU, combinando forecast, order book, pipeline ponderado e histórico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
            {[8, 13, 26].map(w => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  weeks === w ? 'bg-white text-[#0a0a1a]' : 'text-white/60 hover:text-white'
                }`}
              >
                {w} sem
              </button>
            ))}
          </div>
          <button
            onClick={() => load(weeks)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Recargar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || !data}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Descargar Excel
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-300">Error</div>
            <div className="text-xs text-red-400/80 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 size={24} className="animate-spin mr-3" />
          Calculando matriz…
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-white/50 uppercase tracking-wider">Arranque</div>
              <div className="text-lg font-semibold text-white mt-1">{data.start_date}</div>
              <div className="text-[11px] text-white/40 mt-0.5">Lunes · {data.num_weeks} semanas</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-white/50 uppercase tracking-wider">SKUs activos</div>
              <div className="text-lg font-semibold text-white mt-1">{fmt(data.summary.total_skus)}</div>
              <div className="text-[11px] text-white/40 mt-0.5">con ventas últimos 12m</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-white/50 uppercase tracking-wider">Unidades 3M</div>
              <div className="text-lg font-semibold text-emerald-300 mt-1">{fmt(data.summary.total_units)}</div>
              <div className="text-[11px] text-white/40 mt-0.5">Total recomendado</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-white/50 uppercase tracking-wider">Promedio semanal</div>
              <div className="text-lg font-semibold text-white mt-1">{fmt(Math.round(data.summary.total_units / data.num_weeks))}</div>
              <div className="text-[11px] text-white/40 mt-0.5">unidades / semana</div>
            </div>
          </div>

          {/* Totales por mes */}
          <div className="flex flex-wrap gap-2">
            {data.month_labels.map((ml, i) => (
              <div key={ml.label} className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-md">
                <div className="text-[10px] uppercase tracking-wider text-white/40">{ml.label}</div>
                <div className="text-sm font-semibold text-white">{fmt(data.summary.monthly_totals[i] ?? 0)}</div>
              </div>
            ))}
          </div>

          {/* ─── Capacity Check ─── */}
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-cyan-400" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60 font-medium">Capacity Check</div>
                  <div className="text-[11px] text-white/40">Plan vs capacidad productiva semanal</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-white/50">Capacidad (u/sem):</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ej: 50000"
                  value={capacityWeekly ?? ''}
                  onChange={e => {
                    const n = parseInt(e.target.value)
                    saveCapacity(isNaN(n) ? null : n)
                  }}
                  className="w-28 px-2 py-1 bg-white/5 border border-white/15 rounded text-sm text-white text-right focus:outline-none focus:border-cyan-500/50"
                />
                {capacityWeekly && (
                  <button
                    onClick={() => saveCapacity(null)}
                    className="text-[10px] text-white/40 hover:text-white/70 px-2 py-1"
                    title="Limpiar"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {capacitySummary && capacityWeekly ? (
              <div className="mt-4 space-y-2">
                {/* Barra de utilización promedio */}
                <div>
                  <div className="flex justify-between text-[11px] text-white/60 mb-1">
                    <span>Utilización promedio: {fmt(capacitySummary.avg)} u/sem ({(capacitySummary.utilization * 100).toFixed(0)}%)</span>
                    <span className="text-white/40">Capacidad: {fmt(capacityWeekly)} u/sem</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all ${
                        capacitySummary.utilization > 1 ? 'bg-rose-500' :
                        capacitySummary.utilization > 0.9 ? 'bg-amber-500' :
                        capacitySummary.utilization >= 0.6 ? 'bg-emerald-500' :
                        'bg-sky-500'
                      }`}
                      style={{ width: `${Math.min(100, capacitySummary.utilization * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Peak */}
                <div className="flex justify-between text-[11px] text-white/50">
                  <span>
                    Peak semanal: <span className="text-white font-medium">{fmt(capacitySummary.peak)}</span> en <span className="text-white/70">S{data.week_labels[capacitySummary.peakWeekIdx]?.num} ({data.week_labels[capacitySummary.peakWeekIdx]?.short})</span>
                    — <span className={capacitySummary.peakUtilization > 1 ? 'text-rose-400 font-semibold' : capacitySummary.peakUtilization > 0.9 ? 'text-amber-400' : 'text-emerald-400'}>
                      {(capacitySummary.peakUtilization * 100).toFixed(0)}%
                    </span>
                  </span>
                  {capacitySummary.peakUtilization > 1 && (
                    <span className="text-rose-400 text-[10px] font-semibold uppercase tracking-wider">⚠ Excede capacidad</span>
                  )}
                  {capacitySummary.peakUtilization <= 1 && capacitySummary.utilization < 0.6 && (
                    <span className="text-sky-400 text-[10px] uppercase tracking-wider">Capacidad ociosa</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-[11px] text-white/40">
                Ingresa la capacidad semanal de la planta para ver utilización y alertas automáticas de sobrecarga u ociosidad.
              </div>
            )}

            {/* MAPE global */}
            {data.summary.avg_forecast_mape_pct !== null && (
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 flex-wrap text-[11px]">
                <Target size={12} className="text-white/40" />
                <span className="text-white/60">
                  MAPE histórico del UK forecast ({data.summary.mape_window_months}m):{' '}
                  <span className={`font-semibold ${
                    data.summary.avg_forecast_mape_pct <= 15 ? 'text-emerald-400' :
                    data.summary.avg_forecast_mape_pct <= 30 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {data.summary.avg_forecast_mape_pct}%
                  </span>
                </span>
                {data.summary.skus_with_high_mape > 0 && (
                  <span className="text-white/50">
                    · <span className="text-rose-400 font-semibold">{data.summary.skus_with_high_mape}</span> SKUs con MAPE &gt; 30%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ─── Bandeja de Decisiones Pendientes ─── */}
          {actionItems.length > 0 && (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg">
              <button
                onClick={() => setActionQueueOpen(!actionQueueOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ListChecks size={18} className="text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-amber-200">
                      Decisiones Pendientes · {actionItems.length} SKU{actionItems.length > 1 ? 's' : ''} requieren atención
                    </div>
                    <div className="text-[11px] text-amber-300/70">
                      {fmt(actionItems.reduce((s, a) => s + a.row.total, 0))} unidades en los próximos {data.num_weeks} semanas
                      · {((actionItems.reduce((s, a) => s + a.row.total, 0) / data.summary.total_units) * 100).toFixed(1)}% del plan total
                    </div>
                  </div>
                </div>
                {actionQueueOpen ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-400" />}
              </button>

              {actionQueueOpen && (
                <div className="border-t border-amber-500/20">
                  <div className="divide-y divide-amber-500/10">
                    {actionItems.map(({ row: r, interp }) => {
                      const sev = SEVERITY_STYLES[interp.severity]
                      return (
                        <button
                          key={r.part_number}
                          onClick={() => scrollToSku(r.part_number)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-amber-500/10 transition-colors text-left"
                        >
                          <span className={`mt-1.5 h-2 w-2 rounded-full ${sev.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-white">{r.part_number}</span>
                              <span className="text-[10px] text-white/40">{r.catalog_type}</span>
                              <span className={`text-[9px] uppercase tracking-wider font-semibold ${sev.title}`}>{sev.label}</span>
                              {r.historical_mape_pct !== null && r.historical_mape_pct > 30 && (
                                <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">
                                  MAPE {r.historical_mape_pct}%
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/70 mt-0.5 truncate">{interp.headline}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-white/90 font-semibold tabular-nums">{fmt(r.total)}</div>
                            <div className="text-[10px] text-white/40">unid 3M</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search + leyenda */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 max-w-md w-full md:w-auto">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar SKU…"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="text-xs text-white/50 whitespace-nowrap">
                {fmt(filteredRows.length)} de {fmt(data.rows.length)} SKUs
              </div>
            </div>
            {/* Leyenda de severidad */}
            <div className="flex items-center gap-3 text-[11px] text-white/50">
              <Info size={12} className="text-white/40" />
              <span className="hidden md:inline">Click en un SKU para ver interpretación</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> alineado</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> nota</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> revisar</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> validar</span>
            </div>
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto border border-white/10 rounded-lg bg-[#0d0d1a]">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10">
                {/* Mes header (agrupación visual) */}
                <tr className="bg-white/[0.04]">
                  <th className="sticky left-0 bg-[#0d0d1a] text-left px-3 py-1.5 border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40" colSpan={2}>
                    Mes
                  </th>
                  {data.week_labels.map(wl => {
                    const monthLabel = wl.months.map(mm => MONTH_ES[mm.month - 1]).join('/')
                    return (
                      <th key={wl.num} className="px-2 py-1.5 border-b border-white/10 text-[10px] text-white/50 text-center">
                        {monthLabel}
                      </th>
                    )
                  })}
                  <th className="px-2 py-1.5 border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40 text-center" colSpan={2}>Totales</th>
                  <th className="px-2 py-1.5 border-b border-white/10 text-[10px] uppercase tracking-wider text-amber-400/60 text-center" colSpan={2}>Solo histórico</th>
                  <th className="px-2 py-1.5 border-b border-white/10"></th>
                </tr>
                {/* Weeks header */}
                <tr className="bg-[#13131f]">
                  <th className="sticky left-0 bg-[#13131f] text-left px-3 py-2 border-b border-white/10 font-medium text-white/70">
                    SKU
                  </th>
                  <th className="px-2 py-2 border-b border-white/10 font-medium text-white/70">Cat</th>
                  {data.week_labels.map(wl => (
                    <th key={wl.num} className="px-2 py-2 border-b border-white/10 font-medium text-white/70 text-center whitespace-nowrap" title={`${wl.start} → ${wl.end}`}>
                      <div className="text-[10px] text-white/40">S{wl.calendar_week ?? wl.num}</div>
                      <div>{wl.short}</div>
                    </th>
                  ))}
                  <th className="px-2 py-2 border-b border-white/10 font-medium text-white/70 text-center">Total</th>
                  <th className="px-2 py-2 border-b border-white/10 font-medium text-white/70 text-center">Prom</th>
                  <th
                    className="px-2 py-2 border-b border-white/10 font-medium text-amber-300/80 text-center whitespace-nowrap"
                    title="Run rate semanal 100% histórico: ventas últimos 12 meses / 52 semanas. Sin order book, sin pipeline, sin momentum, sin inventario."
                  >
                    Hist/sem
                  </th>
                  <th
                    className="px-2 py-2 border-b border-white/10 font-medium text-amber-300/80 text-center whitespace-nowrap"
                    title="Diferencia % entre el promedio semanal recomendado y el histórico puro. Positivo = el plan excede el histórico (por OB/pipeline/momentum)."
                  >
                    Δ vs Hist
                  </th>
                  <th className="px-2 py-2 border-b border-white/10 font-medium text-white/70 text-left">Driver</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, i) => {
                  const isExpanded = expanded === r.part_number
                  const rowInterp = interpretRow(r)
                  const rowSev = SEVERITY_STYLES[rowInterp.severity]
                  const mapeHigh = r.historical_mape_pct !== null && r.historical_mape_pct > 30
                  return (
                    <Fragment key={r.part_number}>
                      <tr
                        ref={el => {
                          if (el) rowRefs.current.set(r.part_number, el)
                          else rowRefs.current.delete(r.part_number)
                        }}
                        className={`${i % 2 === 1 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.05] cursor-pointer`}
                        onClick={() => setExpanded(isExpanded ? null : r.part_number)}
                        title={`Click para ver interpretación: ${rowInterp.headline}`}
                      >
                        <td className="sticky left-0 bg-[#0d0d1a] px-3 py-2 border-b border-white/[0.06] font-mono text-white">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${rowSev.dot} shrink-0`} title={rowSev.label} />
                            <span>{r.part_number}</span>
                            {mapeHigh && (
                              <span
                                className="text-[9px] font-semibold px-1 py-0.5 rounded bg-rose-500/15 text-rose-300 shrink-0"
                                title={`UK forecast ha errado ${r.historical_mape_pct}% en este SKU los últimos ${r.mape_months_observed}m`}
                              >
                                MAPE {r.historical_mape_pct}%
                              </span>
                            )}
                            <Info size={10} className="text-white/25 ml-auto shrink-0" />
                          </div>
                        </td>
                        <td className="px-2 py-2 border-b border-white/[0.06] text-center text-white/50">
                          {r.catalog_type ?? '—'}
                        </td>
                        {r.weeks.map((w, idx) => (
                          <td key={idx} className="px-2 py-2 border-b border-white/[0.06] text-right text-white/80 tabular-nums">
                            {w > 0 ? fmt(w) : '—'}
                          </td>
                        ))}
                        <td className="px-2 py-2 border-b border-white/[0.06] text-right text-emerald-300 font-semibold tabular-nums">
                          {fmt(r.total)}
                        </td>
                        <td className="px-2 py-2 border-b border-white/[0.06] text-right text-white/60 tabular-nums">
                          {fmt(r.avg_weekly)}
                        </td>
                        <td
                          className="px-2 py-2 border-b border-white/[0.06] text-right text-amber-300/90 tabular-nums whitespace-nowrap"
                          title={`${r.historical_months_observed} meses con venta en últimos 12m`}
                        >
                          {r.historical_avg_weekly > 0 ? fmt(r.historical_avg_weekly) : '—'}
                          {r.historical_months_observed > 0 && r.historical_months_observed < 12 && (
                            <span className="text-[9px] text-white/30 ml-1">({r.historical_months_observed}m)</span>
                          )}
                        </td>
                        <td
                          className={`px-2 py-2 border-b border-white/[0.06] text-right tabular-nums whitespace-nowrap ${
                            r.delta_vs_historical_pct === null ? 'text-white/30' :
                            r.delta_vs_historical_pct > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.delta_vs_historical_pct !== null
                            ? `${r.delta_vs_historical_pct > 0 ? '+' : ''}${r.delta_vs_historical_pct}%`
                            : '—'}
                        </td>
                        <td className="px-2 py-2 border-b border-white/[0.06] text-left">
                          <span className={`inline-block px-2 py-0.5 text-[10px] rounded border ${driverClass(r.driver)}`}>
                            {r.driver}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (() => {
                        const interp = interpretRow(r)
                        const sev = SEVERITY_STYLES[interp.severity]
                        return (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={data.num_weeks + 7} className="px-4 py-3 border-b border-white/[0.06]">
                            {/* Interpretación automática por SKU */}
                            <div className={`mb-3 rounded-md border ${sev.container} p-3`}>
                              <div className="flex items-start gap-2">
                                <span className={`mt-1 h-2 w-2 rounded-full ${sev.dot} shrink-0`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${sev.title}`}>{sev.label}</span>
                                    <span className="font-mono text-[11px] text-white/80">{r.part_number}</span>
                                    <span className="text-[10px] text-white/40">·</span>
                                    <span className="text-[11px] text-white/90 font-medium">{interp.headline}</span>
                                  </div>
                                  <ul className="text-[11px] text-white/70 space-y-1 list-disc list-inside marker:text-white/30">
                                    {interp.reasons.map((rs, idx) => (
                                      <li key={idx}>{rs}</li>
                                    ))}
                                  </ul>
                                  <div className="mt-2 text-[11px] text-white/85 font-medium">
                                    {interp.decision}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-white/50 mb-2 flex items-center gap-1">
                              <Info size={11} /> Desglose mensual de <span className="font-mono text-white">{r.part_number}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {r.monthly.map(m => (
                                <div key={m.month_label} className="p-3 bg-white/[0.03] border border-white/10 rounded-md text-[11px]">
                                  <div className="font-semibold text-white mb-1.5">{m.month_label}</div>
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-white/60">
                                    <div>Baseline</div><div className="text-right text-white/80 tabular-nums">{fmt(m.baseline)}</div>
                                    <div>Order Book</div><div className="text-right text-white/80 tabular-nums">{fmt(m.order_book)}</div>
                                    <div>Pipeline</div><div className="text-right text-white/80 tabular-nums">{fmt(m.pipeline)}</div>
                                    <div>Momentum</div><div className="text-right text-white/80 tabular-nums">×{m.momentum_factor.toFixed(2)}</div>
                                    {m.inventory_applied > 0 && (
                                      <>
                                        <div>Inv. aplicado</div><div className="text-right text-amber-300 tabular-nums">−{fmt(m.inventory_applied)}</div>
                                      </>
                                    )}
                                    <div className="border-t border-white/10 pt-1 mt-1 font-semibold text-white">Demand</div>
                                    <div className="border-t border-white/10 pt-1 mt-1 text-right text-emerald-300 font-semibold tabular-nums">{fmt(m.demand)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                        )
                      })()}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <AlertCircle size={22} className="text-white/30" />
                </div>
                {search ? (
                  <>
                    <div className="text-sm text-white/60">Sin resultados para &quot;{search}&quot;</div>
                    <div className="text-xs text-white/40 mt-1">Prueba con otro SKU o limpia el filtro.</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-white/60">No hay SKUs activos con demanda proyectada</div>
                    <div className="text-xs text-white/40 mt-1 max-w-md">
                      Verifica que haya datos en <code className="text-white/60">videndum_records</code> (ventas últimos 12m),
                      <code className="text-white/60">planning_forecasts</code> o <code className="text-white/60">order_book</code>.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Drivers summary */}
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg">
            <div className="text-xs uppercase tracking-wider text-white/50 mb-3">Distribución por driver</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(data.summary.by_driver).sort((a, b) => b[1] - a[1]).map(([drv, qty]) => (
                <div key={drv} className={`p-2.5 rounded border ${driverClass(drv)}`}>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{drv}</div>
                  <div className="text-base font-semibold mt-0.5">{fmt(qty)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
