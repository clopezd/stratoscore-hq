'use client'

import { useState } from 'react'
import { updateCita, cancelarCita, completarCita, deleteCita } from '../services/citasService'
import type { CitaConRelaciones } from '../types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  cita: CitaConRelaciones | null
}

export function GestionarCitaModal({ isOpen, onClose, onSuccess, cita }: Props) {
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [notasCompletado, setNotasCompletado] = useState('')

  if (!isOpen || !cita) return null

  async function handleCompletar() {
    setLoading(true)
    try {
      await completarCita(cita.id, notasCompletado)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error completando cita:', error)
      alert('Error al completar la cita')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar() {
    if (!motivoCancelacion.trim()) {
      alert('Por favor indica el motivo de cancelación')
      return
    }

    setLoading(true)
    try {
      await cancelarCita(cita.id, motivoCancelacion, 'centro')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error cancelando cita:', error)
      alert('Error al cancelar la cita')
    } finally {
      setLoading(false)
    }
  }

  const fechaCita = new Date(cita.fecha_hora)
  const yaOcurrio = fechaCita < new Date()
  const puedeCompletar = cita.estado === 'confirmada' || cita.estado === 'en_curso'
  const puedeCancelar = cita.estado === 'confirmada'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detalles de Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Información de la Cita */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-sm text-gray-600">Paciente</div>
              <div className="font-medium text-gray-900">
                {cita.paciente?.nombre || 'Sin nombre'}
              </div>
              <div className="text-sm text-gray-600">
                {cita.paciente?.telefono}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Fecha y Hora</div>
                <div className="font-medium text-gray-900">
                  {fechaCita.toLocaleDateString('es-CR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-gray-900">
                  {fechaCita.toLocaleTimeString('es-CR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Duración</div>
                <div className="font-medium text-gray-900">
                  {cita.duracion_minutos} minutos
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Equipo</div>
                <div className="font-medium text-gray-900">
                  {cita.equipo?.nombre || 'Sin asignar'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Tipo</div>
                <div className="font-medium text-gray-900 capitalize">
                  {cita.tipo_sesion}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Estado</div>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  cita.estado === 'completada'
                    ? 'bg-green-100 text-green-800'
                    : cita.estado === 'cancelada'
                    ? 'bg-red-100 text-red-800'
                    : cita.estado === 'en_curso'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cita.estado}
              </span>
            </div>

            {cita.notas_terapeuta && (
              <div>
                <div className="text-sm text-gray-600">Notas del Terapeuta</div>
                <div className="text-gray-900">{cita.notas_terapeuta}</div>
              </div>
            )}

            {cita.motivo_cancelacion && (
              <div>
                <div className="text-sm text-gray-600">Motivo de Cancelación</div>
                <div className="text-red-700">{cita.motivo_cancelacion}</div>
              </div>
            )}
          </div>

          {/* Completar Cita */}
          {puedeCompletar && !showCancelConfirm && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-medium text-green-900 mb-2">Completar Cita</h3>
              <textarea
                value={notasCompletado}
                onChange={(e) => setNotasCompletado(e.target.value)}
                placeholder="Notas de la sesión (opcional)..."
                rows={3}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              />
              <button
                onClick={handleCompletar}
                disabled={loading}
                className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Completando...' : 'Marcar como Completada'}
              </button>
            </div>
          )}

          {/* Cancelar Cita */}
          {puedeCancelar && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition"
            >
              Cancelar Cita
            </button>
          )}

          {/* Confirmación de Cancelación */}
          {showCancelConfirm && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-medium text-red-900 mb-2">Cancelar Cita</h3>
              <input
                type="text"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Motivo de cancelación..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false)
                    setMotivoCancelacion('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  Volver
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          )}

          {/* Cita ya ocurrió */}
          {!puedeCompletar && !puedeCancelar && cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
            <div className="text-center text-gray-500 py-4">
              Esta cita ya no puede ser modificada
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
