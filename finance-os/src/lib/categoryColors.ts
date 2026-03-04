/**
 * Sistema centralizado de categorías y colores
 * FUENTE ÚNICA DE VERDAD para toda la app
 */

// ===== CATEGORÍAS DE GASTOS =====
export const EXPENSE_CATEGORIES = [
  // Lavandería
  'Insumos Lavandería',
  'Mantenimiento Lavandería',
  // Mobility
  'Gasolina',
  'Mantenimiento Vehículo',
  // Seguros
  'Herramientas Seguros',
  // Operativos (compartidos)
  'Nómina',
  'Renta',
  'Servicios',
  'Publicidad',
  'Transporte',
  // Personal
  'Comida',
  'Entretenimiento',
  'Salud',
  // Tecnología
  'Software',
  'Hosting',
  'Otros',
] as const

// ===== CATEGORÍAS DE INGRESOS =====
export const INCOME_CATEGORIES = [
  'Ventas Lavandería',
  'Ride Mobility',
  'Comisión Seguros',
  'Salario',
  'Freelance',
  'Otros Ingresos',
] as const

// ===== CATEGORÍA DE TRANSFERENCIAS =====
export const TRANSFER_CATEGORY = 'Transferencia' as const

// Types derivados
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]
export type TransferCategory = typeof TRANSFER_CATEGORY

// ===== COLORES POR CATEGORÍA =====
export const CATEGORY_COLORS: Record<string, string> = {
  // Lavandería
  'Insumos Lavandería': '#0EA5E9',     // Sky
  'Mantenimiento Lavandería': '#38BDF8',// Sky claro
  // Mobility
  'Gasolina': '#F59E0B',               // Ámbar
  'Mantenimiento Vehículo': '#FBBF24', // Amarillo
  // Seguros
  'Herramientas Seguros': '#A78BFA',   // Violeta claro
  // Operativos
  'Nómina': '#6366F1',                 // Índigo
  'Renta': '#EF4444',                  // Rojo
  'Servicios': '#14B8A6',              // Teal
  'Publicidad': '#F97316',             // Naranja
  'Transporte': '#84CC16',             // Lima
  // Personal
  'Comida': '#22C55E',                 // Verde
  'Entretenimiento': '#EC4899',        // Pink
  'Salud': '#10B981',                  // Esmeralda
  // Tecnología
  'Software': '#8B5CF6',               // Morado
  'Hosting': '#7C3AED',                // Violeta
  'Otros': '#94A3B8',                  // Gris

  // Ingresos
  'Ventas Lavandería': '#22C55E',      // Verde
  'Ride Mobility': '#F59E0B',          // Ámbar
  'Comisión Seguros': '#6366F1',       // Índigo
  'Salario': '#10B981',                // Esmeralda
  'Freelance': '#F97316',              // Naranja
  'Otros Ingresos': '#94A3B8',         // Gris

  // Transferencias
  'Transferencia': '#8B5CF6',          // Morado
}

export const DEFAULT_CATEGORY_COLOR = '#6B7280'

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR
}
