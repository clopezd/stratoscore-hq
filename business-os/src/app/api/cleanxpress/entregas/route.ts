import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cleanxpress/entregas
 * Lista pedidos pendientes de entrega
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    let query = supabase
      .from('cc_orders')
      .select(`
        id,
        client_name,
        bags_count,
        bags_delivered,
        pickup_day,
        pickup_time,
        status,
        delivered_at,
        delivery_notes,
        created_at
      `)
      .order('created_at', { ascending: false })

    // Filtrar por estado si se especifica
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching entregas:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: data })
  } catch (err) {
    console.error('Error in GET /api/cleanxpress/entregas:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cleanxpress/entregas
 * Registra la entrega de bolsas procesadas
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      order_id,
      bags_delivered,
      delivery_notes,
    } = body

    if (!order_id || bags_delivered === undefined) {
      return NextResponse.json(
        { error: 'order_id y bags_delivered son requeridos' },
        { status: 400 }
      )
    }

    // Actualizar el pedido con los datos de entrega
    const { data, error } = await supabase
      .from('cc_orders')
      .update({
        bags_delivered,
        delivered_at: new Date().toISOString(),
        delivery_notes: delivery_notes || null,
        status: 'entregado', // Auto-marcado como entregado
      })
      .eq('id', order_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating delivery:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (err) {
    console.error('Error in POST /api/cleanxpress/entregas:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
