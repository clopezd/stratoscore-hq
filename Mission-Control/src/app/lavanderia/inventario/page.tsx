'use client'

import { useState } from 'react'
import { StockDashboard, NuevoMovimientoForm, NuevoInsumoForm } from '@/features/lavanderia/inventario/components'

type Panel = 'movimiento' | 'insumo' | null

export default function InventarioPage() {
  const [panel, setPanel] = useState<Panel>(null)
  const [stockKey, setStockKey] = useState(0)

  function togglePanel(p: Panel) {
    setPanel((prev) => (prev === p ? null : p))
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
            <p className="mt-1 text-sm text-gray-500">Stock en tiempo real por ubicación</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => togglePanel('insumo')}
              className={`rounded-md px-4 py-2 text-sm font-medium border transition-colors ${
                panel === 'insumo'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {panel === 'insumo' ? 'Cerrar' : '+ Nuevo insumo'}
            </button>
            <button
              onClick={() => togglePanel('movimiento')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                panel === 'movimiento'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {panel === 'movimiento' ? 'Cerrar' : '+ Registrar movimiento'}
            </button>
          </div>
        </div>

        {panel === 'insumo' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Agregar insumo</h2>
            <NuevoInsumoForm onSuccess={() => setPanel(null)} />
          </div>
        )}

        {panel === 'movimiento' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-gray-800">Nuevo movimiento</h2>
            <div className="max-w-md">
              <NuevoMovimientoForm onSuccess={() => { setPanel(null); setStockKey((k) => k + 1) }} />
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <StockDashboard key={stockKey} />
        </div>
      </div>
    </div>
  )
}
