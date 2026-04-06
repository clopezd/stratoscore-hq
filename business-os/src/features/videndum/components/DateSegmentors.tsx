'use client'

import React from 'react'
import { Calendar } from 'lucide-react'

interface DateSegmentorsProps {
  selectedYear: number | null
  selectedMonth: number | null
  onYearChange: (year: number | null) => void
  onMonthChange: (month: number | null) => void
  availableYears?: number[]
}

const MONTHS = [
  { value: 1, label: 'Ene' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dic' }
]

export function DateSegmentors({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  availableYears = [2024, 2025, 2026]
}: DateSegmentorsProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={14} className="text-violet-400" />
        <h3 className="text-xs font-semibold text-white/70">Filtros de Período</h3>
      </div>

      {/* Segmentador de Año */}
      <div className="space-y-2">
        <label className="text-[10px] text-white/40 uppercase tracking-wider">Año</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onYearChange(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedYear === null
                ? 'bg-violet-500/80 text-white border border-violet-400/50'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            Todo
          </button>
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedYear === year
                  ? 'bg-violet-500/80 text-white border border-violet-400/50'
                  : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Segmentador de Mes */}
      <div className="space-y-2">
        <label className="text-[10px] text-white/40 uppercase tracking-wider">Mes</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onMonthChange(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedMonth === null
                ? 'bg-emerald-500/80 text-white border border-emerald-400/50'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            Todo
          </button>
          {MONTHS.map(month => (
            <button
              key={month.value}
              onClick={() => onMonthChange(month.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedMonth === month.value
                  ? 'bg-emerald-500/80 text-white border border-emerald-400/50'
                  : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de filtro activo */}
      {(selectedYear || selectedMonth) && (
        <div className="pt-2 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/40">
            Filtrando:{' '}
            {selectedMonth && <span className="text-emerald-400">{MONTHS[selectedMonth - 1].label}</span>}
            {selectedMonth && selectedYear && ' '}
            {selectedYear && <span className="text-violet-400">{selectedYear}</span>}
            {!selectedMonth && !selectedYear && <span className="text-white/60">Sin filtros</span>}
          </p>
        </div>
      )}
    </div>
  )
}
