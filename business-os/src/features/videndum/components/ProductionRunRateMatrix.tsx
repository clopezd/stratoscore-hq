'use client'

import { Fragment, useEffect, useState, useMemo } from 'react'
import { Download, Factory, Info, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface WeekLabel {
  num: number
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

export function ProductionRunRateMatrix() {
  const [data, setData] = useState<RunRateMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeks, setWeeks] = useState(13)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

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

          {/* Search */}
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar SKU…"
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="text-xs text-white/50">
              {fmt(filteredRows.length)} de {fmt(data.rows.length)} SKUs
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
                      <div className="text-[10px] text-white/40">S{wl.num}</div>
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
                  return (
                    <Fragment key={r.part_number}>
                      <tr
                        className={`${i % 2 === 1 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.05] cursor-pointer`}
                        onClick={() => setExpanded(isExpanded ? null : r.part_number)}
                      >
                        <td className="sticky left-0 bg-[#0d0d1a] px-3 py-2 border-b border-white/[0.06] font-mono text-white">
                          {r.part_number}
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
                      {isExpanded && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={data.num_weeks + 7} className="px-4 py-3 border-b border-white/[0.06]">
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
                      )}
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
