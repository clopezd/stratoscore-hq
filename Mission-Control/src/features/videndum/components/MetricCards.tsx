'use client'

import { TrendingUp, TrendingDown, Activity, BarChart2, Calendar } from 'lucide-react'
import type { VidendumKPIs } from '../types'

const MONTH_NAMES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

interface CardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  accent: string
  trend?: 'up' | 'down' | 'neutral'
}

function Card({ label, value, sub, icon, accent, trend }: CardProps) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
  return (
    <div className={`relative overflow-hidden bg-white/[0.04] border border-white/[0.07] rounded-xl p-4`}>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className={`inline-flex p-2 rounded-lg mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-2xl font-bold text-white`}>{value}</p>
      <p className={`text-[11px] mt-0.5 ${trendColor}`}>{sub}</p>
    </div>
  )
}

export function MetricCards({ kpis }: { kpis: VidendumKPIs }) {
  const cagrTrend = kpis.cagr_pct > 5 ? 'up' : kpis.cagr_pct < 0 ? 'down' : 'neutral'
  const b2bTrend  = kpis.avg_b2b >= 1 ? 'up' : 'down'
  const cvTrend   = kpis.cv_pct < 15 ? 'up' : kpis.cv_pct > 30 ? 'down' : 'neutral'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Revenue total"
        value={fmt(kpis.total_revenue)}
        sub={`${kpis.year_from}–${kpis.year_to}`}
        icon={<BarChart2 size={15} className="text-indigo-300" />}
        accent="bg-indigo-500/10"
        trend="neutral"
      />
      <Card
        label="CAGR"
        value={`${kpis.cagr_pct > 0 ? '+' : ''}${kpis.cagr_pct}%`}
        sub="crecimiento anual compuesto"
        icon={kpis.cagr_pct >= 0
          ? <TrendingUp size={15} className="text-emerald-300" />
          : <TrendingDown size={15} className="text-red-300" />}
        accent={kpis.cagr_pct >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        trend={cagrTrend}
      />
      <Card
        label="Book-to-Bill"
        value={kpis.avg_b2b.toFixed(2)}
        sub={kpis.avg_b2b >= 1 ? 'demanda creciente' : 'consumiendo backlog'}
        icon={<Activity size={15} className={kpis.avg_b2b >= 1 ? "text-emerald-300" : "text-amber-300"} />}
        accent={kpis.avg_b2b >= 1 ? "bg-emerald-500/10" : "bg-amber-500/10"}
        trend={b2bTrend}
      />
      <Card
        label="Volatilidad (CV)"
        value={`${kpis.cv_pct}%`}
        sub={kpis.cv_pct < 15 ? 'baja · pico: ' + MONTH_NAMES[kpis.peak_month] : kpis.cv_pct < 30 ? 'moderada · pico: ' + MONTH_NAMES[kpis.peak_month] : 'alta · pico: ' + MONTH_NAMES[kpis.peak_month]}
        icon={<Calendar size={15} className="text-purple-300" />}
        accent="bg-purple-500/10"
        trend={cvTrend}
      />
    </div>
  )
}
