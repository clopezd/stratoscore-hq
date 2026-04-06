/**
 * apply-intelligence-migration.mjs
 * Aplica la migración 008 (intelligence tables) a Supabase usando psql directamente
 *
 * Uso: node apply-intelligence-migration.mjs
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

async function applyMigration() {
  console.log('🚀 Aplicando migración 008: Intelligence Tables...\n')

  const password = 'RkY.BPf56*wkuvW'
  const host = 'aws-0-us-west-1.pooler.supabase.com'
  const port = 6543
  const user = 'postgres.csiiulvqzkgijxbgdqcv'
  const database = 'postgres'
  const file = 'business-os/supabase/migrations/008_intelligence_tables.sql'

  try {
    // Aplicar migración usando psql
    console.log('Ejecutando psql...')
    const cmd = `PGPASSWORD='${password}' psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${file}`

    execSync(cmd, { stdio: 'inherit' })

    console.log('\n✅ Migración aplicada exitosamente')

    // Verificar tablas creadas
    console.log('\n📊 Verificando tablas creadas...')
    const verifyCmd = `PGPASSWORD='${password}' psql -h ${host} -p ${port} -U ${user} -d ${database} -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('sync_metadata', 'videndum_forecast', 'competitor_analysis', 'market_trends', 'product_obsolescence_scores', 'ai_insights') ORDER BY table_name;"`

    execSync(verifyCmd, { stdio: 'inherit' })

    console.log('\n✅ Todas las tablas de inteligencia creadas correctamente')

  } catch (error) {
    console.error('\n❌ Error aplicando migración')
    console.error(error.message)
    process.exit(1)
  }
}

applyMigration()
