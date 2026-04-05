// ══ ContaCR Types ══

export interface Empresa {
  id: string
  tenant_id: string
  nombre: string
  cedula_juridica: string | null
  tipo_persona: 'fisica' | 'juridica'
  actividad_economica: string | null
  moneda: string
  activa: boolean
  created_at: string
}

export interface EmpresaInput {
  nombre: string
  cedula_juridica?: string
  tipo_persona?: 'fisica' | 'juridica'
  actividad_economica?: string
  moneda?: string
}

export interface Cuenta {
  id: string
  empresa_id: string
  tenant_id: string
  codigo: string
  nombre: string
  tipo: CuentaTipo
  naturaleza: 'deudora' | 'acreedora'
  nivel: 1 | 2 | 3 | 4
  padre_id: string | null
  acepta_movimientos: boolean
  activa: boolean
  created_at: string
}

export type CuentaTipo = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto' | 'costo'

export interface Movimiento {
  id: string
  empresa_id: string
  tenant_id: string
  fecha: string
  descripcion: string
  tipo: 'ingreso' | 'gasto'
  categoria: string | null
  monto: number
  referencia: string | null
  cuenta_codigo: string | null
  origen: string
  created_at: string
}

export interface DashboardKPIs {
  totalIngresos: number
  totalGastos: number
  balance: number
  movimientosCount: number
}

export interface CategoriaSummary {
  categoria: string
  total: number
  porcentaje: number
  count: number
}

export interface TendenciaMensual {
  mes: string
  ingresos: number
  gastos: number
}

export interface ImportResult {
  importados: number
  errores: number
  detalleErrores: string[]
  totalIngresos: number
  totalGastos: number
}
