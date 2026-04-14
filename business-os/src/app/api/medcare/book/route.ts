import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/features/medcare/lib/rate-limiter'

const MAMOGRAFIA_DOCTOR_ID = Number(process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314')
const CLINIC_ID = Number(process.env.HULI_CLINIC_ID || '9694')

/**
 * POST /api/medcare/book
 * Crea paciente en Huli + cita(s) + lead en Supabase
 * Si es promo combo: crea mamografía + ultrasonido 30min después
 * Endpoint PÚBLICO — rate limited: 5 citas/hora por IP
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const limit = checkRateLimit(`booking:${ip}`, RATE_LIMITS.booking)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de citas. Intenta más tarde o llámanos al 4070-0330.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()

    const {
      nombre, telefono, email,
      fecha, hora, sourceEvent,
      tipo_estudio, servicio_id,
      medico_referente, horario_preferido,
      fuente, notas,
      esPromo, // true si es combo promo
    } = body

    if (!nombre || !telefono || !fecha || !hora) {
      return NextResponse.json(
        { error: 'nombre, telefono, fecha y hora son requeridos' },
        { status: 400 }
      )
    }

    const huli = HuliConnector.getInstance()

    // 1. Buscar/crear paciente
    const patient = await huli.findOrCreatePatient(nombre, telefono, email)

    // 2. Crear cita de mamografía
    const mamoAppointment = await huli.createAppointment({
      id_doctor: MAMOGRAFIA_DOCTOR_ID,
      id_clinic: CLINIC_ID,
      id_patient_file: Number(patient.id),
      start_date: fecha,
      time_from: hora,
      source_event: sourceEvent ? Number(sourceEvent) : undefined,
      notes: esPromo
        ? 'Promo Abril: Mamografía + US Mamario ₡50,000 — Agendado desde web'
        : (notas || `Agendado desde web — ${tipo_estudio || 'mamografía'}`),
      is_first_time_patient: true,
    })

    // 3. Promo: el ultrasonido se coordina por teléfono (no se agenda automáticamente)
    const usAppointment = null

    // 4. Crear lead en Supabase
    const params = new URL(request.url).searchParams
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: lead } = await supabase
      .from('medcare_leads')
      .insert({
        nombre,
        telefono,
        email: email || null,
        tipo_estudio: esPromo ? 'mamografia' : (tipo_estudio || 'mamografia'),
        servicio_id: servicio_id || null,
        medico_referente: medico_referente || null,
        fecha_preferida: fecha,
        horario_preferido: horario_preferido || null,
        fuente: fuente || 'web',
        notas: esPromo ? 'Promo Abril: Mamografía + US Mamario ₡50,000' : (notas || null),
        estado: 'cita_agendada',
        huli_patient_id: patient.id,
        huli_appointment_id: mamoAppointment.idEvent,
        huli_appointment_status: mamoAppointment.statusAppointment,
        fecha_cita: `${mamoAppointment.startDate}T${mamoAppointment.timeFrom}`,
        utm_source: params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      esPromo: !!esPromo,
      appointment: {
        id: mamoAppointment.idEvent,
        date: mamoAppointment.startDate,
        time: mamoAppointment.timeFrom,
        status: mamoAppointment.statusAppointment,
      },
      ultrasonido: usAppointment ? {
        id: usAppointment.idEvent,
        date: usAppointment.startDate,
        time: usAppointment.timeFrom,
        status: usAppointment.statusAppointment,
      } : null,
      patientId: patient.id,
      leadId: lead?.id,
    })
  } catch (error) {
    console.error('[MedCare Book] Error:', error)

    const message = error instanceof Error ? error.message : 'Error creando cita'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
