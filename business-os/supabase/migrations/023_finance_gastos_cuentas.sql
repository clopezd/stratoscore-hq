-- ══════════════════════════════════════════════════════════════
-- FINANCE OS — Tablas complementarias (gastos mensuales, anuales, cuentas)
-- ══════════════════════════════════════════════════════════════
-- Estas tablas fueron creadas manualmente en Supabase.
-- Esta migración documenta su esquema para mantener paridad código-BD.
-- ══════════════════════════════════════════════════════════════

-- Gastos mensuales (suscripciones: Netflix, Spotify, SaaS, etc.)
CREATE TABLE IF NOT EXISTS public.gastos_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_app TEXT NOT NULL,
  categoria TEXT,
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC(12, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  cuenta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_mensuales_activo ON public.gastos_mensuales(activo);
CREATE INDEX IF NOT EXISTS idx_gastos_mensuales_dia ON public.gastos_mensuales(dia_de_cobro);

-- Gastos anuales (seguros, dominios, licencias anuales, etc.)
CREATE TABLE IF NOT EXISTS public.gastos_anuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_servicio TEXT NOT NULL,
  categoria TEXT,
  mes_de_cobro INTEGER NOT NULL CHECK (mes_de_cobro BETWEEN 1 AND 12),
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC(12, 2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  cuenta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_anuales_activo ON public.gastos_anuales(activo);
CREATE INDEX IF NOT EXISTS idx_gastos_anuales_mes ON public.gastos_anuales(mes_de_cobro);

-- Cuentas bancarias / billeteras
CREATE TABLE IF NOT EXISTS public.cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'debito' CHECK (tipo IN ('debito', 'credito', 'efectivo')),
  balance_inicial NUMERIC(12, 2) DEFAULT 0,
  fecha_corte TEXT,
  color TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuentas_activa ON public.cuentas(activa);

-- RLS policies
ALTER TABLE public.gastos_mensuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_anuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;

-- Service role: acceso total
DO $$ BEGIN
  DROP POLICY IF EXISTS "service_role_gastos_mensuales" ON public.gastos_mensuales;
  CREATE POLICY "service_role_gastos_mensuales" ON public.gastos_mensuales FOR ALL TO service_role USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "service_role_gastos_anuales" ON public.gastos_anuales;
  CREATE POLICY "service_role_gastos_anuales" ON public.gastos_anuales FOR ALL TO service_role USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "service_role_cuentas" ON public.cuentas;
  CREATE POLICY "service_role_cuentas" ON public.cuentas FOR ALL TO service_role USING (true) WITH CHECK (true);
END $$;

-- Authenticated users: CRUD completo (finanzas personales, no multi-tenant)
DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_gastos_mensuales" ON public.gastos_mensuales;
  CREATE POLICY "auth_gastos_mensuales" ON public.gastos_mensuales FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_gastos_anuales" ON public.gastos_anuales;
  CREATE POLICY "auth_gastos_anuales" ON public.gastos_anuales FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_cuentas" ON public.cuentas;
  CREATE POLICY "auth_cuentas" ON public.cuentas FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;

SELECT 'Finance OS complementary tables migration created successfully.' AS status;
