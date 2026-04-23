'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Datos del centro ──────────────────────────────────────────
const EQUIPOS = [
  {
    nombre: 'Lokomat',
    descripcion: 'Robot de marcha más avanzado del mundo. Rehabilitación de piernas con retroalimentación en tiempo real.',
    icono: '🦿',
    beneficios: ['Recuperación de marcha', 'Lesión medular', 'Post-ACV', 'Esclerosis múltiple'],
  },
  {
    nombre: 'Armeo',
    descripcion: 'Rehabilitación robótica de brazo y mano con ejercicios interactivos gamificados.',
    icono: '💪',
    beneficios: ['Movilidad de brazo', 'Motricidad fina', 'Parálisis parcial', 'Post-cirugía'],
  },
  {
    nombre: 'Erigo',
    descripcion: 'Verticalización temprana con estimulación robótica para pacientes en cama.',
    icono: '🏥',
    beneficios: ['Movilización temprana', 'UCI/Post-UCI', 'Prevención atrofia', 'Circulación'],
  },
]

const TESTIMONIOS = [
  {
    nombre: 'María G.',
    diagnostico: 'Lesión medular L4',
    texto: 'Después de 20 sesiones con Lokomat, recuperé la capacidad de caminar con andadera. El equipo es increíble.',
    sesiones: 20,
  },
  {
    nombre: 'Roberto S.',
    diagnostico: 'Post-ACV',
    texto: 'Llegué sin poder mover el brazo derecho. Hoy puedo comer solo y escribir. La tecnología robótica cambió mi vida.',
    sesiones: 30,
  },
  {
    nombre: 'Ana L.',
    diagnostico: 'Esclerosis múltiple',
    texto: 'Las sesiones de rehabilitación robótica me devolvieron independencia. Camino más segura y con menos fatiga.',
    sesiones: 15,
  },
]

const STATS = [
  { valor: '3', label: 'Equipos Lokomat' },
  { valor: '+500', label: 'Pacientes atendidos' },
  { valor: '92%', label: 'Satisfacción' },
  { valor: '80%', label: 'Mejora funcional' },
]

