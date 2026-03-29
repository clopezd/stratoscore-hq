'use client'

import { useState } from 'react'
import { AGENTS } from '../config/agents'
import type { AgentSlug } from '../types'

const ALL_SLUGS: AgentSlug[] = ['cpo', 'cmo', 'cfo', 'cto', 'ceo', 'strategist', 'collector', 'analyst', 'journalist', 'cleanup']

interface IdeaConsoleProps {
  onResult: (slug: AgentSlug, report: string) => void
}

export function IdeaConsole({ onResult }: IdeaConsoleProps) {
  const [prompt, setPrompt] = useState('')
  const [selected, setSelected] = useState<AgentSlug[]>(['cpo', 'cmo', 'cfo'])
  const [running, setRunning] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<Record<string, { success: boolean; report?: string; error?: string }>>({})

  const toggleAgent = (slug: AgentSlug) => {
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const runSelected = async () => {
    if (!prompt.trim() || selected.length === 0) return

    setResults({})
    setRunning(new Set(selected))

    // Run all selected agents in parallel
    const promises = selected.map(async (slug) => {
      try {
        const res = await fetch(`/api/agents/${slug}`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer tumision_2026',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompt.trim() }),
        })
        const data = await res.json()
        setRunning(prev => { const next = new Set(prev); next.delete(slug); return next })
        setResults(prev => ({ ...prev, [slug]: data }))
        if (data.success && data.report) {
          onResult(slug, data.report)
        }
      } catch (err) {
        setRunning(prev => { const next = new Set(prev); next.delete(slug); return next })
        setResults(prev => ({
          ...prev,
          [slug]: { success: false, error: err instanceof Error ? err.message : 'Error' },
        }))
      }
    })

    await Promise.all(promises)
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">💡 Consultar a los Agentes</h3>
      <p className="text-xs text-gray-500 dark:text-white/40 mb-4">Describe tu idea y elige qué agentes la analizan</p>

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe tu idea, problema o pregunta..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      {/* Agent selector */}
      <div className="mt-3 mb-4">
        <p className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2">Selecciona agentes</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SLUGS.map(slug => {
            const agent = AGENTS[slug]
            const isSelected = selected.includes(slug)
            const isRunning = running.has(slug)
            const result = results[slug]

            return (
              <button
                key={slug}
                onClick={() => toggleAgent(slug)}
                disabled={running.size > 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isRunning
                    ? 'bg-amber-100 border border-amber-300 text-amber-700 dark:bg-amber-400/20 dark:border-amber-400/30 dark:text-amber-300 animate-pulse'
                    : result?.success
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 dark:bg-emerald-400/20 dark:border-emerald-400/30 dark:text-emerald-300'
                      : result && !result.success
                        ? 'bg-red-100 border border-red-300 text-red-700 dark:bg-red-400/20 dark:border-red-400/30 dark:text-red-300'
                        : isSelected
                          ? 'bg-indigo-100 border border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300'
                          : 'bg-gray-50 border border-gray-200 text-gray-500 dark:bg-white/[0.03] dark:border-white/[0.07] dark:text-white/40'
                } disabled:cursor-not-allowed`}
              >
                <span>{agent.emoji}</span>
                <span>{agent.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runSelected}
        disabled={!prompt.trim() || selected.length === 0 || running.size > 0}
        className="w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {running.size > 0
          ? `⏳ ${running.size} agente${running.size > 1 ? 's' : ''} analizando...`
          : `🚀 Consultar ${selected.length} agente${selected.length > 1 ? 's' : ''}`
        }
      </button>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="mt-4 space-y-3">
          {Object.entries(results).map(([slug, result]) => {
            const agent = AGENTS[slug as AgentSlug]
            return (
              <div
                key={slug}
                className={`rounded-xl p-4 border ${
                  result.success
                    ? 'bg-gray-50 border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.06]'
                    : 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{agent.emoji}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{agent.name}</span>
                  {result.success && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Completado</span>
                  )}
                </div>
                {result.success && result.report ? (
                  <div className="text-sm text-gray-700 dark:text-white/70 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {result.report}
                  </div>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
