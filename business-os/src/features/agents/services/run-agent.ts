import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { getSystemPrompt } from '../config/prompts'
import { getToolsForAgent } from '../tools/definitions'
import { AGENTS } from '../config/agents'
import type { AgentSlug, AgentRunResult } from '../types'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function runAgent(
  slug: AgentSlug,
  userMessage?: string
): Promise<AgentRunResult> {
  const start = Date.now()
  const config = AGENTS[slug]

  if (!config) {
    return {
      agent: slug,
      success: false,
      error: `Agente "${slug}" no existe`,
      duration_ms: Date.now() - start,
    }
  }

  const systemPrompt = getSystemPrompt(slug)
  const tools = getToolsForAgent(slug, slug)

  const today = new Date().toISOString().split('T')[0]
  const prompt = userMessage ?? `Ejecuta tu análisis diario. Fecha: ${today}. Usa tus tools para obtener datos reales y genera tu reporte.`

  try {
    const result = await generateText({
      model: openrouter('google/gemini-2.0-flash-001'),
      system: systemPrompt,
      prompt,
      tools,
      maxSteps: 10,
    })

    return {
      agent: slug,
      success: true,
      report: result.text,
      duration_ms: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      agent: slug,
      success: false,
      error: message,
      duration_ms: Date.now() - start,
    }
  }
}
