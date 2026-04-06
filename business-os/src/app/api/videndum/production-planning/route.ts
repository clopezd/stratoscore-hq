import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// ── Cache config ─────────────────────────────────────────────────────────────
export const revalidate = 300 // 5 minutos

export async function GET(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Parámetros de URL ──────────────────────────────────────────────────────
  const searchParams = request.nextUrl.searchParams
  const selectedSku = searchParams.get('sku') // null = todos los SKUs

  try {
    // ── 1. Obtener todos los SKUs con su data agregada ────────────────────
    const { data: allSkusData, error: allSkusError } = await supabase
      .from('videndum_full_context')
      .select('part_number, catalog_type, year, month, revenue_qty, order_book_qty, opportunities_qty, opp_unfactored_qty')
      .not('month', 'is', null)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (allSkusError) throw allSkusError

    // Agrupar por SKU
    const skusMap = new Map<string, {
      catalogType: string | null
      monthlyRevenue: Map<string, number>
      orderBook: number
      opportunities: number
      oppUnfactored: number
    }>()

    for (const row of allSkusData || []) {
      const sku = row.part_number
      if (!sku) continue

      if (!skusMap.has(sku)) {
        skusMap.set(sku, {
          catalogType: row.catalog_type,
          monthlyRevenue: new Map(),
          orderBook: 0,
          opportunities: 0,
          oppUnfactored: 0,
        })
      }

      const skuData = skusMap.get(sku)!

      // Revenue histórico
      if (row.month && row.revenue_qty) {
        const key = `${row.year}-${String(row.month).padStart(2, '0')}`
        skuData.monthlyRevenue.set(key, (skuData.monthlyRevenue.get(key) ?? 0) + Number(row.revenue_qty))
      }

      // Order book
      if (row.order_book_qty) {
        skuData.orderBook += Number(row.order_book_qty)
      }

      // Opportunities
      if (row.opportunities_qty) {
        skuData.opportunities += Number(row.opportunities_qty)
      }
      if (row.opp_unfactored_qty) {
        skuData.oppUnfactored += Number(row.opp_unfactored_qty)
      }
    }

    // ── 2. Calcular run rate para cada SKU ────────────────────────────────
    const cv = 0.15
    const safetyFactor = 1.65 * cv
    const weeksInPeriod = 3 * 4.33

    interface SkuRunRate {
      partNumber: string
      catalogType: string | null
      avgMonthlyRevenue: number
      orderBook: number
      opportunities: number
      oppUnfactored: number
      projectedDemand3M: number
      weeklyBase: number
      weeklyWith95Accuracy: number
      dailyTarget: number
      monthlyRevenue: Array<{ period: string; revenue: number; weeklyAvg: number }>
    }

    const allSkusRunRates: SkuRunRate[] = []
    let totalAvgMonthlyRevenue = 0
    let totalOrderBook = 0
    let totalOpportunities = 0

    for (const [sku, data] of skusMap.entries()) {
      const revenueValues = Array.from(data.monthlyRevenue.values())
      const avgMonthlyRevenue = revenueValues.length > 0
        ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
        : 0

      const projectedDemand = (avgMonthlyRevenue * 3) + data.orderBook + (data.opportunities * 0.7)
      const weeklyBase = projectedDemand / weeksInPeriod
      const weeklyWith95Accuracy = weeklyBase * (1 + safetyFactor)

      const monthlyRevenue = Array.from(data.monthlyRevenue.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reverse()
        .slice(0, 12)
        .map(([period, qty]) => ({
          period,
          revenue: Math.round(qty),
          weeklyAvg: Math.round(qty / 4.33),
        }))

      allSkusRunRates.push({
        partNumber: sku,
        catalogType: data.catalogType,
        avgMonthlyRevenue: Math.round(avgMonthlyRevenue),
        orderBook: Math.round(data.orderBook),
        opportunities: Math.round(data.opportunities),
        oppUnfactored: Math.round(data.oppUnfactored),
        projectedDemand3M: Math.round(projectedDemand),
        weeklyBase: Math.round(weeklyBase),
        weeklyWith95Accuracy: Math.round(weeklyWith95Accuracy),
        dailyTarget: Math.round(weeklyWith95Accuracy / 5),
        monthlyRevenue,
      })

      totalAvgMonthlyRevenue += avgMonthlyRevenue
      totalOrderBook += data.orderBook
      totalOpportunities += data.opportunities
    }

    // Ordenar por revenue promedio (top sellers primero)
    allSkusRunRates.sort((a, b) => b.avgMonthlyRevenue - a.avgMonthlyRevenue)

    // ── 3. Calcular share de cada SKU ──────────────────────────────────────
    const skusWithShare = allSkusRunRates.map(sku => ({
      ...sku,
      shareOfTotal: totalAvgMonthlyRevenue > 0
        ? Math.round((sku.avgMonthlyRevenue / totalAvgMonthlyRevenue) * 1000) / 10
        : 0,
    }))

    // ── 4. Top 10 SKUs por venta ───────────────────────────────────────────
    const top10Skus = skusWithShare.slice(0, 10)

    // ── 5. SKU seleccionado (o primero si no hay selección) ───────────────
    const targetSku = selectedSku
      ? skusWithShare.find(s => s.partNumber === selectedSku) || skusWithShare[0]
      : skusWithShare[0]

    if (!targetSku) {
      return NextResponse.json({ error: 'No SKU data available' }, { status: 404 })
    }

    // ── 6. Contexto global ─────────────────────────────────────────────────
    const projectedDemand = (totalAvgMonthlyRevenue * 3) + totalOrderBook + (totalOpportunities * 0.7)
    const runRateBase = projectedDemand / weeksInPeriod
    const runRateWith95Accuracy = runRateBase * (1 + safetyFactor)

    // ── Response ───────────────────────────────────────────────────────────
    return NextResponse.json(
      {
        targetSku: {
          partNumber: targetSku.partNumber,
          catalogType: targetSku.catalogType,
          avgMonthlyRevenue: targetSku.avgMonthlyRevenue,
          orderBook: targetSku.orderBook,
          opportunities: targetSku.opportunities,
          oppUnfactored: targetSku.oppUnfactored,
          projectedDemand3M: targetSku.projectedDemand3M,
          shareOfTotal: targetSku.shareOfTotal,
        },
        skuRunRate: {
          weeklyBase: targetSku.weeklyBase,
          weeklyWith95Accuracy: targetSku.weeklyWith95Accuracy,
          dailyTarget: targetSku.dailyTarget,
          safetyFactor: Math.round(safetyFactor * 1000) / 1000,
          cv: cv,
        },
        globalContext: {
          avgMonthlyRevenue: Math.round(totalAvgMonthlyRevenue),
          totalOrderBook: Math.round(totalOrderBook),
          totalOpportunities: Math.round(totalOpportunities),
          projectedDemand3M: Math.round(projectedDemand),
          weeklyRunRate: Math.round(runRateWith95Accuracy),
        },
        skuHistoricalTrend: targetSku.monthlyRevenue,
        top10Skus: top10Skus.map(sku => ({
          partNumber: sku.partNumber,
          catalogType: sku.catalogType,
          avgMonthlyRevenue: sku.avgMonthlyRevenue,
          weeklyWith95Accuracy: sku.weeklyWith95Accuracy,
          shareOfTotal: sku.shareOfTotal,
          orderBook: sku.orderBook,
          opportunities: sku.opportunities,
        })),
        allSkus: skusWithShare.map(sku => ({
          partNumber: sku.partNumber,
          catalogType: sku.catalogType,
          avgMonthlyRevenue: sku.avgMonthlyRevenue,
          shareOfTotal: sku.shareOfTotal,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('[videndum/production-planning] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
