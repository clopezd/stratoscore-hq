import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MonthlyIntakeRow, PipelineRow, AnalyticsKPIs } from '@/features/videndum/types'

const MONTH_LABELS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// ── Cache config ─────────────────────────────────────────────────────────────
export const revalidate = 300 // 5 minutos

export async function GET() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // ── 1. Revenue vs Order Intake mensual (año más reciente) ──────────────
    const { data: latestYear, error: yearError } = await supabase
      .from('videndum_full_context')
      .select('year')
      .not('month', 'is', null)
      .order('year', { ascending: false })
      .limit(1)
      .single()

    if (yearError) throw yearError
    const currentYear = latestYear?.year ?? 2025

    const { data: rawMonthly, error: monthlyError } = await supabase
      .from('videndum_full_context')
      .select('year, month, revenue_qty, order_intake_qty')
      .eq('year', currentYear)
      .not('month', 'is', null)
      .order('month')

    if (monthlyError) throw monthlyError

    // Agrupar por mes y calcular B2B
    const monthlyMap = new Map<number, { revenue: number; intake: number }>()
    for (const row of rawMonthly || []) {
      const m = Number(row.month)
      if (!monthlyMap.has(m)) monthlyMap.set(m, { revenue: 0, intake: 0 })
      monthlyMap.get(m)!.revenue += Number(row.revenue_qty ?? 0)
      monthlyMap.get(m)!.intake += Number(row.order_intake_qty ?? 0)
    }

    const monthly: MonthlyIntakeRow[] = Array.from(monthlyMap.entries())
      .map(([month, { revenue, intake }]) => ({
        month,
        label: MONTH_LABELS[month] ?? String(month),
        revenue_qty: revenue,
        order_intake_qty: intake,
        book_to_bill: revenue > 0 ? Math.round((intake / revenue) * 1000) / 1000 : null,
      }))
      .sort((a, b) => a.month - b.month)

    // ── 2. Pipeline: top 20 por order_book + opportunities ──────────────────
    const { data: rawPipeline, error: pipelineError } = await supabase
      .from('videndum_full_context')
      .select('part_number, catalog_type, order_book_qty, opportunities_qty, opp_unfactored_qty')
      .not('month', 'is', null)
      .or('order_book_qty.gt.0,opportunities_qty.gt.0,opp_unfactored_qty.gt.0')

    if (pipelineError) throw pipelineError

    // Agrupar por part_number
    const pipelineMap = new Map<string, {
      catalog_type: string | null
      order_book: number
      opp: number
      opp_raw: number
    }>()

    for (const row of rawPipeline || []) {
      const key = `${row.part_number}|${row.catalog_type ?? 'N/A'}`
      if (!pipelineMap.has(key)) {
        pipelineMap.set(key, {
          catalog_type: row.catalog_type,
          order_book: 0,
          opp: 0,
          opp_raw: 0,
        })
      }
      const p = pipelineMap.get(key)!
      p.order_book += Number(row.order_book_qty ?? 0)
      p.opp += Number(row.opportunities_qty ?? 0)
      p.opp_raw += Number(row.opp_unfactored_qty ?? 0)
    }

    const pipeline: PipelineRow[] = Array.from(pipelineMap.entries())
      .map(([key, data]) => {
        const total_opp = data.opp + data.opp_raw
        const factor = total_opp > 0 ? Math.round((data.opp / total_opp) * 1000) / 10 : null
        return {
          part_number: key.split('|')[0],
          catalog_type: data.catalog_type,
          order_book_qty: Math.round(data.order_book),
          opportunities_qty: Math.round(data.opp * 10) / 10,
          opp_unfactored_qty: Math.round(data.opp_raw),
          pipeline_factor_pct: factor,
        }
      })
      .filter(p => p.order_book_qty + p.opportunities_qty > 0)
      .sort((a, b) => (b.order_book_qty + b.opportunities_qty) - (a.order_book_qty + a.opportunities_qty))
      .slice(0, 20)

    // ── 3. KPIs globales ────────────────────────────────────────────────────
    // Latest month B2B
    const lastMonth = monthly.length > 0 ? monthly[monthly.length - 1] : null

    // Totales del año actual
    const { data: totals, error: totalsError } = await supabase
      .from('videndum_full_context')
      .select('order_book_qty, opportunities_qty, opp_unfactored_qty, revenue_qty')
      .eq('year', currentYear)
      .not('month', 'is', null)

    if (totalsError) throw totalsError

    let totalOB = 0
    let totalOpp = 0
    let totalOppRaw = 0
    let totalRev = 0

    for (const row of totals || []) {
      totalOB += Number(row.order_book_qty ?? 0)
      totalOpp += Number(row.opportunities_qty ?? 0)
      totalOppRaw += Number(row.opp_unfactored_qty ?? 0)
      totalRev += Number(row.revenue_qty ?? 0)
    }

    const kpis: AnalyticsKPIs = {
      current_b2b: lastMonth?.book_to_bill ?? null,
      current_month: lastMonth?.month ?? 0,
      current_year: currentYear,
      total_order_book: Math.round(totalOB),
      total_opportunities: Math.round(totalOpp * 10) / 10,
      total_opp_unfactored: Math.round(totalOppRaw),
      coverage_ratio: totalRev > 0 ? Math.round((totalOB / totalRev) * 100) / 100 : null,
    }

    return NextResponse.json(
      { monthly, pipeline, kpis },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('[videndum/analytics] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
