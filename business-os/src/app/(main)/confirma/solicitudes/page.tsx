'use client'

/**
 * ConFIRMA - Portal de Flujos (Mis Solicitudes)
 * Equivalente a InterfUsuario de Power App
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { confirmaBrand, getEstadoColor, getPrioridadColor } from '@/features/_archived/confirma/brand'
import { solicitudesService, type Solicitud, type EstadoSolicitud } from '@/features/_archived/confirma/services'

export default function MisSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [estadoActivo, setEstadoActivo] = useState<EstadoSolicitud>('Borrador')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarSolicitudes()
  }, [estadoActivo])

  const cargarSolicitudes = async () => {
    setLoading(true)
    try {
      const data = await solicitudesService.listar({ estado: estadoActivo })
      setSolicitudes(data)
    } catch (error) {
      console.error('Error cargando solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const estados: EstadoSolicitud[] = ['Borrador', 'Pendiente', 'Aprobada', 'Rechazada', 'Cancelada']

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div
        className="p-6 rounded-t-xl flex items-center justify-between"
        style={{ background: confirmaBrand.gradients.header }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">MIS SOLICITUDES</h1>
        </div>

        <Link
          href="/confirma/nueva"
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all"
        >
          + Nueva Solicitud
        </Link>
      </div>

      {/* Tabs de Estados */}
      <div
        className="flex border-b-2"
        style={{ borderColor: confirmaBrand.colors.border, backgroundColor: confirmaBrand.colors.surface }}
      >
        {estados.map(estado => {
          const count = solicitudes.filter(s => s.estado === estado).length
          return (
            <button
              key={estado}
              onClick={() => setEstadoActivo(estado)}
              className="flex-1 px-4 py-3 font-semibold transition-all relative"
              style={{
                color: estadoActivo === estado ? getEstadoColor(estado) : confirmaBrand.colors.textSecondary,
                borderBottom: estadoActivo === estado ? `3px solid ${getEstadoColor(estado)}` : 'none'
              }}
            >
              {estado}
              {count > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs text-white font-bold"
                  style={{ backgroundColor: getEstadoColor(estado) }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de Solicitudes */}
      <div className="p-6" style={{ backgroundColor: confirmaBrand.colors.surface }}>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4" style={{ color: confirmaBrand.colors.textSecondary }}>
              Cargando...
            </p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ color: confirmaBrand.colors.textSecondary }}>
              No hay solicitudes en estado <strong>{estadoActivo}</strong>
            </p>
            <Link
              href="/confirma/nueva"
              className="mt-4 inline-block px-4 py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: confirmaBrand.colors.primary }}
            >
              Crear Primera Solicitud
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.map(solicitud => (
              <Link
                key={solicitud.id}
                href={`/confirma/solicitud/${solicitud.id}`}
                className="block p-4 rounded-lg hover:shadow-lg transition-all border-l-4"
                style={{
                  backgroundColor: confirmaBrand.colors.background,
                  borderLeftColor: getEstadoColor(solicitud.estado)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg" style={{ color: confirmaBrand.colors.text }}>
                        {solicitud.asunto}
                      </h3>
                      <span
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: getPrioridadColor(solicitud.prioridad) }}
                      >
                        {solicitud.prioridad}
                      </span>
                    </div>

                    {solicitud.descripcion && (
                      <p
                        className="text-sm mb-2 line-clamp-2"
                        style={{ color: confirmaBrand.colors.textSecondary }}
                      >
                        {solicitud.descripcion}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs" style={{ color: confirmaBrand.colors.textSecondary }}>
                      <span>
                        📅 {new Date(solicitud.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>

                      {solicitud.aprobadores && (
                        <span>
                          👥 {solicitud.aprobadores.filter(a => a.estado === 'Aprobado').length}/{solicitud.aprobadores.length} aprobadores
                        </span>
                      )}

                      {solicitud.total_niveles && (
                        <span>
                          📊 Nivel {solicitud.nivel_actual}/{solicitud.total_niveles}
                        </span>
                      )}

                      {solicitud.adjuntos && solicitud.adjuntos.length > 0 && (
                        <span>
                          📎 {solicitud.adjuntos.length} archivo{solicitud.adjuntos.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: getEstadoColor(solicitud.estado),
                        color: '#fff'
                      }}
                    >
                      {solicitud.estado}
                    </span>

                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
