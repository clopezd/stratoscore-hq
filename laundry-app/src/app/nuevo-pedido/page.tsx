'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  Shirt,
  Wind,
  Sparkles,
  Layers,
  Star,
  MapPin,
  CalendarDays,
  StickyNote,
  ChevronRight,
} from 'lucide-react'

const SERVICE_TYPES = [
  {
    id: 'wash_fold',
    label: 'Lavado y doblado',
    desc: 'Lavado completo, secado y doblado',
    icon: Shirt,
    price: 'Desde $15.000',
  },
  {
    id: 'wash_iron',
    label: 'Lavado y planchado',
    desc: 'Lavado, secado y planchado profesional',
    icon: Wind,
    price: 'Desde $22.000',
  },
  {
    id: 'dry_clean',
    label: 'Lavado en seco',
    desc: 'Para prendas delicadas o especiales',
    icon: Sparkles,
    price: 'Desde $18.000',
  },
  {
    id: 'iron_only',
    label: 'Solo planchado',
    desc: 'Planchado profesional sin lavado',
    icon: Layers,
    price: 'Desde $10.000',
  },
  {
    id: 'special',
    label: 'Servicio especial',
    desc: 'Ropa de cama, cortinas, tapetes...',
    icon: Star,
    price: 'Cotizar',
  },
] as const

type ServiceId = (typeof SERVICE_TYPES)[number]['id']

export default function NuevoPedidoPage() {
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null)
  const [address, setAddress] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: enviar pedido a la API
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-600">Lavandería</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Nuevo pedido</h2>
        <p className="text-sm text-gray-500 mb-6">Selecciona el servicio y programa tu recogida</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Service type */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Tipo de servicio
            </h3>
            <div className="space-y-2">
              {SERVICE_TYPES.map(service => {
                const Icon = service.icon
                const isSelected = selectedService === service.id
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-500' : 'bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {service.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                      {service.price}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Pickup address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Dirección de recogida
            </h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ej: Calle 123 # 45-67, Apto 201"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <MapPin className="w-3 h-3" />
              Usar dirección guardada
              <ChevronRight className="w-3 h-3" />
            </button>
          </section>

          {/* Pickup date */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Fecha de recogida
            </h3>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Notas adicionales
            </h3>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej: Ropa delicada, usar detergente sin perfume..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm resize-none"
              />
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedService || !address || !pickupDate}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar pedido
          </button>

        </form>
      </main>
    </div>
  )
}
