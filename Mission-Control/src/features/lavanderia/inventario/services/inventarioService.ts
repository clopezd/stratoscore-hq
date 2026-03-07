import { createClient } from '@/lib/supabase/client'
import type { Insumo, MovimientoInsert, StockPorUbicacion } from '../types/inventario'

export async function getInsumos(): Promise<Insumo[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data ?? []
}

export async function createInsumo(
  nombre: string,
  unidad_medida: string,
  descripcion?: string
): Promise<Insumo> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('insumos')
    .insert({ nombre, unidad_medida, descripcion: descripcion ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function registrarMovimiento(movimiento: MovimientoInsert): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('movimientos_inventario').insert(movimiento)
  if (error) throw error
}

export async function getStockPorUbicacion(): Promise<StockPorUbicacion[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('stock_por_ubicacion').select('*')
  if (error) throw error
  return data ?? []
}
