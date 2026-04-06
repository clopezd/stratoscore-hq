'use client'

import { useEffect, useState } from 'react'
import { getCitas } from '../services/citasService'
import { getPacientes } from '../services/pacientesService'
import { getEquipos } from '../services/equiposService'
import type { CitaConRelaciones, Paciente, Equipo } from '../types/database'
import { NavegacionMobility } from './NavegacionMobility'
import { PanelRecordatorios } from './PanelRecordatorios'
import { MobilityBrand } from '../brand'

export function ReportesAnalytics() {
  const [citas, setCitas] = useState<CitaConRelaciones[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [citasData, pacientesData, equiposData] = await Promise.all([
        getCitas(),
        getPacientes(),
        getEquipos(),
      ])
      setCitas(citasData)
      setPacientes(pacientesData)
      setEquipos(equiposData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas generales
  const pacientesActivos = pacientes.filter((p) => p.estado === 'activo').length
  const pacientesProximosVencimiento = pacientes.filter(
    (p) => p.estado === 'activo' && (p.sesiones_restantes || 0) <= 5
  ).length

  const hoy = new Date()
  const citasHoy = citas.filter((c) => {
    const citaFecha = new Date(c.fecha_hora)
    return citaFecha.toDateString() === hoy.toDateString() && c.estado !== 'cancelada'
  }).length

  const citasEstaSemana = citas.filter((c) => {
    const citaFecha = new Date(c.fecha_hora)
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 6)
    return citaFecha >= inicioSemana && citaFecha <= finSemana && c.estado !== 'cancelada'
  }).length

  const citasCompletadasMes = citas.filter((c) => {
    const citaFecha = new Date(c.fecha_hora)
    return (
      citaFecha.getMonth() === hoy.getMonth() &&
      citaFecha.getFullYear() === hoy.getFullYear() &&
      c.estado === 'completada'
    )
  }).length

  const citasCanceladasMes = citas.filter((c) => {
    const citaFecha = new Date(c.fecha_hora)
    return (
      citaFecha.getMonth() === hoy.getMonth() &&
      citaFecha.getFullYear() === hoy.getFullYear() &&
      c.estado === 'cancelada'
    )
  }).length

  // Tasa de ocupación semanal
  const horasOcupadasSemana = citas
    .filter((c) => {
      const citaFecha = new Date(c.fecha_hora)
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1)
      const finSemana = new Date(inicioSemana)
      finSemana.setDate(inicioSemana.getDate() + 6)
      return citaFecha >= inicioSemana && citaFecha <= finSemana && c.estado !== 'cancelada'
    })
    .reduce((total, cita) => total + (cita.duracion_minutos / 60), 0)

  const equiposActivos = equipos.filter((e) => e.activo).length
  const horasMaximasSemana = 48 * equiposActivos // 8h/día * 6 días
  const tasaOcupacion = horasMaximasSemana > 0
    ? Math.round((horasOcupadasSemana / horasMaximasSemana) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <NavegacionMobility />
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando reportes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavegacionMobility />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Analytics</h1>
        <p className="text-gray-600 text-sm mt-1">
          Métricas y estadísticas del centro
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          titulo="Ocupación Semanal"
          valor={`${tasaOcupacion}%`}
          icono="📊"
          color={tasaOcupacion >= 60 ? 'green' : tasaOcupacion >= 40 ? 'yellow' : 'red'}
          subtitulo={`${horasOcupadasSemana.toFixed(1)}h de ${horasMaximasSemana}h`}
        />
        <MetricCard
          titulo="Citas Hoy"
          valor={citasHoy.toString()}
          icono="📅"
          color="blue"
        />
        <MetricCard
          titulo="Pacientes Activos"
          valor={pacientesActivos.toString()}
          icono="👥"
          color="blue"
        />
        <MetricCard
          titulo="Próximos a Vencer"
          valor={pacientesProximosVencimiento.toString()}
          icono="⚠️"
          color={pacientesProximosVencimiento > 0 ? 'yellow' : 'green'}
          subtitulo="≤5 sesiones restantes"
        />
      </div>

      {/* Métricas Mensuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard
          titulo="Citas Completadas (Mes)"
          valor={citasCompletadasMes.toString()}
          icono="✅"
          color="green"
        />
        <MetricCard
          titulo="Citas Canceladas (Mes)"
          valor={citasCanceladasMes.toString()}
          icono="❌"
          color="red"
        />
        <MetricCard
          titulo="Tasa de No-Show"
          valor={`${citasCompletadasMes + citasCanceladasMes > 0
            ? Math.round((citasCanceladasMes / (citasCompletadasMes + citasCanceladasMes)) * 100)
            : 0}%`}
          icono="📉"
          color="gray"
        />
      </div>

      {/* Panel de Recordatorios */}
      <div className="mb-6">
        <PanelRecordatorios />
      </div>

      {/* Objetivo de Ocupación */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Progreso hacia Objetivo de Ocupación
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Actual</span>
            <span className="text-sm font-bold" style={{ color: MobilityBrand.colors.primary }}>
              {tasaOcupacion}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
            <div
              className="h-6 rounded-full transition-all flex items-center justify-end pr-3 text-white text-xs font-bold"
              style={{
                width: `${tasaOcupacion}%`,
                background: MobilityBrand.gradients.primary,
              }}
            >
              {tasaOcupacion >= 15 && `${tasaOcupacion}%`}
            </div>
            {/* Línea objetivo 80% */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-green-500"
              style={{ left: '80%' }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>0%</span>
            <span className="font-semibold text-green-600">Meta: 80%</span>
            <span>100%</span>
          </div>
          {tasaOcupacion < 80 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📈 <strong>Faltan {80 - tasaOcupacion} puntos</strong> para alcanzar la meta de 80% de ocupación.
                Se requieren aproximadamente <strong>{Math.ceil((80 - tasaOcupacion) / 100 * horasMaximasSemana)}</strong> horas
                adicionales de citas esta semana.
              </p>
            </div>
          )}
          {tasaOcupacion >= 80 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                🎉 <strong>¡Meta alcanzada!</strong> El centro está operando al {tasaOcupacion}% de su capacidad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para tarjetas de métricas
function MetricCard({
  titulo,
  valor,
  icono,
  color,
  subtitulo,
}: {
  titulo: string
  valor: string
  icono: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  subtitulo?: string
}) {
  const colores = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  }

  const style = colores[color]

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border ${style.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{titulo}</span>
        <span className="text-2xl">{icono}</span>
      </div>
      <div className={`text-3xl font-bold ${style.text}`}>{valor}</div>
      {subtitulo && <div className="text-xs text-gray-500 mt-1">{subtitulo}</div>}
    </div>
  )
}
