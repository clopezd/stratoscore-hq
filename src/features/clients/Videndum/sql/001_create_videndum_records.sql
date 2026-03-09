-- ─── Videndum: tabla principal de registros ───────────────────────────────────
-- Compatible con PostgreSQL 13, 14 y 15+
-- Ejecutar en: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql/new

-- 1. Tabla principal
CREATE TABLE IF NOT EXISTS videndum_records (
  id            UUID          NOT NULL DEFAULT gen_random_uuid(),
  tenant_id     TEXT          NOT NULL DEFAULT 'videndum',
  part_number   TEXT          NOT NULL,
  catalog_type  TEXT          CHECK (catalog_type IN ('INV', 'PKG') OR catalog_type IS NULL),
  metric_type   TEXT          NOT NULL
                CHECK (metric_type IN (
                  'revenue', 'order_intake', 'order_book',
                  'opportunities', 'opportunities_unfact', 'opp_history'
                )),
  year          SMALLINT      NOT NULL CHECK (year >= 2000),
  month         SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity      NUMERIC(14,4) NOT NULL DEFAULT 0,
  source_sheet  TEXT,
  imported_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT videndum_records_pkey PRIMARY KEY (id)
);

-- 2. Índice único compatible con PG13/14/15
--    COALESCE reemplaza NULL por sentinels para que el índice funcione correctamente
CREATE UNIQUE INDEX IF NOT EXISTS videndum_records_unique
  ON videndum_records (
    part_number,
    COALESCE(catalog_type, '__null__'),
    metric_type,
    year,
    COALESCE(month, 0)
  );

-- 3. Índices analíticos
CREATE INDEX IF NOT EXISTS idx_vr_part       ON videndum_records (part_number);
CREATE INDEX IF NOT EXISTS idx_vr_metric     ON videndum_records (metric_type);
CREATE INDEX IF NOT EXISTS idx_vr_time       ON videndum_records (year, month);
CREATE INDEX IF NOT EXISTS idx_vr_analytical ON videndum_records (part_number, metric_type, year, month);

-- 4. Trigger updated_at
CREATE OR REPLACE FUNCTION update_videndum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_videndum_updated_at ON videndum_records;
CREATE TRIGGER trg_videndum_updated_at
  BEFORE UPDATE ON videndum_records
  FOR EACH ROW EXECUTE FUNCTION update_videndum_updated_at();

-- 5. Vista Revenue vs Order Intake
CREATE OR REPLACE VIEW videndum_rev_vs_intake AS
SELECT
  r.part_number,
  r.catalog_type,
  r.year,
  r.month,
  r.quantity                      AS revenue_qty,
  oi.quantity                     AS order_intake_qty,
  (r.quantity - oi.quantity)      AS delta
FROM videndum_records r
LEFT JOIN videndum_records oi
  ON  oi.part_number  = r.part_number
  AND oi.metric_type  = 'order_intake'
  AND oi.year         = r.year
  AND oi.month        IS NOT DISTINCT FROM r.month
WHERE r.metric_type = 'revenue';

-- 6. Verificación final — debe retornar las tablas/vistas creadas
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE tablename = 'videndum_records'
UNION ALL
SELECT schemaname, viewname, viewowner
FROM pg_views
WHERE viewname = 'videndum_rev_vs_intake';
