-- ─── Videndum: vista MAPE por producto ────────────────────────────────────────
-- MAPE = Mean Absolute Percentage Error
-- Fórmula: avg( |revenue - order_intake| / |revenue| ) * 100  por producto × año
--
-- Interpretación:
--   MAPE = 0%   → Order Intake predijo Revenue perfectamente
--   MAPE < 10%  → Proyección excelente
--   MAPE 10–25% → Proyección aceptable
--   MAPE > 25%  → Alta desviación — revisar proceso de forecasting
--
-- Ejecutar en Supabase SQL Editor después de 001_create_videndum_records.sql

-- ─── 1. APE anual por producto (Absolute Percentage Error por período) ─────────
CREATE OR REPLACE VIEW videndum_mape AS
WITH yearly AS (
  -- Suma revenue y order_intake por producto + año (agrupa mensuales y anuales)
  SELECT
    r.part_number,
    r.catalog_type,
    r.year,
    SUM(r.quantity)   AS total_revenue,
    SUM(oi.quantity)  AS total_intake
  FROM videndum_records r
  LEFT JOIN videndum_records oi
    ON  oi.part_number  = r.part_number
    AND oi.metric_type  = 'order_intake'
    AND oi.year         = r.year
  WHERE r.metric_type = 'revenue'
  GROUP BY r.part_number, r.catalog_type, r.year
),
ape_per_year AS (
  SELECT
    part_number,
    catalog_type,
    year,
    total_revenue,
    COALESCE(total_intake, 0)  AS total_intake,
    CASE
      WHEN total_revenue <> 0 AND total_intake IS NOT NULL
        THEN ROUND(ABS(total_revenue - total_intake) / ABS(total_revenue) * 100, 2)
      ELSE NULL
    END AS ape
  FROM yearly
)
SELECT
  part_number,
  catalog_type,

  -- MAPE global del producto (promedio a través de todos los años con datos)
  ROUND(AVG(ape), 2)                                  AS mape,

  -- Detalle por año (util para sparkline en el frontend)
  JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'year',           year,
      'revenue',        total_revenue,
      'intake',         total_intake,
      'ape',            ape
    )
    ORDER BY year
  )                                                   AS yearly_detail,

  -- Totales acumulados
  SUM(total_revenue)                                  AS revenue_total,
  SUM(total_intake)                                   AS intake_total,
  ROUND(
    CASE WHEN SUM(total_revenue) <> 0
      THEN ABS(SUM(total_revenue) - SUM(total_intake)) / ABS(SUM(total_revenue)) * 100
      ELSE NULL
    END, 2
  )                                                   AS aggregate_error,

  COUNT(*) FILTER (WHERE ape IS NOT NULL)             AS periods_with_data,
  MIN(year)                                           AS year_from,
  MAX(year)                                           AS year_to

FROM ape_per_year
GROUP BY part_number, catalog_type
HAVING COUNT(*) FILTER (WHERE ape IS NOT NULL) > 0
ORDER BY mape DESC NULLS LAST;

COMMENT ON VIEW videndum_mape IS
  'MAPE (Mean Absolute Percentage Error) por producto. '
  'Compara revenue facturado contra order_intake como proxy de forecast. '
  'MAPE alto = el order book predice mal el revenue real.';
