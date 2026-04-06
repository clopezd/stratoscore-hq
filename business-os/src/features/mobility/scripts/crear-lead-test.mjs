#!/usr/bin/env node
/**
 * Crear lead de prueba en Supabase para testing de WhatsApp
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://csiiulvqzkgijxbgdqcv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo'

const supabase = createClient(supabaseUrl, supabaseKey)

// Número de teléfono (cambia esto a tu número)
const tuNumero = process.argv[2] || '+50688882224'

console.log('🔄 Creando lead de prueba...')
console.log(`📱 Número: ${tuNumero}`)

// Borrar leads de prueba previos
await supabase.from('leads_mobility').delete().ilike('nombre', '%Test%')

// Crear nuevo lead con estructura correcta
const { data, error } = await supabase
  .from('leads_mobility')
  .insert({
    nombre: 'Carlos Mario Test',
    telefono: tuNumero,
    email: 'cmarioia@gmail.com',
    diagnostico_preliminar: 'Paciente con ACV reciente que necesita rehabilitación con Lokomat urgente',
    fuente: 'web',
    estado: 'nuevo',
    notas: 'Lead de prueba para testing de agente de WhatsApp',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // Hace 2 min
  })
  .select()

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log('✅ Lead creado exitosamente!')
console.log(data)

console.log('\n📤 Ahora ejecuta el agente:')
console.log('curl -X POST http://localhost:3000/api/mobility/agents -H "Content-Type: application/json" -d \'{"agent":"acquisition"}\'')
