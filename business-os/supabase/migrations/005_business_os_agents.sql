-- ============================================================
-- Business OS — Schema para sistema de 10 agentes
-- Stratoscore · 2026-03-29
-- ============================================================

-- Productos del portafolio
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('saas', 'agency')),
  db_connection_string TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Snapshots de métricas (NUNCA borrar)
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  metric_key TEXT NOT NULL,
  value NUMERIC NOT NULL,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, metric_key, snapshot_date)
);

-- Reportes de agentes
CREATE TABLE IF NOT EXISTS agent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT NOT NULL,
  report_type TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alertas
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info')),
  product_id UUID REFERENCES products(id),
  message TEXT NOT NULL,
  data JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diario de negocio (NUNCA borrar)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE UNIQUE DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  summary TEXT,
  metrics_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Acciones diarias del CEO
CREATE TABLE IF NOT EXISTS daily_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_date DATE DEFAULT CURRENT_DATE,
  action TEXT NOT NULL,
  priority INTEGER,
  urgent BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Goals estratégicos
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_metric TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  product_id UUID REFERENCES products(id),
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Archivo de goals completados
CREATE TABLE IF NOT EXISTS goals_archive (
  LIKE goals INCLUDING ALL
);

-- Errores de colectores
CREATE TABLE IF NOT EXISTS collector_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  error_message TEXT NOT NULL,
  error_data JSONB,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Suscripciones operacionales
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  cost NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  product_id UUID REFERENCES products(id),
  renewal_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline de ventas (agencia)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  contact_email TEXT,
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'demo', 'proposal', 'closed_won', 'closed_lost')),
  value NUMERIC,
  currency TEXT DEFAULT 'MXN',
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingresos (para el CFO)
CREATE TABLE IF NOT EXISTS income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  category TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gastos (para el CFO)
CREATE TABLE IF NOT EXISTS expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  category TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reportes semanales del Estratega
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  content TEXT NOT NULL,
  metrics_comparison JSONB,
  projections JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_number, year)
);

-- ============================================================
-- Indexes para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_snapshots_product_date ON metrics_snapshots(product_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON metrics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity, resolved);
CREATE INDEX IF NOT EXISTS idx_reports_agent ON agent_reports(agent_slug, created_at);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_collector_errors_created ON collector_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_actions_date ON daily_actions(action_date);
CREATE INDEX IF NOT EXISTS idx_income_product_date ON income_entries(product_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_expense_product_date ON expense_entries(product_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date);

-- ============================================================
-- RLS (Row Level Security) - deshabilitado por defecto para agentes
-- Habilitar cuando se expongan APIs públicas
-- ============================================================
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
-- etc.
