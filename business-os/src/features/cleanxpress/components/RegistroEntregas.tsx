'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle, Truck, AlertCircle } from 'lucide-react'

interface Order {
  id: string
  client_name: string
  bags_count: number
  bags_delivered: number
  pickup_day: string
  pickup_time: string
  status: string
  delivered_at: string | null
  delivery_notes: string | null
  created_at: string
}

export function RegistroEntregas() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [bagsToDeliver, setBagsToDeliver] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'entregado'>('all')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const url = filter === 'all'
        ? '/api/cleanxpress/entregas'
        : `/api/cleanxpress/entregas?status=${filter}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterDelivery = async () => {
    if (!selectedOrder || !bagsToDeliver) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/cleanxpress/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          bags_delivered: parseInt(bagsToDeliver),
          delivery_notes: notes || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Recargar pedidos
        await fetchOrders()

        // Resetear formulario
        setSelectedOrder(null)
        setBagsToDeliver('')
        setNotes('')

        alert('✅ Entrega registrada exitosamente')
      } else {
        alert('❌ Error: ' + (data.error || 'No se pudo registrar la entrega'))
      }
    } catch (error) {
      console.error('Error registering delivery:', error)
      alert('❌ Error al registrar la entrega')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pendiente: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' },
      recogido: { label: 'Recogido', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
      en_preparacion: { label: 'En preparación', color: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
      en_camino: { label: 'En camino', color: 'bg-orange-500/20 text-orange-600 border-orange-500/30' },
      entregado: { label: 'Entregado', color: 'bg-green-500/20 text-green-600 border-green-500/30' },
    }
    const badge = badges[status as keyof typeof badges] || badges.pendiente
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="text-cyan-400" size={28} />
            Registro de Entregas
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Registra las bolsas de batas limpias entregadas a los clientes
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'pendiente'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('entregado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'entregado'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Grid: Lista de pedidos + Formulario */}
      <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">

        {/* Lista de pedidos */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white/80">Pedidos activos</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay pedidos {filter !== 'all' ? `en estado "${filter}"` : ''}</p>
              </div>
            ) : (
              orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order)
                    setBagsToDeliver(order.bags_count.toString())
                    setNotes(order.delivery_notes || '')
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedOrder?.id === order.id
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{order.client_name}</h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/40">Recogidas:</span>
                      <span className="ml-2 text-white font-medium">{order.bags_count} bolsas</span>
                    </div>
                    {order.bags_delivered > 0 && (
                      <div>
                        <span className="text-white/40">Entregadas:</span>
                        <span className="ml-2 text-green-400 font-medium">{order.bags_delivered} bolsas</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-white/40 mt-2">
                    {order.pickup_day} - {order.pickup_time}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Formulario de registro */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <Truck className="text-cyan-400" size={18} />
            <h2 className="text-sm font-semibold text-white/80">Registrar entrega</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedOrder ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40">
                <Package size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Selecciona un pedido para registrar la entrega</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info del pedido */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-2">{selectedOrder.client_name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Pedido:</span>
                      <span className="text-white/80">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Recogida:</span>
                      <span className="text-white/80">{selectedOrder.pickup_day} {selectedOrder.pickup_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Bolsas recogidas:</span>
                      <span className="text-cyan-400 font-medium">{selectedOrder.bags_count}</span>
                    </div>
                  </div>
                </div>

                {/* Campo: Bolsas entregadas */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Bolsas procesadas entregadas *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bagsToDeliver}
                    onChange={(e) => setBagsToDeliver(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Ej: 4"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Puede ser diferente a las bolsas recogidas
                  </p>
                </div>

                {/* Campo: Notas */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Notas de entrega (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                    placeholder="Ej: Entregadas 4 bolsas del pedido anterior, procesamiento express"
                  />
                </div>

                {/* Botón de registro */}
                <button
                  onClick={handleRegisterDelivery}
                  disabled={submitting || !bagsToDeliver}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Registrar entrega
                    </>
                  )}
                </button>

                {selectedOrder.status === 'entregado' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="text-green-400 mt-0.5" size={16} />
                    <div className="text-xs">
                      <p className="text-green-400 font-medium">Este pedido ya fue entregado</p>
                      <p className="text-white/60 mt-1">
                        {selectedOrder.delivered_at && `El ${formatDate(selectedOrder.delivered_at)}`}
                      </p>
                      {selectedOrder.delivery_notes && (
                        <p className="text-white/60 mt-1">Nota: {selectedOrder.delivery_notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
