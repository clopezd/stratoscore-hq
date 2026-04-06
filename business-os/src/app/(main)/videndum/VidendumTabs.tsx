'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Factory, BarChart2, Upload } from 'lucide-react'

const TABS = [
  {
    href: '/videndum',
    label: 'Resumen',
    icon: LayoutDashboard,
    exact: true,
    tooltip: 'Resumen operativo semanal: alertas, MAPE, SKUs críticos'
  },
  {
    href: '/videndum/forecast-accuracy',
    label: 'Accuracy',
    icon: Target,
    exact: false,
    tooltip: 'Forecast Accuracy por SKU — MAPE, grades, filtros'
  },
  {
    href: '/videndum/planning',
    label: 'Planning',
    icon: Factory,
    exact: false,
    tooltip: 'Plan de producción: recomendaciones + export IFS'
  },
  {
    href: '/videndum/historico',
    label: 'Histórico',
    icon: BarChart2,
    exact: false,
    tooltip: 'Dashboard histórico: revenue, estacionalidad, tendencias'
  },
  {
    href: '/videndum/ingesta',
    label: 'Ingesta',
    icon: Upload,
    exact: false,
    tooltip: 'Importación y carga de datos desde archivos Excel'
  },
] as const

export function VidendumTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-0 px-3 md:px-6 border-b border-white/[0.06] shrink-0 overflow-x-auto scrollbar-none sticky top-14 md:static z-10 backdrop-blur-xl" style={{ backgroundColor: 'var(--app-page-bg, #0a0a1a)' }}>
      {TABS.map(({ href, label, icon: Icon, exact, tooltip }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={tooltip}
            className={`group relative flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
              ${isActive
                ? 'border-white text-white'
                : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/20'
              }`}
          >
            <Icon size={13} />
            {label}

            {/* Tooltip on hover */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#13131f] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 w-max max-w-[280px] z-50">
              <p className="text-[10px] text-white/70 leading-relaxed">{tooltip}</p>
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-[#13131f] border-t border-l border-white/10 rotate-45" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
