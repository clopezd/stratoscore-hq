import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresa_id')
    if (!empresaId) return NextResponse.json({ error: 'empresa_id requerido' }, { status: 400 })

    const { data: movimientos, error } = await supabase
      .from('contacr_movimientos')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tenant_id', user.id)
      .order('fecha', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = movimientos || []

    // KPIs
    const totalIngresos = rows
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + Number(m.monto), 0)
    const totalGastos = rows
      .filter((m) => m.tipo === 'gasto')
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const kpis = {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      movimientosCount: rows.length,
    }

    // Categorías
    const categoriasIngreso = groupByCategory(rows.filter((m) => m.tipo === 'ingreso'))
    const categoriasGasto = groupByCategory(rows.filter((m) => m.tipo === 'gasto'))

    // Tendencia mensual
    const tendencia = groupByMonth(rows)

    return NextResponse.json({
      kpis,
      categorias: { ingresos: categoriasIngreso, gastos: categoriasGasto },
      tendencia,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function groupByCategory(rows: Array<{ categoria: string | null; monto: number }>) {
  const map = new Map<string, { total: number; count: number }>()
  let grandTotal = 0

  for (const r of rows) {
    const cat = r.categoria || 'Sin categoría'
    const entry = map.get(cat) || { total: 0, count: 0 }
    entry.total += Number(r.monto)
    entry.count += 1
    grandTotal += Number(r.monto)
    map.set(cat, entry)
  }

  return Array.from(map.entries())
    .map(([categoria, data]) => ({
      categoria,
      total: data.total,
      porcentaje: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

function groupByMonth(rows: Array<{ fecha: string; tipo: string; monto: number }>) {
  const map = new Map<string, { ingresos: number; gastos: number }>()

  for (const r of rows) {
    const mes = r.fecha.substring(0, 7) // YYYY-MM
    const entry = map.get(mes) || { ingresos: 0, gastos: 0 }
    if (r.tipo === 'ingreso') entry.ingresos += Number(r.monto)
    else entry.gastos += Number(r.monto)
    map.set(mes, entry)
  }

  return Array.from(map.entries())
    .map(([mes, data]) => ({ mes, ...data }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
}
