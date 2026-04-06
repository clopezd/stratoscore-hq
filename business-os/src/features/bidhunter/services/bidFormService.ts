/**
 * BidHunter — Bid Form Generator
 *
 * Takes opportunity data + extracted PDF data and fills the Tico Restorations
 * bid form Excel template. Output: downloadable .xlsx ready to attach in BC.
 *
 * Pricing (from Tico's "Steps to bid"):
 *   - Exterior painting: $2.10/sqft (includes materials)
 *   - Interior painting: $2.35/sqft (includes materials)
 *   - Stucco repairs: $15.00/sqft
 *   - Tax rate: 7%
 *   - Buildings >4 floors: flag for extra equipment
 */

import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import type { Opportunity, AggregatedExtraction, BidEstimate } from '../types'

// Tico pricing constants
const RATE_EXTERIOR = 2.10
const RATE_INTERIOR = 2.35
const RATE_STUCCO = 15.00
const TAX_RATE = 0.07
const HIGH_RISE_THRESHOLD = 4 // floors

export interface BidFormData {
  projectName: string
  jobLocation: string
  bidNumber: string
  exteriorSqft: number | null
  interiorSqft: number | null
  stuccoSqft: number | null
  buildingFloors: number | null
  scopeDescription: string
  withdrawalDate: Date | null
}

export interface BidFormResult {
  buffer: Buffer
  filename: string
  pricing: {
    exterior: { sqft: number; rate: number; subtotal: number } | null
    interior: { sqft: number; rate: number; subtotal: number } | null
    stucco: { sqft: number; rate: number; subtotal: number } | null
    subtotal: number
    tax: number
    total: number
    highRise: boolean
    commission5pct: number
  }
}

/**
 * Build bid form data from opportunity + extracted data.
 * Merges multiple data sources with priority:
 *   1. Extracted PDF data (finish schedule) — most accurate
 *   2. AI evaluator bid_estimate — from scoring
 *   3. Geometric estimation from building sqft + height — fallback
 */
export function buildBidFormData(
  opportunity: Opportunity,
  extraction: AggregatedExtraction | null,
  bidEstimate?: BidEstimate | null,
): BidFormData {
  // Sqft: prefer extracted data from PDFs (actual finish schedule)
  let exteriorSqft = extraction?.exterior_painting_sqft ?? null
  let interiorSqft = extraction?.interior_painting_sqft ?? null
  let stuccoSqft = extraction?.stucco_sqft ?? null

  // Fallback 1: AI evaluator bid_estimate (from scoring)
  if (!exteriorSqft && !interiorSqft && !stuccoSqft && bidEstimate) {
    exteriorSqft = bidEstimate.exterior_sqft ?? null
    interiorSqft = bidEstimate.interior_sqft ?? null
    stuccoSqft = bidEstimate.stucco_sqft ?? null
  }

  // Fallback 2: geometric estimation from building sqft + height
  if (!exteriorSqft && !interiorSqft && !stuccoSqft && opportunity.building_sqft) {
    const sqft = opportunity.building_sqft
    const floors = opportunity.building_height_floors || 1
    const sideLength = Math.sqrt(sqft / floors)
    const perimeter = 4 * sideLength
    const height = floors * 12 // 12ft per floor
    exteriorSqft = Math.round(perimeter * height)
    interiorSqft = Math.round(sqft * 3.5) // ~3.5x floor area for walls+ceilings
  }

  // Scope description from extracted data
  const scopeParts: string[] = []
  if (extraction?.scope_summary) {
    scopeParts.push(extraction.scope_summary)
  }
  if (extraction?.trades_in_scope && extraction.trades_in_scope.length > 0) {
    scopeParts.push('Trades: ' + extraction.trades_in_scope.join(', '))
  }
  if (!scopeParts.length && opportunity.scope_notes) {
    scopeParts.push(opportunity.scope_notes)
  }

  // Location
  const location = opportunity.location
    ? `${opportunity.location}${opportunity.state_code ? ', ' + opportunity.state_code : ''}`
    : opportunity.state_code || ''

  // Withdrawal date: 30 days from now
  const withdrawalDate = new Date()
  withdrawalDate.setDate(withdrawalDate.getDate() + 30)

  return {
    projectName: opportunity.title,
    jobLocation: location,
    bidNumber: `BH-${new Date().getFullYear()}-${opportunity.id.substring(0, 6).toUpperCase()}`,
    exteriorSqft,
    interiorSqft,
    stuccoSqft,
    buildingFloors: opportunity.building_height_floors,
    scopeDescription: scopeParts.join('\n') || 'Painting services as per project specifications.',
    withdrawalDate,
  }
}

