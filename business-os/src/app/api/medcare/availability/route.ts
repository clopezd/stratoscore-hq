import { NextRequest, NextResponse } from 'next/server'
import { HuliConnector } from '@/features/medcare/lib/huli-connector'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/features/medcare/lib/rate-limiter'
import type { HuliSlot, HuliSlotDate } from '@/features/medcare/lib/huli-types'

const MAMOGRAFIA_DOCTOR_ID = process.env.HULI_MAMOGRAFIA_DOCTOR_ID || '96314'
const CLINIC_ID = process.env.HULI_CLINIC_ID || '9694'

// Radiólogos que operan ultrasonido de mama (ver CLIENT.md)
const RADIOLOGOS_US: { id: string; nombre: string }[] = [
  { id: '49493', nombre: 'Dr. Solís' },
  { id: '18828', nombre: 'Dr. Pastora' },
  { id: '14145', nombre: 'Dr. Hernández' },
  { id: '97620', nombre: 'Dr. Marden' },
]

// Horario operativo MedCare (CLIENT.md): L-V 8am-8pm | Sáb 8am-7pm | Dom cerrado
// Slots cada 30 min — duración estándar de US de mama
const SLOT_MINUTES = 30
const HOURS_BY_DOW: Record<number, [number, number] | null> = {
  0: null,        // Dom cerrado
  1: [8, 20],     // Lun
  2: [8, 20],     // Mar
  3: [8, 20],     // Mié
  4: [8, 20],     // Jue
  5: [8, 20],     // Vie
  6: [8, 19],     // Sáb
}

const SHORT_DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const LONG_DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const LONG_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatDateShort(d: Date) {
  return `${SHORT_DAYS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}, ${SHORT_MONTHS[d.getMonth()]}`
}
function formatDateLong(d: Date) {
  return `${LONG_DAYS[d.getDay()]} ${d.getDate()} de ${LONG_MONTHS[d.getMonth()]}`
}
function formatTime12h(h: number, m: number) {
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}
function pad2(n: number) { return String(n).padStart(2, '0') }

/**
 * Genera disponibilidad calculada para doctores SIN configuración de availability en Huli
 * (radiólogos que operan ultrasonido). Toma horario operativo - citas existentes.
 */
async function buildCalculatedAvailability(
  doctorId: string,
  clinicId: string,
  fromDate: string,
  toDate: string,
): Promise<HuliSlotDate[]> {
  const huli = HuliConnector.getInstance()
  const fromISO = `${fromDate}T00:00:00Z`
  const toISO = `${toDate}T23:59:59Z`

  // Citas que ocupan slot: BOOKED + RESCHEDULED
  const [booked, resched] = await Promise.all([
    huli.listDoctorAppointments(doctorId, fromISO, toISO, { idClinic: clinicId, status: 'BOOKED' }).catch(() => ({ appointments: [] })),
    huli.listDoctorAppointments(doctorId, fromISO, toISO, { idClinic: clinicId, status: 'RESCHEDULED' }).catch(() => ({ appointments: [] })),
  ])
  const busy = [...(booked.appointments || []), ...(resched.appointments || [])]

  const slotDates: HuliSlotDate[] = []
  const now = new Date()

  // Iterar día a día
  const start = new Date(`${fromDate}T00:00:00`)
  const end = new Date(`${toDate}T00:00:00`)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const hours = HOURS_BY_DOW[d.getDay()]
    if (!hours) continue
    const [openHour, closeHour] = hours

    const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    const dayBusy = busy.filter(a => a.startDate === dateStr)

    const slots: HuliSlot[] = []

    // Generar slots cada 30 min — el último slot debe terminar antes (o en) closeHour
    const totalMinOpen = openHour * 60
    const totalMinClose = closeHour * 60
    for (let mins = totalMinOpen; mins + SLOT_MINUTES <= totalMinClose; mins += SLOT_MINUTES) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const timeFrom = `${pad2(h)}:${pad2(m)}:00`
      const endMins = mins + SLOT_MINUTES
      const timeTo = `${pad2(Math.floor(endMins / 60))}:${pad2(endMins % 60)}:00`

      // Saltar slots en el pasado
      const slotStart = new Date(`${dateStr}T${timeFrom}`)
      if (slotStart <= now) continue

      // Saltar si solapa con cita existente del doctor
      const overlaps = dayBusy.some(a => timeFrom < a.timeTo && timeTo > a.timeFrom)
      if (overlaps) continue

      slots.push({
        dateTime: `${dateStr}T${timeFrom}`,
        time: `${dateStr.replace(/-/g, '')}T${pad2(h)}${pad2(m)}`,
        timeL10n: formatTime12h(h, m),
        // sourceEvent omitido — no hay availability config en Huli para este doctor
      })
    }

    if (slots.length > 0) {
      slotDates.push({
        date: `${dateStr}T00:00:00Z`,
        dateL10n: formatDateShort(d),
        dateL10nComp: formatDateLong(d),
        slots,
      })
    }
  }

  return slotDates
}

