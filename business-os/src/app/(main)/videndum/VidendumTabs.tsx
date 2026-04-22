'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Target, Factory, BarChart2, Upload, MoreHorizontal, FlaskConical, MessageSquare, ClipboardList, TrendingUp } from 'lucide-react'

const MAIN_TABS = [
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
    tooltip: 'Forecast Accuracy por SKU — MAPE 8 semanas, grades, filtros'
  },
  {
    href: '/videndum/planning',
    label: 'Planning',
    icon: Factory,
    exact: false,
    tooltip: 'Plan de producción: recomendaciones, ajustes, export IFS'
  },
  {
    href: '/videndum/forecast-produccion',
    label: 'Forecast',
    icon: TrendingUp,
    exact: false,
    tooltip: 'Forecast de producción Mar-Sep 2026: ponderado UK + Run Rate + Histórico + Order Book'
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

const MORE_ITEMS = [
  { href: '/videndum/ml-forecast', label: 'ML Forecast', icon: FlaskConical },
  { href: '/videndum/analisis', label: 'Análisis Profundo', icon: BarChart2 },
  { href: '/videndum/feedback', label: 'Feedback Cliente', icon: MessageSquare },
  { href: '/videndum/requirements', label: 'Requirements', icon: ClipboardList },
  { href: '/videndum/redesign', label: 'Discovery', icon: ClipboardList },
] as const

export function VidendumTabs() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  const isMoreActive = MORE_ITEMS.some(item => pathname.startsWith(item.href))

  return (
    <div className="flex gap-0 px-3 md:px-6 border-b border-white/[0.06] shrink-0 overflow-x-auto scrollbar-none sticky top-14 md:static z-10 backdrop-blur-xl" style={{ backgroundColor: 'var(--app-page-bg, #0a0a1a)' }}>
      {MAIN_TABS.map(({ href, label, icon: Icon, exact, tooltip }) => {
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

            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#13131f] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 w-max max-w-[280px] z-50">
              <p className="text-[10px] text-white/70 leading-relaxed">{tooltip}</p>
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-[#13131f] border-t border-l border-white/10 rotate-45" />
            </div>
          </Link>
        )
      })}

      {/* More dropdown */}
      <div ref={moreRef} className="relative">
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
            ${isMoreActive
              ? 'border-white text-white'
              : 'border-transparent text-white/35 hover:text-white/65 hover:border-white/20'
            }`}
        >
          <MoreHorizontal size={13} />
          Más
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#13131f] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
            {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
