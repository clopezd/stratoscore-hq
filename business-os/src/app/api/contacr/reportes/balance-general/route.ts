import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresa_id')
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

    // Obtener todos los movimientos hasta la fecha
    let query = supabase
      .from('contacr_movimientos')
      .select('tipo, categoria, monto')
      .eq('empresa_id', empresaId)
      .eq('tenant_id', user.id)

    if (hasta) query = query.lte('fecha', hasta)

    const { data: movimientos, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = movimientos || []

    // Calcular totales
    let totalIngresos = 0
    let totalGastos = 0

    for (const m of rows) {
      const monto = Number(m.monto)
      if (m.tipo === 'ingreso') totalIngresos += monto
      else totalGastos += monto
    }

    const utilidadAcumulada = totalIngresos - totalGastos

    // Balance General simplificado basado en movimientos
    // Nota: Con partida doble esto será más preciso
    const activos = {
      label: 'ACTIVOS',
      items: [
        {
          label: 'Activo Corriente',
          items: [
            { cuenta: 'Efectivo y equivalentes', monto: utilidadAcumulada > 0 ? utilidadAcumulada : 0 },
            { cuenta: 'Cuentas por cobrar', monto: 0 },
          ]
        },
        {
          label: 'Activo No Corriente',
          items: [
            { cuenta: 'Propiedad, planta y equipo', monto: 0 },
          ]
        }
      ],
      total: utilidadAcumulada > 0 ? utilidadAcumulada : 0,
    }

    const pasivos = {
      label: 'PASIVOS',
      items: [
        {
          label: 'Pasivo Corriente',
          items: [
            { cuenta: 'Cuentas por pagar', monto: utilidadAcumulada < 0 ? Math.abs(utilidadAcumulada) : 0 },
            { cuenta: 'Impuestos por pagar', monto: 0 },
          ]
        },
        {
          label: 'Pasivo No Corriente',
          items: [
            { cuenta: 'Préstamos a largo plazo', monto: 0 },
          ]
        }
      ],
      total: utilidadAcumulada < 0 ? Math.abs(utilidadAcumulada) : 0,
    }

    const patrimonio = {
      label: 'PATRIMONIO',
      items: [
        { cuenta: 'Capital social', monto: 0 },
        { cuenta: 'Utilidad acumulada', monto: utilidadAcumulada },
      ],
      total: utilidadAcumulada,
    }

    const totalPasivoPatrimonio = pasivos.total + patrimonio.total

    return NextResponse.json({
      empresa: empresa.nombre,
      cedula: empresa.cedula_juridica,
      fecha: hasta || new Date().toISOString().split('T')[0],
      activos,
      pasivos,
      patrimonio,
      totalActivos: activos.total,
      totalPasivos: pasivos.total,
      totalPatrimonio: patrimonio.total,
      totalPasivoPatrimonio,
      cuadra: Math.abs(activos.total - totalPasivoPatrimonio) < 0.01,
      nota: 'Balance simplificado basado en movimientos importados. Para mayor precisión, usar asientos contables con partida doble.',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
