'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { createClient } from '@/lib/supabase/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MapeRow {
  part_number: string
  catalog_type: string | null
  mape: number | null
  revenue_total: number
  intake_total: number
  aggregate_error: number | null
  periods_with_data: number
  year_from: number
  year_to: number
}

interface MarketVariable {
  value: number
  source: string
  fetchedAt: string | null
}

// ─── FRED API (Federal Reserve — serie libre sin auth) ───────────────────────
// Usamos el índice de producción industrial como proxy de mercado de equipos

async function fetchFredIndicator(): Promise<{ value: number; label: string }> {
  // IP: Industrial Production – Manufacturing (serie IPMAN), variación anual
  // FRED no requiere auth para su API pública de observaciones
  const res = await fetch(
    'https://fred.stlouisfed.org/graph/fredgraph.csv?id=IPMAN&vintage_date=' +
    new Date().toISOString().slice(0, 10),
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('FRED no disponible')

  const csv = await res.text()
  const lines = csv.trim().split('\n').filter(l => !l.startsWith('DATE'))
  const last = lines[lines.length - 1]?.split(',')
  const prev = lines[lines.length - 13]?.split(',') // hace ~1 año

  if (!last || !prev) throw new Error('Datos insuficientes en FRED')

  const lastVal = parseFloat(last[1])
  const prevVal = parseFloat(prev[1])
  const yoyGrowth = ((lastVal - prevVal) / prevVal) * 100

  return {
    value: Math.round(yoyGrowth * 10) / 10,
    label: 'FRED — Producción Industrial Manufactura (YoY%)',
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapeColor(mape: number | null): string {
  if (mape === null) return 'text-muted-foreground'
  if (mape <= 10) return 'text-emerald-600 dark:text-emerald-400'
  if (mape <= 25) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function mapeLabel(mape: number | null): string {
  if (mape === null) return '—'
  if (mape <= 10) return 'Excelente'
  if (mape <= 25) return 'Aceptable'
  return 'Alta desviación'
}

function CatalogBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
      type === 'INV'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    }`}>
      {type}
    </span>
  )
}

// ─── Subcomponente: tabla MAPE ────────────────────────────────────────────────

function MapeTable({ rows, loading }: { rows: MapeRow[]; loading: boolean }) {
  const [sortBy, setSortBy] = useState<'mape' | 'revenue_total' | 'aggregate_error'>('mape')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const PAGE = 20

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
    setPage(1)
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortBy] ?? 0
    const bv = b[sortBy] ?? 0
    return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number)
  })
  const paged = sorted.slice((page - 1) * PAGE, page * PAGE)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE))

  function SortHeader({ col, label }: { col: typeof sortBy; label: string }) {
    const active = sortBy === col
    return (
      <th
        className="px-3 py-2.5 text-right cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => toggleSort(col)}
      >
        {label} {active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
      </th>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
              <th className="px-3 py-2.5 text-left">Part Number</th>
              <th className="px-3 py-2.5">Tipo</th>
              <th className="px-3 py-2.5 text-right">MAPE %</th>
              <th className="px-3 py-2.5 text-right">Calidad</th>
              <th className="px-3 py-2.5 text-right">Revenue Total</th>
              <th className="px-3 py-2.5 text-right">Intake Total</th>
              <th className="px-3 py-2.5 text-right">Error Agregado</th>
              <th className="px-3 py-2.5 text-right">Períodos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 8 }).map((__, j) => (
                  <td key={j} className="px-3 py-2.5">
                    <div className="h-3 rounded bg-muted" style={{ width: j === 0 ? '9rem' : '4rem', marginLeft: j > 1 ? 'auto' : undefined }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th className="px-3 py-2.5 text-left">Part Number</th>
              <th className="px-3 py-2.5 text-left">Tipo</th>
              <SortHeader col="mape" label="MAPE %" />
              <th className="px-3 py-2.5 text-right">Calidad</th>
              <SortHeader col="revenue_total" label="Revenue" />
              <th className="px-3 py-2.5 text-right">Intake</th>
              <SortHeader col="aggregate_error" label="Error Agr." />
              <th className="px-3 py-2.5 text-right">Períodos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  Sin datos MAPE. Verifica que la vista videndum_mape existe en Supabase.
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr key={`${row.part_number}-${row.catalog_type}-${i}`} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-medium">{row.part_number}</td>
                <td className="px-3 py-2"><CatalogBadge type={row.catalog_type} /></td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${mapeColor(row.mape)}`}>
                  {row.mape !== null ? `${row.mape}%` : '—'}
                </td>
                <td className={`px-3 py-2 text-right text-xs ${mapeColor(row.mape)}`}>
                  {mapeLabel(row.mape)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {row.revenue_total.toLocaleString('es-MX')}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">
                  {row.intake_total.toLocaleString('es-MX')}
                </td>
                <td className={`px-3 py-2 text-right font-mono text-xs ${mapeColor(row.aggregate_error)}`}>
                  {row.aggregate_error !== null ? `${row.aggregate_error}%` : '—'}
                </td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                  {row.periods_with_data} años
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t px-3 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{rows.length} productos</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="rounded border px-2 py-1 hover:bg-muted disabled:opacity-40 transition-colors">←</button>
          <span>Pág {page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="rounded border px-2 py-1 hover:bg-muted disabled:opacity-40 transition-colors">→</button>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponente: panel de análisis IA ──────────────────────────────────────

function AIAnalysisPanel({ market, disabled }: { market: MarketVariable; disabled: boolean }) {
  const { messages, append, isLoading, error } = useChat({
    api: '/api/videndum/analysis',
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENCLAW_TOKEN ?? 'tumision_2026'}` },
  })

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')

  function runAnalysis() {
    append({
      role: 'user',
      content: JSON.stringify({
        market_growth_rate: market.value,
        market_source: market.source,
        top_n: 15,
      }),
    })
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div>
          <p className="text-sm font-medium">Análisis de Proyección con IA</p>
          <p className="text-xs text-muted-foreground">
            Variable de mercado: <strong>{market.value}%</strong> ({market.source})
            {market.fetchedAt && ` · Actualizado ${market.fetchedAt}`}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isLoading || disabled}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analizando…' : '▶ Analizar'}
        </button>
      </div>

      <div className="p-4 min-h-[200px]">
        {error && (
          <p className="text-sm text-destructive">Error: {error.message}</p>
        )}

        {!lastAssistant && !isLoading && !error && (
          <p className="text-sm text-muted-foreground italic">
            Configura la variable de mercado y presiona "Analizar" para obtener el análisis.
          </p>
        )}

        {isLoading && !lastAssistant && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="animate-pulse">●</span> Generando análisis…
          </div>
        )}

        {lastAssistant && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {lastAssistant.content}
            {isLoading && <span className="animate-pulse">▋</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function VidendumAnalysis() {
  const [rows, setRows] = useState<MapeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [market, setMarket] = useState<MarketVariable>({
    value: 3.5,
    source: 'Manual',
    fetchedAt: null,
  })
  const [fetchingMarket, setFetchingMarket] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)

  // Estadísticas resumen
  const avgMape = rows.length
    ? Math.round(rows.reduce((s, r) => s + (r.mape ?? 0), 0) / rows.length * 10) / 10
    : null
  const worstCount = rows.filter(r => (r.mape ?? 0) > 25).length
  const goodCount = rows.filter(r => (r.mape ?? 0) <= 10).length

  // ── Fetch MAPE data ──────────────────────────────────────────────────────
  const fetchMape = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: sbError } = await supabase
        .from('videndum_mape')
        .select('*')

      if (sbError) throw new Error(sbError.message)
      setRows((data ?? []) as MapeRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMape() }, [fetchMape])

  // ── Fetch market variable desde FRED ─────────────────────────────────────
  async function pullFromFred() {
    setFetchingMarket(true)
    setMarketError(null)
    try {
      const { value, label } = await fetchFredIndicator()
      setMarket({
        value,
        source: label,
        fetchedAt: new Date().toLocaleTimeString('es-MX'),
      })
    } catch {
      setMarketError('No se pudo obtener el dato de FRED. Usa el valor manual.')
    } finally {
      setFetchingMarket(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análisis Predictivo</h1>
          <p className="text-sm text-muted-foreground">
            Error de Proyección (MAPE) · Revenue vs Order Intake
          </p>
        </div>
        <button onClick={fetchMape} disabled={loading}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {loading ? 'Cargando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* KPIs resumen */}
      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'MAPE Promedio', value: avgMape !== null ? `${avgMape}%` : '—', color: mapeColor(avgMape) },
            { label: 'Alta desviación (>25%)', value: worstCount, color: worstCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground' },
            { label: 'Forecast excelente (≤10%)', value: goodCount, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
          <p className="font-medium">Error al cargar MAPE</p>
          <p className="font-mono mt-1">{error}</p>
          <p className="mt-2 text-xs">
            Verifica que la vista <code>videndum_mape</code> exista en Supabase
            (ejecutar <code>002_videndum_mape_view.sql</code>).
          </p>
        </div>
      )}

      {/* Variable de mercado */}
      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Variable de Mercado</p>
          <p className="text-xs text-muted-foreground">
            Crecimiento de mercado esperado (%) para contextualizar el forecast
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Valor (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={market.value}
                onChange={e => setMarket(prev => ({ ...prev, value: parseFloat(e.target.value) || 0, source: 'Manual', fetchedAt: null }))}
                className="h-8 w-24 rounded border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">{market.source}</span>
            </div>
          </div>
          <button
            onClick={pullFromFred}
            disabled={fetchingMarket}
            className="h-8 rounded border px-3 text-xs hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {fetchingMarket ? 'Obteniendo…' : '↓ Traer de FRED'}
          </button>
          {marketError && (
            <p className="text-xs text-destructive">{marketError}</p>
          )}
        </div>
      </div>

      {/* Tabla MAPE */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Error por Producto ({rows.length} productos)
        </p>
        <MapeTable rows={rows} loading={loading} />
      </div>

      {/* Panel IA */}
      <AIAnalysisPanel market={market} disabled={loading || rows.length === 0} />

    </div>
  )
}
