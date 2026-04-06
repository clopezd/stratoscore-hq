'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthenticatedHeaderProps {
  userProfile: {
    full_name?: string | null
    email: string
    role: string
  }
}

// Logo de StratosCore
const StratoscoreBrandLogo = ({ className = "w-40 h-auto" }) => (
  <svg viewBox="0 0 220 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <polyline
        points="4,10 18,28 4,46"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <polyline
        points="13,18 22,28 13,38"
        stroke="#00F2FE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <text
      x="34"
      y="29"
      dominantBaseline="middle"
      fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
      fontWeight="700"
      fontSize="22"
      letterSpacing="1.5"
      fill="currentColor"
    >
      STRATOSCORE
    </text>
  </svg>
)

export function AuthenticatedHeader({ userProfile }: AuthenticatedHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Finanzas', href: '/finanzas', icon: '💰' },
  ]

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  const displayName = userProfile.full_name || userProfile.email.split('@')[0]

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center text-white">
          <StratoscoreBrandLogo className="w-40 h-auto" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                text-sm font-semibold uppercase tracking-wider transition-all relative group
                ${isActive(link.href)
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <span className="mr-2">{link.icon}</span>
              {link.name}
              {isActive(link.href) && (
                <span className="absolute -bottom-5 left-0 w-full h-0.5 bg-cyan-500"></span>
              )}
            </Link>
          ))}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <span className="text-sm font-semibold text-white hidden md:block">
              {displayName}
            </span>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop para cerrar al hacer click fuera */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded">
                    {userProfile.role}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Configuración
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation (optional) */}
      <div className="md:hidden border-t border-white/5">
        <div className="flex justify-around py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 text-xs font-semibold uppercase
                ${isActive(link.href) ? 'text-cyan-400' : 'text-gray-500'}
              `}
            >
              <span className="text-lg">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
