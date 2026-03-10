import { NextRequest, NextResponse } from 'next/server'
import type { AnnualRow, SeasonalityRow, TopPartRow, VidendumKPIs } from '@/features/videndum/types'

const MGMT_URL = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'
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

function stddevCV(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 0
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  return (Math.sqrt(variance) / mean) * 100
}

function cagr(first: number, last: number, years: number): number {
  if (first <= 0 || years <= 0) return 0
  return ((last / first) ** (1 / years) - 1) * 100
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const catalogType = searchParams.get('catalog_type') ?? 'all'
  const yearRange   = searchParams.get('year_range') ?? 'all'

  const maxYear = 2025
  let minYear = 2020
  if (yearRange === '3y') minYear = maxYear - 2
  if (yearRange === '5y') minYear = maxYear - 4

  // ── Filtro de catalog_type ──────────────────────────────────────────────
  const catFilter = catalogType !== 'all'
    ? `AND (catalog_type = '${catalogType}' OR metric_type = 'order_intake')`
    : ''
  const catFilterRev = catalogType !== 'all'
    ? `AND catalog_type = '${catalogType}'`
    : ''

  try {
    // ── 1. Annual revenue + order_intake ───────────────────────────────────
    const rawAnnual = await sql<{ year: string; metric_type: string; total: string }>(`
      SELECT year, metric_type, SUM(quantity) AS total
      FROM public.videndum_records
      WHERE month IS NULL
        AND year BETWEEN ${minYear} AND ${maxYear}
        ${catFilter}
      GROUP BY year, metric_type
      ORDER BY year
    `)

    const annualMap = new Map<number, { revenue: number; order_intake: number }>()
    for (const row of rawAnnual) {
      const yr = Number(row.year)
      if (!annualMap.has(yr)) annualMap.set(yr, { revenue: 0, order_intake: 0 })
      const qty = Number(row.total ?? 0)
      if (row.metric_type === 'revenue') annualMap.get(yr)!.revenue += qty
      else if (row.metric_type === 'order_intake') annualMap.get(yr)!.order_intake += qty
    }

    const annual: AnnualRow[] = Array.from(annualMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, { revenue, order_intake }]) => ({
        year,
        revenue,
        order_intake,
        book_to_bill: revenue > 0 ? Math.round((order_intake / revenue) * 100) / 100 : 0,
      }))

    // ── 2. KPIs ────────────────────────────────────────────────────────────
    const revVals = annual.map(r => r.revenue)
    const b2bVals = annual.map(r => r.book_to_bill)

    const kpis: VidendumKPIs = {
      total_revenue: revVals.reduce((a, b) => a + b, 0),
      cagr_pct: revVals.length >= 2
        ? Math.round(cagr(revVals[0], revVals[revVals.length - 1], revVals.length - 1) * 10) / 10
        : 0,
      cv_pct: Math.round(stddevCV(revVals) * 10) / 10,
      avg_b2b: b2bVals.length
        ? Math.round((b2bVals.reduce((a, b) => a + b, 0) / b2bVals.length) * 100) / 100
        : 0,
      peak_month: 0,
      year_from: annual[0]?.year ?? minYear,
      year_to: annual[annual.length - 1]?.year ?? maxYear,
    }

    // ── 3. Seasonality ─────────────────────────────────────────────────────
    const rawSeas = await sql<{ month: string; avg_revenue: string }>(`
      SELECT month, ROUND(AVG(monthly_total)::numeric, 0) AS avg_revenue
      FROM (
        SELECT year, month, SUM(quantity) AS monthly_total
        FROM public.videndum_records
        WHERE metric_type = 'revenue'
          AND month IS NOT NULL
          AND year BETWEEN ${minYear} AND ${maxYear}
          ${catFilterRev}
        GROUP BY year, month
      ) sub
      GROUP BY month
      ORDER BY month
    `)

    const seasonality: SeasonalityRow[] = rawSeas.map(r => ({
      month: Number(r.month),
      avg_revenue: Number(r.avg_revenue),
    }))

    kpis.peak_month = seasonality.length
      ? seasonality.reduce((a, b) => a.avg_revenue > b.avg_revenue ? a : b).month
      : 0

    // ── 4. Top 15 parts ────────────────────────────────────────────────────
    const rawTop = await sql<{ part_number: string; catalog_type: string | null; total_revenue: string; total_intake: string }>(`
      SELECT
        part_number,
        catalog_type,
        SUM(CASE WHEN metric_type = 'revenue' THEN quantity ELSE 0 END) AS total_revenue,
        SUM(CASE WHEN metric_type = 'order_intake' THEN quantity ELSE 0 END) AS total_intake
      FROM public.videndum_records
      WHERE year BETWEEN ${minYear} AND ${maxYear}
        ${catFilter}
      GROUP BY part_number, catalog_type
      ORDER BY total_revenue DESC
      LIMIT 15
    `)

    const top_parts: TopPartRow[] = rawTop.map(r => ({
      part_number: r.part_number,
      catalog_type: r.catalog_type,
      total_revenue: Number(r.total_revenue),
      total_intake: Number(r.total_intake),
    }))

    return NextResponse.json({ annual, seasonality, top_parts, kpis })

  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
