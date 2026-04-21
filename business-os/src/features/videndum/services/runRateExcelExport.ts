/**
 * Exporta una RunRateMatrix a un .xlsx server-side (Buffer).
 * Estructura:
 *   Hoja 1 — Run Rate Matrix: SKU × 13 semanas + totales
 *   Hoja 2 — Assumptions:     resumen por mes, drivers, parámetros
 *   Hoja 3 — Raw Inputs:      baseline, order book, pipeline, etc. por SKU/mes
 */

import type { RunRateMatrix } from './runRateEngine'

type CellStyle = {
  font?: { bold?: boolean; color?: { rgb: string }; sz?: number; name?: string }
  fill?: { fgColor: { rgb: string } }
  border?: {
    top?:    { style: string; color: { rgb: string } }
    bottom?: { style: string; color: { rgb: string } }
    left?:   { style: string; color: { rgb: string } }
    right?:  { style: string; color: { rgb: string } }
  }
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean }
  numFmt?: string
}

const THIN: CellStyle['border'] = {
  top:    { style: 'thin', color: { rgb: 'DCDCDC' } },
  bottom: { style: 'thin', color: { rgb: 'DCDCDC' } },
  left:   { style: 'thin', color: { rgb: 'DCDCDC' } },
  right:  { style: 'thin', color: { rgb: 'DCDCDC' } },
}

