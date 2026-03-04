import Link from 'next/link'

// ── Mac Window Chrome ─────────────────────────────────────────────────────────

function Window({
  title,
  children,
  className = '',
  glowColor = 'rgba(0,242,254,0.12)',
  accentTop = false,
}: {
  title: string
  children: React.ReactNode
  className?: string
  glowColor?: string
  accentTop?: boolean
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(8, 14, 22, 0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px ${glowColor}`,
      }}
    >
      {/* Specular rim */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-[11px]"
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-[6px]">
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#FF5F56', boxShadow: '0 0 8px rgba(255,95,86,0.7)' }} />
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#FFBD2E', boxShadow: '0 0 8px rgba(255,189,46,0.6)' }} />
          <span className="w-[11px] h-[11px] rounded-full block"
            style={{ background: '#27C93F', boxShadow: '0 0 8px rgba(39,201,63,0.7)' }} />
        </div>

        {/* Title */}
        <span
          className="flex-1 text-center text-[11px] font-mono"
          style={{ color: '#8B949E', letterSpacing: '0.04em' }}
        >
          {title}
        </span>

        {/* Right spacer to center title visually */}
        <div className="w-[38px]" />
      </div>

      {/* Accent line below title bar */}
      {accentTop && (
        <div className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.4), transparent)' }} />
      )}

      {children}
    </div>
  )
}

// ── Cube logo icon ────────────────────────────────────────────────────────────

function CubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" stroke="#E0E0E0" strokeWidth="1" fill="none" />
      <polygon points="24,4 44,14 24,24 4,14" stroke="#E0E0E0" strokeWidth="1" fill="none" />
      <polygon points="24,24 44,14 44,34 24,44" fill="#00F2FE" opacity="0.92" />
      <line x1="24" y1="24" x2="24" y2="44" stroke="#E0E0E0" strokeWidth="1" />
    </svg>
  )
}

// ── Service icons ─────────────────────────────────────────────────────────────

function ArchIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect x="4" y="4" width="13" height="13" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="23" y="4" width="13" height="13" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="4" y="23" width="13" height="13" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <rect x="23" y="23" width="13" height="13" rx="2" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="17" y1="10.5" x2="23" y2="10.5" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="10.5" y1="17" x2="10.5" y2="23" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="29.5" y1="17" x2="29.5" y2="23" stroke="#00F2FE" strokeWidth="1.5" />
      <line x1="17" y1="29.5" x2="23" y2="29.5" stroke="#00F2FE" strokeWidth="1.5" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <path d="M20 4L36 10V22C36 30 20 38 20 38C20 38 4 30 4 22V10L20 4Z" stroke="#00F2FE" strokeWidth="1.5" />
      <path d="M13 20L18 25L28 15" stroke="#00F2FE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MobilityIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <circle cx="12" cy="30" r="4.5" stroke="#00F2FE" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="4.5" stroke="#00F2FE" strokeWidth="1.5" />
      <path d="M4 22L8 10H24L36 22H4Z" stroke="#00F2FE" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="17" y1="10" x2="17" y2="22" stroke="#00F2FE" strokeWidth="1.5" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const benefits = [
  {
    metric: '10x',
    file: '10x_agility.sh',
    label: 'Agilidad Operativa',
    cmd: '$ run --workflows --replace-manual',
    desc: 'Workflows automatizados que reemplazan procesos manuales en días, no meses.',
    color: '#00F2FE',
  },
  {
    metric: '0ms',
    file: 'latency.monitor',
    label: 'Latencia en Datos',
    cmd: '$ stream --realtime --pipeline active',
    desc: 'Pipelines en tiempo real. Tus datos en el momento exacto que los necesitas.',
    color: '#00F2FE',
  },
  {
    metric: '24/7',
    file: 'agents.service',
    label: 'Control por IA',
    cmd: '$ systemctl status agents ● active',
    desc: 'Agentes autónomos que monitorean, alertan y ejecutan mientras duermes.',
    color: '#27C93F',
  },
]

const services = [
  {
    icon: <ArchIcon />,
    file: 'business-arch.app',
    title: 'Business Architecture',
    subtitle: 'El sistema nervioso de tu empresa',
    bullets: [
      'Ecosistemas digitales integrales',
      'Automatización de workflows operativos',
      'Integración de sistemas y APIs',
      'Arquitectura cloud-native escalable',
      'Mission Control: dashboard IA en tiempo real',
    ],
  },
  {
    icon: <ShieldIcon />,
    file: 'insurtech.app',
    title: 'InsurTech Ecosystems',
    subtitle: 'Tecnología para agencias de seguros',
    bullets: [
      'CRM especializado para gestión de cartera',
      'Automatización de pólizas y renovaciones',
      'Analytics de riesgo y rentabilidad',
      'Onboarding digital de clientes',
      'Reportes regulatorios automatizados',
    ],
  },
  {
    icon: <MobilityIcon />,
    file: 'mobility.app',
    title: 'Smart Mobility Frameworks',
    subtitle: 'Plataformas de movilidad inteligente',
    bullets: [
      'Apps de ride-hailing con IA embebida',
      'Gestión de flotas en tiempo real',
      'Optimización de rutas con ML adaptativo',
      'Dashboard operacional 24/7',
      'Integraciones con pasarelas de pago',
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#E0E0E0] overflow-x-hidden"
      style={{ background: '#020b12', fontFamily: 'var(--font-grotesk), system-ui, sans-serif' }}
    >

      {/* ── Desktop background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {/* Petrol base gradient */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 20% 0%, #001a28 0%, #020b12 55%)' }} />

        {/* Cyan glow top-right */}
        <div className="orb-animate absolute -top-32 right-0 w-[800px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,242,254,0.09) 0%, transparent 65%)' }} />

        {/* Secondary glow bottom-left */}
        <div className="orb-animate absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.05) 0%, transparent 65%)', animationDelay: '4s' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,242,254,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Horizontal scanlines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,242,254,1) 2px, rgba(0,242,254,1) 3px)',
            backgroundSize: '100% 8px',
          }} />
      </div>

      {/* ── macOS menubar ─────────────────────────────────────────────── */}
      <nav
        className="relative z-50 flex items-center justify-between px-6 py-3 md:px-10"
        style={{
          background: 'rgba(2,11,18,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,242,254,0.08)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <CubeIcon className="w-8 h-8" />
          <span className="text-sm font-semibold text-[#E0E0E0] uppercase" style={{ letterSpacing: '0.26em' }}>
            STRATOS<span style={{ color: '#8B949E', margin: '0 7px' }}>|</span>CORE
          </span>
        </div>

        {/* Menubar items (desktop only) */}
        <div className="hidden md:flex items-center gap-6 text-xs text-[#8B949E]" style={{ letterSpacing: '0.04em' }}>
          {['Servicios', 'Proyectos', 'Contacto'].map(item => (
            <button key={item} className="hover:text-[#E0E0E0] transition-colors">{item}</button>
          ))}
        </div>

        {/* CTA nav */}
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-1.5 text-xs text-[#8B949E] hover:text-[#E0E0E0] transition-colors">
            Entrar
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 text-xs font-bold text-[#020b12] rounded-lg transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
            style={{
              background: '#00F2FE',
              boxShadow: '0 0 16px rgba(0,242,254,0.5)',
            }}
          >
            Mission Control →
          </Link>
        </div>
      </nav>

      {/* ── HERO WINDOW ───────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pt-16 pb-8 md:px-10 lg:px-16 fade-up">
        <Window
          title="stratoscore.app — System v2.0"
          accentTop
          glowColor="rgba(0,242,254,0.15)"
          className="max-w-5xl mx-auto"
        >
          {/* Terminal pre-boot line */}
          <div className="px-6 pt-5 pb-2">
            <p className="font-mono text-xs" style={{ color: 'rgba(0,242,254,0.45)', letterSpacing: '0.04em' }}>
              {'>'} Initializing StratosCore engine... <span style={{ color: '#27C93F' }}>OK</span>
            </p>
          </div>

          <div className="px-6 pb-12 pt-6 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full text-xs"
              style={{
                border: '1px solid rgba(0,242,254,0.2)',
                background: 'rgba(0,242,254,0.04)',
                color: '#8B949E',
              }}
            >
              <span>🇨🇴</span>
              <span style={{ color: 'rgba(0,242,254,0.5)' }}>+</span>
              <span>🇨🇷</span>
              <span className="mx-1 opacity-40">·</span>
              <span>Ingeniería de Élite · Latinoamérica</span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight max-w-4xl mx-auto mb-6"
            >
              Convertimos tu Visión en{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 55%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 24px rgba(0,242,254,0.35))',
                }}
              >
                Infraestructura Digital
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color: '#8B949E' }}>
              Fábrica de software élite — <span className="text-[#E0E0E0]">SaaS</span>,{' '}
              <span className="text-[#E0E0E0]">Apps</span> y{' '}
              <span className="text-[#E0E0E0]">Agentes de IA</span>{' '}
              para negocios en Latinoamérica.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="mailto:hello@stratoscore.app"
                className="px-8 py-3.5 rounded-xl text-[#020b12] font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
                style={{
                  background: '#00F2FE',
                  boxShadow: '0 0 30px rgba(0,242,254,0.65), 0 0 80px rgba(0,242,254,0.2)',
                }}
              >
                Solicita tu Demo
              </Link>
              <Link
                href="#services"
                className="px-8 py-3.5 rounded-xl text-sm font-medium border border-[rgba(255,255,255,0.1)] text-[#8B949E] hover:text-[#E0E0E0] hover:border-[rgba(0,242,254,0.3)] transition-all duration-300"
              >
                Ver Servicios ↓
              </Link>
            </div>
          </div>

          {/* Window bottom status bar */}
          <div
            className="flex items-center justify-between px-6 py-2"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.3)' }}>
              stratoscore@v2.0
            </span>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(39,201,63,0.5)' }}>
              ● system nominal
            </span>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(0,242,254,0.3)' }}>
              latency: 0ms
            </span>
          </div>
        </Window>
      </section>

      {/* ── BENEFIT WINDOWS ───────────────────────────────────────────── */}
      <section className="relative z-10 px-4 py-8 md:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 fade-up-delay">
          {benefits.map((b) => (
            <Window
              key={b.metric}
              title={b.file}
              glowColor={b.color === '#27C93F' ? 'rgba(39,201,63,0.08)' : 'rgba(0,242,254,0.08)'}
            >
              <div className="px-5 py-6">
                {/* Terminal command */}
                <p
                  className="font-mono text-[10px] mb-5 truncate"
                  style={{ color: 'rgba(0,242,254,0.4)' }}
                >
                  {b.cmd}
                </p>

                {/* Metric */}
                <div
                  className="text-5xl font-bold mb-3 tabular-nums leading-none"
                  style={{
                    color: b.color,
                    textShadow: `0 0 30px ${b.color}80`,
                    filter: `drop-shadow(0 0 16px ${b.color}60)`,
                  }}
                >
                  {b.metric}
                </div>

                {/* Separator */}
                <div
                  className="mb-3"
                  style={{
                    width: '28px',
                    height: '1px',
                    background: b.color,
                    opacity: 0.4,
                  }}
                />

                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#E0E0E0' }}
                >
                  {b.label}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#8B949E' }}>
                  {b.desc}
                </p>
              </div>
            </Window>
          ))}
        </div>
      </section>

      {/* ── SERVICE WINDOWS ───────────────────────────────────────────── */}
      <section id="services" className="relative z-10 px-4 py-8 md:px-10 lg:px-16">
        {/* Section label */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
            <span
              className="text-[10px] font-mono uppercase"
              style={{ color: 'rgba(0,242,254,0.5)', letterSpacing: '0.3em' }}
            >
              Servicios — 3 módulos activos
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(0,242,254,0.12)' }} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 fade-up-late">
          {services.map((svc, i) => (
            <Window key={svc.title} title={svc.file}>
              <div className="px-6 py-6">
                {/* Index */}
                <span
                  className="font-mono text-[10px]"
                  style={{ color: 'rgba(0,242,254,0.3)', letterSpacing: '0.08em' }}
                >
                  0{i + 1} /
                </span>

                {/* Icon + title */}
                <div className="flex items-start gap-3 mt-3 mb-4">
                  <div
                    className="p-2 rounded-lg mt-0.5"
                    style={{
                      border: '1px solid rgba(0,242,254,0.15)',
                      background: 'rgba(0,242,254,0.06)',
                    }}
                  >
                    {svc.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#E0E0E0]">{svc.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>{svc.subtitle}</p>
                  </div>
                </div>

                {/* Bullets as terminal lines */}
                <ul className="space-y-1.5">
                  {svc.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs" style={{ color: '#8B949E' }}>
                      <span className="font-mono mt-0.5" style={{ color: 'rgba(0,242,254,0.4)', flexShrink: 0 }}>›</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Window>
          ))}
        </div>
      </section>

      {/* ── CTA WINDOW ────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 py-8 md:px-10 lg:px-16">
        <Window
          title="contact.stratoscore.app"
          accentTop
          glowColor="rgba(0,242,254,0.18)"
          className="max-w-3xl mx-auto"
        >
          <div className="px-8 py-14 text-center">
            <p
              className="text-[10px] font-mono uppercase mb-6"
              style={{ color: '#00F2FE', letterSpacing: '0.3em' }}
            >
              {'>'} Iniciar proyecto_
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-4 leading-tight">
              ¿Listo para construir algo{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #7cf5ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                extraordinario
              </span>?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: '#8B949E' }}>
              Cuéntanos tu reto. En 48 horas tienes una propuesta técnica y un plan de ejecución.
            </p>
            <Link
              href="mailto:hello@stratoscore.app"
              className="inline-block px-10 py-3.5 rounded-xl text-[#020b12] font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
              style={{
                background: '#00F2FE',
                boxShadow: '0 0 30px rgba(0,242,254,0.6), 0 0 80px rgba(0,242,254,0.2)',
              }}
            >
              Agendar Llamada →
            </Link>
          </div>
        </Window>
      </section>

      {/* ── Dock / Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 px-4 py-10 md:px-10">
        {/* Dock bar */}
        <div
          className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-4 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <CubeIcon className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase" style={{ color: '#8B949E', letterSpacing: '0.2em' }}>
              STRATOS<span style={{ margin: '0 5px', opacity: 0.35 }}>|</span>CORE
            </span>
          </div>

          <p className="text-[10px] uppercase tracking-widest opacity-40 font-mono" style={{ color: '#8B949E' }}>
            © 2026 StratosCore · Ingeniería Regional de Élite
          </p>

          <div className="flex items-center gap-5 text-xs" style={{ color: '#8B949E' }}>
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
