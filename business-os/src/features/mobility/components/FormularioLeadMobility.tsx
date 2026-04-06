'use client'

import { useState } from 'react'
import { createLead } from '../services/leadsService'
import type { LeadMobilityInsert, FuenteLead } from '../types/database'
import { MobilityBrand } from '../brand'
import Image from 'next/image'

export function FormularioLeadMobility() {
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
      const params = new URLSearchParams(window.location.search)
      const leadConUTM: LeadMobilityInsert = {
        ...formData,
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
      }

      await createLead(leadConUTM)
      setEnviado(true)

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
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #E6F2FF 0%, #F0F8FF 100%)' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src={MobilityBrand.logo.url}
              alt={MobilityBrand.logo.alt}
              className="h-16 w-auto"
            />
          </div>

          <div className="text-7xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: MobilityBrand.colors.primary }}>
            ¡Gracias por tu interés!
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Hemos recibido tu solicitud exitosamente. Nuestro equipo de especialistas se
            pondrá en contacto contigo en las próximas <strong>24 horas</strong> para
            coordinar tu evaluación inicial.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <strong>Próximos pasos:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>✓ Nuestro equipo revisará tu caso</li>
              <li>✓ Te contactaremos para agendar evaluación</li>
              <li>✓ Conocerás nuestras instalaciones y equipo Lokomat</li>
            </ul>
          </div>

          <button
            onClick={() => setEnviado(false)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition shadow-lg"
            style={{
              background: MobilityBrand.gradients.primary,
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Enviar otra solicitud
          </button>

          <p className="text-xs text-gray-500 mt-6">
            ¿Tienes preguntas? Llámanos al {MobilityBrand.contact.phone}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #E6F2FF 0%, #F0F8FF 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header con logo */}
        <div
          className="px-8 py-8 text-white relative overflow-hidden"
          style={{ background: MobilityBrand.gradients.primary }}
        >
          <div className="relative z-10">
            <div className="mb-4">
              <img
                src={MobilityBrand.logo.url}
                alt={MobilityBrand.logo.alt}
                className="h-14 w-auto brightness-0 invert"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">{MobilityBrand.contact.name}</h1>
            <p className="text-blue-100 text-lg">
              {MobilityBrand.contact.tagline}
            </p>
          </div>
          {/* Círculos decorativos inspirados en el logo */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }}></div>
          <div className="absolute bottom-0 right-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(20%, 40%)' }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div
            className="rounded-lg p-5 border-l-4"
            style={{
              backgroundColor: '#E6F2FF',
              borderColor: MobilityBrand.colors.primary
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: MobilityBrand.colors.primary }}>
              🤖 Tecnología Lokomat de Última Generación
            </p>
            <p className="text-sm text-gray-700">
              Completa este formulario y nuestro equipo te contactará para agendar tu
              <strong> evaluación inicial gratuita</strong>. Especialistas en rehabilitación
              neurológica y ortopédica.
            </p>
          </div>

          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: MobilityBrand.colors.dark }}>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                  placeholder="Juan Pérez Rodríguez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                  placeholder="+506 8888 7777"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                  placeholder="correo@example.com"
                />
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: MobilityBrand.colors.dark }}>
              Información Médica (Opcional)
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico o Condición
                </label>
                <input
                  type="text"
                  value={formData.diagnostico_preliminar}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnostico_preliminar: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                  placeholder="Lesión medular, ACV, Parkinson, esclerosis múltiple, post-operatorio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médico Referente (si aplica)
                </label>
                <input
                  type="text"
                  value={formData.medico_referente}
                  onChange={(e) =>
                    setFormData({ ...formData, medico_referente: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                  placeholder="Dr. Carlos Rodríguez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cómo nos conociste?
                </label>
                <select
                  value={formData.fuente || 'web'}
                  onChange={(e) =>
                    setFormData({ ...formData, fuente: e.target.value as FuenteLead })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
                >
                  <option value="web">Página web</option>
                  <option value="google_ads">Google</option>
                  <option value="facebook">Facebook / Instagram</option>
                  <option value="referido">Referido por médico</option>
                  <option value="telefono">Llamada telefónica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition"
                  style={{
                    '--tw-ring-color': MobilityBrand.colors.primary
                  } as React.CSSProperties}
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
              className="w-full px-6 py-4 text-white rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: MobilityBrand.gradients.primary,
              }}
            >
              {loading ? 'Enviando...' : '🤖 Solicitar Evaluación Inicial Gratuita'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Al enviar este formulario aceptas que {MobilityBrand.contact.name} te contacte
              para coordinar tu evaluación. Llamános al {MobilityBrand.contact.phone}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
