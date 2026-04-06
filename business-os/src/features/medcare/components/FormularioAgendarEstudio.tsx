'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createLead } from '../services/leadsService'
import { getServicios } from '../services/serviciosService'
import type { LeadMedcareInsert, ServicioMedcare, TipoEstudio } from '../types'
import { MedCareBrand } from '../brand'

const B = MedCareBrand

export function FormularioAgendarEstudio() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [servicios, setServicios] = useState<ServicioMedcare[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEstudio | ''>('')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const [formData, setFormData] = useState<LeadMedcareInsert>({
    nombre: '',
    telefono: '',
    email: '',
    tipo_estudio: undefined,
    servicio_id: undefined,
    medico_referente: '',
    fecha_preferida: '',
    horario_preferido: 'cualquiera',
    fuente: 'web',
    notas: '',
  })

  useEffect(() => {
    getServicios().then(setServicios).catch(console.error)
  }, [])

  const serviciosFiltrados = tipoSeleccionado
    ? servicios.filter(s => s.tipo === tipoSeleccionado)
    : servicios

  const servicioSeleccionado = servicios.find(s => s.id === formData.servicio_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(window.location.search)
      const leadConUTM: LeadMedcareInsert = {
        ...formData,
        tipo_estudio: tipoSeleccionado || undefined,
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
      }

      await createLead(leadConUTM)
      setEnviado(true)
    } catch (err) {
      console.error('Error enviando formulario:', err)
      setError('Error al enviar. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Estado: Enviado ────────────────────────────────────────
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Solicitud Recibida!
          </h2>
          <p className="text-gray-600 mb-2">
            Nuestro equipo te contactará en menos de <strong>30 minutos</strong> para confirmar tu cita.
          </p>
          {servicioSeleccionado?.preparacion && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm font-semibold text-amber-800 mb-1">Preparación para tu estudio:</p>
              <p className="text-sm text-amber-700">{servicioSeleccionado.preparacion}</p>
            </div>
          )}

          {/* CTA WhatsApp */}
          <a
            href={`${B.contact.whatsappLink}?text=Hola,%20acabo%20de%20agendar%20un%20estudio%20por%20la%20web.%20Mi%20nombre%20es%20${encodeURIComponent(formData.nombre)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Escribirnos por WhatsApp
          </a>

          <button
            onClick={() => { setEnviado(false); setTipoSeleccionado('') }}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Agendar otro estudio
          </button>
        </div>
      </div>
    )
  }

  // ── Landing Page Principal ─────────────────────────────────
  return (
    <div className="min-h-screen bg-white">

      {/* ═══ Navbar ═══ */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Image
            src={B.logo.default}
            alt="MedCare Centro Médico Especializado"
            width={180}
            height={50}
            className="h-10 sm:h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-3">
            <a
              href={`tel:${B.contact.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {B.contact.phone}
            </a>
            <a
              href={B.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-xs text-red-200 mb-6">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Nuevo equipo de mamografía digital
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Tu mamografía en<br />
              <span className="text-red-400">15 minutos.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Detectar a tiempo lo cambia todo. Agenda tu mamografía o ultrasonido con resultados el mismo día.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#agendar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-red-600/25"
              >
                Agendar Mi Estudio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a
                href={B.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium text-lg transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Trust Bar ═══ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🏥', label: '+7 años', sub: 'de experiencia' },
              { icon: '🔬', label: 'Equipo digital', sub: 'última generación' },
              { icon: '🕐', label: 'L-V 8am-8pm', sub: 'horario extendido' },
              { icon: '📍', label: 'San José Centro', sub: 'fácil acceso GAM' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl mb-1">{item.icon}</span>
                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Por qué MedCare ═══ */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            Por qué hacerte tu mamografía en MedCare
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">
            El mismo centro que trajo la resonancia magnética con IA a Costa Rica, ahora con mamografía digital de última generación.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Todo en un solo lugar',
                desc: 'Si tu mamografía detecta algo, la resonancia magnética, la biopsia y tu especialista están bajo el mismo techo.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                title: 'Sin filas, sin espera',
                desc: 'Equipo nuevo con agenda abierta. Agenda hoy, hazte el estudio esta semana. Resultados el mismo día.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Tecnología de punta',
                desc: 'Mamógrafo digital de alta resolución + resonador 1.5T con inteligencia artificial. Diagnóstico preciso y rápido.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Formulario de Agendamiento ═══ */}
      <section id="agendar" className="py-12 sm:py-16 bg-white scroll-mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Agenda tu estudio
            </h2>
            <p className="text-gray-500">
              Selecciona el tipo de estudio y completa tus datos. Te contactamos en menos de 30 minutos.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Tipo de estudio selector */}
            {!tipoSeleccionado && (
              <div className="p-6 sm:p-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">¿Qué estudio necesitas?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTipoSeleccionado('mamografia')}
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-700">Mamografía</h4>
                    <p className="text-sm text-gray-500 mt-1">Screening y diagnóstica digital</p>
                  </button>
                  <button
                    onClick={() => setTipoSeleccionado('ultrasonido')}
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-slate-700">Ultrasonido</h4>
                    <p className="text-sm text-gray-500 mt-1">Abdominal, pélvico, mamario, tiroideo y más</p>
                  </button>
                </div>
              </div>
            )}

            {/* Formulario */}
            {tipoSeleccionado && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setTipoSeleccionado('')}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Cambiar tipo de estudio
                </button>

                {/* Selección de servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de {tipoSeleccionado === 'mamografia' ? 'mamografía' : 'ultrasonido'} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {serviciosFiltrados.map(s => (
                      <label
                        key={s.id}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.servicio_id === s.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="servicio"
                          value={s.id}
                          checked={formData.servicio_id === s.id}
                          onChange={() => setFormData({ ...formData, servicio_id: s.id })}
                          className="mt-0.5 text-red-600 focus:ring-red-500"
                          required
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{s.nombre}</span>
                          <span className="text-xs text-gray-500 ml-2">({s.duracion_minutos} min)</span>
                          {s.preparacion && (
                            <p className="text-xs text-amber-600 mt-1">Prep: {s.preparacion}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Datos personales */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Tus Datos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="María García"
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
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="+506 8888 7777"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferencias */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Preferencia de Cita</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha preferida</label>
                      <input
                        type="date"
                        value={formData.fecha_preferida}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setFormData({ ...formData, fecha_preferida: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                      <select
                        value={formData.horario_preferido}
                        onChange={e => setFormData({ ...formData, horario_preferido: e.target.value as 'manana' | 'tarde' | 'cualquiera' })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      >
                        <option value="cualquiera">Cualquier horario</option>
                        <option value="manana">Mañana (8am - 12pm)</option>
                        <option value="tarde">Tarde (1pm - 5pm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Médico referente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Médico que la refiere (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.medico_referente}
                    onChange={e => setFormData({ ...formData, medico_referente: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="Dr. Nombre Apellido"
                  />
                </div>

                {/* Fuente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo nos conoció?</label>
                  <select
                    value={formData.fuente}
                    onChange={e => setFormData({ ...formData, fuente: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="web">Página web</option>
                    <option value="google_ads">Google</option>
                    <option value="facebook">Facebook / Instagram</option>
                    <option value="referido">Referido por médico</option>
                    <option value="telefono">Llamada telefónica</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/25"
                  >
                    {loading ? 'Enviando...' : 'Agendar Mi Estudio'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Te contactaremos en menos de 30 minutos para confirmar tu cita.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: '¿La mamografía duele?',
                a: 'La mamografía puede causar una leve presión momentánea, pero dura solo unos segundos por imagen. La mayoría de pacientes la describen como incómoda pero tolerable. En MedCare usamos equipo digital de última generación que requiere menos compresión.',
              },
              {
                q: '¿Cuánto tiempo toma el estudio?',
                a: 'La mamografía toma aproximadamente 15-20 minutos. El ultrasonido entre 20-30 minutos dependiendo del tipo. Los resultados se entregan el mismo día.',
              },
              {
                q: '¿Necesito referencia médica?',
                a: 'Para mamografía de screening (preventiva), no necesitas referencia. Si tu médico te ordenó una mamografía diagnóstica, trae la orden. Para ultrasonido, recomendamos traer la orden médica.',
              },
              {
                q: '¿Cada cuánto debo hacerme la mamografía?',
                a: 'La recomendación es una mamografía anual a partir de los 40 años. Si tienes antecedentes familiares de cáncer de mama, tu médico puede recomendar iniciar antes.',
              },
              {
                q: '¿Aceptan seguros médicos?',
                a: 'Sí, trabajamos con las principales aseguradoras del país. Contáctanos por WhatsApp para verificar tu cobertura antes de la cita.',
              },
              {
                q: '¿Qué preparación necesito?',
                a: 'Para mamografía: no usar desodorante, talco ni cremas el día del estudio. Vestir ropa de dos piezas para mayor comodidad. Para ultrasonido abdominal: ayuno de 6-8 horas.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Image
                src={B.logo.white}
                alt="MedCare"
                width={160}
                height={44}
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm text-gray-400 leading-relaxed">
                {B.contact.fullName}. Más de 7 años brindando diagnóstico de alta precisión en Costa Rica.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contacto</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href={`tel:${B.contact.phone}`} className="flex items-center gap-2 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {B.contact.phone}
                </a>
                <a href={B.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp: {B.contact.whatsapp}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Ubicación</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">
                {B.contact.address}
              </p>
              <p className="text-sm text-gray-400">
                {B.contact.hours}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {B.contact.fullName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ═══ WhatsApp Floating Button ═══ */}
      <a
        href={B.contact.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110 z-50"
        aria-label="WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  )
}
