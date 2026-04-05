import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const service = createServiceClient()

    // Leer clientes de Supabase (fuente de verdad)
    const { data: clients, error: clientsError } = await service
      .from('clients')
      .select('*')
      .neq('id', '.template')
      .order('name')

    if (clientsError) {
      return NextResponse.json({ error: clientsError.message }, { status: 500 })
    }

    // Leer actividad reciente
    const { data: activities } = await service
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Calcular stats globales
    const clientList = clients || []
    const stats = {
      totalClients: clientList.length,
      activeClients: clientList.filter((c: any) => c.status === 'active').length,
      totalTasks: clientList.reduce((sum: number, c: any) => sum + (c.tasks_count || 0), 0),
      totalAlerts: clientList.reduce((sum: number, c: any) => sum + (c.alerts_count || 0), 0),
    }

    return NextResponse.json({
      clients: clientList,
      activities: activities || [],
      stats,
    })
  } catch (e) {
    console.error('[mission-control] Error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, name, tagline, status, dashboard_url, brand_color, logo_url } = body

    if (!name) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 })
    }

    const clientId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const service = createServiceClient()
    const { data, error } = await service
      .from('clients')
      .upsert({
        id: clientId,
        name,
        tagline: tagline || `Proyecto ${name}`,
        status: status || 'active',
        dashboard_url: dashboard_url || `/${clientId}`,
        brand_color: brand_color || '#3b82f6',
        logo_url: logo_url || null,
        alerts_count: 0,
        tasks_count: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
