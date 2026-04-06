/**
 * import-via-api.mjs
 * Importa videndum_records.csv a Supabase via Management API (sin pg directo).
 */
import { readFileSync } from 'fs'

const TOKEN   = 'sbp_34619b60d4c8b10f2e30a500caae0adb73be1747'
const PROJECT = 'csiiulvqzkgijxbgdqcv'
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`
const CSV_PATH = '/home/cmarioia/proyectos/stratoscore-hq/data/imports/videndum_records.csv'
const BATCH = 500

async function query(sql) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  return r.json()
}

function escStr(v) {
  if (v === null || v === undefined || v === '') return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

function parseCSV(content) {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const row = {}
    headers.forEach((h, i) => {
      const v = vals[i]?.trim()
      row[h.trim()] = (v === '' || v === undefined) ? null : v
    })
    return row
  })
}

function toSQL(rows) {
  const values = rows.map(r => {
    const tenant_id    = escStr(r.tenant_id ?? 'videndum')
    const part_number  = escStr(r.part_number)
    const catalog_type = escStr(r.catalog_type)
    const metric_type  = escStr(r.metric_type)
    const year         = r.year ? parseInt(r.year, 10) : 'NULL'
    const month        = r.month ? parseInt(r.month, 10) : 'NULL'
    const quantity     = r.quantity ? parseFloat(r.quantity) : 0
    const source_sheet = escStr(r.source_sheet)
    return `(${tenant_id},${part_number},${catalog_type},${metric_type},${year},${month},${quantity},${source_sheet})`
  }).join(',\n')

  return `INSERT INTO public.videndum_records
    (tenant_id,part_number,catalog_type,metric_type,year,month,quantity,source_sheet)
  VALUES ${values};`
}

async function main() {
  console.log('📂 Leyendo CSV...')
  const rows = parseCSV(readFileSync(CSV_PATH, 'utf-8'))
  console.log(`✅ ${rows.length} registros`)

  // TRUNCATE primero
  await query('TRUNCATE TABLE public.videndum_records;')
  console.log('🗑  Tabla limpiada')

  console.log(`\n🚀 Importando en lotes de ${BATCH}...`)
  let inserted = 0, errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const sql   = toSQL(batch)
    const res   = await query(sql)

    if (res?.message) {
      errors += batch.length
      console.error(`\n❌ Lote ${i}–${i+batch.length}: ${res.message.slice(0, 120)}`)
    } else {
      inserted += batch.length
      const pct = Math.round((i + batch.length) / rows.length * 100)
      process.stdout.write(`\r  ✓ ${inserted}/${rows.length} (${pct}%)  `)
    }
  }

  const count = await query('SELECT COUNT(*) as total FROM public.videndum_records;')
  console.log(`\n\n📊 Resultado:`)
  console.log(`   Procesados OK: ${inserted}`)
  console.log(`   Errores:       ${errors}`)
  console.log(`   Total en tabla: ${count[0]?.total ?? 'N/A'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
