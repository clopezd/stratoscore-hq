/**
 * ML Forecast API — Predicciones semanales del modelo Prophet
 * Endpoint: /api/videndum/ml-forecast?sku=XXX&weeks=4
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

interface MLForecast {
  sku: string
  week: string
  week_start_date: string
  ml_prediction: number
  ml_confidence_low: number
  ml_confidence_high: number
  trend_factor: number | null
  seasonality_factor: number | null
  competition_factor: number | null
  pipeline_factor: number | null
  model_version: string
  model_type: string
  anomaly_score: number | null
  confidence_score: number | null
  created_at: string
}

interface ComparisonData {
  sku: string
  week: string
  week_start_date: string
  ml_prediction: number
  ml_confidence_low: number
  ml_confidence_high: number
  historical_avg: number | null
  deviation_pct: number | null
  uk_forecast: number | null
  real_demand: number | null
}

export async function GET(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Params ─────────────────────────────────────────────────────────────────
  const { searchParams } = request.nextUrl
  const sku = searchParams.get('sku')
  const weeks = parseInt(searchParams.get('weeks') || '4', 10)
  const mode = searchParams.get('mode') || 'forecast' // 'forecast' | 'comparison'

  try {
    if (mode === 'comparison') {
      // ── Modo: Comparación ML vs. Histórico vs. UK (si existe) ───────────────
      // Usar la vista v_forecast_comparison que ya tiene los joins
      let query = supabase
        .from('v_forecast_comparison')
        .select('sku, week, week_start_date, ml_prediction, ml_confidence_low, ml_confidence_high, uk_forecast, real_demand')

      if (sku) {
        query = query.eq('sku', sku).limit(weeks)
      } else {
        query = query.gte('week_start_date', new Date().toISOString().split('T')[0]).limit(50)
      }

      query = query.order('week_start_date', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      // Calcular historical_avg y deviation_pct
      const rows: ComparisonData[] = await Promise.all((data || []).map(async (r: any) => {
        // Obtener histórico de videndum_full_context
        const { data: histData } = await supabase
          .from('videndum_full_context')
          .select('revenue_qty')
          .eq('part_number', r.sku)
          .not('month', 'is', null)
          .gte('year', new Date().getFullYear() - 1)

        const historical_avg = histData && histData.length > 0
          ? Math.round(histData.reduce((sum, h) => sum + (h.revenue_qty || 0), 0) / histData.length / 4.33)
          : null

        const deviation_pct = historical_avg && historical_avg > 0
          ? Math.round((r.ml_prediction - historical_avg) / historical_avg * 100)
          : null

        return {
          sku: r.sku,
          week: r.week,
          week_start_date: r.week_start_date,
          ml_prediction: r.ml_prediction,
          ml_confidence_low: r.ml_confidence_low,
          ml_confidence_high: r.ml_confidence_high,
          historical_avg,
          uk_forecast: r.uk_forecast,
          real_demand: r.real_demand,
          deviation_pct
        }
      }))

      return NextResponse.json({ forecasts: rows })

    } else {
      // ── Modo: Forecast directo (solo ML predictions) ─────────────────────────
      const { data, error } = sku
        ? await supabase.from('ml_forecast_predictions')
            .select('*')
            .eq('sku', sku)
            .gte('week_start_date', new Date().toISOString().split('T')[0])
            .order('week_start_date', { ascending: true })
            .limit(weeks)
        : await supabase.from('ml_forecast_predictions')
            .select('*')
            .gte('week_start_date', new Date().toISOString().split('T')[0])
            .order('week_start_date', { ascending: true })
            .order('ml_prediction', { ascending: false })
            .limit(50)

      if (error) throw error

      const forecasts: MLForecast[] = data || []

      return NextResponse.json({ forecasts })
    }

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('[ml-forecast] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
