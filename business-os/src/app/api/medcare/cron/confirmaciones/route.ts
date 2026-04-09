import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { createClient } from '@supabase/supabase-js'
import { sendTextMessage, mensajeConfirmacion, isWhatsAppConfigured } from '@/features/medcare/lib/whatsapp/whatsapp-client'

const MAMOGRAFIA_DOCTOR_ID = process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314'

/**
 * GET /api/medcare/cron/confirmaciones
 * Cron: enviar confirmación WhatsApp a citas de mañana sin confirmar
 * Ejecutar diario a las 8am Costa Rica (14:00 UTC)
 */
export async function GET(request: NextRequest) {
  // Verificar cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isWhatsAppConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'WhatsApp no configurado' })
  }

  try {
    const huli = HuliConnector.getInstance()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Obtener citas de mañana del mamógrafo
    const data = await huli.listDoctorAppointments(
      MAMOGRAFIA_DOCTOR_ID,
      `${tomorrowStr}T00:00:00Z`,
      `${tomorrowStr}T23:59:59Z`,
      { limit: 20 }
    )

    const sinConfirmar = (data.appointments || []).filter(
      a => a.statusAppointment === 'BOOKED' && !a.isConfirmedByPatient && a.idPatientFile
    )

    if (sinConfirmar.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No hay citas sin confirmar para mañana' })
    }

    // Buscar teléfonos de los pacientes en Supabase (leads que tienen huli_appointment_id)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let enviados = 0
    const errores: string[] = []

    for (const cita of sinConfirmar) {
      const { data: lead } = await supabase
        .from('medcare_leads')
        .select('nombre, telefono')
        .eq('huli_appointment_id', cita.idEvent)
        .single()

      if (!lead?.telefono) continue

      const fechaFormateada = new Date(tomorrowStr).toLocaleDateString('es-CR', {
        weekday: 'long', day: 'numeric', month: 'long'
      })

      const result = await sendTextMessage(
        lead.telefono,
        mensajeConfirmacion(lead.nombre, fechaFormateada, cita.timeFrom?.substring(0, 5) || '')
      )

      if (result.success) {
        enviados++
      } else {
        errores.push(`${lead.nombre}: ${result.error}`)
      }
    }

    return NextResponse.json({
      sent: enviados,
      total: sinConfirmar.length,
      errors: errores.length > 0 ? errores : undefined,
    })
  } catch (error) {
    console.error('[MedCare Cron Confirmaciones] Error:', error)
    return NextResponse.json({ error: 'Error en cron' }, { status: 500 })
  }
}
