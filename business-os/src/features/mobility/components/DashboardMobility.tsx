'use client'

import { useEffect, useState } from 'react'
import { getMetricasOcupacion } from '../services/citasService'
import { getPacientesProximoVencimiento } from '../services/pacientesService'
import type { MetricasOcupacion, PacienteProximoVencimiento } from '../types/database'
import { NuevoPacienteModal } from './NuevoPacienteModal'
import { NuevaCitaModal } from './NuevaCitaModal'

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
      const [datosMetricas, datosRenovacion] = await Promise.all([
        getMetricasOcupacion(),
        getPacientesProximoVencimiento(),
      ])

      setMetricas(datosMetricas)
      setPacientesRenovacion(datosRenovacion)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mobility Group CR</h1>
        <p className="text-gray-600">Centro de Rehabilitación Robótica</p>
      </div>

      {/* Navegación */}
      <div className="mb-8 flex gap-4">
        <a
          href="/mobility"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Dashboard
        </a>
        <a
          href="/mobility/calendario"
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Calendario
        </a>
        <a
          href="/mobility/pacientes"
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Pacientes
        </a>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Ocupación Hoy */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ocupación Hoy</h3>
            <span className={`text-2xl ${getColorOcupacion(metricas.porcentaje_ocupacion_hoy)}`}>
              📊
            </span>
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
            <span className="text-2xl">📈</span>
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
            <span className="text-2xl">🤖</span>
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
            <span className="text-2xl">🎯</span>
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

      {/* Acciones rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setModalCita(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition"
        >
          ➕ Nueva Cita
        </button>
        <button
          onClick={() => setModalPaciente(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition"
        >
          👤 Nuevo Paciente
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition">
          📊 Ver Reportes
        </button>
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
