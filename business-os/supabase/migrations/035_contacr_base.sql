-- ══ ContaCR: Sistema Contable para Costa Rica ══

-- Empresas que maneja cada contador
CREATE TABLE contacr_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  cedula_juridica TEXT,
  tipo_persona TEXT DEFAULT 'juridica' CHECK (tipo_persona IN ('fisica', 'juridica')),
  actividad_economica TEXT,
  moneda TEXT DEFAULT 'CRC',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Plan de cuentas jerárquico
CREATE TABLE contacr_cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES contacr_empresas(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('activo','pasivo','patrimonio','ingreso','gasto','costo')),
  naturaleza TEXT NOT NULL CHECK (naturaleza IN ('deudora','acreedora')),
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 4),
  padre_id UUID REFERENCES contacr_cuentas(id),
  acepta_movimientos BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

-- Movimientos importados (tabla simple para MVP, sin partida doble)
CREATE TABLE contacr_movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES contacr_empresas(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso','gasto')),
  categoria TEXT,
  monto NUMERIC(15,2) NOT NULL CHECK (monto > 0),
  referencia TEXT,
  cuenta_codigo TEXT,
  origen TEXT DEFAULT 'csv',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Template del plan de cuentas estándar CR (se copia al crear empresa)
CREATE TABLE contacr_cuentas_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('activo','pasivo','patrimonio','ingreso','gasto','costo')),
  naturaleza TEXT NOT NULL CHECK (naturaleza IN ('deudora','acreedora')),
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 4),
  padre_codigo TEXT,
  acepta_movimientos BOOLEAN DEFAULT false
);

-- Índices
CREATE INDEX idx_contacr_empresas_tenant ON contacr_empresas(tenant_id);
CREATE INDEX idx_contacr_movimientos_empresa ON contacr_movimientos(empresa_id);
CREATE INDEX idx_contacr_movimientos_fecha ON contacr_movimientos(fecha);
CREATE INDEX idx_contacr_movimientos_tipo ON contacr_movimientos(tipo);
CREATE INDEX idx_contacr_cuentas_empresa ON contacr_cuentas(empresa_id);
CREATE INDEX idx_contacr_cuentas_codigo ON contacr_cuentas(codigo);

-- RLS
ALTER TABLE contacr_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacr_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacr_movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacr_empresas_owner" ON contacr_empresas FOR ALL
  USING (tenant_id::text = (SELECT auth.uid())::text);
CREATE POLICY "contacr_cuentas_owner" ON contacr_cuentas FOR ALL
  USING (tenant_id::text = (SELECT auth.uid())::text);
CREATE POLICY "contacr_movimientos_owner" ON contacr_movimientos FOR ALL
  USING (tenant_id::text = (SELECT auth.uid())::text);
