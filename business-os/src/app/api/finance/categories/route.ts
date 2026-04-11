import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('finance_categories')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const body = await req.json()
    const { nombre, tipo, icono, color } = body

    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'nombre y tipo son requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('finance_categories')
      .insert({
        nombre,
        tipo,
        icono: icono || null,
        color: color || null,
        activo: true,
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
