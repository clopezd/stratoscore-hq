-- ============================================================
-- VERIFICAR Y ACTUALIZAR ROL DE USUARIO
-- ============================================================

-- 1. Ver tu perfil actual
SELECT id, email, role, created_at
FROM public.profiles
WHERE id = 'f758c458-5a5d-41cd-bc0d-e068534bea92';

-- 2. Ver TODOS los perfiles (para debugging)
SELECT id, email, role
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Actualizar tu rol a admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'f758c458-5a5d-41cd-bc0d-e068534bea92';

-- 4. Verificar que se aplicó el cambio
SELECT id, email, role
FROM public.profiles
WHERE id = 'f758c458-5a5d-41cd-bc0d-e068534bea92';
