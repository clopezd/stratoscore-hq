import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ClientRequirementsPayload {
  // Contexto básico
  client_name: string
  contact_role?: string

  // 1️⃣ CONTEXTO DEL NEGOCIO
  business_type?: string
  number_of_skus?: number
  planning_team_size?: number
  current_tools?: string

  // 2️⃣ PROCESO ACTUAL DE FORECAST
  forecast_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
  forecast_horizon_months?: number
  forecast_method?: string
  forecast_pain_points?: string

  // 3️⃣ DATOS DISPONIBLES
  has_historical_sales?: boolean
  historical_sales_months?: number
  has_external_factors?: boolean
  external_factors_list?: string[]
  data_quality_issues?: string

  // 4️⃣ MÉTRICAS Y KPIs CRÍTICOS
  primary_kpis?: string[]
  acceptable_mape_threshold?: number
  critical_skus?: string[]
  planning_constraints?: string

  // 5️⃣ FLUJO DE DECISIONES
  who_creates_forecast?: string
  who_approves_forecast?: string
  approval_frequency?: string
  actions_on_high_variance?: string

  // 6️⃣ INTEGRACIÓN Y OUTPUTS
  needs_export?: boolean
  export_formats?: string[]
  needs_alerts?: boolean
  alert_triggers?: string[]
  integration_systems?: string[]

  // 7️⃣ VISUALIZACIÓN Y REPORTES
  preferred_charts?: string[]
  dashboard_users?: string[]
  report_frequency?: string
  mobile_access_needed?: boolean

  // 8️⃣ EXPECTATIVAS Y PRIORIDADES
  top_3_priorities?: string[]
  expected_improvement?: string
  timeline_urgency?: 'asap' | '1_month' | '3_months' | 'flexible'
  budget_range?: string

  // 9️⃣ CASOS DE USO ESPECÍFICOS
  use_case_1?: string
  use_case_2?: string
  edge_cases?: string

  // 🔟 INFORMACIÓN ADICIONAL
  success_criteria?: string
  stakeholders?: string[]
  additional_notes?: string
}

/**
 * POST /api/videndum/requirements
 * Guarda el levantamiento de requerimientos del cliente
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: ClientRequirementsPayload = await request.json()

    // Validación básica
    if (!payload.client_name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('client_requirements')
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
      console.error('[requirements] Error inserting requirements:', error)
      return NextResponse.json(
        { error: `Error guardando requerimientos: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '¡Gracias! Tus requerimientos han sido guardados. Los revisaremos y nos pondremos en contacto contigo pronto.'
    })
  } catch (e) {
    console.error('[requirements] Error processing request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/videndum/requirements
 * Obtiene los requerimientos del usuario actual (o todos si es admin)
 */
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verificar si es admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin'

    // Query: admin ve todo, usuario normal solo el suyo
    let query = supabase
      .from('client_requirements')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('[requirements] Error fetching requirements:', error)
      return NextResponse.json(
        { error: `Error obteniendo requerimientos: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[requirements] Error processing GET request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/videndum/requirements/:id
 * Actualiza el status de un requerimiento (solo admins)
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verificar si es admin
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
      .from('client_requirements')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[requirements] Error updating status:', error)
      return NextResponse.json(
        { error: `Error actualizando status: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('[requirements] Error processing PATCH request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
