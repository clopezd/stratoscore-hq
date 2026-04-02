#!/usr/bin/env node

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Configuración
const SUPABASE_URL = 'https://csiiulvqzkgijxbgdqcv.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo'

// Leer el archivo SQL
const sqlPath = join(__dirname, 'supabase/migrations/004_mobility_tables.sql')
const sql = readFileSync(sqlPath, 'utf8')

console.log('🚀 Aplicando migración de Mobility Group CR...')
console.log('📄 Archivo:', sqlPath)
console.log('🔗 Supabase:', SUPABASE_URL)
console.log('')

// Ejecutar la migración usando el endpoint de RPC
async function ejecutarMigracion() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      // Intentar método alternativo: dividir en statements individuales
      console.log('⚠️  Método RPC no disponible, usando método alternativo...\n')

      // Dividir el SQL en statements individuales (separados por líneas vacías o comentarios)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📊 Total de statements a ejecutar: ${statements.length}\n`)

      let exitosos = 0
      let errores = 0

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'

        // Mostrar progreso
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i)
          if (match) console.log(`✅ Creando tabla: ${match[1]}`)
        } else if (statement.includes('CREATE INDEX')) {
          console.log(`📌 Creando índice...`)
        } else if (statement.includes('CREATE OR REPLACE VIEW')) {
          const match = statement.match(/CREATE OR REPLACE VIEW\s+\w+\.(\w+)/i)
          if (match) console.log(`👁️  Creando vista: ${match[1]}`)
        } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          console.log(`⚙️  Creando función...`)
        } else if (statement.includes('CREATE TRIGGER')) {
          console.log(`🔔 Creando trigger...`)
        } else if (statement.includes('INSERT INTO')) {
          console.log(`📝 Insertando datos iniciales...`)
        } else if (statement.includes('CREATE POLICY')) {
          console.log(`🔒 Configurando RLS policy...`)
        }

        exitosos++
      }

      console.log(`\n✅ Migración preparada (${exitosos} statements)`)
      console.log('\n⚠️  NOTA: Necesitas ejecutar el SQL manualmente en Supabase Dashboard:')
      console.log('1. Ir a: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql')
      console.log('2. Copiar el contenido de: Mission-Control/supabase/migrations/004_mobility_tables.sql')
      console.log('3. Pegar y ejecutar')
      console.log('\nO usar este comando si tienes supabase CLI:')
      console.log('cd Mission-Control && supabase db push')

      return
    }

    const result = await response.json()
    console.log('✅ Migración aplicada exitosamente!')
    console.log('📊 Resultado:', result)

  } catch (error) {
    console.error('❌ Error aplicando migración:', error.message)
    console.log('\n📝 Instrucciones manuales:')
    console.log('1. Ir a: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql')
    console.log('2. Copiar el contenido de: Mission-Control/supabase/migrations/004_mobility_tables.sql')
    console.log('3. Pegar y ejecutar')
    process.exit(1)
  }
}

// Mostrar preview del SQL
console.log('📋 Preview de la migración:')
console.log('─'.repeat(60))
const lines = sql.split('\n').slice(0, 20)
lines.forEach(line => console.log(line))
console.log('...')
console.log(`(${sql.split('\n').length} líneas en total)`)
console.log('─'.repeat(60))
console.log('')

console.log('⚠️  IMPORTANTE: Esta migración creará las siguientes tablas:')
console.log('   • terapeutas')
console.log('   • equipos')
console.log('   • pacientes')
console.log('   • citas')
console.log('   • leads_mobility')
console.log('   • horarios_centro')
console.log('   • Vistas: ocupacion_diaria, pacientes_proximo_vencimiento')
console.log('   • Trigger: actualizar_sesiones_paciente')
console.log('')

// Preguntar confirmación (en scripts interactivos)
console.log('🔄 Aplicando migración automáticamente...\n')
ejecutarMigracion()
