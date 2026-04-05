import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function isIngreso(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'ingreso' || t === 'income' || t === 'entrada'
}

function isGasto(tipo: string): boolean {
  const t = tipo.toLowerCase()
  return t === 'gasto' || t === 'expense' || t === 'egreso' || t === 'salida'
}

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: allTx, error } = await supabase
      .from('transacciones')
      .select('tipo, monto, fecha_hora, estado')
      .order('fecha_hora', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transactions = allTx || []

    // Agrupar por año-mes
    const grouped = new Map<string, { anio: number; mes: number; ingresos: number; gastos: number; count: number }>()

    for (const tx of transactions) {
      if (tx.estado === 'cancelado') continue
      const date = new Date(tx.fecha_hora)
      const anio = date.getFullYear()
      const mes = date.getMonth() + 1
      const key = `${anio}-${String(mes).padStart(2, '0')}`

      if (!grouped.has(key)) {
        grouped.set(key, { anio, mes, ingresos: 0, gastos: 0, count: 0 })
      }

      const entry = grouped.get(key)!
      entry.count++

      if (tx.estado === 'pendiente') continue // solo contar pagados en totales

      if (isIngreso(tx.tipo)) {
        entry.ingresos += tx.monto ?? 0
      } else if (isGasto(tx.tipo)) {
        entry.gastos += tx.monto ?? 0
      }
    }

    // Convertir a array ordenado DESC
    const meses = Array.from(grouped.values())
      .sort((a, b) => b.anio - a.anio || b.mes - a.mes)
      .map((m) => ({
        anio: m.anio,
        mes: m.mes,
        nombreMes: `${MESES[m.mes]} ${m.anio}`,
        totalTransacciones: m.count,
        totalIngresos: Math.round(m.ingresos * 100) / 100,
        totalGastos: Math.round(m.gastos * 100) / 100,
        balance: Math.round((m.ingresos - m.gastos) * 100) / 100,
      }))

    return NextResponse.json({ meses })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
