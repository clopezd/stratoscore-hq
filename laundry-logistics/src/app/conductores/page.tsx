'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Plus,
  Bike,
  Car,
  Truck,
  Package,
  Phone,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react'

type VehicleType = 'Moto' | 'Auto' | 'Camioneta'
type DriverStatus = 'Activo' | 'Inactivo'

interface Driver {
  id: string
  nombre: string
  telefono: string
  vehiculo: VehicleType
  placa: string
  status: DriverStatus
  ordenes_activas: number
  entregas_mes: number
}

const MOCK_DRIVERS: Driver[] = [
  { id: 'DRV-001', nombre: 'Luis Herrera',   telefono: '55 9001 1234', vehiculo: 'Moto',     placa: 'MX-3821', status: 'Activo',   ordenes_activas: 2, entregas_mes: 47 },
  { id: 'DRV-002', nombre: 'Ana Rivas',       telefono: '55 9002 5678', vehiculo: 'Auto',     placa: 'ABC-123', status: 'Activo',   ordenes_activas: 1, entregas_mes: 39 },
  { id: 'DRV-003', nombre: 'Marco Díaz',      telefono: '55 9003 9012', vehiculo: 'Camioneta',placa: 'TRK-007', status: 'Activo',   ordenes_activas: 3, entregas_mes: 55 },
  { id: 'DRV-004', nombre: 'Sandra Cruz',     telefono: '55 9004 3456', vehiculo: 'Moto',     placa: 'MX-6644', status: 'Inactivo', ordenes_activas: 0, entregas_mes: 28 },
  { id: 'DRV-005', nombre: 'Ernesto Vargas',  telefono: '55 9005 7890', vehiculo: 'Auto',     placa: 'XYZ-456', status: 'Inactivo', ordenes_activas: 0, entregas_mes: 12 },
]

const VEHICLE_ICON: Record<VehicleType, React.ReactNode> = {
  Moto:      <Bike className="w-4 h-4" />,
  Auto:      <Car className="w-4 h-4" />,
  Camioneta: <Truck className="w-4 h-4" />,
}

export default function ConductoresPage() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'Todos' | DriverStatus>('Todos')

  function toggleStatus(id: string) {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'Activo' ? 'Inactivo' : 'Activo' }
          : d
      )
    )
  }

  const filtered = drivers.filter((d) => {
    const matchSearch = d.nombre.toLowerCase().includes(search.toLowerCase()) || d.placa.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Todos' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  const activos = drivers.filter((d) => d.status === 'Activo').length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-[#8B949E] hover:text-[#E0EDE0] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00F2FE]" />
          <h1 className="text-xl font-bold">Conductores</h1>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-2 bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 border border-[#00F2FE]/40 text-[#00F2FE] text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total" value={drivers.length} />
          <StatCard label="Activos" value={activos} highlight />
          <StatCard label="Inactivos" value={drivers.length - activos} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
            <input
              type="text"
              placeholder="Buscar por nombre o placa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-[#E0EDE0] placeholder:text-gray-600 focus:outline-none focus:border-[#00F2FE]/50 transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {(['Todos', 'Activo', 'Inactivo'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f as 'Todos' | DriverStatus)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === f
                    ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/40'
                    : 'text-[#8B949E] hover:text-[#E0EDE0] border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Driver Cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#8B949E] bg-gray-900/40 border border-gray-800 rounded-xl">
              No hay conductores que coincidan
            </div>
          ) : (
            filtered.map((driver) => (
              <div
                key={driver.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  driver.status === 'Activo'
                    ? 'bg-[#00F2FE]/15 text-[#00F2FE]'
                    : 'bg-gray-800 text-[#8B949E]'
                }`}>
                  {driver.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{driver.nombre}</p>
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${
                      driver.status === 'Activo'
                        ? 'text-green-400 bg-green-400/10 border-green-400/30'
                        : 'text-[#8B949E] bg-gray-800/60 border-gray-700'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#8B949E] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {driver.telefono}
                    </span>
                    <span className="flex items-center gap-1">
                      {VEHICLE_ICON[driver.vehiculo]} {driver.vehiculo} · {driver.placa}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {driver.ordenes_activas} activas · {driver.entregas_mes} en el mes
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleStatus(driver.id)}
                  className={`shrink-0 transition-colors ${
                    driver.status === 'Activo'
                      ? 'text-[#00F2FE] hover:text-[#00F2FE]/70'
                      : 'text-[#8B949E] hover:text-[#E0EDE0]'
                  }`}
                  title={driver.status === 'Activo' ? 'Desactivar' : 'Activar'}
                >
                  {driver.status === 'Activo' ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
      <p className={`text-2xl font-bold ${highlight ? 'text-[#00F2FE]' : 'text-[#E0EDE0]'}`}>{value}</p>
      <p className="text-xs text-[#8B949E] mt-0.5">{label}</p>
    </div>
  )
}
