// ============================================================
// Telegram Notify — Alertas de leads/citas a Carlos via bot StratosCore
// Fire-and-forget desde endpoints publicos. Nunca debe romper el flow.
// ============================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

interface NewLeadAlert {
  nombre: string
  telefono: string
  email?: string
  tipo_estudio: string
  fecha: string
  hora: string
  esPromo: boolean
  huliAppointmentId?: string | number
  fuente?: string
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, (c) => `\\${c}`)
}

export async function notifyNewLead(lead: NewLeadAlert): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram-notify] Skipping: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing')
    return
  }

  const tipo = lead.esPromo
    ? '🎁 *PROMO Mamo \\+ US*'
    : lead.tipo_estudio === 'mamografia'
      ? '📷 Mamografía 3D'
      : '🔊 Ultrasonido de mama'

  const lines = [
    '🩺 *Nueva cita MedCare*',
    '',
    `${tipo} — *₡${lead.esPromo ? '65,000' : lead.tipo_estudio === 'mamografia' ? '35,000' : '49,000'}*`,
    '',
    `👤 ${escapeMarkdown(lead.nombre)}`,
    `📱 \`${escapeMarkdown(lead.telefono)}\``,
    lead.email ? `✉️ ${escapeMarkdown(lead.email)}` : null,
    `📅 ${escapeMarkdown(lead.fecha)} a las ${escapeMarkdown(lead.hora.substring(0, 5))}`,
    lead.huliAppointmentId ? `🔗 Huli: \`${lead.huliAppointmentId}\`` : null,
    lead.fuente ? `📊 Fuente: ${escapeMarkdown(lead.fuente)}` : null,
  ].filter(Boolean).join('\n')

  // Acortar telefono a wa.me link (asumir CR si son 8 digitos)
  const digits = lead.telefono.replace(/\D/g, '')
  const waPhone = digits.length === 8 ? `506${digits}` : digits
  const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${lead.nombre.split(' ')[0]}, le escribo de MedCare para confirmar su cita.`)}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: lines,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            { text: '💬 Escribir por WhatsApp', url: waLink },
            { text: '📊 Abrir CRM', url: 'https://portal.medcare.cr/medcare' },
          ]],
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
  } catch (err) {
    // Nunca propagar errores al endpoint principal
    console.error('[telegram-notify] Failed to send alert:', err)
  }
}
