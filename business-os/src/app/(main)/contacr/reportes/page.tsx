'use client'

import Link from 'next/link'
import { EmpresaSelector } from '@/features/contacr/components/EmpresaSelector'
import { FileText, BarChart3 } from 'lucide-react'

const REPORTES = [
  {
    href: '/contacr/reportes/estado-resultados',
    label: 'Estado de Resultados',
    desc: 'Ingresos menos gastos. Muestra la utilidad o pérdida del período.',
    icon: BarChart3,
    color: 'emerald',
  },
  {
    href: '/contacr/reportes/balance-general',
    label: 'Balance General',
    desc: 'Activos, pasivos y patrimonio. Fotografía financiera de la empresa.',
    icon: FileText,
    color: 'blue',
  },
]

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default function ContaCRReportesPage() {
  return (
    <div>
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <h1 className="text-sm font-medium text-white/60">Reportes financieros</h1>
        <EmpresaSelector />
      </div>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {REPORTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/15 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${COLOR_MAP[r.color]}`}>
                <r.icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{r.label}</h3>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
