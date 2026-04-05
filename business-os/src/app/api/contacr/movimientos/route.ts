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

    let query = supabase
      .from('contacr_movimientos')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tenant_id', user.id)
      .order('fecha', { ascending: false })

    const tipo = searchParams.get('tipo')
    if (tipo) query = query.eq('tipo', tipo)

    const desde = searchParams.get('desde')
    if (desde) query = query.gte('fecha', desde)

    const hasta = searchParams.get('hasta')
    if (hasta) query = query.lte('fecha', hasta)

    const { data, error } = await query.limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
