import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { AnnualRow, SeasonalityRow, TopPartRow, VidendumKPIs } from '@/features/videndum/types'

// ── Validación de parámetros ─────────────────────────────────────────────────
const QuerySchema = z.object({
  catalog_type: z.enum(['all', 'INV', 'PKG']).default('all'),
  year_range: z.enum(['all', '3y', '5y']).default('all'),
})

// ── Helpers estadísticos ─────────────────────────────────────────────────────
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

// ── Cache config ─────────────────────────────────────────────────────────────
export const revalidate = 300 // 5 minutos

export async function GET(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Validación de parámetros ───────────────────────────────────────────────
  const { searchParams } = req.nextUrl
  const validation = QuerySchema.safeParse({
    catalog_type: searchParams.get('catalog_type'),
    year_range: searchParams.get('year_range'),
  })

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { catalog_type, year_range } = validation.data

  // ── Calcular rango de años ─────────────────────────────────────────────────
  const maxYear = 2025
  let minYear = 2020
  if (year_range === '3y') minYear = maxYear - 2
  if (year_range === '5y') minYear = maxYear - 4

  try {
    // ── 1. Annual revenue + order_intake ───────────────────────────────────
    let annualQuery = supabase
      .from('videndum_records')
      .select('year, metric_type, quantity')
      .is('month', null)
      .gte('year', minYear)
      .lte('year', maxYear)

    if (catalog_type !== 'all') {
      annualQuery = annualQuery.or(`catalog_type.eq.${catalog_type},metric_type.eq.order_intake`)
    }

    const { data: rawAnnual, error: annualError } = await annualQuery
    if (annualError) throw annualError

    const annualMap = new Map<number, { revenue: number; order_intake: number }>()
    for (const row of rawAnnual || []) {
      const yr = Number(row.year)
      if (!annualMap.has(yr)) annualMap.set(yr, { revenue: 0, order_intake: 0 })
      const qty = Number(row.quantity ?? 0)
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
    let seasQuery = supabase
      .from('videndum_records')
      .select('year, month, quantity')
      .eq('metric_type', 'revenue')
      .not('month', 'is', null)
      .gte('year', minYear)
      .lte('year', maxYear)

    if (catalog_type !== 'all') {
      seasQuery = seasQuery.eq('catalog_type', catalog_type)
    }

    const { data: rawSeas, error: seasError } = await seasQuery
    if (seasError) throw seasError

    // Agrupar por mes y calcular promedio
    const monthlyMap = new Map<number, number[]>()
    for (const row of rawSeas || []) {
      const m = Number(row.month)
      if (!monthlyMap.has(m)) monthlyMap.set(m, [])
      monthlyMap.get(m)!.push(Number(row.quantity ?? 0))
    }

    const seasonality: SeasonalityRow[] = Array.from(monthlyMap.entries())
      .map(([month, values]) => ({
        month,
        avg_revenue: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      }))
      .sort((a, b) => a.month - b.month)

    kpis.peak_month = seasonality.length
      ? seasonality.reduce((a, b) => a.avg_revenue > b.avg_revenue ? a : b).month
      : 0

    // ── 4. Top 15 parts ────────────────────────────────────────────────────
    let topQuery = supabase
      .from('videndum_records')
      .select('part_number, catalog_type, metric_type, quantity')
      .gte('year', minYear)
      .lte('year', maxYear)

    if (catalog_type !== 'all') {
      topQuery = topQuery.or(`catalog_type.eq.${catalog_type},metric_type.eq.order_intake`)
    }

    const { data: rawTop, error: topError } = await topQuery
    if (topError) throw topError

    // Agrupar por part_number
    const partMap = new Map<string, { catalog_type: string | null; revenue: number; intake: number }>()
    for (const row of rawTop || []) {
      const key = `${row.part_number}|${row.catalog_type ?? 'N/A'}`
      if (!partMap.has(key)) {
        partMap.set(key, { catalog_type: row.catalog_type, revenue: 0, intake: 0 })
      }
      const qty = Number(row.quantity ?? 0)
      if (row.metric_type === 'revenue') partMap.get(key)!.revenue += qty
      else if (row.metric_type === 'order_intake') partMap.get(key)!.intake += qty
    }

    const top_parts: TopPartRow[] = Array.from(partMap.entries())
      .map(([key, data]) => ({
        part_number: key.split('|')[0],
        catalog_type: data.catalog_type,
        total_revenue: data.revenue,
        total_intake: data.intake,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 15)

    return NextResponse.json(
      { annual, seasonality, top_parts, kpis },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('[videndum/dashboard] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
