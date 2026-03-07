'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, Trophy, Package, CheckCircle2 } from 'lucide-react'
import { getAllCcOrders } from '../services/historialService'
import type { CcOrder, CcOrderStatus } from '@/features/lavanderia/types/database'

const STATUS_LABEL: Record<CcOrderStatus, string> = {
  pendiente:      'Pendiente',
  recogido:       'Recogido',
  en_preparacion: 'En Preparación',
  en_camino:      'En Camino',
  entregado:      'Entregado',
}

const STATUS_BADGE: Record<CcOrderStatus, string> = {
  pendiente:      'bg-amber-100 text-amber-700',
  recogido:       'bg-purple-100 text-purple-700',
  en_preparacion: 'bg-sky-100 text-sky-700',
  en_camino:      'bg-orange-100 text-orange-700',
  entregado:      'bg-emerald-100 text-emerald-700',
}

function getStartOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function computeStats(orders: CcOrder[]) {
  const startOfMonth = getStartOfMonth()
  const thisMonth = orders.filter((o) => new Date(o.created_at) >= startOfMonth)
  const totalThisMonth = thisMonth.length

  const clientCount: Record<string, number> = {}
  orders.forEach((o) => {
    clientCount[o.client_name] = (clientCount[o.client_name] || 0) + 1
  })
  const vip = Object.entries(clientCount).sort((a, b) => b[1] - a[1])[0]
  const completedThisMonth = thisMonth.filter((o) => o.status === 'entregado').length

  return { totalThisMonth, vipClient: vip?.[0] ?? '—', vipCount: vip?.[1] ?? 0, completedThisMonth }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function HistorialPage() {
  const [orders, setOrders] = useState<CcOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllCcOrders().then(setOrders).finally(() => setLoading(false))
  }, [])

  function handleExport() {
    const rows = orders.map((o) => ({
      Fecha:    formatDate(o.created_at),
      Cliente:  o.client_name,
      Producto: 'Bolsas de lavandería',
      Cantidad: o.bags_count,
      Día:      o.pickup_day,
      Horario:  o.pickup_time,
      Estado:   STATUS_LABEL[o.status as CcOrderStatus] ?? o.status,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
    XLSX.writeFile(wb, `CC-Clean-Express-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-400 text-sm">Cargando historial...</p>
      </div>
    )
  }

  const { totalThisMonth, vipClient, vipCount, completedThisMonth } = computeStats(orders)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Package size={22} className="text-blue-500" />}
          label="Pedidos este mes"
          value={String(totalThisMonth)}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Trophy size={22} className="text-amber-500" />}
          label="Cliente VIP"
          value={vipClient}
          sub={vipCount > 0 ? `${vipCount} pedido${vipCount > 1 ? 's' : ''}` : undefined}
          bg="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-emerald-500" />}
          label="Entregados este mes"
          value={String(completedThisMonth)}
          bg="bg-emerald-50"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">Sin pedidos registrados aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm bg-white">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Fecha', 'Cliente', 'Producto', 'Cantidad', 'Día', 'Horario', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.client_name}</td>
                  <td className="px-4 py-3 text-gray-600">Bolsas</td>
                  <td className="px-4 py-3 text-gray-700">{o.bags_count}</td>
                  <td className="px-4 py-3 text-gray-600">{o.pickup_day}</td>
                  <td className="px-4 py-3 text-gray-600">{o.pickup_time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[o.status as CcOrderStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[o.status as CcOrderStatus] ?? o.status}
                    </span>
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

function StatCard({
  icon, label, value, sub, bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  bg: string
}) {
  return (
    <div className={`rounded-2xl p-5 ${bg} shadow-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
