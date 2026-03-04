import Link from 'next/link'

// ── Icon components ───────────────────────────────────────────────────────────

function CubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" stroke="#E0E0E0" strokeWidth="1.2" fill="none" />
      <polygon points="24,4 44,14 24,24 4,14" stroke="#E0E0E0" strokeWidth="1.2" fill="none" />
      <polygon points="24,24 44,14 44,34 24,44" fill="#00F2FE" opacity="0.9" />
      <line x1="24" y1="24" x2="24" y2="44" stroke="#E0E0E0" strokeWidth="1.2" />
    </svg>
  )
}

function ArchIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <rect x="4" y="4" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <rect x="22" y="4" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <rect x="4" y="22" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <rect x="22" y="22" width="14" height="14" rx="2" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <line x1="18" y1="11" x2="22" y2="11" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="11" y1="18" x2="11" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="29" y1="18" x2="29" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="18" y1="29" x2="22" y2="29" stroke="#00F2FE" strokeWidth="1.5" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <path d="M20 4L36 10V22C36 30 20 38 20 38C20 38 4 30 4 22V10L20 4Z" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <path d="M13 20L18 25L28 15" stroke="#00F2FE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MobilityIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
      <circle cx="12" cy="30" r="5" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="30" r="5" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <path d="M4 22L8 10H24L36 22H4Z" stroke="#00F2FE" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="17" y1="10" x2="17" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
      <path d="M17 22H36" stroke="#00F2FE" strokeWidth="1.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" stroke="#00F2FE" strokeWidth="1.2" />
      <path d="M5 8L7 10L11 6" stroke="#00F2FE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const benefits = [
  {
    metric: '10x',
    label: 'Agilidad Operativa',
    desc: 'Workflows automatizados que reemplazan procesos manuales en días, no meses.',
  },
  {
    metric: '0ms',
    label: 'Latencia en Datos',
    desc: 'Pipelines en tiempo real. Tus datos disponibles en el momento exacto que los necesitas.',
  },
  {
    metric: '24/7',
    label: 'Control por IA',
    desc: 'Agentes autónomos que monitorean, alertan y ejecutan mientras duermes.',
  },
]

