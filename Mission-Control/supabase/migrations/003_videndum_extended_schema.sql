-- =============================================================================
-- Migration 003: Videndum Extended Schema
-- Tables: order_intake, order_book, opportunities, opportunities_unfactored,
--         opportunities_history, global_inventory
-- View:   videndum_full_context (semantic layer para análisis IA)
-- =============================================================================

-- ── 1. order_intake ──────────────────────────────────────────────────────────
-- Pedidos nuevos confirmados por período y producto
CREATE TABLE IF NOT EXISTS public.order_intake (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS oi_uq
  ON public.order_intake (organization_id, part_number, COALESCE(catalog_type,'__'), year, COALESCE(month,0));
CREATE INDEX IF NOT EXISTS oi_part ON public.order_intake (part_number);
CREATE INDEX IF NOT EXISTS oi_time ON public.order_intake (year, month);

-- ── 2. order_book ─────────────────────────────────────────────────────────────
-- Backlog de pedidos confirmados aún no entregados
CREATE TABLE IF NOT EXISTS public.order_book (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ob_uq
  ON public.order_book (organization_id, part_number, COALESCE(catalog_type,'__'), year, COALESCE(month,0));
CREATE INDEX IF NOT EXISTS ob_part ON public.order_book (part_number);
CREATE INDEX IF NOT EXISTS ob_time ON public.order_book (year, month);

-- ── 3. opportunities ──────────────────────────────────────────────────────────
-- Pipeline comercial ponderado por probabilidad
CREATE TABLE IF NOT EXISTS public.opportunities (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  probability_pct NUMERIC(5,2),               -- % ponderación del pipeline
  stage           TEXT,                        -- etapa del ciclo de venta
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS opp_uq
  ON public.opportunities (organization_id, part_number, COALESCE(catalog_type,'__'), year, COALESCE(month,0));
CREATE INDEX IF NOT EXISTS opp_part ON public.opportunities (part_number);
CREATE INDEX IF NOT EXISTS opp_time ON public.opportunities (year, month);

-- ── 4. opportunities_unfactored ───────────────────────────────────────────────
-- Pipeline bruto sin ponderación (100% del valor nominal)
CREATE TABLE IF NOT EXISTS public.opportunities_unfactored (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS opu_uq
  ON public.opportunities_unfactored (organization_id, part_number, COALESCE(catalog_type,'__'), year, COALESCE(month,0));
CREATE INDEX IF NOT EXISTS opu_part ON public.opportunities_unfactored (part_number);
CREATE INDEX IF NOT EXISTS opu_time ON public.opportunities_unfactored (year, month);

-- ── 5. opportunities_history ──────────────────────────────────────────────────
-- Histórico de oportunidades cerradas (won/lost/cancelled)
-- FK → opportunities.id (nullable: histórico puede no tener opp activa)
CREATE TABLE IF NOT EXISTS public.opportunities_history (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  opportunity_id  UUID          REFERENCES public.opportunities(id) ON DELETE SET NULL,
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  status          TEXT          CHECK (status IN ('won','lost','cancelled','pending')),
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS opph_opp_id ON public.opportunities_history (opportunity_id);
CREATE INDEX IF NOT EXISTS opph_part   ON public.opportunities_history (part_number);
CREATE INDEX IF NOT EXISTS opph_time   ON public.opportunities_history (year, month);

-- ── 6. global_inventory ───────────────────────────────────────────────────────
-- Stock disponible por producto, almacén y período
CREATE TABLE IF NOT EXISTS public.global_inventory (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT          NOT NULL DEFAULT 'videndum',
  part_number     TEXT          NOT NULL,
  catalog_type    TEXT          CHECK (catalog_type IN ('INV','PKG')),
  year            SMALLINT      NOT NULL CHECK (year >= 2000),
  month           SMALLINT      CHECK (month BETWEEN 1 AND 12),
  quantity        NUMERIC(14,4) NOT NULL DEFAULT 0,
  warehouse       TEXT,
  location        TEXT,
  source_sheet    TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS gi_uq
  ON public.global_inventory (organization_id, part_number, COALESCE(catalog_type,'__'), year, COALESCE(month,0));
CREATE INDEX IF NOT EXISTS gi_part ON public.global_inventory (part_number);
CREATE INDEX IF NOT EXISTS gi_time ON public.global_inventory (year, month);

-- ── Migración inicial: order_intake desde videndum_records ───────────────────
INSERT INTO public.order_intake (organization_id, part_number, catalog_type, year, month, quantity, source_sheet)
SELECT tenant_id, part_number, catalog_type, year, month, quantity, source_sheet
FROM   public.videndum_records
WHERE  metric_type = 'order_intake'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Vista semántica: videndum_full_context
-- Une Revenue → Order Intake → Order Book → Opportunities → Inventory
-- Uso principal: contexto completo para análisis IA con un solo prompt
-- =============================================================================
CREATE OR REPLACE VIEW public.videndum_full_context AS
WITH
base AS (
  SELECT DISTINCT tenant_id AS organization_id, part_number, catalog_type, year, month
  FROM public.videndum_records WHERE metric_type = 'revenue'
),
rev AS (
  SELECT part_number, catalog_type, year, month, SUM(quantity) AS revenue_qty
  FROM public.videndum_records WHERE metric_type = 'revenue'
  GROUP BY part_number, catalog_type, year, month
),
oi AS (
  SELECT part_number, year, month, SUM(quantity) AS order_intake_qty
  FROM public.order_intake GROUP BY part_number, year, month
),
ob AS (
  SELECT part_number, catalog_type, year, month, SUM(quantity) AS order_book_qty
  FROM public.order_book GROUP BY part_number, catalog_type, year, month
),
opp AS (
  SELECT part_number, catalog_type, year, month,
         SUM(quantity) AS opportunities_qty,
         AVG(probability_pct) AS avg_probability_pct
  FROM public.opportunities GROUP BY part_number, catalog_type, year, month
),
opu AS (
  SELECT part_number, catalog_type, year, month, SUM(quantity) AS opp_unfactored_qty
  FROM public.opportunities_unfactored GROUP BY part_number, catalog_type, year, month
),
oph AS (
  SELECT part_number, catalog_type, year, month,
         SUM(CASE WHEN status = 'won'  THEN quantity ELSE 0 END) AS opp_won_qty,
         SUM(CASE WHEN status = 'lost' THEN quantity ELSE 0 END) AS opp_lost_qty
  FROM public.opportunities_history GROUP BY part_number, catalog_type, year, month
),
inv AS (
  SELECT part_number, catalog_type, year, month,
         SUM(quantity) AS inventory_qty, MAX(warehouse) AS warehouse
  FROM public.global_inventory GROUP BY part_number, catalog_type, year, month
)
SELECT
  b.organization_id,
  b.part_number,
  b.catalog_type,
  b.year,
  b.month,
  -- Ventas reales
  COALESCE(r.revenue_qty, 0)          AS revenue_qty,
  -- Demanda y backlog
  COALESCE(oi.order_intake_qty, 0)    AS order_intake_qty,
  COALESCE(ob.order_book_qty, 0)      AS order_book_qty,
  -- Pipeline comercial
  COALESCE(opp.opportunities_qty, 0)  AS opportunities_qty,
  opp.avg_probability_pct             AS avg_probability_pct,
  COALESCE(opu.opp_unfactored_qty, 0) AS opp_unfactored_qty,
  -- Win/Loss rate
  COALESCE(oph.opp_won_qty, 0)        AS opp_won_qty,
  COALESCE(oph.opp_lost_qty, 0)       AS opp_lost_qty,
  -- Inventario
  COALESCE(inv.inventory_qty, 0)      AS inventory_qty,
  inv.warehouse,
  -- Ratios derivados
  CASE WHEN COALESCE(r.revenue_qty, 0) > 0
       THEN ROUND((COALESCE(oi.order_intake_qty,0) / r.revenue_qty)::numeric, 3)
       ELSE NULL END                  AS book_to_bill,
  CASE WHEN COALESCE(opp.opportunities_qty,0) + COALESCE(opu.opp_unfactored_qty,0) > 0
       THEN ROUND((COALESCE(opp.opportunities_qty,0) /
            NULLIF(COALESCE(opp.opportunities_qty,0)+COALESCE(opu.opp_unfactored_qty,0),0)*100)::numeric,1)
       ELSE NULL END                  AS pipeline_factor_pct
FROM      base b
LEFT JOIN rev  r   ON b.part_number = r.part_number   AND b.catalog_type IS NOT DISTINCT FROM r.catalog_type   AND b.year = r.year AND b.month IS NOT DISTINCT FROM r.month
LEFT JOIN oi       ON b.part_number = oi.part_number                                                            AND b.year = oi.year AND b.month IS NOT DISTINCT FROM oi.month
LEFT JOIN ob       ON b.part_number = ob.part_number  AND b.catalog_type IS NOT DISTINCT FROM ob.catalog_type  AND b.year = ob.year AND b.month IS NOT DISTINCT FROM ob.month
LEFT JOIN opp      ON b.part_number = opp.part_number AND b.catalog_type IS NOT DISTINCT FROM opp.catalog_type AND b.year = opp.year AND b.month IS NOT DISTINCT FROM opp.month
LEFT JOIN opu      ON b.part_number = opu.part_number AND b.catalog_type IS NOT DISTINCT FROM opu.catalog_type AND b.year = opu.year AND b.month IS NOT DISTINCT FROM opu.month
LEFT JOIN oph      ON b.part_number = oph.part_number AND b.catalog_type IS NOT DISTINCT FROM oph.catalog_type AND b.year = oph.year AND b.month IS NOT DISTINCT FROM oph.month
LEFT JOIN inv      ON b.part_number = inv.part_number AND b.catalog_type IS NOT DISTINCT FROM inv.catalog_type AND b.year = inv.year AND b.month IS NOT DISTINCT FROM inv.month;

-- Comentario de uso:
-- SELECT * FROM videndum_full_context WHERE year = 2024 ORDER BY revenue_qty DESC LIMIT 20;
-- SELECT year, SUM(revenue_qty) AS rev, SUM(order_intake_qty) AS oi, SUM(opportunities_qty) AS pipeline FROM videndum_full_context WHERE month IS NULL GROUP BY year ORDER BY year;
