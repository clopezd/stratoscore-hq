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
  noShow: number
  tasaConversion: number
  porTipo: Record<string, number>
  porFuente: Record<string, number>
  reactivacion: { total: number; pendientes: number; contactados: number; agendados: number }
}

interface HuliAnalytics {
  hoy: { total: number; completadas: number; pendientes: number; canceladas: number }
  centroHoy: { total: number; pendientes: number; completadas: number; canceladas: number; noShow: number }
  semana: { total: number; completadas: number; noShow: number }
  ocupacionManana: { slotsTotal: number; slotsOcupados: number; porcentaje: number }
  mes: {
    totalLeads: number; leadsConCita: number; tasaConversion: number
    porEstado: Record<string, number>
    porFuente: Record<string, number>
  }
  revenue: { estimado: number; precioUnitario: number; moneda: string } | null
  updatedAt: string
}

export function DashboardMedcare() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<LeadMedcare[]>([])
  const [servicios, setServicios] = useState<ServicioMedcare[]>([])
  const [huliData, setHuliData] = useState<HuliAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'agenda' | 'inteligencia' | 'leads' | 'pipeline'>('dashboard')
  const [showImport, setShowImport] = useState(false)

  function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
    ])
  }

  function loadData() {
    const promises = [
      withTimeout(getEstadisticasExtendidas(), 8000, null as Stats | null),
      withTimeout(getLeads({ limite: 200 }), 8000, [] as LeadMedcare[]),
      withTimeout(getServicios(), 8000, [] as ServicioMedcare[]),
      withTimeout(fetch('/api/medcare/analytics').then(r => r.ok ? r.json() : null), 10000, null),
    ]
    return Promise.all(promises).then(([s, l, sv, huli]) => {
      if (s) setStats(s as Stats)
      setLeads(l as LeadMedcare[])
      setServicios(sv as ServicioMedcare[])
      setHuliData(huli as HuliAnalytics | null)
    }).catch(console.error)
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Si no hay datos de Supabase pero sí de Huli, mostrar solo Huli
  if (!stats && !huliData) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-gray-500 text-lg">No se pudieron cargar los datos.</p>
        <button onClick={() => { setLoading(true); loadData().finally(() => setLoading(false)) }}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">
          Reintentar
        </button>
      </div>
    )
  }

  const leadsReactivacion = leads.filter(l => l.origen_importacion)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white">
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
            onClick={() => setTab('agenda')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'agenda'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setTab('inteligencia')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'inteligencia'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Inteligencia
          </button>
          <button
            onClick={() => setTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'pipeline'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Pipeline
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

      {tab === 'dashboard' && (
        <>
          {/* KPIs */}
          {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <KPICard label="Total Leads" value={stats.total} color="cyan" />
            <KPICard label="Nuevos" value={stats.nuevos} color="amber" />
            <KPICard label="Agendados" value={stats.agendados} color="green" />
            <KPICard label="Completados" value={stats.completados} color="indigo" />
            <KPICard label="Conversión" value={`${stats.tasaConversion}%`} color="cyan" />
          </div>
          )}

          {/* Funnel Visual */}
          {stats && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Funnel de Conversión</h3>
            <div className="space-y-3">
              {[
                { label: 'Nuevos', count: stats.nuevos, color: 'bg-blue-500', pct: stats.total > 0 ? 100 : 0 },
                { label: 'Contactados', count: stats.contactados, color: 'bg-yellow-500', pct: stats.total > 0 ? Math.round((stats.contactados + stats.agendados + stats.completados) / stats.total * 100) : 0 },
                { label: 'Cita Agendada', count: stats.agendados, color: 'bg-green-500', pct: stats.total > 0 ? Math.round((stats.agendados + stats.completados) / stats.total * 100) : 0 },
                { label: 'Completados', count: stats.completados, color: 'bg-indigo-500', pct: stats.total > 0 ? Math.round(stats.completados / stats.total * 100) : 0 },
                { label: 'No Show', count: stats.noShow, color: 'bg-red-400', pct: stats.total > 0 ? Math.round(stats.noShow / stats.total * 100) : 0 },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right">{step.label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-6 ${step.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(step.pct, step.count > 0 ? 8 : 0)}%` }}
                    >
                      {step.count > 0 && (
                        <span className="text-xs font-bold text-white">{step.count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10">{step.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Centro Médico — Total del día */}
          {huliData?.centroHoy && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Centro Médico — Hoy</h3>
                    <p className="text-xs text-gray-500">Todas las áreas y especialidades</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{huliData.centroHoy.total}</p>
                  <p className="text-xs text-blue-600">Total</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{huliData.centroHoy.pendientes}</p>
                  <p className="text-xs text-amber-600">Pendientes</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{huliData.centroHoy.completadas}</p>
                  <p className="text-xs text-green-600">Completadas</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 text-center hidden sm:block">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{huliData.centroHoy.canceladas}</p>
                  <p className="text-xs text-red-600">Canceladas</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-3 text-center hidden sm:block">
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{huliData.centroHoy.noShow}</p>
                  <p className="text-xs text-orange-600">No Show</p>
                </div>
              </div>
            </div>
          )}

          {/* Huli en Vivo — Mamógrafo */}
          {huliData && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mamógrafo — HuliPractice</h3>
                    <p className="text-xs text-gray-500">Datos en tiempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Conectado</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Citas hoy */}
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Citas hoy</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{huliData.hoy.total}</p>
                  <div className="flex gap-2 mt-1">
                    {huliData.hoy.pendientes > 0 && <span className="text-xs text-blue-500">{huliData.hoy.pendientes} pendientes</span>}
                    {huliData.hoy.completadas > 0 && <span className="text-xs text-green-500">{huliData.hoy.completadas} completadas</span>}
                  </div>
                </div>

                {/* Citas semana */}
                <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Esta semana</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{huliData.semana.total}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-green-500">{huliData.semana.completadas} completadas</span>
                    {huliData.semana.noShow > 0 && <span className="text-xs text-red-500">{huliData.semana.noShow} no-show</span>}
                  </div>
                </div>

                {/* Ocupación mañana */}
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400">Ocupación mañana</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{huliData.ocupacionManana.porcentaje}%</p>
                  <p className="text-xs text-amber-500 mt-1">
                    {huliData.ocupacionManana.slotsOcupados}/{huliData.ocupacionManana.slotsTotal} slots
                  </p>
                </div>

                {/* Revenue */}
                {huliData.revenue ? (
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                    <p className="text-xs text-green-600 dark:text-green-400">Revenue mes</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ₡{huliData.revenue.estimado.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {stats?.completados || 0} estudios × ₡{huliData.revenue.precioUnitario.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Conversión mes</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{huliData.mes.tasaConversion}%</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {huliData.mes.leadsConCita} de {huliData.mes.totalLeads} leads
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel de reactivación */}
          {stats && stats.reactivacion.total > 0 && (
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

          {/* Por tipo + Fuente + Servicios */}
          {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leads por Fuente</h3>
              <div className="space-y-3">
                {Object.entries(stats.porFuente)
                  .sort(([,a], [,b]) => b - a)
                  .map(([fuente, count]) => {
                    const fuenteLabels: Record<string, string> = {
                      web: 'Página web', google_ads: 'Google Ads', facebook: 'Facebook/IG',
                      referido: 'Referido médico', whatsapp: 'WhatsApp', telefono: 'Teléfono',
                      desconocida: 'Sin fuente',
                    }
                    return (
                      <div key={fuente} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {fuenteLabels[fuente] || fuente}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min((count / Math.max(stats.total, 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
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
          )}

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

      {tab === 'inteligencia' && (
        <InteligenciaView />
      )}

      {tab === 'agenda' && (
        <AgendaCompleta />
      )}

      {tab === 'pipeline' && (
        <PipelineView leads={leads} onUpdate={loadData} />
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
  const noShow = leadsAll.filter(l => l.estado === 'no_show').length

  const porFuente = leadsAll.reduce((acc, l) => {
    const fuente = l.fuente || 'desconocida'
    acc[fuente] = (acc[fuente] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    ...base,
    noShow,
    porFuente,
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

// ── Inteligencia View ──────────────────────────────────────

interface IntelMetricas {
  totalCitas: number; tasaConfirmacion: number; tasaCancelacion: number
  tasaNoShow: number; tasaCompletado: number; confirmadas: number
  sinConfirmar: number; canceladasPorPaciente: number; canceladasPorCentro: number
  noShow: number; reagendadas: number
}
interface IntelOcupacion { nombre: string; tipo: string; totalCitas: number; completadas: number; canceladas: number; sinConfirmar: number }
interface IntelAlerta { tipo: 'urgente' | 'advertencia' | 'info'; titulo: string; detalle: string; accion: string }
interface IntelOportunidad { titulo: string; impacto: 'alto' | 'medio' | 'bajo'; detalle: string; accion: string }
interface IntelData {
  periodo: string
  rango: { from: string; to: string }
  metricas: IntelMetricas
  ocupacion: IntelOcupacion[]
  horarios: { pico: { hora: string; citas: number }[]; muertos: { hora: string; citas: number }[] }
  slotsMañana: { nombre: string; libres: number; total: number }[]
  alertas: IntelAlerta[]
  oportunidades: IntelOportunidad[]
}

function InteligenciaView() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<IntelData | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/medcare/intelligence?periodo=${periodo}`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [periodo])

  const alertaColors = {
    urgente: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600', title: 'text-red-800 dark:text-red-200' },
    advertencia: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600', title: 'text-amber-800 dark:text-amber-200' },
    info: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600', title: 'text-blue-800 dark:text-blue-200' },
  }

  const impactoColors = {
    alto: 'bg-red-100 text-red-700',
    medio: 'bg-amber-100 text-amber-700',
    bajo: 'bg-blue-100 text-blue-700',
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Analizando agenda...</p>
      </div>
    )
  }

  if (!data) return <p className="text-gray-500 text-center py-8">Error cargando inteligencia</p>

  const m = data.metricas

  return (
    <div className="space-y-6">
      {/* Periodo */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['semana', 'mes'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                periodo === p ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
              }`}>
              {p === 'semana' ? 'Última semana' : 'Este mes'}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{data.rango.from} — {data.rango.to}</span>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricaCircular label="Confirmación" valor={m.tasaConfirmacion} color={m.tasaConfirmacion >= 70 ? 'green' : m.tasaConfirmacion >= 40 ? 'amber' : 'red'} />
        <MetricaCircular label="Completado" valor={m.tasaCompletado} color={m.tasaCompletado >= 70 ? 'green' : 'amber'} />
        <MetricaCircular label="Cancelación" valor={m.tasaCancelacion} color={m.tasaCancelacion <= 10 ? 'green' : m.tasaCancelacion <= 25 ? 'amber' : 'red'} invertido />
        <MetricaCircular label="No Show" valor={m.tasaNoShow} color={m.tasaNoShow <= 5 ? 'green' : m.tasaNoShow <= 15 ? 'amber' : 'red'} invertido />
      </div>

      {/* Desglose cancelaciones */}
      {m.canceladasPorPaciente + m.canceladasPorCentro > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Desglose de cancelaciones</h4>
          <div className="flex gap-4">
            <div className="flex-1 bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{m.canceladasPorPaciente}</p>
              <p className="text-xs text-amber-600">Por paciente</p>
            </div>
            <div className="flex-1 bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{m.canceladasPorCentro}</p>
              <p className="text-xs text-blue-600">Por doctor/centro</p>
            </div>
            <div className="flex-1 bg-purple-50 dark:bg-purple-950 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{m.reagendadas}</p>
              <p className="text-xs text-purple-600">Reagendadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {data.alertas.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Alertas</h4>
          <div className="space-y-3">
            {data.alertas.map((alerta, i) => {
              const c = alertaColors[alerta.tipo]
              return (
                <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-lg ${c.icon}`}>
                      {alerta.tipo === 'urgente' ? '🔴' : alerta.tipo === 'advertencia' ? '🟡' : '🔵'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${c.title}`}>{alerta.titulo}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alerta.detalle}</p>
                      <div className="mt-2 bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Acción recomendada:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{alerta.accion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Oportunidades */}
      {data.oportunidades.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Oportunidades</h4>
          <div className="space-y-3">
            {data.oportunidades.map((op, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactoColors[op.impacto]}`}>
                        {op.impacto === 'alto' ? 'Alto impacto' : op.impacto === 'medio' ? 'Impacto medio' : 'Bajo impacto'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{op.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{op.detalle}</p>
                    <div className="mt-2 bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
                      <p className="text-xs text-green-700 dark:text-green-300">{op.accion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ocupación por servicio */}
      {data.ocupacion.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ocupación por servicio</h4>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-2 font-medium">Servicio</th>
                  <th className="text-center px-2 py-2 font-medium">Total</th>
                  <th className="text-center px-2 py-2 font-medium">Completadas</th>
                  <th className="text-center px-2 py-2 font-medium">Canceladas</th>
                  <th className="text-center px-2 py-2 font-medium">Sin confirmar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.ocupacion.map((o, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{o.nombre}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">{o.totalCitas}</td>
                    <td className="text-center px-2 py-2 text-green-600">{o.completadas}</td>
                    <td className="text-center px-2 py-2 text-red-600">{o.canceladas}</td>
                    <td className="text-center px-2 py-2 text-amber-600">{o.sinConfirmar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Horarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Horarios pico</h4>
          {data.horarios.pico.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-400">{h.hora}</span>
              <span className="text-sm font-bold text-green-600">{h.citas} citas</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Horarios baja demanda</h4>
          {data.horarios.muertos.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-400">{h.hora}</span>
              <span className="text-sm font-bold text-red-500">{h.citas} citas</span>
            </div>
          ))}
          {data.horarios.muertos.length === 0 && <p className="text-xs text-gray-400">Sin datos suficientes</p>}
        </div>
      </div>

      {/* Disponibilidad mañana */}
      {data.slotsMañana.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Disponibilidad mañana</h4>
          <div className="space-y-2">
            {data.slotsMañana.map((s, i) => {
              const ocupPct = Math.round(((s.total - s.libres) / s.total) * 100)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-32">{s.nombre}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div className={`h-4 rounded-full transition-all ${ocupPct > 70 ? 'bg-green-500' : ocupPct > 30 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${ocupPct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{ocupPct}% ({s.total - s.libres}/{s.total})</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricaCircular({ label, valor, color, invertido }: { label: string; valor: number; color: string; invertido?: boolean }) {
  const colorMap: Record<string, { ring: string; text: string; bg: string }> = {
    green: { ring: 'stroke-green-500', text: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-950' },
    amber: { ring: 'stroke-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950' },
    red: { ring: 'stroke-red-500', text: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950' },
  }
  const c = colorMap[color] || colorMap.amber
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (valor / 100) * circumference

  return (
    <div className={`${c.bg} rounded-xl p-4 flex flex-col items-center`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="6" strokeLinecap="round"
            className={c.ring} strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${c.text}`}>{valor}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">{label}</p>
      {invertido && valor > 0 && <p className="text-xs text-gray-400">(menor = mejor)</p>}
    </div>
  )
}

type VistaAgenda = 'dia' | 'mes' | 'año'

interface AgendaCita {
  id: string
  fecha: string
  hora: string
  horaFin: string
  paciente: string | null
  estado: string
  notas: string | null
  confirmadaPaciente: boolean
  primeraCita: boolean
  canceladoPorPaciente: boolean
}

interface AgendaSource {
  id: string
  nombre: string
  especialidad?: string
  tipo?: string
  color: string
  citas: AgendaCita[]
  total: number
}

type AgendaFilter = 'todos' | 'equipos' | 'doctores'

function AgendaCompleta() {
  const [vista, setVista] = useState<VistaAgenda>('dia')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mes, setMes] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}` })
  const [año, setAño] = useState(() => String(new Date().getFullYear()))
  const [loading, setLoading] = useState(true)
  const [equipos, setEquipos] = useState<AgendaSource[]>([])
  const [doctores, setDoctores] = useState<AgendaSource[]>([])
  const [resumen, setResumen] = useState({ totalCitas: 0, citasPendientes: 0, citasCompletadas: 0 })
  const [filtroTipo, setFiltroTipo] = useState<AgendaFilter>('todos')
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('todas')

  function getDateRange(): { from: string; to: string } {
    if (vista === 'dia') {
      return { from: date, to: date }
    } else if (vista === 'mes') {
      const [y, m] = mes.split('-').map(Number)
      const lastDay = new Date(y, m, 0).getDate()
      return { from: `${mes}-01`, to: `${mes}-${String(lastDay).padStart(2, '0')}` }
    } else {
      return { from: `${año}-01-01`, to: `${año}-12-31` }
    }
  }

  function loadAgenda() {
    setLoading(true)
    const { from, to } = getDateRange()
    const url = from === to
      ? `/api/medcare/agenda?date=${from}`
      : `/api/medcare/agenda?from=${from}&to=${to}`
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setEquipos(data.equipos || [])
          setDoctores(data.doctores || [])
          setResumen(data.resumen || { totalCitas: 0, citasPendientes: 0, citasCompletadas: 0 })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAgenda() }, [date, mes, año, vista])

  const statusColor: Record<string, string> = {
    BOOKED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NOSHOW: 'bg-orange-100 text-orange-700',
    RESCHEDULED: 'bg-yellow-100 text-yellow-700',
  }

  const statusLabel: Record<string, string> = {
    BOOKED: 'Pendiente',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NOSHOW: 'No asistió',
    RESCHEDULED: 'Reagendada',
  }

  function renderSource(source: AgendaSource) {
    return (
      <div key={source.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between"
          style={{ borderLeftWidth: 4, borderLeftColor: `#${source.color}` }}>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{source.nombre}</h4>
            {source.especialidad && <p className="text-xs text-gray-500">{source.especialidad}</p>}
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {source.total} citas
          </span>
        </div>
        {source.citas.length === 0 ? (
          <p className="px-4 py-3 text-xs text-gray-400">Sin citas para este día</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {source.citas.map(cita => (
              <div key={cita.id} className="px-4 py-2 flex items-center gap-3">
                <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300 shrink-0" style={{ minWidth: vista === 'dia' ? 96 : 160 }}>
                  {vista !== 'dia' && cita.fecha && (
                    <span className="text-xs text-gray-400 mr-1">{cita.fecha}</span>
                  )}
                  {cita.hora} - {cita.horaFin}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[cita.estado] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[cita.estado] || cita.estado}
                </span>
                {cita.primeraCita && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">1ra vez</span>
                )}
                {cita.confirmadaPaciente && (
                  <span className="text-xs text-green-600">✓ Confirmada</span>
                )}
                {cita.notas && (
                  <span className="text-xs text-gray-400 truncate max-w-[200px]">{cita.notas}</span>
                )}
                {/* Motivo de cancelación */}
                {cita.estado === 'CANCELLED' && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    cita.canceladoPorPaciente
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {cita.canceladoPorPaciente ? 'Por paciente' : 'Por doctor/centro'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header: vista + selector de fecha */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Selector de vista: Día / Mes / Año */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {([
            { key: 'dia', label: 'Día' },
            { key: 'mes', label: 'Mes' },
            { key: 'año', label: 'Año' },
          ] as { key: VistaAgenda; label: string }[]).map(v => (
            <button key={v.key}
              onClick={() => setVista(v.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                vista === v.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Selector según vista */}
        <div className="flex items-center gap-2">
          {vista === 'dia' && (
            <>
              <button onClick={() => {
                const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0])
              }} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <button onClick={() => {
                const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d.toISOString().split('T')[0])
              }} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1.5 text-xs rounded-lg bg-cyan-100 text-cyan-700 hover:bg-cyan-200 font-medium">
                Hoy
              </button>
            </>
          )}
          {vista === 'mes' && (
            <>
              <button onClick={() => {
                const [y, m] = mes.split('-').map(Number)
                const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
                setMes(prev)
              }} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <input type="month" value={mes} onChange={e => setMes(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <button onClick={() => {
                const [y, m] = mes.split('-').map(Number)
                const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
                setMes(next)
              }} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={() => { const n = new Date(); setMes(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`) }}
                className="px-3 py-1.5 text-xs rounded-lg bg-cyan-100 text-cyan-700 hover:bg-cyan-200 font-medium">
                Este mes
              </button>
            </>
          )}
          {vista === 'año' && (
            <>
              <button onClick={() => setAño(String(Number(año) - 1))}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <select value={año} onChange={e => setAño(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <button onClick={() => setAño(String(Number(año) + 1))}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={() => setAño(String(new Date().getFullYear()))}
                className="px-3 py-1.5 text-xs rounded-lg bg-cyan-100 text-cyan-700 hover:bg-cyan-200 font-medium">
                Este año
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filtro tipo: Todos / Equipos / Doctores */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {([
            { key: 'todos', label: 'Todos' },
            { key: 'equipos', label: 'Equipos' },
            { key: 'doctores', label: 'Doctores' },
          ] as { key: AgendaFilter; label: string }[]).map(f => (
            <button key={f.key}
              onClick={() => setFiltroTipo(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                filtroTipo === f.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtro por especialidad */}
        {(filtroTipo === 'todos' || filtroTipo === 'doctores') && (
          <select value={filtroEspecialidad}
            onChange={e => setFiltroEspecialidad(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="todas">Todas las especialidades</option>
            {[...new Set(doctores.map(d => d.especialidad).filter(Boolean))].sort().map(esp => (
              <option key={esp} value={esp!}>{esp}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando agenda de Huli...</p>
        </div>
      ) : (() => {
        // Calcular KPIs según filtros activos
        let sourcesVisibles: AgendaSource[] = []
        if (filtroTipo === 'todos') sourcesVisibles = [...equipos, ...doctores]
        else if (filtroTipo === 'equipos') sourcesVisibles = equipos
        else sourcesVisibles = doctores

        // Filtrar por especialidad si aplica
        if (filtroEspecialidad !== 'todas' && filtroTipo !== 'equipos') {
          sourcesVisibles = sourcesVisibles.filter(s =>
            s.tipo === 'equipo' || s.especialidad === filtroEspecialidad
          )
        }

        const allCitas = sourcesVisibles.flatMap(s => s.citas)
        const kpiTotal = allCitas.length
        const kpiPendientes = allCitas.filter(c => c.estado === 'BOOKED').length
        const kpiCompletadas = allCitas.filter(c => c.estado === 'COMPLETED').length
        const kpiCanceladas = allCitas.filter(c => c.estado === 'CANCELLED').length
        const kpiNoShow = allCitas.filter(c => c.estado === 'NOSHOW').length

        const filtroActivo = filtroTipo !== 'todos' || filtroEspecialidad !== 'todas'

        return (
        <>
          {/* Resumen del día — reactivo a filtros */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{kpiTotal}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{kpiPendientes}</p>
              <p className="text-xs text-amber-600">Pendientes</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{kpiCompletadas}</p>
              <p className="text-xs text-green-600">Completadas</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 rounded-xl p-4 text-center hidden sm:block">
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{kpiCanceladas}</p>
              <p className="text-xs text-red-600">Canceladas</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 rounded-xl p-4 text-center hidden sm:block">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{kpiNoShow}</p>
              <p className="text-xs text-orange-600">No Show</p>
            </div>
          </div>
          {filtroActivo && (
            <p className="text-xs text-gray-400">
              Mostrando: {filtroTipo === 'equipos' ? 'Equipos' : filtroTipo === 'doctores' ? 'Doctores' : 'Todos'}
              {filtroEspecialidad !== 'todas' && ` — ${filtroEspecialidad}`}
              {' '}({kpiTotal} de {resumen.totalCitas} citas totales del día)
            </p>
          )}

          {/* Equipos — filtrado */}
          {(filtroTipo === 'todos' || filtroTipo === 'equipos') && equipos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Equipos
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {equipos.reduce((s, e) => s + e.total, 0)} citas
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipos.filter(e => e.total > 0).map(renderSource)}
              </div>
              {equipos.every(e => e.total === 0) && (
                <p className="text-sm text-gray-400">Sin citas en equipos para este día</p>
              )}
            </div>
          )}

          {/* Doctores — filtrado */}
          {(filtroTipo === 'todos' || filtroTipo === 'doctores') && doctores.length > 0 && (() => {
            const filtrados = filtroEspecialidad === 'todas'
              ? doctores
              : doctores.filter(d => d.especialidad === filtroEspecialidad)
            const conCitas = filtrados.filter(d => d.total > 0)
            return (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Doctores {filtroEspecialidad !== 'todas' && `— ${filtroEspecialidad}`}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {filtrados.reduce((s, d) => s + d.total, 0)} citas
                  </span>
                </h3>
                {conCitas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conCitas.map(renderSource)}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Sin consultas {filtroEspecialidad !== 'todas' ? `de ${filtroEspecialidad}` : 'médicas'} para este día
                  </p>
                )}
              </div>
            )
          })()}
        </>
        )
      })()}

    </div>
  )
}

function PipelineView({ leads, onUpdate }: { leads: LeadMedcare[]; onUpdate: () => void }) {
  const columns: { key: string; label: string; color: string; borderColor: string }[] = [
    { key: 'nuevo', label: 'Nuevos', color: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-300 dark:border-blue-700' },
    { key: 'contactado', label: 'Contactados', color: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-300 dark:border-yellow-700' },
    { key: 'cita_agendada', label: 'Agendados', color: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300 dark:border-green-700' },
    { key: 'completado', label: 'Completados', color: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-300 dark:border-indigo-700' },
    { key: 'no_show', label: 'No Show', color: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300 dark:border-red-700' },
  ]

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[900px]">
        {columns.map(col => {
          const colLeads = leads.filter(l => l.estado === col.key)
          return (
            <div key={col.key} className={`flex-1 min-w-[200px] ${col.color} border ${col.borderColor} rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</h4>
                <span className="text-xs font-bold text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {colLeads.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Sin leads</p>
                )}
                {colLeads.map(lead => (
                  <div key={lead.id} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lead.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lead.telefono}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {lead.tipo_estudio === 'mamografia' ? 'Mamo' : lead.tipo_estudio === 'ultrasonido' ? 'US' : lead.origen_importacion ? 'CSV' : '-'}
                      </span>
                      {lead.fecha_cita && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {new Date(lead.fecha_cita).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                      {lead.huli_appointment_id && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 px-1.5 py-0.5 rounded">Huli</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    contactado: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    cita_agendada: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    completado: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    no_show: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    descartado: 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  }

  const labels: Record<string, string> = {
    nuevo: 'Nuevo',
    contactado: 'Contactado',
    cita_agendada: 'Agendado',
    completado: 'Completado',
    no_show: 'No Show',
    descartado: 'Descartado',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config[estado] || 'bg-gray-100 text-gray-600'}`}>
      {labels[estado] || estado}
    </span>
  )
}
