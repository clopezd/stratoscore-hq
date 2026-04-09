import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { createClient } from '@supabase/supabase-js'
import { sendTextMessage } from '@/features/medcare/lib/whatsapp/whatsapp-client'

/**
 * GET /api/medcare/whatsapp — Verificación del webhook (Meta lo requiere)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST /api/medcare/whatsapp — Recibir mensajes de pacientes
 * Procesa respuestas de confirmación (SÍ/NO)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Meta envía actualizaciones de estado y mensajes
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    // Solo procesar mensajes entrantes
    if (!value?.messages?.[0]) {
      return NextResponse.json({ received: true })
    }

    const message = value.messages[0]
    const from = message.from // número del paciente (506XXXXXXXX)
    const text = (message.text?.body || '').trim().toLowerCase()

    // Normalizar teléfono para buscar en Supabase
    const telefono = from.startsWith('506') ? from.substring(3) : from

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar lead con cita pendiente para este teléfono
    const { data: lead } = await supabase
      .from('medcare_leads')
      .select('id, nombre, huli_appointment_id, estado')
      .eq('estado', 'cita_agendada')
      .or(`telefono.eq.${telefono},telefono.eq.+506${telefono},telefono.eq.506${telefono}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!lead || !lead.huli_appointment_id) {
      // No hay cita pendiente — respuesta genérica
      await sendTextMessage(from,
        'Gracias por escribir a MedCare. Para agendar una cita, visite nuestra página o llámenos al 4070-0330.'
      )
      return NextResponse.json({ received: true, action: 'no_pending_appointment' })
    }

    // Procesar respuesta
    const esSi = ['si', 'sí', 'yes', 'confirmo', 'confirmar', '1'].includes(text)
    const esNo = ['no', 'cancelar', 'cancelo', '2'].includes(text)

    if (esSi) {
      // Confirmar cita en Huli
      try {
        const huli = HuliConnector.getInstance()
        await huli.confirmAppointment(lead.huli_appointment_id)

        await supabase
          .from('medcare_leads')
          .update({ notas: 'Confirmada por paciente vía WhatsApp' })
          .eq('id', lead.id)

        await sendTextMessage(from,
          `✅ ¡Cita confirmada, ${lead.nombre}! Lo esperamos en MedCare.\n\n📍 50m norte esquina NE Edificio Centro Colón\n📞 4070-0330`
        )
      } catch {
        await sendTextMessage(from,
          `Gracias ${lead.nombre}, registramos su confirmación. Lo esperamos en MedCare.\n📞 4070-0330`
        )
      }

      return NextResponse.json({ received: true, action: 'confirmed' })
    }

    if (esNo) {
      // Cancelar cita en Huli (por paciente)
      try {
        const huli = HuliConnector.getInstance()
        await huli.cancelAppointment(lead.huli_appointment_id, true)

        await supabase
          .from('medcare_leads')
          .update({
            estado: 'contactado',
            huli_appointment_status: 'CANCELLED',
            notas: 'Cancelada por paciente vía WhatsApp',
          })
          .eq('id', lead.id)

        await sendTextMessage(from,
          `Entendido, ${lead.nombre}. Su cita ha sido cancelada.\n\nCuando desee reagendar, puede hacerlo aquí:\n${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stratoscore.app'}/medcare/agendar-estudio\n\nO llámenos al 4070-0330.`
        )
      } catch {
        await sendTextMessage(from,
          `Registramos su solicitud de cancelación, ${lead.nombre}. Le contactaremos para confirmar.\n📞 4070-0330`
        )
      }

      return NextResponse.json({ received: true, action: 'cancelled' })
    }

    // Respuesta no reconocida
    await sendTextMessage(from,
      `Gracias por su mensaje, ${lead.nombre}.\n\nPara confirmar su cita responda *SÍ*\nPara cancelar responda *NO*\n\nO llámenos al 4070-0330 para cualquier consulta.`
    )

    return NextResponse.json({ received: true, action: 'unrecognized' })
  } catch (error) {
    console.error('[MedCare WhatsApp Webhook] Error:', error)
    return NextResponse.json({ received: true })
  }
}
