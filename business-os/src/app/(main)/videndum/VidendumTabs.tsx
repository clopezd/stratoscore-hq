'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Microscope, Upload } from 'lucide-react'

const TABS = [
  { href: '/videndum',          label: 'Dashboard', icon: BarChart2,  exact: true },
  { href: '/videndum/analisis', label: 'Análisis',  icon: Microscope, exact: false },
  { href: '/videndum/ingesta',  label: 'Ingesta',   icon: Upload,     exact: false },
] as const

export function VidendumTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-0 px-6 border-b border-white/[0.06] shrink-0">
      {TABS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors
              ${isActive
                ? 'border-white text-white'
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
