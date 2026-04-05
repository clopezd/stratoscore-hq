'use client'

import { useState, useEffect } from 'react'
import { useContaCRStore } from '../store'
import { fetchMovimientos, formatCRC, formatDate } from '../services/movimientos'
import type { Movimiento } from '../types'

export function MovimientosTable() {
  const { empresaActiva } = useContaCRStore()
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'gasto'>('todos')

  useEffect(() => {
    if (!empresaActiva) return
    setLoading(true)
    fetchMovimientos(empresaActiva.id)
      .then(setMovimientos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [empresaActiva])

  const filtered = filtroTipo === 'todos'
    ? movimientos
    : movimientos.filter((m) => m.tipo === filtroTipo)

  if (!empresaActiva) return null

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-medium text-white/70">
          Movimientos <span className="text-white/30">({filtered.length})</span>
        </h3>
        <div className="flex gap-1">
          {(['todos', 'ingreso', 'gasto'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filtroTipo === t
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'ingreso' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="h-6 w-32 mx-auto bg-white/[0.04] animate-pulse rounded" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-white/30 text-sm">Sin movimientos</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-2.5 text-left text-white/40 font-medium">Fecha</th>
                <th className="px-4 py-2.5 text-left text-white/40 font-medium">Descripción</th>
                <th className="px-4 py-2.5 text-left text-white/40 font-medium">Categoría</th>
                <th className="px-4 py-2.5 text-left text-white/40 font-medium">Tipo</th>
                <th className="px-4 py-2.5 text-right text-white/40 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-white/50 whitespace-nowrap">{formatDate(m.fecha)}</td>
                  <td className="px-4 py-2.5 text-white/70 max-w-[200px] truncate">{m.descripcion}</td>
                  <td className="px-4 py-2.5 text-white/40">{m.categoria || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      m.tipo === 'ingreso'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${
                    m.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{formatCRC(m.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
