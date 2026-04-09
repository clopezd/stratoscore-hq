import { NextRequest, NextResponse } from 'next/server'
import { processHuliWebhook } from '@/features/medcare/services/syncService'
import type { HuliWebhookPayload } from '@/features/medcare/lib/huli-types'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/features/medcare/lib/rate-limiter'

/**
 * POST /api/medcare/webhooks/huli
 * Recibe webhooks de HuliPractice:
 * - APPOINTMENT_CREATED
 * - APPOINTMENT_UPDATED
 * - APPOINTMENT_CANCELLED
 * - APPOINTMENT_RESCHEDULED
 * - CHECKUP_CREATED
 * - CHECKUP_UPDATED
 *
 * Setup: Solicitar suscripción a soporte@hulipractice.com
 * con la URL de este endpoint y método de auth.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 100 req/min
    const ip = getClientIP(request)
    const limit = checkRateLimit(`webhook:${ip}`, RATE_LIMITS.webhook)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Verificar webhook auth si está configurado
    const webhookSecret = process.env.HULI_WEBHOOK_SECRET
    if (webhookSecret) {
      const authHeader = request.headers.get('authorization')
      const signature = request.headers.get('x-webhook-signature')
        || request.headers.get('x-huli-signature')

      const isValid = (authHeader === `Bearer ${webhookSecret}`)
        || (signature === webhookSecret)

      if (!isValid) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
      }
    }

    const payload: HuliWebhookPayload = await request.json()

    // Validar estructura mínima
    if (!payload.event || !payload.data?.id_event) {
      return NextResponse.json(
        { error: 'Invalid payload: missing event or id_event' },
        { status: 400 }
      )
    }

    // Solo procesar eventos de appointment por ahora
    if (payload.event.startsWith('APPOINTMENT_')) {
      const result = await processHuliWebhook(payload)
      return NextResponse.json({ received: true, ...result })
    }

    // Checkup events — loguear pero no procesar aún
    return NextResponse.json({ received: true, action: 'logged_only' })
  } catch (error) {
    console.error('[MedCare Webhook] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET para verificación del endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'medcare-huli-webhook',
    version: '2.0.0',
    events: [
      'APPOINTMENT_CREATED',
      'APPOINTMENT_UPDATED',
      'APPOINTMENT_CANCELLED',
      'APPOINTMENT_RESCHEDULED',
      'CHECKUP_CREATED',
      'CHECKUP_UPDATED',
    ],
  })
}
