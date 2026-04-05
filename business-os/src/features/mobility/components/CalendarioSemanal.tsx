'use client'

import { useEffect, useState } from 'react'
import { getCitasSemana } from '../services/citasService'
import type { CitaConRelaciones } from '../types/database'
import { NuevaCitaModal } from './NuevaCitaModal'
import { GestionarCitaModal } from './GestionarCitaModal'
import { NavegacionMobility } from './NavegacionMobility'

export function CalendarioSemanal() {
  const [citas, setCitas] = useState<CitaConRelaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNueva, setModalNueva] = useState(false)
  const [modalGestionar, setModalGestionar] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaConRelaciones | null>(null)
  const [semanaActual, setSemanaActual] = useState(new Date())

  useEffect(() => {
    cargarCitas()
  }, [semanaActual])

  async function cargarCitas() {
    setLoading(true)
    try {
      const data = await getCitasSemana()
      setCitas(data)
    } catch (error) {
      console.error('Error cargando citas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generar días de la semana actual
  function getDiasSemana() {
    const inicio = new Date(semanaActual)
    const diaSemana = inicio.getDay()
    const diff = inicio.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1)
    inicio.setDate(diff)
    inicio.setHours(0, 0, 0, 0)

    const dias = []
    for (let i = 0; i < 6; i++) { // Lun-Sáb
      const dia = new Date(inicio)
      dia.setDate(dia.getDate() + i)
      dias.push(dia)
    }
    return dias
  }

  const diasSemana = getDiasSemana()

  // Agrupar citas por día y equipo
  function getCitasPorDiaYEquipo(fecha: Date, equipoId: string) {
    return citas.filter((cita) => {
      const citaFecha = new Date(cita.fecha_hora)
      return (
        citaFecha.toDateString() === fecha.toDateString() &&
        cita.equipo_id === equipoId &&
        cita.estado !== 'cancelada'
      )
    })
  }

  const equipos = ['lokomat_1', 'lokomat_2', 'lokomat_3']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavegacionMobility />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 text-sm mt-1">
            {diasSemana[0].toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })} -{' '}
            {diasSemana[5].toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setModalNueva(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Navegación Semana */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => {
            const nueva = new Date(semanaActual)
            nueva.setDate(nueva.getDate() - 7)
            setSemanaActual(nueva)
          }}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          ← Anterior
        </button>

        <button
          onClick={() => setSemanaActual(new Date())}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Hoy
        </button>

        <button
          onClick={() => {
            const nueva = new Date(semanaActual)
            nueva.setDate(nueva.getDate() + 7)
            setSemanaActual(nueva)
          }}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Siguiente →
        </button>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando calendario...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 sticky left-0 bg-white">
                  Equipo
                </th>
                {diasSemana.map((dia) => (
                  <th
                    key={dia.toISOString()}
                    className={`px-4 py-3 text-center text-sm font-medium ${
                      dia.toDateString() === new Date().toDateString()
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900'
                    }`}
                  >
                    <div>{dia.toLocaleDateString('es-CR', { weekday: 'short' })}</div>
                    <div className="text-lg font-bold">{dia.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipos.map((equipoId) => (
                <tr key={equipoId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {equipoId === 'lokomat_1'
                      ? 'Lokomat 1'
                      : equipoId === 'lokomat_2'
                      ? 'Lokomat 2'
                      : 'Lokomat 3'}
                  </td>
                  {diasSemana.map((dia) => {
                    const citasDia = getCitasPorDiaYEquipo(dia, equipoId)
                    return (
                      <td
                        key={`${equipoId}-${dia.toISOString()}`}
                        className={`px-2 py-2 align-top ${
                          dia.toDateString() === new Date().toDateString()
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <div className="space-y-1">
                          {citasDia.map((cita) => {
                            const hora = new Date(cita.fecha_hora)
                            return (
                              <div
                                key={cita.id}
                                onClick={() => {
                                  setCitaSeleccionada(cita)
                                  setModalGestionar(true)
                                }}
                                className={`text-xs p-2 rounded ${
                                  cita.estado === 'completada'
                                    ? 'bg-green-100 text-green-800'
                                    : cita.estado === 'en_curso'
                                    ? 'bg-blue-100 text-blue-800'
                                    : cita.estado === 'cancelada'
                                    ? 'bg-red-100 text-red-800 line-through'
                                    : 'bg-gray-100 text-gray-800'
                                } cursor-pointer hover:opacity-80 transition`}
                                title={cita.paciente?.nombre || 'Sin nombre'}
                              >
                                <div className="font-medium">
                                  {hora.toLocaleTimeString('es-CR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div className="truncate">
                                  {cita.paciente?.nombre || 'Sin nombre'}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
          <span className="text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
          <span className="text-gray-600">En curso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span className="text-gray-600">Completada</span>
        </div>
      </div>

      {/* Modales */}
      <NuevaCitaModal
        isOpen={modalNueva}
        onClose={() => setModalNueva(false)}
        onSuccess={cargarCitas}
      />

      <GestionarCitaModal
        isOpen={modalGestionar}
        onClose={() => {
          setModalGestionar(false)
          setCitaSeleccionada(null)
        }}
        onSuccess={cargarCitas}
        cita={citaSeleccionada}
      />
    </div>
  )
}
