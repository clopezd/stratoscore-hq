'use client'

import { useState } from 'react'
import { LayoutGrid, Sparkles, LayoutList } from 'lucide-react'
import { DesignOption1 } from '@/features/executive-hr/components/DesignOption1'
import { DesignOption2 } from '@/features/executive-hr/components/DesignOption2'
import { DesignOption3 } from '@/features/executive-hr/components/DesignOption3'

type Option = 1 | 2 | 3

const OPTIONS: { id: Option; label: string; tagline: string; icon: typeof LayoutGrid }[] = [
  { id: 1, label: 'Grid Clásico', tagline: 'Todo a la vista · alta densidad', icon: LayoutGrid },
  { id: 2, label: 'Bento Ejecutivo', tagline: 'Hero + satélites · visual', icon: Sparkles },
  { id: 3, label: 'KPI Strip + Tabs', tagline: 'Titulares + drill-down', icon: LayoutList },
]

export default function ExecutiveHRPage() {
  const [option, setOption] = useState<Option>(1)

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Switcher */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Preview · Selecciona una opción de diseño</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OPTIONS.map(opt => {
              const Icon = opt.icon
              const isActive = option === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setOption(opt.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-white/[0.08] border-white/30 scale-[1.01]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={14} className={isActive ? 'text-white' : 'text-white/40'} />
                    <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/60'}`}>
                      Opción {opt.id} · {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40">{opt.tagline}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        {option === 1 && <DesignOption1 />}
        {option === 2 && <DesignOption2 />}
        {option === 3 && <DesignOption3 />}
      </div>
    </div>
  )
}
