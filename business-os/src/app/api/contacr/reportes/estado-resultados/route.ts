import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresa_id')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (!empresaId) return NextResponse.json({ error: 'empresa_id requerido' }, { status: 400 })

    // Obtener empresa
    const { data: empresa } = await supabase
      .from('contacr_empresas')
      .select('nombre, cedula_juridica')
      .eq('id', empresaId)
      .eq('tenant_id', user.id)
      .single()

    if (!empresa) return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })

    // Obtener movimientos del período
    let query = supabase
      .from('contacr_movimientos')
      .select('tipo, categoria, monto')
      .eq('empresa_id', empresaId)
      .eq('tenant_id', user.id)

    if (desde) query = query.gte('fecha', desde)
    if (hasta) query = query.lte('fecha', hasta)

    const { data: movimientos, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = movimientos || []

    // Agrupar ingresos por categoría
    const ingresosMap = new Map<string, number>()
    const gastosMap = new Map<string, number>()
    let totalIngresos = 0
    let totalGastos = 0

    for (const m of rows) {
      const cat = m.categoria || 'Sin categoría'
      const monto = Number(m.monto)
      if (m.tipo === 'ingreso') {
        ingresosMap.set(cat, (ingresosMap.get(cat) || 0) + monto)
        totalIngresos += monto
      } else {
        gastosMap.set(cat, (gastosMap.get(cat) || 0) + monto)
        totalGastos += monto
      }
    }

    const ingresos = Array.from(ingresosMap.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)

    const gastos = Array.from(gastosMap.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)

    const utilidadBruta = totalIngresos
    const utilidadNeta = totalIngresos - totalGastos

    return NextResponse.json({
      empresa: empresa.nombre,
      cedula: empresa.cedula_juridica,
      periodo: { desde: desde || 'Inicio', hasta: hasta || 'Actual' },
      ingresos,
      totalIngresos,
      gastos,
      totalGastos,
      utilidadBruta,
      utilidadNeta,
      margenNeto: totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
