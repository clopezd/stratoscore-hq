'use client'

import { useEffect, useState } from 'react'
import { getTerapeutas } from '../services/terapeutasService'
import type { Terapeuta } from '../types/database'
import { NuevoTerapeutaModal } from './NuevoTerapeutaModal'
import { EditarTerapeutaModal } from './EditarTerapeutaModal'
import { NavegacionMobility } from './NavegacionMobility'

export function ListaTerapeutas() {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState<Terapeuta | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'activo' | 'inactivo'>('activo')

  useEffect(() => {
    cargarTerapeutas()
  }, [filtro])

  async function cargarTerapeutas() {
    setLoading(true)
    try {
      const data = await getTerapeutas({
        activo: filtro === 'todos' ? undefined : filtro === 'activo',
      })
      setTerapeutas(data)
    } catch (error) {
      console.error('Error cargando terapeutas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavegacionMobility />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terapeutas</h1>
          <p className="text-gray-600 text-sm mt-1">
            {terapeutas.length} terapeuta{terapeutas.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Terapeuta
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFiltro('activo')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'activo'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Activos
        </button>
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('inactivo')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'inactivo'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Inactivos
        </button>
      </div>

      {/* Tabla de Terapeutas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando terapeutas...</div>
        </div>
      ) : terapeutas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">👨‍⚕️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay terapeutas {filtro !== 'todos' ? filtro + 's' : ''}
          </h3>
          <p className="text-gray-600 mb-4">
            Agrega tu primer terapeuta para comenzar a asignar citas
          </p>
          <button
            onClick={() => setModalNuevo(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Crear Terapeuta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeuta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokomat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {terapeutas.map((terapeuta) => (
                <tr
                  key={terapeuta.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    setTerapeutaSeleccionado(terapeuta)
                    setModalEditar(true)
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{terapeuta.nombre}</div>
                  </td>
                  <td className="px-6 py-4">
                    {terapeuta.email ? (
                      <div className="text-sm text-gray-900">{terapeuta.email}</div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin email</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {terapeuta.especialidades && terapeuta.especialidades.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {terapeuta.especialidades.map((esp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin especialidades</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {terapeuta.lokomat_certificado ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        ✓ Certificado
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        No certificado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        terapeuta.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {terapeuta.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <NuevoTerapeutaModal
        isOpen={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onSuccess={cargarTerapeutas}
      />

      <EditarTerapeutaModal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false)
          setTerapeutaSeleccionado(null)
        }}
        onSuccess={cargarTerapeutas}
        terapeuta={terapeutaSeleccionado}
      />
    </div>
  )
}
