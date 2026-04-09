import { NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { createClient } from '@supabase/supabase-js'

const MAMOGRAFIA_DOCTOR_ID = process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314'
const CLINIC_ID = process.env.HULI_CLINIC_ID || '9694'
const PRECIO_MAMOGRAFIA = Number(process.env.MEDCARE_PRECIO_MAMOGRAFIA || '0')

/**
 * GET /api/medcare/analytics
 * Métricas combinadas Huli + Supabase para el dashboard
 * Requiere auth (solo admin)
 */
export async function GET() {
  try {
    const huli = HuliConnector.getInstance()

    // Fechas
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 1. Citas de hoy desde Huli
    let citasHoy: { total: number; completadas: number; pendientes: number; canceladas: number } = {
      total: 0, completadas: 0, pendientes: 0, canceladas: 0,
    }
    try {
      const hoyData = await huli.listDoctorAppointments(
        MAMOGRAFIA_DOCTOR_ID,
        `${todayStr}T00:00:00Z`,
        `${todayStr}T23:59:59Z`,
        { limit: 20 }
      )
      const appts = hoyData.appointments || []
      citasHoy = {
        total: appts.length,
        completadas: appts.filter(a => a.statusAppointment === 'COMPLETED').length,
        pendientes: appts.filter(a => a.statusAppointment === 'BOOKED').length,
        canceladas: appts.filter(a => a.statusAppointment === 'CANCELLED').length,
      }
    } catch { /* Huli puede fallar si no hay citas */ }

    // 2. Citas de la semana desde Huli
    let citasSemana = { total: 0, completadas: 0, noShow: 0 }
    try {
      const semanaData = await huli.listDoctorAppointments(
        MAMOGRAFIA_DOCTOR_ID,
        `${weekAgo.toISOString().split('T')[0]}T00:00:00Z`,
        `${todayStr}T23:59:59Z`,
        { limit: 20 }
      )
      const appts = semanaData.appointments || []
      citasSemana = {
        total: appts.length,
        completadas: appts.filter(a => a.statusAppointment === 'COMPLETED').length,
        noShow: appts.filter(a => a.statusAppointment === 'NOSHOW').length,
      }
    } catch { /* */ }

    // 3. Disponibilidad de mañana (ocupación)
    let ocupacionManana = { slotsTotal: 0, slotsOcupados: 0, porcentaje: 0 }
    try {
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      const avail = await huli.getAvailability(
        MAMOGRAFIA_DOCTOR_ID, CLINIC_ID,
        `${tomorrowStr}T00:00:00Z`,
        `${tomorrowStr}T23:59:59Z`
      )
      const slotsLibres = avail.slotDates?.[0]?.slots?.length || 0
      const SLOTS_POR_DIA = 20 // 8am-5:30pm cada 30min
      ocupacionManana = {
        slotsTotal: SLOTS_POR_DIA,
        slotsOcupados: SLOTS_POR_DIA - slotsLibres,
        porcentaje: Math.round(((SLOTS_POR_DIA - slotsLibres) / SLOTS_POR_DIA) * 100),
      }
    } catch { /* */ }

    // 3b. Total centro médico HOY (todos los doctores/equipos)
    const ALL_DOCTORS = [96314, 79739, 27377, 49489, 83133, 97620, 14145, 18828, 49493, 105246, 50479, 41652, 43989, 14315, 17471, 623]
    let centroHoy = { total: 0, pendientes: 0, completadas: 0, canceladas: 0, noShow: 0 }
    const centroResults = await Promise.allSettled(
      ALL_DOCTORS.map(docId =>
        huli.listDoctorAppointments(String(docId), `${todayStr}T00:00:00Z`, `${todayStr}T23:59:59Z`, { limit: 20 })
          .catch(() => ({ appointments: [], total: '0' }))
      )
    )
    for (const r of centroResults) {
      if (r.status !== 'fulfilled') continue
      const appts = r.value.appointments || []
      centroHoy.total += appts.length
      centroHoy.pendientes += appts.filter(a => a.statusAppointment === 'BOOKED').length
      centroHoy.completadas += appts.filter(a => a.statusAppointment === 'COMPLETED').length
      centroHoy.canceladas += appts.filter(a => a.statusAppointment === 'CANCELLED').length
      centroHoy.noShow += appts.filter(a => a.statusAppointment === 'NOSHOW').length
    }

    // 4. Leads del mes desde Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const monthStartStr = monthStart.toISOString()

    const { data: leadsDelMes } = await supabase
      .from('medcare_leads')
      .select('estado, fuente, tipo_estudio, huli_appointment_id, created_at')
      .gte('created_at', monthStartStr)

    const leads = leadsDelMes || []
    const leadsConCita = leads.filter(l => l.huli_appointment_id)

    // 5. Revenue estimado
    const citasCompletadasMes = leads.filter(l => l.estado === 'completado').length
    const revenueEstimado = PRECIO_MAMOGRAFIA > 0 ? citasCompletadasMes * PRECIO_MAMOGRAFIA : null

    return NextResponse.json({
      hoy: citasHoy,
      centroHoy,
      semana: citasSemana,
      ocupacionManana,
      mes: {
        totalLeads: leads.length,
        leadsConCita: leadsConCita.length,
        tasaConversion: leads.length > 0 ? Math.round((leadsConCita.length / leads.length) * 100) : 0,
        porEstado: {
          nuevo: leads.filter(l => l.estado === 'nuevo').length,
          contactado: leads.filter(l => l.estado === 'contactado').length,
          agendado: leads.filter(l => l.estado === 'cita_agendada').length,
          completado: citasCompletadasMes,
          noShow: leads.filter(l => l.estado === 'no_show').length,
          descartado: leads.filter(l => l.estado === 'descartado').length,
        },
        porFuente: leads.reduce((acc, l) => {
          const f = l.fuente || 'desconocida'
          acc[f] = (acc[f] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
      revenue: revenueEstimado !== null ? {
        estimado: revenueEstimado,
        precioUnitario: PRECIO_MAMOGRAFIA,
        moneda: 'CRC',
      } : null,
      updatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('[MedCare Analytics] Error:', error)
    return NextResponse.json({ error: 'Error generando analytics' }, { status: 500 })
  }
}
