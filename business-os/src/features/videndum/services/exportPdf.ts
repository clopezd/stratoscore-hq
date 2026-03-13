/**
 * exportPdf — Genera PDF con identidad oficial Videndum.
 * Header blanco con logo + franja negra inferior + reportID.
 * Client-side only.
 */
'use client'

import type { SummaryKPIs } from '@/features/data-ingestion/services/summary'
import { VIDENDUM_BRAND as B } from '../brand'

// ── Utils ─────────────────────────────────────────────────────────────────────

function sign(n: number) {
  return (n >= 0 ? '+' : '') + n.toLocaleString('en-US')
}

function today() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function reportId() {
  return `RPT-VID-${Date.now().toString(36).toUpperCase()}`
}

/** Carga el logo desde /assets y lo convierte a base64 data-URL */
async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch(B.assets.logo)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror  = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// ── Header institucional ──────────────────────────────────────────────────────

/**
 * Diseño:
 * ┌─────────────────────────────────────────┐
 * │  [LOGO]                    RPT · fecha  │  ← fondo blanco, 26mm
 * ├─── franja negra 1.5mm ─────────────────┤
 * │  Título del reporte                     │  ← texto negro sobre blanco
 * └─────────────────────────────────────────┘
 */
function drawHeader(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  reportTitle: string,
  id: string,
  logoData: string | null,
) {
  const W = doc.internal.pageSize.getWidth()
  const HEADER_H = 26

  // Fondo blanco del header
  doc.setFillColor(...B.colors.white)
  doc.rect(0, 0, W, HEADER_H, 'F')

  // Logo — esquina superior izquierda
  if (logoData) {
    doc.addImage(logoData, 'PNG', 10, 3, B.assets.logoW, B.assets.logoH)
  } else {
    // Fallback tipográfico si el logo no carga
    doc.setFont(B.font.heading, 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...B.colors.black)
    doc.text('Videndum', 10, 17)
  }

  // Report ID + fecha — esquina superior derecha
  doc.setFont(B.font.body, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...B.colors.midGray)
  doc.text(id, W - 12, 11, { align: 'right' })
  doc.text(today(), W - 12, 16, { align: 'right' })
  doc.text(B.website, W - 12, 21, { align: 'right' })

  // Franja negra separadora
  doc.setFillColor(...B.colors.black)
  doc.rect(0, HEADER_H, W, 1.5, 'F')

  // Título del reporte
  doc.setFont(B.font.heading, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...B.colors.black)
  doc.text(reportTitle, 12, HEADER_H + 10)

  // Línea gris suave bajo el título
  doc.setDrawColor(...B.colors.lightGray)
  doc.setLineWidth(0.3)
  doc.line(12, HEADER_H + 14, W - 12, HEADER_H + 14)

  return HEADER_H + 20 // cursor Y
}

// ── Footer ────────────────────────────────────────────────────────────────────

function drawFooter(doc: InstanceType<typeof import('jspdf').jsPDF>) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const current = doc.getCurrentPageInfo().pageNumber
  const total   = doc.getNumberOfPages()

  doc.setDrawColor(...B.colors.lightGray)
  doc.setLineWidth(0.3)
  doc.line(12, H - 10, W - 12, H - 10)

  doc.setFont(B.font.body, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...B.colors.midGray)
  doc.text('Confidential — For Internal Use Only', 12, H - 5)
  doc.text(`${B.company}  ·  Page ${current} of ${total}`, W - 12, H - 5, { align: 'right' })
}

// ── Título de sección ─────────────────────────────────────────────────────────

function sectionTitle(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  title: string,
  y: number,
) {
  const W = doc.internal.pageSize.getWidth()

  doc.setFillColor(...B.colors.offWhite)
  doc.rect(12, y - 4.5, W - 24, 8, 'F')

  // Barra negra izquierda
  doc.setFillColor(...B.colors.black)
  doc.rect(12, y - 4.5, 2, 8, 'F')

  doc.setFont(B.font.heading, 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...B.colors.black)
  doc.text(title.toUpperCase(), 17, y + 1)

  return y + 10
}

// ── KPI cards ─────────────────────────────────────────────────────────────────

