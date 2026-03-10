import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MonthlyIntakeRow, PipelineRow, AnalyticsKPIs } from '@/features/videndum/types'

const MGMT_URL   = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'
const MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN

const MONTH_LABELS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

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

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // ── 1. Revenue vs Order Intake mensual (año más reciente con datos mensuales) ──
    const rawMonthly = await sql<{
      year: string; month: string
      revenue_qty: string; order_intake_qty: string; book_to_bill: string | null
    }>(`
      SELECT
        year,
        month,
        ROUND(SUM(revenue_qty)::numeric, 0)       AS revenue_qty,
        ROUND(SUM(order_intake_qty)::numeric, 0)  AS order_intake_qty,
        CASE WHEN SUM(revenue_qty) > 0
             THEN ROUND((SUM(order_intake_qty) / SUM(revenue_qty))::numeric, 3)
             ELSE NULL END                        AS book_to_bill
      FROM public.videndum_full_context
      WHERE month IS NOT NULL
        AND year = (
          SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL
        )
      GROUP BY year, month
      ORDER BY month
    `)

    const monthly: MonthlyIntakeRow[] = rawMonthly.map(r => ({
      month:            Number(r.month),
      label:            MONTH_LABELS[Number(r.month)] ?? String(r.month),
      revenue_qty:      Number(r.revenue_qty),
      order_intake_qty: Number(r.order_intake_qty),
      book_to_bill:     r.book_to_bill !== null ? Number(r.book_to_bill) : null,
    }))

    // ── 2. Pipeline: top 20 por order_book + opportunities ────────────────────
    const rawPipeline = await sql<{
      part_number: string; catalog_type: string | null
      order_book_qty: string; opportunities_qty: string
      opp_unfactored_qty: string; pipeline_factor_pct: string | null
    }>(`
      SELECT
        part_number,
        catalog_type,
        ROUND(SUM(order_book_qty)::numeric, 0)      AS order_book_qty,
        ROUND(SUM(opportunities_qty)::numeric, 1)   AS opportunities_qty,
        ROUND(SUM(opp_unfactored_qty)::numeric, 0)  AS opp_unfactored_qty,
        CASE
          WHEN SUM(opportunities_qty) + SUM(opp_unfactored_qty) > 0
          THEN ROUND((SUM(opportunities_qty) /
               NULLIF(SUM(opportunities_qty)+SUM(opp_unfactored_qty),0)*100)::numeric,1)
          ELSE NULL END                             AS pipeline_factor_pct
      FROM public.videndum_full_context
      WHERE (order_book_qty > 0 OR opportunities_qty > 0 OR opp_unfactored_qty > 0)
        AND month IS NOT NULL
      GROUP BY part_number, catalog_type
      HAVING SUM(order_book_qty) + SUM(opportunities_qty) > 0
      ORDER BY SUM(order_book_qty) + SUM(opportunities_qty) DESC
      LIMIT 20
    `)

    const pipeline: PipelineRow[] = rawPipeline.map(r => ({
      part_number:         r.part_number,
      catalog_type:        r.catalog_type,
      order_book_qty:      Number(r.order_book_qty),
      opportunities_qty:   Number(r.opportunities_qty),
      opp_unfactored_qty:  Number(r.opp_unfactored_qty),
      pipeline_factor_pct: r.pipeline_factor_pct !== null ? Number(r.pipeline_factor_pct) : null,
    }))

    // ── 3. KPIs globales ──────────────────────────────────────────────────────
    const [latestMonth, totals] = await Promise.all([
      sql<{ year: string; month: string; b2b: string | null }>(`
        SELECT
          year, month,
          CASE WHEN SUM(revenue_qty) > 0
               THEN ROUND((SUM(order_intake_qty)/SUM(revenue_qty))::numeric,3)
               ELSE NULL END AS b2b
        FROM public.videndum_full_context
        WHERE month IS NOT NULL AND order_intake_qty > 0
        GROUP BY year, month
        ORDER BY year DESC, month DESC
        LIMIT 1
      `),
      sql<{
        total_ob: string; total_opp: string; total_opp_raw: string; total_rev_12m: string
      }>(`
        SELECT
          ROUND(SUM(order_book_qty)::numeric,0)     AS total_ob,
          ROUND(SUM(opportunities_qty)::numeric,1)  AS total_opp,
          ROUND(SUM(opp_unfactored_qty)::numeric,0) AS total_opp_raw,
          ROUND(SUM(revenue_qty)::numeric,0)        AS total_rev_12m
        FROM public.videndum_full_context
        WHERE month IS NOT NULL
          AND year = (SELECT MAX(year) FROM public.videndum_full_context WHERE month IS NOT NULL)
      `),
    ])

    const lm    = latestMonth[0]
    const tot   = totals[0]
    const totalRev12m = Number(tot?.total_rev_12m ?? 0)
    const totalOB     = Number(tot?.total_ob ?? 0)

    const kpis: AnalyticsKPIs = {
      current_b2b:         lm?.b2b !== null && lm?.b2b !== undefined ? Number(lm.b2b) : null,
      current_month:       lm ? Number(lm.month) : 0,
      current_year:        lm ? Number(lm.year) : 0,
      total_order_book:    totalOB,
      total_opportunities: Number(tot?.total_opp ?? 0),
      total_opp_unfactored: Number(tot?.total_opp_raw ?? 0),
      coverage_ratio:      totalRev12m > 0 ? Math.round((totalOB / totalRev12m) * 100) / 100 : null,
    }

    return NextResponse.json({ monthly, pipeline, kpis })

  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
