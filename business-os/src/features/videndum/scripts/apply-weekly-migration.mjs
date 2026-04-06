import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  // Try loading from .env.local
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const statements = [
  `CREATE TABLE IF NOT EXISTS videndum_change_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT DEFAULT 'videndum',
    part_number TEXT NOT NULL,
    catalog_type TEXT,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    change_pct NUMERIC NOT NULL,
    previous_value NUMERIC,
    current_value NUMERIC,
    period TEXT,
    week_detected DATE NOT NULL DEFAULT CURRENT_DATE,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS videndum_production_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT DEFAULT 'videndum',
    week_start DATE NOT NULL,
    part_number TEXT NOT NULL,
    catalog_type TEXT,
    recommended_qty NUMERIC NOT NULL,
    adjusted_qty NUMERIC,
    adjustment_reason TEXT,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id),
    exported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, week_start, part_number)
  )`,
  `ALTER TABLE videndum_change_alerts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE videndum_production_plans ENABLE ROW LEVEL SECURITY`,
]

for (const sql of statements) {
  const { error } = await supabase.rpc('exec_raw_sql', { query_text: sql })
  if (error) {
    console.log(`Statement failed: ${error.message}`)
    console.log(`SQL: ${sql.slice(0, 80)}...`)
  } else {
    console.log(`OK: ${sql.slice(0, 60)}...`)
  }
}

console.log('\nDone. Now create RLS policies via Supabase Dashboard if needed.')
