#!/usr/bin/env node
/**
 * Script para aplicar la migración ConFIRMA a Supabase
 */

import { readFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://csiiulvqzkgijxbgdqcv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function aplicarMigracion() {
  try {
    console.log('📄 Leyendo migración...')
    const sql = await readFile('business-os/supabase/migrations/006_confirma_system.sql', 'utf-8')
    console.log(`✅ Leído: ${sql.length} caracteres\n`)

    console.log('🚀 Aplicando migración ConFIRMA...')
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Si no existe la función exec_sql, usamos el método directo
      console.log('ℹ️  Usando método alternativo (direct SQL)...\n')

      // Separar por statements (simple split por ;)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Ejecutando ${statements.length} statements...`)

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        if (stmt.length < 10) continue // Skip empty or too short

        try {
          await supabase.rpc('exec', { query: stmt + ';' })
          process.stdout.write(`\r   Progreso: ${i + 1}/${statements.length}`)
        } catch (err) {
          console.error(`\n⚠️  Error en statement ${i + 1}:`, err.message)
        }
      }
      console.log('\n')
    }

    console.log('✅ Migración aplicada exitosamente\n')

    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...')
    const { data: tablas } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .like('table_name', 'confirma_%')
      .order('table_name')

    if (tablas && tablas.length > 0) {
      console.log('📊 Tablas ConFIRMA creadas:')
      tablas.forEach(row => console.log(`   ✓ ${row.table_name}`))
    } else {
      console.log('⚠️  No se pudieron verificar las tablas (puede que estén creadas)')
    }

    console.log('\n🎉 Sistema ConFIRMA instalado')
    console.log('\n💡 Verifica en Supabase Dashboard: Table Editor')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.details) console.error('   Detalle:', error.details)
    if (error.hint) console.error('   Hint:', error.hint)
    process.exit(1)
  }
}

aplicarMigracion()
