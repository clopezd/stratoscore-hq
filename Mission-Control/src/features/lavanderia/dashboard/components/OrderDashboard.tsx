'use client'

import { useState } from 'react'
import { Minus, Plus, CheckCircle } from 'lucide-react'
import { saveOrder } from '@/features/lavanderia/admin/actions/orders'
import { signout } from '@/actions/auth'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const WHATSAPP_NUMBER = '50660691570'

export function OrderDashboard() {
  const [clientName, setClientName] = useState('')
  const [bagsCount, setBagsCount] = useState(1)
  const [pickupDay, setPickupDay] = useState<string | null>(null)
  const [pickupTime, setPickupTime] = useState<'AM' | 'PM' | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const isReady = clientName.trim().length > 0 && pickupDay !== null && pickupTime !== null

  async function handleSubmit() {
    if (!isReady || loading) return
    setLoading(true)

    try {
      const result = await saveOrder({
        client_name: clientName.trim(),
        bags_count: bagsCount,
        pickup_day: pickupDay!,
        pickup_time: pickupTime!,
      })

      if (result.error) {
        alert(`Error al guardar: ${result.error}`)
        setLoading(false)
        return
      }

      const turno = pickupTime === 'AM' ? 'mañana' : 'tarde'
      const msg = encodeURIComponent(
        `Hola, soy ${clientName.trim()}, solicito recolección de ${bagsCount} bolsa${bagsCount > 1 ? 's' : ''} para el ${pickupDay} en la ${turno}.`
      )
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
      setSent(true)
    } catch (err) {
      alert(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center px-4 z-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={52} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Excelente!</h2>
          <p className="text-sm text-gray-500 mb-8">Tu pedido fue enviado con éxito.</p>
          <form action={signout}>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gray-800 text-white font-semibold text-sm hover:bg-gray-700"
            >
              Finalizar sesión
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cantidad de bolsas
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setBagsCount((p) => Math.max(1, p - 1))}
            disabled={bagsCount <= 1}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
          >
            <Minus size={16} />
          </button>
          <span className="text-2xl font-bold w-8 text-center">{bagsCount}</span>
          <button
            onClick={() => setBagsCount((p) => p + 1)}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Día de recolección <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setPickupDay(pickupDay === day ? null : day)}
              className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                pickupDay === day
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Horario <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['AM', 'PM'] as const).map((time) => (
            <button
              key={time}
              onClick={() => setPickupTime(pickupTime === time ? null : time)}
              className={`py-3 rounded-lg font-bold text-sm border transition-colors ${
                pickupTime === time
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {time} — {time === 'AM' ? 'Mañana' : 'Tarde'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isReady || loading}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
          isReady
            ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Guardando...' : 'PEDIR POR WHATSAPP'}
      </button>

      {!isReady && (
        <p className="text-center text-xs text-gray-400">
          Completa nombre, día y horario para continuar
        </p>
      )}
    </div>
  )
}