/**
 * Generate a filled bid form Excel from the template.
 */
export function generateBidForm(data: BidFormData): BidFormResult {
  // Read template
  const templatePath = path.join(process.cwd(), 'src/features/bidhunter/docs/Blank Bid form.xlsx')
  const templateBuffer = fs.readFileSync(templatePath)
  const wb = XLSX.read(templateBuffer, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]

  // Fill project info
  ws['D2'] = { t: 's', v: data.projectName }
  ws['D3'] = { t: 's', v: data.jobLocation }
  ws['K5'] = { t: 's', v: data.bidNumber }

  // Withdrawal date (Excel date serial)
  if (data.withdrawalDate) {
    const excelDate = dateToExcelSerial(data.withdrawalDate)
    ws['I18'] = { t: 'n', v: excelDate, z: 'mm/dd/yyyy' }
  }

  // Scope of work
  ws['B15'] = { t: 's', v: data.scopeDescription }

  // Build pricing
  const highRise = (data.buildingFloors || 0) > HIGH_RISE_THRESHOLD

  let exteriorLine = null
  let interiorLine = null
  let stuccoLine = null
  let subtotal = 0

  if (data.exteriorSqft && data.exteriorSqft > 0) {
    const amount = Math.round(data.exteriorSqft * RATE_EXTERIOR * 100) / 100
    exteriorLine = { sqft: data.exteriorSqft, rate: RATE_EXTERIOR, subtotal: amount }
    subtotal += amount
  }

  if (data.interiorSqft && data.interiorSqft > 0) {
    const amount = Math.round(data.interiorSqft * RATE_INTERIOR * 100) / 100
    interiorLine = { sqft: data.interiorSqft, rate: RATE_INTERIOR, subtotal: amount }
    subtotal += amount
  }

  if (data.stuccoSqft && data.stuccoSqft > 0) {
    const amount = Math.round(data.stuccoSqft * RATE_STUCCO * 100) / 100
    stuccoLine = { sqft: data.stuccoSqft, rate: RATE_STUCCO, subtotal: amount }
    subtotal += amount
  }

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  const commission5pct = Math.round(total * 0.05 * 100) / 100

  // Fill cost breakdown (rows 25-28)
  let costRow = 24 // 0-indexed = row 25 in Excel

  if (exteriorLine) {
    setCostRow(ws, costRow, 'Exterior Painting', data.exteriorSqft!, RATE_EXTERIOR, exteriorLine.subtotal)
    costRow++
  }

  if (interiorLine) {
    setCostRow(ws, costRow, 'Interior Painting', data.interiorSqft!, RATE_INTERIOR, interiorLine.subtotal)
    costRow++
  }

  if (stuccoLine) {
    setCostRow(ws, costRow, 'Stucco Repairs', data.stuccoSqft!, RATE_STUCCO, stuccoLine.subtotal)
    costRow++
  }

  if (highRise) {
    const addr = XLSX.utils.encode_cell({ r: costRow, c: 2 })
    ws[addr] = { t: 's', v: '⚠ Building >4 floors — extra equipment required (scaffolding/lift). Contact for quote.' }
    costRow++
  }

  // Tax row (row 29 = index 28)
  ws['G29'] = { t: 'n', v: tax, z: '$#,##0.00' }

  // Total row (row 30 = index 29)
  ws['G30'] = { t: 'n', v: total, z: '$#,##0.00' }

  // Subtotal label
  ws['C28'] = { t: 's', v: 'Subtotal' }
  ws['G28'] = { t: 'n', v: subtotal, z: '$#,##0.00' }

  // Generate buffer
  const outputBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  // Filename
  const safeName = data.projectName.replace(/[^a-zA-Z0-9 -]/g, '').substring(0, 50).trim()
  const filename = `Bid_TicoRestorations_${safeName}.xlsx`

  return {
    buffer: Buffer.from(outputBuffer),
    filename,
    pricing: {
      exterior: exteriorLine,
      interior: interiorLine,
      stucco: stuccoLine,
      subtotal,
      tax,
      total,
      highRise,
      commission5pct,
    },
  }
}

