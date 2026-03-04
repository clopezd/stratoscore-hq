/**
 * Finance OS client — consulta directa a la REST API de Supabase
 * para tablas de Finance OS.
 *
 * Tabla: transacciones
 * Columnas: id, tipo, monto, categoria, descripcion, fecha_hora, cuenta, cuenta_destino, created_at
 *
 * Usa ANALYTICS_SUPABASE_URL + ANALYTICS_SUPABASE_KEY desde config.ts.
 * Si las vars están vacías, retorna null.
 */

import { ANALYTICS_SUPABASE_URL, ANALYTICS_SUPABASE_KEY } from './config.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Transaccion {
  id: string
  tipo: string           // 'ingreso' | 'gasto' | 'transferencia'
  monto: number
  categoria: string | null
  descripcion: string | null
  fecha_hora: string
  cuenta: string | null
  estado: string | null  // 'pendiente' | 'pagado' | 'cancelado'
  created_at: string
}

export interface RecurringExpense {
  id: string
  nombre?: string
  name?: string
  monto?: number
  amount?: number
  frecuencia?: string
  frequency?: string
  activo?: boolean
  is_active?: boolean
}

export interface FinanceSummary {
  month: string
  income: number
  expenses: number
  net_balance: number
  recent_transactions: Transaccion[]
  pending_amount: number   // suma de transacciones con estado 'pendiente'
  active_recurring_monthly: number
  generated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function supabaseHeaders(): HeadersInit {
  return {
    'apikey': ANALYTICS_SUPABASE_KEY,
    'Authorization': `Bearer ${ANALYTICS_SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function supabaseGet(table: string, params: string): Promise<unknown> {
  const url = `${ANALYTICS_SUPABASE_URL}/rest/v1/${table}?${params}`
  const res = await fetch(url, { headers: supabaseHeaders() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${res.status}: ${text}`)
  }
  return res.json()
}

// Detecta si el tipo es ingreso (acepta variantes en/es)
function isIngreso(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'ingreso' || t === 'income' || t === 'entrada'
}

// Detecta si el tipo es gasto
function isGasto(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'gasto' || t === 'expense' || t === 'egreso' || t === 'salida'
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Retorna resumen financiero del mes actual.
 * Retorna null si ANALYTICS_SUPABASE_URL o ANALYTICS_SUPABASE_KEY no están configuradas.
 */
export async function getFinanceSummary(): Promise<FinanceSummary | null> {
  if (!ANALYTICS_SUPABASE_URL || !ANALYTICS_SUPABASE_KEY) {
    return null
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const monthStart = `${year}-${month}-01T00:00:00`
  const monthLabel = `${year}-${month}`

  // Fetch transacciones del mes actual
  const allTx = (await supabaseGet(
    'transacciones',
    `select=id,tipo,monto,categoria,descripcion,fecha_hora,cuenta,estado,created_at&fecha_hora=gte.${monthStart}&order=fecha_hora.desc`
  )) as Transaccion[]

  // Solo contar transacciones pagadas en ingresos/gastos reales
  const paidTx = allTx.filter((t) => !t.estado || t.estado === 'pagado')

  const income = paidTx
    .filter((t) => isIngreso(t.tipo))
    .reduce((sum, t) => sum + (t.monto ?? 0), 0)

  const expenses = paidTx
    .filter((t) => isGasto(t.tipo))
    .reduce((sum, t) => sum + (t.monto ?? 0), 0)

  // Monto total pendiente de pago
  const pending_amount = allTx
    .filter((t) => t.estado === 'pendiente')
    .reduce((sum, t) => sum + (t.monto ?? 0), 0)

  const recent_transactions = allTx.slice(0, 5)

  // Gastos recurrentes activos — estimación mensual
  let active_recurring_monthly = 0
  try {
    // Intentar nombres de tabla comunes
    for (const table of ['gastos_recurrentes', 'recurring_expenses', 'suscripciones']) {
      try {
        const recurring = (await supabaseGet(table, 'select=*')) as RecurringExpense[]
        for (const r of recurring) {
          const active = r.activo ?? r.is_active ?? true
          if (!active) continue
          const amount = r.monto ?? r.amount ?? 0
          const freq = (r.frecuencia ?? r.frequency ?? 'monthly').toLowerCase()
          if (freq === 'mensual' || freq === 'monthly') active_recurring_monthly += amount
          else if (freq === 'semanal' || freq === 'weekly') active_recurring_monthly += amount * 4.33
          else if (freq === 'anual' || freq === 'yearly' || freq === 'annual') active_recurring_monthly += amount / 12
          else active_recurring_monthly += amount
        }
        break // éxito — salir del loop
      } catch {
        // tabla no existe, probar la siguiente
        continue
      }
    }
  } catch {
    // Non-fatal
  }

  return {
    month: monthLabel,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    net_balance: Math.round((income - expenses) * 100) / 100,
    recent_transactions,
    pending_amount: Math.round(pending_amount * 100) / 100,
    active_recurring_monthly: Math.round(active_recurring_monthly * 100) / 100,
    generated_at: new Date().toISOString(),
  }
}
