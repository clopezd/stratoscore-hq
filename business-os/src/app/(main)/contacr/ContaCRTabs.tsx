'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Upload, ListTree } from 'lucide-react'

const TABS = [
  {
    href: '/contacr/dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    exact: true,
    tooltip: 'Resumen de ingresos, gastos y balance',
  },
  {
    href: '/contacr/importar',
    label: 'Importar',
    icon: Upload,
    exact: false,
    tooltip: 'Importar movimientos desde CSV',
  },
  {
    href: '/contacr/cuentas',
    label: 'Cuentas',
    icon: ListTree,
    exact: false,
    tooltip: 'Plan de cuentas contable estándar CR',
  },
] as const

export function ContaCRTabs() {
  const pathname = usePathname()

  return (
    <div
      className="flex gap-0 px-3 md:px-6 border-b border-white/[0.06] shrink-0 overflow-x-auto scrollbar-none sticky top-14 md:static z-10 backdrop-blur-xl"
      style={{ backgroundColor: 'var(--app-page-bg, #0a0a1a)' }}
    >
      {TABS.map(({ href, label, icon: Icon, exact, tooltip }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={tooltip}
            className={`group relative flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
              ${isActive
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/20'
              }`}
          >
            <Icon size={13} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