const S = {
  BRAND_TITLE: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13, name: 'Calibri' },
    fill: { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  } as CellStyle,
  BRAND_META: {
    font: { sz: 8, color: { rgb: 'A0A0A0' }, name: 'Calibri' },
    fill: { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  } as CellStyle,
  SECTION: {
    font: { bold: true, color: { rgb: '1A1A1A' }, sz: 9, name: 'Calibri' },
    fill: { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: { left: { style: 'medium', color: { rgb: '1A1A1A' } }, bottom: { style: 'thin', color: { rgb: 'DCDCDC' } } },
  } as CellStyle,
  COL_HEADER: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 9, name: 'Calibri' },
    fill: { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN,
  } as CellStyle,
  COL_HEADER_LEFT: {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 9, name: 'Calibri' },
    fill: { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN,
  } as CellStyle,
  MONTH_HEADER: {
    font: { bold: true, color: { rgb: '1A1A1A' }, sz: 9, name: 'Calibri' },
    fill: { fgColor: { rgb: 'DCDCDC' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN,
  } as CellStyle,
  BODY: {
    font: { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: THIN,
    numFmt: '#,##0',
  } as CellStyle,
  BODY_LEFT: {
    font: { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN,
  } as CellStyle,
  BODY_ALT: {
    font: { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    fill: { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: THIN,
    numFmt: '#,##0',
  } as CellStyle,
  BODY_ALT_LEFT: {
    font: { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    fill: { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN,
  } as CellStyle,
  TOTAL: {
    font: { bold: true, sz: 9, name: 'Calibri', color: { rgb: '15803D' } },
    fill: { fgColor: { rgb: 'F0FDF4' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: THIN,
    numFmt: '#,##0',
  } as CellStyle,
  SPACER: { fill: { fgColor: { rgb: 'FFFFFF' } } } as CellStyle,
}

function cell(value: string | number, style?: CellStyle) {
  return { v: value, t: typeof value === 'number' ? 'n' : 's', s: style }
}

function emptyRow(width: number): Array<ReturnType<typeof cell>> {
  return Array.from({ length: width }, () => cell('', S.SPACER))
}

function todayLabel(): string {
  return new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Genera el Excel como Buffer (Node.js). Server-side only.
 */
export async function buildRunRateExcelBuffer(matrix: RunRateMatrix): Promise<Buffer> {
  // Intentar xlsx-js-style primero para preservar estilos
  let XLSX: typeof import('xlsx')
  try {
    const styledPkg = 'xlsx-js-style'
    XLSX = (await import(styledPkg)) as typeof import('xlsx')
  } catch {
    XLSX = await import('xlsx')
  }

  const wb = XLSX.utils.book_new()

  // ───────────────────────────────────────────────────────────────────────────
  // HOJA 1 — Run Rate Matrix
  // ───────────────────────────────────────────────────────────────────────────

  const numWeeks = matrix.num_weeks
  const totalCols = 2 + numWeeks + 3 // SKU + Catálogo + W1..Wn + Total + Prom/sem + Driver

  const rows1: Array<Array<ReturnType<typeof cell>>> = []

  // Título banner
  rows1.push([
    cell(`VIDENDUM  —  Plan de Producción Semanal (${numWeeks} semanas)`, S.BRAND_TITLE),
    ...Array.from({ length: totalCols - 1 }, () => cell('', S.BRAND_TITLE)),
  ])
  rows1.push([
    cell(`Arranque: ${matrix.start_date}   ·   Generado: ${todayLabel()}   ·   SKUs activos: ${matrix.summary.total_skus}   ·   Total unidades: ${matrix.summary.total_units.toLocaleString('en-US')}`, S.BRAND_META),
    ...Array.from({ length: totalCols - 1 }, () => cell('', S.BRAND_META)),
  ])
  rows1.push(emptyRow(totalCols))

  // Fila de meses (agrupación visual)
  const monthHeaderRow: Array<ReturnType<typeof cell>> = [cell('', S.MONTH_HEADER), cell('', S.MONTH_HEADER)]
  for (const wl of matrix.week_labels) {
    const monthLabel = wl.months.map(m => `${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m.month - 1]}`).join('/')
    monthHeaderRow.push(cell(monthLabel, S.MONTH_HEADER))
  }
  monthHeaderRow.push(cell('', S.MONTH_HEADER), cell('', S.MONTH_HEADER), cell('', S.MONTH_HEADER))
  rows1.push(monthHeaderRow)

  // Fila de headers principales
  const headerRow: Array<ReturnType<typeof cell>> = [
    cell('Part Number', S.COL_HEADER_LEFT),
    cell('Catálogo', S.COL_HEADER),
  ]
  for (const wl of matrix.week_labels) {
    headerRow.push(cell(`S${wl.num}\n${wl.short}`, S.COL_HEADER))
  }
  headerRow.push(cell(`Total ${matrix.num_months}M`, S.COL_HEADER), cell('Prom/sem', S.COL_HEADER), cell('Driver', S.COL_HEADER_LEFT))
  rows1.push(headerRow)

  // Filas de datos
  matrix.rows.forEach((r, i) => {
    const alt = i % 2 === 1
    const leftStyle = alt ? S.BODY_ALT_LEFT : S.BODY_LEFT
    const bodyStyle = alt ? S.BODY_ALT : S.BODY

    const row: Array<ReturnType<typeof cell>> = [
      cell(r.part_number, leftStyle),
      cell(r.catalog_type ?? '—', alt ? { ...S.BODY_ALT, alignment: { horizontal: 'center', vertical: 'center' } } : { ...S.BODY, alignment: { horizontal: 'center', vertical: 'center' } }),
    ]
    for (const w of r.weeks) {
      row.push(cell(w, bodyStyle))
    }
    row.push(cell(r.total, S.TOTAL), cell(r.avg_weekly, bodyStyle), cell(r.driver, leftStyle))
    rows1.push(row)
  })

  // Fila de totales abajo
  const totalsRow: Array<ReturnType<typeof cell>> = [
    cell('TOTAL', S.COL_HEADER_LEFT),
    cell('', S.COL_HEADER),
  ]
  for (let w = 0; w < numWeeks; w++) {
    const sum = matrix.rows.reduce((s, r) => s + (r.weeks[w] ?? 0), 0)
    totalsRow.push(cell(sum, S.TOTAL))
  }
  totalsRow.push(
    cell(matrix.summary.total_units, S.TOTAL),
    cell(Math.round(matrix.summary.total_units / numWeeks), S.TOTAL),
    cell('', S.COL_HEADER_LEFT),
  )
  rows1.push(totalsRow)

  const ws1 = XLSX.utils.aoa_to_sheet(rows1)
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
  ]
  ws1['!cols'] = [
    { wch: 22 }, // Part Number
    { wch: 10 }, // Catálogo
    ...Array.from({ length: numWeeks }, () => ({ wch: 11 })),
    { wch: 14 }, // Total
    { wch: 11 }, // Prom/sem
    { wch: 30 }, // Driver
  ]
  ws1['!rows'] = [
    { hpt: 28 },
    { hpt: 16 },
    { hpt: 8 },
    { hpt: 18 }, // month header
    { hpt: 32 }, // headers (2 líneas)
  ]
  ws1['!freeze'] = { xSplit: 2, ySplit: 5 } as unknown as undefined

  XLSX.utils.book_append_sheet(wb, ws1, 'Run Rate Matrix')

  // ───────────────────────────────────────────────────────────────────────────
  // HOJA 2 — Assumptions
  // ───────────────────────────────────────────────────────────────────────────

  const rows2: Array<Array<ReturnType<typeof cell>>> = []
  rows2.push([cell('ASSUMPTIONS & PARÁMETROS DEL CÁLCULO', S.BRAND_TITLE), cell('', S.BRAND_TITLE)])
  rows2.push([cell(`Generado: ${todayLabel()}`, S.BRAND_META), cell('', S.BRAND_META)])
  rows2.push(emptyRow(2))

  rows2.push([cell('PARÁMETROS', S.SECTION), cell('', S.SECTION)])
  rows2.push([cell('Parámetro', S.COL_HEADER_LEFT), cell('Valor', S.COL_HEADER)])
  const a = matrix.assumptions
  rows2.push([cell('Fecha de arranque (primer lunes)', S.BODY_LEFT), cell(a.start_date, { ...S.BODY, alignment: { horizontal: 'left' } })])
  rows2.push([cell('Número de semanas', S.BODY_ALT_LEFT), cell(a.num_weeks, S.BODY_ALT)])
  rows2.push([cell('Ventana SKUs activos', S.BODY_LEFT), cell(`${a.active_sku_window_months} meses`, { ...S.BODY, alignment: { horizontal: 'left' } })])
  rows2.push([cell('Momentum clamp (intake últimos 3m / anteriores 3m)', S.BODY_ALT_LEFT), cell(`${a.momentum_clamp[0]} ÷ ${a.momentum_clamp[1]}`, { ...S.BODY_ALT, alignment: { horizontal: 'left' } })])
  rows2.push([cell('YoY clamp', S.BODY_LEFT), cell(`${Math.round(a.yoy_clamp[0] * 100)}% ÷ ${Math.round(a.yoy_clamp[1] * 100)}%`, { ...S.BODY, alignment: { horizontal: 'left' } })])
  rows2.push([cell('Cobertura inventario objetivo', S.BODY_ALT_LEFT), cell(`${a.inventory_coverage_target_weeks} semanas`, { ...S.BODY_ALT, alignment: { horizontal: 'left' } })])
  rows2.push(emptyRow(2))

  rows2.push([cell('TOTALES POR MES', S.SECTION), cell('', S.SECTION)])
  rows2.push([cell('Mes', S.COL_HEADER_LEFT), cell('Unidades', S.COL_HEADER)])
  matrix.month_labels.forEach((ml, i) => {
    const style = i % 2 === 0 ? [S.BODY_LEFT, S.BODY] : [S.BODY_ALT_LEFT, S.BODY_ALT]
    rows2.push([cell(ml.label, style[0]), cell(matrix.summary.monthly_totals[i] ?? 0, style[1])])
  })
  rows2.push(emptyRow(2))

  rows2.push([cell('DISTRIBUCIÓN POR DRIVER', S.SECTION), cell('', S.SECTION)])
  rows2.push([cell('Driver', S.COL_HEADER_LEFT), cell('Unidades', S.COL_HEADER)])
  Object.entries(matrix.summary.by_driver).sort((x, y) => y[1] - x[1]).forEach(([drv, qty], i) => {
    const style = i % 2 === 0 ? [S.BODY_LEFT, S.BODY] : [S.BODY_ALT_LEFT, S.BODY_ALT]
    rows2.push([cell(drv, style[0]), cell(qty, style[1])])
  })
  rows2.push(emptyRow(2))

  rows2.push([cell('FÓRMULA DE CÁLCULO', S.SECTION), cell('', S.SECTION)])
  const formulas = [
    'base = max(forecast_planning, avg_ventas_mismo_mes_ult_24m × (1 + YoY_clamped))',
    'demand_month = (base + order_book + opportunities × probability_pct) × momentum_factor',
    'momentum_factor = clamp(intake_last_3m / intake_prev_3m, 0.7, 1.3)',
    'inventory_adj = si stock > 4 sem de cobertura, descuenta exceso',
    'run_rate[semana] = Σ demand_month[m] × (días_de_esa_semana_en_m / días_mes_m)',
  ]
  formulas.forEach((f, i) => {
    const style = i % 2 === 0 ? S.BODY_LEFT : S.BODY_ALT_LEFT
    rows2.push([cell(f, style), cell('', style)])
  })

  const ws2 = XLSX.utils.aoa_to_sheet(rows2)
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ]
  ws2['!cols'] = [{ wch: 52 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Assumptions')

  // ───────────────────────────────────────────────────────────────────────────
  // HOJA 3 — Raw Inputs (breakdown mes×SKU)
  // ───────────────────────────────────────────────────────────────────────────

  const rows3: Array<Array<ReturnType<typeof cell>>> = []
  rows3.push([
    cell('SKU', S.COL_HEADER_LEFT),
    cell('Catálogo', S.COL_HEADER),
    cell('Mes', S.COL_HEADER),
    cell('Baseline (forecast vs hist)', S.COL_HEADER),
    cell('Order Book', S.COL_HEADER),
    cell('Pipeline ponderado', S.COL_HEADER),
    cell('Momentum factor', S.COL_HEADER),
    cell('Inventory aplicado', S.COL_HEADER),
    cell('Demand mes', S.COL_HEADER),
  ])

  matrix.rows.forEach((r, i) => {
    r.monthly.forEach((m, j) => {
      const rowIdx = i * r.monthly.length + j
      const alt = rowIdx % 2 === 1
      const leftStyle = alt ? S.BODY_ALT_LEFT : S.BODY_LEFT
      const bodyStyle = alt ? S.BODY_ALT : S.BODY
      rows3.push([
        cell(r.part_number, leftStyle),
        cell(r.catalog_type ?? '—', { ...bodyStyle, alignment: { horizontal: 'center' } }),
        cell(m.month_label, leftStyle),
        cell(m.baseline, bodyStyle),
        cell(m.order_book, bodyStyle),
        cell(m.pipeline, bodyStyle),
        cell(m.momentum_factor, { ...bodyStyle, numFmt: '0.000' }),
        cell(m.inventory_applied, bodyStyle),
        cell(m.demand, { ...bodyStyle, font: { ...bodyStyle.font, bold: true } }),
      ])
    })
  })

  const ws3 = XLSX.utils.aoa_to_sheet(rows3)
  ws3['!cols'] = [
    { wch: 22 }, { wch: 10 }, { wch: 12 },
    { wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
  ]
  XLSX.utils.book_append_sheet(wb, ws3, 'Raw Inputs')

  // ── Serializar a Buffer ───────────────────────────────────────────────────
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return buf
}

export function runRateExcelFilename(matrix: RunRateMatrix): string {
  return `Videndum_RunRate_${matrix.start_date}_${matrix.num_weeks}sem.xlsx`
}
