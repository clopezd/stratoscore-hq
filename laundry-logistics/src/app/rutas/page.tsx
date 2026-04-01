"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  MapPin,
  Package,
  User,
  CheckCircle,
  Clock,
} from "lucide-react"

const DRIVERS = [
  { id: "D1", nombre: "Miguel Ángel R.", vehiculo: "Moto" },
  { id: "D2", nombre: "Sandra P.", vehiculo: "Auto" },
  { id: "D3", nombre: "Ernesto V.", vehiculo: "Van" },
]

type Delivery = {
  id: string
  orden: string
  cliente: string
  direccion: string
  colonia: string
  prendas: number
  total: string
  asignadoA: string | null
}

const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: "DEL-001",
    orden: "ORD-003",
    cliente: "María Torres",
    direccion: "Blvd. Las Flores 88",
    colonia: "Col. Jardines",
    prendas: 5,
    total: "$90.00",
    asignadoA: null,
  },
  {
    id: "DEL-002",
    orden: "ORD-007",
    cliente: "Patricia Ruiz",
    direccion: "Insurgentes Sur 1200",
    colonia: "Col. Del Valle",
    prendas: 9,
    total: "$162.00",
    asignadoA: null,
  },
  {
    id: "DEL-003",
    orden: "ORD-008",
    cliente: "Fernando Alonzo",
    direccion: "Av. Revolución 45",
    colonia: "Mixcoac",
    prendas: 14,
    total: "$248.00",
    asignadoA: null,
  },
  {
    id: "DEL-004",
    orden: "ORD-009",
    cliente: "Valeria Salas",
    direccion: "Calle Roma 12",
    colonia: "Col. Roma",
    prendas: 3,
    total: "$55.00",
    asignadoA: "D1",
  },
  {
    id: "DEL-005",
    orden: "ORD-010",
    cliente: "Héctor Mendoza",
    direccion: "Av. Chapultepec 300",
    colonia: "Condesa",
    prendas: 11,
    total: "$195.00",
    asignadoA: "D3",
  },
]

export default function RutasPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>(
    {}
  )

  function handleAssign(deliveryId: string) {
    const driverId = selectedDriver[deliveryId]
    if (!driverId) return
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId ? { ...d, asignadoA: driverId } : d
      )
    )
    setAssigning(null)
  }

  function getDriverName(driverId: string | null) {
    if (!driverId) return null
    return DRIVERS.find((d) => d.id === driverId)?.nombre ?? null
  }

  const pendientes = deliveries.filter((d) => !d.asignadoA)
  const asignadas = deliveries.filter((d) => d.asignadoA)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-[#8B949E] hover:text-[#E0EDE0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Truck className="w-5 h-5 text-[#00F2FE]" />
        <h1 className="text-xl font-bold text-[#E0EDE0]">Rutas</h1>
        <div className="ml-auto flex items-center gap-3 text-sm text-[#8B949E]">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-yellow-400" />
            {pendientes.length} sin asignar
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {asignadas.length} asignadas
          </span>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Pendientes */}
        <section>
          <h2 className="text-base font-semibold text-[#E0EDE0] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            Pendientes de asignación
          </h2>

          {pendientes.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-[#8B949E]">
              Todas las entregas están asignadas.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendientes.map((del) => (
                <div
                  key={del.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3"
                >
                  {/* ID + total */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#00F2FE]">
                      {del.orden}
                    </span>
                    <span className="text-sm font-semibold text-[#E0EDE0]">
                      {del.total}
                    </span>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-center gap-2 text-sm text-[#E0EDE0]">
                    <User className="w-4 h-4 text-[#8B949E] shrink-0" />
                    {del.cliente}
                  </div>

                  {/* Dirección */}
                  <div className="flex items-start gap-2 text-sm text-[#8B949E]">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {del.direccion}, {del.colonia}
                    </span>
                  </div>

                  {/* Prendas */}
                  <div className="flex items-center gap-2 text-sm text-[#8B949E]">
                    <Package className="w-4 h-4" />
                    {del.prendas} prendas
                  </div>

                  {/* Asignar */}
                  {assigning === del.id ? (
                    <div className="space-y-2">
                      <select
                        value={selectedDriver[del.id] ?? ""}
                        onChange={(e) =>
                          setSelectedDriver((prev) => ({
                            ...prev,
                            [del.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-[#001117] border border-gray-700 text-sm text-[#E0EDE0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#00F2FE]"
                      >
                        <option value="">— Selecciona conductor —</option>
                        {DRIVERS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre} ({d.vehiculo})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAssign(del.id)}
                          disabled={!selectedDriver[del.id]}
                          className="flex-1 bg-[#00F2FE] text-[#001117] text-sm font-semibold py-1.5 rounded-lg hover:bg-[#00c8d4] transition-colors disabled:opacity-40"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setAssigning(null)}
                          className="flex-1 border border-gray-700 text-sm text-[#8B949E] py-1.5 rounded-lg hover:text-[#E0EDE0] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigning(del.id)}
                      className="w-full border border-[#00F2FE]/50 text-[#00F2FE] text-sm py-1.5 rounded-lg hover:bg-[#00F2FE]/10 transition-colors"
                    >
                      Asignar conductor
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Asignadas */}
        <section>
          <h2 className="text-base font-semibold text-[#E0EDE0] mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Ya asignadas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {asignadas.map((del) => (
              <div
                key={del.id}
                className="bg-gray-900/40 border border-emerald-500/20 rounded-xl p-5 space-y-2 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#00F2FE]">
                    {del.orden}
                  </span>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Asignado
                  </span>
                </div>
                <p className="text-sm text-[#E0EDE0]">{del.cliente}</p>
                <p className="text-xs text-[#8B949E]">
                  {del.direccion}, {del.colonia}
                </p>
                <p className="text-xs text-[#8B949E] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {getDriverName(del.asignadoA)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
