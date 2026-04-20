'use client'

/**
 * OPCIÓN 2 — BENTO EJECUTIVO
 *
 * Filosofía: "Lo importante destacado, lo complementario accesible"
 * Bento-box asimétrico: cada dashboard tiene una card HERO grande con el KPI estrella
 * y 4 cards satélite con los indicadores complementarios.
 * Ideal para: Board meetings, presentaciones semanales, vista en monitor grande.
 * Fortaleza: visual, moderno, jerarquía clara. Cuenta una historia por dashboard.
 * Debilidad: menos denso que la opción 1.
 */

import {
  Users, Briefcase, Clock, UserX, UserPlus,
  TrendingDown, TrendingUp,
} from 'lucide-react'
import { hrMockData } from '../data/mock'

// ───────────────────────── Primitives ────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function Donut({ value, color, size = 64 }: { value: number; color: string; size?: number }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
      />
    </svg>
  )
}

function Hero({
  icon: Icon, label, value, sub, gradient, children,
}: {
  icon: typeof Users
  label: string
  value: string
  sub: string
  gradient: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden row-span-2 border border-white/[0.08]"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={14} className="text-white/80" />
          <p className="text-[10px] uppercase tracking-widest text-white/60">{label}</p>
        </div>
        <p className="text-4xl font-bold text-white font-mono mb-1">{value}</p>
        <p className="text-xs text-white/60">{sub}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  )
}

function Mini({ label, value, sub, accent = 'text-white' }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/40 mb-1.5">{label}</p>
      <p className={`text-base font-bold font-mono ${accent}`}>{value}</p>
      {sub && <p className="text-[9px] text-white/40 mt-0.5 font-mono">{sub}</p>}
    </div>
  )
}

function DashCard({
  icon: Icon, title, color, children,
}: {
  icon: typeof Users
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color }}>
          <Icon size={13} className="text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ───────────────────────── Component ─────────────────────────────────

