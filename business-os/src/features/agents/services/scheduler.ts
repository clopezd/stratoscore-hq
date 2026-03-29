import { runAgent } from './run-agent'
import { DAILY_EXECUTION_ORDER, WEEKLY_AGENTS } from '../config/agents'
import type { AgentSlug, AgentRunResult } from '../types'

/**
 * Ejecuta la cadena diaria de agentes en orden.
 * Cada agente espera al anterior (pipeline secuencial).
 */
export async function runDailyPipeline(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []

  for (const slug of DAILY_EXECUTION_ORDER) {
    const result = await runAgent(slug)
    results.push(result)

    // Si el Collector falla, no tiene sentido correr el resto
    if (slug === 'collector' && !result.success) {
      results.push({
        agent: 'analyst' as AgentSlug,
        success: false,
        error: 'Abortado: Collector falló',
        duration_ms: 0,
      })
      break
    }
  }

  return results
}

/**
 * Ejecuta los agentes semanales (domingos).
 * Cleanup primero, Estratega después.
 */
export async function runWeeklyPipeline(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []

  for (const slug of WEEKLY_AGENTS) {
    const result = await runAgent(slug)
    results.push(result)
  }

  return results
}

/**
 * Ejecuta un solo agente por slug.
 * Útil para invocación manual desde el dashboard o API.
 */
export async function runSingleAgent(
  slug: AgentSlug,
  prompt?: string
): Promise<AgentRunResult> {
  return runAgent(slug, prompt)
}
