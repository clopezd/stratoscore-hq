import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTextMessage, mensajeReengagement, isWhatsAppConfigured } from '@/features/medcare/lib/whatsapp/whatsapp-client'

/**
 * GET /api/medcare/cron/reengagement
 * Cron: contactar pacientes que cancelaron hace 48h y no reagendaron
 * Ejecutar diario a las 10am Costa Rica (16:00 UTC)
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar leads que fueron cancelados hace ~48h y no reagendaron
    const hace48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const hace72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()

    const { data: leads } = await supabase
      .from('medcare_leads')
      .select('id, nombre, telefono, estado, updated_at')
      .eq('estado', 'contactado') // Cancelados se ponen como 'contactado' para re-engagement
      .eq('huli_appointment_status', 'CANCELLED')
      .gte('updated_at', hace72h)
      .lte('updated_at', hace48h)

    if (!leads || leads.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No hay pacientes para re-engagement' })
    }

    let enviados = 0

    for (const lead of leads) {
      if (!lead.telefono) continue

      const result = await sendTextMessage(
        lead.telefono,
        mensajeReengagement(lead.nombre)
      )

      if (result.success) {
        enviados++
        // Marcar que ya se contactó para no repetir
        await supabase
          .from('medcare_leads')
          .update({ notas: `Re-engagement WhatsApp enviado ${new Date().toISOString().split('T')[0]}` })
          .eq('id', lead.id)
      }
    }

    return NextResponse.json({ sent: enviados, total: leads.length })
  } catch (error) {
    console.error('[MedCare Cron Re-engagement] Error:', error)
    return NextResponse.json({ error: 'Error en cron' }, { status: 500 })
  }
}
