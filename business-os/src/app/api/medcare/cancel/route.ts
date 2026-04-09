import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'

/**
 * POST /api/medcare/cancel
 * Cancela una cita en Huli indicando si fue por paciente o doctor
 * Body: { eventId: string, canceladoPor: 'paciente' | 'doctor' }
 */
export async function POST(request: NextRequest) {
  try {
    const { eventId, canceladoPor } = await request.json()

    if (!eventId || !canceladoPor) {
      return NextResponse.json(
        { error: 'eventId y canceladoPor son requeridos' },
        { status: 400 }
      )
    }

    const huli = HuliConnector.getInstance()
    const byPatient = canceladoPor === 'paciente'

    const appointment = await huli.cancelAppointment(eventId, byPatient)

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.idEvent,
        status: appointment.statusAppointment,
        canceladoPor,
      },
    })
  } catch (error) {
    console.error('[MedCare Cancel] Error:', error)
    const message = error instanceof Error ? error.message : 'Error cancelando cita'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
