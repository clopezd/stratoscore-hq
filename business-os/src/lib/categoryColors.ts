// Categorías de gastos
export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Tecnología',
  'Otros',
] as const

// Categorías de ingresos
export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Negocios',
  'Inversiones',
  'Rentas',
  'Otros',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
export type IncomeCategory = typeof INCOME_CATEGORIES[number]

// Colores dual mode: light + dark compatible
const CATEGORY_COLORS: Record<string, string> = {
  // Gastos
  'Alimentación': 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
  'Transporte': 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'Vivienda': 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
  'Servicios': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  'Salud': 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
  'Educación': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  'Entretenimiento': 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
  'Ropa': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  'Tecnología': 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
  'Otros': 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30',

  // Ingresos
  'Salario': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'Freelance': 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
  'Negocios': 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'Inversiones': 'bg-lime-500/20 text-lime-700 dark:text-lime-300 border-lime-500/30',
  'Rentas': 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Otros']
}
