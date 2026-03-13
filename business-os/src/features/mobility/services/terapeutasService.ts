import { createClient } from '@/lib/supabase/client'
import type {
  Terapeuta,
  TerapeutaInsert,
  TerapeutaUpdate,
} from '../types/database'

// ── Obtener todos los terapeutas ─────────────────────────────
export async function getTerapeutas(filtros?: {
  activo?: boolean
  lokomatCertificado?: boolean
  limite?: number
}): Promise<Terapeuta[]> {
  const supabase = createClient()

  let query = supabase
    .from('terapeutas')
    .select('*')
    .order('nombre', { ascending: true })

  if (filtros?.activo !== undefined) {
    query = query.eq('activo', filtros.activo)
  }

  if (filtros?.lokomatCertificado !== undefined) {
    query = query.eq('lokomat_certificado', filtros.lokomatCertificado)
  }

  if (filtros?.limite) {
    query = query.limit(filtros.limite)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ── Obtener un terapeuta por ID ──────────────────────────────
export async function getTerapeuta(id: string): Promise<Terapeuta | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('terapeutas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ── Crear nuevo terapeuta ────────────────────────────────────
export async function createTerapeuta(terapeuta: TerapeutaInsert): Promise<Terapeuta> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('terapeutas')
    .insert(terapeuta)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar terapeuta ─────────────────────────────────────
export async function updateTerapeuta(
  id: string,
  updates: TerapeutaUpdate
): Promise<Terapeuta> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('terapeutas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Eliminar terapeuta ───────────────────────────────────────
export async function deleteTerapeuta(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('terapeutas')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Buscar terapeutas por nombre o email ─────────────────────
export async function searchTerapeutas(query: string): Promise<Terapeuta[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('terapeutas')
    .select('*')
    .or(`nombre.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  if (error) throw error
  return data || []
}

// ── Estadísticas de terapeutas ───────────────────────────────
export async function getEstadisticasTerapeutas() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('terapeutas')
    .select('activo, lokomat_certificado')

  if (error) throw error

  const total = data.length
  const activos = data.filter(t => t.activo).length
  const certificados = data.filter(t => t.lokomat_certificado).length

  return {
    total,
    activos,
    inactivos: total - activos,
    certificados,
    porcentajeCertificados: total > 0 ? Math.round((certificados / total) * 100) : 0,
  }
}

// ── Obtener terapeutas certificados Lokomat disponibles ──────
export async function getTerapeutasCertificadosDisponibles(): Promise<Terapeuta[]> {
  return getTerapeutas({
    activo: true,
    lokomatCertificado: true,
  })
}
