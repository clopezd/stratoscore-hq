'use client'

import { useState } from 'react'
import { FileText, RefreshCw, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'
import { MarkdownMessage } from '@/features/chat/components/MarkdownMessage'
import { ExportButtons } from '@/features/videndum/components/ExportButtons'
import type { SummaryKPIs } from '@/features/data-ingestion/services/summary'

// ── Types ──────────────────────────────────────────────────────────────────────

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'streaming'; text: string; kpis?: SummaryKPIs }
  | { status: 'done'; text: string; kpis: SummaryKPIs }
  | { status: 'error'; message: string }

// ── KPI cards ──────────────────────────────────────────────────────────────────

function KpiBar({ kpis }: { kpis: SummaryKPIs }) {
  const sign  = (n: number) => (n >= 0 ? '+' : '') + n.toLocaleString('en-US')
  const isNeg = kpis.total_variance_pct < 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <KpiCard
        label="Forecast total"
        value={kpis.total_forecast.toLocaleString()}
        sub="unidades"
      />
      <KpiCard
        label="Revenue real"
        value={kpis.total_actual.toLocaleString()}
        sub="unidades"
      />
      <KpiCard
        label="Varianza global"
        value={`${sign(kpis.total_variance_pct)}%`}
        sub={`${sign(kpis.total_variance_qty)} u`}
        color={isNeg ? 'text-red-400' : 'text-emerald-400'}
        icon={isNeg ? TrendingDown : TrendingUp}
      />
      <KpiCard
        label="Período"
        value={kpis.period_label}
        sub={`${kpis.skus_under_forecast} bajo · ${kpis.skus_over_forecast} sobre plan`}
      />
    </div>
  )
}

function KpiCard({
  label, value, sub, color = 'text-white/80',
  icon: Icon,
}: {
  label: string; value: string; sub: string
  color?: string; icon?: typeof TrendingDown
}) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2.5 flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        {Icon && <Icon size={10} className={color} />}
        <p className={`text-sm font-semibold font-mono ${color}`}>{value}</p>
      </div>
      <p className="text-[9px] text-white/25">{label}</p>
      <p className="text-[9px] text-white/40 font-mono">{sub}</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ExecutiveSummary() {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function generate() {
    setState({ status: 'loading' })

    try {
      const res = await fetch('/api/videndum/executive-summary', { method: 'POST' })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setState({ status: 'error', message: err.error ?? `HTTP ${res.status}` })
        return
      }

      // Leer KPIs del header
      const kpisRaw = res.headers.get('X-Summary-KPIs')
      const kpis: SummaryKPIs | undefined = kpisRaw
        ? JSON.parse(Buffer.from(kpisRaw, 'base64').toString('utf-8'))
        : undefined

      // Leer stream de texto
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      setState({ status: 'streaming', text: '', kpis })

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setState({ status: 'streaming', text: accumulated, kpis })
      }

      if (!kpis) {
        setState({ status: 'error', message: 'No se recibieron KPIs del servidor' })
        return
      }

      setState({ status: 'done', text: accumulated, kpis })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Error de conexión' })
    }
  }

  const isLoading = state.status === 'loading' || state.status === 'streaming'
  const hasResult = state.status === 'streaming' || state.status === 'done'

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-amber-400" />
          <p className="text-xs font-medium text-white/50">Resumen Ejecutivo</p>
          {state.status === 'streaming' && (
            <span className="text-[9px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Generando…
            </span>
          )}
          {state.status === 'done' && (
            <span className="text-[9px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Listo
            </span>
          )}
        </div>
        {/* Export buttons — solo cuando hay resultado completo */}
        {state.status === 'done' && (
          <ExportButtons
            kpis={state.kpis}
            summaryText={state.text}
          />
        )}

        <button
          onClick={generate}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            isLoading
              ? 'bg-white/[0.04] text-white/30 cursor-not-allowed'
              : hasResult
              ? 'bg-white/[0.06] hover:bg-white/[0.09] text-white/50 border border-white/[0.07]'
              : 'bg-amber-500/80 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
          }`}
        >
          {isLoading
            ? <><RefreshCw size={10} className="animate-spin" /> Generando…</>
            : hasResult
            ? <><RefreshCw size={10} /> Regenerar</>
            : <><FileText size={10} /> Generar Resumen</>
          }
        </button>
      </div>

      {/* Error */}
      {state.status === 'error' && (
        <div className="m-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-red-300">{state.message}</p>
        </div>
      )}

      {/* Idle state */}
      {state.status === 'idle' && (
        <div className="py-10 text-center space-y-2">
          <FileText size={22} className="text-white/10 mx-auto" />
          <p className="text-[11px] text-white/20">
            Analiza varianza Forecast vs Revenue y genera un resumen ejecutivo para el equipo de Inglaterra
          </p>
        </div>
      )}

      {/* Loading */}
      {state.status === 'loading' && (
        <div className="py-10 flex items-center justify-center gap-2 text-[11px] text-white/25">
          <RefreshCw size={11} className="animate-spin" />
          Consultando base de datos…
        </div>
      )}

      {/* Result */}
      {hasResult && (state as { text: string; kpis?: SummaryKPIs }).kpis && (
        <div className="p-4 space-y-4">
          {/* KPI bar */}
          <KpiBar kpis={(state as { kpis: SummaryKPIs }).kpis} />

          {/* Worst / best SKUs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkuBlock
              title="Mayor impacto negativo"
              icon={TrendingDown}
              iconColor="text-red-400"
              skus={(state as { kpis: SummaryKPIs }).kpis.worst_3}
            />
            <SkuBlock
              title="Mejor rendimiento"
              icon={TrendingUp}
              iconColor="text-emerald-400"
              skus={(state as { kpis: SummaryKPIs }).kpis.best_3}
            />
          </div>

          {/* AI text */}
          {(state as { text: string }).text && (
            <div className="border-t border-white/[0.05] pt-4">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Análisis del Director de Operaciones</p>
              <MarkdownMessage content={(state as { text: string }).text} />
              {state.status === 'streaming' && (
                <span className="inline-block w-1.5 h-3.5 bg-amber-400/70 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── SKU block ──────────────────────────────────────────────────────────────────

import type { SkuVariance } from '@/features/data-ingestion/services/summary'

function SkuBlock({
  title, icon: Icon, iconColor, skus,
}: {
  title: string
  icon: typeof TrendingDown
  iconColor: string
  skus: SkuVariance[]
}) {
  const sign = (n: number) => (n >= 0 ? '+' : '') + n.toLocaleString('en-US')
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} className={iconColor} />
        <p className="text-[10px] text-white/35">{title}</p>
      </div>
      {skus.map(s => (
        <div key={s.part_number} className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-white/60 truncate">{s.part_number}</span>
          <span className={`text-[10px] font-mono shrink-0 ${s.variance_pct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {sign(s.variance_pct)}%
          </span>
        </div>
      ))}
    </div>
  )
}
