/**
 * Consultor Estratégico Agéntico — Videndum
 * Auth: sesión Supabase
 * LLM: Claude Sonnet via OpenRouter — generateText single-step loop manual
 *
 * ⚠ AI SDK v6 con streamText+stopWhen usa Responses API → OpenRouter devuelve 400.
 *   Solución: loop manual con generateText (single-step = Chat Completions API).
 *   Cada turno: si el modelo pide tools → ejecutarlos → agregar resultados → siguiente turno.
 *   Último turno: texto final → emitir SSE text_delta + result.
 *
 * Tools: get_analytics | get_variance | get_intelligence
 * SSE format: compatible con useConsultantChat hook
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 120

// ── DB helper ─────────────────────────────────────────────────────────────────

const MGMT_URL = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'

async function mgmtSql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const token = process.env.SUPABASE_MGMT_TOKEN
  if (!token) throw new Error('SUPABASE_MGMT_TOKEN no configurado')
  const res = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  if (!res.ok || data.message) throw new Error(data.message ?? `HTTP ${res.status}`)
  return data as T[]
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el Consultor Estratégico Senior de Videndum — especialista en gestión de portfolio y estrategia competitiva en equipos audiovisuales y broadcast profesional.

Tu misión: dar análisis ejecutivos precisos, cuantitativos y accionables sobre el portfolio de Videndum.

Reglas de respuesta:
1. SIEMPRE usa los tools disponibles antes de responder cuando la pregunta involucre datos.
2. Cita explícitamente qué datos consultaste y qué tool los proveyó. Ej: "Según get_analytics: B2B último mes = 1.23"
3. Primero la conclusión, luego el fundamento.
4. Si detectas una señal preocupante en los datos, nómbrala sin eufemismos.
5. Usa formato markdown: negrita para números clave, listas para rankings, tablas cuando aplique.
6. Responde siempre en español.
7. Máximo 3-4 párrafos o una tabla + párrafo de síntesis. No divagues.

Tools disponibles:
- get_analytics: B2B mensual, pipeline activo (order book + oportunidades ponderadas), KPIs del año en curso.
- get_variance: Desviación real vs forecast por SKU. Identifica qué está sobre o bajo el plan.
- get_intelligence: Declive de revenue por SKU (2022→2024), pipeline top 10 y contexto de mercado. Para riesgo competitivo, obsolescencia, posicionamiento.`

// ── Tool implementations ──────────────────────────────────────────────────────

const MONTH_LABELS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_SCHEMA: Record<string, { description: string; parameters: ReturnType<typeof z.object>; execute: () => Promise<unknown> }> = {
  get_analytics: {
    description: 'Obtiene métricas en tiempo real: B2B mensual del año en curso, pipeline activo por SKU (order book + oportunidades ponderadas) y KPIs globales.',
    parameters: z.object({}),
    execute: async () => {
      console.log('[consultant] get_analytics — querying DB...')
      const [rawMonthly, rawPipeline, kpiRows] = await Promise.all([
        mgmtSql<{ year: string; month: string; revenue_qty: string; order_intake_qty: string; book_to_bill: string | null }>(`
          SELECT year, month,
            ROUND(SUM(revenue_qty)::numeric, 0) AS revenue_qty,
            ROUND(SUM(order_intake_qty)::numeric, 0) AS order_intake_qty,
            CASE WHEN SUM(revenue_qty) > 0
                 THEN ROUND((SUM(order_intake_qty)/SUM(revenue_qty))::numeric, 3)
                 ELSE NULL END AS book_to_bill
          FROM public.videndum_full_context
          WHERE month IS NOT NULL
            AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)
          GROUP BY year, month ORDER BY month
        `),
        mgmtSql<{ part_number: string; catalog_type: string | null; order_book_qty: string; opportunities_qty: string; opp_unfactored_qty: string }>(`
          SELECT part_number, catalog_type,
            ROUND(SUM(order_book_qty)::numeric, 0) AS order_book_qty,
            ROUND(SUM(opportunities_qty)::numeric, 1) AS opportunities_qty,
            ROUND(SUM(opp_unfactored_qty)::numeric, 0) AS opp_unfactored_qty
          FROM public.videndum_full_context
          WHERE (order_book_qty > 0 OR opportunities_qty > 0) AND month IS NOT NULL
          GROUP BY part_number, catalog_type
          HAVING SUM(order_book_qty) + SUM(opportunities_qty) > 0
          ORDER BY SUM(order_book_qty) + SUM(opportunities_qty) DESC LIMIT 20
        `),
        mgmtSql<{ b2b_last: string | null; month_last: string; year_last: string; total_ob: string; total_rev: string; total_skus: string }>(`
          SELECT
            (SELECT ROUND((SUM(order_intake_qty)/NULLIF(SUM(revenue_qty),0))::numeric,3)
             FROM public.videndum_full_context
             WHERE month = (SELECT MAX(month) FROM public.videndum_full_context WHERE month IS NOT NULL
                            AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL))
               AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)) AS b2b_last,
            (SELECT MAX(month)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS month_last,
            (SELECT MAX(year)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS year_last,
            (SELECT ROUND(SUM(order_book_qty)::numeric,0)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS total_ob,
            (SELECT ROUND(SUM(quantity)::numeric,0)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_rev,
            (SELECT COUNT(DISTINCT part_number)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_skus
        `),
      ])
      const kpi = kpiRows[0]
      console.log('[consultant] get_analytics — OK, b2b_last:', kpi?.b2b_last)
      return {
        source: 'get_analytics',
        kpis: {
          b2b_last_month: kpi?.b2b_last ? Number(kpi.b2b_last) : null,
          period: `${kpi?.month_last}/${kpi?.year_last}`,
          total_order_book_units: Number(kpi?.total_ob ?? 0),
          total_revenue_2024_units: Number(kpi?.total_rev ?? 0),
          active_skus_2024: Number(kpi?.total_skus ?? 0),
        },
        monthly_b2b: rawMonthly.map(r => ({
          month: Number(r.month), label: MONTH_LABELS[Number(r.month)] ?? String(r.month),
          revenue_qty: Number(r.revenue_qty), order_intake_qty: Number(r.order_intake_qty),
          book_to_bill: r.book_to_bill !== null ? Number(r.book_to_bill) : null,
        })),
        top_pipeline: rawPipeline.map(r => ({
          part_number: r.part_number, catalog_type: r.catalog_type,
          order_book_qty: Number(r.order_book_qty),
          opportunities_weighted: Number(r.opportunities_qty),
          opportunities_raw: Number(r.opp_unfactored_qty),
        })),
      }
    },
  },

  get_variance: {
    description: 'Obtiene la varianza real vs forecast por SKU. Identifica qué productos están sobre o bajo el plan de ventas. Top 10 con mayor desviación negativa y positiva.',
    parameters: z.object({}),
    execute: async () => {
      console.log('[consultant] get_variance — querying DB...')
      const varSql = (order: 'ASC' | 'DESC') => mgmtSql<{
        part_number: string; catalog_type: string | null
        actual_qty: string; forecast_qty: string; variance_pct: string; matched_months: string
      }>(`
        SELECT vr.part_number, vr.catalog_type,
          SUM(vr.quantity) AS actual_qty, SUM(pf.quantity) AS forecast_qty,
          ROUND(((SUM(vr.quantity)-SUM(pf.quantity))/NULLIF(SUM(pf.quantity),0)*100)::numeric,1) AS variance_pct,
          COUNT(*) AS matched_months
        FROM public.videndum_records vr
        JOIN public.planning_forecasts pf ON vr.part_number=pf.part_number AND vr.year=pf.year AND vr.month=pf.month
        WHERE vr.metric_type='revenue'
        GROUP BY vr.part_number, vr.catalog_type
        HAVING SUM(pf.quantity) > 0
        ORDER BY variance_pct ${order} LIMIT 10
      `)
      const [negRows, posRows] = await Promise.all([varSql('ASC'), varSql('DESC')])
      const toRow = (r: { part_number: string; catalog_type: string | null; actual_qty: string; forecast_qty: string; variance_pct: string; matched_months: string }) => ({
        part_number: r.part_number, catalog_type: r.catalog_type,
        actual_qty: Number(r.actual_qty), forecast_qty: Number(r.forecast_qty),
        variance_pct: Number(r.variance_pct), matched_months: Number(r.matched_months),
      })
      console.log('[consultant] get_variance — OK')
      return { source: 'get_variance', underperforming_top10: negRows.map(toRow), overperforming_top10: posRows.map(toRow) }
    },
  },

  get_intelligence: {
    description: 'Obtiene datos para análisis estratégico: declive de revenue por SKU (2022→2024), pipeline top 10, KPI snapshot y contexto de mercado (competidores, tendencias, going concern).',
    parameters: z.object({}),
    execute: async () => {
      console.log('[consultant] get_intelligence — querying DB...')
      const [revTrend, healthyPipeline, kpiSnap] = await Promise.all([
        mgmtSql<{ part_number: string; catalog_type: string | null; rev_2022: string; rev_2023: string; rev_2024: string }>(`
          SELECT part_number, catalog_type,
            ROUND(SUM(CASE WHEN year=2022 THEN quantity ELSE 0 END)::numeric,0) AS rev_2022,
            ROUND(SUM(CASE WHEN year=2023 THEN quantity ELSE 0 END)::numeric,0) AS rev_2023,
            ROUND(SUM(CASE WHEN year=2024 THEN quantity ELSE 0 END)::numeric,0) AS rev_2024
          FROM public.videndum_records
          WHERE metric_type='revenue' AND year IN (2022,2023,2024)
          GROUP BY part_number, catalog_type
          HAVING SUM(CASE WHEN year=2022 THEN quantity ELSE 0 END) > 500
          ORDER BY (CASE WHEN SUM(CASE WHEN year=2022 THEN quantity ELSE 0 END) > 0
            THEN (SUM(CASE WHEN year=2024 THEN quantity ELSE 0 END) - SUM(CASE WHEN year=2022 THEN quantity ELSE 0 END)) /
                  SUM(CASE WHEN year=2022 THEN quantity ELSE 0 END) ELSE 0 END) ASC
          LIMIT 15
        `),
        mgmtSql<{ part_number: string; catalog_type: string | null; order_book_qty: string; opportunities_qty: string }>(`
          SELECT part_number, catalog_type,
            ROUND(SUM(order_book_qty)::numeric,0) AS order_book_qty,
            ROUND(SUM(opportunities_qty)::numeric,1) AS opportunities_qty
          FROM public.videndum_full_context
          WHERE order_book_qty > 0 AND month IS NOT NULL
          GROUP BY part_number, catalog_type
          ORDER BY SUM(order_book_qty) DESC LIMIT 10
        `),
        mgmtSql<{ b2b_last: string | null; month_last: string; year_last: string; total_ob: string; total_rev_2024: string; total_skus_2024: string }>(`
          SELECT
            (SELECT ROUND((SUM(order_intake_qty)/NULLIF(SUM(revenue_qty),0))::numeric,3)
             FROM public.videndum_full_context
             WHERE month = (SELECT MAX(month) FROM public.videndum_full_context WHERE month IS NOT NULL
                            AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL))
               AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)) AS b2b_last,
            (SELECT MAX(month)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS month_last,
            (SELECT MAX(year)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS year_last,
            (SELECT ROUND(SUM(order_book_qty)::numeric,0)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS total_ob,
            (SELECT ROUND(SUM(quantity)::numeric,0)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_rev_2024,
            (SELECT COUNT(DISTINCT part_number)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_skus_2024
        `),
      ])
      const kpi = kpiSnap[0]
      console.log('[consultant] get_intelligence — OK, b2b_last:', kpi?.b2b_last)
      return {
        source: 'get_intelligence',
        kpis: {
          b2b_last: kpi?.b2b_last ? Number(kpi.b2b_last) : null,
          period: `${kpi?.month_last}/${kpi?.year_last}`,
          total_order_book_units: Number(kpi?.total_ob ?? 0),
          total_revenue_2024_units: Number(kpi?.total_rev_2024 ?? 0),
          active_skus_2024: Number(kpi?.total_skus_2024 ?? 0),
        },
        revenue_decline_top15: revTrend.map(r => ({
          part_number: r.part_number, catalog_type: r.catalog_type,
          rev_2022: Number(r.rev_2022), rev_2023: Number(r.rev_2023), rev_2024: Number(r.rev_2024),
          change_pct_2022_to_2024: Number(r.rev_2022) > 0
            ? Math.round((Number(r.rev_2024) - Number(r.rev_2022)) / Number(r.rev_2022) * 100) : 0,
        })),
        healthy_pipeline_top10: healthyPipeline.map(r => ({
          part_number: r.part_number, catalog_type: r.catalog_type,
          order_book_qty: Number(r.order_book_qty), opportunities_weighted: Number(r.opportunities_qty),
        })),
        market_context: {
          financial_risk: 'Going concern activo — RCF £150M vence agosto 2026, refinanciación "low probability". Market cap < £10M.',
          revenue_trend: 'Revenue H1 2025: -25% vs H1 2024 (aranceles US → canales pausaron órdenes)',
          divisions: {
            media_solutions: '47% revenue — ICC/prosumer — ALTA vulnerabilidad a competencia china (DJI, SmallRig)',
            production_solutions: '32% — Broadcast/News — riesgo MEDIO, SDI legacy bajo presión IP (SMPTE 2110)',
            creative_solutions: '21% — Cine/Cinema — mejor posicionada, CAGR ~6%',
          },
          top_threats: [
            { competitor: 'DJI', impact: 'ALTO', vs: 'Manfrotto gimbals, Sachtler heads' },
            { competitor: 'SmallRig', impact: 'ALTO', vs: 'Wooden Camera cages, ICC accessories' },
            { competitor: 'Hollyland', impact: 'ALTO', vs: 'Teradek wireless (20-30% del precio)' },
            { competitor: 'Aputure', impact: 'ALTO', vs: 'Litepanels, Quasar Science LED' },
          ],
          defensible_assets: ['Teradek (wireless encriptado)', 'SmallHD (estándar sets cine)', 'Vinten/Camera Corps (robótica broadcast)', 'Autocue/Autoscript (B2B sticky)'],
          tailwinds: ['IP Workflows SMPTE 2110 (17.6% CAGR)', 'Streaming demand', 'REMI/5G broadcast'],
          headwinds: ['Competencia china ICC', 'IA generativa de video', 'Aranceles US 2025'],
        },
      }
    },
  },
}

// ── Message sanitization ───────────────────────────────────────────────────────

/**
 * Sanitiza el array de mensajes antes de enviarlo al AI SDK.
 * - Filtra mensajes con role inválido
 * - Para role 'user' | 'assistant': asegura que content sea string no vacío.
 *   Si es objeto/array, lo convierte con JSON.stringify.
 * - Para role 'tool': asegura que content sea array con ToolResultPart válidos.
 * - Descarta cualquier mensaje que no pueda normalizarse.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeMessages(messages: any[]): any[] {
  return messages.reduce((acc, m) => {
    if (!m || typeof m !== 'object') return acc
    const role = m.role
    if (role !== 'user' && role !== 'assistant' && role !== 'tool') return acc

    if (role === 'user' || role === 'assistant') {
      let content = m.content
      if (typeof content !== 'string') {
        // Array de TextPart / ToolCallPart — mantener si ya está bien formado
        if (Array.isArray(content) && content.length > 0 && typeof content[0]?.type === 'string') {
          acc.push({ role, content })
          return acc
        }
        // Objeto complejo inesperado → serializar como texto
        content = typeof content === 'undefined' || content === null ? '' : JSON.stringify(content)
      }
      if (!content.trim()) return acc  // descartar mensajes vacíos
      acc.push({ role, content })
      return acc
    }

    if (role === 'tool') {
      const content = m.content
      if (!Array.isArray(content) || content.length === 0) return acc
      // Asegurar que cada ToolResultPart tenga el formato mínimo requerido
      const normalizedContent = content.map((part: Record<string, unknown>) => ({
        type: 'tool-result' as const,
        toolCallId: String(part.toolCallId ?? ''),
        toolName: String(part.toolName ?? ''),
        result: part.result !== undefined
          ? (typeof part.result === 'string' ? part.result : JSON.stringify(part.result))
          : '',
      }))
      acc.push({ role, content: normalizedContent })
      return acc
    }

    return acc
  }, [] as unknown[])
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurado' }, { status: 500 })
  }

  let body: { messages?: unknown; radarContext?: string } = {}
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages requerido' }, { status: 400 })
  }

  const radarContext = typeof body.radarContext === 'string' ? body.radarContext : null
  const systemPrompt = radarContext
    ? `${SYSTEM_PROMPT}\n\n---\nCONTEXTO PRE-CARGADO DEL RADAR (análisis ejecutado previamente):\n${radarContext}\n---\nUsa este contexto cuando sea relevante. Si la pregunta se puede responder con este análisis, no es necesario llamar get_intelligence.`
    : SYSTEM_PROMPT

  // Provider: .chat() fuerza Chat Completions API (/chat/completions).
  // openrouter(modelId) por defecto usa Responses API → OpenRouter devuelve 400.
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  // ── SSE stream setup ──────────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Build tools with inline execute functions that emit SSE events.
        // Using maxSteps lets the AI SDK manage message construction between steps,
        // avoiding the ModelMessage[] schema error caused by manually constructing
        // role:'assistant' tool-call messages and role:'tool' result messages.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdkTools: Record<string, any> = {}
        for (const [toolName, def] of Object.entries(TOOL_SCHEMA)) {
          sdkTools[toolName] = {
            description: def.description,
            parameters: def.parameters,
            execute: async (_args: unknown, { toolCallId }: { toolCallId: string }) => {
              emit({ type: 'tool_start', toolName, toolId: toolCallId })
              console.log(`[consultant] executing tool: ${toolName}`)
              try {
                const result = await def.execute()
                console.log(`[consultant] tool ${toolName} OK`)
                emit({ type: 'tool_done', toolId: toolCallId })
                return result
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Tool error'
                console.error(`[consultant] tool ${toolName} ERROR:`, msg)
                emit({ type: 'tool_done', toolId: toolCallId })
                return { error: msg }
              }
            },
          }
        }

        const sanitized = sanitizeMessages([...messages])
        console.log(`[consultant] calling generateText — messages: ${sanitized.length}, maxSteps: 5`)

        let result
        try {
          result = await generateText({
            // .chat() fuerza /v1/chat/completions — evita Responses API que OpenRouter no soporta.
            // maxSteps: el SDK gestiona el loop de tool calls internamente con el formato correcto.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            model: (openrouter as any).chat('anthropic/claude-sonnet-4-5'),
            system: systemPrompt,
            messages: sanitized,
            tools: sdkTools,
            stopWhen: stepCountIs(5),
            temperature: 0.3,
          })
        } catch (genErr) {
          const genMsg = genErr instanceof Error ? genErr.message : 'generateText error'
          console.error('[consultant] generateText FAILED — message:', genMsg)
          console.error('[consultant] generateText FAILED — full:', JSON.stringify(genErr, Object.getOwnPropertyNames(genErr as object)))
          if (genErr && typeof genErr === 'object') {
            const err = genErr as Record<string, unknown>
            if (err.cause) console.error('[consultant] cause:', JSON.stringify(err.cause, Object.getOwnPropertyNames(err.cause as object)))
            if (err.responseBody) console.error('[consultant] responseBody:', err.responseBody)
            if (err.statusCode ?? err.status) console.error('[consultant] status:', err.statusCode ?? err.status)
          }
          throw genErr
        }

        console.log(`[consultant] generateText done — text: ${result.text.length} chars, steps: ${result.steps?.length ?? 1}`)

        emit({
          type: 'result',
          text: result.text?.trim() || 'No pude generar una respuesta. Intenta reformular la pregunta.',
        })

      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        // Log full error object to capture AI SDK / OpenRouter details (status, responseBody, cause)
        console.error('[consultant] FATAL error — message:', msg)
        console.error('[consultant] FATAL error — full object:', JSON.stringify(e, Object.getOwnPropertyNames(e as object)))
        if (e && typeof e === 'object') {
          const err = e as Record<string, unknown>
          if (err.cause) console.error('[consultant] FATAL error — cause:', JSON.stringify(err.cause, Object.getOwnPropertyNames(err.cause as object)))
          if (err.responseBody) console.error('[consultant] FATAL error — responseBody:', err.responseBody)
          if (err.statusCode ?? err.status) console.error('[consultant] FATAL error — status:', err.statusCode ?? err.status)
          if (err.url) console.error('[consultant] FATAL error — url:', err.url)
        }
        // Surface the real error in the chat UI
        emit({ type: 'error', message: `Error del servidor: ${msg}` })
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
