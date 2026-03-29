'use client'

import { AGENTS, DAILY_EXECUTION_ORDER, WEEKLY_AGENTS } from '../config/agents'
import type { AgentSlug } from '../types'

interface PipelineStatusProps {
  states: Record<string, { running: boolean; result: { success: boolean; duration_ms?: number } | null }>
}

export function PipelineStatus({ states }: PipelineStatusProps) {
  const allAgents = [...DAILY_EXECUTION_ORDER, ...WEEKLY_AGENTS]

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Pipeline de Ejecución</h3>

      {/* Daily pipeline */}
      <div className="mb-4">
        <p className="text-[10px] text-white/30 mb-2">DIARIO — 10:00am CT</p>
        <div className="flex items-center gap-1">
          {DAILY_EXECUTION_ORDER.map((slug, i) => {
            const config = AGENTS[slug]
            const state = states[slug]
            const isRunning = state?.running
            const isDone = state?.result?.success
            const isFailed = state?.result && !state.result.success

            return (
              <div key={slug} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    isRunning
                      ? 'bg-amber-400/20 border border-amber-400/30 animate-pulse'
                      : isDone
                        ? 'bg-emerald-400/20 border border-emerald-400/30'
                        : isFailed
                          ? 'bg-red-400/20 border border-red-400/30'
                          : 'bg-white/[0.04] border border-white/[0.07]'
                  }`}
                  title={`${config.name} (${config.slug})`}
                >
                  {config.emoji}
                </div>
                {i < DAILY_EXECUTION_ORDER.length - 1 && (
                  <div className={`w-3 h-[1px] ${isDone ? 'bg-emerald-400/40' : 'bg-white/[0.1]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly pipeline */}
      <div>
        <p className="text-[10px] text-white/30 mb-2">DOMINGOS</p>
        <div className="flex items-center gap-1">
          {WEEKLY_AGENTS.map((slug, i) => {
            const config = AGENTS[slug]
            const state = states[slug]
            const isRunning = state?.running
            const isDone = state?.result?.success
            const isFailed = state?.result && !state.result.success

            return (
              <div key={slug} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                    isRunning
                      ? 'bg-amber-400/20 border border-amber-400/30 animate-pulse'
                      : isDone
                        ? 'bg-emerald-400/20 border border-emerald-400/30'
                        : isFailed
                          ? 'bg-red-400/20 border border-red-400/30'
                          : 'bg-white/[0.04] border border-white/[0.07]'
                  }`}
                  title={`${config.name} (${config.slug})`}
                >
                  {config.emoji}
                </div>
                {i < WEEKLY_AGENTS.length - 1 && (
                  <div className={`w-3 h-[1px] ${isDone ? 'bg-emerald-400/40' : 'bg-white/[0.1]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
