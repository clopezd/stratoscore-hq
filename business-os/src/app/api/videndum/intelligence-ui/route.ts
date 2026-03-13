/**
 * Radar de Inteligencia Competitiva — Matriz de Decisión
 * Auth: sesión Supabase (no expone tokens al cliente)
 * Lógica: consulta DB en vivo + Claude via OpenRouter → JSON Decision Matrix
 */
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const runtime = 'nodejs'
export const maxDuration = 90

// ─── Management API helper ─────────────────────────────────────────────────────

const MGMT_URL = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'

async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const token = process.env.SUPABASE_MGMT_TOKEN
  if (!token) throw new Error('[intelligence] SUPABASE_MGMT_TOKEN no configurado')

  const res = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const data = await res.json()
  if (!res.ok || data.message) {
    const msg = data.message ?? `Supabase Management API HTTP ${res.status}`
    throw new Error(`[intelligence] DB error: ${msg}`)
  }
  return data as T[]
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST() {
  // ── Auth: Supabase session ──────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 401 })
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: no active session' }, { status: 401 })
  }

  // ── Verify OpenRouter key ───────────────────────────────────────────────────
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurado en el servidor' }, { status: 500 })
  }

  try {
    // ── 1. Revenue trend 2022 vs 2024 ─────────────────────────────────────────
    const revTrend = await sql<{
      part_number: string; catalog_type: string | null
      rev_2022: string; rev_2023: string; rev_2024: string
    }>(`
      SELECT
        part_number,
        catalog_type,
        ROUND(SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2022,
        ROUND(SUM(CASE WHEN year = 2023 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2023,
        ROUND(SUM(CASE WHEN year = 2024 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2024
      FROM public.videndum_records
      WHERE metric_type = 'revenue' AND year IN (2022, 2023, 2024)
      GROUP BY part_number, catalog_type
      HAVING SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END) > 500
      ORDER BY (
        CASE WHEN SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END) > 0
             THEN (SUM(CASE WHEN year = 2024 THEN quantity ELSE 0 END) -
                   SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END)) /
                  SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END)
             ELSE 0 END
      ) ASC
      LIMIT 15
    `)

    // ── 2. Pipeline activo top 10 ──────────────────────────────────────────────
    const healthyPipeline = await sql<{
      part_number: string; catalog_type: string | null
      order_book_qty: string; opportunities_qty: string
    }>(`
      SELECT
        part_number,
        catalog_type,
        ROUND(SUM(order_book_qty)::numeric, 0)    AS order_book_qty,
        ROUND(SUM(opportunities_qty)::numeric, 1) AS opportunities_qty
      FROM public.videndum_full_context
      WHERE order_book_qty > 0 AND month IS NOT NULL
      GROUP BY part_number, catalog_type
      ORDER BY SUM(order_book_qty) DESC
      LIMIT 10
    `)

    // ── 3. KPI global snapshot ─────────────────────────────────────────────────
    const kpiSnap = await sql<{
      b2b_last: string | null; month_last: string; year_last: string
      total_ob: string; total_rev_2024: string; total_skus_2024: string
    }>(`
      SELECT
        (SELECT ROUND((SUM(order_intake_qty)/NULLIF(SUM(revenue_qty),0))::numeric,3)
         FROM public.videndum_full_context
         WHERE month = (SELECT MAX(month) FROM public.videndum_full_context
                        WHERE month IS NOT NULL
                          AND year = (SELECT MAX(year) FROM public.videndum_full_context
                                      WHERE month IS NOT NULL))
           AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)
        ) AS b2b_last,
        (SELECT MAX(month)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS month_last,
        (SELECT MAX(year)::text  FROM public.videndum_full_context WHERE month IS NOT NULL) AS year_last,
        (SELECT ROUND(SUM(order_book_qty)::numeric,0)::text
         FROM public.videndum_full_context WHERE month IS NOT NULL) AS total_ob,
        (SELECT ROUND(SUM(quantity)::numeric,0)::text
         FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_rev_2024,
        (SELECT COUNT(DISTINCT part_number)::text
         FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_skus_2024
    `)

    const kpi = kpiSnap[0]

    // ── Serialize DB data ──────────────────────────────────────────────────────
    const declineTable = revTrend.map(r => {
      const r22 = Number(r.rev_2022)
      const r24 = Number(r.rev_2024)
      const pct  = r22 > 0 ? Math.round((r24 - r22) / r22 * 100) : 0
      return `${r.part_number} (${r.catalog_type ?? 'N/A'}) | 2022:${r22} | 2023:${Number(r.rev_2023)} | 2024:${r24} | Δ:${pct}%`
    }).join('\n')

    const pipelineTable = healthyPipeline.map(r =>
      `${r.part_number} (${r.catalog_type ?? 'N/A'}) | OrderBook:${r.order_book_qty} | OppPond:${r.opportunities_qty}`
    ).join('\n')

    // ── LLM Prompt ─────────────────────────────────────────────────────────────
    const prompt = `Eres un analista de estrategia corporativa especializado en equipos audiovisuales y broadcast.
Tienes acceso a datos reales de la base de datos de Videndum (2020-2025) y al contexto de mercado actualizado.

## DATOS DE BASE DE DATOS (snapshot ${new Date().toISOString().slice(0, 10)})

### KPIs globales
- Book-to-Bill último mes (${kpi?.month_last}/${kpi?.year_last}): ${kpi?.b2b_last ?? 'N/D'}
- Total Order Book activo: ${kpi?.total_ob} unidades
- Revenue total 2024: ${kpi?.total_rev_2024} unidades
- SKUs activos 2024: ${kpi?.total_skus_2024}

### Top 15 productos con mayor declive de revenue (2022→2024)
${declineTable}

### Top 10 productos con mayor order book activo
${pipelineTable}

## CONTEXTO DE MERCADO

### Estado financiero Videndum
- Going concern risk activo: RCF £150M vence agosto 2026, refinanciación "low probability" según el propio board
- Revenue H1 2025: -25% vs H1 2024 (aranceles US → canales pausaron órdenes)
- Precio acción: ~9.86p, market cap < £10M

### Divisiones y exposición
- Media Solutions (47% revenue): ICC/prosumer — ALTA vulnerabilidad a competencia china
- Production Solutions (32%): Broadcast/News — riesgo MEDIO, SDI legacy bajo presión IP
- Creative Solutions (21%): Cine/Cinema — mejor posicionada, CAGR ~6%

### Competidores amenazantes
1. Cartoni (Italia): fluid heads y soportes profesionales broadcast/cine → vs. Sachtler, Vinten, O'Connor | IMPACTO ALTO
2. Miller (Australia): fluid heads y tripods broadcast, fuerte en Asia-Pacífico y mercados de costo-eficiencia → vs. Sachtler, Vinten | IMPACTO ALTO
3. Camgear (Europa): soportes broadcast precio competitivo, distribución EMEA → vs. Vinten, Sachtler entry-mid range | IMPACTO MEDIO-ALTO
4. Libec (Japón): tripods y fluid heads prosumer/profesional, presencia sólida Asia → vs. Manfrotto, Sachtler low range | IMPACTO MEDIO-ALTO
5. Neewer (China): accesorios y soportes bajo costo, penetración agresiva en ICC y semi-profesional → vs. Manfrotto, JOBY, Lowepro | IMPACTO ALTO

### Tendencias tecnológicas
TAILWINDS: IP Workflows SMPTE 2110 (17.6% CAGR hasta 2031), streaming demand, REMI/5G, robótica broadcast, recovery post-huelga SAG-AFTRA
HEADWINDS: Competencia china ICC, IA generativa video (Sora/Runway), smartphones como cámara, aranceles US 2025, software-over-hardware

### Posicionamiento defensible
- DEFENSIBLE: Teradek (wireless encriptado gov/defense), SmallHD (estándar sets cine), Vinten/Camera Corps (robótica broadcast), Sachtler/O'Connor premium, Autocue/Autoscript (B2B sticky), Rycote (niche audio)
- RIESGO MEDIO: Litepanels, Anton/Bauer legacy batteries
- ALTO RIESGO: Manfrotto/JOBY/Lowepro ICC mid-market, Colorama/Savage fondos, hardware SDI legacy

## INSTRUCCIÓN

Genera una Matriz de Decisión ejecutiva respondiendo estas 3 preguntas:
1. ¿Qué productos están en riesgo por movimientos de competencia o tendencias de mercado?
2. ¿Qué oportunidades está ignorando Videndum que competidores explotan?
3. ¿Cuál es la acción financiera recomendada por producto/segmento?

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown ni texto adicional:

{
  "snapshot_date": "YYYY-MM-DD",
  "executive_summary": "1-2 frases directas sobre el estado del portfolio",
  "risk_matrix": [
    {
      "part_number": "string o null si es segmento",
      "segment": "string (marca/categoría)",
      "risk_type": "OBSOLESCENCIA" | "COMPETENCIA_CHINA" | "SUSTITUCIÓN_IP" | "DEMANDA_LATENTE" | "GOING_CONCERN",
      "severity": "CRÍTICA" | "ALTA" | "MEDIA" | "BAJA",
      "competitor_threat": "nombre competidor o null",
      "evidence": "dato concreto de la DB o mercado",
      "immediate_action": "LIQUIDAR" | "PROVISIONAR" | "VIGILAR" | "MANTENER"
    }
  ],
  "opportunity_matrix": [
    {
      "segment": "nombre del segmento o marca",
      "market_trend": "descripción de la tendencia",
      "cagr": "string (ej: '17.6%') o null",
      "videndum_asset": "marca o producto de Videndum",
      "current_exploitation": "SUBUTILIZADA" | "BIEN_EXPLOTADA" | "SIN_EXPLOTAR",
      "gap": "qué está faltando hacer",
      "recommendation": "acción concreta"
    }
  ],
  "action_table": [
    {
      "target": "part_number o segmento",
      "type": "SKU" | "SEGMENTO" | "MARCA",
      "decision": "LIQUIDAR" | "PROVISIONAR" | "VENDER_CANAL" | "MANTENER" | "INVERTIR" | "VIGILAR",
      "rationale": "máximo 2 frases",
      "urgency": "INMEDIATA" | "Q2_2026" | "H2_2026" | "2027+"
    }
  ]
}`

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const { text } = await generateText({
      model: openrouter('anthropic/claude-sonnet-4-5'),
      prompt,
      temperature: 0.2,
    })

    // Strip accidental markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const matrix = JSON.parse(clean)

    return NextResponse.json(matrix)

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    // Solo loguear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('[intelligence-ui] Error:', msg)
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
