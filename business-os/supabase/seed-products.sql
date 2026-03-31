-- ============================================================
-- Seed: Productos del portafolio Stratoscore
-- Ejecutar DESPUÉS de la migración 005_business_os_agents.sql
-- ============================================================

INSERT INTO products (name, slug, type, status) VALUES
  ('Business OS', 'business-os', 'saas', 'development'),
  ('Videndum', 'videndum', 'saas', 'development'),
  ('Mobility', 'mobility', 'saas', 'development'),
  ('CleanXpress', 'cleanxpress', 'saas', 'production'),
  ('Finance OS', 'finance-os', 'saas', 'idea'),
  ('Agencia Automatización', 'agencia', 'agency', 'idea')
ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status;
