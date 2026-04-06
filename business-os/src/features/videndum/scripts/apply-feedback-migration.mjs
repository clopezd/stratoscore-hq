#!/usr/bin/env node

/**
 * Aplica la migración 012_client_feedback_videndum.sql
 * Ejecutar: node scripts/migrations/apply-feedback-migration.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Cliente admin con Service Role Key (bypassa RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// Leer el archivo SQL
const migrationPath = join(__dirname, '../../supabase/migrations/012_client_feedback_videndum.sql')
const sql = readFileSync(migrationPath, 'utf-8')

console.log('🔧 Aplicando migración 012_client_feedback_videndum.sql...')

try {
  // Ejecutar usando exec_raw_sql function
  const { data, error } = await supabase.rpc('exec_raw_sql', { query_text: sql })

  if (error) {
    console.error('❌ Error ejecutando migración:', error)
    process.exit(1)
  }

  console.log('✅ Migración aplicada exitosamente')
  console.log('📊 Resultado:', data)

  // Verificar que la tabla existe
  const { data: tables, error: verifyError } = await supabase
    .from('client_feedback')
    .select('*')
    .limit(0)

  if (verifyError) {
    console.error('⚠️ Error verificando tabla client_feedback:', verifyError)
  } else {
    console.log('✅ Tabla client_feedback confirmada en la base de datos')
  }

  process.exit(0)
} catch (e) {
  console.error('❌ Error inesperado:', e)
  process.exit(1)
}
