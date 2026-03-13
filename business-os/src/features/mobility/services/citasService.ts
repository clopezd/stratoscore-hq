import { createClient } from '@/lib/supabase/client'
import type {
  Cita,
  CitaConRelaciones,
  CitaInsert,
  CitaUpdate,
  OcupacionDiaria,
  SlotDisponible,
} from '../types/database'

// ── Obtener citas con relaciones ─────────────────────────────
export async function getCitas(filtros?: {
  fecha_desde?: string
  fecha_hasta?: string
  paciente_id?: string
  terapeuta_id?: string
  equipo_id?: string
  estado?: string
  limite?: number
}): Promise<CitaConRelaciones[]> {
  const supabase = createClient()

  let query = supabase
    .from('citas')
    .select(`
      *,
      paciente:pacientes!citas_paciente_id_fkey(nombre, telefono),
      terapeuta:terapeutas!citas_terapeuta_id_fkey(nombre),
      equipo:equipos!citas_equipo_id_fkey(nombre, tipo)
    `)
    .order('fecha_hora', { ascending: true })

  if (filtros?.fecha_desde) {
    query = query.gte('fecha_hora', filtros.fecha_desde)
  }

  if (filtros?.fecha_hasta) {
    query = query.lte('fecha_hora', filtros.fecha_hasta)
  }

  if (filtros?.paciente_id) {
    query = query.eq('paciente_id', filtros.paciente_id)
  }

  if (filtros?.terapeuta_id) {
    query = query.eq('terapeuta_id', filtros.terapeuta_id)
  }

  if (filtros?.equipo_id) {
    query = query.eq('equipo_id', filtros.equipo_id)
  }

  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros?.limite) {
    query = query.limit(filtros.limite)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ── Obtener citas del día actual ─────────────────────────────
export async function getCitasHoy(): Promise<CitaConRelaciones[]> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  return getCitas({
    fecha_desde: hoy.toISOString(),
    fecha_hasta: manana.toISOString(),
  })
}

// ── Obtener citas de la semana actual ────────────────────────
export async function getCitasSemana(): Promise<CitaConRelaciones[]> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const inicioSemana = new Date(hoy)
  const diaSemana = inicioSemana.getDay()
  const diff = inicioSemana.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1)
  inicioSemana.setDate(diff)

  const finSemana = new Date(inicioSemana)
  finSemana.setDate(finSemana.getDate() + 7)

  return getCitas({
    fecha_desde: inicioSemana.toISOString(),
    fecha_hasta: finSemana.toISOString(),
  })
}

// ── Crear nueva cita ─────────────────────────────────────────
export async function createCita(cita: CitaInsert): Promise<Cita> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('citas')
    .insert(cita)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar cita ──────────────────────────────────────────
