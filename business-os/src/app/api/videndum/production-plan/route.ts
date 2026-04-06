/**
 * GET /api/videndum/production-plan
 * Genera recomendación de plan de producción basado en:
 * - Forecast (planning_forecasts)
 * - Order Book actual
 * - Historial de ventas reales
 *
 * Cada SKU muestra: forecast, order_book, run_rate, recomendación, y el PORQUÉ.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PlanRow {
  part_number: string
  catalog_type: string | null
  forecast_qty: number
  order_book_qty: number
  avg_monthly_revenue: number
  recommended_qty: number
  reason: string  // Transparencia: SIEMPRE explicar el porqué
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const targetYear = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const targetMonth = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  try {
    // Parallel: forecast + order book + historical revenue
    const [forecastRes, orderBookRes, revenueRes] = await Promise.all([
      supabase
        .from('planning_forecasts')
        .select('part_number, quantity')
        .eq('tenant_id', 'videndum')
        .eq('year', targetYear)
        .eq('month', targetMonth),

      supabase
        .from('order_book')
        .select('part_number, catalog_type, quantity')
        .eq('organization_id', 'videndum'),

      // Average monthly revenue (last 12 months with data)
      supabase
        .from('videndum_records')
        .select('part_number, catalog_type, quantity, year, month')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .gte('year', targetYear - 1),
    ])

    if (forecastRes.error) throw forecastRes.error

    // Build maps
    const forecastMap = new Map<string, number>()
    for (const r of forecastRes.data ?? []) {
      forecastMap.set(r.part_number, (forecastMap.get(r.part_number) ?? 0) + parseFloat(String(r.quantity ?? 0)))
    }

    const orderBookMap = new Map<string, { qty: number; catalog_type: string | null }>()
    for (const r of orderBookRes.data ?? []) {
      const existing = orderBookMap.get(r.part_number)
      const qty = parseFloat(String(r.quantity ?? 0))
      orderBookMap.set(r.part_number, {
        qty: (existing?.qty ?? 0) + qty,
        catalog_type: r.catalog_type ?? existing?.catalog_type ?? null,
      })
    }

    // Calculate average monthly revenue per SKU
    const revenueBySkuMonth = new Map<string, { total: number; months: number; catalog_type: string | null }>()
    for (const r of revenueRes.data ?? []) {
      const qty = parseFloat(String(r.quantity ?? 0))
      const existing = revenueBySkuMonth.get(r.part_number) ?? { total: 0, months: 0, catalog_type: r.catalog_type }
      existing.total += qty
      existing.months++
      revenueBySkuMonth.set(r.part_number, existing)
    }

    // All unique SKUs across all sources
    const allSkus = new Set([...forecastMap.keys(), ...orderBookMap.keys(), ...revenueBySkuMonth.keys()])

    const planRows: PlanRow[] = []

    for (const sku of allSkus) {
      const forecast = forecastMap.get(sku) ?? 0
      const orderBook = orderBookMap.get(sku)?.qty ?? 0
      const catalogType = orderBookMap.get(sku)?.catalog_type ?? revenueBySkuMonth.get(sku)?.catalog_type ?? null
      const revData = revenueBySkuMonth.get(sku)
      const avgRevenue = revData && revData.months > 0 ? revData.total / revData.months : 0

      // Recommendation logic with transparency
      let recommended = forecast
      let reason = ''
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'

      if (orderBook > forecast * 1.2) {
        // Order book significantly exceeds forecast
        recommended = orderBook
        reason = `Order Book (${Math.round(orderBook)}) supera forecast (${Math.round(forecast)}) en ${Math.round(((orderBook - forecast) / (forecast || 1)) * 100)}%. Producir para cubrir backlog.`
        priority = 'HIGH'
      } else if (avgRevenue > forecast * 1.15 && avgRevenue > 0) {
        // Historical run rate suggests higher demand
        recommended = Math.round((forecast + avgRevenue) / 2)
        reason = `Run rate promedio (${Math.round(avgRevenue)}/mes) es ${Math.round(((avgRevenue - forecast) / (forecast || 1)) * 100)}% mayor que forecast. Ajuste al alza.`
        priority = 'MEDIUM'
      } else if (forecast > avgRevenue * 1.3 && avgRevenue > 0) {
        // Forecast seems too high vs reality
        recommended = Math.round((forecast + avgRevenue) / 2)
        reason = `Forecast (${Math.round(forecast)}) supera run rate (${Math.round(avgRevenue)}) en ${Math.round(((forecast - avgRevenue) / avgRevenue) * 100)}%. Riesgo de sobre-inventario.`
        priority = 'MEDIUM'
      } else if (forecast === 0 && orderBook > 0) {
        recommended = orderBook
        reason = `Sin forecast pero hay Order Book activo (${Math.round(orderBook)} uds). Producir para órdenes existentes.`
        priority = 'HIGH'
      } else if (forecast > 0) {
        reason = `Forecast alineado con run rate. Sin ajustes necesarios.`
        priority = 'LOW'
      } else {
        continue // Skip SKUs with no data at all
      }

      if (recommended > 0 || orderBook > 0) {
        planRows.push({
          part_number: sku,
          catalog_type: catalogType,
          forecast_qty: Math.round(forecast),
          order_book_qty: Math.round(orderBook),
          avg_monthly_revenue: Math.round(avgRevenue),
          recommended_qty: Math.round(recommended),
          reason,
          priority,
        })
      }
    }

    // Sort: HIGH priority first, then by recommended_qty desc
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    planRows.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.recommended_qty - a.recommended_qty)

    return NextResponse.json({
      period: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
      total_skus: planRows.length,
      high_priority: planRows.filter(r => r.priority === 'HIGH').length,
      total_recommended: planRows.reduce((s, r) => s + r.recommended_qty, 0),
      total_order_book: planRows.reduce((s, r) => s + r.order_book_qty, 0),
      rows: planRows,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando plan de producción'
    console.error('[production-plan] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
