'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useVidendumDashboard } from '../hooks/useVidendumDashboard'
import { FilterBar } from './FilterBar'
import { MetricCards } from './MetricCards'
import { TopPartsTable } from './TopPartsTable'
import { RefreshCw } from 'lucide-react'

// Lazy load componentes pesados con Recharts
const RevenueChart = dynamic(() => import('./RevenueChart').then(m => ({ default: m.RevenueChart })), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
})

const SeasonalityChart = dynamic(() => import('./SeasonalityChart').then(m => ({ default: m.SeasonalityChart })), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
})

const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })), {
  ssr: false,
  loading: () => <div className="h-96 rounded-xl bg-vid-raised animate-pulse" />
})

const VarianceChart = dynamic(() => import('./VarianceChart').then(m => ({ default: m.VarianceChart })), {
  ssr: false,
  loading: () => <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
})

const AnalysisPanel = dynamic(() => import('./AnalysisPanel').then(m => ({ default: m.AnalysisPanel })), {
  ssr: false
})


const ExecutiveSummary = dynamic(() => import('@/features/dashboard/components/ExecutiveSummary').then(m => ({ default: m.ExecutiveSummary })), {
  ssr: false
})


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-vid-subtle uppercase tracking-widest mb-3 px-0.5">
      {children}
    </p>
  )
}

export function VidendumDashboard() {
  const [mounted, setMounted] = useState(false)
  const { data, loading, error, filters, setCatalogType, setYearRange } = useVidendumDashboard()

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full text-vid-fg">

      {/* Header + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-vid-fg">Videndum — Histórico de Ventas</h1>
          <p className="text-xs text-vid-subtle mt-0.5">Revenue · Order Intake · 2020–2025 · 20,197 registros</p>
        </div>
        <FilterBar
          filters={filters}
          onYearRange={setYearRange}
          onCatalogType={setCatalogType}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-vid-muted">
          <RefreshCw size={12} className="animate-spin" />
          Cargando datos...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-500 dark:text-red-300">
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
            <SectionLabel>Analytics · Full Context</SectionLabel>
            <AnalyticsDashboard />
          </div>

          {/* Variance forecast vs actual */}
          <VarianceChart />

          {/* Resumen Ejecutivo */}
          <div>
            <SectionLabel>Resumen Ejecutivo · Forecast vs Revenue</SectionLabel>
            <ExecutiveSummary />
          </div>

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
              <div key={i} className="h-24 rounded-xl bg-vid-raised animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
            <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
          </div>
          <div className="h-64 rounded-xl bg-vid-raised animate-pulse" />
        </div>
      )}

    </div>
  )
}
