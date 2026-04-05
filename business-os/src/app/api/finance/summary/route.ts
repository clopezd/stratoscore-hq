import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Tasa USD/MXN por defecto (configurable)
const DEFAULT_USD_MXN_RATE = 17.5

function isIngreso(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'ingreso' || t === 'income' || t === 'entrada'
}

function isGasto(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'gasto' || t === 'expense' || t === 'egreso' || t === 'salida'
}

/** Normaliza un monto a USD usando moneda y tasa_cambio */
function toUSD(monto: number, moneda?: string | null, tasa_cambio?: number | null): number {
  if (!moneda || moneda === 'USD') return monto
  const rate = tasa_cambio || DEFAULT_USD_MXN_RATE
  if (moneda === 'MXN') return monto / rate
  return monto // monedas desconocidas se tratan como USD
}

export async function GET() {
  try {
    const supabase = createServiceClient()

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const monthStart = `${year}-${month}-01T00:00:00`
    const monthLabel = `${year}-${month}`

    // Transacciones del mes
    const { data: allTx, error: txError } = await supabase
      .from('transacciones')
      .select('id, tipo, monto, categoria, descripcion, fecha_hora, cuenta, estado, moneda, tasa_cambio, created_at')
      .gte('fecha_hora', monthStart)
      .order('fecha_hora', { ascending: false })

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    const transactions = allTx || []
    const paidTx = transactions.filter(t => !t.estado || t.estado === 'pagado')

    const income = paidTx
      .filter(t => isIngreso(t.tipo))
      .reduce((sum, t) => sum + toUSD(t.monto ?? 0, t.moneda, t.tasa_cambio), 0)

    const expenses = paidTx
      .filter(t => isGasto(t.tipo))
      .reduce((sum, t) => sum + toUSD(t.monto ?? 0, t.moneda, t.tasa_cambio), 0)

    const pending_amount = transactions
      .filter(t => t.estado === 'pendiente')
      .reduce((sum, t) => sum + toUSD(t.monto ?? 0, t.moneda, t.tasa_cambio), 0)

    // Gastos recurrentes mensuales
    let active_recurring_monthly = 0

    const { data: gastosMensuales } = await supabase
      .from('gastos_mensuales')
      .select('monto, activo')
      .eq('activo', true)

    if (gastosMensuales) {
      for (const g of gastosMensuales) {
        active_recurring_monthly += g.monto ?? 0
      }
    }

    // Gastos anuales prorrateados
    const { data: gastosAnuales } = await supabase
      .from('gastos_anuales')
      .select('monto, activo')
      .eq('activo', true)

    if (gastosAnuales) {
      for (const g of gastosAnuales) {
        active_recurring_monthly += (g.monto ?? 0) / 12
      }
    }

    // Legacy: gastos_recurrentes (si existe)
    try {
      const { data: recurring } = await supabase
        .from('gastos_recurrentes')
        .select('*')
        .eq('activo', true)

      if (recurring) {
        for (const r of recurring) {
          const amount = r.monto ?? 0
          const freq = (r.frecuencia ?? 'mensual').toLowerCase()
          if (freq === 'mensual' || freq === 'monthly') active_recurring_monthly += amount
          else if (freq === 'semanal' || freq === 'weekly') active_recurring_monthly += amount * 4.33
          else if (freq === 'anual' || freq === 'yearly' || freq === 'annual') active_recurring_monthly += amount / 12
          else active_recurring_monthly += amount
        }
      }
    } catch {
      // tabla no existe, no pasa nada
    }

    return NextResponse.json({
      month: monthLabel,
      currency: 'USD',
      usd_mxn_rate: DEFAULT_USD_MXN_RATE,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      net_balance: Math.round((income - expenses) * 100) / 100,
      recent_transactions: transactions.slice(0, 10),
      pending_amount: Math.round(pending_amount * 100) / 100,
      active_recurring_monthly: Math.round(active_recurring_monthly * 100) / 100,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
