'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Brain,
  ChevronRight,
} from 'lucide-react'
import { StratoscoreLogo } from '@/shared/components/StratoscoreLogo'

/* ─── Data ─────────────────────────────────────────────────────────────── */

const STATS = [
  { value: '11', label: 'Agentes IA', sub: 'Autónomos' },
  { value: '24/7', label: 'Operación', sub: 'Sin parar' },
  { value: '35', label: 'Minutos', sub: 'Pipeline diario' },
  { value: '360°', label: 'Cobertura', sub: 'De tu negocio' },
]

const FEATURES = [
  {
    icon: Bot,
    title: 'C-Suite Virtual',
    desc: 'CFO, CTO, CMO, CPO, CDO y CEO — cada uno con su especialidad, herramientas y personalidad. Analizan tu negocio cada mañana.',
  },
  {
    icon: BarChart3,
    title: 'Métricas en Tiempo Real',
    desc: 'Recolección automática de KPIs de todos tus productos SaaS. Detección de anomalías antes de que sean problemas.',
  },
  {
    icon: Brain,
    title: 'Decisiones Basadas en Datos',
    desc: 'El CEO virtual sintetiza reportes del equipo y genera 1-3 acciones concretas del día. Sin ruido, solo señal.',
  },
  {
    icon: Shield,
    title: 'Seguridad & Compliance',
    desc: 'HSTS, CSP, datos cifrados, RLS en Supabase. Tus datos de negocio protegidos con estándares enterprise.',
  },
  {
    icon: Clock,
    title: 'Automatización Sin Fricciones',
    desc: 'Pipeline diario a las 10am: recolecta, analiza, reporta, decide. Pipeline semanal: limpieza + proyecciones 30/60/90d.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Intelligence',
    desc: 'Funnels de conversión, CAC, churn, pipeline de agencia B2B. El CMO virtual obsesionado con retención y adquisición.',
  },
]

const AGENTS_STRATEGIC = [
  { emoji: '💰', name: 'CFO', role: 'Finanzas' },
  { emoji: '⚙️', name: 'CTO', role: 'Tecnología' },
  { emoji: '📈', name: 'CMO', role: 'Growth' },
  { emoji: '🎯', name: 'CPO', role: 'Producto' },
  { emoji: '🎨', name: 'CDO', role: 'Diseño' },
  { emoji: '👔', name: 'CEO', role: 'Estrategia' },
  { emoji: '🗺️', name: 'Estratega', role: 'Visión' },
]

const AGENTS_OPS = [
  { emoji: '📡', name: 'Recolector' },
  { emoji: '🔍', name: 'Analista' },
  { emoji: '📓', name: 'Periodista' },
  { emoji: '🧹', name: 'Limpieza' },
]

const PIPELINE = ['📡', '🔍', '💰', '⚙️', '📈', '🎯', '🎨', '👔', '📓']