function setCostRow(ws: XLSX.WorkSheet, row: number, description: string, sqft: number, rate: number, amount: number) {
  const bAddr = XLSX.utils.encode_cell({ r: row, c: 1 })
  const cAddr = XLSX.utils.encode_cell({ r: row, c: 2 })
  const dAddr = XLSX.utils.encode_cell({ r: row, c: 3 })
  const eAddr = XLSX.utils.encode_cell({ r: row, c: 4 })
  const gAddr = XLSX.utils.encode_cell({ r: row, c: 6 })

  ws[bAddr] = { t: 's', v: description }
  ws[cAddr] = { t: 's', v: `${sqft.toLocaleString()} sqft` }
  ws[dAddr] = { t: 's', v: '×' }
  ws[eAddr] = { t: 's', v: `$${rate.toFixed(2)}/sqft` }
  ws[gAddr] = { t: 'n', v: amount, z: '$#,##0.00' }
}

function dateToExcelSerial(date: Date): number {
  // Excel serial date: days since Jan 0, 1900 (with the 1900 leap year bug)
  const epoch = new Date(1899, 11, 30)
  const diff = date.getTime() - epoch.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

/**
 * Format pricing for Telegram notification.
 */
export function formatPricingForTelegram(
  opportunity: { title: string; gc_name: string | null; deadline: string | null; location: string | null; state_code: string | null },
  pricing: BidFormResult['pricing'],
): string {
  const lines: string[] = []

  lines.push(`🎯 *${escMd(opportunity.title)}*`)
  if (opportunity.gc_name) lines.push(`GC: ${escMd(opportunity.gc_name)}`)
  if (opportunity.location) lines.push(`📍 ${escMd(opportunity.location)}${opportunity.state_code ? ', ' + opportunity.state_code : ''}`)

  lines.push('')

  if (pricing.exterior) {
    lines.push(`📐 Ext: ${pricing.exterior.sqft.toLocaleString()} sqft × $${pricing.exterior.rate} = *$${pricing.exterior.subtotal.toLocaleString()}*`)
  }
  if (pricing.interior) {
    lines.push(`📐 Int: ${pricing.interior.sqft.toLocaleString()} sqft × $${pricing.interior.rate} = *$${pricing.interior.subtotal.toLocaleString()}*`)
  }
  if (pricing.stucco) {
    lines.push(`📐 Stucco: ${pricing.stucco.sqft.toLocaleString()} sqft × $${pricing.stucco.rate} = *$${pricing.stucco.subtotal.toLocaleString()}*`)
  }

  if (pricing.highRise) {
    lines.push(`⚠️ Edificio >4 pisos — equipo extra requerido`)
  }

  lines.push('')
  lines.push(`💰 *Total bid: $${pricing.total.toLocaleString()}* (incl. 7% tax)`)
  lines.push(`💵 *Tu comisión (5%): $${pricing.commission5pct.toLocaleString()}*`)

  if (opportunity.deadline) {
    const deadlineDate = new Date(opportunity.deadline)
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const dateStr = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    lines.push(`⏰ Due: ${dateStr} (${daysLeft} días)`)
  }

  return lines.join('\n')
}

function escMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}
