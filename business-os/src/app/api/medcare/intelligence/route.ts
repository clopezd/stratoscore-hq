import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import type { HuliAppointment } from '@/features/medcare/lib/huli-types'

const SOURCES = [
  { id: '96314', nombre: 'Mamografía', tipo: 'equipo' },
  { id: '79739', nombre: 'Resonancia 1.5T', tipo: 'equipo' },
  { id: '27377', nombre: 'Resonancia 0.4T', tipo: 'equipo' },
  { id: '49489', nombre: 'Rayos X', tipo: 'equipo' },
  { id: '83133', nombre: 'Laboratorio', tipo: 'equipo' },
  { id: '97620', nombre: 'Dr. Marden Orrego', tipo: 'doctor', especialidad: 'Radiología' },
  { id: '14145', nombre: 'Dr. Juan M. Hernández', tipo: 'doctor', especialidad: 'Radiología' },
  { id: '18828', nombre: 'Dr. Julio Pastora', tipo: 'doctor', especialidad: 'Radiología' },
  { id: '49493', nombre: 'Josue Solis', tipo: 'doctor', especialidad: 'Imágenes Médicas' },
  { id: '50479', nombre: 'Dr. Ricardo Chacón', tipo: 'doctor', especialidad: 'Cardiología' },
  { id: '41652', nombre: 'Dr. Jose C. Aguirre', tipo: 'doctor', especialidad: 'Neurocirugía' },
  { id: '43989', nombre: 'Dr. Alvaro Quesada', tipo: 'doctor', especialidad: 'Ortopedia' },
  { id: '17471', nombre: 'Dr. José Mora', tipo: 'doctor', especialidad: 'Ginecología' },
]

const CLINIC_ID = process.env.HULI_CLINIC_ID || '9694'

