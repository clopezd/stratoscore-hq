import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(url, key)
}

// GET /api/surveys?slug=validacion-nicho-v2 → obtiene encuesta (público)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
  }

  try {
    const supabase = getPublicClient()
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
  } catch (e) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/surveys → guardar respuesta (público)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { survey_id, answers, contact } = body

  if (!survey_id || !answers) {
    return NextResponse.json({ error: 'survey_id y answers requeridos' }, { status: 400 })
  }

  try {
    const supabase = getPublicClient()
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
  } catch (e) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
