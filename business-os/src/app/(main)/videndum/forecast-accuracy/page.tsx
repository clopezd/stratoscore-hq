'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Target, Download, Filter, Calendar, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────

interface ProductAnalysis {
  sku: string
  catalog_type: string | null
  mape: number
  total_forecast: number
  total_real: number
  variance_pct: number
  records: number
  accuracy_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface GlobalMetrics {
  mape: number
  mape_prev: number | null
  mape_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  rmse: number
  bias: number
  total_forecast: number
  total_real: number
  records_compared: number
  period_label: string
  window_months: number
}

interface AccuracyData {
  global_metrics: GlobalMetrics
  product_analysis: ProductAnalysis[]
  accuracy_distribution: { grade: string; count: number; pct: number }[]
  available_periods: string[]
  total_products_analyzed: number
}

// ── Constants ───────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const GRADE_BAR_COLORS: Record<string, string> = {
  A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500',
}

const GRADE_LABELS: Record<string, string> = {
  A: '<10%', B: '10-20%', C: '20-30%', D: '30-50%', F: '>50%'
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

// ── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 cursor-help">
      <HelpCircle size={11} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-[11px] text-gray-300 leading-relaxed w-56 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-xl">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[#1a1a2e] border-b border-r border-white/10 rotate-45" />
      </span>
    </span>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function ForecastAccuracyPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-white/[0.03] rounded-xl" />}>
      <ForecastAccuracyContent />
    </Suspense>
  )
}

