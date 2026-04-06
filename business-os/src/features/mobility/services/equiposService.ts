import { createClient } from '@/lib/supabase/client'
import type {
  Equipo,
  EquipoInsert,
} from '../types/database'

// ── Obtener todos los equipos ───────────────────────────────
export async function getEquipos(filtros?: {
  activo?: boolean
  tipo?: string
  limite?: number
}): Promise<Equipo[]> {
  const supabase = createClient()

  let query = supabase
    .from('equipos')
    .select('*')
    .order('id', { ascending: true })

  if (filtros?.activo !== undefined) {
    query = query.eq('activo', filtros.activo)
  }

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }

  if (filtros?.limite) {
    query = query.limit(filtros.limite)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ── Obtener un equipo por ID ─────────────────────────────────
export async function getEquipo(id: string): Promise<Equipo | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ── Crear nuevo equipo ───────────────────────────────────────
export async function createEquipo(equipo: EquipoInsert): Promise<Equipo> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('equipos')
    .insert(equipo)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar equipo ────────────────────────────────────────
export async function updateEquipo(
  id: string,
  updates: Partial<Equipo>
): Promise<Equipo> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('equipos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Estadísticas de equipos ──────────────────────────────────
export async function getEstadisticasEquipos() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('equipos')
    .select('estado, activo, tipo')

  if (error) throw error

  const total = data.length
  const activos = data.filter(e => e.activo).length
  const disponibles = data.filter(e => e.estado === 'disponible').length
  const enUso = data.filter(e => e.estado === 'en_uso').length
  const enMantenimiento = data.filter(e => e.estado === 'mantenimiento').length
  const lokomat = data.filter(e => e.tipo === 'lokomat').length

  return {
    total,
    activos,
    disponibles,
    enUso,
    enMantenimiento,
    lokomat,
    porcentajeDisponibles: total > 0 ? Math.round((disponibles / total) * 100) : 0,
  }
}

// ── Obtener equipos disponibles ──────────────────────────────
export async function getEquiposDisponibles(): Promise<Equipo[]> {
  return getEquipos({
    activo: true,
  })
}

// ── Marcar equipo en mantenimiento ───────────────────────────
export async function marcarMantenimiento(
  id: string,
  fechaProximoMantenimiento?: string
): Promise<Equipo> {
  const updates: Partial<Equipo> = {
    estado: 'mantenimiento',
  }

  if (fechaProximoMantenimiento) {
    updates.mantenimiento_proximo = fechaProximoMantenimiento
  }

  return updateEquipo(id, updates)
}

// ── Liberar equipo de mantenimiento ──────────────────────────
export async function liberarDeMantenimiento(id: string): Promise<Equipo> {
  return updateEquipo(id, {
    estado: 'disponible',
  })
}
