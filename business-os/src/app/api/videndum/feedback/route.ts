import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ClientFeedbackPayload {
  // 1️⃣ Período de Análisis
  preferred_period: '3_months' | '6_months' | 'full_year' | 'other'
  preferred_period_other?: string

  // 2️⃣ KPIs Prioritarios (ranking 1-4)
  priority_top_skus: number
  priority_mape: number
  priority_chart: number
  priority_recommendations: number

  // 3️⃣ Filtros Necesarios
  filter_year: boolean
  filter_month: boolean
  filter_sku: boolean
  filter_type: boolean
  filter_other?: string

  // 4️⃣ Acciones con el Análisis
  action_high_deviation_1: string
  action_high_deviation_2?: string

  // 5️⃣ Lo que Falta / Cambios
  missing_features?: string

  // 6️⃣ Preferencias de Visualización
  visualization_preference: 'single_screen' | 'tabs' | 'interactive_dashboard'

  // 7️⃣ Frecuencia de Uso
  usage_frequency: 'daily' | '2_3_week' | 'weekly' | 'only_problems'

  // Otros usuarios
  other_users: string[]
  other_users_details?: string

  // Comentarios adicionales
  additional_comments?: string
}

/**
 * POST /api/videndum/feedback
 * Guarda el cuestionario de feedback del cliente
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: ClientFeedbackPayload = await request.json()

    // Validar ranking de KPIs (deben ser 1,2,3,4 sin repetidos)
    const priorities = [
      payload.priority_top_skus,
      payload.priority_mape,
      payload.priority_chart,
      payload.priority_recommendations
    ]
    const uniquePriorities = new Set(priorities)
    if (uniquePriorities.size !== 4 || !priorities.every(p => p >= 1 && p <= 4)) {
      return NextResponse.json(
        { error: 'Los KPIs deben tener ranking único del 1 al 4' },
        { status: 400 }
      )
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('client_feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        submitted_at: new Date().toISOString(),
        ...payload
      })
      .select()
      .single()

    if (error) {
      console.error('[feedback] Error inserting feedback:', error)
      return NextResponse.json(
        { error: `Error guardando feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: '¡Gracias por tu feedback! Lo hemos guardado exitosamente.'
    })
  } catch (e) {
    console.error('[feedback] Error processing request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/videndum/feedback
 * Obtiene el historial de feedback del usuario actual (o todos si es admin)
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
      .from('client_feedback')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('[feedback] Error fetching feedback:', error)
      return NextResponse.json(
        { error: `Error obteniendo feedback: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[feedback] Error processing GET request:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
