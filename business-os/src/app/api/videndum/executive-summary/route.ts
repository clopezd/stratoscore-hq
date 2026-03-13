/**
 * POST /api/videndum/executive-summary
 * Genera un resumen ejecutivo de forecast vs revenue vía streaming SSE.
 * Auth: sesión Supabase.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { fetchSummaryKPIs, buildSummaryPrompt } from '@/features/data-ingestion/services/summary'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurado' }, { status: 500 })
  }

  // Obtener KPIs de DB
  let kpis
  try {
    kpis = await fetchSummaryKPIs()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al consultar datos'
    console.error('[executive-summary] DB error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Si no hay datos de varianza (no existe solapamiento forecast/real)
  if (kpis.total_forecast === 0) {
    return NextResponse.json({
      error: 'No hay datos solapados entre planning_forecasts y videndum_records. Carga el Excel primero.',
    }, { status: 422 })
  }

  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  // Stream del resumen
  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4-5'),
    prompt: buildSummaryPrompt(kpis),
    temperature: 0.4,
    maxOutputTokens: 400,
  })

  // Incluir KPIs en los headers para que el cliente los pinte sin parsear el texto
  const kpisHeader = Buffer.from(JSON.stringify(kpis)).toString('base64')

  const response = result.toTextStreamResponse()
  const headers = new Headers(response.headers)
  headers.set('X-Summary-KPIs', kpisHeader)

  return new Response(response.body, { headers })
}
