import { createClient } from '@/lib/supabase/client'
import { getSlotsDisponibles, getMetricasOcupacion } from './citasService'
import { getPacientesProximoVencimiento } from './pacientesService'
import { getLeadsPendientes } from './leadsService'
import type {
  Paciente,
  PacienteProximoVencimiento,
  LeadMobility,
  SlotDisponible,
} from '../types/database'

// ── Tipos ───────────────────────────────────────────────────

export interface AccionDiaria {
  id: string
  tipo: 'slot_vacio' | 'renovacion' | 'lead_nuevo' | 'paciente_inactivo'
  prioridad: 'alta' | 'media' | 'baja'
  titulo: string
  descripcion: string
  telefono: string
  mensaje_sugerido: string
  datos: Record<string, unknown>
}

export interface ResumenAcciones {
  metricas: {
    ocupacion_hoy_pct: number
    ocupacion_semana_pct: number
    meta_pct: number
    slots_vacios_hoy: number
    total_acciones: number
  }
  acciones: {
    slots_vacios: AccionDiaria[]
    renovaciones: AccionDiaria[]
    leads_nuevos: AccionDiaria[]
    pacientes_inactivos: AccionDiaria[]
  }
}

// ── Mensajes ────────────────────────────────────────────────

function mensajeSlotVacio(nombre: string, dia: string, hora: string, equipo: string): string {
  return `Hola ${nombre}, tenemos disponibilidad el ${dia} a las ${hora} en ${equipo}. ¿Le gustaría agendar su sesión?`
}

function mensajeRenovacion(nombre: string, sesionesRestantes: number): string {
  if (sesionesRestantes <= 1) {
    return `Hola ${nombre}, esta es su última sesión del plan actual. Para no interrumpir su progreso, ¿le gustaría renovar su plan de tratamiento?`
  }
  return `Hola ${nombre}, le quedan ${sesionesRestantes} sesiones de su plan. ¿Desea renovar para continuar con su recuperación?`
}

function mensajeLead(nombre: string, diagnostico?: string | null): string {
  const extra = diagnostico
    ? ` Vimos que su consulta es sobre ${diagnostico.toLowerCase()}.`
    : ''
  return `Hola ${nombre}, recibimos su solicitud de evaluación.${extra} ¿Cuándo le gustaría agendar una valoración inicial?`
}

function mensajePacienteInactivo(nombre: string, diasSinSesion: number): string {
  return `Hola ${nombre}, hace ${diasSinSesion} días que no le vemos en el centro. La continuidad es clave para su recuperación. ¿Agendamos su próxima sesión?`
}

// ── Helpers ─────────────────────────────────────────────────

