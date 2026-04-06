/**
 * Aplica migración 007_ml_forecast_system.sql a Supabase
 * Ejecutar: node apply-ml-forecast-migration.mjs
 */

import { readFileSync } from 'fs'
import pg from 'pg'

const DB_URL = 'postgresql://postgres.csiiulvqzkgijxbgdqcv:RkY.BPf56*wkuvW@aws-0-us-west-1.pooler.supabase.com:6543/postgres'

const sql = readFileSync('./business-os/supabase/migrations/007_ml_forecast_system.sql', 'utf-8')

console.log('🔧 Aplicando migración ML Forecast System...\n')

const client = new pg.Client({ connectionString: DB_URL })

try {
  await client.connect()
  console.log('✓ Conectado a Supabase\n')

  await client.query(sql)
  console.log('✓ Migración aplicada exitosamente\n')

  // Verificar tablas creadas
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'ml_forecast_predictions',
        'uk_forecast_weekly',
        'planning_adjustments',
        'weekly_demand_actual',
        'competitor_activity_log',
        'ml_model_performance'
      )
    ORDER BY table_name
  `)

  console.log('📊 Tablas creadas:')
  rows.forEach(r => console.log(`  - ${r.table_name}`))
  console.log('')

} catch (e) {
  console.error('❌ Error:', e.message)
  process.exit(1)
} finally {
  await client.end()
}

console.log('✅ Listo para ejecutar forecast: cd business-os/ml-forecast && ./run_forecast.sh\n')
