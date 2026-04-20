'use client'

/**
 * OPCIÓN 1 — GRID CLÁSICO DENSO
 *
 * Filosofía: "Todo a la vista en un vistazo"
 * 5 filas × 5 columnas de KPIs. Alta densidad, mínima navegación.
 * Ideal para: directivos que revisan el dashboard diariamente en pantalla grande.
 * Fortaleza: comparación directa entre dashboards, sin cambios de contexto.
 * Debilidad: puede sentirse saturado en pantallas pequeñas.
 */

import {
  Users, Briefcase, Clock, UserX, UserPlus,
  TrendingUp, TrendingDown, AlertCircle,
} from 'lucide-react'
import { hrMockData } from '../data/mock'

type KpiProps = {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  accent?: string
}

function Kpi({ label, value, sub, trend, accent = 'text-white' }: KpiProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : ''

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className={`text-xl font-bold font-mono ${accent}`}>{value}</p>
        {TrendIcon && <TrendIcon size={12} className={trendColor} />}
      </div>
      {sub && <p className="text-[10px] text-white/40 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

function SectionHeader({
  icon: Icon, title, color, subtitle,
}: {
  icon: typeof Users
  title: string
  color: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={14} className="text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[10px] text-white/40">{subtitle}</p>
      </div>
    </div>
  )
}

export function DesignOption1() {
  const d = hrMockData
  const fmtMoney = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo — Recursos Humanos</h1>
          <p className="text-sm text-white/50 mt-1">Vista 360° · Grid clásico denso</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Datos en tiempo real
        </div>
      </div>

      {/* ROTACIÓN */}
      <div>
        <SectionHeader icon={Users} color="bg-rose-500/80" title="Rotación" subtitle="Salidas, motivos y análisis demográfico" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label="Acumulada año" value={`${d.rotacion.acumuladaAnio}%`} trend="up" accent="text-rose-400" />
          <Kpi label="Rotación mes" value={`${d.rotacion.delMes}%`} sub="vs 2.1% promedio" trend="down" />
          <Kpi label="Por tipo" value={`${d.rotacion.porTipo.renuncias}`} sub={`renuncias · ${d.rotacion.porTipo.despidos} despidos`} />
          <Kpi label="Por género" value={`${d.rotacion.porGenero.masculino} / ${d.rotacion.porGenero.femenino}`} sub="M / F" />
          <Kpi label="Encuestas salida" value={`${d.rotacion.encuestasSalida.tasa}%`} sub={`${d.rotacion.encuestasSalida.respondidas}/${d.rotacion.encuestasSalida.enviadas}`} accent="text-amber-400" />
        </div>
      </div>

      {/* POSICIONES */}
      <div>
        <SectionHeader icon={Briefcase} color="bg-indigo-500/80" title="Posiciones" subtitle="Ocupación y distribución de plantilla" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label="Activas" value={`${d.posiciones.activas}`} accent="text-indigo-400" />
          <Kpi label="Ocupadas" value={`${d.posiciones.ocupadas}`} trend="up" />
          <Kpi label="Vacantes" value={`${d.posiciones.vacantes}`} trend="down" accent="text-amber-400" />
          <Kpi label="% Ocupación" value={`${d.posiciones.ocupacion}%`} sub="meta ≥95%" />
          <Kpi label="Por género" value={`${d.posiciones.porGenero.masculino} / ${d.posiciones.porGenero.femenino}`} sub="M / F" />
        </div>
      </div>

      {/* HRS EXTRAS */}
      <div>
        <SectionHeader icon={Clock} color="bg-amber-500/80" title="Horas Extras" subtitle="Consumo y costo por área" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label="Acum. año" value={`${d.hrsExtras.acumuladoAnio.horas.toLocaleString()}h`} sub={fmtMoney(d.hrsExtras.acumuladoAnio.gasto)} accent="text-amber-400" />
          <Kpi label="Mes actual" value={`${d.hrsExtras.delMes.horas}h`} sub={fmtMoney(d.hrsExtras.delMes.gasto)} />
          <Kpi label="Top VP" value={d.hrsExtras.porVP[0].vp} sub={`${d.hrsExtras.porVP[0].horas}h`} />
          <Kpi label="Top puesto" value={d.hrsExtras.topPuestos[0].puesto.split(' ')[0]} sub={`${d.hrsExtras.topPuestos[0].horas}h`} />
          <Kpi label="Tipo dominante" value={`${d.hrsExtras.porTipo.operativas}%`} sub="operativas" />
        </div>
      </div>

      {/* AUSENTISMO */}
      <div>
        <SectionHeader icon={UserX} color="bg-violet-500/80" title="Ausentismo" subtitle="Personas, gestiones y días no laborados" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label="Personas" value={`${d.ausentismo.personas.anio}`} sub={`${d.ausentismo.personas.mes} en el mes`} accent="text-violet-400" />
          <Kpi label="Gestiones" value={`${d.ausentismo.gestiones.anio}`} sub={`${d.ausentismo.gestiones.mes} en el mes`} />
          <Kpi label="Días" value={`${d.ausentismo.dias.anio}`} sub={`${d.ausentismo.dias.mes} en el mes`} trend="up" />
          <Kpi label="Top VP" value={`${d.ausentismo.porVP[0].pct}%`} sub={d.ausentismo.porVP[0].vp} />
          <Kpi label="Tipo dominante" value={`${d.ausentismo.porTipo.enfermedad}%`} sub="enfermedad" />
        </div>
      </div>

      {/* ATRACCIÓN */}
      <div>
        <SectionHeader icon={UserPlus} color="bg-emerald-500/80" title="Atracción" subtitle="Contrataciones y cobertura de vacantes" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label="Contrataciones año" value={`${d.atraccion.contratacionesAnio}`} trend="up" accent="text-emerald-400" />
          <Kpi label="% Externo" value={`${d.atraccion.porTipo.externo}%`} sub={`${d.atraccion.porTipo.concursoInterno}% interno`} />
          <Kpi label="Req. en proceso" value={`${d.atraccion.requerimientosEnProceso}`} />
          <Kpi label="Vacantes sin Req" value={`${d.atraccion.vacantesSinReq}`} accent="text-amber-400" />
          <Kpi label="% Ocupación Req" value={`${d.atraccion.ocupacionReq}%`} />
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-200/80">
          <span className="font-semibold text-amber-300">Atención:</span>{' '}
          4 vacantes sin requisición abierta · ausentismo por enfermedad sube 12% MoM · meta de ocupación (95%) sin alcanzar.
        </div>
      </div>
    </div>
  )
}
