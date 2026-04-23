/**
 * GET /api/videndum/production-runrate
 *
 * Genera matriz semanal de run rate de producción para los próximos N meses.
 * Usa: planning_forecasts + order_book + order_intake + opportunities + videndum_records (ventas) + global_inventory.
 *
 * Query params:
 *   weeks=13         (default: 13)
 *   start=YYYY-MM-DD (default: próximo lunes)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateRunRateMatrix,
  nextMonday,
  type ForecastRow,
  type OrderBookRow,
  type OrderIntakeRow,
  type OpportunityRow,
  type SaleRow,
  type InventoryRow,
} from '@/features/videndum/services/runRateEngine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Calcula MAPE histórico por SKU comparando el forecast UK ya emitido (planning_forecasts, tenant=videndum)
 * contra las ventas reales que efectivamente ocurrieron en los mismos meses.
 *
 * MAPE por mes = |actual - forecast| / max(actual, 1)
 * MAPE SKU = promedio de los últimos N meses con ambos datos (actual > 0 y forecast > 0)
 *
 * Retorna: Map<sku, { mape_pct, months_observed }>.
 */
function computeMapeBySku(
  pastForecasts: { part_number: string; year: number; month: number; quantity: number }[],
  sales: SaleRow[],
  today: Date,
): Map<string, { mape_pct: number; months_observed: number }> {
  // Ventana: últimos 6 meses completos (excluyendo el mes actual, que aún no tiene venta cerrada)
  const monthsWindow: { year: number; month: number }[] = []
  const cursor = new Date(today.getFullYear(), today.getMonth() - 1, 1) // mes pasado
  for (let i = 0; i < 6; i++) {
    monthsWindow.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 })
    cursor.setMonth(cursor.getMonth() - 1)
  }

  const inWindow = (y: number, m: number) => monthsWindow.some(w => w.year === y && w.month === m)

  // Index forecast: sku|y|m → qty
  const fIdx = new Map<string, number>()
  for (const r of pastForecasts) {
    if (!inWindow(r.year, r.month)) continue
    const k = `${r.part_number}|${r.year}|${r.month}`
    fIdx.set(k, (fIdx.get(k) ?? 0) + Number(r.quantity ?? 0))
  }

  // Index sales: sku|y|m → qty
  const sIdx = new Map<string, number>()
  for (const r of sales) {
    if (!inWindow(r.year, r.month)) continue
    const k = `${r.part_number}|${r.year}|${r.month}`
    sIdx.set(k, (sIdx.get(k) ?? 0) + Number(r.quantity ?? 0))
  }

  // Set de SKUs que tienen al menos un mes con forecast o venta
  const allSkus = new Set<string>()
  for (const k of fIdx.keys()) allSkus.add(k.split('|')[0])
  for (const k of sIdx.keys()) allSkus.add(k.split('|')[0])

  const out = new Map<string, { mape_pct: number; months_observed: number }>()
  for (const sku of allSkus) {
    let sumAbsPct = 0
    let months = 0
    for (const w of monthsWindow) {
      const k = `${sku}|${w.year}|${w.month}`
      const actual = sIdx.get(k) ?? 0
      const forecast = fIdx.get(k) ?? 0
      // Solo considerar meses donde hubo actual > 0 (evita división por 0 y meses sin demanda)
      if (actual <= 0) continue
      const err = Math.abs(actual - forecast) / actual
      sumAbsPct += err
      months++
    }
    if (months > 0) {
      out.set(sku, {
        mape_pct: Math.round((sumAbsPct / months) * 1000) / 10,
        months_observed: months,
      })
    }
  }
  return out
}

