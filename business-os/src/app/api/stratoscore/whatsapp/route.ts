import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/features/stratoscore-agent/engine'

/**
 * WhatsApp Webhook — StratosCore Corporativo
 *
 * GET  → Verificación del webhook (Meta lo requiere)
 * POST → Mensajes entrantes → Conversation Engine → respuesta por WhatsApp
 *
 * Self-contained: llama OpenRouter directo, sin agent-server.
 *
 * Variables requeridas:
 *   STRATOSCORE_WA_PHONE_NUMBER_ID
 *   STRATOSCORE_WA_ACCESS_TOKEN
 *   STRATOSCORE_WA_VERIFY_TOKEN
 */

const WHATSAPP_API = 'https://graph.facebook.com/v21.0'

// ── GET: Verificación ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.STRATOSCORE_WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST: Mensajes entrantes ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message || message.type !== 'text') {
      return NextResponse.json({ received: true })
    }

    const from = message.from as string
    const text = (message.text?.body || '').trim()
    if (!text) return NextResponse.json({ received: true })

    console.log(`[WA] ${from}: "${text.slice(0, 80)}"`)

    // Process with engine
    let replyText: string
    try {
      const result = await processMessage(`wa_${from}`, text)
      replyText = result.message

      // Notify Carlos if hot lead
      if (result.shouldNotify) {
        notifyTelegram(from, text, result.leadScore, result.notifyReason || 'Lead cualificado')
          .catch(() => {})
      }
    } catch {
      replyText = 'El agente no está disponible. Contacta a carlos@stratoscore.app'
    }

    // Convert markdown for WhatsApp (*bold* instead of **bold**)
    const waText = replyText
      .replace(/\*\*(.+?)\*\*/g, '*$1*')
      .replace(/#{1,3}\s/g, '')
      .slice(0, 4096)

    await sendWhatsApp(from, waText)

    return NextResponse.json({ received: true, action: 'replied' })
  } catch (error) {
    console.error('[WA] Webhook error:', error)
    return NextResponse.json({ received: true })
  }
}

// ── Send WhatsApp message ──────────────────────────────────────

async function sendWhatsApp(to: string, text: string): Promise<void> {
  const phoneNumberId = process.env.STRATOSCORE_WA_PHONE_NUMBER_ID
  const accessToken = process.env.STRATOSCORE_WA_ACCESS_TOKEN
  if (!phoneNumberId || !accessToken) return

  const res = await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('[WA] Send error:', err.error?.message || res.status)
  }
}

// ── Telegram notification ──────────────────────────────────────

async function notifyTelegram(phone: string, msg: string, score: number, reason: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return

  const text = [
    `🔔 <b>Lead WhatsApp — ${reason}</b>`,
    `📱 ${phone}`,
    `📊 Score: ${score}/100`,
    `💬 <i>"${msg.slice(0, 200)}"</i>`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    signal: AbortSignal.timeout(5_000),
  })
}
