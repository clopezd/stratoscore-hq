import { createClient } from '@/lib/supabase/client'
import type {
  LeadMobility,
  LeadMobilityInsert,
  LeadMobilityUpdate,
} from '../types/database'

// ── Obtener todos los leads ──────────────────────────────────
export async function getLeads(filtros?: {
  estado?: string
  fuente?: string
  limite?: number
}): Promise<LeadMobility[]> {
  const supabase = createClient()

  let query = supabase
    .from('leads_mobility')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros?.fuente) {
    query = query.eq('fuente', filtros.fuente)
  }

  if (filtros?.limite) {
    query = query.limit(filtros.limite)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ── Crear nuevo lead (formulario público) ───────────────────
export async function createLead(lead: LeadMobilityInsert): Promise<LeadMobility> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads_mobility')
    .insert({
      ...lead,
      estado: 'nuevo',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Actualizar lead ──────────────────────────────────────────
export async function updateLead(
  id: string,
  updates: LeadMobilityUpdate
): Promise<LeadMobility> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads_mobility')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Marcar lead como contactado ──────────────────────────────
export async function marcarContactado(id: string, notas?: string): Promise<LeadMobility> {
  return updateLead(id, {
    estado: 'contactado',
    contactado_en: new Date().toISOString(),
    notas: notas || undefined,
  })
}

// ── Convertir lead a paciente ────────────────────────────────
export async function convertirAPaciente(
  leadId: string,
  pacienteId: string
): Promise<LeadMobility> {
  return updateLead(leadId, {
    estado: 'convertido',
    convertido_a_paciente_id: pacienteId,
  })
}

// ── Descartar lead ───────────────────────────────────────────
export async function descartarLead(id: string, motivo?: string): Promise<LeadMobility> {
  return updateLead(id, {
    estado: 'descartado',
    notas: motivo || undefined,
  })
}

// ── Estadísticas de leads ────────────────────────────────────
export async function getEstadisticasLeads() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads_mobility')
    .select('estado, fuente')

  if (error) throw error

  const total = data.length
  const nuevos = data.filter(l => l.estado === 'nuevo').length
  const contactados = data.filter(l => l.estado === 'contactado').length
  const convertidos = data.filter(l => l.estado === 'convertido').length
  const descartados = data.filter(l => l.estado === 'descartado').length

  // Estadísticas por fuente
  const porFuente = data.reduce((acc, lead) => {
    const fuente = lead.fuente || 'sin_fuente'
    acc[fuente] = (acc[fuente] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    nuevos,
    contactados,
    convertidos,
    descartados,
    tasaConversion: total > 0 ? Math.round((convertidos / total) * 100) : 0,
    porFuente,
  }
}

// ── Obtener leads nuevos (sin contactar) ─────────────────────
export async function getLeadsNuevos(): Promise<LeadMobility[]> {
  return getLeads({ estado: 'nuevo' })
}

// ── Obtener leads pendientes (nuevo + contactado) ────────────
export async function getLeadsPendientes(): Promise<LeadMobility[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads_mobility')
    .select('*')
    .in('estado', ['nuevo', 'contactado', 'evaluacion_agendada'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
