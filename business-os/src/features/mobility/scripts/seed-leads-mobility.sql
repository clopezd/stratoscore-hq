-- 🧪 Datos de prueba para Mobility — Leads
-- Ejecutar en Supabase Dashboard: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql

-- Lead 1: Alta prioridad (ACV urgente)
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, diagnostico_tentativo, created_at)
VALUES (
  'María Urgente Test',
  '+50688887777',
  'maria.test@example.com',
  'Tuve un ACV hace 2 semanas y necesito rehabilitación urgente',
  'web',
  'nuevo',
  'ACV',
  NOW() - INTERVAL '2 minutes'
);

-- Lead 2: Media prioridad (post-operatorio)
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, diagnostico_tentativo, created_at)
VALUES (
  'Carlos Rodilla Test',
  '+50688886666',
  'carlos.test@example.com',
  'Operación de ligamento de rodilla hace 1 mes',
  'whatsapp',
  'nuevo',
  'Post-operatorio rodilla',
  NOW() - INTERVAL '3 minutes'
);

-- Lead 3: Baja prioridad (dolor crónico)
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, created_at)
VALUES (
  'Ana Consulta Test',
  '+50688885555',
  'ana.test@example.com',
  'Tengo dolor crónico de espalda y me interesa conocer opciones',
  'web',
  'nuevo',
  NOW() - INTERVAL '10 minutes'
);

-- Lead 4: Sin contactar (>5 min)
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, created_at)
VALUES (
  'Pedro Sin Respuesta Test',
  '+50688884444',
  'pedro.test@example.com',
  'Parkinson en etapa inicial, busco rehabilitación',
  'referido',
  'nuevo',
  NOW() - INTERVAL '30 minutes'
);

-- Lead 5: Frío (contactado hace 8 días sin conversión)
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, contactado_at, created_at)
VALUES (
  'Laura Fría Test',
  '+50688883333',
  'laura.test@example.com',
  'Rehabilitación post fractura de cadera',
  'telefono',
  'contactado',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '10 days'
);

-- Verificar inserción
SELECT
  nombre,
  telefono,
  estado,
  diagnostico_tentativo,
  fuente,
  EXTRACT(MINUTE FROM (NOW() - created_at)) AS minutos_desde_creacion
FROM leads_mobility
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
