-- ============================================================
-- Business OS — Surveys para validación de ideas
-- ============================================================

-- Encuestas configurables
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  questions JSONB NOT NULL, -- array de preguntas con tipo y opciones
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Respuestas individuales
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) NOT NULL,
  answers JSONB NOT NULL, -- { "q1": "respuesta", "q2": ["opcion1","opcion2"], ... }
  contact TEXT, -- email o whatsapp opcional
  metadata JSONB, -- IP, user agent, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id, created_at);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);

-- Insertar la primera encuesta: validación de nicho
INSERT INTO surveys (title, description, slug, questions) VALUES (
  'Descubre tu herramienta de IA ideal',
  'Estamos creando soluciones de IA listas para usar para emprendedores y profesionales. Queremos entender qué necesitas.',
  'validacion-nicho-v1',
  '[
    {
      "id": "q1",
      "type": "multiple",
      "required": true,
      "question": "¿En qué área de tu negocio pierdes más tiempo o esfuerzo cada semana?",
      "options": ["Ventas y seguimiento de clientes", "Marketing y redes sociales", "Facturación y finanzas", "Atención al cliente", "Gestión de citas/reservas", "Reportes y análisis de datos", "Gestión de inventario"]
    },
    {
      "id": "q2",
      "type": "text",
      "required": true,
      "question": "¿Cuál es la tarea más repetitiva o frustrante en tu día a día laboral?"
    },
    {
      "id": "q3",
      "type": "multiple",
      "required": true,
      "question": "¿Qué te impide resolver estos problemas hoy?",
      "options": ["No sé qué herramientas existen", "Las que conozco son muy caras", "Son muy difíciles de configurar", "No tengo tiempo para aprender", "No sé programar"]
    },
    {
      "id": "q4",
      "type": "single",
      "required": true,
      "question": "¿En qué industria opera tu negocio?",
      "options": ["E-commerce / Tienda online", "Marketing / Agencia", "Servicios profesionales (legal, contable, consultoría)", "Salud / Bienestar", "Educación", "Restaurantes / Alimentos", "Inmobiliaria", "Tecnología"]
    },
    {
      "id": "q5",
      "type": "single",
      "required": true,
      "question": "¿Cuál es tu rol?",
      "options": ["Fundador / CEO", "Marketing", "Ventas", "Operaciones", "Freelancer"]
    },
    {
      "id": "q6",
      "type": "single",
      "required": true,
      "question": "Si existiera una herramienta de IA que resolviera tu problema principal y te ahorrara horas cada semana, ¿cuánto pagarías al mes?",
      "options": ["No pagaría", "Menos de $20 USD", "$20 - $50 USD", "$50 - $100 USD", "Más de $100 USD"]
    },
    {
      "id": "q7",
      "type": "single",
      "required": true,
      "question": "¿Qué tan urgente es resolver este problema para ti?",
      "options": ["1 — No es urgente", "2 — Puede esperar", "3 — Lo necesito pronto", "4 — Es prioridad", "5 — Lo necesito ya"]
    },
    {
      "id": "q8",
      "type": "single",
      "required": true,
      "question": "¿Te gustaría probar gratis la versión beta y darnos tu feedback?",
      "options": ["Sí, me interesa", "Tal vez, depende del producto", "No por ahora"]
    },
    {
      "id": "q9",
      "type": "text",
      "required": false,
      "question": "¿Tu email o WhatsApp para avisarte cuando esté listo?"
    }
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
