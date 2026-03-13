import { createClient } from '@/lib/supabase/client'
import type {
  Paciente,
  PacienteInsert,
  PacienteUpdate,
  PacienteProximoVencimiento,
} from '../types/database'

// ── Obtener todos los pacientes ──────────────────────────────
export async function getPacientes(filtros?: {
  estado?: string
  limite?: number
}): Promise<Paciente[]> {
  const supabase = createClient()

  let query = supabase
    .from('pacientes')
    .select('*')
    .order('created_at', { ascending: false })

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

// ── Obtener un paciente por ID ───────────────────────────────
export async function getPaciente(id: string): Promise<Paciente | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ── Crear nuevo paciente ─────────────────────────────────────
export async function createPaciente(paciente: PacienteInsert): Promise<Paciente> {
  const supabase = createClient()

  // Calcular sesiones_restantes inicial
  const insert = {
    ...paciente,
    sesiones_completadas: 0,
    sesiones_restantes: paciente.plan_sesiones || null,
  }

  const { data, error } = await supabase
    .from('pacientes')
    .insert(insert)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar paciente ──────────────────────────────────────
export async function updatePaciente(
  id: string,
  updates: PacienteUpdate
): Promise<Paciente> {
  const supabase = createClient()

  // Si se actualiza plan_sesiones, recalcular sesiones_restantes
  let finalUpdates = { ...updates }

  if (updates.plan_sesiones !== undefined) {
    const paciente = await getPaciente(id)
    if (paciente) {
      finalUpdates = {
        ...updates,
        sesiones_restantes: updates.plan_sesiones - paciente.sesiones_completadas,
      }
    }
  }

  const { data, error } = await supabase
    .from('pacientes')
    .update({ ...finalUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Eliminar paciente ────────────────────────────────────────
export async function deletePaciente(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Pacientes próximos a vencimiento (renovación) ────────────
export async function getPacientesProximoVencimiento(): Promise<PacienteProximoVencimiento[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pacientes_proximo_vencimiento')
    .select('*')
    .order('sesiones_restantes', { ascending: true })

  if (error) throw error
  return data || []
}

// ── Buscar pacientes por nombre o teléfono ───────────────────
export async function searchPacientes(query: string): Promise<Paciente[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .or(`nombre.ilike.%${query}%,telefono.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data || []
}

// ── Estadísticas de pacientes ────────────────────────────────
export async function getEstadisticasPacientes() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pacientes')
    .select('estado')

  if (error) throw error

  const total = data.length
  const activos = data.filter(p => p.estado === 'activo').length
  const inactivos = data.filter(p => p.estado === 'inactivo').length
  const completados = data.filter(p => p.estado === 'completado').length

  return {
    total,
    activos,
    inactivos,
    completados,
    porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0,
  }
}
