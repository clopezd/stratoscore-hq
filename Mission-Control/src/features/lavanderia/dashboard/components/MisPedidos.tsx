'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserCcOrders } from '@/features/lavanderia/logistica/services/logisticaService'
import { WashingDrum } from '@/shared/components/WashingDrum'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

const STEPS: CcOrderStatus[] = ['pendiente', 'recogido', 'en_preparacion', 'en_camino', 'entregado']

const STATUS_CONFIG: Record<CcOrderStatus, { label: string; icon: string; cardClass: string }> = {
  pendiente:      { label: 'Pendiente',      icon: '⏳', cardClass: 'border-gray-200 bg-white' },
  recogido:       { label: 'Recogido',       icon: '📦', cardClass: 'border-purple-200 bg-purple-50' },
  en_preparacion: { label: 'En Preparación', icon: '🧺', cardClass: 'border-sky-200 bg-sky-50' },
  en_camino:      { label: 'En Camino',      icon: '🚚', cardClass: 'border-orange-300 bg-orange-50 shadow-md shadow-orange-100' },
  entregado:      { label: 'Entregado',      icon: '✅', cardClass: 'border-emerald-200 bg-emerald-50' },
}

function StatusStepper({ current }: { current: CcOrderStatus }) {
  const currentIdx = STEPS.indexOf(current)
  return (
    <div className="flex items-center mt-3">
      {STEPS.map((step, i) => {
        const isPast    = i < currentIdx
        const isCurrent = i === currentIdx
        const cfg = STATUS_CONFIG[step]
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-blue-600 shadow-md shadow-blue-200 scale-110'
                    : isPast
                    ? 'bg-gray-200'
                    : 'bg-gray-100'
                }`}
                title={cfg.label}
              >
                <span className={isCurrent ? '' : isPast ? 'opacity-60' : 'opacity-30'}>
                  {cfg.icon}
                </span>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-0.5 rounded-full transition-colors duration-300 ${
                  i < currentIdx ? 'bg-blue-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  userId: string
}

export function MisPedidos({ userId }: Props) {
  const [orders, setOrders] = useState<CcOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserCcOrders(userId)
      .then(setOrders)
      .finally(() => setLoading(false))

    const supabase = createClient()
    const channel = supabase
      .channel(`my-orders-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cc_orders', filter: `user_id=eq.${userId}` },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? { ...o, ...(payload.new as CcOrder) } : o))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (loading || orders.length === 0) return null

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
        Mis Pedidos Recientes
      </h2>
      <div className="space-y-3">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status]
          const isEnCamino      = order.status === 'en_camino'
          const isEntregado     = order.status === 'entregado'
          const isEnPreparacion = order.status === 'en_preparacion'

          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-4 transition-all backdrop-blur-sm ${cfg.cardClass}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{order.client_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.bags_count} bolsa{order.bags_count > 1 ? 's' : ''} · {order.pickup_day} {order.pickup_time}
                  </p>
                </div>
                {isEnPreparacion ? (
                  <WashingDrum size={36} />
                ) : (
                  <span className="shrink-0 text-sm">{cfg.icon}</span>
                )}
              </div>

              <StatusStepper current={order.status} />

              {isEnPreparacion && (
                <p className="mt-2.5 text-xs font-semibold text-sky-700 flex items-center gap-1">
                  ✨ Tu ropa está siendo lavada con cuidado
                </p>
              )}
              {isEnCamino && (
                <p className="mt-2.5 text-xs font-semibold text-orange-700 flex items-center gap-1">
                  🚚 ¡Tu pedido ya está en camino!
                </p>
              )}
              {isEntregado && (
                <p className="mt-2.5 text-xs font-semibold text-emerald-700">
                  ✅ ¡Tu pedido fue entregado! Gracias por confiar en C&amp;C Clean Express.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
