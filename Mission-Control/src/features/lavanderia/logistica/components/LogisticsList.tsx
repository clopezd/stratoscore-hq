'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { getCcOrders, updateCcOrderStatus } from '../services/logisticaService'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

const STATUS_CONFIG: Record<CcOrderStatus, { label: string; icon: string; badge: string; priority: number }> = {
  pendiente:      { label: 'Pendiente',      icon: '⏳', badge: 'bg-amber-100 text-amber-800',     priority: 1 },
  recogido:       { label: 'Recogido',       icon: '📦', badge: 'bg-purple-100 text-purple-800',   priority: 2 },
  en_preparacion: { label: 'En Preparación', icon: '🧺', badge: 'bg-sky-100 text-sky-800',         priority: 3 },
  en_camino:      { label: 'En Camino',      icon: '🚚', badge: 'bg-orange-100 text-orange-800',   priority: 4 },
  entregado:      { label: 'Entregado',      icon: '✅', badge: 'bg-emerald-100 text-emerald-800', priority: 5 },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as CcOrderStatus[]

function sortOrders(orders: CcOrder[]): CcOrder[] {
  return [...orders].sort((a, b) => {
    const pa = STATUS_CONFIG[a.status].priority
    const pb = STATUS_CONFIG[b.status].priority
    if (pa !== pb) return pa - pb
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })
}

export function LogisticsList() {
  const [orders, setOrders] = useState<CcOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setOrders(sortOrders(await getCcOrders()))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function handleStatusChange(id: string, status: CcOrderStatus) {
    setUpdatingId(id)
    try {
      await updateCcOrderStatus(id, status)
      setOrders((prev) => sortOrders(prev.map((o) => (o.id === id ? { ...o, status } : o))))

      if (status === 'entregado') {
        toast.success('¡Excelente trabajo! Pedido finalizado 🎉', {
          duration: 4000,
          style: { background: '#10b981', color: '#fff', fontWeight: '600', borderRadius: '12px' },
          iconTheme: { primary: '#fff', secondary: '#10b981' },
        })
      } else {
        toast.success('¡Estado actualizado con éxito! 🚀', {
          duration: 2500,
          style: { borderRadius: '12px', fontWeight: '500' },
        })
      }
    } catch {
      toast.error('No se pudo actualizar. Inténtalo de nuevo.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-12 text-center">Cargando pedidos...</p>
  if (error)   return <p className="text-sm text-red-500 py-12 text-center">{error}</p>
  if (orders.length === 0) return <p className="text-sm text-gray-400 py-12 text-center">No hay pedidos aún.</p>

  return (
    <>
      <Toaster position="bottom-center" />

      {/* MOBILE: Tarjetas animadas */}
      <div className="md:hidden space-y-3">
        <AnimatePresence mode="popLayout">
          {orders.map((o) => {
            const cfg = STATUS_CONFIG[o.status]
            const isUpdating = updatingId === o.id
            return (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: o.status === 'entregado' ? 0.45 : 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-sm p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{o.client_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {o.bags_count} bolsa{o.bags_count > 1 ? 's' : ''} · {o.pickup_day} {o.pickup_time}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <select
                  value={o.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(o.id, e.target.value as CcOrderStatus)}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* DESKTOP: Tabla */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Cliente', 'Bolsas', 'Día', 'Horario', 'Registrado', 'Estado'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {orders.map((o) => {
                const cfg = STATUS_CONFIG[o.status]
                const isUpdating = updatingId === o.id
                return (
                  <motion.tr
                    key={o.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: o.status === 'entregado' ? 0.4 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{o.client_name}</td>
                    <td className="px-4 py-3 text-gray-600">{o.bags_count}</td>
                    <td className="px-4 py-3 text-gray-600">{o.pickup_day}</td>
                    <td className="px-4 py-3 text-gray-600">{o.pickup_time}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as CcOrderStatus)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer appearance-none disabled:opacity-40 ${cfg.badge}`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </>
  )
}
