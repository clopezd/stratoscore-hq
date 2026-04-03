'use client'

/**
 * ConFIRMA - Detalle de Solicitud + Aprobación
 * Equivalente a ScrFlujoPend y ScrFlujoPro
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { confirmaBrand, getEstadoColor, getPrioridadColor } from '@/features/_archived/confirma/brand'
import {
  solicitudesService,
  aprobacionesService,
  adjuntosService,
  type Solicitud
} from '@/features/_archived/confirma/services'

export default function DetalleSolicitudPage() {
  const params = useParams()
  const router = useRouter()
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [log, setLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comentario, setComentario] = useState('')
  const [procesando, setProcesando] = useState(false)

  // TODO: Obtener del auth
  const usuarioEmail = 'usuario@empresa.com'

  useEffect(() => {
    cargarSolicitud()
  }, [params.id])

  const cargarSolicitud = async () => {
    try {
      const data = await solicitudesService.obtener(params.id as string)
      setSolicitud(data)

      const logData = await aprobacionesService.obtenerLog(params.id as string)
      setLog(logData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const soyAprobador = () => {
    if (!solicitud) return false
    return solicitud.aprobadores?.some(
      a => a.usuario_email === usuarioEmail && a.nivel === solicitud.nivel_actual && a.estado === 'Pendiente'
    )
  }

  const handleAprobar = async () => {
    if (!solicitud) return
    setProcesando(true)
    try {
      await aprobacionesService.aprobar(solicitud.id, usuarioEmail, comentario)
      alert('✅ Solicitud aprobada correctamente')
      router.push('/confirma/mis-pendientes')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al aprobar')
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!solicitud || !comentario) {
      alert('Debe agregar un comentario al rechazar')
      return
    }
    if (!confirm('¿Está seguro de rechazar esta solicitud?')) return

    setProcesando(true)
    try {
      await aprobacionesService.rechazar(solicitud.id, usuarioEmail, comentario)
      alert('❌ Solicitud rechazada')
      router.push('/confirma/mis-pendientes')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al rechazar')
    } finally {
      setProcesando(false)
    }
  }

  if (loading) return <div className="p-12 text-center">Cargando...</div>
  if (!solicitud) return <div className="p-12 text-center">Solicitud no encontrada</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="p-6 rounded-t-xl" style={{ background: confirmaBrand.gradients.header }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-2">{solicitud.asunto}</h1>
            <div className="flex gap-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: getEstadoColor(solicitud.estado), color: '#fff' }}
              >
                {solicitud.estado}
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: getPrioridadColor(solicitud.prioridad) }}
              >
                {solicitud.prioridad}
              </span>
            </div>
          </div>
          <div className="text-white text-right">
            <p className="text-sm opacity-80">
              {new Date(solicitud.created_at).toLocaleDateString('es-ES')}
            </p>
            <p className="text-lg font-bold">
              Nivel {solicitud.nivel_actual} / {solicitud.total_niveles}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 rounded-b-xl bg-white">
        {/* Descripción */}
        <div className="mb-6">
          <h2 className="font-bold mb-2" style={{ color: confirmaBrand.colors.text }}>DESCRIPCIÓN</h2>
          <p className="whitespace-pre-wrap" style={{ color: confirmaBrand.colors.textSecondary }}>
            {solicitud.descripcion || 'Sin descripción'}
          </p>
        </div>

        {/* Adjuntos */}
        {solicitud.adjuntos && solicitud.adjuntos.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold mb-2">ADJUNTOS</h2>
            <div className="space-y-2">
              {solicitud.adjuntos.map(adj => (
                <button
                  key={adj.id}
                  onClick={async () => {
                    const url = await adjuntosService.obtenerURL(adj.storage_path)
                    if (url) window.open(url, '_blank')
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
                >
                  📎 {adj.nombre_archivo} ({(adj.tamano_bytes! / 1024).toFixed(1)} KB)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aprobadores */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">APROBADORES</h2>
          {Array.from(new Set(solicitud.aprobadores?.map(a => a.nivel) || [])).sort().map(nivel => (
            <div key={nivel} className="mb-3 p-3 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Nivel {nivel}</h3>
              <div className="space-y-1">
                {solicitud.aprobadores?.filter(a => a.nivel === nivel).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <span>{a.usuario_nombre || a.usuario_email}</span>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor:
                          a.estado === 'Aprobado'
                            ? confirmaBrand.colors.aprobada
                            : a.estado === 'Rechazado'
                            ? confirmaBrand.colors.rechazada
                            : confirmaBrand.colors.pendiente,
                        color: '#fff'
                      }}
                    >
                      {a.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Log de Aprobaciones */}
        {log.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold mb-3">HISTORIAL</h2>
            <div className="space-y-2">
              {log.map(l => (
                <div key={l.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{l.usuario_nombre || l.usuario_email}</span>
                    <span className="text-xs" style={{ color: confirmaBrand.colors.textSecondary }}>
                      {new Date(l.created_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm">
                    <strong style={{ color: l.accion === 'Aprobado' ? confirmaBrand.colors.aprobada : confirmaBrand.colors.rechazada }}>
                      {l.accion}
                    </strong>{' '}
                    - Nivel {l.nivel}
                  </p>
                  {l.comentarios && <p className="text-sm mt-1 italic">{l.comentarios}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones de Aprobación */}
        {soyAprobador() && solicitud.estado === 'Pendiente' && (
          <div className="border-t-2 pt-6" style={{ borderColor: confirmaBrand.colors.border }}>
            <h2 className="font-bold mb-3 text-xl">APROBAR / RECHAZAR</h2>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full p-3 border-2 rounded-lg mb-4"
              rows={4}
              placeholder="Comentarios (opcional al aprobar, requerido al rechazar)"
            />
            <div className="flex gap-4">
              <button
                onClick={handleAprobar}
                disabled={procesando}
                className="flex-1 px-6 py-3 rounded-lg font-bold text-white"
                style={{ backgroundColor: confirmaBrand.colors.aprobada }}
              >
                ✓ Aprobar
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando || !comentario}
                className="flex-1 px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: confirmaBrand.colors.rechazada }}
              >
                ✕ Rechazar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
