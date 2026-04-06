import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface ClientDiscoveryPayload {
  // 1️⃣ PROCESO ACTUAL
  current_forecast_process?: string
  current_tools?: string
  time_spent_weekly?: string
  who_does_forecast?: string
  who_approves?: string
  approval_frequency?: string

  // 2️⃣ INFORMACIÓN QUE NECESITA VER
  key_metrics_needed?: string[]
  comparison_needs?: string
  time_periods_needed?: string[]
  detail_level_needed?: string

  // 3️⃣ DECISIONES QUE TOMA
  decision_frequency?: string
  decision_examples?: string[]
  decision_triggers?: string[]
  urgency_level?: string

  // 4️⃣ PREGUNTAS QUE NECESITA RESPONDER
  daily_questions?: string[]
  monthly_questions?: string[]
  strategic_questions?: string[]

  // 5️⃣ PROBLEMAS ACTUALES
  biggest_problem?: string
  second_problem?: string
  third_problem?: string
  manual_work?: string
  time_wasted?: string

  // 6️⃣ FLUJO DE TRABAJO IDEAL
  ideal_workflow?: string
  must_have_features?: string[]
  nice_to_have_features?: string[]
  success_looks_like?: string

  // 7️⃣ DATOS Y CONTEXTO
  num_skus?: number
  forecast_horizon?: string
  has_historical_data?: boolean
  historical_months?: number
  data_sources?: string[]
  external_factors?: string[]

  // 8️⃣ EQUIPO Y COLABORACIÓN
  team_size?: number
  team_locations?: string[]
  collaboration_needs?: string
  report_recipients?: string[]

  // 9️⃣ RESTRICCIONES Y PREFERENCIAS
  device_usage?: string
  technical_level?: string
  integration_needs?: string[]
  budget_timeline?: string

  // 🔟 COMENTARIOS FINALES
  additional_context?: string
  special_requirements?: string
  concerns?: string
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

/**
 * POST /api/videndum/discovery
 * Guarda o actualiza el discovery del cliente para diseñar la plataforma
 * NOTA: Este endpoint permite submissions anónimas (sin autenticación)
 * Si incluye { id: "..." }, actualiza el registro existente en vez de crear uno nuevo
 */
export async function POST(request: Request) {
  try {
    const { id, ...payload }: ClientDiscoveryPayload & { id?: string } = await request.json()
    const supabase = getServiceClient()

    if (id) {
      // Update existing record
      const { data, error } = await supabase
        .from('client_discovery')
        .update({
          ...payload,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[discovery] Error updating discovery:', error)
        return NextResponse.json(
          { error: `Error actualizando discovery: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data,
        message: '¡Información actualizada! Gracias por completar el formulario.'
      })
    }

    // Insert new record
    const { data, error } = await supabase
      .from('client_discovery')
      .insert({
        user_id: null,
        user_email: null,
        submitted_at: new Date().toISOString(),
        status: 'pending',
        ...payload
      })
      .select()
      .single()

    if (error) {
      console.error('[discovery] Error inserting discovery:', error)
      return NextResponse.json(
        { error: `Error guardando discovery: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '¡Gracias! Usaremos esta información para diseñar la plataforma perfecta para tu negocio.'
    })
  } catch (e) {
    console.error('[discovery] Error processing request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/videndum/discovery
 * - Con ?id=xxx → retorna un registro específico (público, para continuar formulario)
 * - Sin id → requiere auth, retorna discovery del usuario o todos si es admin
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const publicId = searchParams.get('id')

  // Public fetch by ID — para que el cliente pueda continuar su formulario
  if (publicId) {
    try {
      const supabase = getServiceClient()
      const { data, error } = await supabase
        .from('client_discovery')
        .select('*')
        .eq('id', publicId)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
      }

      return NextResponse.json({ data })
    } catch (e) {
      console.error('[discovery] Error fetching by ID:', e)
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Error desconocido' },
        { status: 500 }
      )
    }
  }

  // Authenticated fetch
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
      .from('client_discovery')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('[discovery] Error fetching discovery:', error)
      return NextResponse.json(
        { error: `Error obteniendo discovery: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[discovery] Error processing GET request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/videndum/discovery/:id
 * Actualiza el status del discovery (solo admins)
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
      .from('client_discovery')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[discovery] Error updating status:', error)
      return NextResponse.json(
        { error: `Error actualizando status: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('[discovery] Error processing PATCH request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
