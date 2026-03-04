'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

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

// ── Icons ─────────────────────────────────────────────────────────────────────
function CubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" stroke="#E0EDE0" strokeWidth="1" fill="none" />
      <polygon points="24,4 44,14 24,24 4,14" stroke="#E0EDE0" strokeWidth="1" fill="none" />
      <polygon points="24,24 44,14 44,34 24,44" fill="#00F2FE" opacity="0.92" />
      <line x1="24" y1="24" x2="24" y2="44" stroke="#E0EDE0" strokeWidth="1" />
    </svg>
  )
}

function VitrineIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="4" y="8" width="32" height="22" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="4" y1="14" x2="36" y2="14" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="14" y1="30" x2="14" y2="36" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="26" y1="30" x2="26" y2="36" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="10" y1="36" x2="30" y2="36" stroke="#00F2FE" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="1.5" fill="#FF5F56" />
      <circle cx="14" cy="11" r="1.5" fill="#FFBD2E" />
      <circle cx="19" cy="11" r="1.5" fill="#27C93F" />
    </svg>
  )
}

function AgentIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <circle cx="20" cy="14" r="7" stroke="#00F2FE" strokeWidth="1.5" />
      <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#00F2FE" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="14" r="2.5" fill="#00F2FE" opacity="0.5" />
      <path d="M29 8l3-3M11 8l-3-3M20 5V2" stroke="#00F2FE" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CRMIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="4" y="4" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="22" y="4" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="4" y="22" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="22" y="22" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="11" y1="18" x2="11" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="29" y1="18" x2="29" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="11" y1="20" x2="29" y2="20" stroke="#00F2FE" strokeWidth="1.5" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const painPoints = [
  {
    icon: '💬',
    text: '¿WhatsApp saturado y sin responder?',
    tag: '[MSG_OVERFLOW :: DETECTED]',
    sub: 'Cada mensaje sin respuesta es un cliente que se va con la competencia.',
  },
  {
    icon: '📊',
    text: '¿Clientes perdidos en hojas de Excel?',
    tag: '[DATA_LOSS :: WARNING]',
    sub: 'Sin un CRM, el seguimiento depende de tu memoria — y eso tiene un costo real.',
  },
  {
    icon: '📅',
    text: '¿Citas que se olvidan por falta de recordatorios?',
    tag: '[NO_SHOW_RATE :: HIGH]',
    sub: 'El 30% de las inasistencias se evita con un recordatorio automático a tiempo.',
  },
  {
    icon: '📣',
    text: '¿Publicidad que no trae pacientes reales?',
    tag: '[ROI :: UNMEASURED]',
    sub: 'Invertir sin medir es tirar dinero. Necesitas datos, no suposiciones.',
  },
]

const metrics = [
  {
    metric: '+40%',
    label: 'más citas agendadas',
    tag: '[BOOKING_RATE :: OPTIMIZED]',
    desc: 'Automatización de agenda + recordatorios = agenda llena sin esfuerzo manual.',
    color: '#00F2FE',
    file: 'citas-agendadas.metric',
  },
  {
    metric: '0',
    label: 'clientes perdidos',
    tag: '[LEAD_LOSS :: ELIMINATED]',
    desc: 'Nuestro CRM captura, clasifica y hace seguimiento de cada contacto automáticamente.',
    color: '#00F2FE',
    file: 'clientes-perdidos.metric',
  },
  {
    metric: '24/7',
    label: 'operación automática',
    tag: '[AGENTS :: SYSTEM_ACTIVE]',
    desc: 'Tu negocio responde, agenda y vende incluso mientras duermes.',
    color: '#27C93F',
    file: 'operacion-continua.metric',
  },
]

