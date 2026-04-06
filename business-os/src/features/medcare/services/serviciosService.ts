import { createClient } from '@/lib/supabase/client'
import type { ServicioMedcare, TipoEstudio } from '../types'

export async function getServicios(tipo?: TipoEstudio): Promise<ServicioMedcare[]> {
  const supabase = createClient()

  let query = supabase
    .from('medcare_servicios')
    .select('*')
    .eq('activo', true)
    .order('tipo')
    .order('nombre')

  if (tipo) {
    query = query.eq('tipo', tipo)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getServicio(id: string): Promise<ServicioMedcare | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('medcare_servicios')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
