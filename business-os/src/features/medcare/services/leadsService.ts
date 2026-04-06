import { createClient } from '@/lib/supabase/client'
import type { LeadMedcare, LeadMedcareInsert, LeadMedcareUpdate } from '../types'

export async function getLeads(filtros?: {
  estado?: string
  tipo_estudio?: string
  limite?: number
}): Promise<LeadMedcare[]> {
  const supabase = createClient()

  let query = supabase
    .from('medcare_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros?.estado) query = query.eq('estado', filtros.estado)
  if (filtros?.tipo_estudio) query = query.eq('tipo_estudio', filtros.tipo_estudio)
  if (filtros?.limite) query = query.limit(filtros.limite)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createLead(lead: LeadMedcareInsert): Promise<LeadMedcare> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medcare_leads')
    .insert({ ...lead, estado: 'nuevo' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLead(id: string, updates: LeadMedcareUpdate): Promise<LeadMedcare> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medcare_leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function marcarContactado(id: string, notas?: string): Promise<LeadMedcare> {
  return updateLead(id, {
    estado: 'contactado',
    contactado_en: new Date().toISOString(),
    notas,
  })
}

export async function agendarCita(id: string, citaId: string): Promise<LeadMedcare> {
  return updateLead(id, {
    estado: 'cita_agendada',
    cita_id: citaId,
  })
}

export async function descartarLead(id: string, motivo?: string): Promise<LeadMedcare> {
  return updateLead(id, {
    estado: 'descartado',
    notas: motivo,
  })
}

export async function getEstadisticas() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medcare_leads')
    .select('estado, tipo_estudio, fuente')

  if (error) throw error

  const total = data.length
  const nuevos = data.filter(l => l.estado === 'nuevo').length
  const contactados = data.filter(l => l.estado === 'contactado').length
  const agendados = data.filter(l => l.estado === 'cita_agendada').length
  const completados = data.filter(l => l.estado === 'completado').length

  const porTipo = data.reduce((acc, l) => {
    const tipo = l.tipo_estudio || 'sin_tipo'
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    nuevos,
    contactados,
    agendados,
    completados,
    tasaConversion: total > 0 ? Math.round((agendados + completados) / total * 100) : 0,
    porTipo,
  }
}