const FAQS = [
  {
    q: '¿Qué hace a un sistema agéntico diferente?',
    a: 'A diferencia de un chatbot, un agente agéntico tiene objetivos. Puede navegar por tu CRM, enviar correos a pacientes que no asistieron y re-agendar de forma autónoma.',
  },
  {
    q: '¿Cómo se integra con mi negocio?',
    a: 'Construimos la capa de inteligencia sobre tus herramientas actuales (WhatsApp, Email, CRM, Supabase). La IA actúa como un empleado de élite que nunca duerme.',
  },
  {
    q: '¿Es seguro el manejo de mis datos?',
    a: 'Totalmente. Row Level Security en Supabase, HSTS, headers de seguridad enterprise, y cumplimiento normativo para datos sensibles.',
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] selection:bg-cyan-500/30">

      {/* ════ HERO ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/8 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
              <Zap className="w-3 h-3" />
              Business OS con IA Agéntica
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mb-6">
            Tu negocio operado por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              11 agentes de IA
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--foreground-muted)] max-w-2xl mb-10 leading-relaxed">
            Un C-Suite completo de inteligencia artificial que analiza métricas, detecta anomalías, decide acciones y documenta cada día de tu negocio. Automático. Cada mañana.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-20">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[var(--interactive)] text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-all"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-6 py-3 text-[var(--foreground-muted)] hover:text-[var(--foreground)] font-medium transition-colors"
            >
              Ver cómo funciona
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-10 border-t border-[var(--border)]">
            {STATS.map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{s.value}</div>
                <div className="text-sm text-[var(--foreground-muted)] font-medium">{s.label}</div>
                <div className="text-xs text-[var(--foreground-subtle)]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES ════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-[var(--interactive)] mb-3">Capacidades</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Todo lo que necesitas para operar con IA
            </h2>
            <p className="text-[var(--foreground-muted)] text-lg">
              Cada componente diseñado para que tu negocio funcione de forma autónoma mientras te enfocas en las decisiones estratégicas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--interactive)]/30 hover:shadow-[0_0_30px_rgba(0,242,254,0.06)] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--interactive)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--interactive)]/20 transition-colors">
                  <f.icon className="w-5 h-5 text-[var(--interactive)]" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ AGENTS ═════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[var(--background-subtle)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-[var(--interactive)] mb-3">El equipo</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              11 agentes. Cero nómina.
            </h2>
            <p className="text-[var(--foreground-muted)] text-lg">
              Un C-Suite completo que opera tu portafolio cada mañana de 10:00 a 10:35.
            </p>
          </div>

          {/* Strategic */}
          <div className="mb-10">
            <p className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-4 text-center">Equipo Estratégico</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {AGENTS_STRATEGIC.map((a, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--interactive)]/30 transition-all text-center"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-sm font-semibold">{a.name}</span>
                  <span className="text-[10px] text-[var(--interactive)] font-medium uppercase tracking-wider">{a.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational */}
          <div className="mb-12">
            <p className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-4 text-center">Equipo Operacional</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {AGENTS_OPS.map((a, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-400/30 transition-all text-center"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-sm font-semibold">{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-sm font-mono">
            <span className="text-[var(--foreground-subtle)] text-xs">10:00</span>
            {PIPELINE.map((e, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-[var(--foreground-faint)]">→</span>
                <span className="text-lg">{e}</span>
              </span>
            ))}
            <span className="text-[var(--foreground-subtle)] text-xs ml-1">10:35</span>
          </div>
          <p className="text-center text-[var(--foreground-subtle)] text-xs mt-3">
            Pipeline diario automático — 35 minutos de inteligencia ejecutiva
          </p>
        </div>
      </section>

      {/* ════ FAQ ════════════════════════════════════════════════════════ */}
      <section id="contacto" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-sm font-medium text-[var(--interactive)] mb-3">Preguntas frecuentes</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--interactive)]/20 transition-all"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA FINAL ═════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="mb-8">
            <StratoscoreLogo variant="stacked" className="mx-auto" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Listo para automatizar tu operación
          </h2>
          <p className="text-lg text-[var(--foreground-muted)] mb-10 max-w-xl mx-auto">
            Empieza con el Business OS que piensa, decide y ejecuta mientras tú lideras.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--interactive)] text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition-all text-lg"
          >
            Empezar ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ════ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="py-16 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4 text-[var(--foreground)]">
                <StratoscoreLogo variant="wordmark" width={180} />
              </div>
              <p className="text-sm text-[var(--foreground-muted)] max-w-sm leading-relaxed">
                Business OS con 11 agentes de IA autónomos. Automatización agéntica 360 para PYMES, Clínicas y portafolios SaaS.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
                <li><a href="#como-funciona" className="hover:text-[var(--foreground)] transition-colors">Capacidades</a></li>
                <li><a href="#contacto" className="hover:text-[var(--foreground)] transition-colors">FAQ</a></li>
                <li><Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Iniciar sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
                <li>contacto@stratoscore.app</li>
                <li>San José, Costa Rica</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--foreground-subtle)]">
            <span>© 2026 StratosCore. Todos los derechos reservados.</span>
            <div className="flex gap-6">
              <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Privacidad</span>
              <span className="hover:text-[var(--foreground)] cursor-pointer transition-colors">Términos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
