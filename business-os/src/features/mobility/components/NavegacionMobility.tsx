'use client'

import { usePathname } from 'next/navigation'
import { MobilityBrand } from '../brand'

export function NavegacionMobility() {
  const pathname = usePathname()

  const tabs = [
    { nombre: 'Dashboard', href: '/mobility', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { nombre: 'Acciones', href: '/mobility/acciones', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { nombre: 'Calendario', href: '/mobility/calendario', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { nombre: 'Pacientes', href: '/mobility/pacientes', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { nombre: 'Terapeutas', href: '/mobility/terapeutas', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { nombre: 'Equipos', href: '/mobility/equipos', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )},
    { nombre: 'Leads', href: '/mobility/leads', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { nombre: 'Reportes', href: '/mobility/reportes', icono: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ]

  const tabActivo = tabs.find((t) => {
    if (t.href === '/mobility') {
      return pathname === '/mobility'
    }
    return pathname?.startsWith(t.href)
  })

  return (
    <div className="-mx-6 -mt-6 mb-10">
      {/* Hero Header con gradiente premium */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0055A5 0%, #0082C3 50%, #00B0F0 100%)',
          boxShadow: '0 4px 20px rgba(0, 85, 165, 0.25)',
        }}
      >
        {/* Pattern decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative px-6 pt-6 pb-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo + Branding */}
            <div className="flex items-center gap-4">
              <img
                src={MobilityBrand.logo.url}
                alt={MobilityBrand.logo.alt}
                className="h-16 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {MobilityBrand.contact.name}
                </h1>
                <p className="text-sm text-blue-100 font-medium">
                  {MobilityBrand.contact.tagline}
                </p>
              </div>
            </div>

            {/* Usuario premium */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/20">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">Carlos Mario</div>
                <div className="text-xs text-blue-100">Administrador</div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-white/20 border border-white/30"
              >
                CM
              </div>
            </div>
          </div>

          {/* Navigation tabs premium */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 border border-white/20">
            {tabs.map((tab) => {
              const esActivo = tabActivo?.href === tab.href
              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                    ${esActivo
                      ? 'bg-white text-blue-700 shadow-lg scale-[1.02]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className={esActivo ? 'scale-110' : 'opacity-80'}>
                    {tab.icono}
                  </span>
                  <span className="whitespace-nowrap">{tab.nombre}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Glow effect en el borde inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          }}
        />
      </div>
    </div>
  )
}