export function DesignOption2() {
  const d = hrMockData
  const fmtMoney = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo — Recursos Humanos</h1>
          <p className="text-sm text-white/50 mt-1">Vista 360° · Bento ejecutivo</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Abril 2026 · YTD
        </div>
      </div>

      {/* ROTACIÓN */}
      <DashCard icon={Users} title="Rotación" color="rgb(244 63 94 / 0.8)">
        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          <Hero
            icon={Users}
            label="Acumulada año"
            value={`${d.rotacion.acumuladaAnio}%`}
            sub={`${d.rotacion.delMes}% en el mes`}
            gradient="linear-gradient(135deg, rgba(244,63,94,0.25), rgba(244,63,94,0.05))"
          >
            <Bar value={d.rotacion.acumuladaAnio} max={20} color="rgb(244 63 94)" />
          </Hero>
          <Mini label="Renuncias" value={`${d.rotacion.porTipo.renuncias}`} sub="55% del total" />
          <Mini label="Despidos" value={`${d.rotacion.porTipo.despidos}`} sub="28% del total" />
          <Mini label="M / F" value={`${d.rotacion.porGenero.masculino}/${d.rotacion.porGenero.femenino}`} />
          <Mini label="Fin contrato" value={`${d.rotacion.porTipo.finContrato}`} />
          <Mini label="Encuestas salida" value={`${d.rotacion.encuestasSalida.tasa}%`} sub={`${d.rotacion.encuestasSalida.respondidas}/${d.rotacion.encuestasSalida.enviadas}`} accent="text-amber-400" />
        </div>
      </DashCard>

      {/* POSICIONES */}
      <DashCard icon={Briefcase} title="Posiciones" color="rgb(99 102 241 / 0.8)">
        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          <Hero
            icon={Briefcase}
            label="% Ocupación"
            value={`${d.posiciones.ocupacion}%`}
            sub={`${d.posiciones.ocupadas}/${d.posiciones.activas} posiciones`}
            gradient="linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.05))"
          >
            <div className="flex items-center gap-3">
              <Donut value={d.posiciones.ocupacion} color="rgb(129 140 248)" size={48} />
              <div className="text-[10px] text-white/50">Meta: 95%</div>
            </div>
          </Hero>
          <Mini label="Activas" value={`${d.posiciones.activas}`} accent="text-indigo-400" />
          <Mini label="Ocupadas" value={`${d.posiciones.ocupadas}`} />
          <Mini label="Vacantes" value={`${d.posiciones.vacantes}`} accent="text-amber-400" />
          <Mini label="Masculino" value={`${d.posiciones.porGenero.masculino}`} sub="61%" />
          <Mini label="Femenino" value={`${d.posiciones.porGenero.femenino}`} sub="39%" />
        </div>
      </DashCard>

      {/* HRS EXTRAS */}
      <DashCard icon={Clock} title="Horas Extras" color="rgb(245 158 11 / 0.8)">
        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          <Hero
            icon={Clock}
            label="Gasto acumulado"
            value={fmtMoney(d.hrsExtras.acumuladoAnio.gasto)}
            sub={`${d.hrsExtras.acumuladoAnio.horas.toLocaleString()} horas YTD`}
            gradient="linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))"
          >
            <Bar value={d.hrsExtras.delMes.horas} max={600} color="rgb(251 191 36)" />
            <p className="text-[10px] text-white/50 mt-1">{d.hrsExtras.delMes.horas}h este mes</p>
          </Hero>
          <Mini label="Mes — gasto" value={fmtMoney(d.hrsExtras.delMes.gasto)} sub={`${d.hrsExtras.delMes.horas}h`} />
          <Mini label="Top VP" value={d.hrsExtras.porVP[0].vp} sub={`${d.hrsExtras.porVP[0].horas}h`} />
          <Mini label="Top puesto" value={d.hrsExtras.topPuestos[0].puesto} sub={`${d.hrsExtras.topPuestos[0].horas}h`} />
          <Mini label="Operativas" value={`${d.hrsExtras.porTipo.operativas}%`} accent="text-amber-400" />
          <Mini label="Administrativas" value={`${d.hrsExtras.porTipo.administrativas}%`} />
        </div>
      </DashCard>

      {/* AUSENTISMO */}
      <DashCard icon={UserX} title="Ausentismo" color="rgb(139 92 246 / 0.8)">
        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          <Hero
            icon={UserX}
            label="Días perdidos YTD"
            value={`${d.ausentismo.dias.anio}`}
            sub={`${d.ausentismo.dias.mes} días este mes`}
            gradient="linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.05))"
          >
            <Bar value={d.ausentismo.dias.mes} max={200} color="rgb(167 139 250)" />
          </Hero>
          <Mini label="Personas YTD" value={`${d.ausentismo.personas.anio}`} sub={`${d.ausentismo.personas.mes} mes`} />
          <Mini label="Gestiones YTD" value={`${d.ausentismo.gestiones.anio}`} sub={`${d.ausentismo.gestiones.mes} mes`} />
          <Mini label="Top VP" value={`${d.ausentismo.porVP[0].pct}%`} sub={d.ausentismo.porVP[0].vp} accent="text-violet-400" />
          <Mini label="Enfermedad" value={`${d.ausentismo.porTipo.enfermedad}%`} accent="text-violet-400" />
          <Mini label="Personal" value={`${d.ausentismo.porTipo.personal}%`} />
        </div>
      </DashCard>

      {/* ATRACCIÓN */}
      <DashCard icon={UserPlus} title="Atracción" color="rgb(16 185 129 / 0.8)">
        <div className="grid grid-cols-4 grid-rows-2 gap-3">
          <Hero
            icon={UserPlus}
            label="Contrataciones YTD"
            value={`${d.atraccion.contratacionesAnio}`}
            sub={`${d.atraccion.ocupacionReq}% ocupación de Req`}
            gradient="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))"
          >
            <div className="flex gap-1">
              <Bar value={d.atraccion.porTipo.externo} max={100} color="rgb(52 211 153)" />
            </div>
            <div className="flex justify-between text-[9px] text-white/50 mt-1">
              <span>Externo {d.atraccion.porTipo.externo}%</span>
              <span>Interno {d.atraccion.porTipo.concursoInterno}%</span>
            </div>
          </Hero>
          <Mini label="% Concurso interno" value={`${d.atraccion.porTipo.concursoInterno}%`} />
          <Mini label="% Promoción" value={`${d.atraccion.porTipo.promocion}%`} />
          <Mini label="Req. en proceso" value={`${d.atraccion.requerimientosEnProceso}`} accent="text-emerald-400" />
          <Mini label="Vacantes sin Req" value={`${d.atraccion.vacantesSinReq}`} accent="text-amber-400" />
          <Mini label="% Ocupación Req" value={`${d.atraccion.ocupacionReq}%`} />
        </div>
      </DashCard>
    </div>
  )
}
