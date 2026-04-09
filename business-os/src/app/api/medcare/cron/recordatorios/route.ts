import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { createClient } from '@supabase/supabase-js'
import { sendTextMessage, mensajeRecordatorio2h, isWhatsAppConfigured } from '@/features/medcare/lib/whatsapp/whatsapp-client'

const MAMOGRAFIA_DOCTOR_ID = process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314'

/**
 * GET /api/medcare/cron/recordatorios
 * Cron: enviar recordatorio 2h antes a citas confirmadas de hoy
 * Ejecutar cada hora durante horario laboral (8am-5pm CR)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isWhatsAppConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'WhatsApp no configurado' })
  }

  try {
    const huli = HuliConnector.getInstance()
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Hora actual en Costa Rica (UTC-6)
    const crHour = (now.getUTCHours() - 6 + 24) % 24
    const targetHour = crHour + 2 // Citas en 2 horas

    const data = await huli.listDoctorAppointments(
      MAMOGRAFIA_DOCTOR_ID,
      `${todayStr}T00:00:00Z`,
      `${todayStr}T23:59:59Z`,
      { limit: 20 }
    )

    // Filtrar citas que son en ~2 horas (ventana de 1 hora)
    const citasEn2h = (data.appointments || []).filter(a => {
      if (a.statusAppointment !== 'BOOKED') return false
      const citaHour = parseInt(a.timeFrom?.substring(0, 2) || '0')
      return citaHour === targetHour && a.idPatientFile
    })

    if (citasEn2h.length === 0) {
      return NextResponse.json({ sent: 0, message: `No hay citas para las ${targetHour}:00` })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let enviados = 0

    for (const cita of citasEn2h) {
      const { data: lead } = await supabase
        .from('medcare_leads')
        .select('nombre, telefono')
        .eq('huli_appointment_id', cita.idEvent)
        .single()

      if (!lead?.telefono) continue

      const result = await sendTextMessage(
        lead.telefono,
        mensajeRecordatorio2h(lead.nombre, cita.timeFrom?.substring(0, 5) || '')
      )

      if (result.success) enviados++
    }

    return NextResponse.json({ sent: enviados, total: citasEn2h.length })
  } catch (error) {
    console.error('[MedCare Cron Recordatorios] Error:', error)
    return NextResponse.json({ error: 'Error en cron' }, { status: 500 })
  }
}
