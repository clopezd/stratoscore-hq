/**
 * GET /api/videndum/forecast-adjustments
 * Genera recomendaciones de ajuste para el modelo de forecast
 * basado en el análisis de varianzas y patrones detectados
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Adjustment {
  sku: string
  current_forecast_avg: number
  actual_sales_avg: number
  recommended_adjustment_pct: number
  recommended_adjustment_factor: number
  reason: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  action: 'increase' | 'decrease' | 'maintain'
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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

    // Agrupar por SKU
    const realMap = new Map<string, number>()
    for (const row of realData) {
      const key = `${row.part_number}|${row.year}|${row.month}`
      realMap.set(key, parseFloat(String(row.quantity ?? 0)))
    }

    const skuData = new Map<string, { forecastQty: number; realQty: number; count: number }>()

    for (const forecast of forecastData) {
      const key = `${forecast.part_number}|${forecast.year}|${forecast.month}`
      const realQty = realMap.get(key)

      if (realQty !== undefined && realQty > 0) {
        const forecastQty = parseFloat(String(forecast.quantity ?? 0))

        if (!skuData.has(forecast.part_number)) {
          skuData.set(forecast.part_number, { forecastQty: 0, realQty: 0, count: 0 })
        }

        const data = skuData.get(forecast.part_number)!
        data.forecastQty += forecastQty
        data.realQty += realQty
        data.count++
      }
    }

    // Generar recomendaciones
    const adjustments: Adjustment[] = []

    for (const [sku, data] of skuData) {
      const avgForecast = data.forecastQty / data.count
      const avgReal = data.realQty / data.count
      const variancePct = avgForecast > 0 ? ((avgReal - avgForecast) / avgForecast) * 100 : 0
      const absVariance = Math.abs(variancePct)

      // Solo recomendar ajustes si la varianza es significativa (> 15%)
      if (absVariance > 15) {
        let priority: 'critical' | 'high' | 'medium' | 'low'
        if (absVariance > 50) priority = 'critical'
        else if (absVariance > 30) priority = 'high'
        else if (absVariance > 20) priority = 'medium'
        else priority = 'low'

        const action: 'increase' | 'decrease' | 'maintain' = variancePct > 0 ? 'increase' : 'decrease'

        // Calcular factor de ajuste recomendado (más conservador que la varianza directa)
        const recommendedAdjustmentPct = variancePct * 0.7 // Ajustar 70% de la varianza detectada
        const recommendedFactor = 1 + (recommendedAdjustmentPct / 100)

        let reason = ''
        if (absVariance > 50) {
          reason = action === 'increase'
            ? 'Demanda real consistentemente > 50% sobre forecast. Ajuste crítico requerido.'
            : 'Sobre-forecast crítico > 50%. Reducir forecast para evitar exceso de inventario.'
        } else if (absVariance > 30) {
          reason = action === 'increase'
            ? 'Demanda real supera forecast en ~30-50%. Incrementar para evitar faltantes.'
            : 'Sobre-forecast significativo (30-50%). Ajustar para optimizar producción.'
        } else {
          reason = action === 'increase'
            ? 'Sub-forecast moderado. Incrementar gradualmente.'
            : 'Sobre-forecast moderado. Reducir gradualmente.'
        }

        adjustments.push({
          sku,
          current_forecast_avg: Math.round(avgForecast),
          actual_sales_avg: Math.round(avgReal),
          recommended_adjustment_pct: Math.round(recommendedAdjustmentPct * 10) / 10,
          recommended_adjustment_factor: Math.round(recommendedFactor * 1000) / 1000,
          reason,
          priority,
          action
        })
      }
    }

    // Ordenar por prioridad y varianza
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    adjustments.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return Math.abs(b.recommended_adjustment_pct) - Math.abs(a.recommended_adjustment_pct)
    })

    return NextResponse.json({
      adjustments,
      total_skus_analyzed: skuData.size,
      adjustments_recommended: adjustments.length,
      critical_count: adjustments.filter(a => a.priority === 'critical').length,
      high_count: adjustments.filter(a => a.priority === 'high').length
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al generar recomendaciones'
    console.error('[forecast-adjustments] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
