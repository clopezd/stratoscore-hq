'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { DateSegmentors } from './DateSegmentors'

interface AccuracyMetrics {
  mape: number
  rmse: number
  bias: number
  total_forecast: number
  total_real: number
  records_compared: number
}

interface ProductAnalysis {
  sku: string
  mape: number
  total_forecast: number
  total_real: number
  variance_pct: number
  records: number
  accuracy_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

interface ForecastAccuracyData {
  global_metrics: AccuracyMetrics
  top_worst_products: ProductAnalysis[]
  top_best_products: ProductAnalysis[]
  total_products_analyzed: number
}

export function ForecastAccuracy() {
  const [data, setData] = useState<ForecastAccuracyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    params.append('top', '10')
    if (selectedYear) params.append('year', selectedYear.toString())
    if (selectedMonth) params.append('month', selectedMonth.toString())

    setLoading(true)
    fetch(`/api/videndum/forecast-vs-real?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setData(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedYear, selectedMonth])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/videndum/forecast-vs-real/export')
      if (!res.ok) throw new Error('Error al exportar')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Videndum_ForecastVsReal_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error al exportar: ' + (e instanceof Error ? e.message : 'Error desconocido'))
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-6">
        <p className="text-sm text-red-300">Error: {error ?? 'No se pudo cargar el análisis'}</p>
      </div>
    )
  }

  const { global_metrics, top_worst_products, top_best_products, total_products_analyzed } = data

  // Interpretación de MAPE
  const mapeGrade = global_metrics.mape < 10 ? 'Excelente' :
                    global_metrics.mape < 20 ? 'Bueno' :
                    global_metrics.mape < 30 ? 'Aceptable' :
                    global_metrics.mape < 50 ? 'Pobre' : 'Muy Pobre'

  const mapeColor = global_metrics.mape < 10 ? 'text-emerald-400' :
                    global_metrics.mape < 20 ? 'text-green-400' :
                    global_metrics.mape < 30 ? 'text-amber-400' :
                    global_metrics.mape < 50 ? 'text-orange-400' : 'text-red-400'

  const biasIcon = global_metrics.bias > 0 ? TrendingUp : TrendingDown
  const biasLabel = global_metrics.bias > 0 ? 'Sobre-forecast' : 'Sub-forecast'
  const biasColor = Math.abs(global_metrics.bias) < 5 ? 'text-green-400' : 'text-amber-400'

  return (
    <div className="space-y-6">
      {/* Segmentadores de Fecha */}
      <DateSegmentors
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Métricas globales */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Precisión del Forecast vs Ventas Reales</h2>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={12} />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* MAPE */}
          <div className="bg-white/[0.03] rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">MAPE (Error %)</p>
            <p className={`text-2xl font-bold font-mono ${mapeColor}`}>{global_metrics.mape.toFixed(1)}%</p>
            <p className="text-xs text-white/50 mt-1">{mapeGrade}</p>
          </div>

          {/* RMSE */}
          <div className="bg-white/[0.03] rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">RMSE</p>
            <p className="text-2xl font-bold font-mono text-white/80">{global_metrics.rmse.toFixed(0)}</p>
            <p className="text-xs text-white/50 mt-1">Desv. estándar</p>
          </div>

          {/* Bias */}
          <div className="bg-white/[0.03] rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">Sesgo (Bias)</p>
            <div className="flex items-center gap-1.5">
              {React.createElement(biasIcon, { size: 16, className: biasColor })}
              <p className={`text-2xl font-bold font-mono ${biasColor}`}>{Math.abs(global_metrics.bias).toFixed(0)}</p>
            </div>
            <p className="text-xs text-white/50 mt-1">{biasLabel}</p>
          </div>

          {/* Comparaciones */}
          <div className="bg-white/[0.03] rounded-lg p-4">
            <p className="text-xs text-white/40 mb-1">SKUs analizados</p>
            <p className="text-2xl font-bold font-mono text-white/80">{total_products_analyzed}</p>
            <p className="text-xs text-white/50 mt-1">{global_metrics.records_compared} registros</p>
          </div>
        </div>

        {/* Totales */}
        <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Total Forecast</p>
            <p className="text-lg font-mono text-white/80">{global_metrics.total_forecast.toLocaleString()} und</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Total Ventas Reales</p>
            <p className="text-lg font-mono text-white/80">{global_metrics.total_real.toLocaleString()} und</p>
          </div>
        </div>
      </div>

      {/* Productos con mayor desviación */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Peores 10 */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <h3 className="text-xs font-semibold text-white">Top 10 Peor Precisión</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {top_worst_products.map((p, i) => (
              <ProductCard key={p.sku} product={p} rank={i + 1} type="worst" />
            ))}
          </div>
        </div>

        {/* Mejores 10 */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <h3 className="text-xs font-semibold text-white">Top 10 Mejor Precisión</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {top_best_products.map((p, i) => (
              <ProductCard key={p.sku} product={p} rank={i + 1} type="best" />
            ))}
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-amber-300">💡 Recomendaciones de Ajuste</h3>
        <ul className="space-y-2 text-xs text-white/70">
          {global_metrics.mape > 20 && (
            <li>• <strong>MAPE alto ({global_metrics.mape.toFixed(1)}%):</strong> Revisar modelo de forecast para SKUs con grade D/F</li>
          )}
          {Math.abs(global_metrics.bias) > 10 && (
            <li>• <strong>Sesgo significativo:</strong> Ajustar factores de {global_metrics.bias > 0 ? 'reducción' : 'incremento'} en forecast</li>
          )}
          {top_worst_products.length > 5 && (
            <li>• <strong>Múltiples SKUs problemáticos:</strong> Considerar re-entrenar modelo ML con datos recientes</li>
          )}
          <li>• <strong>Siguiente paso:</strong> Usar varianzas para ajustar planning de producción en próximos meses</li>
        </ul>
      </div>
    </div>
  )
}

function ProductCard({ product, rank, type }: { product: ProductAnalysis; rank: number; type: 'worst' | 'best' }) {
  const gradeColors = {
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    B: 'bg-green-500/20 text-green-400 border-green-500/30',
    C: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    F: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const varianceIcon = product.variance_pct > 0 ? TrendingUp : TrendingDown
  const varianceColor = Math.abs(product.variance_pct) < 10 ? 'text-green-400' :
                        Math.abs(product.variance_pct) < 20 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="bg-white/[0.03] rounded-lg p-3 flex items-center gap-3">
      <div className="text-xs text-white/30 w-6 shrink-0">#{rank}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-white/90 truncate">{product.sku}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${gradeColors[product.accuracy_grade]}`}>
            {product.accuracy_grade}
          </span>
          <span className="text-[10px] text-white/40">MAPE {product.mape.toFixed(1)}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {React.createElement(varianceIcon, { size: 12, className: varianceColor })}
        <span className={`text-xs font-mono ${varianceColor}`}>
          {product.variance_pct > 0 ? '+' : ''}{product.variance_pct.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
