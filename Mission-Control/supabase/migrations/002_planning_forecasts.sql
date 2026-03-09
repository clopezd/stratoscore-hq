-- planning_forecasts
-- Forecast de producción por part number, año y mes
-- Fuente: Historico Vent Mod.xlsx → pestaña 'Forecast Production'

CREATE TABLE IF NOT EXISTS public.planning_forecasts (
  id           bigserial PRIMARY KEY,
  tenant_id    text        NOT NULL DEFAULT 'videndum',
  part_number  text        NOT NULL,
  year         int         NOT NULL,
  month        int         NOT NULL,  -- 1-12
  quantity     numeric     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS planning_forecasts_uq
  ON public.planning_forecasts (tenant_id, part_number, year, month);

CREATE INDEX IF NOT EXISTS planning_forecasts_year_month
  ON public.planning_forecasts (year, month);

CREATE INDEX IF NOT EXISTS planning_forecasts_part
  ON public.planning_forecasts (part_number);

COMMENT ON TABLE public.planning_forecasts IS
  'Forecast de producción mensual por part number (2024-2028). Fuente: Forecast Production sheet.';
