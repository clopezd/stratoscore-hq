'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, Zap, RefreshCw, Radar } from 'lucide-react'
import type { DecisionMatrixData, RiskEntry, OpportunityEntry, ActionEntry } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function severityBadge(s: RiskEntry['severity']) {
  const map = {
    'CRÍTICA':  'bg-red-500/20 text-red-300 border-red-500/30',
    'ALTA':     'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'MEDIA':    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'BAJA':     'bg-white/10 text-white/40 border-white/10',
  }
  return map[s] ?? map['BAJA']
}

function actionBadge(a: RiskEntry['immediate_action'] | ActionEntry['decision']) {
  const map: Record<string, string> = {
    'LIQUIDAR':     'bg-red-500/20 text-red-300 border-red-500/30',
    'PROVISIONAR':  'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'VENDER_CANAL': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'VIGILAR':      'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'MANTENER':     'bg-white/10 text-white/40 border-white/10',
    'INVERTIR':     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }
  return map[a] ?? map['MANTENER']
}

function urgencyColor(u: ActionEntry['urgency']) {
  const map = {
    'INMEDIATA': 'text-red-400',
    'Q2_2026':   'text-orange-400',
    'H2_2026':   'text-amber-400',
    '2027+':     'text-white/35',
  }
  return map[u] ?? 'text-white/35'
}

function exploitationBadge(e: OpportunityEntry['current_exploitation']) {
  const map = {
    'SIN_EXPLOTAR':   'bg-red-500/15 text-red-300',
    'SUBUTILIZADA':   'bg-amber-500/15 text-amber-300',
    'BIEN_EXPLOTADA': 'bg-emerald-500/15 text-emerald-300',
  }
  return map[e] ?? ''
}

function riskTypeLabel(t: RiskEntry['risk_type']) {
  const map = {
    'OBSOLESCENCIA':       'Obsolescencia',
    'COMPETENCIA_CHINA':   'Competencia China',
    'SUSTITUCIÓN_IP':      'Sustitución IP',
    'DEMANDA_LATENTE':     'Demanda latente',
    'GOING_CONCERN':       'Going Concern',
  }
  return map[t] ?? t
}

// ── Secciones ─────────────────────────────────────────────────────────────────

function RiskMatrix({ rows }: { rows: RiskEntry[] }) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div
          key={i}
          className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 flex flex-col gap-2"
        >
          {/* Header: part number + badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {r.part_number && (
                  <span className="font-mono text-[11px] text-white/70 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    {r.part_number}
                  </span>
                )}
                <span className="text-[11px] text-white/50">{r.segment}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${severityBadge(r.severity)}`}>
                  {r.severity}
                </span>
                <span className="text-[9px] text-white/25 bg-white/[0.03] px-1.5 py-0.5 rounded-full">
                  {riskTypeLabel(r.risk_type)}
                </span>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed">{r.evidence}</p>
            </div>
            {/* Acción */}
            <div className="shrink-0">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${actionBadge(r.immediate_action)}`}>
                {r.immediate_action}
              </span>
            </div>
          </div>

          {/* NUEVO: Bloque de inteligencia competitiva */}
          {(r.competitor_threat || r.competitor_advantage || r.forecast_impact) && (
            <div className="border-t border-white/[0.06] pt-2 space-y-1.5">
              {r.competitor_threat && (
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] text-orange-400/80 mt-0.5">⚔</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-medium text-orange-400/90">
                      {r.competitor_threat}
                    </span>
                    {r.competitor_advantage && (
                      <span className="text-[10px] text-orange-300/60 ml-1.5">
                        · {r.competitor_advantage}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {r.forecast_impact && (
                <div className="bg-red-500/[0.08] border border-red-500/20 rounded px-2 py-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-[9px] text-red-400 font-bold mt-0.5">DPRO FAIL</span>
                    <p className="text-[10px] text-red-300/90 leading-relaxed flex-1">
                      {r.forecast_impact}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OpportunityMatrix({ rows }: { rows: OpportunityEntry[] }) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div
          key={i}
          className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3"
        >
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[11px] font-medium text-white/70">{r.segment}</span>
            <span className="text-[11px] text-indigo-400 font-medium">{r.videndum_asset}</span>
            {r.cagr && (
              <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded-full">
                {r.cagr} CAGR
              </span>
            )}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${exploitationBadge(r.current_exploitation)}`}>
              {r.current_exploitation.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mb-1">{r.market_trend}</p>
          <p className="text-[11px] text-amber-300/70">{r.gap}</p>
          <p className="text-[11px] text-white/55 mt-1 pt-1 border-t border-white/[0.04]">→ {r.recommendation}</p>
        </div>
      ))}
    </div>
  )
}

