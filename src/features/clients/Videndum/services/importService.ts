/**
 * Videndum — Import Service
 *
 * Lee data/imports/Historico Vent Mod.xlsx y carga las pestañas
 * "Revenue" y "Order intake" en la tabla videndum_records (Supabase).
 *
 * Uso:
 *   cd Mission-Control
 *   npx tsx ../src/features/clients/Videndum/services/importService.ts
 *   npx tsx ../src/features/clients/Videndum/services/importService.ts --dry-run
 *   npx tsx ../src/features/clients/Videndum/services/importService.ts --sheet Revenue
 *   npx tsx ../src/features/clients/Videndum/services/importService.ts --sheet "Order intake"
 *
 * Requiere en el entorno (o .env.local de Mission-Control):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CatalogType = 'INV' | 'PKG' | null
type MetricType = 'revenue' | 'order_intake'

interface VidendumRow {
  tenant_id: 'videndum'
  part_number: string
  catalog_type: CatalogType
  metric_type: MetricType
  year: number
  month: number | null    // 1–12 | null (total anual)
  quantity: number
  source_sheet: string
}

// ─── Configuración de columnas por pestaña ───────────────────────────────────
//
// Verificado contra la estructura real del archivo:
//
// Revenue (A1:R1732):
//   col[1] = part_number | col[2] = catalog_type
//   col[3..7] = totales anuales 2020–2024 (month=null)
//   col[8..17] = mensuales 2025 ene–oct (month=1..10)
//
// Order intake (A1:Q1809):
//   col[1] = part_number | sin catalog_type (col[2] ya son datos 2020)
//   col[2..6] = totales anuales 2020–2024 (month=null)
//   col[7..16] = mensuales 2025 ene–oct (month=1..10)

interface SheetMapping {
  sheetName: string
  metricType: MetricType
  partNumberCol: number
  catalogTypeCol: number | null   // null = la hoja no tiene este campo
  annualCols: { col: number; year: number }[]
  monthlyCols: { col: number; year: number; month: number }[]
  dataStartRow: number            // índice 0-based de la primera fila de datos
}

const SHEET_MAPPINGS: SheetMapping[] = [
  {
    sheetName: 'Revenue',
    metricType: 'revenue',
    partNumberCol: 1,
    catalogTypeCol: 2,
    annualCols: [
      { col: 3, year: 2020 },
      { col: 4, year: 2021 },
      { col: 5, year: 2022 },
      { col: 6, year: 2023 },
      { col: 7, year: 2024 },
    ],
    monthlyCols: [
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
    ],
    dataStartRow: 2,
  },
  {
    sheetName: 'Order intake',
    metricType: 'order_intake',
    partNumberCol: 1,
    catalogTypeCol: null,   // Order Intake no desagrega por catalog_type
    annualCols: [
      { col: 2, year: 2020 },
      { col: 3, year: 2021 },
      { col: 4, year: 2022 },
      { col: 5, year: 2023 },
      { col: 6, year: 2024 },
    ],
    monthlyCols: [
      { col: 7,  year: 2025, month: 1  },
      { col: 8,  year: 2025, month: 2  },
      { col: 9,  year: 2025, month: 3  },
      { col: 10, year: 2025, month: 4  },
      { col: 11, year: 2025, month: 5  },
      { col: 12, year: 2025, month: 6  },
      { col: 13, year: 2025, month: 7  },
      { col: 14, year: 2025, month: 8  },
      { col: 15, year: 2025, month: 9  },
      { col: 16, year: 2025, month: 10 },
    ],
    dataStartRow: 2,
  },
]

// ─── Unpivot: Excel wide → formato largo ─────────────────────────────────────

function unpivotSheet(
  ws: XLSX.WorkSheet,
  mapping: SheetMapping
): VidendumRow[] {
  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
    header: 1,
    defval: null,
  })

  const result: VidendumRow[] = []
  let skippedBlank = 0
  let skippedZero = 0

  for (let r = mapping.dataStartRow; r < rawRows.length; r++) {
    const row = rawRows[r]

    const partNumber = row[mapping.partNumberCol]
    if (!partNumber || typeof partNumber !== 'string' || partNumber.trim() === '') {
      skippedBlank++
      continue
    }

    const pn = partNumber.trim()

    // catalog_type: validar que sea INV, PKG o null
    let catalogType: CatalogType = null
    if (mapping.catalogTypeCol !== null) {
      const raw = row[mapping.catalogTypeCol]
      if (raw === 'INV' || raw === 'PKG') {
        catalogType = raw
      } else if (raw !== null && raw !== undefined && raw !== '') {
        // Valor inesperado — log y continuar como null
        console.warn(`  [WARN] part=${pn} row=${r + 1}: catalog_type desconocido "${raw}", se tratará como null`)
      }
    }

    // Generar una fila por cada columna temporal con valor no nulo y no cero
    const allTimeCols = [
      ...mapping.annualCols.map(({ col, year }) => ({ col, year, month: null as null })),
      ...mapping.monthlyCols.map(({ col, year, month }) => ({ col, year, month })),
    ]

    for (const { col, year, month } of allTimeCols) {
      const raw = row[col]
      if (raw === null || raw === undefined || raw === '') continue

      const quantity = typeof raw === 'number' ? raw : parseFloat(String(raw))
      if (isNaN(quantity)) continue

      // Incluir ceros explícitos solo si vienen de fuentes que los registran
      // (evita miles de filas 0 de años sin actividad)
      if (quantity === 0) {
        skippedZero++
        continue
      }

      result.push({
        tenant_id: 'videndum',
        part_number: pn,
        catalog_type: catalogType,
        metric_type: mapping.metricType,
        year,
        month,
        quantity,
        source_sheet: mapping.sheetName,
      })
    }
  }

  console.log(
    `  ${mapping.sheetName}: ${result.length} filas generadas` +
    ` (omitidas: ${skippedBlank} sin part_number, ${skippedZero} con quantity=0)`
  )
  return result
}

// ─── Upsert por lotes ─────────────────────────────────────────────────────────

async function batchUpsert(
  supabase: ReturnType<typeof createClient>,
  rows: VidendumRow[],
  batchSize = 500
): Promise<{ inserted: number; errors: number }> {
  let inserted = 0
  let errors = 0
  const total = rows.length

  for (let i = 0; i < total; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(total / batchSize)

    process.stdout.write(
      `\r  Lote ${batchNum}/${totalBatches} (${Math.min(i + batchSize, total)}/${total} filas)...`
    )

    const { error } = await supabase
      .from('videndum_records')
      .upsert(batch, {
        onConflict: 'part_number,metric_type,year',
        ignoreDuplicates: false,   // actualiza quantity si ya existe
      })

    if (error) {
      console.error(`\n  [ERROR] Lote ${batchNum}: ${error.message}`)
      errors += batch.length
    } else {
      inserted += batch.length
    }
  }

  process.stdout.write('\n')
  return { inserted, errors }
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function rowsToCsv(rows: VidendumRow[]): string {
  const headers = ['tenant_id','part_number','catalog_type','metric_type','year','month','quantity','source_sheet']
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push([
      r.tenant_id, r.part_number, r.catalog_type ?? '',
      r.metric_type, r.year, r.month ?? '',
      r.quantity, r.source_sheet,
    ].map(escape).join(','))
  }
  return lines.join('\n')
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const csvMode = args.includes('--csv')
  const sheetFilter = (() => {
    const idx = args.indexOf('--sheet')
    return idx !== -1 ? args[idx + 1] : null
  })()

  // ── Resolver ruta del Excel (relativa al repo root) ──────────────────────
  const repoRoot = path.resolve(__dirname, '../../../../../')
  const xlsxPath = path.join(repoRoot, 'data/imports/Historico Vent Mod.xlsx')

  if (!fs.existsSync(xlsxPath)) {
    console.error(`[ERROR] Archivo no encontrado: ${xlsxPath}`)
    process.exit(1)
  }

  console.log(`\n📂 Leyendo: ${xlsxPath}`)
  if (dryRun) console.log('🔍 MODO DRY-RUN — no se escribirá en Supabase\n')

  // ── Cargar Excel ──────────────────────────────────────────────────────────
  const wb = XLSX.readFile(xlsxPath)

  // ── Seleccionar mappings a procesar ───────────────────────────────────────
  const mappings = sheetFilter
    ? SHEET_MAPPINGS.filter(m => m.sheetName.toLowerCase() === sheetFilter.toLowerCase())
    : SHEET_MAPPINGS

  if (mappings.length === 0) {
    console.error(`[ERROR] No se encontró mapping para la pestaña: "${sheetFilter}"`)
    console.error('Opciones válidas:', SHEET_MAPPINGS.map(m => m.sheetName).join(', '))
    process.exit(1)
  }

  // ── Unpivot ───────────────────────────────────────────────────────────────
  console.log('🔄 Transformando a formato largo (unpivot)...')
  const allRows: VidendumRow[] = []

  for (const mapping of mappings) {
    const ws = wb.Sheets[mapping.sheetName]
    if (!ws) {
      console.warn(`  [WARN] Pestaña "${mapping.sheetName}" no encontrada en el archivo`)
      continue
    }
    const rows = unpivotSheet(ws, mapping)
    allRows.push(...rows)
  }

  console.log(`\n✅ Total filas a insertar: ${allRows.length}`)

  // ── Vista previa (siempre) ────────────────────────────────────────────────
  console.log('\n📋 Muestra (primeras 5 filas):')
  console.table(allRows.slice(0, 5))

  if (dryRun) {
    console.log('\n✅ Dry-run completado. No se realizaron cambios en Supabase.')
    return
  }

  // ── Modo CSV: exportar archivo en lugar de insertar ───────────────────────
  if (csvMode) {
    const csvPath = path.join(repoRoot, 'data/imports/videndum_records.csv')
    fs.writeFileSync(csvPath, rowsToCsv(allRows), 'utf-8')
    console.log(`\n📄 CSV exportado: ${csvPath}`)
    console.log(`   ${allRows.length} filas listas para importar en Supabase Table Editor.`)
    console.log('\n👉 Pasos:')
    console.log('   1. Abre https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/editor')
    console.log('   2. Selecciona la tabla videndum_records')
    console.log('   3. Botón "Import data" → sube el CSV')
    return
  }

  // ── Conexión Supabase ─────────────────────────────────────────────────────
  // Carga .env.local de Mission-Control si las vars no están ya en el entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const envPath = path.join(repoRoot, 'Mission-Control/.env.local')
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim()
        if (key && !(key in process.env)) process.env[key] = val
      }
      console.log('\n🔑 Variables cargadas desde Mission-Control/.env.local')
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error(
      '[ERROR] Faltan variables de entorno:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL\n' +
      '  SUPABASE_SERVICE_ROLE_KEY\n' +
      'Asegúrate de ejecutar desde Mission-Control o exportar las variables.'
    )
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // ── Upsert ────────────────────────────────────────────────────────────────
  console.log('\n⬆️  Cargando en Supabase (tabla videndum_records)...')
  const { inserted, errors } = await batchUpsert(supabase, allRows)

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────')
  console.log(`✅ Insertadas/actualizadas: ${inserted}`)
  if (errors > 0) console.log(`❌ Con errores:             ${errors}`)
  console.log('─────────────────────────────────\n')

  if (errors > 0) process.exit(1)
}

main().catch(err => {
  console.error('[FATAL]', err)
  process.exit(1)
})
