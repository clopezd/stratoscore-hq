'use client'

import { useState } from 'react'
import { Microscope } from 'lucide-react'
import { DecisionMatrix } from './DecisionMatrix'
import { ConsultantChat } from '@/features/consultant/components/ConsultantChat'
import { ForecastAccuracy } from './ForecastAccuracy'
import { TimeSeriesChart } from './TimeSeriesChart'
import type { DecisionMatrixData } from '../types'

export function AnalisisProfundo() {
  const [radarData, setRadarData] = useState<DecisionMatrixData | null>(null)

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Microscope size={14} className="text-violet-400" />
            <h1 className="text-base font-semibold text-white">Análisis Profundo</h1>
          </div>
          <p className="text-xs text-white/35">
            Radar de Inteligencia Competitiva · Correlación competencia → fallos DPRO
          </p>
        </div>
        {radarData && (
          <span className="text-[10px] text-violet-300/60 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
            Contexto del Radar activo · {radarData.snapshot_date}
          </span>
        )}
      </div>

      {/* NUEVO: Callout explicativo para el gerente de planta */}
      <div className="bg-gradient-to-r from-indigo-500/[0.08] to-violet-500/[0.08] border border-indigo-500/20 rounded-lg p-3">
        <p className="text-[11px] text-indigo-200/90 leading-relaxed">
          <span className="font-semibold text-indigo-300">Para el Gerente de Planta:</span> Este radar identifica{' '}
          <span className="text-orange-300 font-medium">qué competidores directos</span>{' '}
          (Cartoni, Miller, Camgear, Libec, Neewer) están robando deals que el DPRO proyectaba como "cerrados".{' '}
          Cada riesgo incluye la <span className="text-red-300 font-medium">razón específica del fallo de forecast</span>{' '}
          (precio, lead time, canal ciego, región).
        </p>
      </div>

      {/* Precisión del Forecast */}
      <ForecastAccuracy />

      {/* Serie Temporal */}
      <TimeSeriesChart />

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
