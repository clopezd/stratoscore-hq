'use client'

import { useState } from 'react'
import type { AgentConfig } from '../types'

interface BusinessAgentCardProps {
  agent: AgentConfig
  running?: boolean
  result?: { success: boolean; report?: string; error?: string; duration_ms?: number } | null
  onRun: () => void
  onViewReport: (report: string) => void
}

export function BusinessAgentCard({ agent, running, result, onRun, onViewReport }: BusinessAgentCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 hover:bg-white/[0.05] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
              agent.team === 'strategic'
                ? 'text-purple-300 bg-purple-400/10'
                : 'text-blue-300 bg-blue-400/10'
            }`}>
              {agent.team === 'strategic' ? 'ESTRATÉGICO' : 'OPERACIONAL'}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        {running && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-400">Ejecutando...</span>
          </div>
        )}
        {!running && result?.success && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-400">{((result.duration_ms ?? 0) / 1000).toFixed(1)}s</span>
          </div>
        )}
        {!running && result && !result.success && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-red-400">Error</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-white/40 mb-3">{agent.description}</p>

      {/* Tables */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {agent.reads.slice(0, 3).map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">
            {t}
          </span>
        ))}
        {agent.reads.length > 3 && (
          <span className="text-[9px] text-white/20">+{agent.reads.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRun}
          disabled={running}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? '⏳ Ejecutando...' : '▶ Ejecutar'}
        </button>
        {result?.report && (
          <button
            onClick={() => onViewReport(result.report!)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-colors"
          >
            📄 Ver reporte
          </button>
        )}
      </div>

      {/* Error display */}
      {result && !result.success && result.error && (
        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] text-red-400 break-all">{result.error}</p>
        </div>
      )}
    </div>
  )
}
