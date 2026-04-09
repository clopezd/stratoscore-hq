-- ============================================================
-- Migración: MedCare — Integración HuliPractice
-- Objetivo: Campos para sincronizar leads con citas de Huli
-- PRP: PRP-008-medcare-huli-integration.md
-- ============================================================

-- ── 1. Campos Huli en medcare_leads ───────────────────────────
ALTER TABLE public.medcare_leads
  ADD COLUMN IF NOT EXISTS huli_patient_id TEXT,
  ADD COLUMN IF NOT EXISTS huli_appointment_id TEXT,
  ADD COLUMN IF NOT EXISTS huli_appointment_status TEXT,
  ADD COLUMN IF NOT EXISTS fecha_cita TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS medcare_leads_huli_patient_idx
  ON public.medcare_leads (huli_patient_id) WHERE huli_patient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS medcare_leads_huli_appointment_idx
  ON public.medcare_leads (huli_appointment_id) WHERE huli_appointment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS medcare_leads_fecha_cita_idx
  ON public.medcare_leads (fecha_cita) WHERE fecha_cita IS NOT NULL;

-- ── 2. Agregar estado 'no_show' al check constraint ──────────
-- Primero eliminar el constraint viejo, luego crear uno nuevo con más estados
ALTER TABLE public.medcare_leads DROP CONSTRAINT IF EXISTS medcare_leads_estado_check;
ALTER TABLE public.medcare_leads
  ADD CONSTRAINT medcare_leads_estado_check
  CHECK (estado IN ('nuevo', 'contactado', 'cita_agendada', 'completado', 'no_show', 'descartado'));

-- ── 3. Tabla de log de webhooks Huli ──────────────────────────
CREATE TABLE IF NOT EXISTS public.medcare_huli_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  huli_appointment_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS medcare_huli_webhook_event_idx
  ON public.medcare_huli_webhook_log (event_type);
CREATE INDEX IF NOT EXISTS medcare_huli_webhook_processed_idx
  ON public.medcare_huli_webhook_log (processed) WHERE processed = false;

-- RLS: solo acceso server-side (service_role)
ALTER TABLE public.medcare_huli_webhook_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service_role accede webhook log" ON public.medcare_huli_webhook_log;
CREATE POLICY "Solo service_role accede webhook log"
  ON public.medcare_huli_webhook_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ── 4. Tabla de configuración Huli por tenant ─────────────────
CREATE TABLE IF NOT EXISTS public.medcare_huli_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_encrypted TEXT NOT NULL,
  id_organization INTEGER NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://api.huli.io',
  webhook_secret TEXT,
  default_doctor_id TEXT,
  default_clinic_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medcare_huli_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admin configura Huli" ON public.medcare_huli_config;
CREATE POLICY "Solo admin configura Huli"
  ON public.medcare_huli_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ── 5. Comentarios ────────────────────────────────────────────
COMMENT ON COLUMN public.medcare_leads.huli_patient_id IS 'ID del paciente en HuliPractice';
COMMENT ON COLUMN public.medcare_leads.huli_appointment_id IS 'ID de la cita en HuliPractice';
COMMENT ON COLUMN public.medcare_leads.huli_appointment_status IS 'Estado de la cita en Huli (confirmed, cancelled, completed, no_show)';
COMMENT ON COLUMN public.medcare_leads.fecha_cita IS 'Fecha/hora de la cita agendada en Huli';
COMMENT ON TABLE public.medcare_huli_webhook_log IS 'Log de eventos webhook recibidos de HuliPractice';
COMMENT ON TABLE public.medcare_huli_config IS 'Configuración de conexión con HuliPractice API';
