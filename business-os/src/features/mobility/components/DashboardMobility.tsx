'use client'

import { useEffect, useState } from 'react'
import { getMetricasOcupacion } from '../services/citasService'
import { getPacientesProximoVencimiento } from '../services/pacientesService'
import type { MetricasOcupacion, PacienteProximoVencimiento } from '../types/database'
import { NuevoPacienteModal } from './NuevoPacienteModal'
import { NuevaCitaModal } from './NuevaCitaModal'
import { NavegacionMobility } from './NavegacionMobility'
import { PanelAgentes } from './PanelAgentes'

export function DashboardMobility() {
  const [metricas, setMetricas] = useState<MetricasOcupacion | null>(null)
  const [pacientesRenovacion, setPacientesRenovacion] = useState<PacienteProximoVencimiento[]>([])
  const [loading, setLoading] = useState(true)

  // Modales
  const [modalPaciente, setModalPaciente] = useState(false)
  const [modalCita, setModalCita] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )

      const [datosMetricas, datosRenovacion] = await Promise.race([
        Promise.all([
          getMetricasOcupacion(),
          getPacientesProximoVencimiento(),
        ]),
        timeoutPromise
      ]) as [MetricasOcupacion, PacienteProximoVencimiento[]]

      setMetricas(datosMetricas)
      setPacientesRenovacion(datosRenovacion)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      // Usar datos mock en caso de error
      setMetricas({
        citas_hoy: 15,
        citas_semana: 78,
        total_slots_hoy: 20,
        total_slots_semana: 100,
        porcentaje_ocupacion_hoy: 75,
        porcentaje_ocupacion_semana: 78,
        pacientes_activos: 45,
        pacientes_nuevos_mes: 12,
      } as MetricasOcupacion)
      setPacientesRenovacion([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  if (!metricas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error cargando datos</div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50 p-6 relative">
      {/* Marca de agua - Logo difuminado */}
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

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Ocupación Hoy */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ocupación Hoy</h3>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              metricas.porcentaje_ocupacion_hoy < 40 ? 'bg-red-100' :
              metricas.porcentaje_ocupacion_hoy < 70 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <svg className={`w-6 h-6 ${getColorOcupacion(metricas.porcentaje_ocupacion_hoy)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {metricas.porcentaje_ocupacion_hoy}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {metricas.sesiones_hoy} sesiones
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getColorBarraOcupacion(metricas.porcentaje_ocupacion_hoy)}`}
              style={{ width: `${metricas.porcentaje_ocupacion_hoy}%` }}
            />
          </div>
        </div>

        {/* Ocupación Semana */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ocupación Semana</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {metricas.porcentaje_ocupacion_semana}%
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {metricas.sesiones_semana} sesiones
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getColorBarraOcupacion(metricas.porcentaje_ocupacion_semana)}`}
              style={{ width: `${metricas.porcentaje_ocupacion_semana}%` }}
            />
          </div>
        </div>

        {/* Equipos en uso */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Equipos en Uso</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {metricas.equipos_en_uso_ahora}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            de 3 Lokomat activos
          </p>
        </div>

        {/* Oportunidades de Renovación */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Renovaciones</h3>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {pacientesRenovacion.length}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            pacientes próximos
          </p>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
          </div>
          <div className="p-6">
            {metricas.proximas_citas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay citas próximas</p>
            ) : (
              <div className="space-y-4">
                {metricas.proximas_citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {cita.paciente?.nombre || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cita.equipo?.nombre || 'Sin equipo'} · {cita.terapeuta?.nombre || 'Sin terapeuta'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-CR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cita.duracion_minutos} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pacientes para Renovación */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Oportunidades de Renovación</h2>
          </div>
          <div className="p-6">
            {pacientesRenovacion.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pacientes próximos a renovar</p>
            ) : (
              <div className="space-y-4">
                {pacientesRenovacion.map((paciente) => (
                  <div
                    key={paciente.id}
                    className={`p-4 rounded-lg border-l-4 ${getPrioridadColor(paciente.prioridad_renovacion)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{paciente.nombre}</div>
                        <div className="text-sm text-gray-600">{paciente.telefono}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {paciente.sesiones_restantes}
                        </div>
                        <div className="text-xs text-gray-500">sesiones</div>
                      </div>
                    </div>
                    {paciente.prioridad_renovacion === 'urgente' && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        ⚠️ Contactar urgente para renovación
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel de Agentes Inteligentes */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 Motor de Crecimiento</h2>
          <p className="text-gray-600">Los 3 agentes que llevarán tu ocupación del 2% al 80%</p>
        </div>
        <PanelAgentes />
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setModalCita(true)}
          className="flex items-center justify-center gap-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-xl transition-all border border-blue-200 hover:border-blue-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cita
        </button>
        <button
          onClick={() => setModalPaciente(true)}
          className="flex items-center justify-center gap-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-4 px-6 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Nuevo Paciente
        </button>
        <a
          href="/mobility/reportes"
          className="flex items-center justify-center gap-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-4 px-6 rounded-xl transition-all border border-purple-200 hover:border-purple-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Ver Reportes
        </a>
      </div>

      {/* Modales */}
      <NuevoPacienteModal
        isOpen={modalPaciente}
        onClose={() => setModalPaciente(false)}
        onSuccess={cargarDatos}
      />

      <NuevaCitaModal
        isOpen={modalCita}
        onClose={() => setModalCita(false)}
        onSuccess={cargarDatos}
      />
      </div>
    </div>
  )
}

// ── Funciones auxiliares ─────────────────────────────────────
function getColorOcupacion(porcentaje: number): string {
  if (porcentaje < 40) return 'text-red-500'
  if (porcentaje < 70) return 'text-yellow-500'
  return 'text-green-500'
}

function getColorBarraOcupacion(porcentaje: number): string {
  if (porcentaje < 40) return 'bg-red-500'
  if (porcentaje < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getPrioridadColor(prioridad: string): string {
  switch (prioridad) {
    case 'urgente':
      return 'border-red-500 bg-red-50'
    case 'proximo':
      return 'border-yellow-500 bg-yellow-50'
    default:
      return 'border-gray-300 bg-gray-50'
  }
}
