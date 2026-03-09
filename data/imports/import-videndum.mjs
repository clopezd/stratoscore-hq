/**
 * import-videndum.mjs
 * Importa videndum_records.csv a Supabase en lotes de 500 filas.
 * Uso: node import-videndum.mjs
 * Requisito: tabla videndum_records ya creada en Supabase (001_create_videndum_records.sql)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Configuración ──────────────────────────────────────────────────────────
const SUPABASE_URL    = 'https://csiiulvqzkgijxbgdqcv.supabase.co'
const SERVICE_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo'
const BATCH_SIZE      = 500
const CSV_PATH        = join(__dirname, 'videndum_records.csv')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// ── Parser CSV minimalista ────────────────────────────────────────────────
function parseCSV(content) {
  const lines  = content.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const row  = {}
    headers.forEach((h, i) => {
      const v = vals[i]?.trim()
      row[h.trim()] = v === '' ? null : v
    })
    return row
  })
}

// ── Conversión de tipos ────────────────────────────────────────────────────
function toRow(r) {
  return {
    tenant_id:    r.tenant_id   ?? 'videndum',
    part_number:  r.part_number,
    catalog_type: r.catalog_type || null,
    metric_type:  r.metric_type,
    year:         r.year   ? parseInt(r.year,  10) : null,
    month:        r.month  ? parseInt(r.month, 10) : null,
    quantity:     r.quantity ? parseFloat(r.quantity) : 0,
    source_sheet: r.source_sheet || null,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Leyendo CSV...')
  const content = readFileSync(CSV_PATH, 'utf-8')
  const rows    = parseCSV(content).map(toRow)
  console.log(`✅ ${rows.length} registros listos para importar`)

  // Verificar tabla
  const { error: checkErr } = await supabase
    .from('videndum_records')
    .select('id')
    .limit(1)

  if (checkErr) {
    console.error('❌ La tabla videndum_records no existe aún.')
    console.error('   Ejecuta primero 001_create_videndum_records.sql en Supabase dashboard.')
    process.exit(1)
  }

  console.log(`\n🚀 Importando en lotes de ${BATCH_SIZE}...`)
  let inserted = 0
  let errors   = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('videndum_records')
      .upsert(batch, {
        onConflict: 'part_number,catalog_type,metric_type,year,month',
        ignoreDuplicates: false,
      })

    if (error) {
      errors += batch.length
      console.error(`  ❌ Lote ${i}–${i + batch.length}: ${error.message}`)
    } else {
      inserted += batch.length
      const pct = Math.round((i + batch.length) / rows.length * 100)
      process.stdout.write(`\r  ✓ ${inserted}/${rows.length} filas (${pct}%)  `)
    }
  }

  console.log(`\n\n📊 Resultado:`)
  console.log(`   Insertados: ${inserted}`)
  console.log(`   Errores:    ${errors}`)

  if (inserted > 0) {
    const { count } = await supabase
      .from('videndum_records')
      .select('*', { count: 'exact', head: true })
    console.log(`   Total en tabla: ${count} registros`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
