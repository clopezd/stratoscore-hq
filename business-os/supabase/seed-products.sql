-- ============================================================
-- Seed: Productos del portafolio Stratoscore
-- Ejecutar DESPUÉS de la migración 005_business_os_agents.sql
-- ============================================================

INSERT INTO products (name, slug, type, status) VALUES
  ('Business OS', 'business-os', 'saas', 'active'),
  ('Videndum', 'videndum', 'saas', 'active'),
  ('Mobility', 'mobility', 'saas', 'active'),
  ('CleanXpress', 'cleanxpress', 'saas', 'active'),
  ('Finance OS', 'finance-os', 'saas', 'active'),
  ('Agencia Automatización', 'agencia', 'agency', 'active')
ON CONFLICT (slug) DO NOTHING;
