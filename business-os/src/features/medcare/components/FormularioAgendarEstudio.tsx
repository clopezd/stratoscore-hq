'use client'

import { useState, useEffect, useCallback } from 'react'
import { getServicios } from '../services/serviciosService'
import type { ServicioMedcare, TipoEstudio } from '../types'
import { MedCareBrand } from '../brand'
import {
  Navbar, Hero, TrustBar, PricingSection, TechSection,
  HowItWorks, WhyMedcare, FAQ, Testimonials,
  CTAFinal, Footer, WhatsAppFloat,
  UltrasonidoWordmark,
} from './landing'

const B = MedCareBrand

interface SlotInfo {
  time: string
  dateTime: string
  sourceEvent: string
  doctors?: { id: string; nombre: string }[]
}

interface DaySlots {
  date: string
  label: string
  labelFull: string
  slots: SlotInfo[]
}

interface BookingResult {
  appointment: { id: string; date: string; time: string }
  ultrasonido?: { id: string; date: string; time: string; status: string } | null
  esPromo?: boolean
  patientId: string
}

export function FormularioAgendarEstudio() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [servicios, setServicios] = useState<ServicioMedcare[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEstudio | ''>('')

  // Disponibilidad Huli — slot principal (mamógrafo o estudio único)
  const [days, setDays] = useState<DaySlots[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)

  // Disponibilidad US — solo para PROMO (segunda fase, después del mamo)
  const [daysUS, setDaysUS] = useState<DaySlots[]>([])
  const [loadingUSSlots, setLoadingUSSlots] = useState(false)
  const [selectedUSDay, setSelectedUSDay] = useState<string | null>(null)
  const [selectedUSSlot, setSelectedUSSlot] = useState<SlotInfo | null>(null)

  // Paso del formulario: 1=tipo, 2=servicio, 3=slot (+US sub-fase si promo), 4=datos, 5=confirmando
  const [step, setStep] = useState(1)
  const [esPromo, setEsPromo] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; nombre: string } | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    servicio_id: undefined as string | undefined,
    medico_referente: '',
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

  // Cargar disponibilidad de la próxima semana
  const loadAvailability = useCallback(async () => {
    setLoadingSlots(true)
    try {
      const from = new Date()
      from.setDate(from.getDate() + 1)
      const to = new Date()
      to.setDate(to.getDate() + 6)

      const fromStr = from.toISOString().split('T')[0]
      const toStr = to.toISOString().split('T')[0]

      const params = new URLSearchParams({ from: fromStr, to: toStr })
      if (tipoSeleccionado === 'ultrasonido') {
        // Agenda fusionada de los 4 radiólogos — cada slot trae los doctores libres
        params.set('mode', 'us-merged')
      }

      const res = await fetch(`/api/medcare/availability?${params}`)
      if (!res.ok) {
        const errText = await res.text()
        console.error(`Availability API ${res.status}:`, errText)
        throw new Error(`Error ${res.status}: ${errText}`)
      }
      const data = await res.json()
      setDays(data.days || [])
    } catch (err) {
      console.error('Error cargando slots:', err)
      setError(err instanceof Error ? err.message : 'Error cargando disponibilidad')
      setDays([])
    } finally {
      setLoadingSlots(false)
    }
  }, [tipoSeleccionado])

  useEffect(() => {
    if (step === 3 && days.length === 0) {
      loadAvailability()
    }
  }, [step, days.length, loadAvailability])

  // Carga la agenda fusionada de US — solo se llama en flujo PROMO después de elegir slot mamo
  const loadUSAvailability = useCallback(async () => {
    setLoadingUSSlots(true)
    try {
      const from = new Date()
      from.setDate(from.getDate() + 1)
      const to = new Date()
      to.setDate(to.getDate() + 6)
      const fromStr = from.toISOString().split('T')[0]
      const toStr = to.toISOString().split('T')[0]
      const params = new URLSearchParams({ from: fromStr, to: toStr, mode: 'us-merged' })
      const res = await fetch(`/api/medcare/availability?${params}`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setDaysUS(data.days || [])
    } catch (err) {
      console.error('Error cargando US slots:', err)
      setDaysUS([])
    } finally {
      setLoadingUSSlots(false)
    }
  }, [])

  const selectedDaySlots = days.find(d => d.date === selectedDay)
  const selectedUSDaySlots = daysUS.find(d => d.date === selectedUSDay)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot || !selectedDay) return

    setLoading(true)
    setError(null)
    setStep(5)

    try {
      const [hora] = selectedSlot.dateTime.split('T')[1]?.split('Z') || []
      const timeFormatted = hora?.substring(0, 8) || selectedSlot.time

      // En PROMO: el slot US y el radiólogo viajan como us_*
      const usHora = esPromo && selectedUSSlot
        ? (selectedUSSlot.dateTime.split('T')[1]?.split('Z')[0]?.substring(0, 8) || selectedUSSlot.time)
        : undefined

      const res = await fetch('/api/medcare/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email || undefined,
          fecha: selectedDay,
          hora: timeFormatted,
          sourceEvent: selectedSlot.sourceEvent,
          tipo_estudio: tipoSeleccionado,
          servicio_id: formData.servicio_id,
          medico_referente: formData.medico_referente || undefined,
          fuente: formData.fuente,
          notas: formData.notas || undefined,
          esPromo,
          // doctor_id = radiólogo de US (en US solo o en PROMO)
          doctor_id: selectedDoctor ? selectedDoctor.id : undefined,
          // PROMO: segunda cita US
          us_fecha: esPromo ? selectedUSDay || undefined : undefined,
          us_hora: usHora,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Error creando cita')
      }
      setBookingResult(result)
      setEsPromo(result.esPromo || false)
      setEnviado(true)
    } catch (err) {
      console.error('Error agendando:', err)
      setError(err instanceof Error ? err.message : 'Error al agendar. Intenta de nuevo.')
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  // ── Estado: Enviado / Confirmado ────────────────────────────
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEEBF5] to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Cita Confirmada!
          </h2>

          {bookingResult && selectedDay && selectedSlot && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 text-left space-y-2">
              {esPromo && (
                <div className="bg-[#FEEBF5] border border-[#FCAFD9] rounded-lg px-3 py-1.5 mb-2 inline-block">
                  <span className="text-xs font-bold text-[#C70880]">PROMO MAYO — ₡65,000</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                <span className="text-sm font-medium text-gray-900">
                  {esPromo ? 'Mamografía' : (servicioSeleccionado?.nombre || (tipoSeleccionado === 'mamografia' ? 'Mamografía' : 'Ultrasonido'))}
                </span>
                <span className="text-xs text-gray-500">— {selectedSlot.time}</span>
              </div>
              {esPromo && bookingResult.ultrasonido && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                  <span className="text-sm font-medium text-gray-900">Ultrasonido de mama</span>
                  <span className="text-xs text-gray-500">— {bookingResult.ultrasonido.time?.substring(0, 5)}</span>
                </div>
              )}
              {esPromo && !bookingResult.ultrasonido && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                  <span className="text-xs text-amber-700">El ultrasonido se coordinará por teléfono — te llamaremos para confirmarlo.</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                <span className="text-sm text-gray-700">
                  {days.find(d => d.date === selectedDay)?.labelFull || selectedDay}
                </span>
              </div>
              {tipoSeleccionado === 'ultrasonido' && selectedDoctor && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm text-gray-700">{selectedDoctor.nombre}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span className="text-sm text-gray-700">{B.contact.fullName}<br/>{B.contact.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                <span className="text-sm text-gray-700">{B.contact.phone}</span>
              </div>
            </div>
          )}

          {servicioSeleccionado?.preparacion && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-left">
              <p className="text-sm font-semibold text-amber-800 mb-1">Preparación para tu estudio:</p>
              <p className="text-sm text-amber-700">{servicioSeleccionado.preparacion}</p>
            </div>
          )}

          <a
            href={`${B.contact.whatsappLink}?text=Hola,%20acabo%20de%20agendar%20una%20${tipoSeleccionado || 'cita'}%20por%20la%20web.%20Mi%20nombre%20es%20${encodeURIComponent(formData.nombre)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Escribirnos por WhatsApp
          </a>

          <button
            onClick={() => {
              setEnviado(false)
              setTipoSeleccionado('')
              setStep(1)
              setSelectedDay(null)
              setSelectedSlot(null)
              setDays([])
              setBookingResult(null)
              setEsPromo(false)
              setSelectedDoctor(null)
              setSelectedUSDay(null)
              setSelectedUSSlot(null)
              setDaysUS([])
            }}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Agendar otro estudio
          </button>
        </div>
      </div>
    )
  }

  // ── Landing Page + Formulario ─────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustBar />
      <PricingSection />
      <TechSection />
      <HowItWorks />
      <WhyMedcare />

      {/* ═══ Formulario de Agendamiento ═══ */}
      <section id="agendar" className="py-12 sm:py-16 bg-white scroll-mt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Agenda tu estudio
            </h2>
            <p className="text-gray-500">
              Escogé tu estudio, seleccioná la hora y confirmá tu cita al instante.
            </p>
          </div>

          {/* Progress bar — shape "seno" (simbolo oficial) en lugar de círculo */}
          {(() => {
            // US salta el step 2 (no hay sub-tipo ni elección previa de doctor) → 3 pasos
            const labels = tipoSeleccionado === 'ultrasonido'
              ? ['Estudio', 'Horario', 'Datos']
              : ['Estudio', 'Servicio', 'Horario', 'Datos']
            // Mapeamos el step interno (1,3,4) al índice visual (0,1,2) para US
            const visualIndex = tipoSeleccionado === 'ultrasonido'
              ? (step === 1 ? 0 : step === 3 ? 1 : step === 4 ? 2 : step >= 5 ? 3 : 0)
              : step - 1
            return (
              <div className="flex items-center justify-center gap-2 mb-8">
                {labels.map((label, i) => {
                  const active = visualIndex === i
                  const done = visualIndex > i
                  const fillColor = active || done ? '#E50995' : '#E5E7EB'
                  const textColor = active || done ? '#FFFFFF' : '#6B7280'
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div className="relative w-11 h-10 flex items-center justify-center transition">
                        <svg viewBox="0 0 100 95" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                          <path
                            d="M50 5 C 22 5, 8 30, 8 52 C 8 75, 28 90, 50 90 C 72 90, 92 75, 92 52 C 92 30, 78 5, 50 5 Z"
                            fill={fillColor}
                          />
                        </svg>
                        <span className="relative z-10 text-xs font-bold" style={{ color: textColor }}>
                          {done ? '✓' : i + 1}
                        </span>
                      </div>
                      <span className={`text-xs hidden sm:inline ${active ? 'text-[#E50995] font-medium' : 'text-gray-400'}`}>{label}</span>
                      {i < labels.length - 1 && <div className={`w-8 h-0.5 ${done ? 'bg-[#E50995]' : 'bg-gray-200'}`} />}
                    </div>
                  )
                })}
              </div>
            )
          })()}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {error && (
              <div className="mx-6 mt-6 bg-[#FEEBF5] border border-[#FCAFD9] text-[#C70880] px-4 py-3 rounded-lg text-sm">
                {error}
                <button onClick={() => setError(null)} className="ml-2 text-[#E50995] hover:text-[#C70880]">✕</button>
              </div>
            )}

            {/* ── STEP 1: Tipo de estudio ── */}
            {step === 1 && (
              <div className="p-6 sm:p-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">¿Qué estudio necesitás?</h3>

                {/* Promo destacada */}
                <button
                  onClick={() => { setTipoSeleccionado('mamografia'); setEsPromo(true); setFormData({ ...formData, servicio_id: undefined }); setStep(3) }}
                  className="group w-full p-5 border-2 border-[#EC52B4] bg-[#FEEBF5] rounded-xl hover:bg-[#FBCFE8] transition-all text-left mb-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#E50995] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    PROMO MAYO
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#E50995] rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#C70880]">Mamografía + Ultrasonido de mama</h4>
                      <p className="text-sm text-[#E50995] mt-0.5">
                        <span className="line-through text-gray-400 mr-1">₡84,000</span>
                        Paquete completo por solo <strong className="text-[#A40771] text-base">₡65,000</strong>
                      </p>
                    </div>
                  </div>
                </button>

                <p className="text-xs text-gray-400 text-center mb-4">— o seleccioná un estudio individual —</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => { setTipoSeleccionado('mamografia'); setEsPromo(false); setStep(2) }}
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-[#EC52B4] hover:bg-[#FEEBF5] transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-[#FBCFE8] rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-[#E50995]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#C70880]">Mamografía</h4>
                    <p className="text-sm text-gray-500 mt-1">Tomosíntesis 3D digital — <strong>₡35,000</strong></p>
                  </button>
                  <button
                    onClick={() => {
                      setTipoSeleccionado('ultrasonido')
                      setEsPromo(false)
                      setSelectedDoctor(null)
                      setDays([])
                      setSelectedDay(null)
                      setSelectedSlot(null)
                      // US no tiene sub-tipos — saltamos directo a horarios (agenda fusionada de los 4 radiólogos)
                      setStep(3)
                    }}
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-[#EC52B4] hover:bg-[#FEEBF5] transition-all text-left"
                  >
                    <div className="mb-3">
                      <UltrasonidoWordmark size="sm" />
                    </div>
                    <p className="text-sm text-gray-500">Estudio complementario — <strong>₡49,000</strong></p>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2A: Selección de servicio (mamografía) ── */}
            {step === 2 && tipoSeleccionado === 'mamografia' && (
              <div className="p-6 sm:p-8">
                <button type="button" onClick={() => { setStep(1); setTipoSeleccionado('') }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Cambiar tipo
                </button>
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Tipo de mamografía
                </h3>
                <div className="space-y-2">
                  {serviciosFiltrados.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setFormData({ ...formData, servicio_id: s.id }); setStep(3) }}
                      className={`w-full flex items-start gap-3 p-4 border-2 rounded-xl transition-all text-left ${
                        formData.servicio_id === s.id ? 'border-[#E50995] bg-[#FEEBF5]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#FBCFE8] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[#E50995] font-bold text-sm">{s.duracion_minutos}m</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{s.nombre}</span>
                        {s.preparacion && (
                          <p className="text-xs text-amber-600 mt-1">{s.preparacion}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Selección de fecha y hora ── */}
            {step === 3 && (
              <div className="p-6 sm:p-8">
                <button
                  type="button"
                  onClick={() => {
                    if (esPromo || tipoSeleccionado === 'ultrasonido') {
                      setStep(1)
                      setSelectedDoctor(null)
                    } else {
                      setStep(2)
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {esPromo || tipoSeleccionado === 'ultrasonido' ? 'Cambiar estudio' : 'Cambiar servicio'}
                </button>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Seleccioná fecha y hora</h3>
                {tipoSeleccionado === 'ultrasonido' && (
                  <p className="text-sm text-gray-500 mb-4">
                    Agenda combinada de los 4 radiólogos — al elegir el horario te mostramos quién está disponible.
                  </p>
                )}
                {tipoSeleccionado !== 'ultrasonido' && <div className="mb-4" />}

                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-[#E50995] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Consultando disponibilidad...</p>
                  </div>
                ) : days.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay horarios disponibles en este momento.</p>
                    <button onClick={loadAvailability} className="mt-3 text-sm text-[#E50995] hover:text-[#C70880] font-medium">Reintentar</button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                      {days.map(d => (
                        <button
                          key={d.date}
                          onClick={() => { setSelectedDay(d.date); setSelectedSlot(null); setSelectedDoctor(null) }}
                          className={`shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                            selectedDay === d.date
                              ? 'border-[#E50995] bg-[#FEEBF5] text-[#C70880]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <p className="text-xs font-medium uppercase">{d.label?.split(' ')[0]}</p>
                          <p className="text-lg font-bold">{d.date?.split('-')[2]}</p>
                          <p className="text-xs text-gray-500">{d.slots.length} slots</p>
                        </button>
                      ))}
                    </div>

                    {selectedDay && selectedDaySlots && (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Horarios disponibles — <span className="font-medium">{selectedDaySlots.labelFull}</span>
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                          {selectedDaySlots.slots.map((slot, i) => {
                            const isSelected = selectedSlot?.dateTime === slot.dateTime
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedSlot(slot)
                                  if (tipoSeleccionado === 'ultrasonido') {
                                    const docs = slot.doctors || []
                                    if (docs.length === 1) {
                                      // Solo 1 radiólogo libre a esa hora — auto-asigna y avanza
                                      setSelectedDoctor(docs[0])
                                      setStep(4)
                                    } else {
                                      // Varios disponibles — mostramos mini-picker debajo del slot
                                      setSelectedDoctor(null)
                                    }
                                  } else if (esPromo) {
                                    // PROMO: ya elegimos slot mamógrafo. Cargamos agenda US fusionada para 2da fase.
                                    setSelectedDoctor(null)
                                    setSelectedUSDay(null)
                                    setSelectedUSSlot(null)
                                    setDaysUS([])
                                    loadUSAvailability()
                                  } else {
                                    setStep(4)
                                  }
                                }}
                                className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'border-[#E50995] bg-[#FEEBF5] text-[#C70880]'
                                    : 'border-gray-200 hover:border-[#E50995] hover:bg-[#FEEBF5] text-gray-700'
                                }`}
                              >
                                {slot.time}
                              </button>
                            )
                          })}
                        </div>

                        {/* Mini-picker de radiólogo: aparece cuando el slot tiene varios doctores libres */}
                        {tipoSeleccionado === 'ultrasonido' && selectedSlot && (selectedSlot.doctors?.length || 0) > 1 && (
                          <div className="mt-6 p-4 bg-[#FEEBF5] border border-[#FCAFD9] rounded-xl">
                            <p className="text-sm font-semibold text-[#C70880] mb-3">
                              A las {selectedSlot.time} están disponibles:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedSlot.doctors!.map(doc => (
                                <button
                                  key={doc.id}
                                  onClick={() => {
                                    setSelectedDoctor(doc)
                                    setStep(4)
                                  }}
                                  className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border-2 border-transparent hover:border-[#E50995] transition-all text-left"
                                >
                                  <div className="w-8 h-8 bg-[#FBCFE8] rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-[#E50995]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{doc.nombre}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── PROMO sub-fase: agendar el Ultrasonido ── */}
                    {esPromo && selectedSlot && (
                      <div className="mt-8 pt-6 border-t-2 border-[#FCAFD9]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#E50995] text-white text-xs font-bold px-2 py-0.5 rounded">PASO 2 DE 2</span>
                          <h3 className="text-base font-semibold text-gray-900">Ahora tu ultrasonido</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          Agenda combinada de los 4 radiólogos — al elegir el horario te mostramos quién está disponible.
                        </p>

                        {loadingUSSlots ? (
                          <div className="text-center py-6">
                            <div className="w-7 h-7 border-2 border-[#E50995] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Consultando agenda de los radiólogos...</p>
                          </div>
                        ) : daysUS.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">No hay horarios de ultrasonido disponibles esta semana.</p>
                            <button onClick={loadUSAvailability} className="mt-2 text-sm text-[#E50995] hover:text-[#C70880] font-medium">Reintentar</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                              {daysUS.map(d => (
                                <button
                                  key={d.date}
                                  onClick={() => { setSelectedUSDay(d.date); setSelectedUSSlot(null); setSelectedDoctor(null) }}
                                  className={`shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                                    selectedUSDay === d.date
                                      ? 'border-[#E50995] bg-[#FEEBF5] text-[#C70880]'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  <p className="text-xs font-medium uppercase">{d.label?.split(' ')[0]}</p>
                                  <p className="text-lg font-bold">{d.date?.split('-')[2]}</p>
                                  <p className="text-xs text-gray-500">{d.slots.length} slots</p>
                                </button>
                              ))}
                            </div>

                            {selectedUSDay && selectedUSDaySlots && (
                              <div>
                                <p className="text-sm text-gray-600 mb-3">
                                  Horarios disponibles — <span className="font-medium">{selectedUSDaySlots.labelFull}</span>
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto">
                                  {selectedUSDaySlots.slots.map((slot, i) => {
                                    const isSelected = selectedUSSlot?.dateTime === slot.dateTime
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          setSelectedUSSlot(slot)
                                          const docs = slot.doctors || []
                                          if (docs.length === 1) {
                                            setSelectedDoctor(docs[0])
                                            setStep(4)
                                          } else {
                                            setSelectedDoctor(null)
                                          }
                                        }}
                                        className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                          isSelected
                                            ? 'border-[#E50995] bg-[#FEEBF5] text-[#C70880]'
                                            : 'border-gray-200 hover:border-[#E50995] hover:bg-[#FEEBF5] text-gray-700'
                                        }`}
                                      >
                                        {slot.time}
                                      </button>
                                    )
                                  })}
                                </div>

                                {/* Mini-picker de radiólogo para el slot US del PROMO */}
                                {selectedUSSlot && (selectedUSSlot.doctors?.length || 0) > 1 && (
                                  <div className="mt-6 p-4 bg-[#FEEBF5] border border-[#FCAFD9] rounded-xl">
                                    <p className="text-sm font-semibold text-[#C70880] mb-3">
                                      A las {selectedUSSlot.time} están disponibles:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {selectedUSSlot.doctors!.map(doc => (
                                        <button
                                          key={doc.id}
                                          onClick={() => {
                                            setSelectedDoctor(doc)
                                            setStep(4)
                                          }}
                                          className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border-2 border-transparent hover:border-[#E50995] transition-all text-left"
                                        >
                                          <div className="w-8 h-8 bg-[#FBCFE8] rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-[#E50995]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">{doc.nombre}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── STEP 4: Datos personales ── */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                <button type="button" onClick={() => {
                  setStep(3)
                  // En US: limpiar selección de doctor para que pueda re-elegir slot
                  if (tipoSeleccionado === 'ultrasonido') setSelectedDoctor(null)
                }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Cambiar horario
                </button>

                {selectedSlot && selectedDay && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-green-800">
                      {esPromo ? 'Promo: Mamografía + US de mama — ₡65,000' : (servicioSeleccionado?.nombre || (tipoSeleccionado === 'mamografia' ? 'Mamografía — ₡35,000' : 'Ultrasonido de mama — ₡49,000'))}
                    </p>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">{esPromo ? 'Mamografía: ' : ''}</span>
                      {days.find(d => d.date === selectedDay)?.labelFull} — {selectedSlot.time}
                    </p>
                    {esPromo && selectedUSSlot && selectedUSDay && (
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Ultrasonido: </span>
                        {daysUS.find(d => d.date === selectedUSDay)?.labelFull} — {selectedUSSlot.time}
                        {selectedDoctor && <span className="text-gray-600"> · {selectedDoctor.nombre}</span>}
                      </p>
                    )}
                    {!esPromo && tipoSeleccionado === 'ultrasonido' && selectedDoctor && (
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Radiólogo: </span>{selectedDoctor.nombre}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo <span className="text-[#E50995]">*</span>
                    </label>
                    <input type="text" required value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50995] focus:border-transparent text-sm text-gray-900 bg-white"
                      placeholder="María García" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-[#E50995]">*</span>
                    </label>
                    <input type="tel" required value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50995] focus:border-transparent text-sm text-gray-900 bg-white"
                      placeholder="+506 8888 7777" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
                  <input type="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50995] focus:border-transparent text-sm text-gray-900 bg-white"
                    placeholder="correo@ejemplo.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Médico que la refiere (opcional)</label>
                  <input type="text" value={formData.medico_referente}
                    onChange={e => setFormData({ ...formData, medico_referente: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50995] focus:border-transparent text-sm text-gray-900 bg-white"
                    placeholder="Dr. Nombre Apellido" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo nos conoció?</label>
                  <select value={formData.fuente}
                    onChange={e => setFormData({ ...formData, fuente: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50995] focus:border-transparent text-sm text-gray-900 bg-white">
                    <option value="web">Página web</option>
                    <option value="google_ads">Google</option>
                    <option value="facebook">Facebook / Instagram</option>
                    <option value="referido">Referido por médico</option>
                    <option value="telefono">Llamada telefónica</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full px-6 py-4 bg-[#E50995] hover:bg-[#C70880] text-white rounded-xl font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E50995]/25">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Agendando tu cita...
                    </span>
                  ) : 'Confirmar Cita'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                  Al confirmar, aceptás que MedCare Centro Médico almacene tus datos personales
                  con el único fin de gestionar tu cita y enviarte recordatorios.
                  Tus datos no serán compartidos con terceros.
                  Podés solicitar su eliminación escribiendo a {B.contact.whatsapp}.
                </p>
              </form>
            )}

            {/* ── STEP 5: Procesando ── */}
            {step === 5 && !enviado && (
              <div className="p-6 sm:p-8 text-center py-12">
                <div className="w-12 h-12 border-3 border-[#E50995]-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Creando tu cita en MedCare...</p>
                <p className="text-sm text-gray-400 mt-1">Esto toma unos segundos</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FAQ />
      <Testimonials />
      <CTAFinal />
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
