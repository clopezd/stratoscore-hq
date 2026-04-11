import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'

// Doctores y equipos de MedCare organizados por categoría
const EQUIPOS_AGENDA = [
  { id: '96314', nombre: 'Mamografía', tipo: 'equipo', color: 'E74C3C' },
  { id: '79739', nombre: 'Resonancia 1.5T', tipo: 'equipo', color: '3498DB' },
  { id: '27377', nombre: 'Resonancia 0.4T', tipo: 'equipo', color: '2980B9' },
  { id: '49489', nombre: 'Rayos X', tipo: 'equipo', color: '9B59B6' },
  { id: '83133', nombre: 'Laboratorio', tipo: 'equipo', color: '27AE60' },
]

const DOCTORES_AGENDA = [
  { id: '97620', nombre: 'Dr. Marden Orrego', especialidad: 'Radiología', color: 'E67E22' },
  { id: '14145', nombre: 'Dr. Juan M. Hernández', especialidad: 'Radiología', color: 'D35400' },
  { id: '18828', nombre: 'Dr. Julio Pastora', especialidad: 'Radiología', color: 'F39C12' },
  { id: '49493', nombre: 'Josue Solis', especialidad: 'Imágenes Médicas', color: 'E74C3C' },
  { id: '105246', nombre: 'Nathalia Rodriguez', especialidad: 'Radiología', color: 'C0392B' },
  { id: '50479', nombre: 'Dr. Ricardo Chacón', especialidad: 'Cardiología', color: '8E44AD' },
  { id: '41652', nombre: 'Dr. Jose C. Aguirre', especialidad: 'Neurocirugía', color: '2C3E50' },
  { id: '43989', nombre: 'Dr. Alvaro Quesada', especialidad: 'Ortopedia', color: '16A085' },
  { id: '14315', nombre: 'Dr. Daniel Herrera', especialidad: 'Geriatría', color: '1ABC9C' },
  { id: '17471', nombre: 'Dr. José Mora', especialidad: 'Ginecología', color: 'E91E63' },
  { id: '623', nombre: 'Dr. Patricio Álvarez', especialidad: 'Ortopedia', color: '009688' },
]

/**
 * GET /api/medcare/agenda?date=2026-04-09
 * GET /api/medcare/agenda?from=2026-04-01&to=2026-04-30 (rango)
 * Agenda completa: todos los doctores y equipos
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const { searchParams } = request.nextUrl
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const huli = HuliConnector.getInstance()
    const from = fromParam ? `${fromParam}T00:00:00Z` : `${date}T00:00:00Z`
    const to = toParam ? `${toParam}T23:59:59Z` : `${date}T23:59:59Z`

    // Determinar limit según rango de fechas
    const isRange = fromParam && toParam
    const fetchLimit = isRange ? 200 : 50

    // Consultar todos los doctores/equipos en paralelo
    const allSources = [...EQUIPOS_AGENDA, ...DOCTORES_AGENDA]
    const results = await Promise.allSettled(
      allSources.map(async (source) => {
        try {
          const data = await huli.listDoctorAppointments(source.id, from, to, { limit: fetchLimit })
          return {
            ...source,
            citas: (data.appointments || []).map(a => ({
              id: a.idEvent,
              fecha: a.startDate,
              hora: a.timeFrom?.substring(0, 5),
              horaFin: a.timeTo?.substring(0, 5),
              paciente: a.idPatientFile || null,
              estado: a.statusAppointment,
              notas: a.notes || null,
              colorCita: a.color || null,
              confirmadaPaciente: a.isConfirmedByPatient,
              primeraCita: a.isFirstTimePatient,
              canceladoPorPaciente: a.isStatusModifiedByPatient,
            })),
            total: Number(data.total) || 0,
          }
        } catch {
          return { ...source, citas: [], total: 0 }
        }
      })
    )

    const agenda = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)

    // Separar equipos y doctores
    const equipos = agenda.filter(a => 'tipo' in a && a.tipo === 'equipo')
    const doctores = agenda.filter(a => !('tipo' in a) || a.tipo !== 'equipo')

    // Resumen del día
    const totalCitas = agenda.reduce((sum, a) => sum + (a?.total || 0), 0)
    const citasPendientes = agenda.reduce((sum, a) =>
      sum + (a?.citas?.filter((c: { estado: string }) => c.estado === 'BOOKED').length || 0), 0)
    const citasCompletadas = agenda.reduce((sum, a) =>
      sum + (a?.citas?.filter((c: { estado: string }) => c.estado === 'COMPLETED').length || 0), 0)

    return NextResponse.json({
      fecha: date,
      resumen: { totalCitas, citasPendientes, citasCompletadas },
      equipos,
      doctores,
    })
  } catch (error) {
    console.error('[MedCare Agenda] Error:', error)
    return NextResponse.json({ error: 'Error cargando agenda' }, { status: 500 })
  }
}
