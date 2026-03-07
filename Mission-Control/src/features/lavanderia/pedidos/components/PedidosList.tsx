'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCcOrdersAll, updateCcOrderStatus } from '../services/pedidosService'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABEL: Record<CcOrderStatus, string> = {
  pendiente:      'Pendiente',
  recogido:       'Recogido',
  en_preparacion: 'En Preparación',
  en_camino:      'En Camino',
  entregado:      'Entregado',
}

const STATUS_STYLE: Record<CcOrderStatus, string> = {
  pendiente:      'bg-amber-100 text-amber-800',
  recogido:       'bg-purple-100 text-purple-800',
  en_preparacion: 'bg-sky-100 text-sky-800',
  en_camino:      'bg-orange-100 text-orange-800',
  entregado:      'bg-emerald-100 text-emerald-800',
}

const FILTER_BUTTONS: { valor: CcOrderStatus | 'todos'; etiqueta: string; color: string }[] = [
  { valor: 'todos',          etiqueta: 'Todos',          color: 'bg-gray-100 text-gray-700' },
  { valor: 'pendiente',      etiqueta: 'Pendiente',      color: 'bg-amber-100 text-amber-800' },
  { valor: 'recogido',       etiqueta: 'Recogido',       color: 'bg-purple-100 text-purple-800' },
  { valor: 'en_preparacion', etiqueta: 'En Preparación', color: 'bg-sky-100 text-sky-800' },
  { valor: 'en_camino',      etiqueta: 'En Camino',      color: 'bg-orange-100 text-orange-800' },
  { valor: 'entregado',      etiqueta: 'Entregado',      color: 'bg-emerald-100 text-emerald-800' },
]

interface Props {
  refreshKey?: number
}

export function PedidosList({ refreshKey }: Props) {
  const [pedidos, setPedidos] = useState<CcOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<CcOrderStatus | 'todos'>('todos')

  const fetchPedidos = useCallback(async () => {
    try {
      const data = await getCcOrdersAll()
      setPedidos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos, refreshKey])

  if (loading) return <p className="text-sm text-gray-500">Cargando pedidos...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  async function handleStatusChange(id: string, status: CcOrderStatus) {
    setUpdatingId(id)
    try {
      await updateCcOrderStatus(id, status)
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      )
    } catch {
      // el estado visual no cambia si falla
    } finally {
      setUpdatingId(null)
    }
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter((p) => p.status === filtro)

  const conteo = (s: CcOrderStatus) => pedidos.filter((p) => p.status === s).length

  if (pedidos.length === 0) {
    return (
      <p className="text-sm text-gray-500">No hay pedidos registrados aún.</p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTER_BUTTONS.map(({ valor, etiqueta, color }) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-opacity ${color} ${
              filtro === valor ? 'ring-2 ring-offset-1 ring-current' : 'opacity-60 hover:opacity-90'
            }`}
          >
            {etiqueta}
            <span className="rounded-full bg-white/60 px-1.5 text-xs font-semibold">
              {valor === 'todos' ? pedidos.length : conteo(valor as CcOrderStatus)}
            </span>
          </button>
        ))}
      </div>

    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Bolsas</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Día / Horario</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Registrado</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {pedidosFiltrados.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                No hay pedidos con estado &quot;{filtro !== 'todos' ? STATUS_LABEL[filtro] : ''}&quot;.
              </td>
            </tr>
          )}
          {pedidosFiltrados.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.client_name}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">{p.bags_count}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">{p.pickup_day} {p.pickup_time}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-500">{formatDate(p.created_at)}</td>
              <td className="px-4 py-3 text-center">
                <select
                  value={p.status}
                  disabled={updatingId === p.id}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as CcOrderStatus)}
                  className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_STYLE[p.status]}`}
                >
                  {(Object.keys(STATUS_LABEL) as CcOrderStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}
