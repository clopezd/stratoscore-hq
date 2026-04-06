'use client'

import React, { useEffect, useState } from 'react'
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react'

interface Adjustment {
  sku: string
  current_forecast_avg: number
  actual_sales_avg: number
  recommended_adjustment_pct: number
  recommended_adjustment_factor: number
  reason: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  action: 'increase' | 'decrease' | 'maintain'
}

interface AdjustmentsData {
  adjustments: Adjustment[]
  total_skus_analyzed: number
  adjustments_recommended: number
  critical_count: number
  high_count: number
}

export function ForecastAdjustmentsWidget() {
  const [data, setData] = useState<AdjustmentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetch('/api/videndum/forecast-adjustments')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setData(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-400"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-amber-300">No hay recomendaciones disponibles</p>
      </div>
    )
  }

  const { adjustments, critical_count, high_count, adjustments_recommended } = data
  const displayedAdjustments = showAll ? adjustments : adjustments.slice(0, 5)

  if (adjustments.length === 0) {
    return (
      <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-emerald-300">Forecast Óptimo</h3>
        </div>
        <p className="text-xs text-white/60">
          No se detectaron desviaciones significativas (&gt;15%). El modelo está bien calibrado.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Recomendaciones de Ajuste</h3>
        </div>
        {(critical_count > 0 || high_count > 0) && (
          <div className="flex items-center gap-2 text-xs">
            {critical_count > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                {critical_count} críticos
              </span>
            )}
            {high_count > 0 && (
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                {high_count} altos
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-white/50">
        {adjustments_recommended} SKUs requieren ajuste basado en análisis de varianzas
      </p>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedAdjustments.map((adj, i) => (
          <AdjustmentCard key={adj.sku} adjustment={adj} rank={i + 1} />
        ))}
      </div>

      {adjustments.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-xs text-white/50 hover:text-white/70 py-2 rounded-lg hover:bg-white/[0.03] transition-all"
        >
          {showAll ? 'Ver menos' : `Ver todas (${adjustments.length})`}
        </button>
      )}
    </div>
  )
}

function AdjustmentCard({ adjustment, rank }: { adjustment: Adjustment; rank: number }) {
  const priorityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  const ActionIcon = adjustment.action === 'increase' ? TrendingUp : TrendingDown
  const actionColor = adjustment.action === 'increase' ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="bg-white/[0.03] rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white/30">#{rank}</span>
            <p className="text-xs font-mono text-white/90 truncate">{adjustment.sku}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[adjustment.priority]}`}>
              {adjustment.priority}
            </span>
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed">{adjustment.reason}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ActionIcon size={14} className={actionColor} />
          <span className={`text-sm font-mono font-semibold ${actionColor}`}>
            {adjustment.recommended_adjustment_pct > 0 ? '+' : ''}
            {adjustment.recommended_adjustment_pct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06] text-[10px]">
        <div>
          <span className="text-white/40">Forecast actual:</span>
          <span className="text-white/70 ml-1 font-mono">{adjustment.current_forecast_avg}</span>
        </div>
        <ArrowRight size={10} className="text-white/20" />
        <div>
          <span className="text-white/40">Ventas promedio:</span>
          <span className="text-white/70 ml-1 font-mono">{adjustment.actual_sales_avg}</span>
        </div>
        <ArrowRight size={10} className="text-white/20" />
        <div>
          <span className="text-white/40">Factor sugerido:</span>
          <span className={`ml-1 font-mono font-semibold ${actionColor}`}>
            {adjustment.recommended_adjustment_factor}x
          </span>
        </div>
      </div>
    </div>
  )
}
