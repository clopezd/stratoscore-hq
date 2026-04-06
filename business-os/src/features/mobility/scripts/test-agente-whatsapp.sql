-- 🧪 Crear lead de prueba para probar agente de WhatsApp
-- IMPORTANTE: Reemplaza +50688882224 con TU número de WhatsApp

-- Borrar leads de prueba anteriores
DELETE FROM leads_mobility WHERE nombre LIKE '%Test%';

-- Crear lead nuevo con TU número (para que te llegue el mensaje)
INSERT INTO leads_mobility (
  nombre,
  telefono,
  email,
  mensaje,
  fuente,
  estado,
  diagnostico_tentativo,
  created_at
)
VALUES (
  'Carlos Mario Test',
  '+50688882224',  -- ← CAMBIA ESTO A TU NÚMERO
  'cmarioia@gmail.com',
  'Necesito información sobre rehabilitación con Lokomat para paciente con ACV',
  'web',
  'nuevo',
  'ACV',
  NOW() - INTERVAL '2 minutes'
);

-- Verificar que se creó
SELECT
  id,
  nombre,
  telefono,
  estado,
  diagnostico_tentativo,
  EXTRACT(MINUTE FROM (NOW() - created_at)) AS minutos_desde_creacion
FROM leads_mobility
WHERE nombre = 'Carlos Mario Test';
