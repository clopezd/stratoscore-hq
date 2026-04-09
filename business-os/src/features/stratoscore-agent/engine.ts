/**
 * Conversation Engine — Self-contained (no dependency on agent-server)
 *
 * Calls OpenRouter directly from Next.js API routes.
 * Sessions stored in-memory with TTL (Vercel serverless = ephemeral).
 * For persistent sessions, upgrade to Supabase table.
 */

import { AGENT_SYSTEM_PROMPT } from './knowledge-base'

// ============================================================
// TYPES
// ============================================================

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

interface Session {
  messages: ConversationTurn[]
  leadScore: number
  updatedAt: number
}

export interface EngineResponse {
  message: string
  leadScore: number
  shouldNotify: boolean
  notifyReason?: string
  suggestedActions: string[]
}

// ============================================================
// IN-MEMORY SESSION STORE (TTL 30 min for serverless)
// ============================================================

const sessions = new Map<string, Session>()
const SESSION_TTL = 30 * 60 * 1000 // 30 min

function getSession(sessionId: string): Session {
  const existing = sessions.get(sessionId)
  if (existing && Date.now() - existing.updatedAt < SESSION_TTL) {
    return existing
  }
  const fresh: Session = { messages: [], leadScore: 0, updatedAt: Date.now() }
  sessions.set(sessionId, fresh)
  return fresh
}

function saveSession(sessionId: string, session: Session): void {
  session.updatedAt = Date.now()
  // Keep only last 16 turns to control token usage
  if (session.messages.length > 16) {
    session.messages = session.messages.slice(-16)
  }
  sessions.set(sessionId, session)

  // Cleanup expired sessions every 50 calls
  if (Math.random() < 0.02) {
    const now = Date.now()
    for (const [key, s] of sessions) {
      if (now - s.updatedAt > SESSION_TTL) sessions.delete(key)
    }
  }
}

// ============================================================
// LLM CALL (OpenRouter)
// ============================================================

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-2.5-flash'

async function callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('[StratosCore Agent] OPENROUTER_API_KEY not set')
    return 'Disculpa, el agente no está disponible. Contacta a carlos@stratoscore.app.'
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stratoscore.app',
      'X-Title': 'StratosCore Sales Agent',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(25_000),
  })

  if (!res.ok) {
    console.error('[StratosCore Agent] OpenRouter error:', res.status)
    return 'Hubo un error. Intenta de nuevo o contacta a carlos@stratoscore.app.'
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return data.choices?.[0]?.message?.content?.trim()
    || 'No pude generar una respuesta. Contacta a carlos@stratoscore.app.'
}

// ============================================================
// LEAD SCORING (BANT)
// ============================================================

function scoreLead(messages: ConversationTurn[]): number {
  let score = 30
  const allText = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ')

  if (/presupuesto|inversión|budget/.test(allText)) score += 10
  if (/precio|cuánto cuesta|costo|cotización/.test(allText)) score += 5
  if (/soy (ceo|founder|dueño|gerente|director|socio)/.test(allText)) score += 20
  if (/decisión|aprobación|mi empresa|mi negocio/.test(allText)) score += 10
  if (/urgente|necesito ya|lo antes posible/.test(allText)) score += 15
  if (/tengo un proyecto|necesito (desarrollar|construir|crear|sistema|app|software)/.test(allText)) score += 10
  if (/este mes|esta semana/.test(allText)) score += 15
  if (/demo|agendar|llamada|reunión|propuesta|cotiza/.test(allText)) score += 20
  if (/@[a-z]/.test(allText)) score += 10
  if (/\d{8,}/.test(allText)) score += 10

  const userCount = messages.filter(m => m.role === 'user').length
  score += Math.min(userCount * 3, 15)

  return Math.min(score, 100)
}

// ============================================================
// MAIN
// ============================================================

export async function processMessage(
  sessionId: string,
  userMessage: string,
): Promise<EngineResponse> {
  const session = getSession(sessionId)

  // Add user message
  session.messages.push({ role: 'user', content: userMessage })

  // Build LLM messages
  const llmMessages = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    ...session.messages.map(t => ({ role: t.role, content: t.content })),
  ]

  // Call LLM
  const reply = await callLLM(llmMessages)

  // Save assistant response
  session.messages.push({ role: 'assistant', content: reply })

  // Score
  const leadScore = scoreLead(session.messages)
  session.leadScore = leadScore
  saveSession(sessionId, session)

  // Notification check
  const lastUserMsg = userMessage.toLowerCase()
  let shouldNotify = leadScore >= 70
  let notifyReason = shouldNotify ? `Lead score alto (${leadScore}/100)` : undefined

  if (!shouldNotify && /demo|agendar|llamada|reunión/.test(lastUserMsg)) {
    shouldNotify = true
    notifyReason = 'Solicitó demo/llamada'
  }
  if (!shouldNotify && /cotiza|propuesta|presupuesto/.test(lastUserMsg)) {
    shouldNotify = true
    notifyReason = 'Pidió cotización/propuesta'
  }

  // Suggested actions
  const userCount = session.messages.filter(m => m.role === 'user').length
  const suggestedActions = userCount <= 1
    ? ['Ver casos de éxito', 'Conocer precios', 'Agendar demo']
    : leadScore >= 60
      ? ['Agendar llamada con Carlos', 'Enviar specs por email']
      : ['Ver precios', 'Agendar demo']

  return { message: reply, leadScore, shouldNotify, notifyReason, suggestedActions }
}
