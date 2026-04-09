// ============================================================
// WhatsApp Cloud API Client — Meta Business Platform
// Envía mensajes y templates via WhatsApp Business
// ============================================================

const WHATSAPP_API = 'https://graph.facebook.com/v21.0'

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
}

function getConfig(): WhatsAppConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN son requeridos')
  }

  return { phoneNumberId, accessToken }
}

// Normalizar teléfono CR a formato internacional (506XXXXXXXX)
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('506')) return digits
  if (digits.length === 8) return `506${digits}`
  return digits
}

// ── Enviar mensaje de texto ─────────────────────────────────

export async function sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig()
    const phone = normalizePhone(to)

    const response = await fetch(`${WHATSAPP_API}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Error enviando mensaje' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ── Enviar template (para mensajes fuera de ventana 24h) ────

export async function sendTemplate(
  to: string,
  templateName: string,
  language: string = 'es',
  components?: unknown[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = getConfig()
    const phone = normalizePhone(to)

    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
      },
    }

    if (components) {
      (body.template as Record<string, unknown>).components = components
    }

    const response = await fetch(`${WHATSAPP_API}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Error enviando template' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ── Mensajes predefinidos MedCare ───────────────────────────

export function mensajeConfirmacion(nombre: string, fecha: string, hora: string): string {
  return `Hola ${nombre}, le recordamos su cita mañana en MedCare Centro Médico.

📅 ${fecha}
🕐 ${hora}
📍 50m norte esquina NE Edificio Centro Colón, San José

¿Confirma su asistencia?
Responda *SÍ* para confirmar o *NO* para cancelar.

MedCare — Tel: 4070-0330`
}

export function mensajeRecordatorio2h(nombre: string, hora: string): string {
  return `Hola ${nombre}, su cita en MedCare es en 2 horas (${hora}).

📍 50m norte esquina NE Edificio Centro Colón, San José
📞 4070-0330

Lo esperamos.`
}

export function mensajeReengagement(nombre: string): string {
  return `Hola ${nombre}, notamos que tuvo que cancelar su cita en MedCare.

¿Desea reagendar? Tenemos disponibilidad esta semana.

Puede agendar aquí: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stratoscore.app'}/medcare/agendar-estudio

O escríbanos al 8368-2100 para coordinar.

MedCare Centro Médico`
}

export function mensajeRecordatorioAnual(nombre: string): string {
  return `Hola ${nombre}, han pasado 11 meses desde su última mamografía en MedCare.

La mamografía anual es su mejor herramienta de prevención.

¿Desea agendar su próxima cita?
Responda *SÍ* para agendar o visite: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stratoscore.app'}/medcare/agendar-estudio

MedCare Centro Médico — Tel: 4070-0330`
}

// ── Check si WhatsApp está configurado ──────────────────────

export function isWhatsAppConfigured(): boolean {
  return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN)
}
