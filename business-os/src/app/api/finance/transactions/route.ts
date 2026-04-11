import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .order('fecha_hora', { ascending: false })
      .limit(100)

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
    const { tipo, monto, categoria, descripcion, fecha_hora, cuenta, cuenta_destino, estado, moneda, tasa_cambio } = body

    if (!tipo || monto == null || monto <= 0) {
      return NextResponse.json({ error: 'tipo y monto (>0) son requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('transacciones')
      .insert({
        tipo,
        monto,
        categoria: categoria || null,
        descripcion: descripcion || null,
        fecha_hora: fecha_hora || new Date().toISOString(),
        cuenta: cuenta || null,
        cuenta_destino: cuenta_destino || null,
        estado: estado || 'pagado',
        moneda: moneda || 'USD',
        tasa_cambio: tasa_cambio || 1.0,
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
