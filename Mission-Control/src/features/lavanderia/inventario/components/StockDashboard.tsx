'use client'

import { useStock } from '../hooks/useStock'
import { UBICACIONES, type Ubicacion, type StockPorUbicacion } from '../types/inventario'

interface InsumoStock {
  id: string
  nombre: string
  stock: Record<Ubicacion, number>
}

function buildMatrix(rows: StockPorUbicacion[]): InsumoStock[] {
  const map = new Map<string, InsumoStock>()

  for (const row of rows) {
    if (!map.has(row.insumo_id)) {
      map.set(row.insumo_id, {
        id: row.insumo_id,
        nombre: row.insumo_nombre,
        stock: {
          'Bodega': 0,
          'Vestidores': 0,
          'Consultorios': 0,
          'Lavandería (Propia)': 0,
        },
      })
    }
    map.get(row.insumo_id)!.stock[row.ubicacion as Ubicacion] = row.cantidad
  }

  return Array.from(map.values())
}

function stockColor(qty: number): string {
  if (qty === 0) return 'text-gray-400'
  if (qty <= 3) return 'text-red-600 font-semibold'
  if (qty <= 8) return 'text-yellow-600 font-medium'
  return 'text-green-700 font-medium'
}

export function StockDashboard() {
  const { stock, loading, error, refetch } = useStock()

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando inventario...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  const insumos = buildMatrix(stock)

  if (insumos.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No hay insumos registrados. Registra el primer movimiento de entrada.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Stock por Ubicación</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:underline"
        >
          Actualizar
        </button>
      </div>

      <table className="min-w-full rounded-lg border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Insumo
            </th>
            {UBICACIONES.map((ub) => (
              <th
                key={ub}
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {ub}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {insumos.map((insumo) => {
            const total = UBICACIONES.reduce((sum, ub) => sum + insumo.stock[ub], 0)
            return (
              <tr key={insumo.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{insumo.nombre}</td>
                {UBICACIONES.map((ub) => (
                  <td
                    key={ub}
                    className={`px-4 py-3 text-center text-sm ${stockColor(insumo.stock[ub])}`}
                  >
                    {insumo.stock[ub]}
                  </td>
                ))}
                <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">{total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
