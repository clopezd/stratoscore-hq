/**
 * GET /api/videndum/forecast-vs-real
 * Compara forecast (planning_forecasts) vs ventas reales (videndum_records)
 * Calcula varianzas, MAPE, RMSE, y genera insights
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ForecastVsReal {
  sku: string
  year: number
  month: number
  forecast_qty: number
  real_qty: number
  variance_abs: number
  variance_pct: number
  month_name: string
}

interface AccuracyMetrics {
  mape: number  // Mean Absolute Percentage Error
  rmse: number  // Root Mean Squared Error
  bias: number  // Promedio de varianzas (positivo = sobre-forecast, negativo = sub-forecast)
  total_forecast: number
  total_real: number
  records_compared: number
}

interface ProductAnalysis {
  sku: string
  mape: number
  total_forecast: number
  total_real: number
  variance_pct: number
  records: number
  accuracy_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec']

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const topN = parseInt(searchParams.get('top') ?? '20')
  const filterYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
  const filterMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

  try {
    // 1. Query comparativo: Forecast vs Real con filtros opcionales
    let forecastQuery = supabase
      .from('planning_forecasts')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')

    if (filterYear) forecastQuery = forecastQuery.eq('year', filterYear)
    if (filterMonth) forecastQuery = forecastQuery.eq('month', filterMonth)

    const { data: forecastData, error: forecastError } = await forecastQuery

    if (forecastError) throw forecastError

    let realQuery = supabase
      .from('videndum_records')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')
      .eq('metric_type', 'revenue')

    if (filterYear) realQuery = realQuery.eq('year', filterYear)
    if (filterMonth) realQuery = realQuery.eq('month', filterMonth)

    const { data: realData, error: realError } = await realQuery

    if (realError) throw realError

    // 2. Crear mapa de ventas reales para lookup rápido
    const realMap = new Map<string, number>()
    for (const row of realData) {
      const key = `${row.part_number}|${row.year}|${row.month}`
      realMap.set(key, parseFloat(String(row.quantity ?? 0)))
    }

    // 3. Comparar y calcular varianzas
    const comparisons: ForecastVsReal[] = []
    const skuMetrics = new Map<string, { sumAbsError: number; sumSqError: number; sumBias: number; totalForecast: number; totalReal: number; count: number }>()

    for (const forecast of forecastData) {
      const key = `${forecast.part_number}|${forecast.year}|${forecast.month}`
      const realQty = realMap.get(key)

      if (realQty !== undefined && realQty > 0) {
        const forecastQty = parseFloat(String(forecast.quantity ?? 0))
        const varianceAbs = realQty - forecastQty
        const variancePct = forecastQty > 0 ? ((varianceAbs / forecastQty) * 100) : 0
        const absError = Math.abs(varianceAbs)
        const sqError = varianceAbs * varianceAbs

        comparisons.push({
          sku: forecast.part_number,
          year: forecast.year,
          month: forecast.month,
          forecast_qty: forecastQty,
          real_qty: realQty,
          variance_abs: varianceAbs,
          variance_pct: variancePct,
          month_name: MONTH_NAMES[forecast.month - 1] ?? `M${forecast.month}`
        })

        // Acumular métricas por SKU
        if (!skuMetrics.has(forecast.part_number)) {
          skuMetrics.set(forecast.part_number, { sumAbsError: 0, sumSqError: 0, sumBias: 0, totalForecast: 0, totalReal: 0, count: 0 })
        }
        const metrics = skuMetrics.get(forecast.part_number)!
        metrics.sumAbsError += absError
        metrics.sumSqError += sqError
        metrics.sumBias += varianceAbs
        metrics.totalForecast += forecastQty
        metrics.totalReal += realQty
        metrics.count++
      }
    }

    // 4. Calcular métricas globales
    let totalAbsError = 0
    let totalSqError = 0
    let totalBias = 0
    let totalForecast = 0
    let totalReal = 0
    let count = 0

    for (const comp of comparisons) {
      totalAbsError += Math.abs(comp.variance_abs)
      totalSqError += comp.variance_abs * comp.variance_abs
      totalBias += comp.variance_abs
      totalForecast += comp.forecast_qty
      totalReal += comp.real_qty
      count++
    }

    const mape = count > 0 ? (totalAbsError / totalForecast) * 100 : 0
    const rmse = count > 0 ? Math.sqrt(totalSqError / count) : 0
    const bias = count > 0 ? totalBias / count : 0

    const globalMetrics: AccuracyMetrics = {
      mape: Math.round(mape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      bias: Math.round(bias * 100) / 100,
      total_forecast: Math.round(totalForecast),
      total_real: Math.round(totalReal),
      records_compared: count
    }

    // 5. Análisis por producto
    const productAnalysis: ProductAnalysis[] = []
    for (const [sku, metrics] of skuMetrics) {
      const productMape = metrics.totalForecast > 0 ? (metrics.sumAbsError / metrics.totalForecast) * 100 : 0
      const variancePct = metrics.totalForecast > 0 ? ((metrics.totalReal - metrics.totalForecast) / metrics.totalForecast) * 100 : 0

      // Asignar grade según MAPE
      let grade: 'A' | 'B' | 'C' | 'D' | 'F'
      if (productMape < 10) grade = 'A'
      else if (productMape < 20) grade = 'B'
      else if (productMape < 30) grade = 'C'
      else if (productMape < 50) grade = 'D'
      else grade = 'F'

      productAnalysis.push({
        sku,
        mape: Math.round(productMape * 100) / 100,
        total_forecast: Math.round(metrics.totalForecast),
        total_real: Math.round(metrics.totalReal),
        variance_pct: Math.round(variancePct * 100) / 100,
        records: metrics.count,
        accuracy_grade: grade
      })
    }

    // Ordenar por MAPE descendente (peores primero)
    productAnalysis.sort((a, b) => b.mape - a.mape)

    // 6. Top N peores productos
    const topWorst = productAnalysis.slice(0, topN)

    // 7. Top N mejores productos
    const topBest = productAnalysis.slice(-topN).reverse()

    return NextResponse.json({
      global_metrics: globalMetrics,
      comparisons: comparisons.slice(0, 100), // Limitar a 100 para no saturar
      product_analysis: productAnalysis,
      top_worst_products: topWorst,
      top_best_products: topBest,
      total_products_analyzed: productAnalysis.length
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al analizar forecast vs real'
    console.error('[forecast-vs-real] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
