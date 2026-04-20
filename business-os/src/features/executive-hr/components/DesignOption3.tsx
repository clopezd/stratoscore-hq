'use client'

/**
 * OPCIÓN 3 — KPI STRIP + TABS DETALLADOS
 *
 * Filosofía: "Titulares arriba, detalle cuando lo necesites"
 * Strip superior con 5 KPIs críticos (uno por dashboard) + tabs para profundizar.
 * Ideal para: directivos móviles, revisiones rápidas, drill-down cuando algo llama la atención.
 * Fortaleza: responsive, prioriza lo crítico, mínima carga cognitiva.
 * Debilidad: requiere interacción para ver todo el detalle.
 */

import { useState } from 'react'
import {
  Users, Briefcase, Clock, UserX, UserPlus,
  AlertCircle, CheckCircle2,
} from 'lucide-react'
import { hrMockData } from '../data/mock'

type TabKey = 'rotacion' | 'posiciones' | 'hrsExtras' | 'ausentismo' | 'atraccion'

const TABS: { key: TabKey; label: string; icon: typeof Users; color: string; critical: { label: string; value: string; status: 'ok' | 'warn' | 'danger' } }[] = [
  {
    key: 'rotacion',
    label: 'Rotación',
    icon: Users,
    color: 'rgb(244 63 94)',
    critical: { label: 'Acum. año', value: `${hrMockData.rotacion.acumuladaAnio}%`, status: 'warn' },
  },
  {
    key: 'posiciones',
    label: 'Posiciones',
    icon: Briefcase,
    color: 'rgb(99 102 241)',
    critical: { label: '% Ocupación', value: `${hrMockData.posiciones.ocupacion}%`, status: 'warn' },
  },
  {
    key: 'hrsExtras',
    label: 'Horas Extras',
    icon: Clock,
    color: 'rgb(245 158 11)',
    critical: { label: 'Gasto YTD', value: `$${(hrMockData.hrsExtras.acumuladoAnio.gasto / 1_000_000).toFixed(1)}M`, status: 'warn' },
  },
  {
    key: 'ausentismo',
    label: 'Ausentismo',
    icon: UserX,
    color: 'rgb(139 92 246)',
    critical: { label: 'Días YTD', value: `${hrMockData.ausentismo.dias.anio}`, status: 'danger' },
  },
  {
    key: 'atraccion',
    label: 'Atracción',
    icon: UserPlus,
    color: 'rgb(16 185 129)',
    critical: { label: 'Contrataciones', value: `${hrMockData.atraccion.contratacionesAnio}`, status: 'ok' },
  },
]

function StatusDot({ status }: { status: 'ok' | 'warn' | 'danger' }) {
  const color = status === 'ok' ? 'bg-emerald-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400'
  return <span className={`w-1.5 h-1.5 rounded-full ${color} inline-block`} />
}

