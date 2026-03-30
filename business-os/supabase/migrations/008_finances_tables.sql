-- ── Finanzas: Transacciones, Gastos Recurrentes, Cuentas ──────────────────

-- Cuentas bancarias
CREATE TABLE IF NOT EXISTS cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('debito', 'credito', 'efectivo')),
  balance_inicial NUMERIC(12,2) DEFAULT 0,
  fecha_corte TEXT DEFAULT '1',
  color TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'transferencia')),
  monto NUMERIC(12,2) NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT now(),
  cuenta TEXT NOT NULL,
  cuenta_destino TEXT,
  estado TEXT DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_cuenta ON transacciones(cuenta);

-- Gastos mensuales recurrentes
CREATE TABLE IF NOT EXISTS gastos_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_app TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC(12,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  cuenta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gastos anuales recurrentes
CREATE TABLE IF NOT EXISTS gastos_anuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_servicio TEXT NOT NULL,
  categoria TEXT NOT NULL,
  mes_de_cobro INTEGER NOT NULL CHECK (mes_de_cobro BETWEEN 1 AND 12),
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC(12,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  cuenta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin config (para useAdminConfig)
CREATE TABLE IF NOT EXISTS admin_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed cuentas iniciales
INSERT INTO cuentas (nombre, tipo, balance_inicial) VALUES
  ('Lavandería', 'debito', 0),
  ('Mobility', 'debito', 0),
  ('Seguros', 'debito', 0),
  ('Personal', 'debito', 0),
  ('Efectivo', 'efectivo', 0)
ON CONFLICT (nombre) DO NOTHING;
