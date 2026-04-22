/**
 * Smoke test numérico del motor de run rate.
 * No requiere Supabase — usa datos sintéticos.
 * Correr con: npx tsx scripts/test-runrate.ts
 */
import {
  calculateRunRateMatrix,
  nextMonday,
  type ForecastRow,
  type OrderBookRow,
  type OrderIntakeRow,
  type OpportunityRow,
  type SaleRow,
  type InventoryRow,
} from '../src/features/videndum/services/runRateEngine'

const today = new Date('2026-04-21')
const startDate = nextMonday(new Date('2026-04-27')) // lunes 27-Abr-2026

// ── Datos sintéticos ────────────────────────────────────────────────────────
// SKU-A: producto estable con ventas consistentes, order book firme
// SKU-B: producto con pipeline alto y momentum al alza
// SKU-C: producto dormido (sin actividad reciente) — debería filtrarse

const sales: SaleRow[] = []
// SKU-A: 1000 uds/mes estables últimos 12 meses
for (let m = 0; m < 12; m++) {
  const d = new Date(today); d.setMonth(d.getMonth() - m)
  sales.push({ part_number: 'SKU-A', catalog_type: 'INV', year: d.getFullYear(), month: d.getMonth() + 1, quantity: 1000 })
}
// SKU-A: 900 uds/mes los 12 meses anteriores (YoY +11%)
for (let m = 12; m < 24; m++) {
  const d = new Date(today); d.setMonth(d.getMonth() - m)
  sales.push({ part_number: 'SKU-A', catalog_type: 'INV', year: d.getFullYear(), month: d.getMonth() + 1, quantity: 900 })
}
// SKU-B: 500 uds/mes últimos 12m
for (let m = 0; m < 12; m++) {
  const d = new Date(today); d.setMonth(d.getMonth() - m)
  sales.push({ part_number: 'SKU-B', catalog_type: 'PKG', year: d.getFullYear(), month: d.getMonth() + 1, quantity: 500 })
}
// SKU-C: vendió hace 18 meses y nada más → no activo
sales.push({ part_number: 'SKU-C', catalog_type: 'INV', year: 2024, month: 10, quantity: 300 })

const forecasts: ForecastRow[] = [
  // SKU-A: forecast igual a histórico
  { part_number: 'SKU-A', year: 2026, month: 5, quantity: 1000 },
  { part_number: 'SKU-A', year: 2026, month: 6, quantity: 1000 },
  { part_number: 'SKU-A', year: 2026, month: 7, quantity: 1000 },
  // SKU-B: forecast bajo (500)
  { part_number: 'SKU-B', year: 2026, month: 5, quantity: 500 },
  { part_number: 'SKU-B', year: 2026, month: 6, quantity: 500 },
  { part_number: 'SKU-B', year: 2026, month: 7, quantity: 500 },
]

const orderBook: OrderBookRow[] = [
  // SKU-A: backlog fuerte en mayo
  { part_number: 'SKU-A', catalog_type: 'INV', year: 2026, month: 5, quantity: 800 },
]

const orderIntake: OrderIntakeRow[] = [
  // SKU-B: intake últimos 3 meses al doble de los 3 anteriores (momentum +100% → clamp a 1.3)
  { part_number: 'SKU-B', year: 2026, month: 2, quantity: 200 },
  { part_number: 'SKU-B', year: 2026, month: 3, quantity: 200 },
  { part_number: 'SKU-B', year: 2026, month: 4, quantity: 200 },
  { part_number: 'SKU-B', year: 2025, month: 11, quantity: 100 },
  { part_number: 'SKU-B', year: 2025, month: 12, quantity: 100 },
  { part_number: 'SKU-B', year: 2026, month: 1, quantity: 100 },
]

const opportunities: OpportunityRow[] = [
  // SKU-B: pipeline de 2000 al 50% → 1000 ponderados en junio
  { part_number: 'SKU-B', catalog_type: 'PKG', year: 2026, month: 6, quantity: 2000, probability_pct: 50 },
]

const inventory: InventoryRow[] = []

// ── Ejecutar ────────────────────────────────────────────────────────────────
const matrix = calculateRunRateMatrix({
  forecasts, orderBook, orderIntake, opportunities, sales, inventory,
  startDate, numWeeks: 13, today,
})

