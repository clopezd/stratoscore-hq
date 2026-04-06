/**
 * GET /api/videndum/forecast-vs-real/timeseries
 * Series temporales mes a mes: Forecast vs Real
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface TimeSeriesPoint {
  year: number
  month: number
  month_label: string
  total_forecast: number
  total_real: number
  variance_pct: number
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filterYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
  const filterMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

  try {
    // Obtener forecast agrupado por mes con filtros opcionales
    let forecastQuery = supabase
      .from('planning_forecasts')
      .select('year, month, quantity')
      .eq('tenant_id', 'videndum')

    if (filterYear) forecastQuery = forecastQuery.eq('year', filterYear)
    if (filterMonth) forecastQuery = forecastQuery.eq('month', filterMonth)

    const { data: forecastData, error: forecastError } = await forecastQuery

    if (forecastError) throw forecastError

    // Obtener ventas reales agrupadas por mes con filtros opcionales
    let realQuery = supabase
      .from('videndum_records')
      .select('year, month, quantity')
      .eq('tenant_id', 'videndum')
      .eq('metric_type', 'revenue')

    if (filterYear) realQuery = realQuery.eq('year', filterYear)
    if (filterMonth) realQuery = realQuery.eq('month', filterMonth)

    const { data: realData, error: realError } = await realQuery

    if (realError) throw realError

    // Agrupar forecast por año-mes
    const forecastByMonth = new Map<string, number>()
    for (const row of forecastData) {
      const key = `${row.year}-${row.month}`
      const current = forecastByMonth.get(key) || 0
      forecastByMonth.set(key, current + parseFloat(String(row.quantity ?? 0)))
    }

    // Agrupar ventas reales por año-mes
    const realByMonth = new Map<string, number>()
    for (const row of realData) {
      const key = `${row.year}-${row.month}`
      const current = realByMonth.get(key) || 0
      realByMonth.set(key, current + parseFloat(String(row.quantity ?? 0)))
    }

    // Construir serie temporal solo para meses donde hay AMBOS datos
    const timeseries: TimeSeriesPoint[] = []
    for (const [key, forecastQty] of forecastByMonth) {
      const realQty = realByMonth.get(key)
      if (realQty !== undefined && realQty > 0) {
        const [yearStr, monthStr] = key.split('-')
        const year = parseInt(yearStr)
        const month = parseInt(monthStr)
        const variancePct = forecastQty > 0 ? ((realQty - forecastQty) / forecastQty) * 100 : 0

        timeseries.push({
          year,
          month,
          month_label: `${MONTH_NAMES[month - 1]} ${year}`,
          total_forecast: Math.round(forecastQty),
          total_real: Math.round(realQty),
          variance_pct: Math.round(variancePct * 10) / 10
        })
      }
    }

    // Ordenar por año y mes
    timeseries.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    return NextResponse.json({
      timeseries,
      total_months: timeseries.length
    })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al generar serie temporal'
    console.error('[timeseries] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
