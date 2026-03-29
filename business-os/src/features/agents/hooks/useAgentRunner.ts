'use client'

import { useState, useCallback } from 'react'
import type { AgentSlug } from '../types'

interface AgentRunState {
  running: boolean
  result: { success: boolean; report?: string; error?: string; duration_ms?: number } | null
}

export function useAgentRunner() {
  const [states, setStates] = useState<Record<string, AgentRunState>>({})
  const [pipelineRunning, setPipelineRunning] = useState(false)

  const runAgent = useCallback(async (slug: AgentSlug) => {
    setStates(prev => ({ ...prev, [slug]: { running: true, result: null } }))

    try {
      const res = await fetch(`/api/agents/${slug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer tumision_2026`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      setStates(prev => ({ ...prev, [slug]: { running: false, result: data } }))
      return data
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error desconocido'
      setStates(prev => ({ ...prev, [slug]: { running: false, result: { success: false, error } } }))
    }
  }, [])

  const runPipeline = useCallback(async (type: 'daily' | 'weekly' = 'daily') => {
    setPipelineRunning(true)
    try {
      const res = await fetch('/api/agents/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer tumision_2026`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      // Update individual states from pipeline results
      if (data.results) {
        for (const r of data.results) {
          setStates(prev => ({
            ...prev,
            [r.agent]: { running: false, result: r },
          }))
        }
      }
      return data
    } finally {
      setPipelineRunning(false)
    }
  }, [])

  return { states, runAgent, runPipeline, pipelineRunning }
}
