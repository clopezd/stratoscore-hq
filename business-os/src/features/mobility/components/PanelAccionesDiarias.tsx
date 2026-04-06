'use client'

import { useEffect, useState, useCallback } from 'react'
import { NavegacionMobility } from './NavegacionMobility'

interface Metricas {
  ocupacion_hoy_pct: number
  ocupacion_semana_pct: number
  meta_pct: number
  slots_vacios_hoy: number
  total_acciones: number
}

interface SlotVacio {
  equipo_id: string
  equipo_nombre: string
  hora: string
  fecha_hora: string
}

interface AccionRenovacion {
  id: string
  nombre: string
  telefono: string
  sesiones_restantes: number
  fecha_ultima_sesion: string | null
  prioridad: string
  mensaje: string
}

interface AccionLead {
  id: string
  nombre: string
  telefono: string
  diagnostico: string | null
  fuente: string | null
  estado: string
  created_at: string
  mensaje: string
}

interface AccionInactivo {
  id: string
  nombre: string
  telefono: string
  dias_sin_sesion: number
  sesiones_restantes: number | null
  fecha_ultima_sesion: string | null
  mensaje: string
}

interface DatosAcciones {
  metricas: Metricas
  slots_vacios: SlotVacio[]
  renovaciones: AccionRenovacion[]
  leads_nuevos: AccionLead[]
  pacientes_inactivos: AccionInactivo[]
}

function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button
      onClick={copiar}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        copiado
          ? 'bg-green-100 text-green-700'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      {copiado ? 'Copiado' : 'Copiar mensaje'}
    </button>
  )
}

