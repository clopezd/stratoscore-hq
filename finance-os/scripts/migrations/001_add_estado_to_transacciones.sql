-- ============================================================
-- Migración 001: Agregar campo estado a tabla transacciones
-- Fecha: 2026-03-04
-- Descripción: Permite registrar el estado de cada transacción
--              (pendiente, pagado, cancelado)
-- ============================================================

-- 1. Agregar columna estado con valor por defecto 'pagado'
ALTER TABLE transacciones
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pagado'
  CHECK (estado IN ('pendiente', 'pagado', 'cancelado'));

-- 2. Actualizar la transacción existente marcada como [PENDIENTE]
UPDATE transacciones
SET estado = 'pendiente',
    descripcion = REPLACE(descripcion, '[PENDIENTE] ', '')
WHERE descripcion LIKE '[PENDIENTE]%';

-- 3. Verificar resultado
SELECT id, tipo, monto, categoria, descripcion, estado, fecha_hora
FROM transacciones
ORDER BY created_at DESC
LIMIT 10;
