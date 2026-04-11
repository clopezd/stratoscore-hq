-- StratosCore — RLS Audit Script
-- Ejecutar en Supabase SQL Editor para verificar que todas las tablas tienen RLS activo.
-- Cualquier tabla en la columna "tables_without_rls" es un riesgo de seguridad.
--
-- Ultima actualizacion: 2026-04-10

-- 1. Tablas SIN RLS activo (RIESGO)
SELECT
  schemaname,
  tablename,
  'NO RLS' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_prisma_%'
  AND tablename NOT IN (
    SELECT tablename
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND c.relrowsecurity = true
  )
ORDER BY tablename;

-- 2. Tablas CON RLS activo (OK)
SELECT
  t.tablename,
  'RLS ACTIVE' as status,
  count(p.polname) as policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true
GROUP BY t.tablename
ORDER BY t.tablename;

-- 3. Detalle de policies por tabla
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Resumen ejecutivo
SELECT
  'Total tablas public' as metric,
  count(*)::text as value
FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%'
UNION ALL
SELECT
  'Tablas con RLS',
  count(*)::text
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
WHERE t.schemaname = 'public' AND c.relrowsecurity = true
UNION ALL
SELECT
  'Tablas SIN RLS',
  count(*)::text
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
WHERE t.schemaname = 'public' AND c.relrowsecurity = false AND t.tablename NOT LIKE 'pg_%';
