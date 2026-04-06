'use client'

import { useState } from 'react'
import { marcarContactado, descartarLead, updateLead } from '../services/leadsService'
import type { LeadMedcare } from '../types'

interface Props {
  leads: LeadMedcare[]
  onUpdate: () => void
}

type TabMode = 'todos' | 'reactivacion'

export function GestionLeadsMedcare({ leads, onUpdate }: Props) {
  const [tab, setTab] = useState<TabMode>('todos')
  const [filtro, setFiltro] = useState<string>('todos')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const leadsNormales = leads.filter(l => !l.origen_importacion)
  const leadsReactivacion = leads.filter(l => l.origen_importacion)

  const leadsActivos = tab === 'reactivacion' ? leadsReactivacion : leadsNormales
  const filtrados = filtro === 'todos'
    ? leadsActivos
    : leadsActivos.filter(l => l.estado === filtro)

  async function handleAction(leadId: string, action: 'contactar' | 'agendar' | 'descartar') {
    setActionLoading(leadId)
    try {
      if (action === 'contactar') {
        await marcarContactado(leadId)
      } else if (action === 'agendar') {
        await updateLead(leadId, {
          estado: 'cita_agendada',
          notas: 'Mamografía agendada desde panel de reactivación',
        })
      } else {
        await descartarLead(leadId, 'Descartado desde panel')
      }
      onUpdate()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => { setTab('todos'); setFiltro('todos') }}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
            tab === 'todos'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Leads Web
          {leadsNormales.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">{leadsNormales.length}</span>
          )}
        </button>
        <button
          onClick={() => { setTab('reactivacion'); setFiltro('todos') }}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
            tab === 'reactivacion'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Reactivación
          {leadsReactivacion.filter(l => l.estado === 'nuevo').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded text-xs">
              {leadsReactivacion.filter(l => l.estado === 'nuevo').length}
            </span>
          )}
        </button>
      </div>

      {/* Info banner para reactivación */}
      {tab === 'reactivacion' && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Pacientes importadas — candidatas a mamografía
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Mujeres 40+ años con ultrasonido previo y más de 12 meses sin cita.
              Marque &quot;Llamó&quot; cuando contacte y &quot;Agendó&quot; cuando confirme la cita.
            </p>
          </div>
        </div>
      )}

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap">
        {['todos', 'nuevo', 'contactado', 'cita_agendada', 'completado', 'descartado'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === f
                ? tab === 'reactivacion' ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'cita_agendada' ? 'Agendados' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 opacity-70">
              ({f === 'todos' ? leadsActivos.length : leadsActivos.filter(l => l.estado === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Lista de leads */}
      <div className="space-y-3">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 text-sm">
              {tab === 'reactivacion'
                ? 'No hay pacientes de reactivación. Importa un CSV desde el botón del dashboard.'
                : 'No hay leads en esta categoría.'}
            </p>
          </div>
        ) : (
          filtrados.map(lead => (
            <div
              key={lead.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{lead.nombre}</h4>
                    {lead.origen_importacion ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium">
                        Reactivación
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        lead.tipo_estudio === 'mamografia'
                          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      }`}>
                        {lead.tipo_estudio === 'mamografia' ? 'Mamografía' : lead.tipo_estudio === 'ultrasonido' ? 'Ultrasonido' : '-'}
                      </span>
                    )}
                    <EstadoBadge estado={lead.estado} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{lead.telefono}</span>
                    {lead.email && <span>{lead.email}</span>}
                    {lead.edad_calculada && <span>{lead.edad_calculada} años</span>}
                    {lead.servicio_previo && <span>Previo: {lead.servicio_previo}</span>}
                    {lead.fecha_ultima_cita && (
                      <span>Última cita: {new Date(lead.fecha_ultima_cita + 'T12:00:00').toLocaleDateString('es-CR')}</span>
                    )}
                    {!lead.origen_importacion && lead.medico_referente && <span>Ref: {lead.medico_referente}</span>}
                    {!lead.origen_importacion && lead.fecha_preferida && (
                      <span>Pref: {new Date(lead.fecha_preferida + 'T12:00:00').toLocaleDateString('es-CR')}</span>
                    )}
                  </div>

                  {lead.notas && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic truncate">{lead.notas}</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 shrink-0">
                  {lead.estado === 'nuevo' && (
                    <>
                      <button
                        onClick={() => handleAction(lead.id, 'contactar')}
                        disabled={actionLoading === lead.id}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg font-medium transition disabled:opacity-50"
                      >
                        {lead.origen_importacion ? 'Llamó' : 'Contactar'}
                      </button>
                      <button
                        onClick={() => handleAction(lead.id, 'descartar')}
                        disabled={actionLoading === lead.id}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium transition dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        Descartar
                      </button>
                    </>
                  )}
                  {lead.estado === 'contactado' && (
                    <>
                      <button
                        onClick={() => handleAction(lead.id, 'agendar')}
                        disabled={actionLoading === lead.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition disabled:opacity-50"
                      >
                        Agendó Mamografía
                      </button>
                      <button
                        onClick={() => handleAction(lead.id, 'descartar')}
                        disabled={actionLoading === lead.id}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium transition dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        No interesada
                      </button>
                    </>
                  )}
                  {lead.estado === 'cita_agendada' && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium px-3 py-1.5">
                      Mamografía Agendada
                    </span>
                  )}
                  {lead.estado === 'completado' && (
                    <span className="text-xs text-gray-500 font-medium px-3 py-1.5">Completado</span>
                  )}
                  {lead.estado === 'descartado' && (
                    <span className="text-xs text-red-400 font-medium px-3 py-1.5">Descartado</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const config: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    contactado: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    cita_agendada: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    completado: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    descartado: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  const labels: Record<string, string> = {
    nuevo: 'Pendiente',
    contactado: 'Llamada hecha',
    cita_agendada: 'Agendado',
    completado: 'Completado',
    descartado: 'Descartado',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config[estado] || 'bg-gray-100 text-gray-600'}`}>
      {labels[estado] || estado}
    </span>
  )
}
