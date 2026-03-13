'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Target, MessageSquare, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import { Logo } from '@/shared/components/Logo'

// ── Brand palette — stratoscore-brand.jpg ─────────────────────────────────────
// #001117 Deep Carbon · #E0EDE0 Platinum · #00F2FE Electric Cyan · #8B949E Stellar Gray

const GLOBAL_STYLES = `
  @keyframes scanner {
    0%   { top: -2px; opacity: 0; }
    3%   { opacity: 1; }
    97%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes orbFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-18px) scale(1.03); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0,242,254,0.3); }
    50%      { box-shadow: 0 0 40px rgba(0,242,254,0.6); }
  }
  .fade-up    { animation: fadeUp 0.7s ease both; }
  .fade-d1    { animation: fadeUp 0.7s 0.12s ease both; }
  .fade-d2    { animation: fadeUp 0.7s 0.24s ease both; }
  .fade-d3    { animation: fadeUp 0.7s 0.36s ease both; }
  .fade-d4    { animation: fadeUp 0.7s 0.48s ease both; }
  .pulse-dot  { animation: pulse-dot 1.8s ease-in-out infinite; }
`

// ── TiltCard ──────────────────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(8px)`
  }

  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: 'transform 0.2s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}

// ── Mac Window Chrome ─────────────────────────────────────────────────────────
function Window({
  title,
  children,
  className = '',
  glowColor = 'rgba(0,242,254,0.10)',
  accentTop = false,
  accentColor = 'rgba(0,242,254,0.4)',
}: {
  title: string
  children: React.ReactNode
  className?: string
  glowColor?: string
  accentTop?: boolean
  accentColor?: string
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(0,17,23,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px ${glowColor}`,
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)' }} />

      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-[11px]"
        style={{ background: 'rgba(255,255,255,0.022)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-[6px]">
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#FF5F56', boxShadow: '0 0 8px rgba(255,95,86,0.7)' }} />
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#FFBD2E', boxShadow: '0 0 8px rgba(255,189,46,0.6)' }} />
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#27C93F', boxShadow: '0 0 8px rgba(39,201,63,0.7)' }} />
        </div>
        <span className="flex-1 text-center text-[11px] font-mono" style={{ color: '#8B949E', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div className="w-[38px]" />
      </div>

      {accentTop && (
        <div className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      )}

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
    capabilities: [
      'Scraping de Google Maps, LinkedIn, directorios',
      'Calificación automática con IA (BANT scoring)',
      'Email sequences y LinkedIn outreach',
      'Enriquecimiento de datos y validación',
    ],
  },
  {
    id: 'closer',
    icon: MessageSquare,
    name: 'CLOSER',
    tagline: 'Sales Automation Agent',
    description: 'Atiende consultas, califica intención y agenda demos. WhatsApp, chat web, email — todo automatizado.',
    color: '#27C93F',
    metrics: [
      { value: '94%', label: 'tasa de respuesta' },
      { value: '<30s', label: 'tiempo promedio' },
      { value: '24/7', label: 'disponibilidad' },
    ],
    capabilities: [
      'Respuesta multicanal (WhatsApp, web, Instagram)',
      'Calificación de intención y FAQs automáticas',
      'Agenda demos en Calendly automáticamente',
      'Seguimiento persistente y nurturing',
    ],
  },
  {
    id: 'executor',
    icon: Zap,
    name: 'EXECUTOR',
    tagline: 'Agentic Operating System',
    description: 'Tu asistente ejecutivo. Gestiona inbox, genera reportes, ejecuta tareas y controla tu ecosistema digital.',
    color: '#FFBD2E',
    metrics: [
      { value: '4.2h', label: 'tiempo ahorrado/día' },
      { value: '80%', label: 'tareas automatizadas' },
      { value: '∞', label: 'capacidad' },
    ],
    capabilities: [
      'Gestión inteligente de inbox (email, Telegram)',
      'Generación de reportes y análisis automáticos',
      'Ejecución de tareas complejas via código',
      'Integración total con Mission Control y Finance OS',
    ],
  },
]

const portfolio = [
  {
    name: 'MEDCARE Lavandería',
    industry: 'Operaciones Multi-sede',
    description: 'Sistema completo de gestión para lavandería premium con portal de pedidos y logística integrada.',
    metrics: ['+40% ocupación', '0 pedidos perdidos', '24/7 operación'],
    status: 'production',
    agent: 'CLOSER',
  },
  {
    name: 'Videndum Intelligence',
    industry: 'B2B SaaS',
    description: 'Dashboard de inteligencia comercial con análisis de ventas, forecasting y detección de obsolescencia.',
    metrics: ['Pipeline automatizado', 'Análisis predictivo', 'Reportes en tiempo real'],
    status: 'production',
    agent: 'HUNTER',
  },
  {
    name: 'Mobility',
    industry: 'Transporte & Logística',
    description: 'Plataforma de gestión para servicios de movilidad corporativa.',
    metrics: ['En desarrollo', 'Q2 2026', 'Full stack'],
    status: 'development',
    agent: 'EXECUTOR',
  },
]

const NAV_LINKS = ['Agentes', 'Casos de Éxito', 'Contacto']

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('landing')
    return () => document.body.classList.remove('landing')
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <div
      className="min-h-screen overflow-x-hidden overflow-y-auto touch-auto bg-brandBg text-brandText"
      style={{ fontFamily: 'var(--font-grotesk), system-ui, sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />

      {/* ── Background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{ background: '#001117' }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle 520px at ${mouse.x}px ${mouse.y}px, rgba(0,242,254,0.055) 0%, transparent 70%)`,
          transition: 'background 0.08s linear',
        }} />
        <div className="absolute -top-32 right-0 w-[800px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,242,254,0.07) 0%, transparent 65%)', animation: 'orbFloat 9s ease-in-out infinite' }} />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.04) 0%, transparent 65%)', animation: 'orbFloat 13s 4s ease-in-out infinite' }} />
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(rgba(0,242,254,0.55) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,242,254,1) 2px, rgba(0,242,254,1) 3px)', backgroundSize: '100% 8px' }} />
        <div className="absolute left-0 right-0 pointer-events-none" style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,242,254,0.0) 10%, rgba(0,242,254,0.6) 50%, rgba(0,242,254,0.0) 90%, transparent 100%)',
          boxShadow: '0 0 16px 4px rgba(0,242,254,0.18)',
          animation: 'scanner 7s linear infinite',
          top: 0,
        }} />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="relative z-50"
        style={{
          background: 'rgba(0,17,23,0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,242,254,0.10)',
        }}>
        <div className="flex items-center justify-between px-4 py-3 md:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Logo size={40} className="object-contain rounded-md drop-shadow-[0_0_8px_rgba(0,242,254,0.35)]" />
            <span className="text-sm font-semibold uppercase" style={{ color: '#E0EDE0', letterSpacing: '0.26em' }}>
              STRATOS<span style={{ color: '#8B949E', margin: '0 7px' }}>|</span>CORE
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: '#8B949E' }}>
            {NAV_LINKS.map(item => (
              <button key={item} className="hover:text-[#E0EDE0] transition-colors">{item}</button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-sm text-[#8B949E] hover:text-[#E0EDE0] transition-colors">
              Acceder
            </Link>
            <Link
              href="https://calendly.com/contacto-stratoscore/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:scale-[1.04] hover:brightness-110 bg-brandCyan text-brandBg"
              style={{ boxShadow: '0 0 18px rgba(0,242,254,0.55)' }}
            >
              Agendar Demo →
            </Link>
          </div>

          {/* Mobile: CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="https://calendly.com/contacto-stratoscore/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-brandCyan text-brandBg"
              style={{ boxShadow: '0 0 14px rgba(0,242,254,0.5)' }}
            >
              Demo →
            </Link>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#8B949E', border: '1px solid rgba(0,242,254,0.15)' }}
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 flex flex-col gap-1"
            onClick={e => e.stopPropagation()}
            style={{ borderTop: '1px solid rgba(0,242,254,0.08)' }}
          >
            {NAV_LINKS.map(item => (
              <button
                key={item}
                className="text-left px-4 py-3 rounded-xl text-sm transition-colors"
                style={{ color: '#8B949E' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E0EDE0'; e.currentTarget.style.background = 'rgba(0,242,254,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8B949E'; e.currentTarget.style.background = 'transparent' }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </button>
            ))}
            <Link
              href="/login"
              className="px-4 py-3 rounded-xl text-sm transition-colors"
              style={{ color: '#8B949E' }}
              onClick={() => setMenuOpen(false)}
            >
              Acceder al dashboard →
            </Link>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 pt-12 pb-10 md:px-10 md:pt-16 md:pb-12 lg:px-16 fade-up">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 md:mb-8 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm"
            style={{ border: '1px solid rgba(0,242,254,0.22)', background: 'rgba(0,242,254,0.05)', color: '#8B949E' }}>
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#27C93F', boxShadow: '0 0 8px #27C93F' }} />
            <span>3 Agentes IA — Totalmente Operativos</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight max-w-5xl mx-auto mb-6 md:mb-8">
            Tu negocio no necesita más empleados.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 55%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 28px rgba(0,242,254,0.4))',
            }}>
              Necesita mejores agentes.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 md:mb-12" style={{ color: '#8B949E' }}>
            <span style={{ color: '#E0EDE0', fontWeight: 600 }}>HUNTER</span> consigue leads mientras duermes.{' '}
            <span style={{ color: '#E0EDE0', fontWeight: 600 }}>CLOSER</span> atiende y agenda 24/7.{' '}
            <span style={{ color: '#E0EDE0', fontWeight: 600 }}>EXECUTOR</span> hace el 80% de tus tareas manuales.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 md:gap-5 mb-12">
            <Link
              href="https://calendly.com/contacto-stratoscore/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto text-center px-8 md:px-10 py-5 rounded-xl font-bold text-base md:text-lg tracking-wide transition-all duration-200 hover:scale-[1.02] hover:brightness-110 bg-brandCyan text-brandBg uppercase flex items-center justify-center gap-3"
              style={{ boxShadow: '0 0 36px rgba(0,242,254,0.7), 0 0 90px rgba(0,242,254,0.2)' }}
            >
              Ver Agentes en Vivo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#agentes"
              className="w-full sm:w-auto text-center px-8 md:px-10 py-5 rounded-xl text-base md:text-lg font-medium transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#8B949E' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E0EDE0'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8B949E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              Cómo funcionan ↓
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#00F2FE' }}>150+</div>
              <div className="text-xs md:text-sm" style={{ color: '#8B949E' }}>Leads/mes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#27C93F' }}>94%</div>
              <div className="text-xs md:text-sm" style={{ color: '#8B949E' }}>Tasa respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#FFBD2E' }}>4.2h</div>
              <div className="text-xs md:text-sm" style={{ color: '#8B949E' }}>Ahorradas/día</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. LOS 3 AGENTES
      ═══════════════════════════════════════════════════════════════ */}
      <section id="agentes" className="relative z-10 px-4 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12 md:mb-16 fade-d1">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4">
              <div className="h-px w-12 md:w-20" style={{ background: 'rgba(0,242,254,0.35)' }} />
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(0,242,254,0.65)' }}>
                [ AGENT_LAYER ]
              </span>
              <div className="h-px w-12 md:w-20" style={{ background: 'rgba(0,242,254,0.35)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#E0EDE0' }}>
              Tres agentes. Un solo objetivo:
            </h2>
            <p className="text-xl md:text-2xl" style={{ color: '#00F2FE' }}>
              Que nunca más pierdas un cliente.
            </p>
          </div>

          <div className="space-y-8 md:space-y-12 fade-d2">
            {agents.map((agent, idx) => {
              const IconComponent = agent.icon
              return (
                <TiltCard key={agent.id}>
                  <Window title={`${agent.id}.agent.stratoscore.app`} glowColor={`${agent.color}20`}>
                    <div className="p-6 md:p-10">
                      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left: Info */}
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <div
                              className="p-4 rounded-xl"
                              style={{
                                background: `${agent.color}15`,
                                border: `1px solid ${agent.color}30`,
                              }}
                            >
                              <IconComponent size={32} style={{ color: agent.color }} strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl md:text-3xl font-bold" style={{ color: agent.color }}>
                                  {agent.name}
                                </h3>
                                <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#27C93F', boxShadow: '0 0 8px #27C93F' }} />
                              </div>
                              <p className="text-sm font-mono" style={{ color: '#8B949E' }}>
                                {agent.tagline}
                              </p>
                            </div>
                          </div>

                          <p className="text-base md:text-lg mb-6 leading-relaxed" style={{ color: '#E0EDE0' }}>
                            {agent.description}
                          </p>

                          <div className="space-y-3">
                            {agent.capabilities.map((cap) => (
                              <div key={cap} className="flex items-start gap-3">
                                <CheckCircle size={18} style={{ color: agent.color, marginTop: '2px', flexShrink: 0 }} />
                                <span className="text-sm md:text-base" style={{ color: '#8B949E' }}>{cap}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Metrics */}
                        <div className="space-y-4">
                          <div className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(0,242,254,0.45)' }}>
                            [ MÉTRICAS_EN_VIVO ]
                          </div>
                          {agent.metrics.map((metric) => (
                            <div
                              key={metric.label}
                              className="p-5 rounded-xl"
                              style={{
                                background: 'rgba(0,17,23,0.6)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: agent.color }}>
                                {metric.value}
                              </div>
                              <div className="text-sm" style={{ color: '#8B949E' }}>
                                {metric.label}
                              </div>
                            </div>
                          ))}
                          <div
                            className="p-4 rounded-xl text-center"
                            style={{
                              background: `${agent.color}08`,
                              border: `1px solid ${agent.color}20`,
                            }}
                          >
                            <span className="text-sm font-mono" style={{ color: agent.color }}>
                              ✓ SISTEMA_ACTIVO :: {idx === 0 ? 'HUNTING' : idx === 1 ? 'LISTENING' : 'EXECUTING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Window>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. PORTFOLIO / CASOS DE ÉXITO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-16 md:px-10 md:py-24 lg:px-16" style={{ background: 'rgba(0,242,254,0.02)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12 md:mb-16 fade-d1">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4">
              <div className="h-px w-12 md:w-20" style={{ background: 'rgba(0,242,254,0.35)' }} />
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(0,242,254,0.65)' }}>
                [ PROYECTOS_EN_PRODUCCIÓN ]
              </span>
              <div className="h-px w-12 md:w-20" style={{ background: 'rgba(0,242,254,0.35)' }} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#E0EDE0' }}>
              Casos de Éxito
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#8B949E' }}>
              Soluciones completas para clientes reales. Desde operaciones hasta inteligencia comercial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 fade-d2">
            {portfolio.map((project) => (
              <TiltCard key={project.name}>
                <div
                  className="relative rounded-2xl overflow-hidden p-6 md:p-8 h-full flex flex-col"
                  style={{
                    background: 'rgba(0,17,23,0.92)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.4), transparent)' }} />

                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-mono uppercase"
                      style={{
                        background: project.status === 'production' ? 'rgba(39,201,63,0.15)' : 'rgba(255,189,46,0.15)',
                        color: project.status === 'production' ? '#27C93F' : '#FFBD2E',
                        border: `1px solid ${project.status === 'production' ? 'rgba(39,201,63,0.3)' : 'rgba(255,189,46,0.3)'}`,
                      }}
                    >
                      {project.status === 'production' ? '● LIVE' : '◐ DEV'}
                    </span>
                    <span className="text-xs font-mono" style={{ color: '#8B949E' }}>
                      {project.industry}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#E0EDE0' }}>
                    {project.name}
                  </h3>

                  <p className="text-sm md:text-base mb-6 leading-relaxed flex-1" style={{ color: '#8B949E' }}>
                    {project.description}
                  </p>

                  {/* Metrics */}
                  <div className="space-y-2 mb-6">
                    {project.metrics.map((metric) => (
                      <div
                        key={metric}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: '#00F2FE' }}
                      >
                        <span className="text-lg">›</span>
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>

                  {/* Agent tag */}
                  <div
                    className="px-3 py-2 rounded-lg text-center"
                    style={{
                      background: 'rgba(0,242,254,0.05)',
                      border: '1px solid rgba(0,242,254,0.15)',
                    }}
                  >
                    <span className="text-xs font-mono" style={{ color: '#00F2FE' }}>
                      Powered by {project.agent}
                    </span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. CÓMO FUNCIONA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-12 md:mb-16 fade-d1">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#E0EDE0' }}>
              El flujo completo
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#8B949E' }}>
              Desde que HUNTER encuentra un prospecto hasta que EXECUTOR cierra la venta.
            </p>
          </div>

          <div className="space-y-6 fade-d2">
            {[
              {
                step: '01',
                title: 'HUNTER encuentra prospectos',
                description: 'Scraping inteligente en Google Maps, LinkedIn y directorios. Califica automáticamente y filtra por industria, tamaño y necesidad.',
                color: '#00F2FE',
              },
              {
                step: '02',
                title: 'CLOSER inicia conversación',
                description: 'Contacto automático por email, LinkedIn o WhatsApp. Responde preguntas, califica intención y agenda demos en tu calendario.',
                color: '#27C93F',
              },
              {
                step: '03',
                title: 'EXECUTOR hace seguimiento',
                description: 'Envía propuestas, recordatorios y nurturing sequences. Genera reportes de progreso y te avisa cuando necesita tu intervención.',
                color: '#FFBD2E',
              },
              {
                step: '04',
                title: 'Tú solo cierras',
                description: 'Llegas a la demo con toda la información. El prospecto está calificado, educado y listo para comprar. Tu trabajo: firmar.',
                color: '#E0EDE0',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-6 p-6 md:p-8 rounded-2xl"
                style={{
                  background: 'rgba(0,17,23,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                    color: item.color,
                  }}
                >
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#E0EDE0' }}>
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed" style={{ color: '#8B949E' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-16 pb-20 md:px-10 md:py-20 md:pb-24 lg:px-16">
        <TiltCard className="max-w-4xl mx-auto fade-d1">
          <Window title="contact.stratoscore.app" accentTop glowColor="rgba(0,242,254,0.20)">
            <div className="px-6 md:px-12 py-12 md:py-16 text-center">
              <p className="font-mono text-xs uppercase mb-3" style={{ color: '#00F2FE', letterSpacing: '0.3em' }}>
                {'>'} INICIAR_DIAGNÓSTICO
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: '#E0EDE0' }}>
                ¿Listo para que los agentes{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  trabajen por ti
                </span>?
              </h2>

              <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
                30 minutos. Sin tecnicismos. Te mostramos HUNTER, CLOSER y EXECUTOR en acción con un caso real de tu industria.
              </p>

              <Link
                href="https://calendly.com/contacto-stratoscore/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-10 md:px-14 py-6 rounded-xl font-bold text-lg md:text-xl tracking-wide transition-all duration-200 hover:scale-[1.02] hover:brightness-110 text-center bg-brandCyan text-brandBg"
                style={{ boxShadow: '0 0 36px rgba(0,242,254,0.65), 0 0 90px rgba(0,242,254,0.2)' }}
              >
                Ver Demo en Vivo
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>

              <p className="mt-6 text-sm" style={{ color: '#8B949E' }}>
                Sin compromiso · Respuesta en {'<'}1 hora · Lunes a sábado
              </p>
            </div>
          </Window>
        </TiltCard>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-4 py-8 md:px-10 md:py-10">
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 px-6 md:px-10 py-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2.5">
            <Logo size={32} className="object-contain rounded-sm drop-shadow-[0_0_6px_rgba(0,242,254,0.25)]" />
            <span className="text-sm font-semibold uppercase" style={{ color: '#8B949E', letterSpacing: '0.2em' }}>
              STRATOS<span style={{ margin: '0 5px', opacity: 0.35 }}>|</span>CORE
            </span>
          </div>

          <p className="text-xs uppercase tracking-widest opacity-40 font-mono text-center" style={{ color: '#8B949E' }}>
            © 2026 StratosCore · Agent-First Operating System
          </p>

          <div className="flex items-center gap-4 md:gap-5 text-sm" style={{ color: '#8B949E' }}>
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