export async function updateCita(id: string, updates: CitaUpdate): Promise<Cita> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('citas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Cancelar cita ────────────────────────────────────────────
export async function cancelarCita(
  id: string,
  motivo: string,
  canceladaPor: 'paciente' | 'centro' | 'sistema'
): Promise<Cita> {
  return updateCita(id, {
    estado: 'cancelada',
    motivo_cancelacion: motivo,
    cancelada_por: canceladaPor,
  })
}

// ── Marcar cita como completada ──────────────────────────────
export async function completarCita(id: string, notas?: string): Promise<Cita> {
  return updateCita(id, {
    estado: 'completada',
    notas_terapeuta: notas,
  })
}

// ── Eliminar cita ────────────────────────────────────────────
export async function deleteCita(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('citas')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Verificar disponibilidad de slot ─────────────────────────
export async function verificarDisponibilidad(
  equipoId: string,
  fechaHora: string,
  duracionMinutos: number = 60
): Promise<boolean> {
  const supabase = createClient()

  const fechaInicio = new Date(fechaHora)
  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)

  const { data, error } = await supabase
    .from('citas')
    .select('id')
    .eq('equipo_id', equipoId)
    .neq('estado', 'cancelada')
    .gte('fecha_hora', fechaInicio.toISOString())
    .lt('fecha_hora', fechaFin.toISOString())

  if (error) throw error

  return !data || data.length === 0
}

// ── Obtener slots disponibles para un día ────────────────────
export async function getSlotsDisponibles(
  fecha: Date,
  equipoId?: string
): Promise<SlotDisponible[]> {
  const supabase = createClient()

  // Obtener horarios del centro para el día de la semana
  const diaSemana = fecha.getDay()

  const { data: horarios, error: errorHorarios } = await supabase
    .from('horarios_centro')
    .select('*')
    .eq('dia_semana', diaSemana)
    .eq('activo', true)
    .single()

  if (errorHorarios || !horarios) return []

  // Obtener equipos disponibles
  let queryEquipos = supabase
    .from('equipos')
    .select('id, nombre, tipo')
    .eq('activo', true)

  if (equipoId) {
    queryEquipos = queryEquipos.eq('id', equipoId)
  }

  const { data: equipos, error: errorEquipos } = await queryEquipos

  if (errorEquipos || !equipos) return []

  // Generar slots por hora
  const [horaInicio, minInicio] = horarios.hora_inicio.split(':').map(Number)
  const [horaFin, minFin] = horarios.hora_fin.split(':').map(Number)

  const slots: SlotDisponible[] = []

  for (const equipo of equipos) {
    for (let hora = horaInicio; hora < horaFin; hora++) {
      const fechaHora = new Date(fecha)
      fechaHora.setHours(hora, 0, 0, 0)

      // Verificar si el slot está ocupado
      const disponible = await verificarDisponibilidad(
        equipo.id,
        fechaHora.toISOString(),
        horarios.duracion_slot_minutos
      )

      if (disponible) {
        slots.push({
          fecha_hora: fechaHora.toISOString(),
          equipo_id: equipo.id,
          equipo_nombre: equipo.nombre,
        })
      }
    }
  }

  return slots
}

// ── Obtener ocupación diaria ─────────────────────────────────
export async function getOcupacionDiaria(
  limite: number = 30
): Promise<OcupacionDiaria[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ocupacion_diaria')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limite)

  if (error) throw error
  return data || []
}

// ── Métricas de ocupación ────────────────────────────────────
export async function getMetricasOcupacion() {
  const citasHoy = await getCitasHoy()
  const citasSemana = await getCitasSemana()

  const supabase = createClient()
  const { data: equipos } = await supabase
    .from('equipos')
    .select('id')
    .eq('activo', true)

  const totalEquipos = equipos?.length || 0
  const slotsDisponiblesHoy = totalEquipos * 10 // Asumiendo 10 slots por día
  const slotsDisponiblesSemana = totalEquipos * 10 * 6 // 6 días hábiles

  const sesionesHoy = citasHoy.filter(c => c.estado !== 'cancelada').length
  const sesionesSemana = citasSemana.filter(c => c.estado !== 'cancelada').length

  const porcentajeHoy = slotsDisponiblesHoy > 0
    ? Math.round((sesionesHoy / slotsDisponiblesHoy) * 100)
    : 0

  const porcentajeSemana = slotsDisponiblesSemana > 0
    ? Math.round((sesionesSemana / slotsDisponiblesSemana) * 100)
    : 0

  const ahoraISO = new Date().toISOString()
  const equiposEnUso = new Set(
    citasHoy
      .filter(c => c.estado === 'en_curso' || (c.estado === 'confirmada' && c.fecha_hora <= ahoraISO))
      .map(c => c.equipo_id)
  ).size

  // Próximas 5 citas
  const proximasCitas = citasHoy
    .filter(c => c.fecha_hora >= ahoraISO && c.estado === 'confirmada')
    .slice(0, 5)

  return {
    porcentaje_ocupacion_hoy: porcentajeHoy,
    porcentaje_ocupacion_semana: porcentajeSemana,
    sesiones_hoy: sesionesHoy,
    sesiones_semana: sesionesSemana,
    equipos_en_uso_ahora: equiposEnUso,
    proximas_citas: proximasCitas,
  }
}
