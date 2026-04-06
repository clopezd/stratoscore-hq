import type { CSVRow } from '../types'

/**
 * Parsea CSV texto a array de objetos
 */
export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'))

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: CSVRow = {}
    headers.forEach((header, i) => {
      row[header] = values[i] ?? ''
    })
    return row
  })
}

/**
 * Parsea JSON (array de objetos)
 */
export function parseJSON(text: string): CSVRow[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('JSON debe ser un array de oportunidades')
  return data
}

/**
 * Convierte row parseada a formato de inserción Supabase
 */
export function rowToOpportunity(row: CSVRow) {
  const tradesRaw = row.trades_required ?? row.trades ?? ''
  const trades = typeof tradesRaw === 'string'
    ? tradesRaw.split(/[;|]/).map(t => t.trim()).filter(Boolean)
    : Array.isArray(tradesRaw) ? tradesRaw : []

  const sdvosb = row.is_sdvosb_eligible
  const isSdvosb = sdvosb === true || sdvosb === 'true' || sdvosb === 'yes' || sdvosb === '1'

  return {
    title: row.title ?? 'Sin título',
    description: row.description ?? null,
    gc_name: row.gc_name ?? row.general_contractor ?? null,
    gc_contact: row.gc_contact ?? row.contact ?? null,
    location: row.location ?? row.city ?? null,
    state_code: row.state_code ?? row.state ?? null,
    deadline: row.deadline ? new Date(row.deadline as string).toISOString() : null,
    estimated_value: row.estimated_value ? Number(row.estimated_value) || null : null,
    trades_required: trades.length > 0 ? trades : null,
    is_sdvosb_eligible: isSdvosb,
    source_platform: row.source_platform ?? 'buildingconnected',
    source_id: row.source_id ?? null,
    raw_data: row,
    status: 'new' as const,
  }
}
