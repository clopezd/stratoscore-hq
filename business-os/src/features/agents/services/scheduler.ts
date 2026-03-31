import { runAgent } from './run-agent'
import { DAILY_EXECUTION_ORDER, WEEKLY_AGENTS, AGENTS } from '../config/agents'
import { createServiceClient } from '@/lib/supabase/service'
import type { AgentSlug, AgentRunResult } from '../types'

/**
 * Registra la ejecución de un agente como tarea en el board.
 * Tareas completadas se marcan como 'done', fallidas como 'backlog'.
 */
async function logAgentTask(result: AgentRunResult): Promise<void> {
  try {
    const supabase = createServiceClient()
    const config = AGENTS[result.agent]
    const title = `${config?.emoji ?? ''} ${config?.name ?? result.agent}: ${result.success ? 'Ejecución completada' : 'Error en ejecución'}`

    await supabase.from('tasks').insert({
      title,
      description: result.success
        ? result.report?.substring(0, 500) ?? 'Ejecución exitosa'
        : `Error: ${result.error}`,
      status: result.success ? 'done' : 'todo',
      tags: ['agente', result.agent, result.success ? 'completado' : 'error'],
    })
  } catch {
    // No bloquear el pipeline si falla el registro
  }
}

/**
 * Ejecuta la cadena diaria de agentes en orden.
 * Cada agente espera al anterior (pipeline secuencial).
 */
export async function runDailyPipeline(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []

  for (const slug of DAILY_EXECUTION_ORDER) {
    const result = await runAgent(slug)
    results.push(result)
    await logAgentTask(result)

    // Si el Collector falla, no tiene sentido correr el resto
    if (slug === 'collector' && !result.success) {
      const aborted: AgentRunResult = {
        agent: 'analyst' as AgentSlug,
        success: false,
        error: 'Abortado: Collector falló',
        duration_ms: 0,
      }
      results.push(aborted)
      await logAgentTask(aborted)
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
    await logAgentTask(result)
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
  const result = await runAgent(slug, prompt)
  await logAgentTask(result)
  return result
}
