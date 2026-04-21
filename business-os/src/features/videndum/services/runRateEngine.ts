/**
 * Run Rate Engine — calcula matriz de producción semanal a N semanas por SKU.
 *
 * Función PURA (sin I/O). Recibe datos crudos de Supabase, devuelve matriz lista para UI/Excel.
 *
 * Algoritmo por mes, por SKU:
 *   base            = max(forecast_planning, avg_ventas_mismo_mes_ult_12m × (1 + YoY))
 *   demand_month    = (base + order_book + pipeline_ponderado) × momentum_factor
 *   inventory_adj   = si stock cubre > 4 semanas, se descuenta el exceso
 *
 * Prorrateo a semana:
 *   run_rate[w] = Σ demand_month[m] × (días_w_en_m / días_m)
 *
 * Driver = fuente dominante en el cálculo (order book, pipeline, histórico, momentum).
 */

export interface ForecastRow { part_number: string; year: number; month: number; quantity: number }
export interface OrderBookRow { part_number: string; catalog_type: string | null; year: number; month: number; quantity: number }
export interface OrderIntakeRow { part_number: string; year: number; month: number; quantity: number }
export interface OpportunityRow { part_number: string; catalog_type: string | null; year: number; month: number; quantity: number; probability_pct: number | null }
export interface SaleRow { part_number: string; catalog_type: string | null; year: number; month: number; quantity: number }
export interface InventoryRow { part_number: string; year: number; month: number | null; quantity: number; updated_at?: string }

export interface RunRateInput {
  forecasts: ForecastRow[]
  orderBook: OrderBookRow[]
  orderIntake: OrderIntakeRow[]
  opportunities: OpportunityRow[]
  sales: SaleRow[]
  inventory: InventoryRow[]
  startDate: Date
  numWeeks: number
  today: Date
}

export interface MonthBreakdown {
  month_label: string
  year: number
  month: number
  baseline: number
  order_book: number
  pipeline: number
  momentum_factor: number
  inventory_applied: number
  demand: number
}

export interface RunRateRow {
  part_number: string
  catalog_type: string | null
  weeks: number[]
  total: number
  avg_weekly: number
  driver: string
  monthly: MonthBreakdown[]
}

export interface WeekLabel {
  num: number
  start: string      // ISO date
  end: string        // ISO date
  short: string      // "27-Abr"
  months: { year: number; month: number; days: number }[]
}

export interface RunRateMatrix {
  generated_at: string
  start_date: string
  num_weeks: number
  num_months: number
  week_labels: WeekLabel[]
  month_labels: { year: number; month: number; label: string }[]
  rows: RunRateRow[]
  summary: {
    total_skus: number
    total_units: number
    by_driver: Record<string, number>
    monthly_totals: number[]
  }
  assumptions: {
    start_date: string
    num_weeks: number
    active_sku_window_months: number
    momentum_clamp: [number, number]
    yoy_clamp: [number, number]
    inventory_coverage_target_weeks: number
  }
}

