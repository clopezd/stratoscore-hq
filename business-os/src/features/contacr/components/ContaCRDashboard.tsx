'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, FileText, Upload } from 'lucide-react'
import { useContaCRStore } from '../store'
import { fetchDashboard, formatCRC, formatDate } from '../services/movimientos'
import type { CategoriaSummary, TendenciaMensual } from '../types'
import { useRouter } from 'next/navigation'

const CATEGORY_COLORS = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444',
  '#10b981', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
]

export function ContaCRDashboard() {
  const { empresaActiva } = useContaCRStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ totalIngresos: 0, totalGastos: 0, balance: 0, movimientosCount: 0 })
  const [categorias, setCategorias] = useState<{ ingresos: CategoriaSummary[]; gastos: CategoriaSummary[] }>({ ingresos: [], gastos: [] })
  const [tendencia, setTendencia] = useState<TendenciaMensual[]>([])

  useEffect(() => {
    if (!empresaActiva) { setLoading(false); return }
    setLoading(true)
    fetchDashboard(empresaActiva.id)
      .then((data) => {
        setKpis(data.kpis)
        setCategorias(data.categorias)
        setTendencia(data.tendencia)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaActiva])

  if (!empresaActiva) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
          <FileText size={28} className="text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Bienvenido a ContaCR</h2>
        <p className="text-white/50 text-sm max-w-md mb-6">
          Crea tu primera empresa para empezar a gestionar la contabilidad.
          Usa el selector de empresa en la parte superior.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/[0.04] animate-pulse" />
      </div>
    )
  }

  const isEmpty = kpis.movimientosCount === 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard title="Ingresos" value={formatCRC(kpis.totalIngresos)} icon={<TrendingUp size={20} />} color="emerald" />
        <KPICard title="Gastos" value={formatCRC(kpis.totalGastos)} icon={<TrendingDown size={20} />} color="red" />
        <KPICard title="Balance" value={formatCRC(kpis.balance)} icon={<Wallet size={20} />} color={kpis.balance >= 0 ? 'blue' : 'red'} />
        <KPICard title="Movimientos" value={kpis.movimientosCount.toString()} icon={<FileText size={20} />} color="purple" />
      </div>

      {isEmpty ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 text-center">
          <Upload size={32} className="text-white/20 mx-auto mb-3" />
          <h3 className="text-white/70 font-medium mb-1">Sin movimientos</h3>
          <p className="text-white/40 text-sm mb-4">Importa un CSV para ver el resumen financiero</p>
          <button
            onClick={() => router.push('/contacr/importar')}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
          >
            Importar CSV
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Tendencia mensual */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Tendencia mensual</h3>
            <div className="space-y-2">
              {tendencia.slice(-6).map((t) => {
                const max = Math.max(...tendencia.map((x) => Math.max(x.ingresos, x.gastos))) || 1
                return (
                  <div key={t.mes} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{t.mes}</span>
                      <span className="text-emerald-400">{formatCRC(t.ingresos)}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div
                        className="bg-emerald-500/60 rounded-full"
                        style={{ width: `${(t.ingresos / max) * 100}%` }}
                      />
                      <div
                        className="bg-red-500/60 rounded-full"
                        style={{ width: `${(t.gastos / max) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-red-400">{formatCRC(t.gastos)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Distribución de gastos */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-medium text-white/70 mb-4">Top categorías de gasto</h3>
            <div className="space-y-3">
              {categorias.gastos.slice(0, 8).map((cat, i) => (
                <div key={cat.categoria} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-xs text-white/60 flex-1 truncate">{cat.categoria}</span>
                  <span className="text-xs font-medium text-white/80">{formatCRC(cat.total)}</span>
                  <span className="text-[10px] text-white/30 w-10 text-right">{cat.porcentaje.toFixed(0)}%</span>
                </div>
              ))}
              {categorias.gastos.length === 0 && (
                <p className="text-white/30 text-xs">Sin datos de categorías</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 transition-all hover:bg-white/[0.05]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40">{title}</span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-lg md:text-xl font-bold text-white">{value}</p>
    </div>
  )
}
