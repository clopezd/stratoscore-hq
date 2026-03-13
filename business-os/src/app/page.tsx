'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Target, MessageSquare, Zap, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Logo } from '@/shared/components/Logo'

// ── Brand palette — StratosCore Brand Guidelines ──────────────────────────────
// 1. Deep Carbon #001117 (10% — acentos oscuros solamente)
// 2. Platinum #E0EDE0 (40% — fondos claros, textos primarios)
// 3. Electric Cyan #00F2FE (30% — acentos interactivos, calls-to-action)
// 4. Stellar Gray #8B949E (20% — textos secundarios, detalles)

const GLOBAL_STYLES = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .fade-d1 { animation: fadeUp 0.6s 0.1s ease both; }
  .fade-d2 { animation: fadeUp 0.6s 0.2s ease both; }
  .fade-d3 { animation: fadeUp 0.6s 0.3s ease both; }
`

// ── Card con hover suave ──────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background: 'linear-gradient(135deg, #F5F8F5 0%, #E0EDE0 100%)',
        boxShadow: '0 4px 20px rgba(0,17,23,0.08), 0 0 0 1px rgba(0,242,254,0.1)',
      }}
    >
      {children}
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const agents = [
  {
    id: 'hunter',
    icon: Target,
    name: 'HUNTER',
    tagline: 'Lead Generation Engine',
    description: 'Encuentra prospectos calificados 24/7. Scraping inteligente, scoring automático y outreach personalizado.',
    color: '#00F2FE',
    metrics: [
      { value: '150+', label: 'leads/mes' },
      { value: '78%', label: 'score promedio' },
      { value: '24/7', label: 'búsqueda activa' },
    ],
  },
  {
    id: 'closer',
    icon: MessageSquare,
    name: 'CLOSER',
    tagline: 'Sales Automation Agent',
    description: 'Atiende consultas, califica intención y agenda demos. WhatsApp, chat web, email — todo automatizado.',
    color: '#00F2FE',
    metrics: [
      { value: '94%', label: 'tasa de respuesta' },
      { value: '<30s', label: 'tiempo promedio' },
      { value: '24/7', label: 'disponibilidad' },
    ],
  },
  {
    id: 'executor',
    icon: Zap,
    name: 'EXECUTOR',
    tagline: 'Agentic Operating System',
    description: 'Tu asistente ejecutivo. Gestiona inbox, genera reportes, ejecuta tareas y controla tu ecosistema digital.',
    color: '#00F2FE',
    metrics: [
      { value: '4.2h', label: 'tiempo ahorrado/día' },
      { value: '80%', label: 'tareas automatizadas' },
      { value: '∞', label: 'capacidad' },
    ],
  },
]

const portfolio = [
  {
    name: 'MEDCARE Lavandería',
    industry: 'Operaciones',
    description: 'Sistema completo de gestión para lavandería premium con portal de pedidos y logística integrada.',
    metrics: ['+40% ocupación', '0 pedidos perdidos', '24/7 operación'],
  },
  {
    name: 'Videndum Intelligence',
    industry: 'B2B SaaS',
    description: 'Dashboard de inteligencia comercial con análisis de ventas, forecasting y detección de obsolescencia.',
    metrics: ['Pipeline automatizado', 'Análisis predictivo', 'Reportes en tiempo real'],
  },
  {
    name: 'Mobility Platform',
    industry: 'Logística',
    description: 'Plataforma de gestión para servicios de movilidad corporativa.',
    metrics: ['En desarrollo', 'Q2 2026', 'Full stack'],
  },
]

const NAV_LINKS = ['Agentes', 'Casos de Éxito', 'Contacto']

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('landing')
    return () => document.body.classList.remove('landing')
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-white">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* ── Background decorativo ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Gradient suave */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F8F5] via-white to-[#E0EDE0]" />

        {/* Orbs flotantes con cyan sutil */}
        <div
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #00F2FE 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #00F2FE 0%, transparent 70%)',
            animation: 'float 25s 5s ease-in-out infinite'
          }}
        />

        {/* Grid muy sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#00F2FE 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(0,242,254,0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo size={42} className="object-contain rounded-md" />
            <span
              className="text-sm font-semibold uppercase tracking-[0.2em] hidden sm:inline"
              style={{ color: '#001117' }}
            >
              STRATOS<span style={{ color: '#8B949E', margin: '0 6px' }}>|</span>CORE
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#001117' }}>
            {NAV_LINKS.map(item => (
              <button
                key={item}
                className="hover:text-[#00F2FE] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: '#8B949E' }}
            >
              Acceder
            </Link>
            <Link
              href="https://calendly.com/contacto-stratoscore/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: '#00F2FE',
                color: '#001117',
                boxShadow: '0 4px 14px rgba(0,242,254,0.35)'
              }}
            >
              Agendar Demo →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
            style={{ color: '#001117' }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-6 py-4 space-y-3"
            style={{ borderColor: 'rgba(0,242,254,0.15)', background: 'rgba(255,255,255,0.95)' }}
          >
            {NAV_LINKS.map(item => (
              <button
                key={item}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: '#001117' }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </button>
            ))}
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: '#8B949E' }}
              onClick={() => setMenuOpen(false)}
            >
              Acceder →
            </Link>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center fade-up">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(0,242,254,0.08)',
                border: '1px solid rgba(0,242,254,0.2)',
                color: '#001117'
              }}
            >
              <Sparkles size={16} style={{ color: '#00F2FE' }} />
              <span>3 Agentes IA — Totalmente Operativos</span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight tracking-tight max-w-5xl mx-auto mb-6"
              style={{ color: '#001117' }}
            >
              Tu negocio no necesita más empleados.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #00C8D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Necesita mejores agentes.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12"
              style={{ color: '#8B949E' }}
            >
              <span style={{ color: '#001117', fontWeight: 600 }}>HUNTER</span> consigue leads mientras duermes.{' '}
              <span style={{ color: '#001117', fontWeight: 600 }}>CLOSER</span> atiende y agenda 24/7.{' '}
              <span style={{ color: '#001117', fontWeight: 600 }}>EXECUTOR</span> hace el 80% de tus tareas manuales.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-16 fade-d1">
              <Link
                href="https://calendly.com/contacto-stratoscore/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-10 py-5 rounded-2xl font-bold text-lg tracking-wide transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                style={{
                  background: '#00F2FE',
                  color: '#001117',
                  boxShadow: '0 8px 24px rgba(0,242,254,0.3)'
                }}
              >
                Ver Agentes en Vivo
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#agentes"
                className="px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  border: '2px solid rgba(0,242,254,0.3)',
                  color: '#001117',
                  background: 'white'
                }}
              >
                Cómo funcionan ↓
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto fade-d2">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: '#00F2FE' }}>150+</div>
                <div className="text-sm font-medium" style={{ color: '#8B949E' }}>Leads/mes</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: '#00F2FE' }}>94%</div>
                <div className="text-sm font-medium" style={{ color: '#8B949E' }}>Tasa respuesta</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2" style={{ color: '#00F2FE' }}>4.2h</div>
                <div className="text-sm font-medium" style={{ color: '#8B949E' }}>Ahorradas/día</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. LOS 3 AGENTES
      ═══════════════════════════════════════════════════════════════ */}
      <section id="agentes" className="relative z-10 px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-d1">
            <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#001117' }}>
              Tres agentes. Un solo objetivo:
            </h2>
            <p className="text-2xl md:text-3xl font-semibold" style={{ color: '#00F2FE' }}>
              Que nunca más pierdas un cliente.
            </p>
          </div>

          <div className="space-y-8 fade-d2">
            {agents.map((agent) => {
              const IconComponent = agent.icon
              return (
                <Card key={agent.id}>
                  <div className="p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-10">
                      {/* Left: Info */}
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="p-4 rounded-2xl"
                            style={{
                              background: 'rgba(0,242,254,0.1)',
                              border: '2px solid rgba(0,242,254,0.2)',
                            }}
                          >
                            <IconComponent size={36} style={{ color: '#00F2FE' }} strokeWidth={2} />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold mb-1" style={{ color: '#001117' }}>
                              {agent.name}
                            </h3>
                            <p className="text-sm font-medium" style={{ color: '#8B949E' }}>
                              {agent.tagline}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg mb-8 leading-relaxed" style={{ color: '#001117' }}>
                          {agent.description}
                        </p>
                      </div>

                      {/* Right: Metrics */}
                      <div className="space-y-4">
                        {agent.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="p-6 rounded-2xl"
                            style={{
                              background: 'white',
                              border: '1px solid rgba(0,242,254,0.15)',
                            }}
                          >
                            <div className="text-4xl font-bold mb-1" style={{ color: '#00F2FE' }}>
                              {metric.value}
                            </div>
                            <div className="text-sm font-medium" style={{ color: '#8B949E' }}>
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. PORTFOLIO / CASOS DE ÉXITO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20 md:py-32" style={{ background: '#F5F8F5' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-d1">
            <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#001117' }}>
              Casos de Éxito
            </h2>
            <p className="text-xl md:text-2xl" style={{ color: '#8B949E' }}>
              Soluciones completas para clientes reales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 fade-d2">
            {portfolio.map((project) => (
              <Card key={project.name}>
                <div className="p-8 h-full flex flex-col">
                  <div className="mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: 'rgba(0,242,254,0.15)',
                        color: '#00F2FE',
                      }}
                    >
                      {project.industry}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#001117' }}>
                    {project.name}
                  </h3>

                  <p className="text-base mb-6 leading-relaxed flex-1" style={{ color: '#8B949E' }}>
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    {project.metrics.map((metric) => (
                      <div
                        key={metric}
                        className="flex items-center gap-2 text-sm font-medium"
                        style={{ color: '#00F2FE' }}
                      >
                        <CheckCircle size={16} />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto fade-d1">
          <Card>
            <div className="px-8 md:px-16 py-16 md:py-20 text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#001117' }}>
                ¿Listo para que los agentes{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #00F2FE 0%, #00C8D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  trabajen por ti
                </span>?
              </h2>

              <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
                30 minutos. Sin tecnicismos. Te mostramos HUNTER, CLOSER y EXECUTOR en acción.
              </p>

              <Link
                href="https://calendly.com/contacto-stratoscore/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-bold text-xl tracking-wide transition-all duration-200 hover:scale-105"
                style={{
                  background: '#00F2FE',
                  color: '#001117',
                  boxShadow: '0 8px 32px rgba(0,242,254,0.35)'
                }}
              >
                Ver Demo en Vivo
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-8 text-sm font-medium" style={{ color: '#8B949E' }}>
                Sin compromiso · Respuesta en {'<'}1 hora · Lunes a sábado
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-12" style={{ background: '#F5F8F5' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={36} className="object-contain rounded-md" />
            <span
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#8B949E' }}
            >
              STRATOS<span style={{ margin: '0 5px', opacity: 0.4 }}>|</span>CORE
            </span>
          </div>

          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: '#8B949E' }}>
            © 2026 StratosCore · Agent-First Operating System
          </p>

          <div className="flex items-center gap-6 text-sm font-medium" style={{ color: '#8B949E' }}>
            <Link href="mailto:contacto@stratoscore.app" className="hover:text-[#00F2FE] transition-colors">
              Contacto
            </Link>
            <Link href="/login" className="hover:text-[#00F2FE] transition-colors">
              Acceder
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
