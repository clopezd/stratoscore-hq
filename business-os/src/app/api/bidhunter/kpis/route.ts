/**
 * GET /api/bidhunter/kpis
 *
 * Returns KPIs, conversion funnel, and time series data.
 * Query: ?period=week|month|quarter|all
 */
import { NextRequest, NextResponse } from 'next/server'
import { getKPIs, getConversionFunnel, getTimeSeriesData } from '@/features/bidhunter/services/kpiService'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const period = (req.nextUrl.searchParams.get('period') || 'all') as 'week' | 'month' | 'quarter' | 'all'

    const [kpis, funnel, timeSeries] = await Promise.all([
      getKPIs(period),
      getConversionFunnel(),
      getTimeSeriesData(12),
    ])

    return NextResponse.json({ kpis, funnel, timeSeries })
  } catch (err) {
    console.error('KPIs API error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
