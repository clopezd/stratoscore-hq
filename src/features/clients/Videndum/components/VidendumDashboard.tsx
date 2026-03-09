'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RevVsIntakeRow } from '../types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

const MONTH_NAMES: Record<number, string> = {
  1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic',
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function CatalogBadge({ type }: { type: RevVsIntakeRow['catalog_type'] }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium
      ${type === 'INV'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
      }`}>
      {type}
    </span>
  )
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground text-xs">—</span>
  const isPositive = delta > 0
  const isZero = delta === 0
  return (
    <span className={`font-mono text-sm ${
      isZero ? 'text-muted-foreground' :
      isPositive ? 'text-emerald-600 dark:text-emerald-400' :
      'text-red-600 dark:text-red-400'
    }`}>
      {isPositive ? '+' : ''}{delta.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
    </span>
  )
}

function Pagination({
  page, totalPages, total, loading, onPrev, onNext,
}: {
  page: number
  totalPages: number
  total: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-muted-foreground">
      <span>{total.toLocaleString()} registros totales</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={page <= 1 || loading}
          className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <span className="text-xs">
          Página <strong>{page}</strong> de <strong>{totalPages}</strong>
        </span>
        <button
          onClick={onNext}
          disabled={page >= totalPages || loading}
          className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ─── Hook de datos ────────────────────────────────────────────────────────────

interface Filters {
  year: string
  catalog_type: string
  search: string
}

function useRevVsIntake(page: number, filters: Filters) {
  const [rows, setRows] = useState<RevVsIntakeRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('videndum_rev_vs_intake')
        .select('*', { count: 'exact' })
        .order('year', { ascending: false })
        .order('part_number', { ascending: true })
        .range(from, to)

      if (filters.year) query = query.eq('year', Number(filters.year))
      if (filters.catalog_type) {
        if (filters.catalog_type === 'NULL') query = query.is('catalog_type', null)
        else query = query.eq('catalog_type', filters.catalog_type)
      }
      if (filters.search.trim()) query = query.ilike('part_number', `%${filters.search.trim()}%`)

      const { data, count, error: sbError } = await query
      if (sbError) throw new Error(sbError.message)

      setRows(data ?? [])
      setTotal(count ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filters.year, filters.catalog_type, filters.search])

  useEffect(() => { fetch() }, [fetch])

  return { rows, total, loading, error, refetch: fetch }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function VidendumDashboard() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({ year: '', catalog_type: '', search: '' })
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce del campo search para no disparar una query por cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 350)
    return () => clearTimeout(t)
  }, [filters.search])

  const activeFilters: Filters = { ...filters, search: debouncedSearch }
  const { rows, total, loading, error, refetch } = useRevVsIntake(page, activeFilters)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleFilterChange(key: keyof Filters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // ── Render: error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">Error al cargar la vista</p>
        <p className="mt-1 text-sm font-mono">{error}</p>
        <button onClick={refetch} className="mt-3 text-sm underline underline-offset-2">
          Reintentar
        </button>
      </div>
    )
  }

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Videndum</h1>
          <p className="text-sm text-muted-foreground">Revenue vs Order Intake por producto</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? 'Cargando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar part number…"
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          className="h-8 rounded border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-56"
        />
        <select
          value={filters.year}
          onChange={e => handleFilterChange('year', e.target.value)}
          className="h-8 rounded border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Todos los años</option>
          {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={filters.catalog_type}
          onChange={e => handleFilterChange('catalog_type', e.target.value)}
          className="h-8 rounded border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">INV + PKG</option>
          <option value="INV">INV</option>
          <option value="PKG">PKG</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <th className="px-4 py-3">Part Number</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Año</th>
                <th className="px-3 py-3">Mes</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Order Intake</th>
                <th className="px-4 py-3 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && rows.length === 0 ? (
                // Skeleton mientras carga la primera vez
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 w-36 rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-3 w-8 rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-3 w-10 rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-3 w-8 rounded bg-muted" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-14 rounded bg-muted ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-14 rounded bg-muted ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-12 rounded bg-muted ml-auto" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Sin resultados para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={`${row.part_number}-${row.catalog_type}-${row.year}-${row.month}-${i}`}
                    className={`hover:bg-muted/30 transition-colors ${loading ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium">
                      {row.part_number}
                    </td>
                    <td className="px-3 py-2.5">
                      <CatalogBadge type={row.catalog_type} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.year}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {row.month ? MONTH_NAMES[row.month] : <span className="text-xs italic">Anual</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.revenue_qty.toLocaleString('es-MX', { maximumFractionDigits: 1 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                      {row.order_intake_qty !== null
                        ? row.order_intake_qty.toLocaleString('es-MX', { maximumFractionDigits: 1 })
                        : <span className="text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <DeltaCell delta={row.delta} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="border-t px-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>
    </div>
  )
}
