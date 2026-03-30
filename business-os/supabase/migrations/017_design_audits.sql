-- CDO (Chief Design Officer) — Design Audits table
-- Stores design audit findings: branding, accessibility, design system, responsive, performance

CREATE TABLE IF NOT EXISTS design_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('branding', 'accessibility', 'design_system', 'responsive', 'performance', 'benchmark')),
  area TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  finding TEXT NOT NULL,
  recommendation TEXT,
  score SMALLINT CHECK (score IS NULL OR (score >= 1 AND score <= 10)),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_design_audits_resolved ON design_audits(resolved) WHERE resolved = false;
CREATE INDEX idx_design_audits_product ON design_audits(product_id);
CREATE INDEX idx_design_audits_type ON design_audits(audit_type);
CREATE INDEX idx_design_audits_severity ON design_audits(severity);

-- RLS
ALTER TABLE design_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on design_audits"
  ON design_audits
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read design_audits"
  ON design_audits
  FOR SELECT
  TO authenticated
  USING (true);
