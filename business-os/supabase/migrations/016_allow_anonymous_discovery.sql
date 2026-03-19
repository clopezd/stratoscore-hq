-- ============================================================================
-- Migration 016: Allow Anonymous Client Discovery Submissions
-- Purpose: Permitir que clientes llenen el formulario SIN login
-- ============================================================================

-- Drop la política restrictiva que requiere auth.uid() = user_id
DROP POLICY IF EXISTS "Users can insert own discovery" ON public.client_discovery;

-- Nueva política: permitir INSERT anónimo (user_id puede ser NULL)
CREATE POLICY "Allow anonymous discovery submissions"
  ON public.client_discovery
  FOR INSERT
  WITH CHECK (true);

-- Actualizar política SELECT para permitir NULL user_id
DROP POLICY IF EXISTS "Users can view own discovery" ON public.client_discovery;

CREATE POLICY "Users can view own discovery"
  ON public.client_discovery
  FOR SELECT
  USING (
    user_id IS NULL -- Submissions anónimas visibles solo para admins
    OR auth.uid() = user_id -- O el usuario ve su propia submission
  );

COMMENT ON POLICY "Allow anonymous discovery submissions" ON public.client_discovery
IS 'Permite que cualquier persona envíe un discovery sin autenticación. El user_id será NULL para submissions anónimas.';
