import { NextResponse } from 'next/server'
import type { VarianceRow } from '@/features/videndum/types'

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

export async function GET() {
  try {
    // Top 10 con mayor desviación negativa (actual muy por debajo del forecast)
    const negativeRows = await sql<{
      part_number: string
      catalog_type: string | null
      actual_qty: string
      forecast_qty: string
      variance_pct: string
      matched_months: string
    }>(`
      SELECT
        vr.part_number,
        vr.catalog_type,
        SUM(vr.quantity)                                                             AS actual_qty,
        SUM(pf.quantity)                                                             AS forecast_qty,
        ROUND(
          ((SUM(vr.quantity) - SUM(pf.quantity)) / NULLIF(SUM(pf.quantity), 0) * 100)::numeric,
          1
        )                                                                            AS variance_pct,
        COUNT(*)                                                                     AS matched_months
      FROM public.videndum_records vr
      JOIN public.planning_forecasts pf
        ON  vr.part_number = pf.part_number
        AND vr.year        = pf.year
        AND vr.month       = pf.month
      WHERE vr.metric_type = 'revenue'
      GROUP BY vr.part_number, vr.catalog_type
      HAVING SUM(pf.quantity) > 0
      ORDER BY variance_pct ASC
      LIMIT 10
    `)

    // Top 10 con mayor desviación positiva (actual muy por encima del forecast)
    const positiveRows = await sql<{
      part_number: string
      catalog_type: string | null
      actual_qty: string
      forecast_qty: string
      variance_pct: string
      matched_months: string
    }>(`
      SELECT
        vr.part_number,
        vr.catalog_type,
        SUM(vr.quantity)                                                             AS actual_qty,
        SUM(pf.quantity)                                                             AS forecast_qty,
        ROUND(
          ((SUM(vr.quantity) - SUM(pf.quantity)) / NULLIF(SUM(pf.quantity), 0) * 100)::numeric,
          1
        )                                                                            AS variance_pct,
        COUNT(*)                                                                     AS matched_months
      FROM public.videndum_records vr
      JOIN public.planning_forecasts pf
        ON  vr.part_number = pf.part_number
        AND vr.year        = pf.year
        AND vr.month       = pf.month
      WHERE vr.metric_type = 'revenue'
      GROUP BY vr.part_number, vr.catalog_type
      HAVING SUM(pf.quantity) > 0
      ORDER BY variance_pct DESC
      LIMIT 10
    `)

    // Período cubierto por el JOIN
    const period = await sql<{ min_year: string; max_year: string; min_month: string; max_month: string }>(`
      SELECT
        MIN(vr.year)  AS min_year,
        MAX(vr.year)  AS max_year,
        MIN(vr.month) AS min_month,
        MAX(vr.month) AS max_month
      FROM public.videndum_records vr
      JOIN public.planning_forecasts pf
        ON  vr.part_number = pf.part_number
        AND vr.year        = pf.year
        AND vr.month       = pf.month
      WHERE vr.metric_type = 'revenue'
    `)

    const toRow = (r: typeof negativeRows[0]): VarianceRow => ({
      part_number:    r.part_number,
      catalog_type:   r.catalog_type,
      actual_qty:     Number(r.actual_qty),
      forecast_qty:   Number(r.forecast_qty),
      variance_pct:   Number(r.variance_pct),
      matched_months: Number(r.matched_months),
    })

    return NextResponse.json({
      negative: negativeRows.map(toRow),
      positive: positiveRows.map(toRow),
      period:   period[0] ?? null,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
