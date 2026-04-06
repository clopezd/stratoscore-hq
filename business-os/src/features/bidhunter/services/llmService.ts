/**
 * BidHunter LLM Service
 *
 * Centraliza llamadas a OpenRouter con:
 * - Modelo económico primero (haiku), sonnet como fallback
 * - Retry con escalación automática tras 2 fallos de JSON parse
 * - Sin vision mode
 */

const CHEAP_MODEL = 'anthropic/claude-3-haiku'
const EXPENSIVE_MODEL = 'anthropic/claude-sonnet-4'
const MAX_CHEAP_RETRIES = 2

interface LLMCallOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  label?: string
  /** Skip cheap model, go straight to expensive (for complex tasks like PDF extraction) */
  forceExpensive?: boolean
}

interface LLMResult {
  content: string
  model: string
  escalated: boolean
}

async function callOpenRouter(
  model: string,
  prompt: string,
  maxTokens: number,
  temperature: number,
  label: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stratoscore.app',
      'X-Title': `BidHunter ${label}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenRouter ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Parse JSON from LLM response, stripping markdown code blocks.
 * Throws on invalid JSON.
 */
export function parseJSON<T = unknown>(raw: string): T {
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Call LLM with cheap model first, escalate to expensive after 2 JSON parse failures.
 */
export async function callWithFallback(opts: LLMCallOptions): Promise<LLMResult> {
  const { prompt, maxTokens = 800, temperature = 0.3, label = 'Call', forceExpensive = false } = opts

  // For complex tasks (PDF extraction), skip cheap model entirely
  if (forceExpensive) {
    const content = await callOpenRouter(EXPENSIVE_MODEL, prompt, maxTokens, temperature, label)
    return { content, model: EXPENSIVE_MODEL, escalated: false }
  }

  // Try cheap model up to MAX_CHEAP_RETRIES times
  for (let attempt = 0; attempt < MAX_CHEAP_RETRIES; attempt++) {
    try {
      const content = await callOpenRouter(CHEAP_MODEL, prompt, maxTokens, temperature, label)
      // Validate it's parseable JSON before returning
      parseJSON(content)
      return { content, model: CHEAP_MODEL, escalated: false }
    } catch (err) {
      const msg = (err as Error).message
      // If it's an API error (not JSON parse), don't retry with same model
      if (msg.startsWith('OpenRouter')) throw err
      console.log(`[LLM] ${label} attempt ${attempt + 1}/${MAX_CHEAP_RETRIES} with ${CHEAP_MODEL} failed: ${msg.slice(0, 100)}`)
    }
  }

  // Escalate to expensive model
  console.log(`[LLM] ${label} escalating to ${EXPENSIVE_MODEL}`)
  const content = await callOpenRouter(EXPENSIVE_MODEL, prompt, maxTokens, temperature, label)
  return { content, model: EXPENSIVE_MODEL, escalated: true }
}
