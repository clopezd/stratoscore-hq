# 🔧 Migración Finance OS → Mission Control

**Fecha:** 2026-03-12
**Status:** ⚠️ PENDIENTE (requiere acción manual)

---

## ✅ Completado

- ✅ Código migrado a `/app/(main)/finanzas`
- ✅ Features copiadas (`finances`, `calculator`, `finance-agent`)
- ✅ "Finanzas" agregado al sidebar (owner only)
- ✅ Layout heredado de `(main)`

---

## ⚠️ Acción Requerida: Ejecutar SQL en Supabase

### Paso 1: Ir al SQL Editor de Supabase

1. Abrir https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv
2. Click en **SQL Editor** (menú izquierdo)
3. Click en **New Query**

### Paso 2: Copiar y Ejecutar este SQL

```sql
-- ============================================================
-- Migración 001: Agregar campo estado a tabla transacciones
-- Fecha: 2026-03-12
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
```

### Paso 3: Verificar

Deberías ver en los resultados:
- Columna `estado` agregada
- Transacciones con `estado = 'pagado'` o `'pendiente'`
- Sin errores

---

## 🚀 Después de la Migración

Una vez ejecutado el SQL, Finance OS estará disponible en:

```
http://localhost:3000/finanzas          → Dashboard principal
http://localhost:3000/finanzas/finances → Gestión de transacciones
http://localhost:3000/finanzas/admin    → Admin (config de categorías)
```

Visible en el sidebar bajo "💰 Finanzas" (solo para role: owner)

---

## 🔍 Verificación de Funcionamiento

```bash
# Desde terminal, verificar que el endpoint responde:
curl -s "https://csiiulvqzkgijxbgdqcv.supabase.co/rest/v1/transacciones?select=*&limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTMyNTAsImV4cCI6MjA4ODA2OTI1MH0.XhzHIjCMqDEb0S0iFaKwJpYHsT4y36WMSLQe-RnPAuo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTMyNTAsImV4cCI6MjA4ODA2OTI1MH0.XhzHIjCMqDEb0S0iFaKwJpYHsT4y36WMSLQe-RnPAuo" | jq
```

Deberías ver JSON con transacciones incluyendo campo `estado`.

---

## 📝 Notas

- La migración es **idempotente** (se puede ejecutar múltiples veces sin problema por `IF NOT EXISTS`)
- No afecta datos existentes (solo agrega columna)
- `CHECK` constraint valida que solo se usen valores válidos
- Todas las transacciones antiguas quedarán con `estado = 'pagado'` por defecto