/**
 * Fusiona los slots de los 4 radiólogos en una agenda combinada.
 * Cada slot único (mismo dateTime) lleva la lista de doctores libres a esa hora.
 */
async function buildMergedRadiologistAvailability(
  clinicId: string,
  fromDate: string,
  toDate: string,
): Promise<HuliSlotDate[]> {
  const perDoctor = await Promise.all(
    RADIOLOGOS_US.map(async (doc) => ({
      doc,
      slotDates: await buildCalculatedAvailability(doc.id, clinicId, fromDate, toDate).catch(() => [] as HuliSlotDate[]),
    }))
  )

  // Indexamos por fecha → por dateTime → set de doctores
  type SlotMeta = { doctors: { id: string; nombre: string }[]; timeL10n: string }
  const byDate = new Map<string, { dateL10n: string; dateL10nComp: string; slots: Map<string, SlotMeta> }>()

  for (const { doc, slotDates } of perDoctor) {
    for (const day of slotDates) {
      const dateKey = day.date || ''
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, {
          dateL10n: day.dateL10n || '',
          dateL10nComp: day.dateL10nComp || '',
          slots: new Map(),
        })
      }
      const dayBucket = byDate.get(dateKey)!
      for (const s of day.slots || []) {
        const key = s.dateTime || ''
        if (!dayBucket.slots.has(key)) {
          dayBucket.slots.set(key, { doctors: [], timeL10n: s.timeL10n || '' })
        }
        dayBucket.slots.get(key)!.doctors.push({ id: doc.id, nombre: doc.nombre })
      }
    }
  }

  // Convertimos a HuliSlotDate-like (con doctors injectado en cada slot)
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, bucket]) => ({
      date: dateKey,
      dateL10n: bucket.dateL10n,
      dateL10nComp: bucket.dateL10nComp,
      slots: Array.from(bucket.slots.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateTime, meta]) => ({
          dateTime,
          time: dateTime,
          timeL10n: meta.timeL10n,
          // doctors se devuelve como propiedad extra al serializar el response
          doctors: meta.doctors,
        } as HuliSlot & { doctors: { id: string; nombre: string }[] })),
    }))
}

/**
 * GET /api/medcare/availability?from=2026-04-09&to=2026-04-13[&doctor_id=49493][&mode=us-merged]
 * - mode=us-merged → fusiona los 4 radiólogos, cada slot trae `doctors: [...]`
 * - doctor_id == mamógrafo (o sin doctor_id) → availability nativa de Huli
 * - doctor_id == radiólogo → calcula slots desde horario operativo - citas existentes
 * Endpoint PÚBLICO — rate limited: 30 req/min por IP
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const limit = checkRateLimit(`availability:${ip}`, RATE_LIMITS.availability)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en unos minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      )
    }
    const { searchParams } = request.nextUrl
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const mode = searchParams.get('mode')
    const doctorIdParam = searchParams.get('doctor_id')
    const doctorId = doctorIdParam && /^\d+$/.test(doctorIdParam)
      ? doctorIdParam
      : MAMOGRAFIA_DOCTOR_ID

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Parámetros from y to son requeridos (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    let slotDates: HuliSlotDate[]

    if (mode === 'us-merged') {
      // Agenda fusionada de los 4 radiólogos — cada slot lleva los doctores disponibles
      slotDates = await buildMergedRadiologistAvailability(CLINIC_ID, from, to)
    } else if (doctorId === MAMOGRAFIA_DOCTOR_ID) {
      // Mamógrafo: tiene availability configurada en Huli
      const huli = HuliConnector.getInstance()
      const availability = await huli.getAvailability(
        doctorId,
        CLINIC_ID,
        `${from}T00:00:00Z`,
        `${to}T23:59:59Z`,
      )
      slotDates = availability.slotDates || []
    } else {
      // Radiólogo individual: calculamos desde horario operativo - citas existentes
      slotDates = await buildCalculatedAvailability(doctorId, CLINIC_ID, from, to)
    }

    const days = slotDates
      .filter(d => d.slots && d.slots.length > 0)
      .map(d => ({
        date: d.date?.split('T')[0],
        label: d.dateL10n,
        labelFull: d.dateL10nComp,
        slots: (d.slots || []).map(s => {
          const slot = s as HuliSlot & { doctors?: { id: string; nombre: string }[] }
          return {
            time: slot.timeL10n,
            dateTime: slot.dateTime,
            sourceEvent: slot.sourceEvent,
            doctors: slot.doctors,
          }
        }),
      }))

    return NextResponse.json({ days })
  } catch (error) {
    console.error('[MedCare Availability] Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg, days: [] },
      { status: 500 }
    )
  }
}
