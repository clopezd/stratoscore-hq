'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, Dumbbell, BarChart3, User } from 'lucide-react'

const tabs = [
  { href: '/fitsync', label: 'Nutrición', icon: UtensilsCrossed, exact: true },
  { href: '/fitsync/training', label: 'Training', icon: Dumbbell },
  { href: '/fitsync/progress', label: 'Progreso', icon: BarChart3 },
  { href: '/fitsync/profile', label: 'Perfil', icon: User },
]

export function FitSyncTabs() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
