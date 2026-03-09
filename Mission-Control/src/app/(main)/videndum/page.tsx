'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { MOCK_MAPE_DATA, MOCK_OVERALL, type MapeRow } from '@/lib/videndum/mock-data'
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────

function mapeColor(mape: number) {
  if (mape <= 15) return '#22c55e'   // green
  if (mape <= 30) return '#f59e0b'   // amber
  return '#ef4444'                    // red
}

function mapeLabel(mape: number) {
  if (mape <= 15) return 'Bueno'
  if (mape <= 30) return 'Regular'
  return 'Alto'
}

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: {
  label: string; value: string; sub?: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 flex items-start gap-3">
      <div className="p-2 bg-white/[0.06] rounded-lg text-white/50">{icon}</div>
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Custom tooltip for MAPE bar ────────────────────────────────────────────

function MapeTooltip({ active, payload }: { active?: boolean; payload?: { payload: MapeRow }[] }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[180px]">
      <p className="text-white font-medium mb-1">{row.part_number}</p>
      <p className="text-white/50">Tipo: <span className="text-white/80">{row.catalog_type ?? '—'}</span></p>
      <p className="text-white/50">MAPE: <span style={{ color: mapeColor(row.mape) }} className="font-semibold">{row.mape}%</span></p>
      <p className="text-white/50">Revenue: <span className="text-white/80">{row.revenue_total.toLocaleString()}</span></p>
      <p className="text-white/50">Intake: <span className="text-white/80">{row.intake_total.toLocaleString()}</span></p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function VidendumPage() {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<MapeRow>(MOCK_MAPE_DATA[0])

  useEffect(() => { setMounted(true) }, [])

  const sorted = [...MOCK_MAPE_DATA].sort((a, b) => a.mape - b.mape)
  const best5 = sorted.slice(0, 5)
  const worst5 = sorted.slice(-5).reverse()

  const barData = [...MOCK_MAPE_DATA]
    .sort((a, b) => b.revenue_total - a.revenue_total)
    .slice(0, 14)

  const goodCount = MOCK_MAPE_DATA.filter(r => r.mape <= 15).length
  const badCount = MOCK_MAPE_DATA.filter(r => r.mape > 30).length

  return (
    <div className="p-5 space-y-6 overflow-y-auto h-full text-white">

      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-white">Videndum — Forecast Accuracy</h1>
        <p className="text-xs text-white/40 mt-0.5">Revenue vs Order Intake · 2020–2025 · {MOCK_MAPE_DATA.length} productos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="MAPE promedio"
          value={`${MOCK_OVERALL.avg_mape}%`}
          sub="cartera completa"
          icon={<AlertTriangle size={16} />}
        />
        <StatCard
          label="Productos"
          value={String(MOCK_OVERALL.total_products)}
          sub="con revenue + intake"
          icon={<Package size={16} />}
        />
        <StatCard
          label="Buen forecast"
          value={String(goodCount)}
          sub="MAPE ≤ 15%"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Forecast alto"
          value={String(badCount)}
          sub="MAPE > 30%"
          icon={<TrendingDown size={16} />}
        />
      </div>

      {/* Bar chart — MAPE por producto */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <p className="text-xs font-medium text-white/60 mb-3">MAPE por producto (top 14 por revenue)</p>
        {mounted ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} onClick={(d) => { const p = (d as unknown as { activePayload?: { payload: MapeRow }[] })?.activePayload; if (p?.[0]) setSelected(p[0].payload) }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="part_number"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }}
                angle={-35}
                textAnchor="end"
                height={55}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} unit="%" />
              <Tooltip content={<MapeTooltip />} />
              <Bar dataKey="mape" name="MAPE" radius={[3, 3, 0, 0]} fill="#6366f1" label={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="h-[220px] animate-pulse bg-white/[0.03] rounded-lg" />}
      </div>

      {/* Detail + yearly line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Best / Worst */}
        <div className="space-y-3">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-green-400" /> Mejor forecast
            </p>
            <div className="space-y-1.5">
              {best5.map(r => (
                <button key={r.part_number} onClick={() => setSelected(r)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${selected.part_number === r.part_number ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.05]'}`}>
                  <span className="font-mono">{r.part_number}</span>
                  <span style={{ color: mapeColor(r.mape) }}>{r.mape}% · {mapeLabel(r.mape)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
              <TrendingDown size={13} className="text-red-400" /> Peor forecast
            </p>
            <div className="space-y-1.5">
              {worst5.map(r => (
                <button key={r.part_number} onClick={() => setSelected(r)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors
                    ${selected.part_number === r.part_number ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.05]'}`}>
                  <span className="font-mono">{r.part_number}</span>
                  <span style={{ color: mapeColor(r.mape) }}>{r.mape}% · {mapeLabel(r.mape)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Yearly line chart for selected product */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
          <p className="text-xs font-medium text-white/60 mb-1">
            Detalle anual · <span className="text-white font-mono">{selected.part_number}</span>
          </p>
          <p className="text-[10px] text-white/30 mb-3">
            MAPE {selected.mape}% · {selected.year_from}–{selected.year_to} · {selected.catalog_type ?? 'N/A'}
          </p>
          {mounted ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={selected.yearly_detail}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="intake" name="Order Intake" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-[200px] animate-pulse bg-white/[0.03] rounded-lg" />}
        </div>

      </div>

      {/* Full table */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-medium text-white/60">Todos los productos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Part Number', 'Tipo', 'MAPE', 'Revenue', 'Intake', 'Error Agr.', 'Períodos'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...MOCK_MAPE_DATA].sort((a, b) => b.revenue_total - a.revenue_total).map(r => (
                <tr
                  key={r.part_number}
                  onClick={() => setSelected(r)}
                  className={`border-b border-white/[0.04] cursor-pointer transition-colors
                    ${selected.part_number === r.part_number ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                >
                  <td className="px-4 py-2 font-mono text-white/80">{r.part_number}</td>
                  <td className="px-4 py-2 text-white/40">{r.catalog_type ?? '—'}</td>
                  <td className="px-4 py-2 font-semibold" style={{ color: mapeColor(r.mape) }}>{r.mape}%</td>
                  <td className="px-4 py-2 text-white/70">{r.revenue_total.toLocaleString()}</td>
                  <td className="px-4 py-2 text-white/70">{r.intake_total.toLocaleString()}</td>
                  <td className="px-4 py-2 text-white/40">{r.aggregate_error}%</td>
                  <td className="px-4 py-2 text-white/40">{r.periods_with_data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
