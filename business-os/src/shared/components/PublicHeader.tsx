'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { StratoscoreLogo } from './StratoscoreLogo'

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Cómo Funciona', href: '#como-funciona' },
    { name: 'Casos de Éxito', href: '#casos-exito' },
    { name: 'Contacto', href: '#contacto' }
  ]

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0A1929]/95 backdrop-blur-xl border-b border-cyan-500/30 py-2' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Logo — unified StratoscoreLogo component */}
        <Link href="/" className="flex items-center cursor-pointer text-white">
          <StratoscoreLogo variant="wordmark" width={180} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-bold text-gray-300 hover:text-cyan-400 transition-all uppercase tracking-widest relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </a>
          ))}

          <Link
            href="/login"
            className="text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-cyan-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1929] pt-32 px-10 md:hidden animate-fade-in" role="dialog" aria-modal="true">
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-2xl font-black text-cyan-500 uppercase italic"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/login"
              className="text-2xl font-black text-white uppercase italic border-t border-white/10 pt-6"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
