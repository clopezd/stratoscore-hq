/**
 * Aplica migración 007 usando Supabase Management API
 */

import { readFileSync } from 'fs'

const MGMT_TOKEN = 'sbp_4735a62918dcca5f3b10ca6be267a7f09163f08b'
const PROJECT_ID = 'csiiulvqzkgijxbgdqcv'
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`

const sql = readFileSync('./business-os/supabase/migrations/007_ml_forecast_system.sql', 'utf-8')

console.log('🔧 Aplicando migración 007_ml_forecast_system.sql\n')

try {
  const res = await fetch(MGMT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MGMT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  })

  const data = await res.json()

  if (!res.ok || data.message) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }

  console.log('✅ Migración aplicada exitosamente\n')
  console.log('📊 Tablas creadas:')
  console.log('  - ml_forecast_predictions')
  console.log('  - uk_forecast_weekly')
  console.log('  - planning_adjustments')
  console.log('  - weekly_demand_actual')
  console.log('  - competitor_activity_log')
  console.log('  - ml_model_performance')
  console.log('')
  console.log('📈 Views creadas:')
  console.log('  - v_forecast_comparison')
  console.log('  - v_worst_forecast_accuracy')
  console.log('')
  console.log('✅ Sistema ML Forecast listo!')
  console.log('')
  console.log('🚀 Próximo paso:')
  console.log('   cd business-os/ml-forecast')
  console.log('   ./run_forecast.sh')
  console.log('')

} catch (e) {
  console.error('❌ Error:', e.message)
  process.exit(1)
}
