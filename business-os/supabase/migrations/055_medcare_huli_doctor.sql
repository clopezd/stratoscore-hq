-- MedCare — Tracking del radiólogo asignado en cada cita (Opción D: paciente escoge)
-- Agrega huli_doctor_id a medcare_leads para saber qué radiólogo atendió el US
-- y poder construir métricas por doctor (volumen, conversión, no-shows).

ALTER TABLE public.medcare_leads
  ADD COLUMN IF NOT EXISTS huli_doctor_id TEXT;

CREATE INDEX IF NOT EXISTS medcare_leads_huli_doctor_idx
  ON public.medcare_leads (huli_doctor_id) WHERE huli_doctor_id IS NOT NULL;

COMMENT ON COLUMN public.medcare_leads.huli_doctor_id IS 'ID del radiólogo Huli que atendió la cita (49493 Solís, 18828 Pastora, 14145 Hernández, 97620 Marden) o 96314 para el mamógrafo.';
