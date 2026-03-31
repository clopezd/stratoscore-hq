'use client'

import Link from 'next/link'
import { ArrowLeft, Shirt, Clock, CheckCircle2, Truck, XCircle, Plus, Package } from 'lucide-react'

type OrderStatus = 'pending' | 'picked_up' | 'processing' | 'ready' | 'delivered' | 'cancelled'

interface Order {
  id: string
  serviceLabel: string
  status: OrderStatus
  pickupDate: string
  deliveryDate: string | null
  total: string
  address: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  picked_up: {
    label: 'Recogido',
    color: 'bg-blue-100 text-blue-700',
    icon: Truck,
  },
  processing: {
    label: 'En proceso',
    color: 'bg-purple-100 text-purple-700',
    icon: Shirt,
  },
  ready: {
    label: 'Listo',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-gray-100 text-gray-600',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-600',
    icon: XCircle,
  },
}

// Datos de ejemplo — reemplazar con datos reales de la API
const PLACEHOLDER_ORDERS: Order[] = [
  {
    id: 'PED-001',
    serviceLabel: 'Lavado y planchado',
    status: 'processing',
    pickupDate: '2026-03-29',
    deliveryDate: '2026-03-31',
    total: '$28.000',
    address: 'Calle 123 # 45-67',
  },
  {
    id: 'PED-002',
    serviceLabel: 'Lavado y doblado',
    status: 'ready',
    pickupDate: '2026-03-27',
    deliveryDate: '2026-03-29',
    total: '$15.000',
    address: 'Cra 80 # 12-34, Apto 501',
  },
  {
    id: 'PED-003',
    serviceLabel: 'Solo planchado',
    status: 'delivered',
    pickupDate: '2026-03-22',
    deliveryDate: '2026-03-24',
    total: '$10.000',
    address: 'Calle 123 # 45-67',
  },
  {
    id: 'PED-004',
    serviceLabel: 'Lavado en seco',
    status: 'cancelled',
    pickupDate: '2026-03-18',
    deliveryDate: null,
    total: '$18.000',
    address: 'Cra 80 # 12-34, Apto 501',
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function OrderCard({ order }: { order: Order }) {
  const config = STATUS_CONFIG[order.status]
  const Icon = config.icon

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* Top row: id + badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-mono">{order.id}</p>
          <p className="font-semibold text-gray-900 text-sm mt-0.5">{order.serviceLabel}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Recogida: {formatDate(order.pickupDate)}</span>
        </div>
        {order.deliveryDate && (
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Entrega: {formatDate(order.deliveryDate)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{order.address}</span>
        </div>
      </div>

      {/* Footer: price */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="font-bold text-blue-600 text-sm">{order.total}</span>
      </div>
    </div>
  )
}

export default function MisPedidosPage() {
  const activeOrders = PLACEHOLDER_ORDERS.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const pastOrders = PLACEHOLDER_ORDERS.filter(o => ['delivered', 'cancelled'].includes(o.status))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <Shirt className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-600">Lavandería</h1>
        </div>
        <Link
          href="/nuevo-pedido"
          className="flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Mis pedidos</h2>
        <p className="text-sm text-gray-500 mb-6">Historial y estado de tus servicios</p>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              En curso ({activeOrders.length})
            </h3>
            <div className="space-y-3">
              {activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Historial ({pastOrders.length})
            </h3>
            <div className="space-y-3">
              {pastOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {PLACEHOLDER_ORDERS.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shirt className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Sin pedidos aún</h3>
            <p className="text-sm text-gray-500 mb-6">Tu historial de pedidos aparecerá aquí</p>
            <Link
              href="/nuevo-pedido"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Hacer mi primer pedido
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