async function fetchInputs(opts: { startDate: Date; numWeeks: number }) {
  const supabase = await createClient()
  const { startDate, numWeeks } = opts

  // Rangos de fetch
  const firstMonth = { year: startDate.getFullYear(), month: startDate.getMonth() + 1 }
  const lastDate = new Date(startDate)
  lastDate.setDate(lastDate.getDate() + numWeeks * 7 - 1)
  const lastMonth = { year: lastDate.getFullYear(), month: lastDate.getMonth() + 1 }

  // Histórico: 24 meses hacia atrás desde hoy
  const today = new Date()
  const historyStart = new Date(today); historyStart.setMonth(historyStart.getMonth() - 24)

  // Meses del horizonte futuro [firstMonth..lastMonth]
  const futureMonths: { year: number; month: number }[] = []
  let y = firstMonth.year, m = firstMonth.month
  while (y < lastMonth.year || (y === lastMonth.year && m <= lastMonth.month)) {
    futureMonths.push({ year: y, month: m })
    m++
    if (m > 12) { m = 1; y++ }
  }
  const futureOr = futureMonths.map(mm => `and(year.eq.${mm.year},month.eq.${mm.month})`).join(',')

  // Meses pasados (últimos 6 completos) para MAPE histórico del UK forecast
  const pastMonths: { year: number; month: number }[] = []
  const cur = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  for (let i = 0; i < 6; i++) {
    pastMonths.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 })
    cur.setMonth(cur.getMonth() - 1)
  }
  const pastOr = pastMonths.map(mm => `and(year.eq.${mm.year},month.eq.${mm.month})`).join(',')

  const [forecastsRes, orderBookRes, orderIntakeRes, opportunitiesRes, salesRes, inventoryRes, pastForecastsRes] = await Promise.all([
    // Forecast: solo meses futuros del horizonte
    supabase
      .from('planning_forecasts')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')
      .or(futureOr),

    // Order book: todo el backlog reciente (>= hoy año-2)
    supabase
      .from('order_book')
      .select('part_number, catalog_type, year, month, quantity')
      .eq('organization_id', 'videndum')
      .gte('year', today.getFullYear() - 1),

    // Order intake: últimos 6 meses para momentum
    supabase
      .from('order_intake')
      .select('part_number, year, month, quantity')
      .eq('organization_id', 'videndum')
      .gte('year', today.getFullYear() - 1),

    // Opportunities: ponderadas, en meses futuros
    supabase
      .from('opportunities')
      .select('part_number, catalog_type, year, month, quantity, probability_pct')
      .eq('organization_id', 'videndum')
      .or(futureOr),

    // Ventas histórico: 24 meses
    supabase
      .from('videndum_records')
      .select('part_number, catalog_type, year, month, quantity')
      .eq('tenant_id', 'videndum')
      .eq('metric_type', 'revenue')
      .not('month', 'is', null)
      .gte('year', historyStart.getFullYear()),

    // Inventario: snapshot actual
    supabase
      .from('global_inventory')
      .select('part_number, year, month, quantity, updated_at')
      .eq('organization_id', 'videndum'),

    // Forecasts pasados (últimos 6 meses completos) — para calcular MAPE histórico del UK forecast
    supabase
      .from('planning_forecasts')
      .select('part_number, year, month, quantity')
      .eq('tenant_id', 'videndum')
      .or(pastOr),
  ])

  if (forecastsRes.error) throw forecastsRes.error
  if (orderBookRes.error) throw orderBookRes.error
  if (orderIntakeRes.error) throw orderIntakeRes.error
  if (opportunitiesRes.error) throw opportunitiesRes.error
  if (salesRes.error) throw salesRes.error
  if (inventoryRes.error) throw inventoryRes.error
  if (pastForecastsRes.error) throw pastForecastsRes.error

  return {
    forecasts: (forecastsRes.data ?? []) as ForecastRow[],
    orderBook: (orderBookRes.data ?? []) as OrderBookRow[],
    orderIntake: (orderIntakeRes.data ?? []) as OrderIntakeRow[],
    opportunities: (opportunitiesRes.data ?? []) as OpportunityRow[],
    sales: (salesRes.data ?? []) as SaleRow[],
    inventory: (inventoryRes.data ?? []) as InventoryRow[],
    pastForecasts: (pastForecastsRes.data ?? []) as { part_number: string; year: number; month: number; quantity: number }[],
  }
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const weeks = Math.min(52, Math.max(1, parseInt(searchParams.get('weeks') ?? '13')))
  const startParam = searchParams.get('start')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = startParam ? new Date(startParam) : nextMonday(today)

  try {
    const inputs = await fetchInputs({ startDate, numWeeks: weeks })
    const matrix = calculateRunRateMatrix({
      forecasts: inputs.forecasts,
      orderBook: inputs.orderBook,
      orderIntake: inputs.orderIntake,
      opportunities: inputs.opportunities,
      sales: inputs.sales,
      inventory: inputs.inventory,
      startDate,
      numWeeks: weeks,
      today,
    })

    // Enriquecer con MAPE histórico del UK forecast por SKU
    const mapeBySku = computeMapeBySku(inputs.pastForecasts, inputs.sales, today)
    const enrichedRows = matrix.rows.map(r => {
      const m = mapeBySku.get(r.part_number)
      return {
        ...r,
        historical_mape_pct: m?.mape_pct ?? null,
        mape_months_observed: m?.months_observed ?? 0,
      }
    })

    // Agregar métricas globales de MAPE al summary
    const allMapes = Array.from(mapeBySku.values())
    const avgMape = allMapes.length > 0
      ? Math.round((allMapes.reduce((s, v) => s + v.mape_pct, 0) / allMapes.length) * 10) / 10
      : null
    const skusWithHighMape = allMapes.filter(v => v.mape_pct > 30).length

    return NextResponse.json({
      ...matrix,
      rows: enrichedRows,
      summary: {
        ...matrix.summary,
        avg_forecast_mape_pct: avgMape,
        skus_with_high_mape: skusWithHighMape,
        mape_window_months: 6,
      },
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando run rate matrix'
    console.error('[production-runrate] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
