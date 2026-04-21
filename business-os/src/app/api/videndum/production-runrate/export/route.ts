/**
 * GET /api/videndum/production-runrate/export
 * Genera y retorna el .xlsx con la matriz de run rate.
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
import { buildRunRateExcelBuffer, runRateExcelFilename } from '@/features/videndum/services/runRateExcelExport'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function fetchInputs(supabase: Awaited<ReturnType<typeof createClient>>, opts: { startDate: Date; numWeeks: number }) {
  const { startDate, numWeeks } = opts
  const today = new Date()
  const firstMonth = { year: startDate.getFullYear(), month: startDate.getMonth() + 1 }
  const lastDate = new Date(startDate)
  lastDate.setDate(lastDate.getDate() + numWeeks * 7 - 1)
  const lastMonth = { year: lastDate.getFullYear(), month: lastDate.getMonth() + 1 }
  const historyStart = new Date(today); historyStart.setMonth(historyStart.getMonth() - 24)

  const futureMonths: { year: number; month: number }[] = []
  let y = firstMonth.year, m = firstMonth.month
  while (y < lastMonth.year || (y === lastMonth.year && m <= lastMonth.month)) {
    futureMonths.push({ year: y, month: m })
    m++
    if (m > 12) { m = 1; y++ }
  }
  const futureOr = futureMonths.map(mm => `and(year.eq.${mm.year},month.eq.${mm.month})`).join(',')

  const [forecastsRes, orderBookRes, orderIntakeRes, opportunitiesRes, salesRes, inventoryRes] = await Promise.all([
    supabase.from('planning_forecasts').select('part_number, year, month, quantity').eq('tenant_id', 'videndum').or(futureOr),
    supabase.from('order_book').select('part_number, catalog_type, year, month, quantity').eq('organization_id', 'videndum').gte('year', today.getFullYear() - 1),
    supabase.from('order_intake').select('part_number, year, month, quantity').eq('organization_id', 'videndum').gte('year', today.getFullYear() - 1),
    supabase.from('opportunities').select('part_number, catalog_type, year, month, quantity, probability_pct').eq('organization_id', 'videndum').or(futureOr),
    supabase.from('videndum_records').select('part_number, catalog_type, year, month, quantity').eq('tenant_id', 'videndum').eq('metric_type', 'revenue').not('month', 'is', null).gte('year', historyStart.getFullYear()),
    supabase.from('global_inventory').select('part_number, year, month, quantity, updated_at').eq('organization_id', 'videndum'),
  ])

  if (forecastsRes.error) throw forecastsRes.error
  if (orderBookRes.error) throw orderBookRes.error
  if (orderIntakeRes.error) throw orderIntakeRes.error
  if (opportunitiesRes.error) throw opportunitiesRes.error
  if (salesRes.error) throw salesRes.error
  if (inventoryRes.error) throw inventoryRes.error

  return {
    forecasts: (forecastsRes.data ?? []) as ForecastRow[],
    orderBook: (orderBookRes.data ?? []) as OrderBookRow[],
    orderIntake: (orderIntakeRes.data ?? []) as OrderIntakeRow[],
    opportunities: (opportunitiesRes.data ?? []) as OpportunityRow[],
    sales: (salesRes.data ?? []) as SaleRow[],
    inventory: (inventoryRes.data ?? []) as InventoryRow[],
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
    const inputs = await fetchInputs(supabase, { startDate, numWeeks: weeks })
    const matrix = calculateRunRateMatrix({ ...inputs, startDate, numWeeks: weeks, today })
    const buf = await buildRunRateExcelBuffer(matrix)
    const filename = runRateExcelFilename(matrix)

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error generando Excel'
    console.error('[production-runrate/export] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