/**
 * GET /api/medcare/intelligence?periodo=semana|mes
 * Análisis inteligente de la agenda: tasas, alertas, oportunidades
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const periodo = searchParams.get('periodo') || 'semana'

    const huli = HuliConnector.getInstance()
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Calcular rango según periodo
    let fromDate: string, toDate: string
    if (periodo === 'mes') {
      fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      toDate = todayStr
    } else {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      fromDate = weekAgo.toISOString().split('T')[0]
      toDate = todayStr
    }

    // Mañana para ocupación
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Recopilar todas las citas del periodo por source
    interface SourceData {
      id: string
      nombre: string
      tipo: string
      especialidad?: string
      citas: HuliAppointment[]
      total: number
    }

    const sourceResults = await Promise.allSettled(
      SOURCES.map(async (source): Promise<SourceData> => {
        try {
          const data = await huli.listDoctorAppointments(
            source.id,
            `${fromDate}T00:00:00Z`,
            `${toDate}T23:59:59Z`,
            { limit: 20 }
          )
          return {
            ...source,
            citas: data.appointments || [],
            total: Number(data.total) || 0,
          }
        } catch {
          return { ...source, citas: [], total: 0 }
        }
      })
    )

    const sources: SourceData[] = sourceResults
      .filter((r): r is PromiseFulfilledResult<SourceData> => r.status === 'fulfilled')
      .map(r => r.value)

    const allCitas = sources.flatMap(s => s.citas)

    // ── MÉTRICAS GENERALES ──
    const totalCitas = allCitas.length
    const booked = allCitas.filter(c => c.statusAppointment === 'BOOKED')
    const completed = allCitas.filter(c => c.statusAppointment === 'COMPLETED')
    const cancelled = allCitas.filter(c => c.statusAppointment === 'CANCELLED')
    const noShow = allCitas.filter(c => c.statusAppointment === 'NOSHOW')
    const rescheduled = allCitas.filter(c => c.statusAppointment === 'RESCHEDULED')

    const confirmadas = allCitas.filter(c => c.isConfirmedByPatient)
    const sinConfirmar = booked.filter(c => !c.isConfirmedByPatient)

    const canceladasPorPaciente = cancelled.filter(c => c.isStatusModifiedByPatient)
    const canceladasPorCentro = cancelled.filter(c => !c.isStatusModifiedByPatient)

    const tasaConfirmacion = totalCitas > 0 ? Math.round((confirmadas.length / totalCitas) * 100) : 0
    const tasaCancelacion = totalCitas > 0 ? Math.round((cancelled.length / totalCitas) * 100) : 0
    const tasaNoShow = totalCitas > 0 ? Math.round((noShow.length / totalCitas) * 100) : 0
    const tasaCompletado = totalCitas > 0 ? Math.round((completed.length / totalCitas) * 100) : 0

    // ── OCUPACIÓN POR EQUIPO/DOCTOR ──
    const ocupacion = sources
      .filter(s => s.total > 0)
      .map(s => ({
        nombre: s.nombre,
        tipo: s.tipo,
        totalCitas: s.total,
        completadas: s.citas.filter(c => c.statusAppointment === 'COMPLETED').length,
        canceladas: s.citas.filter(c => c.statusAppointment === 'CANCELLED').length,
        sinConfirmar: s.citas.filter(c => c.statusAppointment === 'BOOKED' && !c.isConfirmedByPatient).length,
      }))
      .sort((a, b) => b.totalCitas - a.totalCitas)

    // ── HORARIOS: análisis de demanda ──
    const horasCitas: Record<string, number> = {}
    for (const c of allCitas) {
      if (c.timeFrom) {
        const hora = c.timeFrom.substring(0, 2)
        horasCitas[hora] = (horasCitas[hora] || 0) + 1
      }
    }
    const horasOrdenadas = Object.entries(horasCitas).sort((a, b) => b[1] - a[1])
    const horasPico = horasOrdenadas.slice(0, 3).map(([h, n]) => ({ hora: `${h}:00`, citas: n }))
    const horasMuertas = horasOrdenadas.slice(-3).reverse().map(([h, n]) => ({ hora: `${h}:00`, citas: n }))

    // ── DISPONIBILIDAD MAÑANA ──
    let slotsMañana: { nombre: string; libres: number; total: number }[] = []
    const equiposConAgenda = ['96314', '79739', '27377']
    const availResults = await Promise.allSettled(
      equiposConAgenda.map(async (id) => {
        try {
          const avail = await huli.getAvailability(id, CLINIC_ID, `${tomorrowStr}T00:00:00Z`, `${tomorrowStr}T23:59:59Z`)
          const libres = avail.slotDates?.[0]?.slots?.length || 0
          const source = SOURCES.find(s => s.id === id)
          return { nombre: source?.nombre || id, libres, total: 20 }
        } catch {
          return null
        }
      })
    )
    slotsMañana = availResults
      .filter((r): r is PromiseFulfilledResult<{ nombre: string; libres: number; total: number } | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((v): v is { nombre: string; libres: number; total: number } => v !== null)

    // ── ALERTAS ──
    const alertas: { tipo: 'urgente' | 'advertencia' | 'info'; titulo: string; detalle: string; accion: string }[] = []

    if (sinConfirmar.length > 0) {
      alertas.push({
        tipo: 'urgente',
        titulo: `${sinConfirmar.length} citas sin confirmar`,
        detalle: `${Math.round((sinConfirmar.length / Math.max(booked.length, 1)) * 100)}% de las citas pendientes no están confirmadas por el paciente.`,
        accion: 'Enviar recordatorio por WhatsApp a pacientes con cita sin confirmar.',
      })
    }

    if (tasaCancelacion > 20) {
      alertas.push({
        tipo: 'urgente',
        titulo: `Tasa de cancelación alta: ${tasaCancelacion}%`,
        detalle: `${cancelled.length} citas canceladas en el periodo. ${canceladasPorPaciente.length} por paciente, ${canceladasPorCentro.length} por el centro.`,
        accion: canceladasPorPaciente.length > canceladasPorCentro.length
          ? 'Implementar confirmación obligatoria 24h antes para reducir cancelaciones de pacientes.'
          : 'Revisar causas internas de cancelación con el equipo médico.',
      })
    }

    if (tasaNoShow > 10) {
      alertas.push({
        tipo: 'advertencia',
        titulo: `No-show: ${tasaNoShow}% (${noShow.length} citas)`,
        detalle: 'Pacientes que no se presentaron a su cita sin avisar.',
        accion: 'Implementar recordatorio 2 horas antes + penalización suave (espera en re-agendamiento).',
      })
    }

    for (const slot of slotsMañana) {
      const ocupPct = Math.round(((slot.total - slot.libres) / slot.total) * 100)
      if (ocupPct < 25) {
        alertas.push({
          tipo: 'advertencia',
          titulo: `${slot.nombre}: ${ocupPct}% ocupación mañana`,
          detalle: `${slot.libres} de ${slot.total} slots disponibles para mañana.`,
          accion: `Promocionar horarios disponibles de ${slot.nombre} en redes sociales hoy.`,
        })
      }
    }

    if (rescheduled.length > 5) {
      alertas.push({
        tipo: 'info',
        titulo: `${rescheduled.length} citas reagendadas`,
        detalle: 'Alto volumen de reagendamientos puede indicar problemas de horario.',
        accion: 'Analizar patrones: ¿los pacientes prefieren otros horarios?',
      })
    }

    // ── OPORTUNIDADES ──
    const oportunidades: { titulo: string; impacto: 'alto' | 'medio' | 'bajo'; detalle: string; accion: string }[] = []

    if (canceladasPorPaciente.length > 0) {
      oportunidades.push({
        titulo: `${canceladasPorPaciente.length} pacientes cancelaron — re-engagement`,
        impacto: 'alto',
        detalle: 'Pacientes que tenían cita pero cancelaron. Alta probabilidad de re-agendar con seguimiento.',
        accion: 'Contactar por WhatsApp: "Notamos que canceló su cita. ¿Desea reagendar? Tenemos disponibilidad esta semana."',
      })
    }

    const equiposBajaOcup = ocupacion.filter(o => o.tipo === 'equipo' && o.completadas < 5)
    if (equiposBajaOcup.length > 0) {
      oportunidades.push({
        titulo: `${equiposBajaOcup.length} equipos con baja utilización`,
        impacto: 'alto',
        detalle: `Equipos sub-utilizados: ${equiposBajaOcup.map(e => e.nombre).join(', ')}.`,
        accion: 'Crear promoción especial para llenar horarios vacíos. Considerar precio especial en horarios de baja demanda.',
      })
    }

    if (horasMuertas.length > 0 && horasMuertas[0].citas < 3) {
      oportunidades.push({
        titulo: `Horarios de baja demanda: ${horasMuertas.map(h => h.hora).join(', ')}`,
        impacto: 'medio',
        detalle: `Estos horarios tienen menos de 3 citas en el periodo. Oportunidad de llenarlos con promociones.`,
        accion: 'Ofrecer precio especial o "happy hour médico" en horarios de baja demanda.',
      })
    }

    if (tasaConfirmacion < 60) {
      oportunidades.push({
        titulo: 'Automatizar confirmaciones por WhatsApp',
        impacto: 'alto',
        detalle: `Solo ${tasaConfirmacion}% de las citas están confirmadas. Un bot de confirmación automática puede subir esto a 85%+.`,
        accion: 'Implementar bot WhatsApp que envíe confirmación 24h antes y recordatorio 2h antes.',
      })
    }

    return NextResponse.json({
      periodo,
      rango: { from: fromDate, to: toDate },
      metricas: {
        totalCitas,
        tasaConfirmacion,
        tasaCancelacion,
        tasaNoShow,
        tasaCompletado,
        confirmadas: confirmadas.length,
        sinConfirmar: sinConfirmar.length,
        canceladasPorPaciente: canceladasPorPaciente.length,
        canceladasPorCentro: canceladasPorCentro.length,
        noShow: noShow.length,
        reagendadas: rescheduled.length,
      },
      ocupacion,
      horarios: { pico: horasPico, muertos: horasMuertas },
      slotsMañana,
      alertas,
      oportunidades,
      updatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('[MedCare Intelligence] Error:', error)
    return NextResponse.json({ error: 'Error generando inteligencia' }, { status: 500 })
  }
}
