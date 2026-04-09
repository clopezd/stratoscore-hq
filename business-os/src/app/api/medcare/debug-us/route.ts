import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'

const CLINIC_ID = Number(process.env.HULI_CLINIC_ID || '9694')
const RADIOLOGOS_US = [49493, 18828, 14145, 97620]

/**
 * GET /api/medcare/debug-us?fecha=2026-04-15&hora=17:30:00
 * Diagnóstico: muestra disponibilidad de radiólogos para ultrasonido
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
  const hora = searchParams.get('hora') || '10:00:00'

  const [h, m] = hora.split(':').map(Number)
  const targetMin = h * 60 + m + 30

  const huli = HuliConnector.getInstance()
  const dayStart = `${fecha}T00:00:00`
  const dayEnd = `${fecha}T23:59:59`

  const results: Record<string, unknown> = {}

  for (const radioId of RADIOLOGOS_US) {
    try {
      const availability = await huli.getAvailability(
        String(radioId), String(CLINIC_ID), dayStart, dayEnd
      )

      const allSlotDates = availability.slotDates || []
      const allSlots = allSlotDates.flatMap(sd => sd.slots || [])

      // Filtrar slots cercanos al target
      const nearbySlots = allSlots.filter(slot => {
        if (!slot.dateTime) return false
        const slotDate = new Date(slot.dateTime)
        const slotMin = slotDate.getHours() * 60 + slotDate.getMinutes()
        const diff = slotMin - targetMin
        return diff >= -10 && diff <= 60
      })

      results[`radio_${radioId}`] = {
        totalSlotDates: allSlotDates.length,
        totalSlots: allSlots.length,
        slotsNearTarget: nearbySlots.length,
        targetTime: `${String(Math.floor(targetMin / 60)).padStart(2, '0')}:${String(targetMin % 60).padStart(2, '0')}`,
        nearbySlots: nearbySlots.map(s => ({
          dateTime: s.dateTime,
          sourceEvent: s.sourceEvent,
          time: s.time,
          timeL10n: s.timeL10n,
        })),
        allSlotsSample: allSlots.slice(0, 5).map(s => ({
          dateTime: s.dateTime,
          sourceEvent: s.sourceEvent,
          timeL10n: s.timeL10n,
        })),
      }
    } catch (err) {
      results[`radio_${radioId}`] = {
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  return NextResponse.json({
    fecha,
    horaBase: hora,
    targetUS: `${String(Math.floor(targetMin / 60)).padStart(2, '0')}:${String(targetMin % 60).padStart(2, '0')}`,
    clinicId: CLINIC_ID,
    radiologos: results,
  })
}