const services = [
  {
    icon: <VitrineIcon />,
    file: 'vitrina-digital.app',
    title: 'Tu Vitrina Digital',
    subtitle: 'Tu mejor vendedor — disponible las 24 horas',
    sysTag: '[WEB :: ONLINE]',
    bullets: [
      'Sitio web profesional que convierte visitas en citas',
      'Landing pages específicas por campaña',
      'Integración con WhatsApp y formularios',
      'SEO local para que te encuentren en Google',
      'Diseño optimizado para móvil y velocidad',
    ],
  },
  {
    icon: <AgentIcon />,
    file: 'asistente-ia.app',
    title: 'Asistente IA de Agendamiento',
    subtitle: 'El recepcionista que nunca descansa',
    sysTag: '[AI_AGENT :: ACTIVE]',
    bullets: [
      'Responde WhatsApp e Instagram automáticamente',
      'Agenda citas sin intervención humana',
      'Envía recordatorios 24h y 1h antes',
      'Califica leads y filtra consultas frecuentes',
      'Escalada inteligente cuando tú tomas control',
    ],
  },
  {
    icon: <CRMIcon />,
    file: 'crm-pymes.app',
    title: 'CRM Inteligente para PYMEs',
    subtitle: 'Todos tus clientes, en un solo lugar',
    sysTag: '[CRM :: SYNCED]',
    bullets: [
      'Historial completo de cada cliente o paciente',
      'Seguimiento automatizado de oportunidades',
      'Reportes de ventas y ocupación en tiempo real',
      'Alertas de clientes inactivos para reactivar',
      'Integración con facturación y pagos',
    ],
  },
]

const audiences = [
  { label: 'CLÍNICAS', icon: '🏥' },
  { label: 'ODONTÓLOGOS', icon: '🦷' },
  { label: 'ESTÉTICA', icon: '✨' },
  { label: 'RESTAURANTES', icon: '🍽️' },
  { label: 'EMPRESAS DE SERVICIOS', icon: '⚙️' },
]

