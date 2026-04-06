import { runAgent } from './run-agent'
import { DAILY_EXECUTION_ORDER, WEEKLY_AGENTS } from '../config/agents'
import type { AgentSlug, AgentRunResult } from '../types'

/**
 * Ejecuta la cadena diaria de agentes en orden con CONTEXT CHAIN.
 * Cada agente recibe el output acumulado de los anteriores.
 */
export async function runDailyPipeline(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []
  let accumulatedContext = ''

  for (const slug of DAILY_EXECUTION_ORDER) {
    const result = await runAgent(slug, undefined, accumulatedContext || undefined)
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

    // Acumular contexto para el siguiente agente
    if (result.success && result.report) {
      const config = (await import('../config/agents')).AGENTS[slug]
      accumulatedContext += `\n\n### ${config.emoji} ${config.name} (${slug}):\n${result.report}`
    }
  }

  return results
}

/**
 * Ejecuta los agentes semanales (domingos) con context chain.
 * Cleanup primero, Estratega después, CDO al final.
 */
export async function runWeeklyPipeline(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []
  let accumulatedContext = ''

  for (const slug of WEEKLY_AGENTS) {
    const result = await runAgent(slug, undefined, accumulatedContext || undefined)
    results.push(result)

    if (result.success && result.report) {
      const config = (await import('../config/agents')).AGENTS[slug]
      accumulatedContext += `\n\n### ${config.emoji} ${config.name} (${slug}):\n${result.report}`
    }
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
