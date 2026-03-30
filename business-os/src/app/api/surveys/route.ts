import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// GET /api/surveys?slug=validacion-nicho-v1 → obtiene encuesta
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Encuesta no encontrada' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// POST /api/surveys → guardar respuesta
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { survey_id, answers, contact } = body

  if (!survey_id || !answers) {
    return NextResponse.json({ error: 'survey_id y answers requeridos' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id,
      answers,
      contact: contact || null,
      metadata: {
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
