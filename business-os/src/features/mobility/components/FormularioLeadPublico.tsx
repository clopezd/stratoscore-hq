'use client'

import { useState } from 'react'
import { createLead } from '../services/leadsService'
import type { LeadMobilityInsert, FuenteLead } from '../types/database'

export function FormularioLeadPublico() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<LeadMobilityInsert>({
    nombre: '',
    telefono: '',
    email: '',
    diagnostico_preliminar: '',
    medico_referente: '',
    fuente: 'web',
    notas: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Capturar parámetros UTM de la URL si existen
      const params = new URLSearchParams(window.location.search)
      const leadConUTM: LeadMobilityInsert = {
        ...formData,
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
      }

      await createLead(leadConUTM)
      setEnviado(true)

      // Limpiar formulario
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        diagnostico_preliminar: '',
        medico_referente: '',
        fuente: 'web',
        notas: '',
      })
    } catch (err) {
      console.error('Error enviando formulario:', err)
      setError('Error al enviar el formulario. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Gracias por tu interés!
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto contigo
            pronto para agendar una evaluación inicial.
          </p>
          <button
            onClick={() => setEnviado(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Mobility Group CR</h1>
          <p className="text-blue-100">
            Solicita tu Evaluación Inicial - Rehabilitación Robótica
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>¿Por qué Mobility?</strong> Contamos con tecnología Lokomat de última
              generación para rehabilitación neurológica y ortopédica. Completa este
              formulario y nuestro equipo te contactará para agendar tu evaluación
              inicial.
            </p>
          </div>

          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Información Personal
            </h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez Rodríguez"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+506 8888 7777"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="correo@example.com"
                />
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Información Médica (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico o Condición
                </label>
                <input
                  type="text"
                  value={formData.diagnostico_preliminar}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnostico_preliminar: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lesión medular, ACV, Parkinson, esclerosis múltiple..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médico Referente (si aplica)
                </label>
                <input
                  type="text"
                  value={formData.medico_referente}
                  onChange={(e) =>
                    setFormData({ ...formData, medico_referente: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Carlos Rodríguez"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Cómo nos conociste?
                </label>
                <select
                  value={formData.fuente || 'web'}
                  onChange={(e) =>
                    setFormData({ ...formData, fuente: e.target.value as FuenteLead })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="web">Página web</option>
                  <option value="google_ads">Google</option>
                  <option value="facebook">Facebook / Instagram</option>
                  <option value="referido">Referido por médico</option>
                  <option value="telefono">Llamada telefónica</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cualquier información adicional que quieras compartir..."
                />
              </div>
            </div>
          </div>

          {/* Botón Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Enviando...' : 'Solicitar Evaluación Inicial'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Al enviar este formulario aceptas que Mobility Group CR te contacte para
              coordinar tu evaluación.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
