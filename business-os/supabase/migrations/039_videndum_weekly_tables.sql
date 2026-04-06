-- Videndum MVP Operativo: Tablas para cambios detectados y planes de producción

-- Alertas de cambios detectados
CREATE TABLE IF NOT EXISTS videndum_change_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT DEFAULT 'videndum',
  part_number TEXT NOT NULL,
  catalog_type TEXT,
  alert_type TEXT NOT NULL, -- 'DEMAND_SPIKE', 'DEMAND_DROP', 'ACCURACY_DEGRADATION'
  severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM'
  change_pct NUMERIC NOT NULL,
  previous_value NUMERIC,
  current_value NUMERIC,
  period TEXT, -- 'Feb vs Ene 2026'
  week_detected DATE NOT NULL DEFAULT CURRENT_DATE,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan de producción semanal
CREATE TABLE IF NOT EXISTS videndum_production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT DEFAULT 'videndum',
  week_start DATE NOT NULL,
  part_number TEXT NOT NULL,
  catalog_type TEXT,
  recommended_qty NUMERIC NOT NULL,
  adjusted_qty NUMERIC,
  adjustment_reason TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'exported'
  approved_by UUID REFERENCES auth.users(id),
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start, part_number)
);

-- RLS
ALTER TABLE videndum_change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videndum_production_plans ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/write
CREATE POLICY "Authenticated users can read alerts" ON videndum_change_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert alerts" ON videndum_change_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts" ON videndum_change_alerts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read plans" ON videndum_production_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert plans" ON videndum_production_plans
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update plans" ON videndum_production_plans
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_change_alerts_tenant_date ON videndum_change_alerts(tenant_id, week_detected DESC);
CREATE INDEX IF NOT EXISTS idx_change_alerts_part ON videndum_change_alerts(part_number);
CREATE INDEX IF NOT EXISTS idx_production_plans_tenant_week ON videndum_production_plans(tenant_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_production_plans_part ON videndum_production_plans(part_number);
