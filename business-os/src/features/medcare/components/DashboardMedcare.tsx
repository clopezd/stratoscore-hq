'use client'

import { useState, useEffect } from 'react'
import { getEstadisticas, getLeads } from '../services/leadsService'
import { getServicios } from '../services/serviciosService'
import type { LeadMedcare, ServicioMedcare } from '../types'
import { GestionLeadsMedcare } from './GestionLeadsMedcare'
import { ImportarPacientesModal } from './ImportarPacientesModal'

interface Stats {
  total: number
  nuevos: number
  contactados: number
  agendados: number
  completados: number
  tasaConversion: number
  porTipo: Record<string, number>
  reactivacion: { total: number; pendientes: number; contactados: number; agendados: number }
}

export function DashboardMedcare() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<LeadMedcare[]>([])
  const [servicios, setServicios] = useState<ServicioMedcare[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'leads'>('dashboard')
  const [showImport, setShowImport] = useState(false)

  function loadData() {
    return Promise.all([
      getEstadisticasExtendidas(),
      getLeads({ limite: 200 }),
      getServicios(),
    ]).then(([s, l, sv]) => {
      setStats(s)
      setLeads(l)
      setServicios(sv)
    }).catch(console.error)
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const leadsReactivacion = leads.filter(l => l.origen_importacion)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MedCare Imagenología</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mamografía Digital + Ultrasonido</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar CSV
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'dashboard'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab('leads')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'leads'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Leads {stats && stats.nuevos > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.nuevos}</span>
            )}
          </button>
        </div>
      </div>

      {tab === 'dashboard' && stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Total Leads" value={stats.total} color="cyan" />
            <KPICard label="Nuevos (sin contactar)" value={stats.nuevos} color="amber" />
            <KPICard label="Citas Agendadas" value={stats.agendados} color="green" />
            <KPICard label="Tasa Conversión" value={`${stats.tasaConversion}%`} color="indigo" />
          </div>

          {/* Panel de reactivación */}
          {stats.reactivacion.total > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Reactivación — Candidatas a Mamografía
                </h3>
                <button
                  onClick={() => setTab('leads')}
                  className="text-xs text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Ver lista completa
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{stats.reactivacion.total}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Total importadas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{stats.reactivacion.pendientes}</p>
                  <p className="text-xs text-blue-500">Pendientes de llamar</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-600">{stats.reactivacion.contactados}</p>
                  <p className="text-xs text-yellow-500">Llamadas hechas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{stats.reactivacion.agendados}</p>
                  <p className="text-xs text-green-500">Mamografías agendadas</p>
                </div>
              </div>
              {stats.reactivacion.total > 0 && (
                <div className="mt-3 bg-amber-100 dark:bg-amber-900 rounded-lg h-2 overflow-hidden">
                  <div
                    className="h-2 bg-green-500 rounded-lg transition-all"
                    style={{
                      width: `${Math.round(
                        ((stats.reactivacion.contactados + stats.reactivacion.agendados) / stats.reactivacion.total) * 100
                      )}%`
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Por tipo + Servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leads por Tipo de Estudio</h3>
              <div className="space-y-3">
                {Object.entries(stats.porTipo).map(([tipo, count]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {tipo === 'mamografia' ? 'Mamografía' : tipo === 'ultrasonido' ? 'Ultrasonido' : tipo === 'importacion' ? 'Importación' : tipo}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tipo === 'mamografia' ? 'bg-cyan-500' : tipo === 'importacion' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min((count / Math.max(stats.total, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Servicios Disponibles</h3>
              <div className="space-y-2">
                {servicios.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white">{s.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">{s.duracion_minutos}min</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.tipo === 'mamografia'
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    }`}>
                      {s.tipo === 'mamografia' ? 'Mamografía' : 'Ultrasonido'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leads recientes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leads Recientes</h3>
            {leads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No hay leads aún.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Comparte el link <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">/medcare/agendar-estudio</code> o importa un CSV de pacientes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 font-medium">Nombre</th>
                      <th className="pb-2 font-medium">Teléfono</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 font-medium">Estado</th>
                      <th className="pb-2 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {leads.slice(0, 10).map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-2 text-gray-900 dark:text-white">
                          {lead.nombre}
                          {lead.origen_importacion && (
                            <span className="ml-1.5 text-xs text-amber-500">CSV</span>
                          )}
                        </td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{lead.telefono}</td>
                        <td className="py-2">
                          <span className="text-xs capitalize">
                            {lead.origen_importacion ? 'Reactivación' : lead.tipo_estudio || '-'}
                          </span>
                        </td>
                        <td className="py-2">
                          <EstadoBadge estado={lead.estado} />
                        </td>
                        <td className="py-2 text-xs text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString('es-CR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'leads' && (
        <GestionLeadsMedcare leads={leads} onUpdate={() => {
          loadData()
        }} />
      )}

      {/* Modal de importación */}
      <ImportarPacientesModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={() => {
          loadData()
          setTab('leads')
        }}
      />
    </div>
  )
}

// Estadísticas extendidas con datos de reactivación
async function getEstadisticasExtendidas(): Promise<Stats> {
  const base = await getEstadisticas()
  const leadsAll = await getLeads({ limite: 1000 })

  const reactivacion = leadsAll.filter(l => l.origen_importacion)

  return {
    ...base,
    reactivacion: {
      total: reactivacion.length,
      pendientes: reactivacion.filter(l => l.estado === 'nuevo').length,
      contactados: reactivacion.filter(l => l.estado === 'contactado').length,
      agendados: reactivacion.filter(l => l.estado === 'cita_agendada').length,
    },
  }
}

function KPICard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800',
    amber: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800',
  }
  const valueColorMap: Record<string, string> = {
    cyan: 'text-cyan-700 dark:text-cyan-300',
    amber: 'text-amber-700 dark:text-amber-300',
    green: 'text-green-700 dark:text-green-300',
    indigo: 'text-indigo-700 dark:text-indigo-300',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColorMap[color]}`}>{value}</p>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    contactado: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    cita_agendada: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    completado: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    descartado: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    cita_agendada: 'Agendado',
    completado: 'Completado',
    descartado: 'Descartado',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config[estado] || 'bg-gray-100 text-gray-600'}`}>
      {labels[estado] || estado}
    </span>
  )
}