const MONTH_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function fmtShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}-${MONTH_ES[date.getMonth()]}`
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** Divide una semana (lunes-domingo, 7 días) por los meses que toca. */
function weekMonthSplit(weekStart: Date): { year: number; month: number; days: number }[] {
  const buckets = new Map<string, { year: number; month: number; days: number }>()
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    const existing = buckets.get(key)
    if (existing) existing.days++
    else buckets.set(key, { year: d.getFullYear(), month: d.getMonth() + 1, days: 1 })
  }
  return [...buckets.values()]
}

/** Lista de meses únicos cubiertos por las N semanas desde startDate. */
function coveredMonths(startDate: Date, numWeeks: number): { year: number; month: number }[] {
  const end = addDays(startDate, numWeeks * 7 - 1)
  const out: { year: number; month: number }[] = []
  let y = startDate.getFullYear(), m = startDate.getMonth() + 1
  while (true) {
    out.push({ year: y, month: m })
    if (y === end.getFullYear() && m === end.getMonth() + 1) break
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

// ── Motor principal ────────────────────────────────────────────────────────────

export function calculateRunRateMatrix(input: RunRateInput): RunRateMatrix {
  const { forecasts, orderBook, orderIntake, opportunities, sales, inventory, startDate, numWeeks, today } = input

  // 1. SKUs activos: ventas > 0 en últimos 12 meses desde `today`
  const activeWindowStart = new Date(today)
  activeWindowStart.setMonth(activeWindowStart.getMonth() - 12)

  const activeSkus = new Set<string>()
  const skuCatalog = new Map<string, string | null>()
  for (const r of sales) {
    const rowDate = new Date(r.year, r.month - 1, 1)
    if (rowDate >= activeWindowStart && (r.quantity ?? 0) > 0) {
      activeSkus.add(r.part_number)
      if (!skuCatalog.has(r.part_number)) skuCatalog.set(r.part_number, r.catalog_type)
    }
  }
  for (const r of orderBook) {
    if (activeSkus.has(r.part_number) && !skuCatalog.get(r.part_number)) {
      skuCatalog.set(r.part_number, r.catalog_type)
    }
  }

  // 2. Construir week_labels y month_labels
  const months = coveredMonths(startDate, numWeeks)
  const monthLabels = months.map(m => ({ year: m.year, month: m.month, label: `${MONTH_ES[m.month - 1]} ${m.year}` }))

  const weekLabels: WeekLabel[] = []
  for (let w = 0; w < numWeeks; w++) {
    const wStart = addDays(startDate, w * 7)
    const wEnd = addDays(wStart, 6)
    weekLabels.push({
      num: w + 1,
      start: toISO(wStart),
      end: toISO(wEnd),
      short: fmtShort(wStart),
      months: weekMonthSplit(wStart),
    })
  }

  // 3. Índices para lookup O(1)
  const forecastIdx = new Map<string, number>() // `${sku}|${y}|${m}` → qty
  for (const r of forecasts) {
    const k = `${r.part_number}|${r.year}|${r.month}`
    forecastIdx.set(k, (forecastIdx.get(k) ?? 0) + Number(r.quantity ?? 0))
  }

  const orderBookIdx = new Map<string, number>()
  for (const r of orderBook) {
    const k = `${r.part_number}|${r.year}|${r.month}`
    orderBookIdx.set(k, (orderBookIdx.get(k) ?? 0) + Number(r.quantity ?? 0))
  }

  const pipelineIdx = new Map<string, number>() // ponderado por probability
  for (const r of opportunities) {
    const k = `${r.part_number}|${r.year}|${r.month}`
    const weight = (r.probability_pct ?? 50) / 100
    pipelineIdx.set(k, (pipelineIdx.get(k) ?? 0) + Number(r.quantity ?? 0) * weight)
  }

  // Ventas por SKU/mes-calendario: para avg y YoY
  const salesByKey = new Map<string, number>() // `${sku}|${y}|${m}` → qty
  for (const r of sales) {
    const k = `${r.part_number}|${r.year}|${r.month}`
    salesByKey.set(k, (salesByKey.get(k) ?? 0) + Number(r.quantity ?? 0))
  }

  // Intake últimos 3m vs anteriores 3m (para momentum por SKU)
  const last3mStart = new Date(today); last3mStart.setMonth(last3mStart.getMonth() - 3)
  const prev3mStart = new Date(today); prev3mStart.setMonth(prev3mStart.getMonth() - 6)
  const intakeLast3 = new Map<string, number>()
  const intakePrev3 = new Map<string, number>()
  for (const r of orderIntake) {
    const d = new Date(r.year, r.month - 1, 1)
    if (d >= last3mStart && d < today) {
      intakeLast3.set(r.part_number, (intakeLast3.get(r.part_number) ?? 0) + Number(r.quantity ?? 0))
    } else if (d >= prev3mStart && d < last3mStart) {
      intakePrev3.set(r.part_number, (intakePrev3.get(r.part_number) ?? 0) + Number(r.quantity ?? 0))
    }
  }

  // Inventario: tomar la última lectura por SKU si es "fresca" (últimos 60 días)
  const freshInventoryCutoff = new Date(today); freshInventoryCutoff.setDate(freshInventoryCutoff.getDate() - 60)
  const invBySku = new Map<string, number>()
  for (const r of inventory) {
    const updated = r.updated_at ? new Date(r.updated_at) : null
    if (updated && updated >= freshInventoryCutoff) {
      invBySku.set(r.part_number, (invBySku.get(r.part_number) ?? 0) + Number(r.quantity ?? 0))
    }
  }

  // 4. Por cada SKU activo, calcular demand mensual y luego prorratear
  const MOMENTUM_CLAMP: [number, number] = [0.7, 1.3]
  const YOY_CLAMP: [number, number] = [-0.25, 0.25]
  const INVENTORY_TARGET_WEEKS = 4
  const WEEKS_PER_MONTH = 4.33

  const rows: RunRateRow[] = []
  const driverTotals: Record<string, number> = {}
  const monthlyTotals = new Array(monthLabels.length).fill(0)

  for (const sku of activeSkus) {
    // Avg ventas últimos 12m (todos los meses)
    let salesLast12 = 0, salesPrev12 = 0
    const last12Start = new Date(today); last12Start.setMonth(last12Start.getMonth() - 12)
    const prev12Start = new Date(today); prev12Start.setMonth(prev12Start.getMonth() - 24)
    for (const [k, qty] of salesByKey) {
      if (!k.startsWith(`${sku}|`)) continue
      const [, yStr, mStr] = k.split('|')
      const d = new Date(Number(yStr), Number(mStr) - 1, 1)
      if (d >= last12Start && d < today) salesLast12 += qty
      else if (d >= prev12Start && d < last12Start) salesPrev12 += qty
    }
    const yoyRaw = salesPrev12 > 0 ? (salesLast12 - salesPrev12) / salesPrev12 : 0
    const yoy = clamp(yoyRaw, YOY_CLAMP[0], YOY_CLAMP[1])

    // Momentum
    const il3 = intakeLast3.get(sku) ?? 0
    const ip3 = intakePrev3.get(sku) ?? 0
    const momentumRaw = ip3 > 0 ? il3 / ip3 : 1
    const momentum = clamp(momentumRaw, MOMENTUM_CLAMP[0], MOMENTUM_CLAMP[1])

    const monthly: MonthBreakdown[] = []
    for (const m of months) {
      // Forecast planning para ese mes
      const fKey = `${sku}|${m.year}|${m.month}`
      const forecastQ = forecastIdx.get(fKey) ?? 0

      // Avg venta mismo mes calendario últimos 12m (mismo mes, año anterior y el previo)
      const sy1 = m.year - 1, sy2 = m.year - 2
      const sm = m.month
      const avgSameMonth = ((salesByKey.get(`${sku}|${sy1}|${sm}`) ?? 0) + (salesByKey.get(`${sku}|${sy2}|${sm}`) ?? 0)) / 2
      const baseline = Math.max(forecastQ, avgSameMonth * (1 + yoy))

      const orderBookQ = orderBookIdx.get(fKey) ?? 0
      const pipelineQ = pipelineIdx.get(fKey) ?? 0

      let demand = (baseline + orderBookQ + pipelineQ) * momentum

      // Inventario: si stock cubre > 4 semanas, reduce
      let invApplied = 0
      const stock = invBySku.get(sku) ?? 0
      if (stock > 0 && demand > 0) {
        const weeklyDemand = demand / WEEKS_PER_MONTH
        const coverage = stock / weeklyDemand
        if (coverage > INVENTORY_TARGET_WEEKS) {
          const overStock = stock - INVENTORY_TARGET_WEEKS * weeklyDemand
          invApplied = Math.min(overStock, demand)
          demand = Math.max(0, demand - invApplied)
        }
      }

      monthly.push({
        month_label: `${MONTH_ES[m.month - 1]} ${m.year}`,
        year: m.year,
        month: m.month,
        baseline: Math.round(baseline),
        order_book: Math.round(orderBookQ),
        pipeline: Math.round(pipelineQ),
        momentum_factor: Math.round(momentum * 1000) / 1000,
        inventory_applied: Math.round(invApplied),
        demand: Math.round(demand),
      })
    }

    // Prorrateo mes → semana
    const weekValues: number[] = []
    for (const wl of weekLabels) {
      let weekQty = 0
      for (const split of wl.months) {
        const mIdx = months.findIndex(m => m.year === split.year && m.month === split.month)
        if (mIdx === -1) continue
        const monthDemand = monthly[mIdx].demand
        const dim = daysInMonth(split.year, split.month)
        weekQty += monthDemand * (split.days / dim)
      }
      weekValues.push(Math.round(weekQty))
    }

    const total = weekValues.reduce((s, v) => s + v, 0)
    // Skip SKUs con 0 actividad esperada en los 3 meses
    if (total <= 0) continue

    const avgWeekly = total / numWeeks

    // Determinar driver dominante (mes medio como referencia)
    const midMonth = monthly[Math.floor(monthly.length / 2)] ?? monthly[0]
    const components = {
      'Order book firme': midMonth.order_book,
      'Pipeline comercial': midMonth.pipeline,
      'Histórico + forecast': midMonth.baseline,
    }
    let driver = Object.entries(components).sort((a, b) => b[1] - a[1])[0][0]
    if (momentum > 1.15) driver = `Momentum al alza (${Math.round((momentum - 1) * 100)}%)`
    else if (momentum < 0.85) driver = `Momentum a la baja (${Math.round((momentum - 1) * 100)}%)`
    if (midMonth.inventory_applied > midMonth.baseline * 0.3) driver = 'Ajuste por inventario alto'

    driverTotals[driver] = (driverTotals[driver] ?? 0) + total

    for (let i = 0; i < monthly.length; i++) {
      monthlyTotals[i] += monthly[i].demand
    }

    rows.push({
      part_number: sku,
      catalog_type: skuCatalog.get(sku) ?? null,
      weeks: weekValues,
      total: Math.round(total),
      avg_weekly: Math.round(avgWeekly),
      driver,
      monthly,
    })
  }

  // Ordenar por total desc
  rows.sort((a, b) => b.total - a.total)

  const totalUnits = rows.reduce((s, r) => s + r.total, 0)

  return {
    generated_at: new Date().toISOString(),
    start_date: toISO(startDate),
    num_weeks: numWeeks,
    num_months: monthLabels.length,
    week_labels: weekLabels,
    month_labels: monthLabels,
    rows,
    summary: {
      total_skus: rows.length,
      total_units: totalUnits,
      by_driver: driverTotals,
      monthly_totals: monthlyTotals.map(n => Math.round(n)),
    },
    assumptions: {
      start_date: toISO(startDate),
      num_weeks: numWeeks,
      active_sku_window_months: 12,
      momentum_clamp: MOMENTUM_CLAMP,
      yoy_clamp: YOY_CLAMP,
      inventory_coverage_target_weeks: INVENTORY_TARGET_WEEKS,
    },
  }
}

/** Helper público: próximo lunes ≥ referenceDate. Si referenceDate ya es lunes, lo devuelve. */
export function nextMonday(referenceDate: Date): Date {
  const d = new Date(referenceDate)
  const dow = d.getDay() // 0=Sun..6=Sat
  const diff = dow === 1 ? 0 : (8 - dow) % 7
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