function drawKpiBar(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  kpis: SummaryKPIs,
  y: number,
) {
  const W   = doc.internal.pageSize.getWidth()
  const boxW = (W - 24 - 9) / 4

  const cards = [
    { label: 'FORECAST TOTAL', value: kpis.total_forecast.toLocaleString(), sub: 'units' },
    { label: 'REVENUE ACTUAL', value: kpis.total_actual.toLocaleString(),   sub: 'units' },
    {
      label:    'GLOBAL VARIANCE',
      value:    `${sign(kpis.total_variance_pct)}%`,
      sub:      `${sign(kpis.total_variance_qty)} u`,
      negative: kpis.total_variance_pct < 0,
    },
    {
      label: 'PERIOD',
      value: kpis.period_label,
      sub:   `${kpis.skus_under_forecast} below · ${kpis.skus_over_forecast} above`,
    },
  ]

  cards.forEach((c, i) => {
    const x = 12 + i * (boxW + 3)

    // Borde exterior gris suave
    doc.setDrawColor(...B.colors.midGray)
    doc.setLineWidth(0.25)
    doc.rect(x, y, boxW, 20)

    // Barra superior negra (o roja si negativo)
    const accentColor = c.negative ? B.colors.danger : B.colors.black
    doc.setFillColor(...accentColor)
    doc.rect(x, y, boxW, 1.5, 'F')

    // Label
    doc.setFont(B.font.body, 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...B.colors.midGray)
    doc.text(c.label, x + 4, y + 7)

    // Value
    doc.setFont(B.font.heading, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...(c.negative ? B.colors.danger : B.colors.black))
    doc.text(c.value, x + 4, y + 14)

    // Sub
    doc.setFont(B.font.body, 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...B.colors.midGray)
    doc.text(c.sub, x + 4, y + 18.5)
  })

  return y + 26
}

// ── Tabla SKU ─────────────────────────────────────────────────────────────────

async function drawSkuTable(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  kpis: SummaryKPIs,
  y: number,
) {
  const { default: autoTable } = await import('jspdf-autotable')

  const rows = [
    ...kpis.worst_3.map(s => [
      s.part_number,
      'Below Plan',
      s.forecast_qty.toLocaleString(),
      s.actual_qty.toLocaleString(),
      `${sign(s.variance_qty)} u`,
      `${sign(s.variance_pct)}%`,
    ]),
    ...kpis.best_3.map(s => [
      s.part_number,
      'Above Plan',
      s.forecast_qty.toLocaleString(),
      s.actual_qty.toLocaleString(),
      `${sign(s.variance_qty)} u`,
      `${sign(s.variance_pct)}%`,
    ]),
  ]

  autoTable(doc, {
    startY: y,
    head: [['Part Number', 'Status', 'Forecast', 'Actual', 'Var (u)', 'Var (%)']],
    body: rows,
    margin: { left: 12, right: 12 },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: B.colors.lightGray,
      lineWidth: 0.25,
      textColor: B.colors.black,
    },
    headStyles: {
      fillColor: B.colors.black,
      textColor: B.colors.white,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: B.colors.offWhite,
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw)
        if (val.startsWith('-'))      data.cell.styles.textColor = B.colors.danger
        else if (val.startsWith('+')) data.cell.styles.textColor = B.colors.success
        data.cell.styles.fontStyle = 'bold'
      }
      if (data.section === 'body' && data.column.index === 1) {
        const val = String(data.cell.raw)
        data.cell.styles.textColor = val === 'Below Plan' ? B.colors.danger : B.colors.success
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function exportVidendumPDF(kpis: SummaryKPIs, summaryText?: string) {
  const { jsPDF } = await import('jspdf')

  const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const id       = reportId()
  const logoData = await loadLogoBase64()

  let y = drawHeader(doc, 'Executive Summary — Forecast vs Revenue', id, logoData)

  y = sectionTitle(doc, '01 · Key Performance Indicators', y)
  y = drawKpiBar(doc, kpis, y)

  y = sectionTitle(doc, '02 · SKU Variance Analysis', y)
  y = await drawSkuTable(doc, kpis, y)

  if (summaryText) {
    y = sectionTitle(doc, '03 · Operations Director Analysis', y)

    const clean = summaryText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,3} /g, '')
      .replace(/- /g, '• ')

    const W = doc.internal.pageSize.getWidth()
    doc.setFont(B.font.body, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...B.colors.darkGray)
    const lines = doc.splitTextToSize(clean, W - 24)
    doc.text(lines, 12, y)
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawFooter(doc)
  }

  doc.save(`Videndum_ExecutiveSummary_${today().replace(/ /g, '_')}.pdf`)
}
