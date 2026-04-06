'use client'

import { useEffect, useState } from 'react'
import { getEquipos, updateEquipo } from '../services/equiposService'
import { getCitasSemana } from '../services/citasService'
import type { Equipo, CitaConRelaciones } from '../types/database'
import { NavegacionMobility } from './NavegacionMobility'
import { MobilityBrand } from '../brand'

export function PanelEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [citas, setCitas] = useState<CitaConRelaciones[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [equiposData, citasData] = await Promise.all([
        getEquipos(),
        getCitasSemana(),
      ])
      setEquipos(equiposData)
      setCitas(citasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleEstadoEquipo(equipoId: string, activo: boolean) {
    try {
      await updateEquipo(equipoId, { activo })
      await cargarDatos()
    } catch (error) {
      console.error('Error actualizando equipo:', error)
    }
  }

  // Calcular métricas por equipo
  function getMetricasEquipo(equipoId: string) {
    const citasEquipo = citas.filter(
      (c) => c.equipo_id === equipoId && c.estado !== 'cancelada'
    )

    const hoy = new Date()
    const citasHoy = citasEquipo.filter((c) => {
      const citaFecha = new Date(c.fecha_hora)
      return citaFecha.toDateString() === hoy.toDateString()
    })

    const citasSemana = citasEquipo.length
    const horasOcupadasSemana = citasEquipo.reduce(
      (total, cita) => total + (cita.duracion_minutos / 60),
      0
    )

    // Calcular % ocupación (asumiendo 8h/día * 6 días = 48h/semana máx)
    const horasMaximasSemana = 48
    const ocupacion = Math.round((horasOcupadasSemana / horasMaximasSemana) * 100)

    return {
      citasHoy: citasHoy.length,
      citasSemana,
      horasOcupadasSemana: horasOcupadasSemana.toFixed(1),
      ocupacion,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <NavegacionMobility />
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando equipos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavegacionMobility />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h1>
        <p className="text-gray-600 text-sm mt-1">
          Monitorea el estado y ocupación de los equipos Lokomat
        </p>
      </div>

      {/* Grid de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos.map((equipo) => {
          const metricas = getMetricasEquipo(equipo.id)

          return (
            <div
              key={equipo.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition ${
                !equipo.activo ? 'opacity-60' : ''
              }`}
            >
              {/* Header del Card */}
              <div
                className="px-6 py-4"
                style={{
                  background: MobilityBrand.gradients.primary,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{equipo.nombre}</h3>
                    <p className="text-sm opacity-90">{equipo.ubicacion}</p>
                  </div>
                  <div className="text-3xl">🤖</div>
                </div>
              </div>

              {/* Métricas */}
              <div className="p-6 space-y-4">
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        equipo.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {equipo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Ocupación */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Ocupación Semanal
                    </span>
                    <span className="text-sm font-bold" style={{ color: MobilityBrand.colors.primary }}>
                      {metricas.ocupacion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${metricas.ocupacion}%`,
                        background: MobilityBrand.gradients.primary,
                      }}
                    />
                  </div>
                </div>

                {/* Métricas de Citas */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metricas.citasHoy}
                    </div>
                    <div className="text-xs text-gray-600">Citas hoy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metricas.citasSemana}
                    </div>
                    <div className="text-xs text-gray-600">Esta semana</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-lg font-bold text-gray-900">
                      {metricas.horasOcupadasSemana}h
                    </div>
                    <div className="text-xs text-gray-600">Horas ocupadas esta semana</div>
                  </div>
                </div>

                {/* Botón Toggle Estado */}
                <button
                  onClick={() => toggleEstadoEquipo(equipo.id, !equipo.activo)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    equipo.activo
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {equipo.activo ? 'Desactivar Equipo' : 'Activar Equipo'}
                </button>

                {/* Última Mantención (si está disponible) */}
                {equipo.ultima_mantencion && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-600">Última mantención</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(equipo.ultima_mantencion).toLocaleDateString('es-CR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen Global */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen Global</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {equipos.filter((e) => e.activo).length}/{equipos.length}
            </div>
            <div className="text-sm text-gray-600">Equipos Activos</div>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: MobilityBrand.colors.primary }}>
              {citas.filter((c) => {
                const citaFecha = new Date(c.fecha_hora)
                return citaFecha.toDateString() === new Date().toDateString()
              }).length}
            </div>
            <div className="text-sm text-gray-600">Citas Hoy</div>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: MobilityBrand.colors.primary }}>
              {citas.filter((c) => c.estado !== 'cancelada').length}
            </div>
            <div className="text-sm text-gray-600">Citas Esta Semana</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {Math.round(
                (citas.reduce((total, c) => total + (c.duracion_minutos / 60), 0) /
                  (48 * equipos.filter((e) => e.activo).length)) *
                  100
              )}%
            </div>
            <div className="text-sm text-gray-600">Ocupación Promedio</div>
          </div>
        </div>
      </div>
    </div>
  )
}
