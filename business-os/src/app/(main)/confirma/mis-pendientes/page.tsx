'use client'

/**
 * ConFIRMA - Mis Pendientes de Aprobación
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { confirmaBrand, getPrioridadColor } from '@/features/_archived/confirma/brand'
import { solicitudesService } from '@/features/_archived/confirma/services'

export default function MisPendientesPage() {
  const [pendientes, setPendientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarPendientes()
  }, [])

  const cargarPendientes = async () => {
    try {
      // TODO: Obtener email del usuario actual de Supabase Auth
      const email = 'usuario@empresa.com'
      const data = await solicitudesService.misPendientes(email)
      setPendientes(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="p-6 rounded-xl" style={{ background: confirmaBrand.gradients.header }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">MIS PENDIENTES</h1>
            <p className="text-white/80">Solicitudes esperando tu aprobación</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : pendientes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p style={{ color: confirmaBrand.colors.textSecondary }}>
              ✅ No tienes solicitudes pendientes de aprobar
            </p>
          </div>
        ) : (
          pendientes.map((p: any) => (
            <Link
              key={p.solicitud_id}
              href={`/confirma/solicitud/${p.solicitud_id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all border-l-4"
              style={{ borderLeftColor: getPrioridadColor(p.prioridad) }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1">{p.asunto}</h3>
                  <div className="flex gap-4 text-sm" style={{ color: confirmaBrand.colors.textSecondary }}>
                    <span>👤 {p.solicitante}</span>
                    <span>📊 Nivel {p.nivel}</span>
                    <span>⏱️ {p.dias_pendiente} día{p.dias_pendiente !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: getPrioridadColor(p.prioridad) }}
                >
                  {p.prioridad}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
