import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MapeRow {
  part_number: string
  catalog_type: string | null
  mape: number
  revenue_total: number
  intake_total: number
  aggregate_error: number
  periods_with_data: number
  year_from: number
  year_to: number
  yearly_detail: { year: number; revenue: number; intake: number; ape: number }[]
}

interface AnalysisRequest {
  market_growth_rate: number   // % crecimiento de mercado que el usuario configuró
  market_source: string        // label de dónde viene (ej: "Manual", "FRED", "World Bank")
  top_n?: number               // cuántos productos analizar (default 15)
}

// ─── Supabase admin (service role, bypass RLS) ────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

function formatMapeTable(rows: MapeRow[]): string {
  const lines = [
    'PART NUMBER          | TIPO | MAPE%  | REVENUE TOTAL | INTAKE TOTAL | ERROR AGG%',
    '─'.repeat(82),
  ]
  for (const r of rows) {
    lines.push(
      `${r.part_number.padEnd(20)} | ${(r.catalog_type ?? 'N/A').padEnd(4)} | ` +
      `${String(r.mape ?? '—').padStart(6)} | ` +
      `${String(r.revenue_total.toLocaleString()).padStart(13)} | ` +
      `${String(r.intake_total.toLocaleString()).padStart(12)} | ` +
      `${r.aggregate_error ?? '—'}%`
    )
  }
  return lines.join('\n')
}

function buildPrompt(
  worst: MapeRow[],
  best: MapeRow[],
  overall: { avg_mape: number; total_products: number; revenue_grand: number },
  req: AnalysisRequest
): string {
  return `Eres un analista senior de ventas y forecasting para Videndum, fabricante de equipos para medios audiovisuales (soportes de cámara, monitores broadcast, accesorios).

## Contexto del análisis

**Variable de mercado ingresada:** ${req.market_growth_rate}% (fuente: ${req.market_source})
Esta cifra representa el crecimiento esperado del mercado de equipos para broadcast/media.

**Resumen global del forecast (Order Intake vs Revenue):**
- MAPE promedio de la cartera: ${overall.avg_mape}%
- Productos analizados: ${overall.total_products}
- Revenue histórico acumulado: ${overall.revenue_grand.toLocaleString()} unidades

## Productos con MAYOR error de proyección (top ${worst.length})

${formatMapeTable(worst)}

## Productos con MENOR error de proyección (mejor forecast, top ${best.length})

${formatMapeTable(best)}

## Pregunta de análisis

Con base en:
1. El MAPE de la cartera de productos
2. La variable de mercado del ${req.market_growth_rate}% de crecimiento
3. El contexto macroeconómico actual del sector broadcast/media (consolidación de streaming, inversión en producción de contenido, ciclos de reemplazo de equipos)

Responde en español con este formato exacto:

### Veredicto de proyección
[Una frase directa: ¿el forecast tiene sentido dado el contexto de mercado?]

### Señales de alerta
[Bullet points: productos o patrones que requieren atención inmediata]

### Productos bien calibrados
[Bullet points: qué productos tienen forecast confiable y por qué]

### Recomendaciones
[3-5 acciones concretas para mejorar la precisión del forecast]

### Contexto macroeconómico
[2-3 párrafos: ¿el ${req.market_growth_rate}% de crecimiento de mercado es consistente con el comportamiento observado en la data? ¿Qué factores externos deberían ajustar las proyecciones?]

Sé directo, cuantitativo donde puedas, y no repitas los datos crudos que ya aparecen en las tablas.`
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.OPENCLAW_GATEWAY_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body: AnalysisRequest = await req.json()
  const { market_growth_rate, market_source, top_n = 15 } = body

  if (typeof market_growth_rate !== 'number') {
    return new Response('market_growth_rate requerido', { status: 400 })
  }

  // ── Fetch MAPE data ──────────────────────────────────────────────────────
  const supabase = getSupabase()

  const { data: allMape, error } = await supabase
    .from('videndum_mape')
    .select('*')

  if (error) {
    return new Response(`Supabase error: ${error.message}`, { status: 500 })
  }

  const rows = (allMape ?? []) as MapeRow[]
  const sorted = [...rows].sort((a, b) => (b.mape ?? 0) - (a.mape ?? 0))
  const worst = sorted.slice(0, top_n)
  const best = sorted.slice(-top_n).reverse()

  const overall = {
    avg_mape: Math.round(rows.reduce((s, r) => s + (r.mape ?? 0), 0) / (rows.length || 1) * 10) / 10,
    total_products: rows.length,
    revenue_grand: rows.reduce((s, r) => s + (r.revenue_total ?? 0), 0),
  }

  // ── Stream AI analysis ────────────────────────────────────────────────────
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4-5'),
    prompt: buildPrompt(worst, best, overall, { market_growth_rate, market_source, top_n }),
    temperature: 0.3,
  })

  return result.toTextStreamResponse()
}
