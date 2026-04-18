-- Advanced Analytics Module - Database Schema
-- RLS enabled for multi-tenancy

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS advanced_analytics_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  power_bi_workspace_id TEXT,
  power_bi_report_ids TEXT[] DEFAULT '{}',
  UNIQUE(tenant_id)
);

-- 2. Analysis requests table
CREATE TABLE IF NOT EXISTS analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  data_source TEXT NOT NULL CHECK (data_source IN ('power_bi', 'custom_data')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  analysis TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 3. Automated reports table
CREATE TABLE IF NOT EXISTS automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  last_generated TIMESTAMP WITH TIME ZONE,
  next_scheduled TIMESTAMP WITH TIME ZONE NOT NULL,
  template TEXT NOT NULL CHECK (template IN ('sales', 'operations', 'finance', 'custom')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS)

-- Subscriptions RLS
ALTER TABLE advanced_analytics_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's subscription"
  ON advanced_analytics_subscriptions
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can modify subscriptions"
  ON advanced_analytics_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND tenant_id = advanced_analytics_subscriptions.tenant_id
      AND role = 'admin'
    )
  );

-- Analysis requests RLS
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's analysis requests"
  ON analysis_requests
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert their own analysis requests"
  ON analysis_requests
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Automated reports RLS
ALTER TABLE automated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's automated reports"
  ON automated_reports
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can manage automated reports"
  ON automated_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND tenant_id = automated_reports.tenant_id
      AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON advanced_analytics_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON advanced_analytics_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_tenant_id ON analysis_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON analysis_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_automated_reports_tenant_id ON automated_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_next_scheduled ON automated_reports(next_scheduled);
