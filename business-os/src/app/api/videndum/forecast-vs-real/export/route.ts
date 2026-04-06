/**
 * GET /api/videndum/forecast-vs-real/export
 * Exporta el análisis completo a Excel con múltiples hojas
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Obtener datos comparativos
    const { data: forecastData, error: forecastError } = await supabase
      .from('planning_forecasts')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')

    if (forecastError) throw forecastError

    const { data: realData, error: realError } = await supabase
      .from('videndum_records')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')
      .eq('metric_type', 'revenue')

    if (realError) throw realError

    // 2. Crear mapa de ventas reales
    const realMap = new Map<string, number>()
    for (const row of realData) {
      const key = `${row.part_number}|${row.year}|${row.month}`
      realMap.set(key, parseFloat(String(row.quantity ?? 0)))
    }

    // 3. Construir comparaciones detalladas
    const detailedComparisons: any[] = []
    const skuMetrics = new Map<string, { totalForecast: number; totalReal: number; count: number; sumAbsError: number }>()

    for (const forecast of forecastData) {
      const key = `${forecast.part_number}|${forecast.year}|${forecast.month}`
      const realQty = realMap.get(key)

      if (realQty !== undefined && realQty > 0) {
        const forecastQty = parseFloat(String(forecast.quantity ?? 0))
        const varianceAbs = realQty - forecastQty
        const variancePct = forecastQty > 0 ? ((varianceAbs / forecastQty) * 100) : 0

        detailedComparisons.push({
          SKU: forecast.part_number,
          Año: forecast.year,
          Mes: MONTH_NAMES[forecast.month - 1] || `M${forecast.month}`,
          Forecast: Math.round(forecastQty),
          Real: Math.round(realQty),
          'Varianza Abs': Math.round(varianceAbs),
          'Varianza %': Math.round(variancePct * 10) / 10
        })

        // Acumular por SKU
        if (!skuMetrics.has(forecast.part_number)) {
          skuMetrics.set(forecast.part_number, { totalForecast: 0, totalReal: 0, count: 0, sumAbsError: 0 })
        }
        const metrics = skuMetrics.get(forecast.part_number)!
        metrics.totalForecast += forecastQty
        metrics.totalReal += realQty
        metrics.count++
        metrics.sumAbsError += Math.abs(varianceAbs)
      }
    }

    // 4. Resumen por SKU
    const skuSummary: any[] = []
    for (const [sku, metrics] of skuMetrics) {
      const mape = metrics.totalForecast > 0 ? (metrics.sumAbsError / metrics.totalForecast) * 100 : 0
      const variancePct = metrics.totalForecast > 0 ? ((metrics.totalReal - metrics.totalForecast) / metrics.totalForecast) * 100 : 0

      let grade = 'F'
      if (mape < 10) grade = 'A'
      else if (mape < 20) grade = 'B'
      else if (mape < 30) grade = 'C'
      else if (mape < 50) grade = 'D'

      skuSummary.push({
        SKU: sku,
        'Total Forecast': Math.round(metrics.totalForecast),
        'Total Real': Math.round(metrics.totalReal),
        'MAPE %': Math.round(mape * 10) / 10,
        'Varianza %': Math.round(variancePct * 10) / 10,
        'Meses': metrics.count,
        'Grade': grade
      })
    }

    // Ordenar por MAPE descendente
    skuSummary.sort((a, b) => b['MAPE %'] - a['MAPE %'])

    // 5. Métricas globales
    let totalAbsError = 0
    let totalForecast = 0
    let totalReal = 0
    for (const comp of detailedComparisons) {
      totalAbsError += Math.abs(comp['Varianza Abs'])
      totalForecast += comp.Forecast
      totalReal += comp.Real
    }

    const globalMape = totalForecast > 0 ? (totalAbsError / totalForecast) * 100 : 0
    const globalVariance = totalForecast > 0 ? ((totalReal - totalForecast) / totalForecast) * 100 : 0

    const globalSummary = [
      { Métrica: 'MAPE (Error %)', Valor: Math.round(globalMape * 10) / 10 },
      { Métrica: 'Total Forecast', Valor: Math.round(totalForecast) },
      { Métrica: 'Total Real', Valor: Math.round(totalReal) },
      { Métrica: 'Varianza Global %', Valor: Math.round(globalVariance * 10) / 10 },
      { Métrica: 'SKUs Analizados', Valor: skuMetrics.size },
      { Métrica: 'Registros Comparados', Valor: detailedComparisons.length }
    ]

    // 6. Crear workbook
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen Global
    const ws1 = XLSX.utils.json_to_sheet(globalSummary)
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen Global')

    // Hoja 2: Por SKU
    const ws2 = XLSX.utils.json_to_sheet(skuSummary)
    XLSX.utils.book_append_sheet(wb, ws2, 'Análisis por SKU')

    // Hoja 3: Comparaciones Detalladas (limitado a 10,000 filas por rendimiento)
    const ws3 = XLSX.utils.json_to_sheet(detailedComparisons.slice(0, 10000))
    XLSX.utils.book_append_sheet(wb, ws3, 'Detalle Mensual')

    // 7. Generar buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // 8. Retornar como descarga
    const fileName = `Videndum_ForecastVsReal_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al exportar'
    console.error('[export] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
