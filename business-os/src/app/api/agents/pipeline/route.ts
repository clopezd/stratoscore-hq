import { NextRequest, NextResponse } from 'next/server'
import { runDailyPipeline, runWeeklyPipeline } from '@/features/agents/services/scheduler'
import { AGENTS } from '@/features/agents/config/agents'
import type { AgentRunResult } from '@/features/agents/types'

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const token = process.env.OPENCLAW_GATEWAY_TOKEN ?? 'tumision_2026'
  return auth === `Bearer ${token}`
}

/**
 * Formatea el reporte del pipeline para Telegram (profesional y conciso)
 */
function formatPipelineReport(type: string, results: AgentRunResult[], durationMs: number): string {
  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const date = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const durationMin = (durationMs / 60000).toFixed(1)

  const lines: string[] = []

  // Header
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`📊 **REPORTE C-SUITE ${type.toUpperCase()}**`)
  lines.push(`📅 ${date}`)
  lines.push(`⏱ ${durationMin} min · ✅ ${succeeded} · ❌ ${failed}`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push('')

  // Cada agente con su reporte resumido
  for (const r of results) {
    const config = AGENTS[r.agent as keyof typeof AGENTS]
    const emoji = config?.emoji ?? '🤖'
    const name = config?.name ?? r.agent

    if (r.success && r.report) {
      // Extraer las primeras líneas significativas del reporte (max ~300 chars)
      const reportClean = r.report
        .replace(/^##\s+.*$/gm, '') // quitar headers markdown
        .replace(/\|.*\|/g, '')     // quitar tablas
        .replace(/---+/g, '')       // quitar separadores
        .replace(/\n{3,}/g, '\n\n') // limpiar espacios
        .trim()

      const summary = reportClean.length > 400
        ? reportClean.slice(0, 400) + '...'
        : reportClean

      lines.push(`${emoji} **${name}**`)
      lines.push(summary)
      lines.push('')
    } else if (!r.success) {
      lines.push(`${emoji} **${name}** — ❌ ${r.error?.slice(0, 100) ?? 'Error'}`)
      lines.push('')
    }
  }

  // Footer
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`🏢 _StratosCore Business OS_`)

  return lines.join('\n')
}

/**
 * Envía reporte directo a Telegram vía Bot API (sin pasar por Claude)
 */
async function sendToTelegram(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('[pipeline] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados')
    return
  }

  // Convertir markdown básico a HTML de Telegram
  const html = message
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/_(.+?)_/g, '<i>$1</i>')

  // Telegram limita a 4096 chars por mensaje
  const chunks = html.match(/[\s\S]{1,4000}/g) ?? [html]

  for (const chunk of chunks) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'HTML',
        }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch (err) {
      console.error('[pipeline] Error enviando a Telegram:', err)
    }
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agents/pipeline',
    methods: ['POST'],
    usage: {
      daily: 'POST with body: {"type":"daily"}',
      weekly: 'POST with body: {"type":"weekly"}',
    },
    auth: 'Bearer token required in Authorization header',
    agents_daily: ['collector', 'analyst', 'cfo', 'cto', 'cmo', 'cpo', 'ceo', 'journalist'],
    agents_weekly: ['cleanup', 'strategist', 'cdo'],
  })
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const type = (body.type as string) ?? 'daily'

  const start = Date.now()

  let results
  if (type === 'weekly') {
    results = await runWeeklyPipeline()
  } else {
    results = await runDailyPipeline()
  }

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const durationMs = Date.now() - start

  // Enviar reporte a Telegram
  const telegramReport = formatPipelineReport(type, results, durationMs)
  sendToTelegram(telegramReport).catch(() => {}) // fire & forget

  return NextResponse.json({
    type,
    total: results.length,
    succeeded,
    failed,
    duration_ms: durationMs,
    results,
  })
}
