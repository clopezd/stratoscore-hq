'use client'

import { useState, useEffect } from 'react'
import { updatePaciente, deletePaciente } from '../services/pacientesService'
import type { Paciente, PacienteUpdate } from '../types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  paciente: Paciente | null
}

export function EditarPacienteModal({ isOpen, onClose, onSuccess, paciente }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState<PacienteUpdate>({
    nombre: '',
    telefono: '',
    email: '',
    diagnostico: '',
    medico_referente: '',
    hospital_origen: '',
    plan_sesiones: 20,
    notas_medicas: '',
    estado: 'activo',
  })

  useEffect(() => {
    if (paciente && isOpen) {
      setFormData({
        nombre: paciente.nombre,
        telefono: paciente.telefono,
        email: paciente.email || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '',
        diagnostico: paciente.diagnostico || '',
        medico_referente: paciente.medico_referente || '',
        hospital_origen: paciente.hospital_origen || '',
        plan_sesiones: paciente.plan_sesiones || 20,
        notas_medicas: paciente.notas_medicas || '',
        estado: paciente.estado,
      })
      setError(null)
      setShowDeleteConfirm(false)
    }
  }, [paciente, isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paciente) return

    setLoading(true)
    setError(null)

    try {
      await updatePaciente(paciente.id, formData)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error actualizando paciente:', err)
      setError('Error al actualizar el paciente. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!paciente) return

    setDeleting(true)
    setError(null)

    try {
      await deletePaciente(paciente.id)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error eliminando paciente:', err)
      setError('Error al eliminar el paciente. Puede tener citas asociadas.')
    } finally {
      setDeleting(false)
    }
  }

  if (!isOpen || !paciente) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Médica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <input
                  type="text"
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico Referente
                </label>
                <input
                  type="text"
                  value={formData.medico_referente}
                  onChange={(e) => setFormData({ ...formData, medico_referente: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital/Clínica de Origen
                </label>
                <input
                  type="text"
                  value={formData.hospital_origen}
                  onChange={(e) => setFormData({ ...formData, hospital_origen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan de Sesiones
                </label>
                <select
                  value={formData.plan_sesiones || 20}
                  onChange={(e) => setFormData({ ...formData, plan_sesiones: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10 sesiones</option>
                  <option value={20}>20 sesiones</option>
                  <option value={30}>30 sesiones</option>
                  <option value={40}>40 sesiones</option>
                  <option value={50}>50 sesiones</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="completado">Completado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Médicas
              </label>
              <textarea
                value={formData.notas_medicas}
                onChange={(e) => setFormData({ ...formData, notas_medicas: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Información de Sesiones */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Progreso de Sesiones</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Completadas</div>
                <div className="text-lg font-bold text-gray-900">{paciente.sesiones_completadas}</div>
              </div>
              <div>
                <div className="text-gray-600">Restantes</div>
                <div className="text-lg font-bold text-gray-900">{paciente.sesiones_restantes || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">Total</div>
                <div className="text-lg font-bold text-gray-900">{paciente.plan_sesiones || 0}</div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition"
            >
              Eliminar Paciente
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md m-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Eliminar paciente?
            </h3>
            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer. Se eliminarán todos los datos del paciente y sus citas asociadas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
