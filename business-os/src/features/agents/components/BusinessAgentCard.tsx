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
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
            <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
              agent.team === 'strategic'
                ? 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-400/10'
                : 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-400/10'
            }`}>
              {agent.team === 'strategic' ? 'ESTRATÉGICO' : 'OPERACIONAL'}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        {running && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Ejecutando...</span>
          </div>
        )}
        {!running && result?.success && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{((result.duration_ms ?? 0) / 1000).toFixed(1)}s</span>
          </div>
        )}
        {!running && result && !result.success && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-red-600 dark:text-red-400">Error</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-white/40 mb-3">{agent.description}</p>

      {/* Tables */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {agent.reads.slice(0, 3).map(t => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-white/[0.04] dark:text-white/30">
            {t}
          </span>
        ))}
        {agent.reads.length > 3 && (
          <span className="text-[9px] text-gray-400 dark:text-white/20">+{agent.reads.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRun}
          disabled={running}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? '⏳ Ejecutando...' : '▶ Ejecutar'}
        </button>
        {result?.report && (
          <button
            onClick={() => onViewReport(result.report!)}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1] transition-colors"
          >
            📄 Reporte
          </button>
        )}
      </div>

      {/* Error display */}
      {result && !result.success && result.error && (
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <p className="text-[10px] text-red-600 dark:text-red-400 break-all">{result.error}</p>
        </div>
      )}
    </div>
  )
}