function formatearDia(fecha: string): string {
  const d = new Date(fecha)
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`
}

function formatearHora(fecha: string): string {
  const d = new Date(fecha)
  return d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function diasDesde(fecha: string | null): number {
  if (!fecha) return 999
  const diff = Date.now() - new Date(fecha).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ── Acciones Diarias ────────────────────────────────────────

export async function getAccionesDiarias(): Promise<ResumenAcciones> {
  // Ejecutar queries en paralelo
  const [metricas, renovaciones, leadsPendientes, slotsHoy, pacientesInactivos] =
    await Promise.all([
      getMetricasOcupacion(),
      getPacientesProximoVencimiento(),
      getLeadsPendientes(),
      getSlotsDisponibles(new Date()),
      getPacientesInactivos(),
    ])

  // Construir acciones de slots vacíos
  const accionesSlots: AccionDiaria[] = slotsHoy.map((slot) => ({
    id: `slot-${slot.equipo_id}-${slot.fecha_hora}`,
    tipo: 'slot_vacio',
    prioridad: 'media',
    titulo: `${slot.equipo_nombre} - ${formatearHora(slot.fecha_hora)}`,
    descripcion: `Slot libre hoy ${formatearHora(slot.fecha_hora)}`,
    telefono: '',
    mensaje_sugerido: '',
    datos: { slot },
  }))

  // Construir acciones de renovación
  const accionesRenovacion: AccionDiaria[] = renovaciones.map((p) => ({
    id: `renovar-${p.id}`,
    tipo: 'renovacion',
    prioridad: p.prioridad_renovacion === 'urgente' ? 'alta' : p.prioridad_renovacion === 'proximo' ? 'media' : 'baja',
    titulo: p.nombre,
    descripcion: `${p.sesiones_restantes} sesiones restantes${p.fecha_ultima_sesion ? ` · Última: ${formatearDia(p.fecha_ultima_sesion)}` : ''}`,
    telefono: p.telefono,
    mensaje_sugerido: mensajeRenovacion(p.nombre.split(' ')[0], p.sesiones_restantes),
    datos: { paciente: p },
  }))

  // Construir acciones de leads
  const accionesLeads: AccionDiaria[] = leadsPendientes.map((l) => ({
    id: `lead-${l.id}`,
    tipo: 'lead_nuevo',
    prioridad: l.estado === 'nuevo' ? 'alta' : 'media',
    titulo: l.nombre,
    descripcion: `${l.diagnostico_preliminar || 'Sin diagnóstico'} · ${l.fuente || 'Sin fuente'} · ${formatearDia(l.created_at)}`,
    telefono: l.telefono,
    mensaje_sugerido: mensajeLead(l.nombre.split(' ')[0], l.diagnostico_preliminar),
    datos: { lead: l },
  }))

  // Construir acciones de pacientes inactivos
  const accionesInactivos: AccionDiaria[] = pacientesInactivos.map((p) => {
    const dias = diasDesde(p.fecha_ultima_sesion)
    return {
      id: `inactivo-${p.id}`,
      tipo: 'paciente_inactivo',
      prioridad: dias > 30 ? 'alta' : 'media',
      titulo: p.nombre,
      descripcion: `${dias} días sin sesión · ${p.sesiones_restantes ?? '?'} sesiones restantes`,
      telefono: p.telefono,
      mensaje_sugerido: mensajePacienteInactivo(p.nombre.split(' ')[0], dias),
      datos: { paciente: p },
    }
  })

  const totalAcciones =
    accionesSlots.length +
    accionesRenovacion.length +
    accionesLeads.length +
    accionesInactivos.length

  return {
    metricas: {
      ocupacion_hoy_pct: metricas.porcentaje_ocupacion_hoy,
      ocupacion_semana_pct: metricas.porcentaje_ocupacion_semana,
      meta_pct: 90,
      slots_vacios_hoy: slotsHoy.length,
      total_acciones: totalAcciones,
    },
    acciones: {
      slots_vacios: accionesSlots,
      renovaciones: accionesRenovacion,
      leads_nuevos: accionesLeads,
      pacientes_inactivos: accionesInactivos,
    },
  }
}

// ── Pacientes inactivos (+14 días sin sesión) ───────────────

async function getPacientesInactivos(): Promise<Paciente[]> {
  const supabase = createClient()
  const hace14Dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('estado', 'activo')
    .lt('fecha_ultima_sesion', hace14Dias)
    .order('fecha_ultima_sesion', { ascending: true })

  if (error) throw error
  return data || []
}

// ── Marcar acción realizada ─────────────────────────────────

export async function marcarAccionRealizada(
  tipo: AccionDiaria['tipo'],
  id: string
): Promise<void> {
  const supabase = createClient()

  if (tipo === 'lead_nuevo') {
    await supabase
      .from('leads_mobility')
      .update({ estado: 'contactado', contactado_en: new Date().toISOString() })
      .eq('id', id)
  }

  if (tipo === 'renovacion' || tipo === 'paciente_inactivo') {
    // Marcar nota de que se contactó (usamos notas_medicas como log temporal)
    const { data } = await supabase
      .from('pacientes')
      .select('notas_medicas')
      .eq('id', id)
      .single()

    const nota = `[${new Date().toLocaleDateString('es-CR')}] Contactado para ${tipo === 'renovacion' ? 'renovación' : 'reactivación'}`
    const notasActuales = data?.notas_medicas || ''
    const nuevasNotas = notasActuales ? `${nota}\n${notasActuales}` : nota

    await supabase
      .from('pacientes')
      .update({ notas_medicas: nuevasNotas })
      .eq('id', id)
  }
}