function BotonMarcar({
  tipo,
  id,
  onDone,
}: {
  tipo: string
  id: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  const marcar = async () => {
    setLoading(true)
    try {
      await fetch('/api/mobility/acciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, id }),
      })
      onDone()
    } catch {
      alert('Error marcando acción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={marcar}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Contactado'}
    </button>
  )
}

function BadgePrioridad({ prioridad }: { prioridad: string }) {
  const colores: Record<string, string> = {
    alta: 'bg-red-100 text-red-700',
    urgente: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    proximo: 'bg-yellow-100 text-yellow-700',
    baja: 'bg-green-100 text-green-700',
    normal: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colores[prioridad] || 'bg-gray-100 text-gray-600'}`}>
      {prioridad}
    </span>
  )
}

function BarraOcupacion({ actual, meta }: { actual: number; meta: number }) {
  const color = actual >= meta ? 'bg-green-500' : actual >= 70 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 relative">
      <div className={`h-3 rounded-full transition-all ${color}`} style={{ width: `${Math.min(actual, 100)}%` }} />
      <div className="absolute top-0 h-3 w-0.5 bg-gray-800" style={{ left: `${meta}%` }} title={`Meta: ${meta}%`} />
    </div>
  )
}

export function PanelAccionesDiarias() {
  const [datos, setDatos] = useState<DatosAcciones | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>('renovaciones')

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/mobility/acciones')
      if (!res.ok) throw new Error('Error cargando acciones')
      const data = await res.json()
      setDatos(data)
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <NavegacionMobility />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  if (error || !datos) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <NavegacionMobility />
        <div className="text-center py-12 text-red-600">Error: {error}</div>
      </div>
    )
  }

  const { metricas } = datos
  const secciones = [
    {
      key: 'renovaciones',
      titulo: 'Renovaciones Pendientes',
      icono: '🔄',
      color: 'border-orange-400',
      count: datos.renovaciones.length,
      desc: 'Pacientes que necesitan renovar su plan',
    },
    {
      key: 'leads',
      titulo: 'Leads Nuevos',
      icono: '🆕',
      color: 'border-blue-400',
      count: datos.leads_nuevos.length,
      desc: 'Solicitudes de evaluación sin responder',
    },
    {
      key: 'inactivos',
      titulo: 'Pacientes Inactivos',
      icono: '⚠️',
      color: 'border-red-400',
      count: datos.pacientes_inactivos.length,
      desc: 'Pacientes activos sin sesión hace +14 días',
    },
    {
      key: 'slots',
      titulo: 'Slots Vacíos Hoy',
      icono: '📅',
      color: 'border-gray-400',
      count: datos.slots_vacios.length,
      desc: 'Horarios disponibles hoy',
    },
  ]

  return (
    <div className="min-h-full bg-gray-50 p-6 relative">
      {/* Marca de agua */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('https://mobilitygroup.co/wp-content/uploads/2022/11/LOGOS-MOBILITY-e1669820172138.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: '50%',
          opacity: 0.05,
          zIndex: 0,
        }}
      />

      <div className="relative z-10 pb-20">
        <NavegacionMobility />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Acciones del Día</h1>
            <p className="text-sm text-gray-500 mt-1">
              {metricas.total_acciones} acciones pendientes para llenar la agenda
            </p>
          </div>
          <button
            onClick={cargar}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Actualizar
          </button>
        </div>

        {/* Métricas de ocupación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Ocupación Hoy</h3>
              <span className="text-2xl font-bold text-gray-900">{metricas.ocupacion_hoy_pct}%</span>
            </div>
            <BarraOcupacion actual={metricas.ocupacion_hoy_pct} meta={metricas.meta_pct} />
            <p className="text-xs text-gray-500 mt-2">
              Meta: {metricas.meta_pct}% · {metricas.slots_vacios_hoy} slots vacíos
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">Ocupación Semana</h3>
              <span className="text-2xl font-bold text-gray-900">{metricas.ocupacion_semana_pct}%</span>
            </div>
            <BarraOcupacion actual={metricas.ocupacion_semana_pct} meta={metricas.meta_pct} />
            <p className="text-xs text-gray-500 mt-2">Meta: {metricas.meta_pct}%</p>
          </div>
        </div>

        {/* Secciones de acciones */}
        <div className="space-y-4">
          {secciones.map((sec) => (
            <div key={sec.key} className={`bg-white rounded-lg shadow border-l-4 ${sec.color}`}>
              {/* Header de sección (clickeable) */}
              <button
                onClick={() => setSeccionAbierta(seccionAbierta === sec.key ? null : sec.key)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sec.icono}</span>
                  <div className="text-left">
                    <h2 className="font-semibold text-gray-900">{sec.titulo}</h2>
                    <p className="text-xs text-gray-500">{sec.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                    {sec.count}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${seccionAbierta === sec.key ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Contenido expandible */}
              {seccionAbierta === sec.key && (
                <div className="border-t border-gray-100 px-5 py-4">
                  {sec.key === 'renovaciones' && (
                    <div className="space-y-3">
                      {datos.renovaciones.length === 0 && <p className="text-sm text-gray-500">Sin renovaciones pendientes</p>}
                      {datos.renovaciones.map((p) => (
                        <div key={p.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">{p.nombre}</span>
                              <BadgePrioridad prioridad={p.prioridad} />
                            </div>
                            <p className="text-xs text-gray-500">
                              {p.sesiones_restantes} sesiones restantes · Tel: {p.telefono}
                            </p>
                            <p className="text-xs text-blue-600 mt-1 italic">"{p.mensaje}"</p>
                          </div>
                          <div className="flex gap-2 ml-3 shrink-0">
                            <BotonCopiar texto={p.mensaje} />
                            <BotonMarcar tipo="renovacion" id={p.id} onDone={cargar} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.key === 'leads' && (
                    <div className="space-y-3">
                      {datos.leads_nuevos.length === 0 && <p className="text-sm text-gray-500">Sin leads pendientes</p>}
                      {datos.leads_nuevos.map((l) => (
                        <div key={l.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">{l.nombre}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                l.estado === 'nuevo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                              }`}>{l.estado}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {l.diagnostico || 'Sin diagnóstico'} · {l.fuente || '?'} · Tel: {l.telefono}
                            </p>
                            <p className="text-xs text-blue-600 mt-1 italic">"{l.mensaje}"</p>
                          </div>
                          <div className="flex gap-2 ml-3 shrink-0">
                            <BotonCopiar texto={l.mensaje} />
                            <BotonMarcar tipo="lead" id={l.id} onDone={cargar} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.key === 'inactivos' && (
                    <div className="space-y-3">
                      {datos.pacientes_inactivos.length === 0 && <p className="text-sm text-gray-500">Sin pacientes inactivos</p>}
                      {datos.pacientes_inactivos.map((p) => (
                        <div key={p.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">{p.nombre}</span>
                              <BadgePrioridad prioridad={p.dias_sin_sesion > 30 ? 'alta' : 'media'} />
                            </div>
                            <p className="text-xs text-gray-500">
                              {p.dias_sin_sesion} días sin sesión · {p.sesiones_restantes ?? '?'} restantes · Tel: {p.telefono}
                            </p>
                            <p className="text-xs text-blue-600 mt-1 italic">"{p.mensaje}"</p>
                          </div>
                          <div className="flex gap-2 ml-3 shrink-0">
                            <BotonCopiar texto={p.mensaje} />
                            <BotonMarcar tipo="inactivo" id={p.id} onDone={cargar} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.key === 'slots' && (
                    <div className="space-y-3">
                      {datos.slots_vacios.length === 0 && <p className="text-sm text-gray-500">Sin slots vacíos hoy</p>}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {datos.slots_vacios.map((s, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
                            <p className="font-medium text-gray-900">{s.hora}</p>
                            <p className="text-xs text-gray-500">{s.equipo_nombre}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
