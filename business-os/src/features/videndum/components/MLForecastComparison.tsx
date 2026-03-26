'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, AlertTriangle, RefreshCw, Brain, Target, ChevronDown } from 'lucide-react'

interface ComparisonRow {
  sku: string
  week: string
  week_start_date: string
  ml_prediction: number
  ml_confidence_low: number
  ml_confidence_high: number
  historical_avg: number | null
  uk_forecast: number | null
  real_demand: number | null
  deviation_pct: number | null
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#13131f] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
      <p className="text-white/60 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-medium">{fmt(Number(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

export function MLForecastComparison() {
  const [data, setData] = useState<ComparisonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<string>('')
  const [availableSkus, setAvailableSkus] = useState<string[]>([])

  const fetchData = async (sku?: string) => {
    setLoading(true)
    setError(null)

    const url = sku
      ? `/api/videndum/ml-forecast?mode=comparison&sku=${sku}&weeks=8`
      : `/api/videndum/ml-forecast?mode=comparison`

    try {
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`)

      const forecasts: ComparisonRow[] = json.forecasts || []
      setData(forecasts)

      // Extraer SKUs únicos
      if (!sku) {
        const skus = Array.from(new Set(forecasts.map(f => f.sku)))
        setAvailableSkus(skus)
        if (skus.length > 0 && !selectedSku) {
          setSelectedSku(skus[0])
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSku) {
      fetchData(selectedSku)
    }
  }, [selectedSku])

  // Filtrar datos del SKU seleccionado
  const skuData = selectedSku ? data.filter(d => d.sku === selectedSku) : data.slice(0, 8)

  // Preparar datos para el chart
  const chartData = skuData.map(d => ({
    week: d.week,
    'ML Forecast': d.ml_prediction,
    'Histórico (12m avg)': d.historical_avg,
    'UK Forecast': d.uk_forecast,
    'Real Demand': d.real_demand,
    'ML Low (95%)': d.ml_confidence_low,
    'ML High (95%)': d.ml_confidence_high,
  }))

  // Calcular métricas
  const avgDeviation = skuData.length > 0
    ? skuData.reduce((sum, d) => sum + Math.abs(d.deviation_pct || 0), 0) / skuData.length
    : 0

  const hasUKForecast = skuData.some(d => d.uk_forecast !== null)
  const hasRealDemand = skuData.some(d => d.real_demand !== null)

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <RefreshCw size={12} className="animate-spin" />
          Cargando predicciones ML...
        </div>
        <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-red-300">Error al cargar ML Forecast</p>
            <p className="text-[11px] text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-5">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <Brain size={20} className="text-amber-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-amber-300">No hay predicciones ML disponibles</p>
          <p className="text-[11px] text-amber-400/70 mt-1">
            Ejecuta <code className="bg-white/5 px-1.5 py-0.5 rounded">ml-forecast/run_forecast.sh</code> primero
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-5 pb-8 text-white">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain size={18} className="text-indigo-400" />
          ML Forecast
        </h1>
        <p className="text-xs text-indigo-400/80 font-medium mt-1">
          Análisis Predictivo del Modelo
        </p>
        <div className="flex items-start gap-2 mt-2 text-[11px] text-white/40 leading-relaxed">
          <div className="mt-0.5">→</div>
          <p>
            Predicciones Prophet · Solo lectura · Diagnóstico del modelo
            <span className="mx-2">·</span>
            Tendencias + estacionalidad automática
          </p>
        </div>
      </div>

      {/* Selector de SKU */}
      {availableSkus.length > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
          <label className="text-xs text-white/40 block mb-2">SKU Seleccionado:</label>
          <div className="relative">
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-indigo-500/50 pr-8"
            >
              {availableSkus.map(sku => (
                <option key={sku} value={sku}>{sku}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>
      )}

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">ML Prediction (próx semana)</p>
          <p className="text-xl font-bold text-indigo-400">{fmt(chartData[0]?.['ML Forecast'] || 0)}</p>
          <p className="text-[10px] text-white/30 mt-0.5">
            ±{fmt((chartData[0]?.['ML High (95%)'] || 0) - (chartData[0]?.['ML Forecast'] || 0))} (95% CI)
          </p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Histórico Prom. (12m)</p>
          <p className="text-xl font-bold text-cyan-400">{fmt(chartData[0]?.['Histórico (12m avg)'] || 0)}</p>
          <p className="text-[10px] text-white/30 mt-0.5">Semanal (mensual / 4.33)</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Desviación Promedio</p>
          <p className={`text-xl font-bold ${Math.abs(avgDeviation) > 20 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {avgDeviation > 0 ? '+' : ''}{avgDeviation.toFixed(1)}%
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">ML vs. Histórico</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Semanas Forecast</p>
          <p className="text-xl font-bold text-white">{skuData.length}</p>
          <p className="text-[10px] text-white/30 mt-0.5">Modelo: Prophet v1.0</p>
        </div>
      </div>

      {/* Gráfico comparativo */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <p className="text-xs font-medium text-white/50 mb-4">
          Comparación Semanal — {selectedSku || 'Top SKUs'}
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />

            {/* Líneas */}
            <Line
              type="monotone"
              dataKey="ML Forecast"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, fill: '#6366f1' }}
            />
            <Line
              type="monotone"
              dataKey="Histórico (12m avg)"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#06b6d4' }}
            />
            {hasUKForecast && (
              <Line
                type="monotone"
                dataKey="UK Forecast"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            )}
            {hasRealDemand && (
              <Line
                type="monotone"
                dataKey="Real Demand"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#22c55e' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Leyenda explicativa */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mt-0.5 shrink-0" />
            <div>
              <p className="text-white/70 font-medium">ML Forecast (Prophet)</p>
              <p className="text-white/35 text-[10px]">Tendencia + estacionalidad automática</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full mt-0.5 shrink-0" />
            <div>
              <p className="text-white/70 font-medium">Histórico (12 meses)</p>
              <p className="text-white/35 text-[10px]">Promedio mensual / 4.33 semanas</p>
            </div>
          </div>
          {hasUKForecast && (
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full mt-0.5 shrink-0" />
              <div>
                <p className="text-white/70 font-medium">UK Forecast (Sede)</p>
                <p className="text-white/35 text-[10px]">Cuando esté disponible</p>
              </div>
            </div>
          )}
          {hasRealDemand && (
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-0.5 shrink-0" />
              <div>
                <p className="text-white/70 font-medium">Real Demand</p>
                <p className="text-white/35 text-[10px]">Demanda real post-facto</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-medium text-white/50">Detalle por Semana</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-4 py-2.5 text-white/30 font-medium">Semana</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">ML Forecast</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Rango 95%</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Histórico</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Δ %</th>
                {hasUKForecast && (
                  <th className="text-right px-4 py-2.5 text-white/30 font-medium">UK</th>
                )}
                {hasRealDemand && (
                  <th className="text-right px-4 py-2.5 text-white/30 font-medium">Real</th>
                )}
              </tr>
            </thead>
            <tbody>
              {skuData.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 font-mono text-white/70">{row.week}</td>
                  <td className="px-4 py-2.5 text-right text-indigo-300 font-bold">{fmt(row.ml_prediction)}</td>
                  <td className="px-4 py-2.5 text-right text-white/40 text-[10px]">
                    [{fmt(row.ml_confidence_low)} – {fmt(row.ml_confidence_high)}]
                  </td>
                  <td className="px-4 py-2.5 text-right text-cyan-300">
                    {row.historical_avg ? fmt(row.historical_avg) : '—'}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-medium ${
                    Math.abs(row.deviation_pct || 0) > 20 ? 'text-orange-400' :
                    Math.abs(row.deviation_pct || 0) > 10 ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {row.deviation_pct !== null ? `${row.deviation_pct > 0 ? '+' : ''}${row.deviation_pct}%` : '—'}
                  </td>
                  {hasUKForecast && (
                    <td className="px-4 py-2.5 text-right text-amber-300">
                      {row.uk_forecast ? fmt(row.uk_forecast) : '—'}
                    </td>
                  )}
                  {hasRealDemand && (
                    <td className="px-4 py-2.5 text-right text-emerald-300 font-bold">
                      {row.real_demand ? fmt(row.real_demand) : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Callout informativo */}
      <div className="bg-gradient-to-r from-indigo-500/[0.08] to-violet-500/[0.08] border border-indigo-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Target size={16} className="text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-indigo-200/90 space-y-2">
            <p>
              <span className="font-semibold text-indigo-300">Cómo leer esto:</span>{' '}
              El <strong>ML Forecast</strong> usa Prophet (Meta) para detectar tendencias y estacionalidad automáticamente.
              Si la desviación vs. histórico es {'>'}20%, puede indicar cambio de régimen (competencia, nuevo producto, etc.).
            </p>
            <p className="text-indigo-200/70">
              <strong>Próximos pasos:</strong> Cuando tengas forecast UK y demanda real semanal, súbelos para validar
              accuracy del modelo y entrenar con datos reales.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
