'use client'

import { useEffect, useState } from 'react'
import { useVidendumDashboard } from '../hooks/useVidendumDashboard'
import { FilterBar } from './FilterBar'
import { MetricCards } from './MetricCards'
import { RevenueChart } from './RevenueChart'
import { SeasonalityChart } from './SeasonalityChart'
import { TopPartsTable } from './TopPartsTable'
import { VarianceChart } from './VarianceChart'
import { AnalysisPanel } from './AnalysisPanel'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { RefreshCw } from 'lucide-react'

export function VidendumDashboard() {
  const [mounted, setMounted] = useState(false)
  const { data, loading, error, filters, setCatalogType, setYearRange } = useVidendumDashboard()

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full text-white">

      {/* Header + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-white">Videndum — Histórico de Ventas</h1>
          <p className="text-xs text-white/35 mt-0.5">Revenue · Order Intake · 2020–2025 · 20,197 registros</p>
        </div>
        <FilterBar
          filters={filters}
          onYearRange={setYearRange}
          onCatalogType={setCatalogType}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-white/30">
          <RefreshCw size={12} className="animate-spin" />
          Cargando datos...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300">
          Error al cargar datos: {error}
        </div>
      )}

      {/* Contenido */}
      {!loading && !error && data && mounted && (
        <>
          {/* KPI Cards */}
          <MetricCards kpis={data.kpis} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueChart data={data.annual} />
            <SeasonalityChart data={data.seasonality} />
          </div>

          {/* Analytics: Revenue vs Intake mensual + Pipeline + KPIs */}
          <div>
            <p className="text-[11px] text-white/25 uppercase tracking-widest mb-3 px-0.5">Analytics · Full Context</p>
            <AnalyticsDashboard />
          </div>

          {/* Variance forecast vs actual */}
          <VarianceChart />

          {/* Análisis IA */}
          <AnalysisPanel />

          {/* Top Parts */}
          <TopPartsTable data={data.top_parts} />
        </>
      )}

      {/* Skeleton mientras monta */}
      {!mounted && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
            <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
          </div>
          <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
        </div>
      )}

    </div>
  )
}
