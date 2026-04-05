import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('gastos_mensuales')
      .select('*')
      .order('dia_de_cobro', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre_app, categoria, dia_de_cobro, monto, activo, cuenta } = body

    if (!nombre_app || monto == null || monto <= 0) {
      return NextResponse.json({ error: 'nombre_app y monto (>0) son requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('gastos_mensuales')
      .insert({
        nombre_app,
        categoria: categoria || 'Tecnología',
        dia_de_cobro: dia_de_cobro || 1,
        monto,
        activo: activo ?? true,
        cuenta: cuenta || 'Personal',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
