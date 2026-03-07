export type Ubicacion = 'Bodega' | 'Vestidores' | 'Consultorios' | 'Lavandería (Propia)'

export const UBICACIONES: Ubicacion[] = [
  'Bodega',
  'Vestidores',
  'Consultorios',
  'Lavandería (Propia)',
]

export type TipoMovimiento = 'entrada' | 'traslado'

export interface Insumo {
  id: string
  nombre: string
  descripcion: string | null
  unidad_medida: string
  created_at: string
}

export interface MovimientoInventario {
  id: string
  insumo_id: string
  origen: Ubicacion | null
  destino: Ubicacion | null
  cantidad: number
  usuario_id: string
  notas: string | null
  created_at: string
}

export type MovimientoInsert = Omit<MovimientoInventario, 'id' | 'created_at'>

export interface StockPorUbicacion {
  insumo_id: string
  insumo_nombre: string
  ubicacion: string
  cantidad: number
}
