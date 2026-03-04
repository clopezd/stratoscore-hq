import Link from 'next/link'

// ── Icon components ───────────────────────────────────────────────────────────

function CubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Cube wireframe */}
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" stroke="#E0E0E0" strokeWidth="1.2" fill="none" />
      <polygon points="24,4 44,14 24,24 4,14" stroke="#E0E0E0" strokeWidth="1.2" fill="none" />
      {/* Cyan face */}
      <polygon points="24,24 44,14 44,34 24,44" fill="#00F2FE" opacity="0.85" />
      <line x1="24" y1="24" x2="24" y2="44" stroke="#E0E0E0" strokeWidth="1.2" />
    </svg>
  )
}

function ArchIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
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
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <path d="M20 4L36 10V22C36 30 20 38 20 38C20 38 4 30 4 22V10L20 4Z" stroke="#00F2FE" strokeWidth="1.5" fill="none" />
      <path d="M13 20L18 25L28 15" stroke="#00F2FE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MobilityIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
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
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5">
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
      className="min-h-screen bg-[#001117] text-[#E0E0E0] overflow-x-hidden"
      style={{ fontFamily: 'var(--font-grotesk), system-ui, sans-serif' }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="orb-animate absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #00F2FE18 0%, transparent 70%)' }}
        />
        <div
          className="orb-animate absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #00F2FE0D 0%, transparent 70%)', animationDelay: '3s' }}
        />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-60" aria-hidden />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 border-b border-[rgba(0,242,254,0.08)]">
        <div className="flex items-center gap-3">
          <CubeIcon className="w-9 h-9" />
          <span className="text-lg font-semibold tracking-[0.18em] text-[#E0E0E0] uppercase">
            STRATOS<span className="text-[#8B949E] mx-2">|</span>CORE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#8B949E] hover:text-[#E0E0E0] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold rounded-lg border border-[#00F2FE] text-[#00F2FE] hover:bg-[#00F2FE] hover:text-[#001117] transition-all duration-200 glow-cyan-sm"
          >
            Mission Control →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-24 pb-32 md:px-12 lg:px-24 text-center">
        {/* Regional badge */}
        <div className="fade-up inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[rgba(0,242,254,0.2)] bg-[rgba(0,242,254,0.05)] text-sm text-[#8B949E]">
          <span>🇨🇴</span>
          <span className="text-[rgba(0,242,254,0.6)]">+</span>
          <span>🇨🇷</span>
          <span className="mx-1 text-[rgba(0,242,254,0.3)]">·</span>
          <span>Ingeniería de Élite · Latinoamérica</span>
        </div>

        {/* Headline */}
        <h1 className="fade-up-delay text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight max-w-5xl mx-auto">
          Convertimos tu Visión en{' '}
          <span className="text-gradient-cyan">Infraestructura Digital</span>
        </h1>

        {/* Subheadline */}
        <p className="fade-up-late mt-6 text-lg md:text-xl text-[#8B949E] max-w-2xl mx-auto leading-relaxed">
          Fábrica de software élite especializada en{' '}
          <span className="text-[#E0E0E0]">SaaS</span>,{' '}
          <span className="text-[#E0E0E0]">Apps</span> y{' '}
          <span className="text-[#E0E0E0]">Agentes de IA</span>{' '}
          para negocios en Latinoamérica.
        </p>

        {/* CTAs */}
        <div className="fade-up-late mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="mailto:hello@stratoscore.app"
            className="group relative px-8 py-4 rounded-xl bg-[#00F2FE] text-[#001117] font-bold text-base tracking-wide transition-all duration-300 glow-cyan hover:scale-[1.03]"
          >
            <span className="relative z-10">Solicita tu Demo</span>
            <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </Link>
          <Link
            href="#services"
            className="px-8 py-4 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#8B949E] hover:text-[#E0E0E0] hover:border-[rgba(0,242,254,0.3)] font-medium text-base transition-all duration-300"
          >
            Ver Servicios ↓
          </Link>
        </div>

        {/* URL hint */}
        <p className="mt-10 text-xs text-[#8B949E] tracking-widest uppercase opacity-60">
          www.stratoscore.app
        </p>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b) => (
            <div
              key={b.metric}
              className="group relative rounded-2xl border border-[rgba(0,242,254,0.1)] bg-[rgba(0,242,254,0.03)] p-8 hover:border-[rgba(0,242,254,0.25)] hover:bg-[rgba(0,242,254,0.06)] transition-all duration-300"
            >
              <div className="text-5xl font-bold text-gradient-cyan mb-2">
                {b.metric}
              </div>
              <div className="text-[#E0E0E0] font-semibold text-lg mb-3">
                {b.label}
              </div>
              <p className="text-[#8B949E] text-sm leading-relaxed">
                {b.desc}
              </p>
              {/* Hover line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="services" className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        {/* Section header */}
        <div className="max-w-6xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#00F2FE] uppercase mb-4">
            Servicios
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#E0E0E0] leading-tight max-w-2xl">
            Soluciones que{' '}
            <span className="text-gradient-cyan">funcionan</span>{' '}
            en producción
          </h2>
          <p className="mt-4 text-[#8B949E] max-w-xl leading-relaxed">
            Cada proyecto es una infraestructura viva — diseñada para escalar desde el día uno.
          </p>
        </div>

        {/* Service cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="group relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-8 hover:border-[rgba(0,242,254,0.2)] transition-all duration-300 overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

              {/* Number */}
              <div className="text-xs font-mono text-[rgba(0,242,254,0.3)] mb-6">
                0{i + 1}
              </div>

              {/* Icon */}
              <div className="mb-5 p-3 inline-flex rounded-xl border border-[rgba(0,242,254,0.15)] bg-[rgba(0,242,254,0.05)]">
                {svc.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#E0E0E0] mb-1">
                {svc.title}
              </h3>
              <p className="text-sm text-[#8B949E] mb-6">
                {svc.subtitle}
              </p>

              {/* Bullets */}
              <ul className="space-y-3">
                {svc.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-[#8B949E]">
                    <CheckIcon />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Glow corner */}
              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.08) 0%, transparent 70%)' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center rounded-3xl border border-[rgba(0,242,254,0.15)] bg-[rgba(0,242,254,0.03)] p-16 relative overflow-hidden">
          {/* Background orb */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,242,254,0.06) 0%, transparent 65%)' }}
          />

          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#00F2FE] uppercase mb-6">
              Colabora con nosotros
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold text-[#E0E0E0] mb-6 leading-tight">
              ¿Listo para construir algo{' '}
              <span className="text-gradient-cyan">extraordinario</span>?
            </h2>
            <p className="text-[#8B949E] mb-10 max-w-xl mx-auto leading-relaxed">
              Cuéntanos tu reto. En 48 horas tienes una propuesta técnica y un plan de ejecución.
            </p>
            <Link
              href="mailto:hello@stratoscore.app"
              className="inline-block px-10 py-4 rounded-xl bg-[#00F2FE] text-[#001117] font-bold text-base tracking-wide glow-cyan hover:scale-[1.04] transition-all duration-200"
            >
              Agendar Llamada →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-12 md:px-12 border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CubeIcon className="w-7 h-7" />
            <span className="text-sm font-semibold tracking-[0.15em] text-[#8B949E] uppercase">
              STRATOS<span className="mx-1.5 opacity-40">|</span>CORE
            </span>
          </div>

          <p className="text-xs text-[#8B949E] opacity-60 tracking-widest uppercase">
            © 2026 StratosCore · Ingeniería Regional de Élite
          </p>

          <div className="flex items-center gap-6 text-sm text-[#8B949E]">
            <Link href="mailto:hello@stratoscore.app" className="hover:text-[#00F2FE] transition-colors">
              hello@stratoscore.app
            </Link>
            <Link href="/login" className="hover:text-[#00F2FE] transition-colors">
              Mission Control
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
