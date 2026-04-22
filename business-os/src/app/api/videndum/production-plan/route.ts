/**
 * GET  /api/videndum/production-plan — Genera recomendaciones + carga plan guardado
 * POST /api/videndum/production-plan — Guardar plan (draft o approved)
 * PATCH /api/videndum/production-plan — Actualizar status (approve, mark exported)
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
  adjusted_qty: number | null
  adjustment_reason: string | null
  reason: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'draft' | 'approved' | 'exported' | 'new'
  plan_id: string | null
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

  // Week start = Monday of current week
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const weekStart = searchParams.get('week_start') ?? monday.toISOString().split('T')[0]

  try {
    // Parallel: forecast + order book + historical + saved plan
    const [forecastRes, orderBookRes, revenueRes, savedPlanRes] = await Promise.all([
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

      supabase
        .from('videndum_records')
        .select('part_number, catalog_type, quantity, year, month')
        .eq('tenant_id', 'videndum')
        .eq('metric_type', 'revenue')
        .not('month', 'is', null)
        .gte('year', targetYear - 1),

      // Load saved plan for this week
      supabase
        .from('videndum_production_plans')
        .select('id, part_number, recommended_qty, adjusted_qty, adjustment_reason, status')
        .eq('tenant_id', 'videndum')
        .eq('week_start', weekStart),
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

    const revenueBySkuMonth = new Map<string, { total: number; months: number; catalog_type: string | null }>()
    for (const r of revenueRes.data ?? []) {
      const qty = parseFloat(String(r.quantity ?? 0))
      const existing = revenueBySkuMonth.get(r.part_number) ?? { total: 0, months: 0, catalog_type: r.catalog_type }
      existing.total += qty
      existing.months++
      revenueBySkuMonth.set(r.part_number, existing)
    }

    // Saved plan map
    const savedMap = new Map<string, { id: string; adjusted_qty: number | null; adjustment_reason: string | null; status: string }>()
    for (const r of savedPlanRes.data ?? []) {
      savedMap.set(r.part_number, {
        id: r.id,
        adjusted_qty: r.adjusted_qty ? parseFloat(String(r.adjusted_qty)) : null,
        adjustment_reason: r.adjustment_reason,
        status: r.status,
      })
    }

    const allSkus = new Set([...forecastMap.keys(), ...orderBookMap.keys(), ...revenueBySkuMonth.keys()])
    const planRows: PlanRow[] = []

    for (const sku of allSkus) {
      const rawForecast = forecastMap.get(sku) ?? 0
      const orderBook = orderBookMap.get(sku)?.qty ?? 0
      const catalogType = orderBookMap.get(sku)?.catalog_type ?? revenueBySkuMonth.get(sku)?.catalog_type ?? null
      const revData = revenueBySkuMonth.get(sku)
      const avgRevenue = revData && revData.months > 0 ? revData.total / revData.months : 0

      // Si no hay forecast real, pronosticar con histórico
      const hasForecast = rawForecast > 0
      const forecast = hasForecast ? rawForecast : Math.round(avgRevenue)

      let recommended = forecast
      let reason = ''
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
      const forecastLabel = hasForecast ? 'forecast' : `pronóstico histórico (${revData?.months ?? 0} meses)`

      if (forecast === 0 && orderBook > 0) {
        // Sin forecast ni histórico, solo order book
        recommended = orderBook
        reason = `Sin forecast ni histórico. Order Book activo (${Math.round(orderBook)} uds).`
        priority = 'HIGH'
      } else if (orderBook > forecast * 1.2) {
        recommended = orderBook
        reason = `Order Book (${Math.round(orderBook)}) supera ${forecastLabel} (${Math.round(forecast)}) en ${Math.round(((orderBook - forecast) / (forecast || 1)) * 100)}%. Producir para cubrir backlog.`
        priority = 'HIGH'
      } else if (hasForecast && avgRevenue > forecast * 1.15 && avgRevenue > 0) {
        recommended = Math.round((forecast + avgRevenue) / 2)
        reason = `Run rate (${Math.round(avgRevenue)}/mes) supera forecast en ${Math.round(((avgRevenue - forecast) / (forecast || 1)) * 100)}%. Ajuste al alza.`
        priority = 'MEDIUM'
      } else if (hasForecast && forecast > avgRevenue * 1.3 && avgRevenue > 0) {
        recommended = Math.round((forecast + avgRevenue) / 2)
        reason = `Forecast supera run rate en ${Math.round(((forecast - avgRevenue) / avgRevenue) * 100)}%. Riesgo sobre-inventario.`
        priority = 'MEDIUM'
      } else if (!hasForecast && avgRevenue > 0) {
        recommended = Math.round(avgRevenue)
        reason = `Sin forecast. Recomendado basado en promedio histórico (${revData?.months ?? 0} meses, ~${Math.round(avgRevenue)} uds/mes).`
        priority = 'MEDIUM'
      } else if (forecast > 0) {
        reason = hasForecast ? `Forecast alineado con run rate. Sin ajustes.` : `Basado en promedio histórico (${revData?.months ?? 0} meses). Sin ajustes.`
        priority = 'LOW'
      } else {
        continue
      }

      if (recommended > 0 || orderBook > 0) {
        const saved = savedMap.get(sku)
        planRows.push({
          part_number: sku,
          catalog_type: catalogType,
          forecast_qty: Math.round(forecast),
          order_book_qty: Math.round(orderBook),
          avg_monthly_revenue: Math.round(avgRevenue),
          recommended_qty: Math.round(recommended),
          adjusted_qty: saved?.adjusted_qty ?? null,
          adjustment_reason: saved?.adjustment_reason ?? null,
          reason,
          priority,
          status: (saved?.status as PlanRow['status']) ?? 'new',
          plan_id: saved?.id ?? null,
        })
      }
    }

    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    planRows.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.recommended_qty - a.recommended_qty)

    // Determine overall plan status
    const statuses = planRows.filter(r => r.plan_id).map(r => r.status)
    const planStatus = statuses.length === 0 ? 'new'
      : statuses.every(s => s === 'exported') ? 'exported'
      : statuses.every(s => s === 'approved' || s === 'exported') ? 'approved'
      : 'draft'

    return NextResponse.json({
      period: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
      week_start: weekStart,
      plan_status: planStatus,
      total_skus: planRows.length,
      high_priority: planRows.filter(r => r.priority === 'HIGH').length,
      total_recommended: planRows.reduce((s, r) => s + r.recommended_qty, 0),
      total_adjusted: planRows.reduce((s, r) => s + (r.adjusted_qty ?? r.recommended_qty), 0),
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

/**
 * POST — Guardar plan completo (upsert all rows for the week)
 * Body: { week_start, rows: [{ part_number, catalog_type, recommended_qty, adjusted_qty, adjustment_reason }] }
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { week_start, rows, status } = body as {
      week_start: string
      rows: { part_number: string; catalog_type?: string | null; recommended_qty: number; adjusted_qty?: number | null; adjustment_reason?: string | null }[]
      status?: 'draft' | 'approved'
    }

    if (!week_start || !rows?.length) {
      return NextResponse.json({ error: 'week_start y rows son requeridos' }, { status: 400 })
    }

    const planStatus = status ?? 'draft'

    // Upsert rows
    const upsertData = rows.map(r => ({
      tenant_id: 'videndum',
      week_start,
      part_number: r.part_number,
      catalog_type: r.catalog_type ?? null,
      recommended_qty: r.recommended_qty,
      adjusted_qty: r.adjusted_qty ?? null,
      adjustment_reason: r.adjustment_reason ?? null,
      status: planStatus,
      updated_at: new Date().toISOString(),
      ...(planStatus === 'approved' ? { approved_by: user.id } : {}),
    }))

    const { error } = await supabase
      .from('videndum_production_plans')
      .upsert(upsertData, { onConflict: 'tenant_id,week_start,part_number' })

    if (error) throw error

    return NextResponse.json({
      saved: upsertData.length,
      week_start,
      status: planStatus,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error guardando plan'
    console.error('[production-plan] POST error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * PATCH — Actualizar status del plan completo de una semana
 * Body: { week_start, status: 'approved' | 'exported' }
 */
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { week_start, status } = body as { week_start: string; status: 'approved' | 'exported' }

    if (!week_start || !status) {
      return NextResponse.json({ error: 'week_start y status son requeridos' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'approved') updateData.approved_by = user.id
    if (status === 'exported') updateData.exported_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('videndum_production_plans')
      .update(updateData)
      .eq('tenant_id', 'videndum')
      .eq('week_start', week_start)
      .select('id')

    if (error) throw error

    return NextResponse.json({ updated: data?.length ?? 0, week_start, status })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error actualizando plan'
    console.error('[production-plan] PATCH error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
