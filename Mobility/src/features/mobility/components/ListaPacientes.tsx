'use client'

import { useEffect, useState } from 'react'
import { getPacientes } from '../services/pacientesService'
import type { Paciente } from '../types/database'
import { NuevoPacienteModal } from './NuevoPacienteModal'
import { EditarPacienteModal } from './EditarPacienteModal'
import { ImportarPacientesModal } from './ImportarPacientesModal'

export function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalImportar, setModalImportar] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'activo' | 'inactivo'>('activo')

  useEffect(() => {
    cargarPacientes()
  }, [filtro])

  async function cargarPacientes() {
    setLoading(true)
    try {
      const data = await getPacientes({
        estado: filtro === 'todos' ? undefined : filtro,
      })
      setPacientes(data)
    } catch (error) {
      console.error('Error cargando pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 text-sm mt-1">
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setModalImportar(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>📥</span>
            Importar
          </button>
          <button
            onClick={() => setModalNuevo(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Nuevo Paciente
          </button>
        </div>
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

      {/* Tabla de Pacientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando pacientes...</div>
        </div>
      ) : pacientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay pacientes {filtro !== 'todos' ? filtro + 's' : ''}
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primer paciente para comenzar a gestionar citas
          </p>
          <button
            onClick={() => setModalNuevo(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Crear Paciente
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    setPacienteSeleccionado(paciente)
                    setModalEditar(true)
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{paciente.nombre}</div>
                    {paciente.medico_referente && (
                      <div className="text-sm text-gray-500">
                        Ref: {paciente.medico_referente}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{paciente.telefono}</div>
                    {paciente.email && (
                      <div className="text-sm text-gray-500">{paciente.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {paciente.diagnostico || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {paciente.plan_sesiones ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.sesiones_restantes} / {paciente.plan_sesiones}
                        </div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${
                              (paciente.sesiones_restantes || 0) / paciente.plan_sesiones < 0.3
                                ? 'bg-red-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${
                                ((paciente.sesiones_completadas || 0) /
                                  paciente.plan_sesiones) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin plan</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        paciente.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : paciente.estado === 'inactivo'
                          ? 'bg-gray-100 text-gray-800'
                          : paciente.estado === 'completado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {paciente.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <NuevoPacienteModal
        isOpen={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onSuccess={cargarPacientes}
      />

      <EditarPacienteModal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false)
          setPacienteSeleccionado(null)
        }}
        onSuccess={cargarPacientes}
        paciente={pacienteSeleccionado}
      />

      <ImportarPacientesModal
        isOpen={modalImportar}
        onClose={() => setModalImportar(false)}
        onSuccess={cargarPacientes}
      />
    </div>
  )
}
