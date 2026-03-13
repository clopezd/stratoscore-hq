-- ============================================================
-- Migración: tablas de Lavandería Carlos en StratosCore
-- Proyecto: csiiulvqzkgijxbgdqcv
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Agregar columna 'role' a profiles si no existe ────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT NULL;

-- ── 2. cc_orders — Pedidos C&C Clean Express (clientes) ──────
CREATE TABLE IF NOT EXISTS public.cc_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  bags_count  INT  NOT NULL CHECK (bags_count > 0),
  pickup_day  TEXT NOT NULL,
  pickup_time TEXT NOT NULL CHECK (pickup_time IN ('AM', 'PM')),
  status      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (status IN ('pendiente','recogido','en_preparacion','en_camino','entregado')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS cc_orders_user_id_idx ON public.cc_orders (user_id);
CREATE INDEX IF NOT EXISTS cc_orders_created_at_idx ON public.cc_orders (created_at DESC);

-- ── 3. order_leads — Pedidos recepción presencial ─────────────
CREATE TABLE IF NOT EXISTS public.order_leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT    NOT NULL,
  bags_quantity INT    NOT NULL CHECK (bags_quantity > 0),
  pickup_day   TEXT    NOT NULL,
  total        NUMERIC NOT NULL CHECK (total >= 0),
  status       TEXT    NOT NULL DEFAULT 'pendiente'
               CHECK (status IN ('pendiente','listo','entregado')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_leads_created_at_idx ON public.order_leads (created_at DESC);

-- ── 4. access_codes — Códigos de registro por invitación ─────
CREATE TABLE IF NOT EXISTS public.access_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT NOT NULL UNIQUE,
  is_used    BOOLEAN NOT NULL DEFAULT false,
  used_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS access_codes_code_idx ON public.access_codes (code);

-- ── 5. insumos — Catálogo de insumos de inventario ───────────
CREATE TABLE IF NOT EXISTS public.insumos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  unidad_medida TEXT NOT NULL DEFAULT 'unidad',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. movimientos_inventario — Movimientos de stock ─────────
CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id  UUID NOT NULL REFERENCES public.insumos(id) ON DELETE CASCADE,
  origen     TEXT CHECK (origen IN ('Bodega','Vestidores','Consultorios','Lavandería (Propia)')),
  destino    TEXT CHECK (destino IN ('Bodega','Vestidores','Consultorios','Lavandería (Propia)')),
  cantidad   INT NOT NULL CHECK (cantidad > 0),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET DEFAULT,
  notas      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movimientos_insumo_idx ON public.movimientos_inventario (insumo_id);
CREATE INDEX IF NOT EXISTS movimientos_created_at_idx ON public.movimientos_inventario (created_at DESC);

-- ── 7. stock_por_ubicacion — Vista de stock calculado ────────
CREATE OR REPLACE VIEW public.stock_por_ubicacion AS
SELECT
  m.insumo_id,
  i.nombre  AS insumo_nombre,
  ubic.ubicacion,
  COALESCE(SUM(
    CASE
      WHEN m.destino = ubic.ubicacion THEN m.cantidad
      WHEN m.origen  = ubic.ubicacion THEN -m.cantidad
      ELSE 0
    END
  ), 0) AS cantidad
FROM
  (VALUES
    ('Bodega'),
    ('Vestidores'),
    ('Consultorios'),
    ('Lavandería (Propia)')
  ) AS ubic(ubicacion)
  CROSS JOIN public.insumos i
  LEFT JOIN public.movimientos_inventario m
    ON m.insumo_id = i.id
    AND (m.origen = ubic.ubicacion OR m.destino = ubic.ubicacion)
GROUP BY m.insumo_id, i.nombre, ubic.ubicacion
HAVING COALESCE(SUM(
  CASE
    WHEN m.destino = ubic.ubicacion THEN m.cantidad
    WHEN m.origen  = ubic.ubicacion THEN -m.cantidad
    ELSE 0
  END
), 0) > 0
   OR m.insumo_id IS NOT NULL;

-- ── 8. RLS — Row Level Security ───────────────────────────────

-- cc_orders: clientes ven sus propios pedidos; staff ve todos
ALTER TABLE public.cc_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus propios pedidos" ON public.cc_orders;
CREATE POLICY "Usuarios ven sus propios pedidos"
  ON public.cc_orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

DROP POLICY IF EXISTS "Usuarios crean sus propios pedidos" ON public.cc_orders;
CREATE POLICY "Usuarios crean sus propios pedidos"
  ON public.cc_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff actualiza estado pedidos" ON public.cc_orders;
CREATE POLICY "Staff actualiza estado pedidos"
  ON public.cc_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- order_leads: solo staff
ALTER TABLE public.order_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona order_leads" ON public.order_leads;
CREATE POLICY "Staff gestiona order_leads"
  ON public.order_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- access_codes: solo admin
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin gestiona access_codes" ON public.access_codes;
CREATE POLICY "Admin gestiona access_codes"
  ON public.access_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- insumos: staff puede leer y crear
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona insumos" ON public.insumos;
CREATE POLICY "Staff gestiona insumos"
  ON public.insumos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- movimientos_inventario: staff
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona movimientos" ON public.movimientos_inventario;
CREATE POLICY "Staff gestiona movimientos"
  ON public.movimientos_inventario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- ── 9. Realtime — habilitar para live updates ─────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.cc_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movimientos_inventario;

-- ── 10. Asignar rol admin al owner ────────────────────────────
-- Cambia este UUID por el tuyo si es diferente
UPDATE public.profiles
  SET role = 'admin'
  WHERE id = 'f758c458-5a5d-41cd-bc0d-e068534bea92'
    AND (role IS NULL OR role != 'admin');
