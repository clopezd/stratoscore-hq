"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"

type Status =
  | "Todos"
  | "Pendiente"
  | "En proceso"
  | "Listo"
  | "En ruta"
  | "Entregado"

const TABS: Status[] = [
  "Todos",
  "Pendiente",
  "En proceso",
  "Listo",
  "En ruta",
  "Entregado",
]

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "En proceso": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Listo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "En ruta": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Entregado: "bg-gray-500/10 text-gray-400 border-gray-500/30",
}

const MOCK_ORDERS = [
  {
    id: "ORD-001",
    cliente: "Ana García",
    fecha: "2026-03-31",
    prendas: 8,
    total: "$145.00",
    estado: "Pendiente",
    direccion: "Av. Siempreviva 742",
  },
  {
    id: "ORD-002",
    cliente: "Carlos López",
    fecha: "2026-03-31",
    prendas: 12,
    total: "$210.00",
    estado: "En proceso",
    direccion: "Calle Falsa 123",
  },
  {
    id: "ORD-003",
    cliente: "María Torres",
    fecha: "2026-03-30",
    prendas: 5,
    total: "$90.00",
    estado: "Listo",
    direccion: "Blvd. Las Flores 88",
  },
  {
    id: "ORD-004",
    cliente: "Roberto Díaz",
    fecha: "2026-03-30",
    prendas: 20,
    total: "$380.00",
    estado: "En ruta",
    direccion: "Circuito Interior 400",
  },
  {
    id: "ORD-005",
    cliente: "Luisa Martínez",
    fecha: "2026-03-29",
    prendas: 7,
    total: "$125.00",
    estado: "Entregado",
    direccion: "Col. Del Valle 55",
  },
  {
    id: "ORD-006",
    cliente: "Jorge Herrera",
    fecha: "2026-03-29",
    prendas: 15,
    total: "$265.00",
    estado: "Entregado",
    direccion: "Reforma 222",
  },
]

export default function OrdenesPage() {
  const [activeTab, setActiveTab] = useState<Status>("Todos")
  const [search, setSearch] = useState("")

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchTab = activeTab === "Todos" || o.estado === activeTab
    const matchSearch =
      o.cliente.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

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
        <Package className="w-5 h-5 text-[#00F2FE]" />
        <h1 className="text-xl font-bold text-[#E0EDE0]">Órdenes</h1>
        <span className="ml-auto">
          <button className="flex items-center gap-2 bg-[#00F2FE] text-[#001117] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#00c8d4] transition-colors">
            <Plus className="w-4 h-4" />
            Nueva orden
          </button>
        </span>
      </header>

      <div className="p-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente o ID..."
            className="w-full bg-gray-900/60 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-[#E0EDE0] placeholder-[#8B949E] focus:outline-none focus:border-[#00F2FE] transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap">
          {TABS.map((tab) => {
            const count =
              tab === "Todos"
                ? MOCK_ORDERS.length
                : MOCK_ORDERS.filter((o) => o.estado === tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#00F2FE] text-[#001117]"
                    : "bg-gray-900/60 text-[#8B949E] border border-gray-800 hover:text-[#E0EDE0]"
                }`}
              >
                {tab}{" "}
                <span className="opacity-70 text-xs">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-[#8B949E]">
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Dirección
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                    Prendas
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-[#8B949E]"
                    >
                      No hay órdenes que coincidan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[#00F2FE]">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-[#E0EDE0]">
                        {order.cliente}
                      </td>
                      <td className="px-4 py-3 text-[#8B949E] hidden md:table-cell">
                        {order.direccion}
                      </td>
                      <td className="px-4 py-3 text-[#8B949E] hidden sm:table-cell">
                        {order.fecha}
                      </td>
                      <td className="px-4 py-3 text-[#8B949E] hidden lg:table-cell">
                        {order.prendas}
                      </td>
                      <td className="px-4 py-3 text-[#E0EDE0] font-medium">
                        {order.total}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                            STATUS_STYLES[order.estado] ?? ""
                          }`}
                        >
                          {order.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            title="Ver"
                            className="text-[#8B949E] hover:text-[#00F2FE] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Editar"
                            className="text-[#8B949E] hover:text-[#E0EDE0] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Eliminar"
                            className="text-[#8B949E] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#8B949E]">
          Mostrando {filtered.length} de {MOCK_ORDERS.length} órdenes — datos
          de ejemplo.
        </p>
      </div>
    </div>
  )
}
