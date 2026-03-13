/**
 * generateExecutiveSummary
 * Server-side service (llamado desde API route — no importar en client components).
 *
 * 1. Consulta planning_forecasts vs videndum_records para calcular varianza.
 * 2. Devuelve KPIs sintetizados listos para pasar al modelo.
 */

const MGMT_URL = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'

async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
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

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface SkuVariance {
  part_number: string
  forecast_qty: number
  actual_qty: number
  variance_qty: number
  variance_pct: number
  matched_months: number
}

export interface SummaryKPIs {
  total_forecast: number
  total_actual: number
  total_variance_qty: number
  total_variance_pct: number
  skus_over_forecast: number   // actual > forecast
  skus_under_forecast: number  // actual < forecast
  worst_3: SkuVariance[]       // mayor impacto negativo (actual << forecast)
  best_3: SkuVariance[]        // mejor rendimiento (actual >> forecast)
  period_label: string         // e.g. "2024 (meses 1-12)"
}

// ── Función principal ─────────────────────────────────────────────────────────

export async function fetchSummaryKPIs(): Promise<SummaryKPIs> {
  // Varianza por SKU: planning_forecasts vs videndum_records (revenue)
  const varRows = await sql<{
    part_number: string
    forecast_qty: string
    actual_qty: string
    variance_qty: string
    variance_pct: string
    matched_months: string
  }>(`
    SELECT
      pf.part_number,
      ROUND(SUM(pf.quantity)::numeric, 0)                                      AS forecast_qty,
      ROUND(SUM(vr.quantity)::numeric, 0)                                      AS actual_qty,
      ROUND((SUM(vr.quantity) - SUM(pf.quantity))::numeric, 0)                 AS variance_qty,
      ROUND(((SUM(vr.quantity) - SUM(pf.quantity))
             / NULLIF(SUM(pf.quantity), 0) * 100)::numeric, 1)                AS variance_pct,
      COUNT(*)::text                                                            AS matched_months
    FROM public.planning_forecasts pf
    JOIN public.videndum_records    vr
      ON  vr.part_number  = pf.part_number
      AND vr.year         = pf.year
      AND vr.month        = pf.month
      AND vr.metric_type  = 'revenue'
    GROUP BY pf.part_number
    HAVING SUM(pf.quantity) > 0
    ORDER BY variance_pct ASC
  `)

  // Totales globales
  const totals = await sql<{
    total_forecast: string
    total_actual: string
    year_min: string
    year_max: string
    month_min: string
    month_max: string
  }>(`
    SELECT
      ROUND(SUM(pf.quantity)::numeric, 0)        AS total_forecast,
      ROUND(SUM(vr.quantity)::numeric, 0)        AS total_actual,
      MIN(pf.year)::text                         AS year_min,
      MAX(pf.year)::text                         AS year_max,
      MIN(pf.month)::text                        AS month_min,
      MAX(pf.month)::text                        AS month_max
    FROM public.planning_forecasts pf
    JOIN public.videndum_records    vr
      ON  vr.part_number = pf.part_number
      AND vr.year        = pf.year
      AND vr.month       = pf.month
      AND vr.metric_type = 'revenue'
  `)

  const t = totals[0]
  const totalForecast = Number(t?.total_forecast ?? 0)
  const totalActual   = Number(t?.total_actual   ?? 0)
  const totalVar      = totalActual - totalForecast
  const totalVarPct   = totalForecast > 0 ? (totalVar / totalForecast) * 100 : 0

  const toSkuVar = (r: typeof varRows[0]): SkuVariance => ({
    part_number:    r.part_number,
    forecast_qty:   Number(r.forecast_qty),
    actual_qty:     Number(r.actual_qty),
    variance_qty:   Number(r.variance_qty),
    variance_pct:   Number(r.variance_pct),
    matched_months: Number(r.matched_months),
  })

  const sorted = varRows.map(toSkuVar)

  const periodLabel =
    t?.year_min === t?.year_max
      ? `${t?.year_min} (meses ${t?.month_min}–${t?.month_max})`
      : `${t?.year_min}–${t?.year_max}`

  return {
    total_forecast:    totalForecast,
    total_actual:      totalActual,
    total_variance_qty: totalVar,
    total_variance_pct: Math.round(totalVarPct * 10) / 10,
    skus_over_forecast:  sorted.filter(s => s.variance_qty > 0).length,
    skus_under_forecast: sorted.filter(s => s.variance_qty < 0).length,
    worst_3: sorted.slice(0, 3),
    best_3:  [...sorted].sort((a, b) => b.variance_pct - a.variance_pct).slice(0, 3),
    period_label: periodLabel,
  }
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

export function buildSummaryPrompt(kpis: SummaryKPIs): string {
  const sign = (n: number) => (n >= 0 ? '+' : '') + n.toLocaleString('en-US')

  const skuTable = (rows: SkuVariance[]) =>
    rows.map(r =>
      `  • ${r.part_number}: forecast ${r.forecast_qty.toLocaleString()} u · real ${r.actual_qty.toLocaleString()} u · varianza ${sign(r.variance_qty)} u (${sign(r.variance_pct)}%)`
    ).join('\n')

  return `Eres el Director de Operaciones de Videndum.
Analiza los siguientes KPIs de forecast vs revenue real y escribe un resumen ejecutivo de máximo 200 palabras para el equipo de Inglaterra.
Enfócate en: (1) riesgos concretos, (2) oportunidades identificadas, (3) una recomendación clara y accionable.
Escribe en español. Sin rodeos. Usa formato ejecutivo: párrafos cortos y directos.

## KPIs del período ${kpis.period_label}

- Forecast total:   ${kpis.total_forecast.toLocaleString()} unidades
- Revenue real:     ${kpis.total_actual.toLocaleString()} unidades
- Varianza global:  ${sign(kpis.total_variance_qty)} u (${sign(kpis.total_variance_pct)}%)
- SKUs sobre plan:  ${kpis.skus_over_forecast}
- SKUs bajo plan:   ${kpis.skus_under_forecast}

## 3 SKUs con mayor impacto negativo (actual << forecast)
${skuTable(kpis.worst_3)}

## 3 SKUs con mejor rendimiento (actual >> forecast)
${skuTable(kpis.best_3)}

Resumen ejecutivo:`
}
