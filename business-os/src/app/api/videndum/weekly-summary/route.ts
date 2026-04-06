/**
 * GET /api/videndum/weekly-summary
 * Resumen ejecutivo semanal: MAPE global (últimos 2 meses ≈ 8 semanas),
 * alertas de cambios grandes, SKUs peores/mejores, distribución de accuracy.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Umbral para considerar un cambio como "alerta"
const CHANGE_THRESHOLD_PCT = 20

function getGrade(mape: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (mape < 10) return 'A'
  if (mape < 20) return 'B'
  if (mape < 30) return 'C'
  if (mape < 50) return 'D'
  return 'F'
}

function getSeverity(changePct: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  const abs = Math.abs(changePct)
  if (abs >= 50) return 'CRITICAL'
  if (abs >= 30) return 'HIGH'
  return 'MEDIUM'
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const windowMonths = parseInt(searchParams.get('window') ?? '2') // default 2 meses ≈ 8 semanas
  const topN = parseInt(searchParams.get('top') ?? '10')
  const paramYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
  const paramMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
  const catalogType = searchParams.get('catalog_type') // 'INV', 'PKG', or null for all

  try {
    let latestYear: number
    let latestMonth: number

    if (paramYear && paramMonth) {
      // Use explicit period from params
      latestYear = paramYear
      latestMonth = paramMonth
    } else {
      // Determine the analysis window: last N months with data
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

    // Build list of months to analyze (latest N months)
    const analysisMonths: { year: number; month: number }[] = []
    let y = latestYear, m = latestMonth
    for (let i = 0; i < windowMonths; i++) {
      analysisMonths.push({ year: y, month: m })
      m--
      if (m < 1) { m = 12; y-- }
    }

    // Also get the month BEFORE the window for change detection
    const prevMonth = { year: y, month: m }

    // Parallel queries
    const [forecastResult, realResult, prevRealResult, orderBookResult, orderIntakeResult] = await Promise.all([
      // Forecasts for analysis window
      supabase
        .from('planning_forecasts')
        .select('part_number, year, month, quantity')
        .eq('tenant_id', 'videndum')
        .or(analysisMonths.map(am => `and(year.eq.${am.year},month.eq.${am.month})`).join(',')),

      // Real data for analysis window
      supabase
        .from('videndum_records')
        .select('part_number, year, month, quantity, catalog_type')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .or(analysisMonths.map(am => `and(year.eq.${am.year},month.eq.${am.month})`).join(',')),

      // Real data for previous month (change detection)
      supabase
        .from('videndum_records')
        .select('part_number, quantity, catalog_type')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .eq('year', prevMonth.year)
        .eq('month', prevMonth.month),

      // Current order book (latest snapshot)
      supabase
        .from('order_book')
        .select('quantity')
        .eq('organization_id', 'videndum'),

      // Current order intake (latest month)
      supabase
        .from('order_intake')
        .select('quantity')
        .eq('organization_id', 'videndum')
        .eq('year', latestYear)
        .eq('month', latestMonth),
    ])

    if (forecastResult.error) throw forecastResult.error
    if (realResult.error) throw realResult.error

    const forecastData = forecastResult.data ?? []
    const realData = realResult.data ?? []
    const prevRealData = prevRealResult.data ?? []

    // Build lookup maps
    const forecastMap = new Map<string, number>()
    for (const row of forecastData) {
      const key = `${row.part_number}|${row.year}|${row.month}`
      forecastMap.set(key, (forecastMap.get(key) ?? 0) + parseFloat(String(row.quantity ?? 0)))
    }

    // Aggregate real data by SKU (across the window)
    const skuReal = new Map<string, { total: number; catalog_type: string | null; months: number }>()
    const skuForecast = new Map<string, { total: number; months: number }>()
    const skuCatalog = new Map<string, string | null>()

    for (const row of realData) {
      const qty = parseFloat(String(row.quantity ?? 0))
      const existing = skuReal.get(row.part_number) ?? { total: 0, catalog_type: row.catalog_type, months: 0 }
      existing.total += qty
      existing.months++
      skuReal.set(row.part_number, existing)
      skuCatalog.set(row.part_number, row.catalog_type)
    }

    for (const row of forecastData) {
      const qty = parseFloat(String(row.quantity ?? 0))
      const existing = skuForecast.get(row.part_number) ?? { total: 0, months: 0 }
      existing.total += qty
      existing.months++
      skuForecast.set(row.part_number, existing)
    }

    // Calculate per-SKU accuracy
    interface SkuAccuracyCalc {
      part_number: string
      catalog_type: string | null
      mape: number
      grade: 'A' | 'B' | 'C' | 'D' | 'F'
      forecast_qty: number
      real_qty: number
      variance_pct: number
      months_compared: number
    }

    const skuAccuracies: SkuAccuracyCalc[] = []
    let globalAbsError = 0
    let globalForecast = 0
    let globalReal = 0
    let globalBias = 0
    let globalCount = 0

    for (const [sku, real] of skuReal) {
      const forecast = skuForecast.get(sku)
      if (!forecast || forecast.total === 0) continue

      const absError = Math.abs(real.total - forecast.total)
      const mape = (absError / forecast.total) * 100
      const variancePct = ((real.total - forecast.total) / forecast.total) * 100

      skuAccuracies.push({
        part_number: sku,
        catalog_type: skuCatalog.get(sku) ?? null,
        mape: Math.round(mape * 100) / 100,
        grade: getGrade(mape),
        forecast_qty: Math.round(forecast.total),
        real_qty: Math.round(real.total),
        variance_pct: Math.round(variancePct * 100) / 100,
        months_compared: Math.min(real.months, forecast.months),
      })

      globalAbsError += absError
      globalForecast += forecast.total
      globalReal += real.total
      globalBias += (real.total - forecast.total)
      globalCount++
    }

    const mapeGlobal = globalForecast > 0 ? (globalAbsError / globalForecast) * 100 : 0

    // Change detection: compare latest month vs previous month
    const prevMap = new Map<string, number>()
    for (const row of prevRealData) {
      prevMap.set(row.part_number, parseFloat(String(row.quantity ?? 0)))
    }

    // Latest month real data
    const latestMonthData = realData.filter(r => r.year === latestYear && r.month === latestMonth)
    const latestMap = new Map<string, { qty: number; catalog_type: string | null }>()
    for (const row of latestMonthData) {
      latestMap.set(row.part_number, {
        qty: parseFloat(String(row.quantity ?? 0)),
        catalog_type: row.catalog_type,
      })
    }

    interface AlertCalc {
      part_number: string
      catalog_type: string | null
      alert_type: 'DEMAND_SPIKE' | 'DEMAND_DROP' | 'ACCURACY_DEGRADATION'
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
      change_pct: number
      previous_value: number
      current_value: number
      period: string
    }

    const alerts: AlertCalc[] = []
    const periodLabel = `${MONTH_NAMES[latestMonth - 1]} vs ${MONTH_NAMES[prevMonth.month - 1]}`

    for (const [sku, current] of latestMap) {
      const prev = prevMap.get(sku)
      if (prev === undefined || prev === 0) continue

      const changePct = ((current.qty - prev) / prev) * 100
      if (Math.abs(changePct) >= CHANGE_THRESHOLD_PCT) {
        alerts.push({
          part_number: sku,
          catalog_type: current.catalog_type,
          alert_type: changePct > 0 ? 'DEMAND_SPIKE' : 'DEMAND_DROP',
          severity: getSeverity(changePct),
          change_pct: Math.round(changePct * 100) / 100,
          previous_value: Math.round(prev),
          current_value: Math.round(current.qty),
          period: periodLabel,
        })
      }
    }

    // Sort alerts by severity then abs change
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || Math.abs(b.change_pct) - Math.abs(a.change_pct))

    // Sort SKU accuracies
    skuAccuracies.sort((a, b) => b.mape - a.mape)
    const worstSkus = skuAccuracies.slice(0, topN)
    const bestSkus = [...skuAccuracies].sort((a, b) => a.mape - b.mape).slice(0, topN)

    // Accuracy distribution
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    for (const s of skuAccuracies) gradeCounts[s.grade]++
    const total = skuAccuracies.length
    const distribution = Object.entries(gradeCounts).map(([grade, count]) => ({
      grade,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))

    // Order book / intake totals
    const totalOrderBook = (orderBookResult.data ?? []).reduce((sum, r) => sum + parseFloat(String(r.quantity ?? 0)), 0)
    const totalOrderIntake = (orderIntakeResult.data ?? []).reduce((sum, r) => sum + parseFloat(String(r.quantity ?? 0)), 0)

    // Available periods (for the period selector)
    const { data: availablePeriods } = await supabase
      .from('videndum_records')
      .select('year, month')
      .eq('tenant_id', 'videndum')
      .eq('metric_type', 'revenue')
      .not('month', 'is', null)
    const periodsSet = new Set<string>()
    for (const r of availablePeriods ?? []) {
      periodsSet.add(`${r.year}-${String(r.month).padStart(2, '0')}`)
    }
    const periods = [...periodsSet].sort().reverse()

    // Period label
    const firstMonth = analysisMonths[analysisMonths.length - 1]
    const lastMonth = analysisMonths[0]
    const periodLabelFull = `${MONTH_NAMES[firstMonth.month - 1]}-${MONTH_NAMES[lastMonth.month - 1]} ${lastMonth.year}`

    // Calculate previous period MAPE for trend
    const prevAnalysisMonths: { year: number; month: number }[] = []
    let py2 = prevMonth.year, pm2 = prevMonth.month
    for (let i = 0; i < windowMonths; i++) {
      prevAnalysisMonths.push({ year: py2, month: pm2 })
      pm2--
      if (pm2 < 1) { pm2 = 12; py2-- }
    }

    const [prevForecastRes, prevRealRes] = await Promise.all([
      supabase.from('planning_forecasts')
        .select('part_number, quantity')
        .eq('tenant_id', 'videndum')
        .or(prevAnalysisMonths.map(am => `and(year.eq.${am.year},month.eq.${am.month})`).join(',')),
      supabase.from('videndum_records')
        .select('part_number, quantity')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .or(prevAnalysisMonths.map(am => `and(year.eq.${am.year},month.eq.${am.month})`).join(',')),
    ])

    let prevMape: number | null = null
    if (prevForecastRes.data?.length && prevRealRes.data?.length) {
      const pForecastMap = new Map<string, number>()
      for (const r of prevForecastRes.data) pForecastMap.set(r.part_number, (pForecastMap.get(r.part_number) ?? 0) + parseFloat(String(r.quantity ?? 0)))
      const pRealMap = new Map<string, number>()
      for (const r of prevRealRes.data) pRealMap.set(r.part_number, (pRealMap.get(r.part_number) ?? 0) + parseFloat(String(r.quantity ?? 0)))
      let pAbsErr = 0, pTotalF = 0
      for (const [sku, real] of pRealMap) {
        const fc = pForecastMap.get(sku)
        if (fc && fc > 0) { pAbsErr += Math.abs(real - fc); pTotalF += fc }
      }
      if (pTotalF > 0) prevMape = Math.round((pAbsErr / pTotalF) * 10000) / 100
    }

    return NextResponse.json({
      kpis: {
        mape_global: Math.round(mapeGlobal * 100) / 100,
        mape_prev: prevMape,
        mape_grade: getGrade(mapeGlobal),
        total_skus_analyzed: globalCount,
        skus_with_alerts: alerts.length,
        total_order_book: Math.round(totalOrderBook),
        total_order_intake: Math.round(totalOrderIntake),
        forecast_bias: globalCount > 0 ? Math.round((globalBias / globalCount) * 100) / 100 : 0,
        period_label: periodLabelFull,
      },
      alerts: alerts.slice(0, 20), // Top 20 alerts
      worst_skus: worstSkus,
      best_skus: bestSkus,
      accuracy_distribution: distribution,
      available_periods: periods,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando resumen semanal'
    console.error('[weekly-summary] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
