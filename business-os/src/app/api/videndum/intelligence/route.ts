import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const runtime = 'nodejs'
export const maxDuration = 90

// ─── Management API helper ────────────────────────────────────────────────────

const MGMT_URL   = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'
const MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN

async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  if (!MGMT_TOKEN) throw new Error('SUPABASE_MGMT_TOKEN no configurado')
  const res = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${MGMT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  if (data.message) throw new Error(data.message)
  return data as T[]
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.OPENCLAW_GATEWAY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── 1. Revenue trend 2022 vs 2024 — top candidatos a obsolescencia ─────────
    const revTrend = await sql<{
      part_number: string; catalog_type: string | null
      rev_2022: string; rev_2023: string; rev_2024: string; rev_total: string
    }>(`
      SELECT
        part_number,
        catalog_type,
        ROUND(SUM(CASE WHEN year = 2022 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2022,
        ROUND(SUM(CASE WHEN year = 2023 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2023,
        ROUND(SUM(CASE WHEN year = 2024 THEN quantity ELSE 0 END)::numeric, 0) AS rev_2024,
        ROUND(SUM(quantity)::numeric, 0) AS rev_total
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

    // ── 2. Productos sanos — mayor order book activo ───────────────────────────
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
         WHERE month = (SELECT MAX(month) FROM public.videndum_full_context WHERE month IS NOT NULL
                        AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL))
           AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)
        ) AS b2b_last,
        (SELECT MAX(month)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS month_last,
        (SELECT MAX(year)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS year_last,
        (SELECT ROUND(SUM(order_book_qty)::numeric,0)::text FROM public.videndum_full_context WHERE month IS NOT NULL) AS total_ob,
        (SELECT ROUND(SUM(quantity)::numeric,0)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_rev_2024,
        (SELECT COUNT(DISTINCT part_number)::text FROM public.videndum_records WHERE metric_type='revenue' AND year=2024) AS total_skus_2024
    `)

    const kpi = kpiSnap[0]

    // ── Serialize DB data for prompt ───────────────────────────────────────────
    const declineTable = revTrend.map(r => {
      const r22 = Number(r.rev_2022)
      const r24 = Number(r.rev_2024)
      const pct = r22 > 0 ? Math.round((r24 - r22) / r22 * 100) : 0
      return `${r.part_number} (${r.catalog_type ?? 'N/A'}) | Rev2022: ${r22} | Rev2023: ${Number(r.rev_2023)} | Rev2024: ${r24} | Cambio: ${pct}%`
    }).join('\n')

    const pipelineTable = healthyPipeline.map(r =>
      `${r.part_number} (${r.catalog_type ?? 'N/A'}) | OrderBook: ${r.order_book_qty} | OppPond: ${r.opportunities_qty}`
    ).join('\n')

    // ── 4. Prompt + LLM ────────────────────────────────────────────────────────
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

## CONTEXTO DE MERCADO (inteligencia actualizada)

### Estado financiero Videndum
- Going concern risk activo: RCF £150M vence agosto 2026, refinanciación "low probability" según el propio board
- Revenue H1 2025: -25% vs H1 2024 (causa principal: aranceles US → canales pausaron órdenes)
- Precio acción: ~9.86p, market cap < £10M

### Divisiones y exposición
- Media Solutions (47% revenue): ICC/prosumer — ALTA vulnerabilidad a competencia china
- Production Solutions (32%): Broadcast/News — riesgo MEDIO, SDI legacy bajo presión IP
- Creative Solutions (21%): Cine/Cinema — mejor posicionada, CAGR ~6%

### Competidores amenazantes (ordenados por impacto)
1. DJI (China): Ronin 4D, RS4 Pro → vs. Manfrotto gimbals, Sachtler heads, cine rigs | IMPACTO ALTO
2. SmallRig (China): 180+ SKUs, 30-70% más barato → vs. Wooden Camera cages, Manfrotto, ICC | IMPACTO ALTO
3. Hollyland (China): transmisores inalámbricos a 20-30% del precio de Teradek → IMPACTO ALTO
4. Tilta (China): calidad creciente, semi-pro → vs. cages, sistemas de poder, follow focus | IMPACTO MEDIO-ALTO
5. Aputure (China): LED profesional → vs. Litepanels, Quasar Science | IMPACTO ALTO
6. ARRI (Alemania): ultra-premium → vs. Sachtler premium, O'Connor | IMPACTO MEDIO

### Tendencias tecnológicas clave
TAILWINDS: IP Workflows SMPTE 2110 (17.6% CAGR hasta 2031), streaming demand, REMI/5G, robótica broadcast, recovery post-huelga SAG-AFTRA
HEADWINDS: Competencia china ICC, IA generativa de video (Sora/Runway/Kling), smartphones como cámara principal, aranceles US 2025, software-over-hardware

### Posicionamiento defensible de marcas
- DEFENSIBLE: Teradek (wireless encriptado gov/defense), SmallHD (estándar de facto en sets), Vinten/Camera Corps (robótica broadcast), Sachtler/O'Connor premium, Autocue/Autoscript (B2B sticky), Rycote (audio niche)
- RIESGO MEDIO: Litepanels (commoditización LED), Anton/Bauer legacy (formatos v-lock/gold sobreviven, competencia creciente)
- ALTO RIESGO: Manfrotto/JOBY/Lowepro (ICC mid-market), fondos Colorama/Savage (commodity), hardware SDI legacy

## INSTRUCCIÓN

Genera una Matriz de Decisión ejecutiva respondiendo EXACTAMENTE estas 3 preguntas:
1. ¿Qué productos del inventario están en riesgo por movimientos de la competencia o tendencias de mercado?
2. ¿Qué oportunidades de mercado está ignorando Videndum que los competidores sí están explotando?
3. ¿Cuál es la acción financiera recomendada por producto/segmento?

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin markdown, sin texto adicional):

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
}

Basa todas las conclusiones en los datos reales de la DB + el contexto de mercado. Sé específico, cuantitativo y directo. No repitas datos sin interpretar.`

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const { text } = await generateText({
      model: openrouter('anthropic/claude-sonnet-4-5'),
      prompt,
      temperature: 0.2,
    })

    // Parse JSON — strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const matrix = JSON.parse(clean)

    return NextResponse.json(matrix)

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
