'use client'

import { useEffect, useState, useCallback } from 'react'
import { Factory, Download, Search, Filter, Info } from 'lucide-react'

interface PlanRow {
  part_number: string
  catalog_type: string | null
  forecast_qty: number
  order_book_qty: number
  avg_monthly_revenue: number
  recommended_qty: number
  reason: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface PlanData {
  period: string
  total_skus: number
  high_priority: number
  total_recommended: number
  total_order_book: number
  rows: PlanRow[]
}

const PRIORITY_COLORS = {
  HIGH: 'text-red-400 bg-red-500/10 border-red-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-gray-400 bg-white/5 border-white/10',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function WeeklyProductionPlan() {
  const [data, setData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [expandedReason, setExpandedReason] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/videndum/production-plan')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleAdjust = useCallback((partNumber: string, qty: number) => {
    setAdjustments(prev => ({ ...prev, [partNumber]: qty }))
  }, [])

  const handleExport = useCallback(async () => {
    if (!data) return

    // Generate CSV (universally compatible with Excel/IFS)
    const rows = data.rows.map(r => ({
      part_number: r.part_number,
      catalog_type: r.catalog_type ?? '',
      forecast: r.forecast_qty,
      order_book: r.order_book_qty,
      avg_revenue: r.avg_monthly_revenue,
      recommended: r.recommended_qty,
      adjusted: adjustments[r.part_number] ?? r.recommended_qty,
      priority: r.priority,
      reason: r.reason,
    }))

    const headers = ['Part Number', 'Catalog Type', 'Forecast', 'Order Book', 'Avg Revenue', 'Recommended', 'Adjusted', 'Priority', 'Reason']
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.part_number,
        r.catalog_type,
        r.forecast,
        r.order_book,
        r.avg_revenue,
        r.recommended,
        r.adjusted,
        r.priority,
        `"${r.reason.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Plan_Produccion_${data.period}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data, adjustments])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.05] rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl" />)}
        </div>
        <div className="h-96 bg-white/[0.03] rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error ?? 'Error cargando plan'}</p>
      </div>
    )
  }

  // Filter
  let filtered = data.rows
  if (priorityFilter !== 'all') {
    filtered = filtered.filter(r => r.priority === priorityFilter)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(r => r.part_number.toLowerCase().includes(q))
  }

  const hasAdjustments = Object.keys(adjustments).length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory size={20} className="text-blue-400" />
            Plan de Producción
          </h2>
          <p className="text-sm text-gray-500">Período: {data.period} — {data.total_skus} SKUs</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Download size={14} />
          Exportar CSV (IFS)
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SKUs Total</p>
          <p className="text-2xl font-bold text-white">{data.total_skus}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Alta Prioridad</p>
          <p className="text-2xl font-bold text-red-400">{data.high_priority}</p>
          <p className="text-[11px] text-gray-500">Requieren atención</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Recomendado</p>
          <p className="text-2xl font-bold text-white">{fmt(data.total_recommended)}</p>
          <p className="text-[11px] text-gray-500">unidades</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Order Book</p>
          <p className="text-2xl font-bold text-white">{fmt(data.total_order_book)}</p>
          <p className="text-[11px] text-gray-500">en backlog</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-gray-500" />
        {['all', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              priorityFilter === p
                ? p === 'all' ? 'bg-white/10 border-white/20 text-white' : PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white'
            }`}
          >
            {p === 'all' ? `Todos (${data.rows.length})` : `${p} (${data.rows.filter(r => r.priority === p).length})`}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {hasAdjustments && (
            <span className="text-xs text-amber-400">{Object.keys(adjustments).length} ajustes pendientes</span>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar SKU..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-gray-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/[0.04] z-10">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-center px-2 py-3">Prioridad</th>
                <th className="text-right px-2 py-3">Forecast</th>
                <th className="text-right px-2 py-3">Order Book</th>
                <th className="text-right px-2 py-3">Run Rate</th>
                <th className="text-right px-2 py-3">Recomendado</th>
                <th className="text-right px-3 py-3">Ajustado</th>
                <th className="text-center px-2 py-3">Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const adjusted = adjustments[r.part_number]
                const isAdjusted = adjusted !== undefined && adjusted !== r.recommended_qty
                return (
                  <tr key={r.part_number} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-2">
                      <span className="font-mono text-white text-xs">{r.part_number}</span>
                      {r.catalog_type && <span className="text-[10px] text-gray-500 ml-1.5">{r.catalog_type}</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[r.priority]}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-gray-400">{fmt(r.forecast_qty)}</td>
                    <td className="px-2 py-2 text-right text-gray-400">{fmt(r.order_book_qty)}</td>
                    <td className="px-2 py-2 text-right text-gray-400">{fmt(r.avg_monthly_revenue)}</td>
                    <td className="px-2 py-2 text-right text-white font-medium">{fmt(r.recommended_qty)}</td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={adjusted ?? r.recommended_qty}
                        onChange={e => handleAdjust(r.part_number, parseInt(e.target.value) || 0)}
                        className={`w-20 px-2 py-1 text-xs text-right rounded border ${
                          isAdjusted
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-white/[0.03] border-white/[0.08] text-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => setExpandedReason(expandedReason === r.part_number ? null : r.part_number)}
                        className="p-1 hover:bg-white/[0.05] rounded text-gray-400 hover:text-white transition-colors"
                        title={r.reason}
                      >
                        <Info size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded reason */}
        {expandedReason && (() => {
          const row = data.rows.find(r => r.part_number === expandedReason)
          if (!row) return null
          return (
            <div className="px-4 py-3 bg-blue-500/5 border-t border-blue-500/20 text-xs">
              <span className="font-mono text-white font-medium">{row.part_number}</span>
              <span className="text-gray-400 mx-2">—</span>
              <span className="text-blue-300">{row.reason}</span>
            </div>
          )
        })()}

        <div className="px-4 py-2 border-t border-white/[0.06] text-xs text-gray-500">
          Mostrando {filtered.length} de {data.rows.length} SKUs
        </div>
      </div>
    </div>
  )
}
