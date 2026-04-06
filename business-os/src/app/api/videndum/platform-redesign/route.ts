import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface PlatformRedesignPayload {
  // SECCIÓN 1: USO DE LAS PESTAÑAS ACTUALES
  uses_dashboard?: boolean
  dashboard_frequency?: string
  dashboard_useful_elements?: string[]
  dashboard_missing?: string

  uses_planning?: boolean
  planning_frequency?: string
  planning_useful_elements?: string[]
  planning_missing?: string

  uses_ml_forecast?: boolean
  ml_forecast_frequency?: string
  ml_forecast_useful_elements?: string[]
  ml_forecast_missing?: string

  uses_analysis?: boolean
  analysis_frequency?: string
  analysis_useful_elements?: string[]
  analysis_missing?: string

  uses_ingesta?: boolean
  ingesta_frequency?: string
  ingesta_useful_elements?: string[]
  ingesta_missing?: string

  // SECCIÓN 2: KPIs Y MÉTRICAS
  current_kpis_used?: string[]
  missing_kpis?: string[]
  kpi_priority_order?: string[]

  // SECCIÓN 3: VISUALIZACIONES
  useful_charts?: string[]
  missing_charts?: string[]
  preferred_chart_types?: string[]
  chart_complaints?: string

  // SECCIÓN 4: FILTROS Y SEGMENTADORES
  uses_year_filter?: boolean
  uses_month_filter?: boolean
  uses_sku_filter?: boolean
  uses_type_filter?: boolean
  missing_filters?: string[]
  filter_problems?: string

  // SECCIÓN 5: FLUJO DE TRABAJO
  typical_workflow?: string
  time_spent_per_session?: string
  frequency_of_use?: string
  pain_points?: string
  manual_workarounds?: string

  // SECCIÓN 6: PREGUNTAS QUE QUIERES RESPONDER
  key_questions?: string[]
  decision_types?: string[]

  // SECCIÓN 7: ORDEN Y ORGANIZACIÓN
  preferred_tab_order?: string[]
  tabs_to_remove?: string[]
  tabs_to_merge?: string
  preferred_layout?: string

  // SECCIÓN 8: OTRAS FUNCIONALIDADES
  needs_alerts?: boolean
  alert_examples?: string[]
  needs_export?: boolean
  export_formats_needed?: string[]
  needs_collaboration?: boolean
  collaboration_needs?: string
  needs_mobile?: boolean
  mobile_use_cases?: string

  // SECCIÓN 9: FEEDBACK LIBRE
  what_works_well?: string
  what_frustrates?: string
  dream_features?: string
  additional_comments?: string
}

/**
 * POST /api/videndum/platform-redesign
 * Guarda el feedback del cliente para rediseñar la plataforma Videndum
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: PlatformRedesignPayload = await request.json()

    const { data, error } = await supabase
      .from('platform_redesign_feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        submitted_at: new Date().toISOString(),
        status: 'pending',
        ...payload
      })
      .select()
      .single()

    if (error) {
      console.error('[platform-redesign] Error inserting feedback:', error)
      return NextResponse.json(
        { error: `Error guardando feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '¡Gracias por tu feedback! Usaremos esta información para rediseñar la plataforma según tus necesidades.'
    })
  } catch (e) {
    console.error('[platform-redesign] Error processing request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/videndum/platform-redesign
 * Obtiene feedback del usuario actual (o todos si es admin)
 */
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin'

    let query = supabase
      .from('platform_redesign_feedback')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('[platform-redesign] Error fetching feedback:', error)
      return NextResponse.json(
        { error: `Error obteniendo feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[platform-redesign] Error processing GET request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/videndum/platform-redesign/:id
 * Actualiza el status del feedback (solo admins)
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID y status son requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('platform_redesign_feedback')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[platform-redesign] Error updating status:', error)
      return NextResponse.json(
        { error: `Error actualizando status: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('[platform-redesign] Error processing PATCH request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
