/**
 * import-videndum-extended.mjs
 * Importa las 5 hojas pendientes del archivo 'Historico Vent Mod.xlsx'
 * hacia las tablas dedicadas en Supabase.
 *
 * Tablas destino:
 *   order_book · opportunities_unfactored · opportunities
 *   opportunities_history · global_inventory
 */

import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)
const XLSX    = require('xlsx')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Leer .env.local manualmente
const envFile = readFileSync(path.join(__dirname, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()] })
)

const SUPABASE_URL       = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY   = env.SUPABASE_SERVICE_ROLE_KEY
const XLSX_PATH          = path.join(__dirname, '../data/imports/Historico Vent Mod.xlsx')
const ORG_ID             = 'videndum'

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY no configurado en .env.local')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isNum(v) {
  return v !== '' && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) !== 0
}

/** Inserta en lotes de 500 filas via Management API (ON CONFLICT DO NOTHING) */
const MGMT_URL   = 'https://api.supabase.com/v1/projects/csiiulvqzkgijxbgdqcv/database/query'
const MGMT_TOKEN = env.SUPABASE_MGMT_TOKEN

async function upsertBatch(table, rows) {
  if (rows.length === 0) return 0
  const BATCH = 200  // menor batch para SQL strings
  let inserted = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH)
    const cols  = Object.keys(chunk[0])
    const vals  = chunk.map(r =>
      '(' + cols.map(c => {
        const v = r[c]
        if (v === null || v === undefined) return 'NULL'
        if (typeof v === 'number') return v
        return `'${String(v).replace(/'/g, "''")}'`
      }).join(',') + ')'
    ).join(',\n')

    const query = `
      INSERT INTO public.${table} (${cols.join(',')})
      VALUES ${vals}
      ON CONFLICT DO NOTHING
    `
    const res = await fetch(MGMT_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${MGMT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const data = await res.json()
    if (data.message) throw new Error(`${table} batch ${i}: ${data.message}`)
    inserted += chunk.length
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length} filas procesadas...`)
  }
  console.log(`\r  ✓ ${table}: ${inserted} filas procesadas (ON CONFLICT DO NOTHING)`)
  return inserted
}

// ── Leer Excel ────────────────────────────────────────────────────────────────

console.log('Leyendo:', XLSX_PATH)
const wb = XLSX.readFile(XLSX_PATH)

function getSheet(name) {
  const ws = wb.Sheets[name]
  if (!ws) throw new Error(`Hoja no encontrada: "${name}"`)
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
}

// ── 1. ORDER BOOK ─────────────────────────────────────────────────────────────
// Headers[0]: ["Ordenes en proceso","","","2025","",""]
// Headers[1]: ["","Part number","Catalog Type","October","November","December"]
// Data: ["","AB016401","INV",92,"",""]
//   col[1]=part_number, col[2]=catalog_type
//   col[3]=2025/Oct(10), col[4]=2025/Nov(11), col[5]=2025/Dec(12)

console.log('\n=== Order Book ===')
{
  const data   = getSheet('Order book')
  const months = [
    { col: 3, year: 2025, month: 10 },  // October
    { col: 4, year: 2025, month: 11 },  // November
    { col: 5, year: 2025, month: 12 },  // December
  ]
  const rows = []
  for (let r = 2; r < data.length; r++) {
    const row = data[r]
    const part = String(row[1] ?? '').trim()
    const cat  = String(row[2] ?? '').trim() || null
    if (!part || part === 'Part number') continue
    for (const { col, year, month } of months) {
      if (!isNum(row[col])) continue
      rows.push({
        organization_id: ORG_ID,
        part_number:     part,
        catalog_type:    cat,
        year,
        month,
        quantity:        Number(row[col]),
        source_sheet:    'Order book',
      })
    }
  }
  console.log(`  Filas a insertar: ${rows.length}`)
  await upsertBatch('order_book', rows)
}

// ── 2. OPPORTUNITIES UNFACTORED ───────────────────────────────────────────────
// Headers[0]: ["opp...","","","2024","2025","","","",""]
// Headers[1]: ["","Part number","Catalog Type","","January","September","October","November","December"]
// Data: ["","AB016401","INV","","","","",32,26]
//   col[3]=2024 annual, col[4]=2025/Jan(1), col[5]=2025/Sep(9),
//   col[6]=2025/Oct(10), col[7]=2025/Nov(11), col[8]=2025/Dec(12)

console.log('\n=== Opportunities Unfactored ===')
{
  const data   = getSheet('Opportunities Unfactored')
  const months = [
    { col: 3, year: 2024, month: null },  // 2024 annual total
    { col: 4, year: 2025, month: 1  },    // January
    { col: 5, year: 2025, month: 9  },    // September
    { col: 6, year: 2025, month: 10 },    // October
    { col: 7, year: 2025, month: 11 },    // November
    { col: 8, year: 2025, month: 12 },    // December
  ]
  const rows = []
  for (let r = 2; r < data.length; r++) {
    const row = data[r]
    const part = String(row[1] ?? '').trim()
    const cat  = String(row[2] ?? '').trim() || null
    if (!part || part === 'Part number') continue
    for (const { col, year, month } of months) {
      if (!isNum(row[col])) continue
      rows.push({
        organization_id: ORG_ID,
        part_number:     part,
        catalog_type:    cat,
        year,
        month,
        quantity:        Number(row[col]),
        source_sheet:    'Opportunities Unfactored',
      })
    }
  }
  console.log(`  Filas a insertar: ${rows.length}`)
  await upsertBatch('opportunities_unfactored', rows)
}

// ── 3. OPPORTUNITIES (ponderadas) ─────────────────────────────────────────────
// Estructura idéntica a Opportunities Unfactored

console.log('\n=== Opportunities ===')
{
  const data   = getSheet('Opportunities')
  const months = [
    { col: 3, year: 2024, month: null },
    { col: 4, year: 2025, month: 1  },
    { col: 5, year: 2025, month: 9  },
    { col: 6, year: 2025, month: 10 },
    { col: 7, year: 2025, month: 11 },
    { col: 8, year: 2025, month: 12 },
  ]
  const rows = []
  for (let r = 2; r < data.length; r++) {
    const row = data[r]
    const part = String(row[1] ?? '').trim()
    const cat  = String(row[2] ?? '').trim() || null
    if (!part || part === 'Part number') continue
    for (const { col, year, month } of months) {
      if (!isNum(row[col])) continue
      rows.push({
        organization_id: ORG_ID,
        part_number:     part,
        catalog_type:    cat,
        year,
        month,
        quantity:        Number(row[col]),
        source_sheet:    'Opportunities',
      })
    }
  }
  console.log(`  Filas a insertar: ${rows.length}`)
  await upsertBatch('opportunities', rows)
}

// ── 4. OPPORTUNITIES HISTORY ──────────────────────────────────────────────────
// Headers[0]: ["...","","","2020","2021","2022","2023","2024","2025",...]
// Headers[1]: ["","Part number","Catalog Type","","","","","","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
// Data: ["","AB016401","INV",544,281,273,319,236,"",11,38,42,21,17,52,10,4,1,32,26]
//   col[3]=2020 annual, col[4]=2021, col[5]=2022, col[6]=2023, col[7]=2024 annual
//   col[8..19]=2025 Jan..Dec

console.log('\n=== Opportunities History ===')
{
  const data   = getSheet('Opportunities history')
  const months = [
    { col: 3,  year: 2020, month: null },
    { col: 4,  year: 2021, month: null },
    { col: 5,  year: 2022, month: null },
    { col: 6,  year: 2023, month: null },
    { col: 7,  year: 2024, month: null },
    { col: 8,  year: 2025, month: 1  },
    { col: 9,  year: 2025, month: 2  },
    { col: 10, year: 2025, month: 3  },
    { col: 11, year: 2025, month: 4  },
    { col: 12, year: 2025, month: 5  },
    { col: 13, year: 2025, month: 6  },
    { col: 14, year: 2025, month: 7  },
    { col: 15, year: 2025, month: 8  },
    { col: 16, year: 2025, month: 9  },
    { col: 17, year: 2025, month: 10 },
    { col: 18, year: 2025, month: 11 },
    { col: 19, year: 2025, month: 12 },
  ]
  const rows = []
  for (let r = 2; r < data.length; r++) {
    const row = data[r]
    const part = String(row[1] ?? '').trim()
    const cat  = String(row[2] ?? '').trim() || null
    if (!part || part === 'Part number') continue
    for (const { col, year, month } of months) {
      if (!isNum(row[col])) continue
      rows.push({
        organization_id: ORG_ID,
        part_number:     part,
        catalog_type:    cat,
        year,
        month,
        quantity:        Number(row[col]),
        source_sheet:    'Opportunities history',
        // opportunity_id queda NULL — histórico sin FK directa
      })
    }
  }
  console.log(`  Filas a insertar: ${rows.length}`)
  await upsertBatch('opportunities_history', rows)
}

// ── 5. GLOBAL INVENTORY ───────────────────────────────────────────────────────
// Headers[0]: ["Part number","Total Qty In Transit","Usable Qty"]
// Sin year/month → importar como snapshot 2025 (month=null)
// Columnas: part_number, total_qty_in_transit(ignorado), usable_qty

console.log('\n=== Global Inventory ===')
{
  const data = getSheet('Global Inventory')
  const rows = []
  for (let r = 1; r < data.length; r++) {
    const row  = data[r]
    const part = String(row[0] ?? '').trim()
    if (!part || part === 'Part number') continue
    const usable = Number(row[2] ?? 0)
    rows.push({
      organization_id: ORG_ID,
      part_number:     part,
      catalog_type:    null,     // no hay catalog_type en esta hoja
      year:            2025,
      month:           null,     // snapshot sin mes específico
      quantity:        usable,
      warehouse:       null,
      location:        null,
      source_sheet:    'Global Inventory',
    })
  }
  // Deduplicar por part_number (mismo part puede aparecer varias veces en la hoja)
  const seen = new Set()
  const unique = rows.filter(r => {
    const k = r.part_number
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  console.log(`  Filas a insertar: ${unique.length} (de ${rows.length} originales, ${rows.length - unique.length} duplicadas)`)
  await upsertBatch('global_inventory', unique)
}

console.log('\n✅ Importación completa.')