function ForecastAccuracyContent() {
  const searchParams = useSearchParams()
  const skuParam = searchParams.get('sku')

  const [data, setData] = useState<AccuracyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [catalogFilter, setCatalogFilter] = useState<string>('all')
  const [search, setSearch] = useState(skuParam ?? '')
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'mape' | 'variance_pct' | 'total_real'>('mape')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ top: '999', window: '2' })
      if (catalogFilter !== 'all') params.set('catalog_type', catalogFilter)
      if (selectedPeriod) {
        const [y, m] = selectedPeriod.split('-')
        params.set('year', y)
        params.set('month', String(parseInt(m)))
      }
      const res = await fetch(`/api/videndum/forecast-vs-real?${params}`)
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setData(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [catalogFilter, selectedPeriod])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExport = async () => {
    try {
      const res = await fetch('/api/videndum/forecast-vs-real/export')
      if (!res.ok) throw new Error('Error al exportar')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Forecast_Accuracy_8w_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    }
  }

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl" />)}
        </div>
        <div className="h-96 bg-white/[0.03] rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error ?? 'Error cargando datos'}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">
          Reintentar
        </button>
      </div>
    )
  }

  const { global_metrics, product_analysis, accuracy_distribution } = data

  // ── Client-side filtering & sorting ───────────────────────────────────────

  let filtered = product_analysis
  if (gradeFilter !== 'all') {
    filtered = filtered.filter(p => p.accuracy_grade === gradeFilter)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p => p.sku.toLowerCase().includes(q))
  }
  filtered = [...filtered].sort((a, b) => {
    const mul = sortDir === 'desc' ? -1 : 1
    return (a[sortField] - b[sortField]) * mul
  })

  const gradeDistribution = {
    A: product_analysis.filter(p => p.accuracy_grade === 'A').length,
    B: product_analysis.filter(p => p.accuracy_grade === 'B').length,
    C: product_analysis.filter(p => p.accuracy_grade === 'C').length,
    D: product_analysis.filter(p => p.accuracy_grade === 'D').length,
    F: product_analysis.filter(p => p.accuracy_grade === 'F').length,
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortIcon = (field: typeof sortField) => {
    if (sortField !== field) return ''
    return sortDir === 'desc' ? ' ↓' : ' ↑'
  }

  // Trend
  const hasTrend = global_metrics.mape_prev !== null && global_metrics.mape_prev !== undefined
  const trendImproved = hasTrend && global_metrics.mape < global_metrics.mape_prev!
  const trendDelta = hasTrend ? Math.abs(global_metrics.mape - global_metrics.mape_prev!) : 0

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-violet-400" />
            Forecast Accuracy
            <Tooltip text="Precisión del forecast vs ventas reales en una ventana rolling de 8 semanas (~2 meses). Compara lo que se proyectó vs lo que realmente se vendió para cada SKU." />
          </h2>
          <p className="text-sm text-gray-500">
            {data.total_products_analyzed} SKUs — ventana {global_metrics.window_months * 4} semanas — {global_metrics.period_label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-500" />
            <select
              value={selectedPeriod ?? ''}
              onChange={e => setSelectedPeriod(e.target.value || null)}
              className="px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-white cursor-pointer appearance-none pr-7"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="">Último período</option>
              {(data.available_periods ?? []).map(p => (
                <option key={p} value={p}>{periodLabel(p)}</option>
              ))}
            </select>
          </div>

          {/* Catalog filter */}
          <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
            {['all', 'INV', 'PKG'].map(v => (
              <button
                key={v}
                onClick={() => setCatalogFilter(v)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  catalogFilter === v ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {v === 'all' ? 'Todos' : v}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all"
          >
            <Download size={14} />
            Excel
          </button>
        </div>
      </div>

      {/* ── Global Metrics ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* MAPE */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            MAPE Global
            <Tooltip text="Mean Absolute Percentage Error — promedio ponderado del error porcentual absoluto. Menor es mejor." />
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{global_metrics.mape.toFixed(1)}%</p>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${GRADE_COLORS[global_metrics.mape_grade]}`}>
              {global_metrics.mape_grade}
            </span>
          </div>
          {hasTrend && (
            <div className={`flex items-center gap-1 mt-1 text-[11px] ${trendImproved ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendImproved ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {trendImproved ? 'Mejoró' : 'Empeoró'} {trendDelta.toFixed(1)}pp
              <span className="text-gray-500 ml-1">(antes: {global_metrics.mape_prev!.toFixed(1)}%)</span>
            </div>
          )}
        </div>

        {/* RMSE */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            RMSE
            <Tooltip text="Root Mean Square Error — penaliza errores grandes más que MAPE. Útil para detectar SKUs con desviaciones extremas." />
          </p>
          <p className="text-2xl font-bold text-white">{global_metrics.rmse.toFixed(0)}</p>
        </div>

        {/* Bias */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Bias (Sesgo)
            <Tooltip text="Sesgo promedio. Positivo = sub-forecast (vendemos más de lo planeado). Negativo = sobre-forecast (planeamos de más)." />
          </p>
          <p className={`text-2xl font-bold ${Math.abs(global_metrics.bias) < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {global_metrics.bias > 0 ? '+' : ''}{global_metrics.bias.toFixed(0)}
          </p>
          <p className="text-[11px] text-gray-400">{global_metrics.bias > 0 ? 'Sub-forecast' : 'Sobre-forecast'}</p>
        </div>

        {/* Records */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SKUs comparados</p>
          <p className="text-2xl font-bold text-white">{fmt(global_metrics.records_compared)}</p>
          <p className="text-[11px] text-gray-400">F: {fmt(global_metrics.total_forecast)} | R: {fmt(global_metrics.total_real)}</p>
        </div>
      </div>

      {/* ── Accuracy Distribution ────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">
          Distribución de Accuracy
          <Tooltip text="Cuántos SKUs caen en cada rango de error. Lo ideal es tener la mayoría en A y B." />
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {accuracy_distribution.map(d => (
            <button
              key={d.grade}
              onClick={() => setGradeFilter(gradeFilter === d.grade ? 'all' : d.grade)}
              className={`text-center p-3 rounded-lg border transition-all ${
                gradeFilter === d.grade ? GRADE_COLORS[d.grade] : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div className="mb-2">
                <div className={`mx-auto w-full rounded-full h-1.5 overflow-hidden bg-white/[0.05]`}>
                  <div className={`h-full rounded-full ${GRADE_BAR_COLORS[d.grade]}`} style={{ width: `${Math.max(d.pct, 3)}%` }} />
                </div>
              </div>
              <span className={`text-lg font-bold ${gradeFilter === d.grade ? '' : 'text-white'}`}>{d.grade}</span>
              <p className="text-xs text-gray-400 mt-0.5">{d.count} ({d.pct}%)</p>
              <p className="text-[10px] text-gray-500">{GRADE_LABELS[d.grade]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters Row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-gray-500" />
        <button
          onClick={() => setGradeFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            gradeFilter === 'all' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white'
          }`}
        >
          Todos ({product_analysis.length})
        </button>
        {(['A', 'B', 'C', 'D', 'F'] as const).map(g => (
          <button
            key={g}
            onClick={() => setGradeFilter(gradeFilter === g ? 'all' : g)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              gradeFilter === g ? GRADE_COLORS[g] : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white'
            }`}
          >
            {g} ({gradeDistribution[g]}) <span className="text-gray-500 ml-1">{GRADE_LABELS[g]}</span>
          </button>
        ))}

        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar SKU..."
            className="px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-gray-500 w-48"
          />
        </div>
      </div>

      {/* ── Full SKU Table ───────────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/[0.04] z-10">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-3 py-3">SKU</th>
                <th className="text-left px-2 py-3">Tipo</th>
                <th className="text-center px-2 py-3">Grade</th>
                <th className="text-right px-2 py-3 cursor-pointer select-none hover:text-white" onClick={() => toggleSort('mape')}>
                  MAPE{sortIcon('mape')}
                </th>
                <th className="text-right px-2 py-3">Forecast</th>
                <th className="text-right px-2 py-3 cursor-pointer select-none hover:text-white" onClick={() => toggleSort('total_real')}>
                  Real{sortIcon('total_real')}
                </th>
                <th className="text-right px-4 py-3 cursor-pointer select-none hover:text-white" onClick={() => toggleSort('variance_pct')}>
                  Varianza{sortIcon('variance_pct')}
                </th>
                <th className="text-right px-3 py-3">Meses</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.sku} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-white text-xs">{p.sku}</td>
                  <td className="px-2 py-2 text-xs text-gray-500">{p.catalog_type ?? '—'}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${GRADE_COLORS[p.accuracy_grade]}`}>
                      {p.accuracy_grade}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-white font-mono">{p.mape.toFixed(1)}%</td>
                  <td className="px-2 py-2 text-right text-gray-400">{fmt(p.total_forecast)}</td>
                  <td className="px-2 py-2 text-right text-gray-400">{fmt(p.total_real)}</td>
                  <td className={`px-4 py-2 text-right font-medium font-mono ${
                    p.variance_pct > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {p.variance_pct > 0 ? '+' : ''}{p.variance_pct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500 text-xs">{p.records}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-white/[0.06] text-xs text-gray-500">
          Mostrando {filtered.length} de {product_analysis.length} SKUs
          {catalogFilter !== 'all' && <span className="ml-2">| Filtro: {catalogFilter}</span>}
          {gradeFilter !== 'all' && <span className="ml-2">| Grade: {gradeFilter}</span>}
        </div>
      </div>
    </div>
  )
}
