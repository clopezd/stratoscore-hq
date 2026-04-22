'use client'

import { useEffect, useState, useCallback } from 'react'
import { Factory, Download, Search, Filter, Info, Save, CheckCircle2, FileSpreadsheet } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────

interface PlanRow {
  part_number: string
  catalog_type: string | null
  forecast_qty: number
  order_book_qty: number
  avg_monthly_revenue: number
  recommended_qty: number
  adjusted_qty: number | null
  adjustment_reason: string | null
  reason: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'draft' | 'approved' | 'exported' | 'new'
  plan_id: string | null
}

interface PlanData {
  period: string
  week_start: string
  plan_status: string
  total_skus: number
  high_priority: number
  total_recommended: number
  total_adjusted: number
  total_order_book: number
  rows: PlanRow[]
}

// ── Constants ───────────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  HIGH: 'text-red-400 bg-red-500/10 border-red-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-gray-400 bg-white/5 border-white/10',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Sin guardar', color: 'text-gray-500' },
  draft: { label: 'Borrador', color: 'text-amber-400' },
  approved: { label: 'Aprobado', color: 'text-emerald-400' },
  exported: { label: 'Exportado', color: 'text-blue-400' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Main Component ──────────────────────────────────────────────────────────

export function WeeklyProductionPlan() {
  const [data, setData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [catalogFilter, setCatalogFilter] = useState<string>('all')
  const [adjustments, setAdjustments] = useState<Record<string, { qty: number; reason: string }>>({})
  const [expandedReason, setExpandedReason] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/videndum/production-plan')
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setData(d)
      // Load existing adjustments
      const existing: Record<string, { qty: number; reason: string }> = {}
      for (const r of d.rows) {
        if (r.adjusted_qty !== null && r.adjusted_qty !== r.recommended_qty) {
          existing[r.part_number] = { qty: r.adjusted_qty, reason: r.adjustment_reason ?? '' }
        }
      }
      setAdjustments(existing)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando plan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdjust = useCallback((partNumber: string, qty: number) => {
    setAdjustments(prev => ({
      ...prev,
      [partNumber]: { qty, reason: prev[partNumber]?.reason ?? '' },
    }))
  }, [])

  // Save plan as draft
  const handleSave = useCallback(async (status: 'draft' | 'approved' = 'draft') => {
    if (!data) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const rows = data.rows.map(r => ({
        part_number: r.part_number,
        catalog_type: r.catalog_type,
        recommended_qty: r.recommended_qty,
        adjusted_qty: adjustments[r.part_number]?.qty ?? null,
        adjustment_reason: adjustments[r.part_number]?.reason || null,
      }))

      const res = await fetch('/api/videndum/production-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: data.week_start, rows, status }),
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)

      setSaveMsg(status === 'approved' ? `Plan aprobado (${result.saved} SKUs)` : `Borrador guardado (${result.saved} SKUs)`)
      await fetchData()
    } catch (e) {
      setSaveMsg('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    } finally {
      setSaving(false)
    }
  }, [data, adjustments, fetchData])

  // Export Excel
  const handleExport = useCallback(async () => {
    if (!data) return
    try {
      // Save first if there are unsaved adjustments
      if (Object.keys(adjustments).length > 0 && data.plan_status !== 'exported') {
        await handleSave('approved')
      }

      const res = await fetch(`/api/videndum/production-plan/export?week_start=${data.week_start}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Error ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Videndum_ProductionPlan_${data.week_start}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSaveMsg('Excel exportado y plan marcado como exportado')
      await fetchData()
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'desconocido'))
    }
  }, [data, adjustments, handleSave, fetchData])

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/[0.05] rounded" />
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
        <p className="text-red-400">{error ?? 'Error cargando plan'}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">
          Reintentar
        </button>
      </div>
    )
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  let filtered = data.rows
  if (priorityFilter !== 'all') filtered = filtered.filter(r => r.priority === priorityFilter)
  if (catalogFilter !== 'all') filtered = filtered.filter(r => r.catalog_type === catalogFilter)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(r => r.part_number.toLowerCase().includes(q))
  }

  const hasUnsavedChanges = Object.keys(adjustments).some(sku => {
    const row = data.rows.find(r => r.part_number === sku)
    if (!row) return false
    const savedAdj = row.adjusted_qty
    return adjustments[sku].qty !== (savedAdj ?? row.recommended_qty)
  })

  const statusInfo = STATUS_LABELS[data.plan_status] ?? STATUS_LABELS.new

  const totalAdjusted = data.rows.reduce((s, r) => {
    const adj = adjustments[r.part_number]?.qty
    return s + (adj ?? r.adjusted_qty ?? r.recommended_qty)
  }, 0)

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory size={20} className="text-blue-400" />
            Plan de Producción
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-gray-500">Semana: {data.week_start} — {data.total_skus} SKUs</p>
            <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Save draft */}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          {/* Approve */}
          <button
            onClick={() => handleSave('approved')}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            Aprobar
          </button>
          {/* Export Excel */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FileSpreadsheet size={14} />
            Exportar Excel (IFS)
          </button>
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`px-4 py-2 rounded-lg text-xs ${saveMsg.startsWith('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {saveMsg}
        </div>
      )}

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SKUs Total</p>
          <p className="text-2xl font-bold text-white">{data.total_skus}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Alta Prioridad</p>
          <p className="text-2xl font-bold text-red-400">{data.high_priority}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Recomendado</p>
          <p className="text-2xl font-bold text-white">{fmt(data.total_recommended)}</p>
          <p className="text-[11px] text-gray-500">unidades</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ajustado</p>
          <p className={`text-2xl font-bold ${totalAdjusted !== data.total_recommended ? 'text-amber-400' : 'text-white'}`}>
            {fmt(totalAdjusted)}
          </p>
          {totalAdjusted !== data.total_recommended && (
            <p className="text-[11px] text-amber-400/70">
              {totalAdjusted > data.total_recommended ? '+' : ''}{fmt(totalAdjusted - data.total_recommended)} vs rec.
            </p>
          )}
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Order Book</p>
          <p className="text-2xl font-bold text-white">{fmt(data.total_order_book)}</p>
          <p className="text-[11px] text-gray-500">en backlog</p>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
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

        <div className="flex items-center rounded-lg border border-white/[0.08] overflow-hidden ml-2">
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

        <div className="ml-auto flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-400">Cambios sin guardar</span>
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

      {/* ── Table ──────────────────────────────────────────────────────── */}
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
                const adj = adjustments[r.part_number]?.qty
                const currentQty = adj ?? r.adjusted_qty ?? r.recommended_qty
                const isAdjusted = currentQty !== r.recommended_qty
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
                        value={currentQty}
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

        <div className="px-4 py-2 border-t border-white/[0.06] text-xs text-gray-500 flex items-center justify-between">
          <span>Mostrando {filtered.length} de {data.rows.length} SKUs</span>
          <span className={statusInfo.color}>{statusInfo.label}</span>
        </div>
      </div>
    </div>
  )
}
