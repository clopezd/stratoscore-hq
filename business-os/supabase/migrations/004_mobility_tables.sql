-- ============================================================
-- Migración: Mobility Group CR - Sistema de Rehabilitación
-- Cliente: Centro de rehabilitación robótica en Escazú
-- Objetivo: Aumentar ocupación del 30% al 80%
-- ============================================================

-- ── 1. Terapeutas ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.terapeutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  especialidades TEXT[] DEFAULT '{}', -- 'neurológico', 'ortopédico', 'pediátrico'
  lokomat_certificado BOOLEAN DEFAULT false,
  disponibilidad JSONB DEFAULT '{}', -- Horarios por día de la semana
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS terapeutas_activo_idx ON public.terapeutas (activo);

-- ── 2. Equipos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipos (
  id TEXT PRIMARY KEY, -- 'lokomat_1', 'lokomat_2', 'armeo_1', etc.
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'lokomat', 'armeo', 'erigo', 'andago'
  estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_uso', 'mantenimiento', 'fuera_servicio')),
  ubicacion TEXT, -- Sala/piso
  mantenimiento_proximo DATE,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equipos_tipo_idx ON public.equipos (tipo);
CREATE INDEX IF NOT EXISTS equipos_estado_idx ON public.equipos (estado);

-- ── 3. Pacientes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT NOT NULL,
  fecha_nacimiento DATE,
  diagnostico TEXT, -- Lesión medular, ACV, Parkinson, etc.
  medico_referente TEXT, -- Nombre del médico que refirió
  hospital_origen TEXT, -- Hospital o clínica de origen
  notas_medicas TEXT, -- Observaciones importantes
  plan_sesiones INT, -- Total de sesiones contratadas (10, 20, 30)
  sesiones_completadas INT DEFAULT 0,
  sesiones_restantes INT, -- Calculado: plan_sesiones - sesiones_completadas
  fecha_primera_sesion DATE,
  fecha_ultima_sesion DATE,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'completado', 'suspendido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pacientes_estado_idx ON public.pacientes (estado);
CREATE INDEX IF NOT EXISTS pacientes_telefono_idx ON public.pacientes (telefono);
CREATE INDEX IF NOT EXISTS pacientes_created_at_idx ON public.pacientes (created_at DESC);

-- ── 4. Citas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id UUID REFERENCES public.terapeutas(id) ON DELETE SET NULL,
  equipo_id TEXT REFERENCES public.equipos(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_minutos INT DEFAULT 60 CHECK (duracion_minutos > 0),
  tipo_sesion TEXT DEFAULT 'rehabilitacion', -- 'evaluacion', 'rehabilitacion', 'seguimiento'
  estado TEXT DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
  notas_terapeuta TEXT, -- Observaciones post-sesión
  recordatorio_enviado BOOLEAN DEFAULT false,
  cancelada_por TEXT, -- 'paciente', 'centro', 'sistema'
  motivo_cancelacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS citas_paciente_idx ON public.citas (paciente_id);
CREATE INDEX IF NOT EXISTS citas_terapeuta_idx ON public.citas (terapeuta_id);
CREATE INDEX IF NOT EXISTS citas_equipo_idx ON public.citas (equipo_id);
CREATE INDEX IF NOT EXISTS citas_fecha_hora_idx ON public.citas (fecha_hora DESC);
CREATE INDEX IF NOT EXISTS citas_estado_idx ON public.citas (estado);

-- Índice compuesto para búsqueda de disponibilidad
CREATE INDEX IF NOT EXISTS citas_fecha_equipo_idx ON public.citas (fecha_hora, equipo_id) WHERE estado != 'cancelada';

-- ── 5. Leads (Captación) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads_mobility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT NOT NULL,
  diagnostico_preliminar TEXT, -- Lo que reporta el lead
  medico_referente TEXT,
  fuente TEXT, -- 'web', 'telefono', 'referido', 'google_ads', 'facebook'
  utm_source TEXT, -- Para tracking de campañas
  utm_medium TEXT,
  utm_campaign TEXT,
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'evaluacion_agendada', 'convertido', 'descartado')),
  notas TEXT,
  contactado_en TIMESTAMPTZ,
  convertido_a_paciente_id UUID REFERENCES public.pacientes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_estado_idx ON public.leads_mobility (estado);
CREATE INDEX IF NOT EXISTS leads_fuente_idx ON public.leads_mobility (fuente);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads_mobility (created_at DESC);

-- ── 6. Disponibilidad por defecto (slots) ────────────────────
-- Tabla para definir horarios de apertura del centro
CREATE TABLE IF NOT EXISTS public.horarios_centro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, etc.
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_slot_minutos INT DEFAULT 60,
  activo BOOLEAN DEFAULT true,
  UNIQUE(dia_semana, hora_inicio)
);

-- Poblar horarios por defecto (Lunes a Viernes 8am-6pm)
INSERT INTO public.horarios_centro (dia_semana, hora_inicio, hora_fin, duracion_slot_minutos) VALUES
  (1, '08:00', '18:00', 60), -- Lunes
  (2, '08:00', '18:00', 60), -- Martes
  (3, '08:00', '18:00', 60), -- Miércoles
  (4, '08:00', '18:00', 60), -- Jueves
  (5, '08:00', '18:00', 60), -- Viernes
  (6, '08:00', '13:00', 60)  -- Sábado (medio día)
