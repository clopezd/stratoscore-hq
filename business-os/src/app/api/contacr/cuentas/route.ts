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

    const { data, error } = await supabase
      .from('contacr_cuentas')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('tenant_id', user.id)
      .eq('activa', true)
      .order('codigo')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { empresa_id, codigo, nombre, tipo, naturaleza, nivel, padre_id, acepta_movimientos } = body

    if (!empresa_id || !codigo || !nombre || !tipo || !naturaleza || !nivel) {
      return NextResponse.json({ error: 'Campos requeridos: empresa_id, codigo, nombre, tipo, naturaleza, nivel' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('contacr_cuentas')
      .insert({
        empresa_id,
        tenant_id: user.id,
        codigo,
        nombre,
        tipo,
        naturaleza,
        nivel,
        padre_id: padre_id || null,
        acepta_movimientos: acepta_movimientos ?? false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
