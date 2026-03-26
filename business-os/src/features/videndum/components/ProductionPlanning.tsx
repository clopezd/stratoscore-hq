'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { Factory, TrendingUp, AlertTriangle, Package, RefreshCw, Target, Search } from 'lucide-react'
import { ForecastAdjustmentsWidget } from './ForecastAdjustmentsWidget'

interface SkuSummary {
  partNumber: string
  catalogType: string | null
  avgMonthlyRevenue: number
  shareOfTotal: number
}

interface Top10Sku extends SkuSummary {
  weeklyWith95Accuracy: number
  orderBook: number
  opportunities: number
}

interface ProductionPlanningData {
  targetSku: {
    partNumber: string
    catalogType: string | null
    avgMonthlyRevenue: number
    orderBook: number
    opportunities: number
    oppUnfactored: number
    projectedDemand3M: number
    shareOfTotal: number
  }
  skuRunRate: {
    weeklyBase: number
    weeklyWith95Accuracy: number
    dailyTarget: number
    safetyFactor: number
    cv: number
  }
  globalContext: {
    avgMonthlyRevenue: number
    totalOrderBook: number
    totalOpportunities: number
    projectedDemand3M: number
    weeklyRunRate: number
  }
  skuHistoricalTrend: Array<{
    period: string
    revenue: number
    weeklyAvg: number
  }>
  top10Skus: Top10Sku[]
  allSkus: SkuSummary[]
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#13131f] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
      <p className="text-white/60 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-medium">{fmt(Number(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: string; sub: string
  icon: React.ReactNode; accent: string
}) {
  return (
    <div className="relative overflow-hidden bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accent}`}>{icon}</div>
      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[11px] mt-0.5 text-white/40">{sub}</p>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ProductionPlanning() {
  const [data, setData] = useState<ProductionPlanningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = (sku?: string) => {
    setLoading(true)
    setError(null)
    const url = sku ? `/api/videndum/production-planning?sku=${sku}` : '/api/videndum/production-planning'

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: unknown) => {
        const j = json as { error?: string } & Partial<ProductionPlanningData>
        if (j.error) throw new Error(j.error)
        setData(j as ProductionPlanningData)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSkuChange = (sku: string) => {
    setSelectedSku(sku)
    setSearchTerm('')
    fetchData(sku)
  }

  if (loading) {
    return (
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <RefreshCw size={12} className="animate-spin" />
          Calculando run rate para todos los SKUs...
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
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
            <p className="text-xs font-medium text-red-300">Error al calcular Production Planning</p>
            <p className="text-[11px] text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { targetSku, skuRunRate, globalContext, skuHistoricalTrend, top10Skus, allSkus } = data

  // Filtrar SKUs por búsqueda
  const filteredSkus = allSkus.filter(sku =>
    sku.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-5 pb-8 text-white">

      {/* Header + Selector de SKU */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package size={18} className="text-cyan-400" />
            Planning
          </h1>
          <p className="text-xs text-cyan-400/80 font-medium mt-1">
            Órdenes de Producción Semanales (CR ↔ UK)
          </p>
          <div className="flex items-start gap-2 mt-2 text-[11px] text-white/40 leading-relaxed">
            <div className="mt-0.5">→</div>
            <p>
              Propuesta CR · Revisión UK · Aprobación final
              <span className="mx-2">·</span>
              95% Planning Accuracy · {allSkus.length} SKUs analizados
            </p>
          </div>
        </div>

        {/* Recomendaciones de Ajuste */}
        <ForecastAdjustmentsWidget />

        <div>
          <h2 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Target size={14} className="text-white/40" />
            Run Rate Semanal por SKU
          </h2>
        </div>

        {/* Selector de SKU */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Search size={14} className="text-white/40" />
            <p className="text-xs font-medium text-white/50">Seleccionar SKU</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar SKU por part number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Dropdown */}
            <select
              value={selectedSku}
              onChange={(e) => handleSkuChange(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 min-w-[200px]"
            >
              <option value="">Top SKU ({allSkus[0]?.partNumber})</option>
              {(searchTerm ? filteredSkus : allSkus).slice(0, 50).map(sku => (
                <option key={sku.partNumber} value={sku.partNumber}>
                  {sku.partNumber} — {sku.shareOfTotal}% ({fmt(sku.avgMonthlyRevenue)}/mes)
                </option>
              ))}
            </select>
          </div>

          {/* SKU seleccionado */}
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-xs">
            <span className="text-white/40">SKU seleccionado:</span>
            <span className="font-mono text-cyan-400">{targetSku.partNumber}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              targetSku.catalogType === 'INV' ? 'bg-blue-500/15 text-blue-400' :
              targetSku.catalogType === 'PKG' ? 'bg-purple-500/15 text-purple-400' :
              'bg-gray-500/15 text-gray-400'
            }`}>
              {targetSku.catalogType}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-emerald-400">{targetSku.shareOfTotal}% del total</span>
          </div>
        </div>
      </div>

      {/* KPIs del SKU */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label={`Run Rate Base — ${targetSku.partNumber}`}
          value={fmt(skuRunRate.weeklyBase)}
          sub={`${fmt(skuRunRate.weeklyBase / 5)} unidades/día base`}
          icon={<Factory size={15} className="text-indigo-300" />}
          accent="bg-indigo-500/10"
        />
        <KpiCard
          label="Run Rate 95% Accuracy"
          value={fmt(skuRunRate.weeklyWith95Accuracy)}
          sub={`${fmt(skuRunRate.dailyTarget)} unidades/día target`}
          icon={<TrendingUp size={15} className="text-emerald-300" />}
          accent="bg-emerald-500/10"
        />
        <KpiCard
          label="Backlog Confirmado"
          value={fmt(targetSku.orderBook)}
          sub={`+ ${fmt(targetSku.opportunities)} opp. ponderadas`}
          icon={<Package size={15} className="text-purple-300" />}
          accent="bg-purple-500/10"
        />
        <KpiCard
          label="Promedio Mensual"
          value={fmt(targetSku.avgMonthlyRevenue)}
          sub={`Demanda 3M: ${fmt(targetSku.projectedDemand3M)}`}
          icon={<Target size={15} className="text-cyan-300" />}
          accent="bg-cyan-500/10"
        />
      </div>

      {/* Top 10 SKUs por venta */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-medium text-white/50">Top 10 SKUs por Venta</p>
          <p className="text-[10px] text-white/25 mt-0.5">Run rate semanal · Share del total · Order book</p>
        </div>

        {/* Gráfico de barras */}
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top10Skus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="partNumber"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <Bar
                dataKey="weeklyWith95Accuracy"
                name="Run Rate Semanal (95%)"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              >
                {top10Skus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.partNumber === targetSku.partNumber ? '#22c55e' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla Top 10 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left px-4 py-2.5 text-white/30 font-medium">#</th>
                <th className="text-left px-4 py-2.5 text-white/30 font-medium">Part Number</th>
                <th className="text-center px-3 py-2.5 text-white/30 font-medium">Cat.</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Run Rate/Semana</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Avg/Mes</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Share %</th>
                <th className="text-right px-4 py-2.5 text-white/30 font-medium">Order Book</th>
              </tr>
            </thead>
            <tbody>
              {top10Skus.map((sku, i) => {
                const isSelected = sku.partNumber === targetSku.partNumber
                return (
                  <tr
                    key={sku.partNumber}
                    className={`border-b border-white/[0.04] transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/[0.02]'
                    }`}
                    onClick={() => handleSkuChange(sku.partNumber)}
                  >
                    <td className="px-4 py-2.5 text-white/40">{i + 1}</td>
                    <td className={`px-4 py-2.5 font-mono ${isSelected ? 'text-emerald-400 font-semibold' : 'text-white/80'}`}>
                      {sku.partNumber}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        sku.catalogType === 'INV' ? 'bg-blue-500/15 text-blue-400' :
                        sku.catalogType === 'PKG' ? 'bg-purple-500/15 text-purple-400' :
                        'bg-gray-500/15 text-gray-400'
                      }`}>
                        {sku.catalogType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-indigo-300 font-bold">{fmt(sku.weeklyWith95Accuracy)}</td>
                    <td className="px-4 py-2.5 text-right text-white/70">{fmt(sku.avgMonthlyRevenue)}</td>
                    <td className="px-4 py-2.5 text-right text-cyan-300">{sku.shareOfTotal}%</td>
                    <td className="px-4 py-2.5 text-right text-purple-300">{fmt(sku.orderBook)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tendencia histórica del SKU seleccionado */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <p className="text-xs font-medium text-white/50 mb-0.5">
          Tendencia Histórica — {targetSku.partNumber} (últimos 12 meses)
        </p>
        <p className="text-[10px] text-white/25 mb-4">
          Revenue mensual real · Promedio semanal
        </p>
        {skuHistoricalTrend.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-white/20">
            Sin datos históricos para este SKU
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={skuHistoricalTrend.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue Mensual"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
              />
              <Line
                type="monotone"
                dataKey="weeklyAvg"
                name="Promedio Semanal"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 2, fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Comparación con contexto global */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <p className="text-xs font-medium text-white/50 mb-3">Contexto Global — Todos los SKUs</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-white/30 mb-1">Revenue Mensual Total</p>
            <p className="text-white font-semibold">{fmt(globalContext.avgMonthlyRevenue)} unidades</p>
            <p className="text-emerald-400 text-[10px] mt-0.5">
              SKU: {fmt(targetSku.avgMonthlyRevenue)} ({targetSku.shareOfTotal}%)
            </p>
          </div>
          <div>
            <p className="text-white/30 mb-1">Order Book Total</p>
            <p className="text-white font-semibold">{fmt(globalContext.totalOrderBook)} unidades</p>
            <p className="text-emerald-400 text-[10px] mt-0.5">
              SKU: {fmt(targetSku.orderBook)} ({((targetSku.orderBook / globalContext.totalOrderBook) * 100).toFixed(1)}%)
            </p>
          </div>
          <div>
            <p className="text-white/30 mb-1">Run Rate Global Semanal</p>
            <p className="text-white font-semibold">{fmt(globalContext.weeklyRunRate)} unidades</p>
            <p className="text-emerald-400 text-[10px] mt-0.5">
              SKU: {fmt(skuRunRate.weeklyWith95Accuracy)} ({((skuRunRate.weeklyWith95Accuracy / globalContext.weeklyRunRate) * 100).toFixed(1)}%)
            </p>
          </div>
          <div>
            <p className="text-white/30 mb-1">Total SKUs Analizados</p>
            <p className="text-white font-semibold">{allSkus.length} productos</p>
            <p className="text-cyan-400 text-[10px] mt-0.5">
              Top 10 concentran {top10Skus.reduce((sum, s) => sum + s.shareOfTotal, 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Factory size={16} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-cyan-300 mb-2">
              Recomendaciones de Planta — {targetSku.partNumber}
            </p>
            <ul className="text-[11px] text-white/70 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Run rate target semanal:</strong> {fmt(skuRunRate.weeklyWith95Accuracy)} unidades
                ({fmt(skuRunRate.dailyTarget)} unidades/día en 5 días laborables)
              </li>
              <li>
                <strong className="text-white">Planning accuracy esperado:</strong> 95% con safety stock incluido
                ({(skuRunRate.safetyFactor * 100).toFixed(1)}% buffer)
              </li>
              <li>
                <strong className="text-white">Participación en planta:</strong> {targetSku.shareOfTotal}% del volumen total
                {targetSku.shareOfTotal > 10 && ' (SKU crítico para la operación)'}
              </li>
              <li>
                <strong className="text-white">Backlog confirmado:</strong> {fmt(targetSku.orderBook)} unidades +
                {fmt(targetSku.opportunities)} en pipeline ponderado
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
