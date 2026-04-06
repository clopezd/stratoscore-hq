'use client'

import { useEffect, useState } from 'react'
import { Target, Download, Filter } from 'lucide-react'

interface ProductAnalysis {
  sku: string
  mape: number
  total_forecast: number
  total_real: number
  variance_pct: number
  records: number
  accuracy_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface AccuracyData {
  global_metrics: {
    mape: number
    rmse: number
    bias: number
    total_forecast: number
    total_real: number
    records_compared: number
  }
  product_analysis: ProductAnalysis[]
  total_products_analyzed: number
}

const GRADE_COLORS: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const GRADE_LABELS: Record<string, string> = {
  A: '<10%', B: '10-20%', C: '20-30%', D: '30-50%', F: '>50%'
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function ForecastAccuracyPage() {
  const [data, setData] = useState<AccuracyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'mape' | 'variance_pct' | 'total_real'>('mape')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/videndum/forecast-vs-real?top=999')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      const res = await fetch('/api/videndum/forecast-vs-real/export')
      if (!res.ok) throw new Error('Error al exportar')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Forecast_Accuracy_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-4 gap-3">
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
      </div>
    )
  }

  const { global_metrics, product_analysis } = data

  // Filter and sort
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

  const mapeGrade = global_metrics.mape < 10 ? 'A' : global_metrics.mape < 20 ? 'B' : global_metrics.mape < 30 ? 'C' : global_metrics.mape < 50 ? 'D' : 'F'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target size={20} className="text-violet-400" />
            Forecast Accuracy
          </h2>
          <p className="text-sm text-gray-500">{data.total_products_analyzed} SKUs analizados</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all"
        >
          <Download size={14} />
          Exportar Excel
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">MAPE Global</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{global_metrics.mape.toFixed(1)}%</p>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${GRADE_COLORS[mapeGrade]}`}>{mapeGrade}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">RMSE</p>
          <p className="text-2xl font-bold text-white">{global_metrics.rmse.toFixed(0)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bias (Sesgo)</p>
          <p className={`text-2xl font-bold ${Math.abs(global_metrics.bias) < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {global_metrics.bias > 0 ? '+' : ''}{global_metrics.bias.toFixed(0)}
          </p>
          <p className="text-[11px] text-gray-400">{global_metrics.bias > 0 ? 'Sub-forecast' : 'Sobre-forecast'}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Registros comparados</p>
          <p className="text-2xl font-bold text-white">{fmt(global_metrics.records_compared)}</p>
          <p className="text-[11px] text-gray-400">Forecast: {fmt(global_metrics.total_forecast)} | Real: {fmt(global_metrics.total_real)}</p>
        </div>
      </div>

      {/* Grade Distribution + Filters */}
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

      {/* Full SKU Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/[0.04] z-10">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-3 py-3">SKU</th>
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
        </div>
      </div>
    </div>
  )
}
