/**
 * import-forecasts.mjs
 * Transforma la pestaña 'Forecast Production' de Historico Vent Mod.xlsx
 * y la carga en public.planning_forecasts vía Management API.
 *
 * Uso: node import-forecasts.mjs
 */

import { readFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const XLSX    = require('./node_modules/xlsx/xlsx.js')

const TOKEN   = 'sbp_34619b60d4c8b10f2e30a500caae0adb73be1747'
const PROJECT = 'csiiulvqzkgijxbgdqcv'
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`
const XLSX_PATH = '/home/cmarioia/proyectos/stratoscore-hq/data/imports/Historico Vent Mod.xlsx'
const BATCH   = 400

// Mapa de abreviatura mes en español → número
const MONTH_MAP = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
}

async function query(sql) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  return r.json()
}

function escStr(v) {
  if (v === null || v === undefined) return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

// ── Leer y transformar Excel ──────────────────────────────────────────────
function extractRows() {
  const wb   = XLSX.readFile(XLSX_PATH)
  const ws   = wb.Sheets['Forecast Production']
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  const row1 = data[0]  // años
  const row2 = data[1]  // meses
  // fila 3 es el header "Part number" — datos desde fila 4 (índice 3)

  // Construir mapa col → { year, month }
  let currentYear = null
  const colMap = {}
  for (let c = 1; c < row1.length; c++) {
    if (row1[c] !== null && row1[c] !== undefined) currentYear = parseInt(row1[c])
    const monthStr = row2[c]?.toString().toLowerCase()
    if (monthStr && MONTH_MAP[monthStr] && currentYear) {
      colMap[c] = { year: currentYear, month: MONTH_MAP[monthStr] }
    }
  }

  const rows = []
  let skipped = 0

  for (let r = 3; r < data.length; r++) {
    const row = data[r]
    const partNumber = row[0]?.toString().trim()
    if (!partNumber) { skipped++; continue }

    for (const [colStr, { year, month }] of Object.entries(colMap)) {
      const qty = row[parseInt(colStr)]
      if (qty === null || qty === undefined || qty === '') continue
      const q = parseFloat(qty)
      if (isNaN(q) || q === 0) continue

      rows.push({ part_number: partNumber, year, month, quantity: q })
    }
  }

  return { rows, skipped }
}

function toInsertSQL(batch) {
  const values = batch.map(r =>
    `('videndum', ${escStr(r.part_number)}, ${r.year}, ${r.month}, ${r.quantity})`
  ).join(',\n')

  return `
    INSERT INTO public.planning_forecasts (tenant_id, part_number, year, month, quantity)
    VALUES ${values}
    ON CONFLICT (tenant_id, part_number, year, month)
    DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now();
  `
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Leyendo Forecast Production...')
  const { rows, skipped } = extractRows()
  console.log(`✅ ${rows.length} registros extraídos (${skipped} filas vacías omitidas)`)
  console.log(`   Años cubiertos: ${[...new Set(rows.map(r => r.year))].sort().join(', ')}`)
  console.log(`   Part numbers únicos: ${new Set(rows.map(r => r.part_number)).size}`)

  // Crear tabla si no existe
  console.log('\n🏗  Creando tabla planning_forecasts...')
  const createSQL = readFileSync(
    '/home/cmarioia/proyectos/stratoscore-hq/Mission-Control/supabase/migrations/002_planning_forecasts.sql',
    'utf-8'
  )
  const createRes = await query(createSQL)
  if (createRes?.message) {
    console.error('❌ Error creando tabla:', createRes.message)
    process.exit(1)
  }
  console.log('✅ Tabla lista')

  // Importar en lotes
  console.log(`\n🚀 Importando en lotes de ${BATCH}...`)
  let inserted = 0, errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const res   = await query(toInsertSQL(batch))

    if (res?.message) {
      errors += batch.length
      console.error(`\n❌ Lote ${i}–${i + batch.length}: ${res.message.slice(0, 100)}`)
    } else {
      inserted += batch.length
      const pct = Math.round((i + batch.length) / rows.length * 100)
      process.stdout.write(`\r  ✓ ${inserted}/${rows.length} (${pct}%)  `)
    }
  }

  // Verificar
  const count = await query('SELECT COUNT(*) as total FROM public.planning_forecasts;')
  console.log(`\n\n📊 Resultado:`)
  console.log(`   Procesados: ${inserted}`)
  console.log(`   Errores:    ${errors}`)
  console.log(`   Total en tabla: ${count[0]?.total ?? 'N/A'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
