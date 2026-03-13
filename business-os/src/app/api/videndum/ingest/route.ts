/**
 * POST /api/videndum/ingest
 * Acepta un archivo .xlsx o .csv (multipart/form-data).
 * Parsea la hoja 'Forecast Production' y hace UPSERT en public.planning_forecasts.
 * Devuelve un resumen JSON con las filas procesadas.
 *
 * Body (FormData):
 *   file        — archivo xlsx o csv
 *   sheet_name  — (opcional) nombre de hoja; default "Forecast Production"
 *   tenant_id   — (opcional) default "videndum"
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const maxDuration = 60

// ── Management API helper ──────────────────────────────────────────────────────

const MGMT_URL = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'

async function mgmtSql(query: string): Promise<unknown[]> {
  const token = process.env.SUPABASE_MGMT_TOKEN
  if (!token) throw new Error('SUPABASE_MGMT_TOKEN no configurado')
  const res = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  if (!res.ok || data.message) throw new Error(data.message ?? `HTTP ${res.status}`)
  return data as unknown[]
}

function esc(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

// ── Month label → number ───────────────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
  jan: 1, apr: 4, aug: 8, sep2: 9, oct2: 10, nov2: 11, dec: 12,
}

// ── Excel parser ───────────────────────────────────────────────────────────────

interface ForecastRow {
  part_number: string
  year: number
  month: number
  quantity: number
}

function parseForecastSheet(ws: XLSX.WorkSheet): { rows: ForecastRow[]; skipped: number } {
  const data = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null })

  // Row 0 = años, Row 1 = meses, Row 2 = header "Part number", Row 3+ = datos
  const row0 = (data[0] ?? []) as unknown[]
  const row1 = (data[1] ?? []) as unknown[]

  // Construir mapa columna → { year, month }
  let currentYear: number | null = null
  const colMap: Record<number, { year: number; month: number }> = {}

  for (let c = 1; c < row0.length; c++) {
    const yearVal = row0[c]
    if (yearVal !== null && yearVal !== undefined && yearVal !== '') {
      const parsed = parseInt(String(yearVal))
      if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2040) currentYear = parsed
    }
    const monthStr = String(row1[c] ?? '').toLowerCase().trim().slice(0, 3)
    if (monthStr && MONTH_MAP[monthStr] && currentYear) {
      colMap[c] = { year: currentYear, month: MONTH_MAP[monthStr] }
    }
  }

  const rows: ForecastRow[] = []
  let skipped = 0

  // Datos desde fila 3 (índice 3 después de header en índice 2)
  const dataStart = data.length > 3 ? 3 : 2
  for (let r = dataStart; r < data.length; r++) {
    const row = data[r] as unknown[]
    const raw = row?.[0]
    const partNumber = raw !== null && raw !== undefined ? String(raw).trim() : ''
    if (!partNumber) { skipped++; continue }

    for (const [colStr, { year, month }] of Object.entries(colMap)) {
      const val = row[parseInt(colStr)]
      if (val === null || val === undefined || val === '') continue
      const qty = parseFloat(String(val))
      if (isNaN(qty) || qty === 0) continue
      rows.push({ part_number: partNumber, year, month, quantity: qty })
    }
  }

  return { rows, skipped }
}

// ── CSV parser (simple format: part_number,year,month,quantity) ───────────────

function parseCsvFlat(text: string): { rows: ForecastRow[]; skipped: number } {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows: ForecastRow[] = []
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = (vals[idx] ?? '').trim() })

    const part = obj['part_number'] ?? obj['part number'] ?? ''
    const year = parseInt(obj['year'] ?? '')
    const month = parseInt(obj['month'] ?? '')
    const qty = parseFloat(obj['quantity'] ?? obj['qty'] ?? '')

    if (!part || isNaN(year) || isNaN(month) || isNaN(qty)) { skipped++; continue }
    rows.push({ part_number: part, year, month, quantity: qty })
  }

  return { rows, skipped }
}

// ── Upsert batches ─────────────────────────────────────────────────────────────

const BATCH = 400

async function upsertBatches(rows: ForecastRow[], tenantId: string): Promise<{ inserted: number; errors: number }> {
  let inserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const values = batch.map(r =>
      `(${esc(tenantId)}, ${esc(r.part_number)}, ${r.year}, ${r.month}, ${r.quantity})`
    ).join(',\n')

    const sql = `
      INSERT INTO public.planning_forecasts (tenant_id, part_number, year, month, quantity)
      VALUES ${values}
      ON CONFLICT (tenant_id, part_number, year, month)
      DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now();
    `

    try {
      await mgmtSql(sql)
      inserted += batch.length
    } catch (e) {
      console.error(`[ingest] batch ${i}-${i + batch.length} error:`, e instanceof Error ? e.message : e)
      errors += batch.length
    }
  }

  return { inserted, errors }
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Se esperaba multipart/form-data' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  if (!fileEntry || typeof fileEntry === 'string') {
    return NextResponse.json({ error: 'Campo "file" requerido' }, { status: 400 })
  }

  const file = fileEntry as File
  const sheetName = (formData.get('sheet_name') as string | null) ?? 'Forecast Production'
  const tenantId  = (formData.get('tenant_id')  as string | null) ?? 'videndum'
  const fileName  = file.name.toLowerCase()

  console.log(`[ingest] file: ${file.name} (${file.size} bytes), sheet: ${sheetName}, tenant: ${tenantId}`)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let rows: ForecastRow[]
  let skipped: number
  let usedSheet = sheetName

  try {
    if (fileName.endsWith('.csv')) {
      // CSV plano: part_number,year,month,quantity
      const text = buffer.toString('utf-8')
      ;({ rows, skipped } = parseCsvFlat(text))
    } else {
      // XLSX — intentar la hoja solicitada; si no existe, tomar la primera
      const wb = XLSX.read(buffer, { type: 'buffer' })
      const ws = wb.Sheets[sheetName] ?? wb.Sheets[wb.SheetNames[0]]
      usedSheet = wb.Sheets[sheetName] ? sheetName : wb.SheetNames[0]

      if (!ws) throw new Error('El archivo no contiene hojas válidas')
      ;({ rows, skipped } = parseForecastSheet(ws))
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al parsear el archivo'
    console.error('[ingest] parse error:', msg)
    return NextResponse.json({ error: `Error de parseo: ${msg}` }, { status: 422 })
  }

  if (rows.length === 0) {
    return NextResponse.json({
      error: `No se encontraron datos en la hoja "${usedSheet}". Verifica el formato del archivo.`,
    }, { status: 422 })
  }

  const years = [...new Set(rows.map(r => r.year))].sort()
  const parts = new Set(rows.map(r => r.part_number)).size

  console.log(`[ingest] parsed ${rows.length} rows — years: ${years.join(', ')}, parts: ${parts}`)

  const { inserted, errors } = await upsertBatches(rows, tenantId)

  console.log(`[ingest] done — inserted/updated: ${inserted}, errors: ${errors}`)

  return NextResponse.json({
    ok: true,
    sheet: usedSheet,
    file_name: file.name,
    rows_parsed: rows.length,
    rows_saved: inserted,
    rows_errored: errors,
    skipped,
    years,
    unique_parts: parts,
    message: `${inserted.toLocaleString()} registros guardados en planning_forecasts (${years[0]}–${years[years.length - 1]}, ${parts} part numbers)`,
  })
}
