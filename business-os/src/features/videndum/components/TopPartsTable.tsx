'use client'

import type { TopPartRow } from '../types'

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-vid-card rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400/70 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-vid-subtle">{pct}%</span>
    </div>
  )
}

export function TopPartsTable({ data }: { data: TopPartRow[] }) {
  if (!data.length) return null
  const maxRev = data[0].total_revenue

  return (
    <div className="bg-vid-card border border-vid rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-vid">
        <p className="text-xs font-medium text-vid-muted">Top 15 productos por revenue</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-vid-subtle">
              {['#', 'Part Number', 'Cat.', 'Revenue', 'Order Intake', 'B2B', 'Share'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-vid-subtle font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const b2b = row.total_revenue > 0
                ? (row.total_intake / row.total_revenue).toFixed(2)
                : '—'
              const b2bNum = row.total_revenue > 0 ? row.total_intake / row.total_revenue : 0
              return (
                <tr key={row.part_number} className="border-b border-vid-subtle hover:bg-vid-raised transition-colors">
                  <td className="px-4 py-2 text-vid-subtle">{i + 1}</td>
                  <td className="px-4 py-2 font-mono text-vid-fg">{row.part_number}</td>
                  <td className="px-4 py-2">
                    {row.catalog_type ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        row.catalog_type === 'PKG'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {row.catalog_type}
                      </span>
                    ) : <span className="text-vid-faint">—</span>}
                  </td>
                  <td className="px-4 py-2 text-vid-fg">{row.total_revenue.toLocaleString()}</td>
                  <td className="px-4 py-2 text-vid-muted">{row.total_intake.toLocaleString()}</td>
                  <td className={`px-4 py-2 font-medium ${b2bNum >= 1 ? 'text-emerald-400' : b2bNum > 0 ? 'text-amber-400' : 'text-vid-subtle'}`}>
                    {b2b}
                  </td>
                  <td className="px-4 py-2">
                    <MiniBar value={row.total_revenue} max={maxRev} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
