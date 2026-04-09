import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/features/stratoscore-agent/engine'

/**
 * POST /api/stratoscore/chat — Agente de ventas StratosCore
 *
 * NO requiere autenticación (widget público de la landing).
 * Llama a OpenRouter directo — sin dependencia de agent-server.
 *
 * Body: { message: string, sessionId?: string }
 * Response: { success, data: { message, suggestedActions, leadScore, shouldNotify } }
 */

// Simple rate limiting per IP
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 10) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Demasiados mensajes. Espera un momento.' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 })
  }

  const message = body['message']
  if (!message || typeof message !== 'string' || message.length > 2000) {
    return NextResponse.json(
      { success: false, error: 'Campo requerido: message (max 2000 chars)' },
      { status: 400 },
    )
  }

  const sessionId = typeof body['sessionId'] === 'string'
    ? body['sessionId']
    : `web_${ip}_${Date.now()}`

  try {
    const result = await processMessage(sessionId, message.trim())

    // Notify Carlos via Telegram if lead is hot
    if (result.shouldNotify) {
      notifyTelegram(result.notifyReason || 'Lead cualificado', message, result.leadScore)
        .catch(() => {}) // fire and forget
    }

    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        suggestedActions: result.suggestedActions,
        leadScore: result.leadScore,
        shouldNotify: result.shouldNotify,
      },
    })
  } catch (err) {
    console.error('[StratosCore Chat]', err)
    return NextResponse.json(
      { success: false, error: 'Error procesando mensaje. Contacta carlos@stratoscore.app' },
      { status: 500 },
    )
  }
}

// ── Telegram notification (fire-and-forget) ───────────────────

async function notifyTelegram(reason: string, lastMessage: string, score: number): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return

  const text = [
    `🔔 <b>Lead desde web — ${reason}</b>`,
    `📊 Score: ${score}/100`,
    `💬 <i>"${lastMessage.slice(0, 200)}"</i>`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    signal: AbortSignal.timeout(5_000),
  })
}