function ActionTable({ rows }: { rows: ActionEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.05]">
            <th className="text-left px-3 py-2 text-white/30 font-medium">Objetivo</th>
            <th className="text-center px-3 py-2 text-white/30 font-medium">Tipo</th>
            <th className="text-center px-3 py-2 text-white/30 font-medium">Decisión</th>
            <th className="text-center px-3 py-2 text-white/30 font-medium">Urgencia</th>
            <th className="text-left px-3 py-2 text-white/30 font-medium">Justificación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-2.5 font-mono text-white/70 text-[11px]">{r.target}</td>
              <td className="px-3 py-2.5 text-center">
                <span className="text-[9px] text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded-full">
                  {r.type}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${actionBadge(r.decision)}`}>
                  {r.decision}
                </span>
              </td>
              <td className={`px-3 py-2.5 text-center text-[11px] font-medium ${urgencyColor(r.urgency)}`}>
                {r.urgency}
              </td>
              <td className="px-3 py-2.5 text-white/40 text-[11px] leading-relaxed max-w-xs">{r.rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

const CACHE_KEY = 'videndum_decision_matrix_v1'
const CACHE_TTL = 3600000 // 1 hora

function getCached(): DecisionMatrixData | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data as DecisionMatrixData
  } catch {
    return null
  }
}

function setCached(data: DecisionMatrixData) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (e) {
    console.warn('[DecisionMatrix] localStorage error:', e)
  }
}

// ── Componente principal ───────────────────────────────────────────────────────

export function DecisionMatrix({ onDataReady }: { onDataReady?: (data: DecisionMatrixData) => void } = {}) {
  const [data, setData] = useState<DecisionMatrixData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'risks' | 'opportunities' | 'actions'>('risks')

  // Cargar cache al montar
  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setData(cached)
      onDataReady?.(cached)
    }
  }, [onDataReady])

  async function run(forceRefresh = false) {
    // Si hay cache válido y no se fuerza refresh, usar cache
    if (!forceRefresh) {
      const cached = getCached()
      if (cached) {
        setData(cached)
        onDataReady?.(cached)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/videndum/intelligence-ui', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`)
      const matrixData = json as DecisionMatrixData
      setData(matrixData)
      setCached(matrixData)
      onDataReady?.(matrixData)
      setActiveTab('risks')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'risks' as const,         label: 'Riesgos',      count: data?.risk_matrix.length,       icon: AlertTriangle,  color: 'text-red-400' },
    { id: 'opportunities' as const, label: 'Oportunidades', count: data?.opportunity_matrix.length, icon: TrendingUp,     color: 'text-emerald-400' },
    { id: 'actions' as const,       label: 'Decisiones',   count: data?.action_table.length,       icon: Zap,            color: 'text-amber-400' },
  ]

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar size={13} className="text-indigo-400" />
          <p className="text-xs font-medium text-white/50">Radar de Inteligencia Competitiva</p>
          {data?.snapshot_date && (
            <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full ml-1">
              {data.snapshot_date}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <button
              onClick={() => run(true)}
              disabled={loading}
              title="Forzar actualización (ignora caché)"
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={9} />
              Forzar
            </button>
          )}
          <button
            onClick={() => run()}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              loading
                ? 'bg-white/[0.04] text-white/30 cursor-not-allowed'
                : data
                ? 'bg-white/[0.06] text-white/50 hover:bg-white/[0.09] border border-white/[0.07]'
                : 'bg-indigo-500/80 text-white hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
            }`}
          >
            {loading
              ? <><RefreshCw size={10} className="animate-spin" /> Analizando...</>
              : data
              ? <><RefreshCw size={10} /> Actualizar</>
              : <><Radar size={10} /> Ejecutar Radar</>
            }
          </button>
        </div>
      </div>

      {/* Summary */}
      {data?.executive_summary && (
        <div className="px-4 py-3 border-b border-white/[0.06] bg-indigo-500/[0.04]">
          <p className="text-[11px] text-white/55 leading-relaxed">{data.executive_summary}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="m-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="py-12 text-center">
          <Radar size={22} className="text-white/10 mx-auto mb-3" />
          <p className="text-[11px] text-white/20">
            Ejecuta el Radar para generar la Matriz de Decisión
          </p>
          <p className="text-[10px] text-white/12 mt-1">
            Analiza riesgos competitivos · Oportunidades de mercado · Acciones recomendadas
          </p>
        </div>
      )}

      {/* Tabs + content */}
      {data && !loading && (
        <>
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.06]">
            {tabs.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium transition-colors relative ${
                    activeTab === t.id
                      ? `${t.color} border-b-2 border-current -mb-px bg-white/[0.02]`
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <Icon size={11} />
                  {t.label}
                  {t.count !== undefined && (
                    <span className="text-[9px] bg-white/[0.08] px-1.5 py-0.5 rounded-full text-white/40">
                      {t.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'risks' && <RiskMatrix rows={data.risk_matrix} />}
            {activeTab === 'opportunities' && <OpportunityMatrix rows={data.opportunity_matrix} />}
            {activeTab === 'actions' && <ActionTable rows={data.action_table} />}
          </div>
        </>
      )}
    </div>
  )
}
