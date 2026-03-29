'use client'

import { AGENTS, DAILY_EXECUTION_ORDER, WEEKLY_AGENTS } from '../config/agents'
import type { AgentSlug } from '../types'

interface PipelineStatusProps {
  states: Record<string, { running: boolean; result: { success: boolean; duration_ms?: number } | null }>
}

export function PipelineStatus({ states }: PipelineStatusProps) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-4 shadow-sm dark:shadow-none">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider mb-3">Pipeline de Ejecución</h3>

      {/* Daily pipeline */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-400 dark:text-white/30 mb-2">DIARIO — 10:00am CT</p>
        <div className="flex items-center gap-1 flex-wrap">
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
                      ? 'bg-amber-100 border border-amber-300 dark:bg-amber-400/20 dark:border-amber-400/30 animate-pulse'
                      : isDone
                        ? 'bg-emerald-100 border border-emerald-300 dark:bg-emerald-400/20 dark:border-emerald-400/30'
                        : isFailed
                          ? 'bg-red-100 border border-red-300 dark:bg-red-400/20 dark:border-red-400/30'
                          : 'bg-gray-50 border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.07]'
                  }`}
                  title={`${config.name} (${config.slug})`}
                >
                  {config.emoji}
                </div>
                {i < DAILY_EXECUTION_ORDER.length - 1 && (
                  <div className={`w-3 h-[1px] ${isDone ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-white/[0.1]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly pipeline */}
      <div>
        <p className="text-[10px] text-gray-400 dark:text-white/30 mb-2">DOMINGOS</p>
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
                      ? 'bg-amber-100 border border-amber-300 dark:bg-amber-400/20 dark:border-amber-400/30 animate-pulse'
                      : isDone
                        ? 'bg-emerald-100 border border-emerald-300 dark:bg-emerald-400/20 dark:border-emerald-400/30'
                        : isFailed
                          ? 'bg-red-100 border border-red-300 dark:bg-red-400/20 dark:border-red-400/30'
                          : 'bg-gray-50 border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.07]'
                  }`}
                  title={`${config.name} (${config.slug})`}
                >
                  {config.emoji}
                </div>
                {i < WEEKLY_AGENTS.length - 1 && (
                  <div className={`w-3 h-[1px] ${isDone ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-white/[0.1]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