const NAV_LINKS = ['Servicios', '¿Para quién?', 'Contacto']

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

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-brandBg text-brandText"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="StratosCore" className="w-10 h-10 object-contain rounded-md" style={{ filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.35))' }} />
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
              href="mailto:hello@stratoscore.app"
              className="px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:scale-[1.04] hover:brightness-110 bg-brandCyan text-brandBg"
              style={{ boxShadow: '0 0 18px rgba(0,242,254,0.55)' }}
            >
              Diagnóstico Gratis →
            </Link>
          </div>

          {/* Mobile: CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="mailto:hello@stratoscore.app"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-brandCyan text-brandBg"
              style={{ boxShadow: '0 0 14px rgba(0,242,254,0.5)' }}
            >
              Diagnóstico →
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
      <section className="relative z-10 px-4 pt-10 pb-10 md:px-10 md:pt-10 md:pb-4 lg:px-16 fade-up">
        <TiltCard className="max-w-5xl mx-auto">
          <Window title="stratoscore.app — Centro de Mando" accentTop glowColor="rgba(0,242,254,0.15)">

            <div className="px-4 md:px-6 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full pulse-dot flex-shrink-0" style={{ background: '#27C93F', boxShadow: '0 0 8px #27C93F' }} />
                <p className="font-mono text-xs" style={{ color: 'rgba(0,242,254,0.6)' }}>
                  <span className="hidden sm:inline">Sistema activo — </span>automatización en curso
                </p>
              </div>
              <span className="hidden sm:inline font-mono text-[9px]" style={{ color: 'rgba(0,242,254,0.4)' }}>[CORE_v2.0 :: ONLINE]</span>
            </div>

            <div className="px-5 md:px-8 pb-10 md:pb-10 pt-8 md:pt-8 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6 md:mb-6 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm"
                style={{ border: '1px solid rgba(0,242,254,0.22)', background: 'rgba(0,242,254,0.05)', color: '#8B949E' }}>
                <span>🇨🇴</span>
                <span style={{ color: 'rgba(0,242,254,0.6)' }}>+</span>
                <span>🇨🇷</span>
                <span className="mx-1 opacity-40">·</span>
                <span>Automatización para PYMEs y Clínicas</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight max-w-4xl mx-auto mb-5 md:mb-5">
                Tu negocio trabajando{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 55%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 28px rgba(0,242,254,0.4))',
                }}>
                  24/7 sin que lo notes
                </span>
              </h1>

              {/* Cyber labels — hidden on mobile */}
              <div className="hidden sm:flex items-center justify-center gap-3 mb-4 md:mb-5">
                <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.45)' }}>[AI_ENGINE :: ACTIVE]</span>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#27C93F', boxShadow: '0 0 6px #27C93F' }} />
                <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.45)' }}>[GROWTH_MODE :: ON]</span>
              </div>

              {/* Subheadline */}
              <p className="text-base md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-8 md:mb-8" style={{ color: '#8B949E' }}>
                Marketing que no para mientras atiendes pacientes.{' '}
                <span style={{ color: '#E0EDE0' }}>Automatizamos tu crecimiento con IA.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 md:gap-5">
                <Link
                  href="mailto:hello@stratoscore.app"
                  className="w-full sm:w-auto text-center px-7 md:px-9 py-4 rounded-xl font-bold text-sm md:text-base tracking-wide transition-all duration-200 hover:scale-[1.02] hover:brightness-110 bg-brandCyan text-brandBg"
                  style={{ boxShadow: '0 0 36px rgba(0,242,254,0.7), 0 0 90px rgba(0,242,254,0.2)' }}
                >
                  📅 Agendar diagnóstico gratis
                </Link>
                <Link
                  href="#servicios"
                  className="w-full sm:w-auto text-center px-7 md:px-9 py-4 rounded-xl text-sm md:text-base font-medium transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#8B949E' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#E0EDE0'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.35)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8B949E'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                >
                  Ver cómo funciona ↓
                </Link>
              </div>
            </div>

            {/* Status bar — hidden on mobile and md, only visible on lg+ */}
            <div className="hidden lg:flex items-center justify-between px-6 py-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.25)' }}>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.35)' }}>stratoscore@v2.0</span>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(39,201,63,0.6)' }}>● sistema nominal</span>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.35)' }}>[UPTIME: 99.98%]</span>
            </div>
          </Window>
        </TiltCard>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. DIAGNÓSTICO DE PÉRDIDAS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-8 md:px-10 md:py-10 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-6 md:mb-8 fade-d1">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4">
              <div className="h-px w-8 md:w-16" style={{ background: 'rgba(255,189,46,0.35)' }} />
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest" style={{ color: 'rgba(255,189,46,0.75)' }}>
                [ DIAGNÓSTICO_DE_PÉRDIDAS ]
              </span>
              <div className="h-px w-8 md:w-16" style={{ background: 'rgba(255,189,46,0.35)' }} />
            </div>
            <p className="text-base md:text-lg" style={{ color: '#8B949E' }}>¿Te identificas con alguno de estos escenarios?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 fade-d2">
            {painPoints.map((p) => (
              <TiltCard key={p.tag}>
                <div
                  className="relative rounded-2xl overflow-hidden p-5 md:p-7"
                  style={{
                    background: 'rgba(0,17,23,0.90)',
                    border: '1px solid rgba(255,189,46,0.18)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,189,46,0.05)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,189,46,0.4), transparent)' }} />

                  <div className="flex items-start gap-4 md:gap-5">
                    <span className="text-2xl md:text-3xl mt-0.5 flex-shrink-0">{p.icon}</span>
                    <div>
                      <p className="text-base md:text-xl font-semibold mb-1 md:mb-2 leading-snug" style={{ color: '#E0EDE0' }}>
                        {p.text}
                      </p>
                      <p className="font-mono text-[9px] mb-2 md:mb-3" style={{ color: 'rgba(255,189,46,0.55)' }}>
                        {p.tag}
                      </p>
                      {/* Description — hidden on mobile */}
                      <p className="hidden sm:block text-base leading-relaxed" style={{ color: '#8B949E' }}>
                        {p.sub}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12 fade-d3">
            <p className="text-lg md:text-xl lg:text-2xl" style={{ color: '#8B949E' }}>
              Nosotros resolvemos todo esto.{' '}
              <span style={{ color: '#00F2FE' }}>Sin que tengas que volverte técnico.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. MÉTRICAS DE IMPACTO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-6 md:px-10 md:py-8 lg:px-16">

        <div className="max-w-5xl mx-auto mb-6 md:mb-8 fade-d1">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-center" style={{ color: 'rgba(0,242,254,0.55)' }}>
              [ MÉTRICAS_DE_IMPACTO ]
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 fade-d2">
          {metrics.map((m) => (
            <TiltCard key={m.metric}>
              <Window
                title={m.file}
                glowColor={m.color === '#27C93F' ? 'rgba(39,201,63,0.10)' : 'rgba(0,242,254,0.10)'}
              >
                <div className="px-5 md:px-6 py-6 md:py-8">
                  <p className="text-sm mb-3 md:mb-4 font-medium" style={{ color: m.color === '#27C93F' ? 'rgba(39,201,63,0.75)' : 'rgba(0,242,254,0.65)' }}>
                    ✓ Resultado verificado
                  </p>

                  {/* Metric number */}
                  <div className="text-5xl md:text-6xl font-bold mb-2 tabular-nums leading-none"
                    style={{ color: m.color, textShadow: `0 0 40px ${m.color}80`, filter: `drop-shadow(0 0 20px ${m.color}60)` }}>
                    {m.metric}
                  </div>

                  <p className="text-lg font-semibold mb-1 md:mb-2" style={{ color: '#E0EDE0' }}>{m.label}</p>
                  <p className="font-mono text-[9px] mb-3 md:mb-4" style={{ color: 'rgba(0,242,254,0.38)' }}>{m.tag}</p>

                  <div className="mb-3 md:mb-4" style={{ width: '32px', height: '1px', background: m.color, opacity: 0.45 }} />

                  {/* Description — hidden on mobile */}
                  <p className="hidden sm:block text-base leading-relaxed" style={{ color: '#8B949E' }}>{m.desc}</p>
                </div>
              </Window>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. SERVICIOS
      ═══════════════════════════════════════════════════════════════ */}
      <section id="servicios" className="relative z-10 px-4 py-10 md:px-10 md:py-14 lg:px-16">

        <div className="max-w-5xl mx-auto mb-6 md:mb-8 fade-d1">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-center" style={{ color: 'rgba(0,242,254,0.55)' }}>
              [ MÓDULOS_ACTIVOS :: 3 soluciones ]
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 fade-d2">
          {services.map((svc, i) => (
            <TiltCard key={svc.title}>
              <Window title={svc.file}>
                <div className="px-5 md:px-7 py-5 md:py-7">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4 md:mb-5">
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.35)' }}>0{i + 1} /</span>
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(0,242,254,0.38)' }}>{svc.sysTag}</span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 md:mb-5">
                    <div className="inline-flex p-3 rounded-xl"
                      style={{ border: '1px solid rgba(0,242,254,0.18)', background: 'rgba(0,242,254,0.07)' }}>
                      {svc.icon}
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold mb-1" style={{ color: '#E0EDE0' }}>{svc.title}</h3>
                  <p className="text-sm md:text-base mb-4 md:mb-5" style={{ color: '#8B949E' }}>{svc.subtitle}</p>

                  {/* Bullets: show all on desktop, first 3 on mobile */}
                  <ul className="space-y-2.5">
                    {svc.bullets.map((b, bi) => (
                      <li key={b} className={`flex items-start gap-3 text-sm md:text-base${bi >= 3 ? ' hidden sm:flex' : ''}`} style={{ color: '#8B949E' }}>
                        <span className="font-mono mt-0.5 text-lg" style={{ color: 'rgba(0,242,254,0.5)', flexShrink: 0 }}>›</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Mobile: show CTA to see more */}
                  <p className="sm:hidden mt-3 font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.4)' }}>
                    + {svc.bullets.length - 3} funciones más →
                  </p>
                </div>
              </Window>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. PARA QUIÉN
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-10 md:px-10 md:py-14 lg:px-16">
        <div className="max-w-5xl mx-auto text-center">

          <div className="mb-8 md:mb-10 fade-d1">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: 'rgba(0,242,254,0.55)' }}>
              [ SECTORES_ATENDIDOS ]
            </p>
            <h2 className="text-2xl md:text-4xl font-semibold mb-3" style={{ color: '#E0EDE0' }}>
              Diseñado para negocios como el tuyo
            </h2>
            <p className="text-base md:text-lg" style={{ color: '#8B949E' }}>
              Soluciones adaptadas a cada sector — sin tecnicismos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 fade-d2">
            {audiences.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-2 md:gap-3 px-4 md:px-7 py-3 md:py-4 rounded-full text-sm md:text-base font-semibold tracking-wide cursor-default"
                style={{
                  border: '1px solid rgba(0,242,254,0.22)',
                  background: 'rgba(0,242,254,0.05)',
                  color: '#E0EDE0',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(0,242,254,0.55)'
                  el.style.background = 'rgba(0,242,254,0.12)'
                  el.style.boxShadow = '0 0 24px rgba(0,242,254,0.18)'
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(0,242,254,0.22)'
                  el.style.background = 'rgba(0,242,254,0.05)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <span className="text-lg md:text-xl">{a.icon}</span>
                <span>[ {a.label} ]</span>
              </div>
            ))}
          </div>

          <p className="mt-8 md:mt-10 text-sm md:text-base fade-d3" style={{ color: '#8B949E' }}>
            ¿Tu sector no está en la lista?{' '}
            <Link href="mailto:hello@stratoscore.app" style={{ color: '#00F2FE' }}
              className="transition-colors hover:brightness-125">
              Cuéntanos tu caso →
            </Link>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-6 pb-16 md:px-10 md:py-8 md:pb-20 lg:px-16">
        <TiltCard className="max-w-3xl mx-auto fade-d1">
          <Window title="contact.stratoscore.app" accentTop glowColor="rgba(0,242,254,0.20)">
            <div className="px-5 md:px-8 py-10 md:py-16 text-center">
              <p className="font-mono text-[10px] uppercase mb-2" style={{ color: '#00F2FE', letterSpacing: '0.3em' }}>
                {'>'} Iniciar diagnóstico_
              </p>
              <p className="hidden sm:block font-mono text-[9px] mb-8" style={{ color: 'rgba(0,242,254,0.45)' }}>
                [SESSION_READY :: SIN_COMPROMISO]
              </p>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-5 leading-tight" style={{ color: '#E0EDE0' }}>
                ¿Listo para{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  llenar tu agenda
                </span>?
              </h2>

              <p className="text-base md:text-lg mb-8 md:mb-10 max-w-md mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
                30 minutos. Sin tecnicismos. Te mostramos exactamente cómo automatizamos tu negocio.
              </p>

              <Link
                href="mailto:hello@stratoscore.app"
                className="block w-full sm:w-auto sm:inline-block px-8 md:px-12 py-5 rounded-xl font-bold text-base md:text-lg tracking-wide transition-all duration-200 hover:scale-[1.02] hover:brightness-110 text-center bg-brandCyan text-brandBg"
                style={{ boxShadow: '0 0 36px rgba(0,242,254,0.65), 0 0 90px rgba(0,242,254,0.2)' }}
              >
                Agendar Llamada — Sin tecnicismos →
              </Link>
            </div>
          </Window>
        </TiltCard>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-4 py-8 md:px-10 md:py-10">
        <div
          className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 px-5 md:px-8 py-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="StratosCore" className="w-8 h-8 object-contain rounded-sm" style={{ filter: 'drop-shadow(0 0 6px rgba(0,242,254,0.25))' }} />
            <span className="text-sm font-semibold uppercase" style={{ color: '#8B949E', letterSpacing: '0.2em' }}>
              STRATOS<span style={{ margin: '0 5px', opacity: 0.35 }}>|</span>CORE
            </span>
          </div>

          <p className="text-xs uppercase tracking-widest opacity-40 font-mono text-center" style={{ color: '#8B949E' }}>
            © 2026 StratosCore · Automatización para PYMEs y Clínicas
          </p>

          <div className="flex items-center gap-4 md:gap-5 text-sm" style={{ color: '#8B949E' }}>
            <Link href="mailto:hello@stratoscore.app" className="hover:text-[#00F2FE] transition-colors">
              hello@stratoscore.app
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