// ── Reporte ─────────────────────────────────────────────────────────────────
console.log('='.repeat(72))
console.log(`Run Rate Matrix — Test Sintético`)
console.log(`Arranque: ${matrix.start_date} · ${matrix.num_weeks} semanas · ${matrix.num_months} meses`)
console.log(`SKUs activos: ${matrix.summary.total_skus} · Total unidades: ${matrix.summary.total_units.toLocaleString()}`)
console.log('='.repeat(72))

console.log('\nSemanas generadas:')
matrix.week_labels.forEach(w => {
  const splits = w.months.map(m => `${m.month}/${m.year}:${m.days}d`).join(', ')
  console.log(`  S${w.num.toString().padStart(2)} ${w.short.padEnd(8)} (${w.start} → ${w.end})  split: [${splits}]`)
})

console.log('\nTotales por mes:', matrix.month_labels.map((ml, i) => `${ml.label}=${matrix.summary.monthly_totals[i]}`).join(', '))

console.log('\nSKUs incluidos:')
matrix.rows.forEach(r => {
  console.log(`\n  ${r.part_number} (${r.catalog_type})  Total ${r.total.toLocaleString()}  Prom/sem ${r.avg_weekly}  Driver: ${r.driver}`)
  r.monthly.forEach(m => {
    console.log(`    ${m.month_label}: baseline=${m.baseline} order_book=${m.order_book} pipeline=${m.pipeline} momentum=${m.momentum_factor} inv=${m.inventory_applied} → demand=${m.demand}`)
  })
  console.log(`    Semanas: ${r.weeks.join(', ')}`)
})

console.log('\n' + '='.repeat(72))
console.log('VALIDACIONES:')
console.log('='.repeat(72))

let pass = 0, fail = 0
function check(name: string, cond: boolean, details?: string) {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name}${details ? ' — ' + details : ''}`) }
}

// 1. SKU-C debe filtrarse (sin ventas en últimos 12m)
check('SKU-C (dormido) se excluye', !matrix.rows.find(r => r.part_number === 'SKU-C'))

// Índice de meses: monthly[0]=Abr, [1]=May, [2]=Jun, [3]=Jul

// 2. SKU-A: mayo debe incluir order book + baseline histórico
const skuA = matrix.rows.find(r => r.part_number === 'SKU-A')
check('SKU-A está en la matriz', !!skuA)
check('SKU-A tiene 13 semanas', skuA?.weeks.length === 13, `got ${skuA?.weeks.length}`)
check('SKU-A demand mayo > 1500 (order book 800 + base ~1050)', (skuA?.monthly[1].demand ?? 0) >= 1500, `got ${skuA?.monthly[1].demand}`)

// 3. SKU-B debe tener momentum al alza (clamp 1.3)
const skuB = matrix.rows.find(r => r.part_number === 'SKU-B')
check('SKU-B está en la matriz', !!skuB)
check('SKU-B momentum clamped a 1.3', skuB?.monthly[1].momentum_factor === 1.3, `got ${skuB?.monthly[1].momentum_factor}`)
check('SKU-B pipeline en junio = 1000 (ponderado 50%)', (skuB?.monthly[2].pipeline ?? 0) === 1000, `got ${skuB?.monthly[2].pipeline}`)
check('SKU-B driver refleja momentum', skuB?.driver.startsWith('Momentum'), `got ${skuB?.driver}`)

// 4. Prorrateo semanal: la primera semana (lun 27-Abr) debe tocar abril y mayo
const wk1 = matrix.week_labels[0]
check('Semana 1 inicia en lunes', new Date(wk1.start).getDay() === 1)
check('Semana 1 toca abril y mayo', wk1.months.length === 2 && wk1.months.some(m => m.month === 4) && wk1.months.some(m => m.month === 5))

// 5. Suma de semanas ≈ total (± redondeo)
if (skuA) {
  const sumWeeks = skuA.weeks.reduce((s, v) => s + v, 0)
  check(`SKU-A Σsemanas (${sumWeeks}) = total (${skuA.total}) ± 50 redondeo`, Math.abs(sumWeeks - skuA.total) <= 50)
}

// 6. Inventario no aplica (lista vacía)
check('Inventory_applied = 0 para todos', matrix.rows.every(r => r.monthly.every(m => m.inventory_applied === 0)))

console.log('\n' + '='.repeat(72))
console.log(`Resultado: ${pass} pass · ${fail} fail`)
console.log('='.repeat(72))

process.exit(fail > 0 ? 1 : 0)
