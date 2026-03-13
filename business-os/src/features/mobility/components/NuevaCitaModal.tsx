'use client'

import { useState, useEffect } from 'react'
import { createCita, verificarDisponibilidad } from '../services/citasService'
import { getPacientes } from '../services/pacientesService'
import type { CitaInsert, Paciente } from '../types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function NuevaCitaModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false)

  const [formData, setFormData] = useState<CitaInsert>({
    paciente_id: '',
    equipo_id: 'lokomat_1',
    fecha_hora: '',
    duracion_minutos: 60,
    tipo_sesion: 'rehabilitacion',
  })

  // Cargar pacientes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarPacientes()
    }
  }, [isOpen])

  async function cargarPacientes() {
    try {
      const data = await getPacientes({ estado: 'activo' })
      setPacientes(data)
    } catch (err) {
      console.error('Error cargando pacientes:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar disponibilidad antes de crear
      setVerificandoDisponibilidad(true)
      const disponible = await verificarDisponibilidad(
        formData.equipo_id!,
        formData.fecha_hora,
        formData.duracion_minutos
      )

      setVerificandoDisponibilidad(false)

      if (!disponible) {
        setError('El equipo ya está ocupado en ese horario. Por favor elige otro horario.')
        setLoading(false)
        return
      }

      // Crear la cita
      await createCita(formData)

      // Limpiar formulario
      setFormData({
        paciente_id: '',
        equipo_id: 'lokomat_1',
        fecha_hora: '',
        duracion_minutos: 60,
        tipo_sesion: 'rehabilitacion',
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error creando cita:', err)
      setError('Error al crear la cita. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Generar opciones de fecha/hora (hoy + 30 días)
  function generarHorarios() {
    const horarios: string[] = []
    const hoy = new Date()

    for (let dia = 0; dia < 30; dia++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() + dia)

      // Saltar domingos
      if (fecha.getDay() === 0) continue

      // Horarios de 8 AM a 5 PM
      const horaInicio = fecha.getDay() === 6 ? 8 : 8 // Sábado 8-1PM
      const horaFin = fecha.getDay() === 6 ? 13 : 18 // Sábado hasta 1PM

      for (let hora = horaInicio; hora < horaFin; hora++) {
        const fechaHora = new Date(fecha)
        fechaHora.setHours(hora, 0, 0, 0)
        horarios.push(fechaHora.toISOString().slice(0, 16))
      }
    }

    return horarios
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.paciente_id}
              onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona un paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {p.telefono}
                </option>
              ))}
            </select>
            {pacientes.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No hay pacientes activos. Crea uno primero.
              </p>
            )}
          </div>

          {/* Equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.equipo_id}
              onChange={(e) => setFormData({ ...formData, equipo_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lokomat_1">Lokomat Principal (Sala 1)</option>
              <option value="lokomat_2">Lokomat 2 (Sala 2)</option>
              <option value="lokomat_3">Lokomat 3 (Sala 3)</option>
            </select>
          </div>

          {/* Fecha y Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.fecha_hora}
              onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lun-Vie: 8:00-18:00 | Sáb: 8:00-13:00
            </p>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración
            </label>
            <select
              value={formData.duracion_minutos}
              onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
            </select>
          </div>

          {/* Tipo de Sesión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sesión
            </label>
            <select
              value={formData.tipo_sesion}
              onChange={(e) => setFormData({ ...formData, tipo_sesion: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="evaluacion">Evaluación</option>
              <option value="rehabilitacion">Rehabilitación</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notas_terapeuta || ''}
              onChange={(e) => setFormData({ ...formData, notas_terapeuta: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || verificandoDisponibilidad}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? verificandoDisponibilidad
                  ? 'Verificando...'
                  : 'Creando...'
                : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
