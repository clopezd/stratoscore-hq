import { createOpenAI } from '@ai-sdk/openai'

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://stratoscore.app',
    'X-Title': 'FitSync AI',
  },
})

export const MODELS = {
  /** Free, fast — food analysis, sync engine */
  fast: 'google/gemini-2.0-flash-exp:free',
  /** Balanced — workout generation, complex analysis */
  balanced: 'google/gemini-2.5-flash',
  /** Premium — high accuracy food analysis for paid users */
  premium: 'openai/gpt-4o',
} as const
