-- ============================================================
-- Lavandería — Migración de base de datos
-- Compartida por laundry-app (cliente) y laundry-logistics (ops)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Clientes
CREATE TABLE IF NOT EXISTS laundry_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  default_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conductores / Repartidores
CREATE TABLE IF NOT EXISTS laundry_drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'moto',
  is_active BOOLEAN DEFAULT true,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Servicios disponibles
CREATE TABLE IF NOT EXISTS laundry_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,       -- wash_fold, wash_iron, dry_clean, iron_only, special
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Pedidos
CREATE TABLE IF NOT EXISTS laundry_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES laundry_customers(id) ON DELETE CASCADE,
  assigned_driver_id UUID REFERENCES laundry_drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','pickup','received','washing','drying','folding','ready','delivering','delivered','cancelled')),
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_date TIMESTAMPTZ NOT NULL,
  delivery_date TIMESTAMPTZ,
  total_price NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ítems del pedido
CREATE TABLE IF NOT EXISTS laundry_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES laundry_orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES laundry_services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  description TEXT
);

-- Historial de cambios de estado
CREATE TABLE IF NOT EXISTS laundry_order_status_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES laundry_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- ── Índices ──
CREATE INDEX IF NOT EXISTS idx_orders_customer ON laundry_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON laundry_orders(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON laundry_orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON laundry_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_status_log_order ON laundry_order_status_log(order_id);

-- ── RLS (Row Level Security) ──
ALTER TABLE laundry_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_order_status_log ENABLE ROW LEVEL SECURITY;

-- Clientes solo ven sus propios datos
CREATE POLICY "customers_own_data" ON laundry_customers
  FOR ALL USING (auth.uid() = user_id);

-- Clientes solo ven sus propios pedidos
CREATE POLICY "customers_own_orders" ON laundry_orders
  FOR ALL USING (
    customer_id IN (SELECT id FROM laundry_customers WHERE user_id = auth.uid())
  );

-- Ítems visibles si el pedido es visible
CREATE POLICY "items_follow_order" ON laundry_order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM laundry_orders WHERE customer_id IN (
        SELECT id FROM laundry_customers WHERE user_id = auth.uid()
      )
    )
  );

-- Conductores ven sus propios datos
CREATE POLICY "drivers_own_data" ON laundry_drivers
  FOR ALL USING (auth.uid() = user_id);

-- Status log visible para dueños del pedido
CREATE POLICY "status_log_follow_order" ON laundry_order_status_log
  FOR ALL USING (
    order_id IN (
      SELECT id FROM laundry_orders WHERE customer_id IN (
        SELECT id FROM laundry_customers WHERE user_id = auth.uid()
      )
    )
  );

-- ── Datos iniciales de servicios ──
INSERT INTO laundry_services (code, name, description, unit_price) VALUES
  ('wash_fold', 'Lavado y Doblado', 'Lavado completo con doblado profesional', 5000),
  ('wash_iron', 'Lavado y Planchado', 'Lavado completo con planchado', 7000),
  ('dry_clean', 'Limpieza en Seco', 'Para prendas delicadas y trajes', 12000),
  ('iron_only', 'Solo Planchado', 'Planchado profesional', 3000),
  ('special', 'Servicio Especial', 'Edredones, cortinas, tapicería', 15000)
ON CONFLICT (code) DO NOTHING;

-- ── Trigger para updated_at ──
CREATE OR REPLACE FUNCTION update_laundry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON laundry_orders
  FOR EACH ROW EXECUTE FUNCTION update_laundry_updated_at();

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON laundry_customers
  FOR EACH ROW EXECUTE FUNCTION update_laundry_updated_at();
