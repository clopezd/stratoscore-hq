-- ── Memories: Sistema de memorias del dueño ──────────────────────────────

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'identidad', 'tono', 'contexto', 'vocabulario', 'ejemplo_post',
    'logro', 'proyecto', 'aprendizaje', 'contacto', 'otro'
  )),
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_active ON memories(active);

-- ── Seed: Memorias iniciales de Carlos Mario ─────────────────────────────

INSERT INTO memories (category, content, source) VALUES
  -- Identidad
  ('identidad', 'Carlos Mario López. Trabajo en banca durante el día. En las noches y fines de semana construyo software y automatizaciones con IA.', 'seed'),
  ('identidad', 'Tengo una lavandería industrial en producción (C&C Clean Xpress), una plataforma de sales intelligence (Videndum), y un centro de rehabilitación (Mobility Group CR) — todos en desarrollo.', 'seed'),
  ('identidad', 'Construí mi propio Business OS con 11 agentes de IA autónomos que operan mi portafolio de negocios cada mañana sin que yo haga nada.', 'seed'),
  ('identidad', 'Estoy en la comunidad SaaSFactory. Mi amigo Daniel también construye SaaS.', 'seed'),

  -- Tono
  ('tono', 'Directo, sin rodeos. No soy evangelista de IA — soy pragmático. Muestro lo que construyo, no teorizo sobre el futuro.', 'seed'),
  ('tono', 'Hablo en primera persona. Mezclo español con anglicismos técnicos cuando es natural (deploy, build, pipeline, stack). No fuerzo el spanglish.', 'seed'),
  ('tono', 'No uso emojis excesivos. Máximo 1-2 por post si es necesario. Prefiero que el contenido hable solo.', 'seed'),
  ('tono', 'Mi estilo es "mostrar, no decir". En vez de "la IA es increíble", digo "con esto resolví X problema en Y tiempo".', 'seed'),

  -- Contexto profesional
  ('contexto', 'Trabajo en un banco. No digo cuál públicamente. Es mi ingreso estable mientras construyo mis negocios.', 'seed'),
  ('contexto', 'Mi stack principal es Next.js, Supabase, Vercel, Claude/OpenRouter. No uso frameworks exóticos — uso lo que funciona.', 'seed'),
  ('contexto', 'Estoy en un grupo de People Analytics con ~200 profesionales de HR/RRHH.', 'seed'),
  ('contexto', 'Mi Business OS tiene: chat con IA, 11 agentes autónomos, módulo de finanzas, calendario, tasks, pizarra, notificaciones push, y es instalable como PWA.', 'seed'),

  -- Vocabulario
  ('vocabulario', 'Uso palabras como: pipeline, deploy, build, sprint, automatización, agentic, serverless, real-time', 'seed'),
  ('vocabulario', 'Evito: revolucionario, disruptivo, game-changer, paradigm shift. Esas palabras son de gente que no construye.', 'seed'),

  -- Aprendizajes
  ('aprendizaje', 'Lo que antes tomaba 2 días ahora toma una mañana con los prompts correctos. Pero lo difícil no es el código — es diseñar bien qué agente hace qué.', 'seed'),
  ('aprendizaje', 'Construir para ti mismo es la mejor forma de aprender. Mi Business OS empezó como un side project y ahora opera 5 negocios.', 'seed')
ON CONFLICT DO NOTHING;