// ── Componente de formulario de leads ──────────────────────────
function FormularioContacto() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    diagnostico_preliminar: '',
    medico_referente: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<'ok' | 'error' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setResultado(null)

    try {
      const res = await fetch('/api/mobility/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fuente: 'web' }),
      })

      if (res.ok) {
        setResultado('ok')
        setForm({ nombre: '', telefono: '', email: '', diagnostico_preliminar: '', medico_referente: '' })
      } else {
        setResultado('error')
      }
    } catch {
      setResultado('error')
    } finally {
      setEnviando(false)
    }
  }

  if (resultado === 'ok') {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          ¡Solicitud recibida!
        </h3>
        <p className="text-gray-300">
          Nuestro equipo te contactará en las próximas 24 horas para agendar tu evaluación.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
          Nombre completo *
        </label>
        <input
          id="nombre"
          type="text"
          required
          value={form.nombre}
          onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Juan Pérez"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-1">
            Teléfono *
          </label>
          <input
            id="telefono"
            type="tel"
            required
            value={form.telefono}
            onChange={e => setForm(prev => ({ ...prev, telefono: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="+506 8888-7777"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-300 mb-1">
          Diagnóstico o condición
        </label>
        <input
          id="diagnostico"
          type="text"
          value={form.diagnostico_preliminar}
          onChange={e => setForm(prev => ({ ...prev, diagnostico_preliminar: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Ej: Lesión medular, ACV, Parkinson..."
        />
      </div>

      <div>
        <label htmlFor="medico" className="block text-sm font-medium text-gray-300 mb-1">
          Médico que refiere
        </label>
        <input
          id="medico"
          type="text"
          value={form.medico_referente}
          onChange={e => setForm(prev => ({ ...prev, medico_referente: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Nombre del médico (opcional)"
        />
      </div>

      {resultado === 'error' && (
        <p className="text-red-400 text-sm">
          Error al enviar. Intenta de nuevo o llámanos directamente.
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {enviando ? 'Enviando...' : 'Solicitar Evaluación Gratuita'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Te contactaremos en menos de 24 horas. Sin compromiso.
      </p>
    </form>
  )
}

// ── Landing Page Principal ──────────────────────────────────────
export default function MobilityLandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1929] text-white">

      {/* ── Header ────────────────────────────────────── */}
      <nav className="fixed w-full z-50 bg-[#0A1929]/95 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦿</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Mobility Group CR
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#tecnologia" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">Tecnología</a>
            <a href="#resultados" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">Resultados</a>
            <a href="#contacto" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">Contacto</a>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Staff
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Centro de Rehabilitación Robótica en Escazú</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Recupera tu{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                movilidad
              </span>{' '}
              con tecnología robótica
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Somos el centro con más equipos <strong className="text-white">Lokomat</strong> de Costa Rica.
              Rehabilitación neurológica y ortopédica con robots que aceleran tu recuperación hasta <strong className="text-cyan-400">3 veces más rápido</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all text-lg shadow-lg shadow-cyan-500/25"
              >
                Agendar Evaluación Gratuita
              </a>
              <a
                href="#tecnologia"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-all"
              >
                Conocer Equipos
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-cyan-500/30 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.valor}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tecnología / Equipos ──────────────────────── */}
      <section id="tecnologia" className="py-20 px-6 bg-[#0D2137]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Tecnología de{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                clase mundial
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Contamos con los equipos de rehabilitación robótica más avanzados disponibles,
              respaldados por evidencia científica internacional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {EQUIPOS.map((equipo) => (
              <div
                key={equipo.nombre}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all group"
              >
                <div className="text-4xl mb-4">{equipo.icono}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {equipo.nombre}
                </h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  {equipo.descripcion}
                </p>
                <div className="flex flex-wrap gap-2">
                  {equipo.beneficios.map((b) => (
                    <span
                      key={b}
                      className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Tu camino a la{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                recuperación
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { paso: '01', titulo: 'Evaluación', desc: 'Evaluación gratuita con nuestro equipo de fisioterapeutas especializados.' },
              { paso: '02', titulo: 'Plan personalizado', desc: 'Diseñamos un plan de rehabilitación adaptado a tu diagnóstico y objetivos.' },
              { paso: '03', titulo: 'Sesiones robóticas', desc: 'Sesiones de 60 min con equipos Lokomat, Armeo o Erigo según tu plan.' },
              { paso: '04', titulo: 'Seguimiento', desc: 'Medimos tu progreso sesión a sesión con datos objetivos del robot.' },
            ].map((item) => (
              <div key={item.paso} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-black">
                  {item.paso}
                </div>
                <h3 className="font-bold text-white mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ───────────────────────────────── */}
      <section id="resultados" className="py-20 px-6 bg-[#0D2137]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Resultados{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                reales
              </span>
            </h2>
            <p className="text-gray-400">
              Historias de pacientes que recuperaron su movilidad con nosotros.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIOS.map((t) => (
              <div
                key={t.nombre}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">&#9733;</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic leading-relaxed">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.nombre}</div>
                    <div className="text-xs text-gray-400">{t.diagnostico}</div>
                  </div>
                  <div className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                    {t.sesiones} sesiones
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulario de contacto / Leads ─────────────── */}
      <section id="contacto" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Agenda tu{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  evaluación gratuita
                </span>
              </h2>
              <p className="text-gray-400 mb-8">
                Completa el formulario y nuestro equipo te contactará en menos de 24 horas
                para agendar tu primera evaluación sin costo.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400">📍</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Ubicación</div>
                    <div className="text-sm text-gray-400">Escazú, Oficentro Trilogía, Costa Rica</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400">🕐</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Horario</div>
                    <div className="text-sm text-gray-400">Lunes a Viernes: 8:00 AM - 6:00 PM</div>
                    <div className="text-sm text-gray-400">Sábado: 8:00 AM - 1:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400">📞</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">Contacto directo</div>
                    <div className="text-sm text-gray-400">WhatsApp: +506 8888-7777</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <FormularioContacto />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🦿</span>
            <span className="font-bold text-gray-400">Mobility Group CR</span>
          </div>
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mobility Group CR. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#tecnologia" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Tecnología</a>
            <a href="#resultados" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Resultados</a>
            <a href="#contacto" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
