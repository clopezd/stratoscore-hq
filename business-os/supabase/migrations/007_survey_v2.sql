-- Actualizar encuesta v1 con preguntas para ambos perfiles
UPDATE surveys SET active = false WHERE slug = 'validacion-nicho-v1';

INSERT INTO surveys (title, description, slug, questions) VALUES (
  'Encuentra tu solución de IA ideal',
  'Estamos creando herramientas de IA listas para usar. Ya sea que tengas un negocio o quieras emprender, queremos entender qué necesitas.',
  'validacion-nicho-v2',
  '[
    {
      "id": "q0",
      "type": "single",
      "required": true,
      "question": "¿Cuál describe mejor tu situación actual?",
      "options": ["Ya tengo un negocio y quiero optimizarlo con IA", "Quiero emprender pero no sé por dónde empezar", "Tengo una idea de negocio pero no tengo el producto/herramienta", "Quiero generar ingresos extras pero no sé cómo"]
    },
    {
      "id": "q1",
      "type": "multiple",
      "required": true,
      "question": "¿En qué área sientes que pierdes más tiempo o no sabes cómo avanzar?",
      "options": ["Ventas y conseguir clientes", "Marketing y redes sociales", "Facturación y finanzas", "Atención al cliente", "Gestión de citas/reservas", "Crear un producto o servicio digital", "Encontrar un nicho rentable", "Automatizar tareas repetitivas"]
    },
    {
      "id": "q2",
      "type": "text",
      "required": true,
      "question": "Si pudieras resolver UN solo problema con IA mañana, ¿cuál sería?"
    },
    {
      "id": "q3",
      "type": "multiple",
      "required": true,
      "question": "¿Qué te frena hoy para resolver ese problema?",
      "options": ["No sé qué herramientas existen", "Las que conozco son muy caras", "Son muy difíciles de usar", "No tengo tiempo para aprender", "No sé programar", "No sé por dónde empezar", "No tengo capital para invertir"]
    },
    {
      "id": "q4",
      "type": "single",
      "required": true,
      "question": "¿En qué industria operas o te gustaría emprender?",
      "options": ["E-commerce / Tienda online", "Marketing / Agencia", "Servicios profesionales (legal, contable, consultoría)", "Salud / Bienestar", "Educación / Cursos", "Restaurantes / Alimentos", "Inmobiliaria", "Tecnología", "Todavía no lo tengo definido"]
    },
    {
      "id": "q5",
      "type": "single",
      "required": true,
      "question": "¿Cuál es tu rol actual?",
      "options": ["Fundador / CEO", "Empleado que quiere emprender", "Freelancer", "Estudiante", "Buscando mi primer negocio"]
    },
    {
      "id": "q6",
      "type": "single",
      "required": true,
      "question": "Si existiera una herramienta de IA lista para usar que te ayudara a resolver tu problema o lanzar tu negocio, ¿cuánto pagarías al mes?",
      "options": ["No pagaría", "Menos de $20 USD", "$20 - $50 USD", "$50 - $100 USD", "Más de $100 USD"]
    },
    {
      "id": "q7",
      "type": "single",
      "required": true,
      "question": "¿Qué tan urgente es resolver esto para ti?",
      "options": ["1 — No es urgente", "2 — Puede esperar", "3 — Lo necesito pronto", "4 — Es prioridad", "5 — Lo necesito ya"]
    },
    {
      "id": "q8",
      "type": "single",
      "required": true,
      "question": "¿Qué preferirías?",
      "options": ["Una herramienta lista que yo solo use y venda", "Una herramienta que me ayude a crear mi propio producto", "Ambas — depende del caso"]
    },
    {
      "id": "q9",
      "type": "single",
      "required": true,
      "question": "¿Te gustaría probar gratis la versión beta?",
      "options": ["Sí, me interesa", "Tal vez, depende del producto", "No por ahora"]
    },
    {
      "id": "q10",
      "type": "text",
      "required": false,
      "question": "¿Tu email o WhatsApp para avisarte cuando esté listo?"
    }
  ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
