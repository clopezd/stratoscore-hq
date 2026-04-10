/**
 * Conversation Engine — Self-contained, persisted to Supabase
 *
 * Calls OpenRouter directly from Next.js API routes.
 * Sessions persisted to Supabase chat_sessions table.
 * In-memory cache for hot sessions (reduces DB reads).
 */

import { AGENT_SYSTEM_PROMPT } from './knowledge-base'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// TYPES
// ============================================================

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

interface Session {
  id: string
  channel: 'web' | 'whatsapp'
  messages: ConversationTurn[]
  leadScore: number
  leadName: string | null
  leadEmail: string | null
  leadPhone: string | null
  status: 'active' | 'closed' | 'escalated'
}

export interface EngineResponse {
  message: string
  leadScore: number
  shouldNotify: boolean
  notifyReason?: string
  suggestedActions: string[]
  sessionId: string
}

// ============================================================
// SUPABASE CLIENT (service role — bypasses RLS)
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ============================================================
// SESSION MANAGEMENT (Supabase + in-memory cache)
// ============================================================

const cache = new Map<string, { session: Session; cachedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 min cache

async function getOrCreateSession(sessionId: string, channel: 'web' | 'whatsapp'): Promise<Session> {
  // Check cache
  const cached = cache.get(sessionId)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.session
  }

  // Check Supabase
  const sb = getSupabase()
  if (sb) {
    const { data } = await sb
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (data) {
      const session: Session = {
        id: data.id,
        channel: data.channel,
        messages: (data.messages || []) as ConversationTurn[],
        leadScore: data.lead_score || 0,
        leadName: data.lead_name,
        leadEmail: data.lead_email,
        leadPhone: data.lead_phone,
        status: data.status || 'active',
      }
      cache.set(sessionId, { session, cachedAt: Date.now() })
      return session
    }
  }

  // Create new
  const session: Session = {
    id: sessionId,
    channel,
    messages: [],
    leadScore: 0,
    leadName: null,
    leadEmail: null,
    leadPhone: null,
    status: 'active',
  }

  if (sb) {
    await sb.from('chat_sessions').upsert({
      id: sessionId,
      channel,
      messages: [],
      lead_score: 0,
      status: 'active',
    })
  }

  cache.set(sessionId, { session, cachedAt: Date.now() })
  return session
}

async function persistSession(session: Session): Promise<void> {
  // Keep last 20 turns
  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20)
  }

  cache.set(session.id, { session, cachedAt: Date.now() })

  const sb = getSupabase()
  if (!sb) return

  await sb.from('chat_sessions').upsert({
    id: session.id,
    channel: session.channel,
    messages: session.messages,
    lead_score: session.leadScore,
    lead_name: session.leadName,
    lead_email: session.leadEmail,
    lead_phone: session.leadPhone,
    status: session.status,
    updated_at: new Date().toISOString(),
  })
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
// LEAD SCORING (BANT) + CONTACT EXTRACTION
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

function extractContactInfo(messages: ConversationTurn[]): {
  email?: string; name?: string; phone?: string
} {
  const text = messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0]
  const phone = text.match(/(?:\+?506)?[\s-]?\d{4}[\s-]?\d{4}/)?.[0]
  const nameMatch = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)/i)
  return { email: email || undefined, name: nameMatch?.[1], phone: phone || undefined }
}

// ============================================================
// MAIN
// ============================================================

export async function processMessage(
  sessionId: string,
  userMessage: string,
  channel: 'web' | 'whatsapp' = 'web',
): Promise<EngineResponse> {
  const session = await getOrCreateSession(sessionId, channel)

  // Add user message
  session.messages.push({ role: 'user', content: userMessage, ts: new Date().toISOString() })

  // Build LLM messages
  const llmMessages = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    ...session.messages.map(t => ({ role: t.role, content: t.content })),
  ]

  // Call LLM
  const reply = await callLLM(llmMessages)

  // Save assistant response
  session.messages.push({ role: 'assistant', content: reply, ts: new Date().toISOString() })

  // Score + extract contact
  const leadScore = scoreLead(session.messages)
  session.leadScore = leadScore

  const contact = extractContactInfo(session.messages)
  if (contact.email) session.leadEmail = contact.email
  if (contact.name) session.leadName = contact.name
  if (contact.phone) session.leadPhone = contact.phone

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

  if (shouldNotify) session.status = 'escalated'

  // Persist to Supabase
  await persistSession(session)

  // Suggested actions
  const userCount = session.messages.filter(m => m.role === 'user').length
  const suggestedActions = userCount <= 1
    ? ['Ver casos de éxito', 'Conocer precios', 'Agendar demo']
    : leadScore >= 60
      ? ['Agendar llamada con Carlos', 'Enviar specs por email']
      : ['Ver precios', 'Agendar demo']

  return { message: reply, leadScore, shouldNotify, notifyReason, suggestedActions, sessionId }
}
