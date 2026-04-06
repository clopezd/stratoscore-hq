import { generateText, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { getSystemPrompt } from '../config/prompts'
import { getToolsForAgent } from '../tools/definitions'
import { AGENTS } from '../config/agents'
import type { AgentSlug, AgentRunResult } from '../types'

// OpenRouter con modelo gratuito — $0 costo
// .chat() fuerza Chat Completions API (OpenRouter devuelve 400 con Responses API)
function getModel() {
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })
  const modelId = process.env.AGENT_MODEL ?? 'google/gemini-2.5-flash'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (openrouter as any).chat(modelId)
}

export async function runAgent(
  slug: AgentSlug,
  userMessage?: string,
  previousContext?: string
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
  let prompt = userMessage ?? `Ejecuta tu análisis diario. Fecha: ${today}. Usa tus tools para obtener datos reales y genera tu reporte.`

  // Context chain: inyectar output de agentes anteriores
  if (previousContext) {
    prompt = `${prompt}\n\n---\nCONTEXTO DE AGENTES ANTERIORES EN EL PIPELINE:\n${previousContext}\n---\nUsa este contexto para informar tu análisis. No repitas lo que ya dijeron — agrega valor nuevo.`
  }

  try {
    const result = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt,
      tools,
      stopWhen: stepCountIs(15),
      temperature: 0.3,
      maxTokens: 4096,
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