ON CONFLICT (dia_semana, hora_inicio) DO NOTHING;

-- ── 7. Vista: Ocupación en tiempo real ───────────────────────
CREATE OR REPLACE VIEW public.ocupacion_diaria AS
SELECT
  DATE(c.fecha_hora) AS fecha,
  COUNT(c.id) FILTER (WHERE c.estado IN ('confirmada', 'en_curso', 'completada')) AS sesiones_ocupadas,
  COUNT(DISTINCT c.equipo_id) AS equipos_en_uso,
  ROUND(
    COUNT(c.id) FILTER (WHERE c.estado IN ('confirmada', 'en_curso', 'completada'))::NUMERIC /
    NULLIF((SELECT COUNT(*) FROM public.equipos WHERE activo = true) * 10, 0) * 100,
    2
  ) AS porcentaje_ocupacion
FROM public.citas c
WHERE c.fecha_hora >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(c.fecha_hora)
ORDER BY fecha DESC;

-- ── 8. Vista: Pacientes con sesiones próximas a terminar ─────
CREATE OR REPLACE VIEW public.pacientes_proximo_vencimiento AS
SELECT
  p.id,
  p.nombre,
  p.telefono,
  p.email,
  p.sesiones_restantes,
  p.fecha_ultima_sesion,
  CASE
    WHEN p.sesiones_restantes <= 3 THEN 'urgente'
    WHEN p.sesiones_restantes <= 5 THEN 'proximo'
    ELSE 'normal'
  END AS prioridad_renovacion
FROM public.pacientes p
WHERE p.estado = 'activo'
  AND p.sesiones_restantes IS NOT NULL
  AND p.sesiones_restantes <= 5
ORDER BY p.sesiones_restantes ASC;

-- ── 9. Función: Actualizar sesiones restantes ────────────────
CREATE OR REPLACE FUNCTION actualizar_sesiones_paciente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'completada' THEN
    UPDATE public.pacientes
    SET
      sesiones_completadas = sesiones_completadas + 1,
      sesiones_restantes = GREATEST(COALESCE(plan_sesiones, 0) - (sesiones_completadas + 1), 0),
      fecha_ultima_sesion = DATE(NEW.fecha_hora),
      updated_at = now()
    WHERE id = NEW.paciente_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente al completar cita
DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.citas;
CREATE TRIGGER trigger_actualizar_sesiones
  AFTER UPDATE ON public.citas
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado AND NEW.estado = 'completada')
  EXECUTE FUNCTION actualizar_sesiones_paciente();

-- ── 10. RLS — Row Level Security ──────────────────────────────

-- Terapeutas: Solo staff puede ver
ALTER TABLE public.terapeutas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona terapeutas" ON public.terapeutas;
CREATE POLICY "Staff gestiona terapeutas"
  ON public.terapeutas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- Equipos: Solo staff puede ver
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona equipos" ON public.equipos;
CREATE POLICY "Staff gestiona equipos"
  ON public.equipos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- Pacientes: Solo staff puede ver
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona pacientes" ON public.pacientes;
CREATE POLICY "Staff gestiona pacientes"
  ON public.pacientes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- Citas: Solo staff puede ver
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona citas" ON public.citas;
CREATE POLICY "Staff gestiona citas"
  ON public.citas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- Leads: Solo staff puede ver
ALTER TABLE public.leads_mobility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff gestiona leads" ON public.leads_mobility;
CREATE POLICY "Staff gestiona leads"
  ON public.leads_mobility FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'operador')
    )
  );

-- Horarios del centro: Solo lectura para todos
ALTER TABLE public.horarios_centro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver horarios" ON public.horarios_centro;
CREATE POLICY "Todos pueden ver horarios"
  ON public.horarios_centro FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Solo admin modifica horarios" ON public.horarios_centro;
CREATE POLICY "Solo admin modifica horarios"
  ON public.horarios_centro FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ── 11. Realtime — habilitar para live updates ────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.citas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pacientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads_mobility;

-- ── 12. Datos de ejemplo (equipos iniciales) ──────────────────
INSERT INTO public.equipos (id, nombre, tipo, ubicacion) VALUES
  ('lokomat_1', 'Lokomat Principal', 'lokomat', 'Sala 1'),
  ('lokomat_2', 'Lokomat 2', 'lokomat', 'Sala 2'),
  ('lokomat_3', 'Lokomat 3', 'lokomat', 'Sala 3')
ON CONFLICT (id) DO NOTHING;

-- ── 13. Comentarios para documentación ────────────────────────
COMMENT ON TABLE public.terapeutas IS 'Profesionales que atienden las sesiones de rehabilitación';
COMMENT ON TABLE public.equipos IS 'Equipos robóticos (Lokomat, Armeo, etc.) disponibles en el centro';
COMMENT ON TABLE public.pacientes IS 'Pacientes activos y su plan de sesiones';
COMMENT ON TABLE public.citas IS 'Agendamiento de sesiones por equipo y terapeuta';
COMMENT ON TABLE public.leads_mobility IS 'Leads captados por web/campañas antes de convertirse en pacientes';
COMMENT ON VIEW public.ocupacion_diaria IS 'Métrica de ocupación diaria del centro';
COMMENT ON VIEW public.pacientes_proximo_vencimiento IS 'Pacientes que están por terminar su plan de sesiones (oportunidad de renovación)';
