'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  Star,
  BarChart3,
  ChevronDown,
} from 'lucide-react'

type Period = '7d' | '30d' | '90d'

const PERIOD_LABEL: Record<Period, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
}

const MOCK_METRICS: Record<Period, {
  ingresos: string
  ordenes: number
  ticket_promedio: string
  tiempo_promedio: string
  satisfaccion: string
  entregas_en_tiempo: string
}> = {
  '7d': {
    ingresos: '$18,450',
    ordenes: 64,
    ticket_promedio: '$288',
    tiempo_promedio: '3.2 hrs',
    satisfaccion: '4.8 / 5',
    entregas_en_tiempo: '94%',
  },
  '30d': {
    ingresos: '$74,200',
    ordenes: 258,
    ticket_promedio: '$287',
    tiempo_promedio: '3.5 hrs',
    satisfaccion: '4.7 / 5',
    entregas_en_tiempo: '91%',
  },
  '90d': {
    ingresos: '$210,800',
    ordenes: 742,
    ticket_promedio: '$284',
    tiempo_promedio: '3.6 hrs',
    satisfaccion: '4.7 / 5',
    entregas_en_tiempo: '89%',
  },
}

// Mini sparkline bar data (mock percentages)
const BAR_DATA: Record<Period, number[]> = {
  '7d':  [55, 70, 45, 80, 90, 65, 85],
  '30d': [40, 55, 60, 45, 70, 80, 65, 75, 55, 85, 60, 70, 50, 65, 80, 45, 75, 90, 55, 65, 70, 85, 60, 75, 80, 55, 65, 70, 85, 90],
  '90d': [50, 60, 55, 65, 70, 75, 65, 80, 70, 85, 75, 90, 65, 70, 80, 75, 65, 70, 85, 80, 75, 65, 70, 80, 85, 75, 80, 70, 65, 75],
}

const STATUS_BREAKDOWN = [
  { label: 'Entregados',  value: 82, color: 'bg-green-400' },
  { label: 'En ruta',     value: 8,  color: 'bg-purple-400' },
  { label: 'En proceso',  value: 6,  color: 'bg-blue-400' },
  { label: 'Pendientes',  value: 4,  color: 'bg-yellow-400' },
]

export default function ReportesPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const metrics = MOCK_METRICS[period]
  const bars = BAR_DATA[period]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-[#8B949E] hover:text-[#E0EDE0] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00F2FE]" />
          <h1 className="text-xl font-bold">Reportes</h1>
        </div>

        {/* Period selector */}
        <div className="ml-auto relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="appearance-none bg-gray-900/60 border border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-sm text-[#E0EDE0] focus:outline-none focus:border-[#00F2FE]/50 transition-colors cursor-pointer"
          >
            {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
              <option key={p} value={p}>{PERIOD_LABEL[p]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E] pointer-events-none" />
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Ingresos totales"
            value={metrics.ingresos}
            sub="+12% vs periodo anterior"
            trend="up"
          />
          <KpiCard
            icon={<Package className="w-5 h-5" />}
            label="Órdenes"
            value={metrics.ordenes.toString()}
            sub="+8% vs periodo anterior"
            trend="up"
          />
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Ticket promedio"
            value={metrics.ticket_promedio}
            sub="Por orden"
          />
          <KpiCard
            icon={<Clock className="w-5 h-5" />}
            label="Tiempo promedio"
            value={metrics.tiempo_promedio}
            sub="De recepción a entrega"
          />
          <KpiCard
            icon={<Star className="w-5 h-5" />}
            label="Satisfacción"
            value={metrics.satisfaccion}
            sub="Calificación clientes"
            trend="up"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Entregas a tiempo"
            value={metrics.entregas_en_tiempo}
            sub="Del total de órdenes"
            trend="up"
          />
        </div>

        {/* Revenue Chart (placeholder) */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-sm">Ingresos por día</h2>
              <p className="text-xs text-[#8B949E] mt-0.5">{PERIOD_LABEL[period]}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#8B949E]" />
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1 h-32">
            {bars.map((pct, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-[#00F2FE]/25 hover:bg-[#00F2FE]/50 transition-colors cursor-pointer"
                style={{ height: `${pct}%` }}
                title={`Día ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-700">
            <span>Día 1</span>
            <span>Día {bars.length}</span>
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Distribución de órdenes por estado</h2>
          <div className="space-y-3">
            {STATUS_BREAKDOWN.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B949E]">{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top drivers */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Top conductores — {PERIOD_LABEL[period]}</h2>
          <div className="space-y-2">
            {[
              { nombre: 'Marco Díaz',    entregas: 55, calificacion: '4.9' },
              { nombre: 'Luis Herrera',  entregas: 47, calificacion: '4.8' },
              { nombre: 'Ana Rivas',     entregas: 39, calificacion: '4.7' },
              { nombre: 'Sandra Cruz',   entregas: 28, calificacion: '4.6' },
            ].map((d, i) => (
              <div key={d.nombre} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-b-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-800 text-[#8B949E]'
                }`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{d.nombre}</span>
                <span className="text-xs text-[#8B949E]">{d.entregas} entregas</span>
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                  <Star className="w-3 h-3 fill-yellow-400" /> {d.calificacion}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-700 pb-2">
          Datos de ejemplo — conecta Supabase para métricas reales
        </p>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down'
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="text-[#00F2FE] mb-2">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-[#8B949E] mt-0.5">{label}</p>
      {sub && (
        <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-600'}`}>
          {sub}
        </p>
      )}
    </div>
  )
}
