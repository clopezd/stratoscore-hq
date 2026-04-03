import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Client {
  id: string
  name: string
  tagline: string
  logo_url: string | null
  status: 'active' | 'paused' | 'archived'
  dashboard_url: string
  primary_metric_label: string | null
  primary_metric_value: string | null
  secondary_metric_label: string | null
  secondary_metric_value: string | null
  alerts_count: number
  tasks_count: number
  last_activity_action: string | null
  last_activity_timestamp: string | null
  brand_color: string
}

interface ActivityItem {
  id: number
  client_id: string
  client_name: string
  action: string
  severity: 'info' | 'warning' | 'success' | 'error'
  icon: string
  created_at: string
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Obtener tasks de la tabla principal
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')

    // Clientes del portafolio con estados reales
    const clients: Client[] = [
      {
        id: 'cleanxpress',
        name: 'C&C Clean Xpress',
        tagline: 'Lavandería Industrial',
        logo_url: null,
        status: 'active',
        dashboard_url: 'https://lavanderia.stratoscore.app/logistica',
        primary_metric_label: 'ESTADO',
        primary_metric_value: 'En producción',
        secondary_metric_label: 'Pendientes',
        secondary_metric_value: '8',
        alerts_count: 1,
        tasks_count: 5,
        last_activity_action: '12 órdenes completadas',
        last_activity_timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        brand_color: '#06b6d4',
      },
      {
        id: 'videndum',
        name: 'Videndum',
        tagline: 'Sales Intelligence Platform',
        logo_url: '/assets/videndum-logo.png',
        status: 'active',
        dashboard_url: '/videndum',
        primary_metric_label: 'ESTADO',
        primary_metric_value: 'En desarrollo',
        secondary_metric_label: null,
        secondary_metric_value: null,
        alerts_count: 2,
        tasks_count: tasks?.filter(t => t.status !== 'done').length || 8,
        last_activity_action: 'Nuevo forecast ML generado',
        last_activity_timestamp: new Date().toISOString(),
        brand_color: '#7c3aed',
      },
      {
        id: 'mobility',
        name: 'Mobility',
        tagline: 'Centro de Rehabilitación',
        logo_url: 'https://mobilitygroup.co/wp-content/uploads/2022/11/LOGOS-MOBILITY-e1669820172138.png',
        status: 'active',
        dashboard_url: '/mobility',
        primary_metric_label: 'ESTADO',
        primary_metric_value: 'En desarrollo',
        secondary_metric_label: null,
        secondary_metric_value: null,
        alerts_count: 0,
        tasks_count: 12,
        last_activity_action: '3 evaluaciones completadas',
        last_activity_timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        brand_color: '#4472B8',
      },
      {
        id: 'totalcom',
        name: 'Totalcom',
        tagline: 'API Integration Project',
        logo_url: null,
        status: 'paused',
        dashboard_url: '/totalcom',
        primary_metric_label: 'ESTADO',
        primary_metric_value: 'Idea / Propuesta',
        secondary_metric_label: null,
        secondary_metric_value: null,
        alerts_count: 0,
        tasks_count: 3,
        last_activity_action: 'Propuesta enviada',
        last_activity_timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        brand_color: '#3b82f6',
      },
    ]

    // Actividades hardcoded
    const activities: ActivityItem[] = [
      {
        id: 1,
        client_id: 'videndum',
        client_name: 'Videndum',
        action: 'Nuevo forecast ML generado',
        severity: 'info',
        icon: '📊',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        client_id: 'mobility',
        client_name: 'Mobility',
        action: '3 evaluaciones completadas',
        severity: 'success',
        icon: '✅',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        client_id: 'videndum',
        client_name: 'Videndum',
        action: 'Nuevo forecast ML generado',
        severity: 'info',
        icon: '📈',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Calcular stats globales
    const stats = {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalTasks: clients.reduce((sum, c) => sum + (c.tasks_count || 0), 0),
      totalAlerts: clients.reduce((sum, c) => sum + (c.alerts_count || 0), 0),
    }

    return NextResponse.json({
      clients,
      activities,
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
