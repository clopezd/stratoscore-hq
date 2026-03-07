'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getInsumos, registrarMovimiento } from '../services/inventarioService'
import { UBICACIONES, type Insumo, type TipoMovimiento, type Ubicacion } from '../types/inventario'

interface Props {
  onSuccess?: () => void
}

export function NuevoMovimientoForm({ onSuccess }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>('traslado')
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [insumoId, setInsumoId] = useState('')
  const [origen, setOrigen] = useState<Ubicacion | ''>('')
  const [destino, setDestino] = useState<Ubicacion | ''>('')
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getInsumos().then(setInsumos)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (destino === origen) setDestino('')
  }, [origen, destino])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) { setError('Sesión expirada, recarga la página'); return }
    setLoading(true)
    setError(null)

    try {
      await registrarMovimiento({
        insumo_id: insumoId,
        origen: tipo === 'entrada' ? null : (origen as Ubicacion),
        destino: destino as Ubicacion,
        cantidad,
        usuario_id: userId,
        notas: notas.trim() || null,
      })

      setInsumoId('')
      setOrigen('')
      setDestino('')
      setCantidad(1)
      setNotas('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-2 block text-sm font-medium text-gray-700">Tipo de movimiento</p>
        <div className="flex gap-2">
          {(['entrada', 'traslado'] as TipoMovimiento[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTipo(t); setOrigen('') }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                tipo === t
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t === 'entrada' ? 'Entrada al sistema' : 'Traslado'}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {tipo === 'entrada'
            ? 'Agrega stock nuevo (compra, donación, etc.)'
            : 'Mueve stock de una ubicación a otra'}
        </p>
      </div>

      <div>
        <label htmlFor="insumo" className="block text-sm font-medium text-gray-700">Insumo</label>
        <select
          id="insumo"
          required
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
          className={inputClass}
        >
          <option value="">Seleccionar insumo...</option>
          {insumos.map((i) => (
            <option key={i.id} value={i.id}>{i.nombre}</option>
          ))}
        </select>
      </div>

      {tipo === 'traslado' && (
        <div>
          <label htmlFor="origen" className="block text-sm font-medium text-gray-700">Origen</label>
          <select
            id="origen"
            required
            value={origen}
            onChange={(e) => setOrigen(e.target.value as Ubicacion)}
            className={inputClass}
          >
            <option value="">¿De dónde sale?</option>
            {UBICACIONES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="destino" className="block text-sm font-medium text-gray-700">Destino</label>
        <select
          id="destino"
          required
          value={destino}
          onChange={(e) => setDestino(e.target.value as Ubicacion)}
          className={inputClass}
        >
          <option value="">¿A dónde va?</option>
          {UBICACIONES.filter((u) => u !== origen).map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Cantidad</label>
        <input
          id="cantidad"
          type="number"
          required
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
          Notas <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <input
          id="notas"
          type="text"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: Revisión semanal, desgaste..."
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrar movimiento'}
      </button>
    </form>
  )
}
