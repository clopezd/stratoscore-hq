import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/features/medcare/lib/rate-limiter'

const MAMOGRAFIA_DOCTOR_ID = process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314'
const CLINIC_ID = process.env.HULI_CLINIC_ID || '9694'

/**
 * GET /api/medcare/availability?from=2026-04-09&to=2026-04-13&tipo=mamografia
 * Retorna slots disponibles del mamógrafo (o ultrasonido en el futuro)
 * Endpoint PÚBLICO — rate limited: 30 req/min por IP
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const limit = checkRateLimit(`availability:${ip}`, RATE_LIMITS.availability)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en unos minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      )
    }
    const { searchParams } = request.nextUrl
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parámetros from y to son requeridos (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    const fromISO = `${from}T00:00:00Z`
    const toISO = `${to}T23:59:59Z`

    const huli = HuliConnector.getInstance()
    const availability = await huli.getAvailability(
      MAMOGRAFIA_DOCTOR_ID,
      CLINIC_ID,
      fromISO,
      toISO
    )

    // Transformar a formato simple para el frontend
    const days = availability.slotDates
      .filter(d => d.slots && d.slots.length > 0)
      .map(d => ({
        date: d.date?.split('T')[0],
        label: d.dateL10n,
        labelFull: d.dateL10nComp,
        slots: (d.slots || []).map(s => ({
          time: s.timeL10n,
          dateTime: s.dateTime,
          sourceEvent: s.sourceEvent,
        })),
      }))

    return NextResponse.json({ days })
  } catch (error) {
    console.error('[MedCare Availability] Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg, days: [] },
      { status: 500 }
    )
  }
}
