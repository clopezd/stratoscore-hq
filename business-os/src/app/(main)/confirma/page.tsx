/**
 * ConFIRMA - Pantalla Principal
 * Equivalente a ScrInicio de Power App
 */

import Link from 'next/link'
import { confirmaBrand } from '@/features/_archived/confirma/brand'

export default function ConfirmaHomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: confirmaBrand.gradients.header,
        fontFamily: confirmaBrand.typography.fontFamily
      }}
    >
      {/* Header con Logo */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1
          className="text-white font-bold mb-2"
          style={{ fontSize: confirmaBrand.typography.sizes['2xl'] }}
        >
          ConFIRMA
        </h1>

        <p
          className="text-white/90"
          style={{ fontSize: confirmaBrand.typography.sizes.lg }}
        >
          Plataforma Inteligente de Aprobaciones
        </p>

        <p className="text-white/70 mt-4" style={{ fontSize: confirmaBrand.typography.sizes.md }}>
          {new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Botones Principales */}
      <div className="flex flex-col gap-6 w-full max-w-md">
        <Link
          href="/confirma/nueva"
          className="group flex items-center justify-between p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: confirmaBrand.colors.surface,
            borderRadius: confirmaBrand.borderRadius.lg,
            border: `2px solid ${confirmaBrand.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ backgroundColor: confirmaBrand.colors.primary }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <div>
              <h2
                className="font-semibold mb-1"
                style={{
                  color: confirmaBrand.colors.text,
                  fontSize: confirmaBrand.typography.sizes.lg
                }}
              >
                Solicitud de Aprobación
              </h2>
              <p
                className="text-sm"
                style={{ color: confirmaBrand.colors.textSecondary }}
              >
                Crear nueva solicitud
              </p>
            </div>
          </div>

          <svg className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/confirma/solicitudes"
          className="group flex items-center justify-between p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: confirmaBrand.colors.surface,
            borderRadius: confirmaBrand.borderRadius.lg,
            border: `2px solid ${confirmaBrand.colors.border}`
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ backgroundColor: confirmaBrand.colors.secondary }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div>
              <h2
                className="font-semibold mb-1"
                style={{
                  color: confirmaBrand.colors.text,
                  fontSize: confirmaBrand.typography.sizes.lg
                }}
              >
                Portal de Flujos
              </h2>
              <p
                className="text-sm"
                style={{ color: confirmaBrand.colors.textSecondary }}
              >
                Ver mis solicitudes
              </p>
            </div>
          </div>

          <svg className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/confirma/mis-pendientes"
          className="group flex items-center justify-between p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: confirmaBrand.colors.surface,
            borderRadius: confirmaBrand.borderRadius.lg,
            border: `2px solid ${confirmaBrand.colors.pendiente}`
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative"
              style={{ backgroundColor: confirmaBrand.colors.pendiente }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              {/* Badge de notificación */}
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: confirmaBrand.colors.prioridadAlta }}
              >
                !
              </span>
            </div>

            <div>
              <h2
                className="font-semibold mb-1"
                style={{
                  color: confirmaBrand.colors.text,
                  fontSize: confirmaBrand.typography.sizes.lg
                }}
              >
                Mis Pendientes
              </h2>
              <p
                className="text-sm"
                style={{ color: confirmaBrand.colors.textSecondary }}
              >
                Solicitudes por aprobar
              </p>
            </div>
          </div>

          <svg className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-white/60">
        <p style={{ fontSize: confirmaBrand.typography.sizes.sm }}>
          Versión 3.0 - Migrado de Power Apps
        </p>
        <p className="mt-2 text-xs">
          COFASA · ConFIRMA
        </p>
      </div>
    </div>
  )
}