function DetailCard({ label, value, sub, accent = 'text-white', big }: { label: string; value: string; sub?: string; accent?: string; big?: boolean }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 ${big ? 'col-span-2' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{label}</p>
      <p className={`${big ? 'text-3xl' : 'text-2xl'} font-bold font-mono ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/40 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

function BreakdownBar({
  items, color,
}: {
  items: { label: string; value: number }[]
  color: string
}) {
  const total = items.reduce((a, b) => a + b.value, 0)
  return (
    <div className="space-y-2">
      {items.map(i => {
        const pct = (i.value / total) * 100
        return (
          <div key={i.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-white/60">{i.label}</span>
              <span className="text-white/80 font-mono">{i.value} · {pct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DesignOption3() {
  const [active, setActive] = useState<TabKey>('rotacion')
  const d = hrMockData
  const fmtMoney = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo — Recursos Humanos</h1>
          <p className="text-sm text-white/50 mt-1">Vista 360° · KPI strip + detalle navegable</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Abril 2026
        </div>
      </div>

      {/* KPI Strip — 5 KPIs críticos visibles siempre */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`text-left rounded-xl p-4 border transition-all ${
                isActive
                  ? 'bg-white/[0.06] border-white/20 scale-[1.02]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
              }`}
              style={isActive ? { boxShadow: `0 0 0 1px ${tab.color}55, 0 8px 24px ${tab.color}22` } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${tab.color}33` }}>
                  <Icon size={13} style={{ color: tab.color }} />
                </div>
                <StatusDot status={tab.critical.status} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{tab.label}</p>
              <p className="text-2xl font-bold font-mono text-white">{tab.critical.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{tab.critical.label}</p>
            </button>
          )
        })}
      </div>

      {/* Detalle del tab activo */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        {active === 'rotacion' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Rotación — detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard label="Acumulada año" value={`${d.rotacion.acumuladaAnio}%`} sub="meta ≤10%" accent="text-rose-400" big />
              <DetailCard label="Rotación mes" value={`${d.rotacion.delMes}%`} sub="vs 2.1% promedio" />
              <DetailCard label="Encuestas salida" value={`${d.rotacion.encuestasSalida.tasa}%`} sub={`${d.rotacion.encuestasSalida.respondidas}/${d.rotacion.encuestasSalida.enviadas}`} accent="text-amber-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Por tipo</p>
                <BreakdownBar
                  color="rgb(244 63 94)"
                  items={[
                    { label: 'Renuncias', value: d.rotacion.porTipo.renuncias },
                    { label: 'Despidos', value: d.rotacion.porTipo.despidos },
                    { label: 'Fin contrato', value: d.rotacion.porTipo.finContrato },
                    { label: 'Otros', value: d.rotacion.porTipo.otros },
                  ]}
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Por género</p>
                <BreakdownBar
                  color="rgb(244 63 94)"
                  items={[
                    { label: 'Masculino', value: d.rotacion.porGenero.masculino },
                    { label: 'Femenino', value: d.rotacion.porGenero.femenino },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {active === 'posiciones' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Posiciones — detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard label="Posiciones activas" value={`${d.posiciones.activas}`} accent="text-indigo-400" big />
              <DetailCard label="Ocupadas" value={`${d.posiciones.ocupadas}`} />
              <DetailCard label="Vacantes" value={`${d.posiciones.vacantes}`} accent="text-amber-400" />
              <DetailCard label="% Ocupación" value={`${d.posiciones.ocupacion}%`} sub="meta ≥95%" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Por género</p>
              <BreakdownBar
                color="rgb(99 102 241)"
                items={[
                  { label: 'Masculino', value: d.posiciones.porGenero.masculino },
                  { label: 'Femenino', value: d.posiciones.porGenero.femenino },
                ]}
              />
            </div>
          </div>
        )}

        {active === 'hrsExtras' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Horas Extras — detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard label="Horas YTD" value={`${d.hrsExtras.acumuladoAnio.horas.toLocaleString()}`} sub={fmtMoney(d.hrsExtras.acumuladoAnio.gasto)} accent="text-amber-400" big />
              <DetailCard label="Horas mes" value={`${d.hrsExtras.delMes.horas}`} sub={fmtMoney(d.hrsExtras.delMes.gasto)} />
              <DetailCard label="Tipo dominante" value={`${d.hrsExtras.porTipo.operativas}%`} sub="operativas" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Horas por VP</p>
                <BreakdownBar
                  color="rgb(245 158 11)"
                  items={d.hrsExtras.porVP.map(v => ({ label: v.vp, value: v.horas }))}
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Top puestos</p>
                <BreakdownBar
                  color="rgb(245 158 11)"
                  items={d.hrsExtras.topPuestos.map(p => ({ label: p.puesto, value: p.horas }))}
                />
              </div>
            </div>
          </div>
        )}

        {active === 'ausentismo' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserX size={14} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Ausentismo — detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <DetailCard label="Personas YTD" value={`${d.ausentismo.personas.anio}`} sub={`${d.ausentismo.personas.mes} mes`} accent="text-violet-400" />
              <DetailCard label="Gestiones YTD" value={`${d.ausentismo.gestiones.anio}`} sub={`${d.ausentismo.gestiones.mes} mes`} />
              <DetailCard label="Días YTD" value={`${d.ausentismo.dias.anio}`} sub={`${d.ausentismo.dias.mes} mes`} accent="text-red-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">% Por VP</p>
                <BreakdownBar
                  color="rgb(139 92 246)"
                  items={d.ausentismo.porVP.map(v => ({ label: v.vp, value: v.pct }))}
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">% Por tipo</p>
                <BreakdownBar
                  color="rgb(139 92 246)"
                  items={[
                    { label: 'Enfermedad', value: d.ausentismo.porTipo.enfermedad },
                    { label: 'Personal', value: d.ausentismo.porTipo.personal },
                    { label: 'Licencia', value: d.ausentismo.porTipo.licencia },
                    { label: 'Otros', value: d.ausentismo.porTipo.otros },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {active === 'atraccion' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Atracción — detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard label="Contrataciones YTD" value={`${d.atraccion.contratacionesAnio}`} accent="text-emerald-400" big />
              <DetailCard label="Req. en proceso" value={`${d.atraccion.requerimientosEnProceso}`} />
              <DetailCard label="Vacantes sin Req" value={`${d.atraccion.vacantesSinReq}`} accent="text-amber-400" />
              <DetailCard label="% Ocupación Req" value={`${d.atraccion.ocupacionReq}%`} />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Por tipo de contratación</p>
              <BreakdownBar
                color="rgb(16 185 129)"
                items={[
                  { label: 'Externo', value: d.atraccion.porTipo.externo },
                  { label: 'Concurso interno', value: d.atraccion.porTipo.concursoInterno },
                  { label: 'Promoción', value: d.atraccion.porTipo.promocion },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200/80">
            <span className="font-semibold text-amber-300">Alerta ausentismo:</span> días por enfermedad suben 12% MoM en VP Operaciones.
          </p>
        </div>
        <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-200/80">
            <span className="font-semibold text-emerald-300">Atracción saludable:</span> 92% de Req ocupadas, 30% desde concurso interno.
          </p>
        </div>
      </div>
    </div>
  )
}
