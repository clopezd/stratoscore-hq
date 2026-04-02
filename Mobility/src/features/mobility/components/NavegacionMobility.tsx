'use client'

import { usePathname } from 'next/navigation'

export function NavegacionMobility() {
  const pathname = usePathname()

  const links = [
    { href: '/mobility', label: 'Dashboard' },
    { href: '/mobility/calendario', label: 'Calendario' },
    { href: '/mobility/pacientes', label: 'Pacientes' },
    { href: '/mobility/terapeutas', label: 'Terapeutas' },
  ]

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mobility Group CR</h1>
        <p className="text-gray-600">Centro de Rehabilitación Robótica</p>
      </div>

      {/* Navegación */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
