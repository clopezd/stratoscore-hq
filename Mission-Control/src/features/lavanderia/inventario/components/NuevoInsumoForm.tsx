'use client'

import { useState } from 'react'
import { createInsumo } from '../services/inventarioService'

interface Props {
  onSuccess?: () => void
}

export function NuevoInsumoForm({ onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('unidad')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createInsumo(nombre.trim(), unidadMedida.trim())
      setNombre('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear insumo')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label htmlFor="nombre-insumo" className="block text-sm font-medium text-gray-700">
          Nombre del insumo
        </label>
        <input
          id="nombre-insumo"
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Batas, Toallas..."
          className={inputClass}
        />
      </div>
      <div className="w-32">
        <label htmlFor="unidad" className="block text-sm font-medium text-gray-700">
          Unidad
        </label>
        <input
          id="unidad"
          type="text"
          required
          value={unidadMedida}
          onChange={(e) => setUnidadMedida(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="pb-0.5">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Agregar'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
