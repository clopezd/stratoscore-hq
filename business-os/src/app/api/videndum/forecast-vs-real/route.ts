/**
 * GET /api/videndum/forecast-vs-real
 * Forecast Accuracy con ventana rolling de 8 semanas (2 meses).
 *
 * Params:
 *  - window: meses de ventana (default 2 = ~8 semanas)
 *  - catalog_type: 'INV' | 'PKG' (omitir = todos)
 *  - year, month: período específico (omitir = último disponible)
 *  - top: cantidad de SKUs en top/bottom (default 20)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getGrade(mape: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (mape < 10) return 'A'
  if (mape < 20) return 'B'
  if (mape < 30) return 'C'
  if (mape < 50) return 'D'
  return 'F'
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const windowMonths = parseInt(searchParams.get('window') ?? '2')
  const topN = parseInt(searchParams.get('top') ?? '20')
  const paramYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
  const paramMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
  const catalogType = searchParams.get('catalog_type') ?? null

  try {
    // Determine the analysis period
    let latestYear: number
    let latestMonth: number

    if (paramYear && paramMonth) {
      latestYear = paramYear
      latestMonth = paramMonth
    } else {
      const { data: latestRecords } = await supabase
        .from('videndum_records')
        .select('year, month')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)

      if (!latestRecords?.length) {
        return NextResponse.json({ error: 'No hay datos disponibles' }, { status: 404 })
      }
      latestYear = latestRecords[0].year
      latestMonth = latestRecords[0].month
    }

    // Build analysis window (current + previous for trend)
    const analysisMonths: { year: number; month: number }[] = []
    let y = latestYear, m = latestMonth
    for (let i = 0; i < windowMonths; i++) {
      analysisMonths.push({ year: y, month: m })
      m--
      if (m < 1) { m = 12; y-- }
    }

    // Previous window for trend comparison
    const prevMonths: { year: number; month: number }[] = []
    for (let i = 0; i < windowMonths; i++) {
      prevMonths.push({ year: y, month: m })
      m--
      if (m < 1) { m = 12; y-- }
    }

    // Parallel queries: current window + previous window
    const orFilter = (months: { year: number; month: number }[]) =>
      months.map(am => `and(year.eq.${am.year},month.eq.${am.month})`).join(',')

    const [forecastRes, realRes, prevForecastRes, prevRealRes, periodsRes] = await Promise.all([
      supabase
        .from('planning_forecasts')
        .select('part_number, year, month, quantity')
        .eq('tenant_id', 'videndum')
        .or(orFilter(analysisMonths)),
      supabase
        .from('videndum_records')
        .select('part_number, year, month, quantity, catalog_type')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .or(orFilter(analysisMonths)),
      supabase
        .from('planning_forecasts')
        .select('part_number, quantity')
        .eq('tenant_id', 'videndum')
        .or(orFilter(prevMonths)),
      supabase
        .from('videndum_records')
        .select('part_number, quantity')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .or(orFilter(prevMonths)),
      // Available periods
      supabase
        .from('videndum_records')
        .select('year, month')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null),
    ])

    if (forecastRes.error) throw forecastRes.error
    if (realRes.error) throw realRes.error

    const forecastData = forecastRes.data ?? []
    let realData = realRes.data ?? []

    // Apply catalog_type filter if specified
    if (catalogType) {
      realData = realData.filter(r => r.catalog_type === catalogType)
    }

    // Build per-SKU aggregates
    const skuCatalog = new Map<string, string | null>()
    const skuForecast = new Map<string, number>()
    const skuReal = new Map<string, number>()
    const skuMonths = new Map<string, number>()

    // Collect catalog types from real data
    for (const row of realData) {
      skuCatalog.set(row.part_number, row.catalog_type)
    }

    // Filter forecasts to only SKUs present in (possibly filtered) real data
    const relevantSkus = new Set(realData.map(r => r.part_number))

    for (const row of forecastData) {
      if (!relevantSkus.has(row.part_number)) continue
      const qty = parseFloat(String(row.quantity ?? 0))
      skuForecast.set(row.part_number, (skuForecast.get(row.part_number) ?? 0) + qty)
    }

    for (const row of realData) {
      const qty = parseFloat(String(row.quantity ?? 0))
      skuReal.set(row.part_number, (skuReal.get(row.part_number) ?? 0) + qty)
      skuMonths.set(row.part_number, (skuMonths.get(row.part_number) ?? 0) + 1)
    }

    // Calculate per-SKU accuracy
    interface SkuAnalysis {
      sku: string
      catalog_type: string | null
      mape: number
      accuracy_grade: 'A' | 'B' | 'C' | 'D' | 'F'
      total_forecast: number
      total_real: number
      variance_pct: number
      records: number
    }

    const productAnalysis: SkuAnalysis[] = []
    let globalAbsError = 0
    let globalForecast = 0
    let globalReal = 0
    let globalBias = 0

    for (const [sku, realTotal] of skuReal) {
      const forecastTotal = skuForecast.get(sku)
      if (!forecastTotal || forecastTotal === 0) continue
      if (realTotal === 0) continue

      const absError = Math.abs(realTotal - forecastTotal)
      const mape = (absError / forecastTotal) * 100
      const variancePct = ((realTotal - forecastTotal) / forecastTotal) * 100

      productAnalysis.push({
        sku,
        catalog_type: skuCatalog.get(sku) ?? null,
        mape: Math.round(mape * 100) / 100,
        accuracy_grade: getGrade(mape),
        total_forecast: Math.round(forecastTotal),
        total_real: Math.round(realTotal),
        variance_pct: Math.round(variancePct * 100) / 100,
        records: skuMonths.get(sku) ?? 0,
      })

      globalAbsError += absError
      globalForecast += forecastTotal
      globalReal += realTotal
      globalBias += (realTotal - forecastTotal)
    }

    const mape = globalForecast > 0 ? (globalAbsError / globalForecast) * 100 : 0
    const rmse = productAnalysis.length > 0
      ? Math.sqrt(productAnalysis.reduce((sum, p) => {
          const fc = p.total_forecast
          const diff = p.total_real - fc
          return sum + diff * diff
        }, 0) / productAnalysis.length)
      : 0
    const bias = productAnalysis.length > 0 ? globalBias / productAnalysis.length : 0

    // Previous window MAPE for trend
    let mapePrev: number | null = null
    if (prevForecastRes.data?.length && prevRealRes.data?.length) {
      const pf = new Map<string, number>()
      for (const r of prevForecastRes.data) pf.set(r.part_number, (pf.get(r.part_number) ?? 0) + parseFloat(String(r.quantity ?? 0)))
      const pr = new Map<string, number>()
      for (const r of prevRealRes.data) pr.set(r.part_number, (pr.get(r.part_number) ?? 0) + parseFloat(String(r.quantity ?? 0)))
      let pAbsErr = 0, pTotalF = 0
      for (const [sku, real] of pr) {
        const fc = pf.get(sku)
        if (fc && fc > 0) { pAbsErr += Math.abs(real - fc); pTotalF += fc }
      }
      if (pTotalF > 0) mapePrev = Math.round((pAbsErr / pTotalF) * 10000) / 100
    }

    // Accuracy distribution
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    for (const p of productAnalysis) gradeCounts[p.accuracy_grade]++
    const total = productAnalysis.length
    const accuracy_distribution = Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

    // Sort by MAPE desc (worst first)
    productAnalysis.sort((a, b) => b.mape - a.mape)

    // Period label
    const firstMonth = analysisMonths[analysisMonths.length - 1]
    const lastMonth = analysisMonths[0]
    const periodLabel = windowMonths === 1
      ? `${MONTH_NAMES[lastMonth.month - 1]} ${lastMonth.year}`
      : `${MONTH_NAMES[firstMonth.month - 1]}-${MONTH_NAMES[lastMonth.month - 1]} ${lastMonth.year}`

    // Available periods
    const periodsSet = new Set<string>()
    for (const r of periodsRes.data ?? []) {
      periodsSet.add(`${r.year}-${String(r.month).padStart(2, '0')}`)
    }
    const available_periods = [...periodsSet].sort().reverse()

    return NextResponse.json({
      global_metrics: {
        mape: Math.round(mape * 100) / 100,
        mape_prev: mapePrev,
        mape_grade: getGrade(mape),
        rmse: Math.round(rmse * 100) / 100,
        bias: Math.round(bias * 100) / 100,
        total_forecast: Math.round(globalForecast),
        total_real: Math.round(globalReal),
        records_compared: productAnalysis.length,
        period_label: periodLabel,
        window_months: windowMonths,
      },
      product_analysis: productAnalysis,
      top_worst_products: productAnalysis.slice(0, topN),
      top_best_products: [...productAnalysis].reverse().slice(0, topN),
      accuracy_distribution,
      available_periods,
      total_products_analyzed: productAnalysis.length,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al analizar forecast vs real'
    console.error('[forecast-vs-real] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
