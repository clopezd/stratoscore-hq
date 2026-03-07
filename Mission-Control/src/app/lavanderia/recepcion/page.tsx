'use client'

import { useState } from 'react'
import { NuevoPedidoForm, PedidosList } from '@/features/lavanderia/pedidos/components'

export default function RecepcionPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepción de pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">₡18.000 por bolsa</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-800">Nuevo pedido</h2>
          <div className="max-w-md">
            <NuevoPedidoForm onSuccess={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-800">Pedidos registrados</h2>
          <PedidosList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
