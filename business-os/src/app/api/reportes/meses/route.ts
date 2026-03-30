import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MESES_NOMBRES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: transacciones, error } = await supabase
    .from('transacciones')
    .select('tipo, monto, fecha_hora')
    .order('fecha_hora', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by year-month
  const meses: Record<string, { ingresos: number; gastos: number; count: number }> = {}

  for (const t of transacciones || []) {
    const month = t.fecha_hora.substring(0, 7) // YYYY-MM
    if (!meses[month]) {
      meses[month] = { ingresos: 0, gastos: 0, count: 0 }
    }
    meses[month].count++
    const monto = Number(t.monto)
    if (t.tipo === 'ingreso') meses[month].ingresos += monto
    else if (t.tipo === 'gasto') meses[month].gastos += monto
  }

  const resumen = Object.entries(meses)
    .map(([key, data]) => {
      const [anioStr, mesStr] = key.split('-')
      const anio = parseInt(anioStr)
      const mes = parseInt(mesStr)
      return {
        anio,
        mes,
        nombreMes: `${MESES_NOMBRES[mes]} ${anio}`,
        totalTransacciones: data.count,
        totalIngresos: data.ingresos,
        totalGastos: data.gastos,
        balance: data.ingresos - data.gastos,
      }
    })
    .sort((a, b) => b.anio !== a.anio ? b.anio - a.anio : b.mes - a.mes)

  return NextResponse.json({ meses: resumen })
}
