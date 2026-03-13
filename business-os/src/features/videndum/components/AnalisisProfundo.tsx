'use client'

import { useState } from 'react'
import { Microscope } from 'lucide-react'
import { DecisionMatrix } from './DecisionMatrix'
import { ConsultantChat } from '@/features/consultant/components/ConsultantChat'
import type { DecisionMatrixData } from '../types'

export function AnalisisProfundo() {
  const [radarData, setRadarData] = useState<DecisionMatrixData | null>(null)

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Microscope size={14} className="text-violet-400" />
            <h1 className="text-base font-semibold text-white">Análisis Profundo</h1>
          </div>
          <p className="text-xs text-white/35">
            Radar de Inteligencia Competitiva · Consultor Estratégico en tiempo real
          </p>
        </div>
        {radarData && (
          <span className="text-[10px] text-violet-300/60 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
            Contexto del Radar activo · {radarData.snapshot_date}
          </span>
        )}
      </div>

      {/* Layout 2 columnas en desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

        {/* Columna izquierda: Radar */}
        <div className="space-y-2">
          <p className="text-[11px] text-white/25 uppercase tracking-widest px-0.5">
            Radar · Inteligencia Competitiva
          </p>
          <DecisionMatrix onDataReady={setRadarData} />
        </div>

        {/* Columna derecha: Consultor — sticky en desktop */}
        <div className="space-y-2 xl:sticky xl:top-5">
          <p className="text-[11px] text-white/25 uppercase tracking-widest px-0.5">
            Consultor Estratégico{radarData ? ' · Radar cargado' : ''}
          </p>
          <ConsultantChat radarContext={radarData} />
          {!radarData && (
            <p className="text-[10px] text-white/20 text-center px-4">
              Ejecuta el Radar para que el Consultor tenga acceso al análisis pre-computado
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
