/**
 * Script para insertar datos de ejemplo en ml_forecast_predictions
 * Ejecutar: node business-os/scripts/seed-ml-forecast.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://csiiulvqzkgijxbgdqcv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🌱 Insertando datos de ejemplo para ML Forecast...\n')

// Generar 8 semanas de forecast para 3 SKUs de ejemplo
const skus = ['MT055XPRO3', 'MVH502AH', 'MVKN8TWINMC']
const baseDate = new Date('2026-03-17') // Próximo lunes

const forecasts = []

for (const sku of skus) {
  const baseValue = Math.floor(Math.random() * 2000) + 1000 // 1000-3000

  for (let weekOffset = 0; weekOffset < 8; weekOffset++) {
    const weekStart = new Date(baseDate)
    weekStart.setDate(weekStart.getDate() + (weekOffset * 7))

    const year = weekStart.getFullYear()
    const weekNumber = Math.ceil((weekStart - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1
    const week = `${year}-W${String(weekNumber).padStart(2, '0')}`

    // Añadir variación (tendencia + ruido)
    const trend = weekOffset * 50 // Tendencia creciente
    const noise = (Math.random() - 0.5) * 200
    const prediction = Math.round(baseValue + trend + noise)

    const confidenceLow = Math.round(prediction * 0.85)
    const confidenceHigh = Math.round(prediction * 1.15)

    forecasts.push({
      sku,
      week,
      week_start_date: weekStart.toISOString().split('T')[0],
      ml_prediction: prediction,
      ml_confidence_low: confidenceLow,
      ml_confidence_high: confidenceHigh,
      trend_factor: -5 + Math.random() * 10, // -5% a +5%
      seasonality_factor: Math.random() * 15, // 0% a +15%
      competition_factor: -Math.random() * 10, // 0% a -10%
      pipeline_factor: Math.random() * 8, // 0% a +8%
      model_version: 'v1.0',
      model_type: 'prophet',
      anomaly_score: Math.random() * 0.3, // 0-0.3 (normal)
      confidence_score: 0.75 + Math.random() * 0.20, // 0.75-0.95
    })
  }
}

try {
  // Verificar si la tabla existe
  const { error: checkError } = await supabase
    .from('ml_forecast_predictions')
    .select('id')
    .limit(1)

  if (checkError) {
    console.error('❌ Error: La tabla ml_forecast_predictions no existe')
    console.error('   Ejecuta primero: node apply-ml-forecast-migration.mjs')
    console.error('   O crea las tablas manualmente en Supabase Dashboard')
    console.error('\n   Error:', checkError.message)
    process.exit(1)
  }

  // Insertar datos
  const { data, error } = await supabase
    .from('ml_forecast_predictions')
    .upsert(forecasts, { onConflict: 'sku,week' })

  if (error) {
    console.error('❌ Error al insertar:', error.message)
    process.exit(1)
  }

  console.log(`✅ Insertados ${forecasts.length} registros de forecast`)
  console.log(`   SKUs: ${skus.join(', ')}`)
  console.log(`   Semanas: 8 por SKU (${forecasts.length / skus.length} cada uno)`)
  console.log('\n🎯 Ahora puedes ver /videndum/ml-forecast\n')

} catch (e) {
  console.error('❌ Error:', e.message)
  process.exit(1)
}
