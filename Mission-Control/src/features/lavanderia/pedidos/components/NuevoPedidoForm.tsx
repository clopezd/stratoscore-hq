'use client'

import { useState } from 'react'
import { createStaffOrder } from '../services/pedidosService'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

interface Props {
  onSuccess?: () => void
}

export function NuevoPedidoForm({ onSuccess }: Props) {
  const [clientName, setClientName] = useState('')
  const [bagsCount, setBagsCount] = useState(1)
  const [pickupDay, setPickupDay] = useState('')
  const [pickupTime, setPickupTime] = useState<'AM' | 'PM'>('AM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lastClientName, setLastClientName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createStaffOrder({ client_name: clientName, bags_count: bagsCount, pickup_day: pickupDay, pickup_time: pickupTime })
      setLastClientName(clientName)
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pedido')
    } finally {
      setLoading(false)
    }
  }

  function handleNuevoPedido() {
    setClientName('')
    setBagsCount(1)
    setPickupDay('')
    setPickupTime('AM')
    setError(null)
    setSuccess(false)
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Pedido registrado</p>
        <p className="mt-1 text-sm text-green-600">
          {lastClientName} — {bagsCount} bolsa{bagsCount !== 1 ? 's' : ''} — {pickupDay} {pickupTime}
        </p>
        <button
          onClick={handleNuevoPedido}
          className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
        >
          Registrar otro pedido
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">
          Nombre del cliente
        </label>
        <input
          id="client_name"
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ej: María González"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="bags_count" className="block text-sm font-medium text-gray-700">
          Cantidad de bolsas
        </label>
        <input
          id="bags_count"
          type="number"
          required
          min={1}
          value={bagsCount}
          onChange={(e) => setBagsCount(Math.max(1, Number(e.target.value)))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="pickup_day" className="block text-sm font-medium text-gray-700">
          Fecha de recolección
        </label>
        <input
          id="pickup_day"
          type="date"
          required
          min={getTodayString()}
          value={pickupDay}
          onChange={(e) => setPickupDay(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
        <div className="flex gap-3">
          {(['AM', 'PM'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPickupTime(t)}
              className={`flex-1 rounded-md border py-2 text-sm font-semibold transition-colors ${
                pickupTime === t
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t} — {t === 'AM' ? 'Mañana' : 'Tarde'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Registrar pedido'}
      </button>
    </form>
  )
}