const services = [
  {
    icon: <ArchIcon />,
    title: 'Business Architecture',
    subtitle: 'El sistema nervioso de tu empresa',
    bullets: [
      'Diseño de ecosistemas digitales integrales',
      'Automatización de workflows operativos',
      'Integración de sistemas y APIs heterogéneas',
      'Arquitectura cloud-native escalable',
      'Mission Control: dashboard IA en tiempo real',
    ],
  },
  {
    icon: <ShieldIcon />,
    title: 'InsurTech Ecosystems',
    subtitle: 'Tecnología para agencias de seguros',
    bullets: [
      'CRM especializado para gestión de cartera',
      'Automatización de pólizas y renovaciones',
      'Analytics de riesgo y rentabilidad',
      'Onboarding digital de clientes en minutos',
      'Reportes regulatorios automatizados',
    ],
  },
  {
    icon: <MobilityIcon />,
    title: 'Smart Mobility Frameworks',
    subtitle: 'Plataformas de movilidad inteligente',
    bullets: [
      'Apps de ride-hailing con IA embebida',
      'Gestión de flotas y activos en tiempo real',
      'Optimización de rutas con ML adaptativo',
      'Dashboard operacional 24/7',
      'Integraciones con pasarelas de pago regionales',
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#E0E0E0] overflow-x-hidden"
      style={{
        background: '#000d14',
        fontFamily: 'var(--font-grotesk), system-ui, sans-serif',
      }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="orb-animate absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.10) 0%, transparent 65%)' }}
        />
        <div
          className="orb-animate absolute top-[60%] -left-64 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 65%)', animationDelay: '3s' }}
        />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" aria-hidden />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12"
        style={{ borderBottom: '1px solid rgba(0,242,254,0.08)' }}>
        <div className="flex items-center gap-3">
          <CubeIcon className="w-9 h-9" />
          <span
            className="text-base font-semibold text-[#E0E0E0] uppercase"
            style={{ letterSpacing: '0.28em' }}
          >
            STRATOS<span style={{ color: '#8B949E', margin: '0 8px' }}>|</span>CORE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#8B949E] hover:text-[#E0E0E0] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold rounded-lg text-[#001117] transition-all duration-200"
            style={{
              background: '#00F2FE',
              boxShadow: '0 0 16px rgba(0,242,254,0.45)',
            }}
          >
            Mission Control →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-28 pb-32 md:px-12 lg:px-24 text-center">
        {/* Regional badge */}
        <div
          className="fade-up inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-sm text-[#8B949E]"
          style={{
            border: '1px solid rgba(0,242,254,0.18)',
            background: 'rgba(0,242,254,0.04)',
          }}
        >
          <span>🇨🇴</span>
          <span style={{ color: 'rgba(0,242,254,0.5)' }}>+</span>
          <span>🇨🇷</span>
          <span className="mx-1" style={{ color: 'rgba(0,242,254,0.25)' }}>·</span>
          <span>Ingeniería de Élite · Latinoamérica</span>
        </div>

        {/* Headline */}
        <h1 className="fade-up-delay text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight max-w-5xl mx-auto">
          Convertimos tu Visión en{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #80f8ff 60%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Infraestructura Digital
          </span>
        </h1>

        {/* Subheadline */}
        <p className="fade-up-late mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
          Fábrica de software élite especializada en{' '}
          <span className="text-[#E0E0E0]">SaaS</span>,{' '}
          <span className="text-[#E0E0E0]">Apps</span> y{' '}
          <span className="text-[#E0E0E0]">Agentes de IA</span>{' '}
          para negocios en Latinoamérica.
        </p>

        {/* CTAs */}
        <div className="fade-up-late mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary — solid cyan, strong glow */}
          <Link
            href="mailto:hello@stratoscore.app"
            className="group relative px-8 py-4 rounded-xl text-[#000d14] font-bold text-base tracking-wide transition-all duration-300 hover:scale-[1.04] hover:brightness-110"
            style={{
              background: '#00F2FE',
              boxShadow: '0 0 28px rgba(0,242,254,0.65), 0 0 80px rgba(0,242,254,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            Solicita tu Demo
          </Link>
          {/* Secondary */}
          <Link
            href="#services"
            className="px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 border border-[rgba(255,255,255,0.1)] text-[#8B949E] hover:text-[#E0E0E0] hover:border-[rgba(0,242,254,0.3)]"
          >
            Ver Servicios ↓
          </Link>
        </div>

        {/* URL hint */}
        <p className="mt-12 text-xs tracking-widest uppercase opacity-40" style={{ color: '#8B949E' }}>
          www.stratoscore.app
        </p>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3">
          {benefits.map((b, i) => (
            <div
              key={b.metric}
              className="group p-10 transition-all duration-300"
              style={{
                borderTop: '1px solid rgba(0,242,254,0.25)',
                borderLeft: i === 0 ? '1px solid rgba(0,242,254,0.25)' : '1px solid rgba(0,242,254,0.08)',
                borderRight: i === 2 ? '1px solid rgba(0,242,254,0.25)' : 'none',
                borderBottom: '1px solid rgba(0,242,254,0.08)',
                background: 'rgba(0,242,254,0.02)',
              }}
            >
              {/* Metric — large, electric, no gradient */}
              <div
                className="text-6xl font-bold mb-5 tabular-nums tracking-tighter"
                style={{
                  color: '#00F2FE',
                  textShadow: '0 0 30px rgba(0,242,254,0.5)',
                }}
              >
                {b.metric}
              </div>

              {/* Divider */}
              <div
                className="mb-4 transition-all duration-300"
                style={{
                  width: '32px',
                  height: '1px',
                  background: 'rgba(0,242,254,0.4)',
                }}
              />

              <div
                className="font-semibold mb-2 uppercase text-xs tracking-widest"
                style={{ color: '#E0E0E0' }}
              >
                {b.label}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#8B949E' }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        {/* Section header */}
        <div className="max-w-6xl mx-auto mb-16">
          <p
            className="text-xs font-semibold uppercase mb-4"
            style={{ color: '#00F2FE', letterSpacing: '0.3em' }}
          >
            Servicios
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#E0E0E0] leading-tight max-w-2xl">
            Soluciones que{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F2FE 0%, #80f8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              funcionan
            </span>{' '}
            en producción
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed" style={{ color: '#8B949E' }}>
            Cada proyecto es una infraestructura viva — diseñada para escalar desde el día uno.
          </p>
        </div>

        {/* Service cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-px"
          style={{ background: 'rgba(0,242,254,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="group relative p-8 transition-all duration-300"
              style={{
                background: '#000d14',
              }}
            >
              {/* Top cyan accent line — always visible, stronger on hover */}
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500"
                style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #00F2FE, transparent)',
                  opacity: 0.35,
                }}
              />

              {/* Number */}
              <div
                className="text-xs font-mono mb-6"
                style={{ color: 'rgba(0,242,254,0.35)', letterSpacing: '0.1em' }}
              >
                0{i + 1}
              </div>

              {/* Icon container */}
              <div
                className="mb-6 p-3 inline-flex rounded-xl"
                style={{
                  border: '1px solid rgba(0,242,254,0.18)',
                  background: 'rgba(0,242,254,0.06)',
                }}
              >
                {svc.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[#E0E0E0] mb-1">
                {svc.title}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#8B949E' }}>
                {svc.subtitle}
              </p>

              {/* Bullets */}
              <ul className="space-y-3">
                {svc.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm" style={{ color: '#8B949E' }}>
                    <CheckIcon />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div
          className="max-w-4xl mx-auto text-center p-16 relative overflow-hidden"
          style={{
            borderRadius: '24px',
            border: '1px solid rgba(0,242,254,0.15)',
            background: 'linear-gradient(160deg, rgba(0,242,254,0.05) 0%, rgba(0,13,20,0.8) 60%)',
          }}
        >
          {/* Glow center */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,242,254,0.10) 0%, transparent 65%)' }}
          />

          <div className="relative">
            <p
              className="text-xs font-semibold uppercase mb-6"
              style={{ color: '#00F2FE', letterSpacing: '0.3em' }}
            >
              Colabora con nosotros
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold text-[#E0E0E0] mb-6 leading-tight">
              ¿Listo para construir algo{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #80f8ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                extraordinario
              </span>?
            </h2>
            <p className="mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
              Cuéntanos tu reto. En 48 horas tienes una propuesta técnica y un plan de ejecución.
            </p>
            <Link
              href="mailto:hello@stratoscore.app"
              className="inline-block px-10 py-4 rounded-xl text-[#000d14] font-bold text-base tracking-wide transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
              style={{
                background: '#00F2FE',
                boxShadow: '0 0 28px rgba(0,242,254,0.6), 0 0 80px rgba(0,242,254,0.2)',
              }}
            >
              Agendar Llamada →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 px-6 py-10 md:px-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CubeIcon className="w-7 h-7" />
            <span
              className="text-sm font-semibold uppercase"
              style={{ color: '#8B949E', letterSpacing: '0.2em' }}
            >
              STRATOS<span style={{ margin: '0 6px', opacity: 0.4 }}>|</span>CORE
            </span>
          </div>

          <p
            className="text-xs uppercase tracking-widest opacity-50"
            style={{ color: '#8B949E' }}
          >
            © 2026 StratosCore · Ingeniería Regional de Élite
          </p>

          <div className="flex items-center gap-6 text-sm" style={{ color: '#8B949E' }}>
            <Link
              href="mailto:hello@stratoscore.app"
              className="transition-colors hover:text-[#00F2FE]"
            >
              hello@stratoscore.app
            </Link>
            <Link href="/login" className="transition-colors hover:text-[#00F2FE]">
              Mission Control
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
