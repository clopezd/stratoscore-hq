/**
 * exportExcel — Genera .xlsx con identidad oficial Videndum.
 * Usa xlsx-js-style (si disponible) para cabeceras negras y filas alternas.
 * Client-side only.
 */
'use client'

import type { SummaryKPIs } from '@/features/data-ingestion/services/summary'
import { VIDENDUM_BRAND as B } from '../brand'

function sign(n: number) {
  return (n >= 0 ? '+' : '') + n.toLocaleString('en-US')
}

function today() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ── Style helpers ─────────────────────────────────────────────────────────────

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
}

const THIN_BORDER = {
  top:    { style: 'thin', color: { rgb: 'DCDCDC' } },
  bottom: { style: 'thin', color: { rgb: 'DCDCDC' } },
  left:   { style: 'thin', color: { rgb: 'DCDCDC' } },
  right:  { style: 'thin', color: { rgb: 'DCDCDC' } },
}

/** Celda con valor y estilo */
function c(value: string | number, s?: CellStyle) {
  return { v: value, t: typeof value === 'number' ? 'n' : 's', s }
}

// Estilos predefinidos — paleta Videndum
const S = {
  BRAND_TITLE: {
    font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 13, name: 'Calibri' },
    fill:      { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  } as CellStyle,

  BRAND_META: {
    font:      { sz: 8, color: { rgb: 'A0A0A0' }, name: 'Calibri' },
    fill:      { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  } as CellStyle,

  SECTION: {
    font:      { bold: true, color: { rgb: '1A1A1A' }, sz: 9, name: 'Calibri' },
    fill:      { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      left:   { style: 'medium', color: { rgb: '1A1A1A' } },
      bottom: { style: 'thin',   color: { rgb: 'DCDCDC' } },
    },
  } as CellStyle,

  COL_HEADER: {
    font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 9, name: 'Calibri' },
    fill:      { fgColor: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    THIN_BORDER,
  } as CellStyle,

  BODY: {
    font:      { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    THIN_BORDER,
  } as CellStyle,

  BODY_LEFT: {
    font:      { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    THIN_BORDER,
  } as CellStyle,

  BODY_ALT: {
    font:      { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    fill:      { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    THIN_BORDER,
  } as CellStyle,

  BODY_ALT_LEFT: {
    font:      { sz: 9, name: 'Calibri', color: { rgb: '1A1A1A' } },
    fill:      { fgColor: { rgb: 'F8F8F8' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    THIN_BORDER,
  } as CellStyle,

  NEG: {
    font:   { bold: true, sz: 9, name: 'Calibri', color: { rgb: 'B91C1C' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN_BORDER,
  } as CellStyle,

  POS: {
    font:   { bold: true, sz: 9, name: 'Calibri', color: { rgb: '15803D' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN_BORDER,
  } as CellStyle,

  SPACER: {
    fill: { fgColor: { rgb: 'FFFFFF' } },
  } as CellStyle,
}

// ── Build workbook ────────────────────────────────────────────────────────────

export async function exportVidendumExcel(kpis: SummaryKPIs) {
  let XLSX: typeof import('xlsx')
  try {
    XLSX = await import('xlsx-js-style' as string) as typeof import('xlsx')
  } catch {
    XLSX = await import('xlsx')
  }

  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Executive Summary ───────────────────────────────────────────

  const rows: ReturnType<typeof c>[][] = []

  // ROW 0 — Brand title (fondo negro)
  rows.push([
    c(`${B.company}  —  Forecast vs Revenue Executive Summary`, S.BRAND_TITLE),
    c('', S.BRAND_TITLE), c('', S.BRAND_TITLE),
    c('', S.BRAND_TITLE), c('', S.BRAND_TITLE), c('', S.BRAND_TITLE),
  ])

  // ROW 1 — Metadata (fondo negro, texto gris)
  rows.push([
    c(`Period: ${kpis.period_label}   ·   ${today()}   ·   ${B.website}`, S.BRAND_META),
    c('', S.BRAND_META), c('', S.BRAND_META),
    c('', S.BRAND_META), c('', S.BRAND_META), c('', S.BRAND_META),
  ])

  // ROW 2 — Separador blanco
  rows.push([c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER)])

  // ROW 3 — Sección KPIs
  rows.push([
    c('KEY PERFORMANCE INDICATORS', S.SECTION),
    c('', S.SECTION), c('', S.SECTION), c('', S.SECTION), c('', S.SECTION), c('', S.SECTION),
  ])

  // ROW 4 — Cabeceras KPI (negro)
  rows.push([
    c('FORECAST TOTAL', S.COL_HEADER),
    c('REVENUE ACTUAL', S.COL_HEADER),
    c('VARIANCE (u)',   S.COL_HEADER),
    c('VARIANCE (%)',   S.COL_HEADER),
    c('BELOW PLAN',    S.COL_HEADER),
    c('ABOVE PLAN',    S.COL_HEADER),
  ])

  // ROW 5 — Valores KPI
  const varNeg = kpis.total_variance_pct < 0
  rows.push([
    c(kpis.total_forecast,                     S.BODY),
    c(kpis.total_actual,                       S.BODY),
    c(sign(kpis.total_variance_qty),           varNeg ? S.NEG : S.POS),
    c(`${sign(kpis.total_variance_pct)}%`,     varNeg ? S.NEG : S.POS),
    c(kpis.skus_under_forecast,                S.NEG),
    c(kpis.skus_over_forecast,                 S.POS),
  ])

  // ROW 6 — Separador
  rows.push([c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER), c('', S.SPACER)])

  // ROW 7 — Sección SKU
  rows.push([
    c('SKU VARIANCE ANALYSIS — TOP MOVERS', S.SECTION),
    c('', S.SECTION), c('', S.SECTION), c('', S.SECTION), c('', S.SECTION), c('', S.SECTION),
  ])

  // ROW 8 — Cabeceras tabla (negro)
  rows.push([
    c('Part Number', S.COL_HEADER),
    c('Status',      S.COL_HEADER),
    c('Forecast',    S.COL_HEADER),
    c('Actual',      S.COL_HEADER),
    c('Var (u)',     S.COL_HEADER),
    c('Var (%)',     S.COL_HEADER),
  ])

  // ROW 9+ — SKUs
  const skuRows = [
    ...kpis.worst_3.map(s => ({ ...s, label: 'Below Plan', neg: true  })),
    ...kpis.best_3 .map(s => ({ ...s, label: 'Above Plan', neg: false })),
  ]

  skuRows.forEach((s, i) => {
    const alt = i % 2 === 1
    const bl  = alt ? S.BODY_ALT_LEFT : S.BODY_LEFT
    const bc  = alt ? S.BODY_ALT      : S.BODY
    const vs  = s.variance_pct < 0     ? S.NEG : S.POS
    const st: CellStyle = {
      ...bc,
      font: { ...bc.font, bold: true,
        color: { rgb: s.neg ? 'B91C1C' : '15803D' } },
    }

    rows.push([
      c(s.part_number,                bl),
      c(s.label,                      st),
      c(s.forecast_qty,               bc),
      c(s.actual_qty,                 bc),
      c(sign(s.variance_qty),         vs),
      c(`${sign(s.variance_pct)}%`,   vs),
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Merge title + meta rows
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },
  ]

  ws['!cols'] = [
    { wch: 26 }, // Part Number
    { wch: 14 }, // Status
    { wch: 16 }, // Forecast
    { wch: 16 }, // Actual
    { wch: 14 }, // Var u
    { wch: 12 }, // Var %
  ]

  ws['!rows'] = [
    { hpt: 28 }, // title
    { hpt: 16 }, // meta
    { hpt: 8  }, // spacer
    { hpt: 20 }, // section KPI
    { hpt: 20 }, // headers KPI
    { hpt: 22 }, // values KPI
    { hpt: 8  }, // spacer
    { hpt: 20 }, // section SKU
    { hpt: 20 }, // headers tabla
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Executive Summary')

  // ── Sheet 2: Raw Data ────────────────────────────────────────────────────

  const rawHeaders = ['Part Number', 'Forecast', 'Actual', 'Var (u)', 'Var (%)', 'Months Matched']
  const allSkus = [...kpis.worst_3, ...kpis.best_3]
    .filter((s, i, a) => a.findIndex(x => x.part_number === s.part_number) === i)

  const wsRaw = XLSX.utils.aoa_to_sheet([
    rawHeaders,
    ...allSkus.map(s => [
      s.part_number, s.forecast_qty, s.actual_qty,
      s.variance_qty, s.variance_pct, s.matched_months,
    ]),
  ])
  wsRaw['!cols'] = rawHeaders.map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Data')

  XLSX.writeFile(wb, `Videndum_ForecastVariance_${today().replace(/ /g, '_')}.xlsx`)
}
