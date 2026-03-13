'use client'

import { useState, useEffect } from 'react'
import { updateTerapeuta, deleteTerapeuta } from '../services/terapeutasService'
import type { Terapeuta, TerapeutaUpdate } from '../types/database'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  terapeuta: Terapeuta | null
}

export function EditarTerapeutaModal({ isOpen, onClose, onSuccess, terapeuta }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState<TerapeutaUpdate>({
    nombre: '',
    email: '',
    especialidades: [],
    lokomat_certificado: false,
    disponibilidad: {},
    activo: true,
  })

  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('')

  useEffect(() => {
    if (terapeuta && isOpen) {
      setFormData({
        nombre: terapeuta.nombre,
        email: terapeuta.email || '',
        especialidades: terapeuta.especialidades || [],
        lokomat_certificado: terapeuta.lokomat_certificado,
        disponibilidad: terapeuta.disponibilidad || {},
        activo: terapeuta.activo,
      })
      setError(null)
      setShowDeleteConfirm(false)
    }
  }, [terapeuta, isOpen])

  function agregarEspecialidad() {
    if (nuevaEspecialidad.trim()) {
      setFormData({
        ...formData,
        especialidades: [...(formData.especialidades || []), nuevaEspecialidad.trim()],
      })
      setNuevaEspecialidad('')
    }
  }

  function quitarEspecialidad(index: number) {
    setFormData({
      ...formData,
      especialidades: formData.especialidades?.filter((_, i) => i !== index) || [],
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!terapeuta) return

    setLoading(true)
    setError(null)

    try {
      await updateTerapeuta(terapeuta.id, formData)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error actualizando terapeuta:', err)
      setError('Error al actualizar el terapeuta. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!terapeuta) return

    setDeleting(true)
    setError(null)

    try {
      await deleteTerapeuta(terapeuta.id)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error eliminando terapeuta:', err)
      setError('Error al eliminar el terapeuta. Puede tener citas asociadas.')
    } finally {
      setDeleting(false)
    }
  }

  if (!isOpen || !terapeuta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Terapeuta</h2>
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Certificación y Estado */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Certificación y Estado</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.lokomat_certificado}
                  onChange={(e) => setFormData({ ...formData, lokomat_certificado: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Certificado en Lokomat</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Especialidades</h3>

            {/* Lista de especialidades */}
            {formData.especialidades && formData.especialidades.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.especialidades.map((esp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    <span>{esp}</span>
                    <button
                      type="button"
                      onClick={() => quitarEspecialidad(idx)}
                      className="text-purple-600 hover:text-purple-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input para agregar especialidad */}
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaEspecialidad}
                onChange={(e) => setNuevaEspecialidad(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    agregarEspecialidad()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Fisioterapia, Neurología, Rehabilitación..."
              />
              <button
                type="button"
                onClick={agregarEspecialidad}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition"
            >
              Eliminar Terapeuta
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
              ¿Eliminar terapeuta?
            </h3>
            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer. Se eliminarán todos los datos del terapeuta. Si tiene citas asociadas, la eliminación fallará.
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
