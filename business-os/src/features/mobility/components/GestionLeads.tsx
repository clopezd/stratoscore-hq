'use client'

import { useEffect, useState } from 'react'
import {
  getLeads,
  marcarContactado,
  descartarLead,
  getEstadisticasLeads,
} from '../services/leadsService'
import { createPaciente } from '../services/pacientesService'
import type { LeadMobility, EstadoLead } from '../types/database'
import { NavegacionMobility } from './NavegacionMobility'

export function GestionLeads() {
  const [leads, setLeads] = useState<LeadMobility[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | EstadoLead>('nuevo')
  const [stats, setStats] = useState<any>(null)
  const [leadSeleccionado, setLeadSeleccionado] = useState<LeadMobility | null>(null)
  const [showAcciones, setShowAcciones] = useState(false)

  useEffect(() => {
    cargarLeads()
    cargarEstadisticas()
  }, [filtro])

  async function cargarLeads() {
    setLoading(true)
    try {
      const data = await getLeads({
        estado: filtro === 'todos' ? undefined : filtro,
      })
      setLeads(data)
    } catch (error) {
      console.error('Error cargando leads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarEstadisticas() {
    try {
      const data = await getEstadisticasLeads()
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  async function handleMarcarContactado(leadId: string) {
    try {
      await marcarContactado(leadId, 'Contactado desde panel')
      await cargarLeads()
      await cargarEstadisticas()
    } catch (error) {
      console.error('Error marcando como contactado:', error)
    }
  }

  async function handleConvertirAPaciente(lead: LeadMobility) {
    try {
      const paciente = await createPaciente({
        nombre: lead.nombre,
        telefono: lead.telefono,
        email: lead.email || undefined,
        diagnostico: lead.diagnostico_preliminar || undefined,
        medico_referente: lead.medico_referente || undefined,
        plan_sesiones: 20,
        notas_medicas: `Lead convertido. Fuente: ${lead.fuente || 'desconocida'}`,
      })

      // Aquí podrías también actualizar el lead
      // await convertirAPaciente(lead.id, paciente.id)

      alert(`✅ Paciente creado: ${paciente.nombre}`)
      await cargarLeads()
      await cargarEstadisticas()
    } catch (error) {
      console.error('Error convirtiendo a paciente:', error)
      alert('Error al convertir a paciente')
    }
  }

  async function handleDescartar(leadId: string) {
    if (!confirm('¿Seguro que quieres descartar este lead?')) return

    try {
      await descartarLead(leadId, 'Descartado desde panel')
      await cargarLeads()
      await cargarEstadisticas()
    } catch (error) {
      console.error('Error descartando lead:', error)
    }
  }

  const getBadgeColor = (estado: EstadoLead) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-yellow-100 text-yellow-800'
      case 'contactado':
        return 'bg-blue-100 text-blue-800'
      case 'evaluacion_agendada':
        return 'bg-purple-100 text-purple-800'
      case 'convertido':
        return 'bg-green-100 text-green-800'
      case 'descartado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavegacionMobility />

      {/* Header con estadísticas */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Leads</h1>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <div className="text-sm text-yellow-600">Nuevos</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.nuevos}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <div className="text-sm text-blue-600">Contactados</div>
              <div className="text-2xl font-bold text-blue-900">{stats.contactados}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-sm text-green-600">Convertidos</div>
              <div className="text-2xl font-bold text-green-900">{stats.convertidos}</div>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4">
              <div className="text-sm text-purple-600">Tasa Conversión</div>
              <div className="text-2xl font-bold text-purple-900">{stats.tasaConversion}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFiltro('nuevo')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'nuevo'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Nuevos
        </button>
        <button
          onClick={() => setFiltro('contactado')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'contactado'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Contactados
        </button>
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filtro === 'todos'
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Tabla de Leads */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando leads...</div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay leads {filtro !== 'todos' ? filtro + 's' : ''}
          </h3>
          <p className="text-gray-600">
            Los nuevos leads aparecerán aquí cuando alguien complete el formulario público
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString('es-CR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lead.telefono}</div>
                    {lead.email && (
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {lead.diagnostico_preliminar || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {lead.fuente || 'web'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(lead.estado)}`}>
                      {lead.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {lead.estado === 'nuevo' && (
                        <button
                          onClick={() => handleMarcarContactado(lead.id)}
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          Contactar
                        </button>
                      )}
                      {(lead.estado === 'nuevo' || lead.estado === 'contactado') && (
                        <button
                          onClick={() => handleConvertirAPaciente(lead)}
                          className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          → Paciente
                        </button>
                      )}
                      <button
                        onClick={() => handleDescartar(lead.id)}
                        className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        Descartar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
