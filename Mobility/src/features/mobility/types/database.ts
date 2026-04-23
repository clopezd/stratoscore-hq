// ============================================================
// Tipos de Base de Datos - Mobility Group CR
// ============================================================

export type EstadoEquipo = 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio'
export type TipoEquipo = 'lokomat' | 'armeo' | 'erigo' | 'andago'
export type EstadoPaciente = 'activo' | 'inactivo' | 'completado' | 'suspendido'
export type EstadoCita = 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio'
export type TipoSesion = 'evaluacion' | 'rehabilitacion' | 'seguimiento'
export type EstadoLead = 'nuevo' | 'contactado' | 'evaluacion_agendada' | 'convertido' | 'descartado'
export type FuenteLead = 'web' | 'telefono' | 'referido' | 'google_ads' | 'facebook'

// ── Terapeuta ────────────────────────────────────────────────
export interface Terapeuta {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  especialidades: string[] // ['neurológico', 'ortopédico', 'pediátrico']
  lokomat_certificado: boolean
  disponibilidad: Record<string, any> // JSONB con horarios por día
  activo: boolean
  created_at: string
  updated_at: string
}

export interface TerapeutaInsert {
  nombre: string
  email?: string
  telefono?: string
  especialidades?: string[]
  lokomat_certificado?: boolean
  disponibilidad?: Record<string, any>
  activo?: boolean
}

export interface TerapeutaUpdate {
  nombre?: string
  email?: string
  telefono?: string
  especialidades?: string[]
  lokomat_certificado?: boolean
  disponibilidad?: Record<string, any>
  activo?: boolean
}

// ── Equipo ───────────────────────────────────────────────────
export interface Equipo {
  id: string // 'lokomat_1', 'lokomat_2', etc.
  nombre: string
  tipo: TipoEquipo
  estado: EstadoEquipo
  ubicacion: string | null
  mantenimiento_proximo: string | null // DATE
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface EquipoInsert {
  id: string
  nombre: string
  tipo: TipoEquipo
  estado?: EstadoEquipo
  ubicacion?: string
  mantenimiento_proximo?: string
  notas?: string
  activo?: boolean
}

// ── Paciente ─────────────────────────────────────────────────
export interface Paciente {
  id: string
  nombre: string
  email: string | null
  telefono: string
  fecha_nacimiento: string | null // DATE
  diagnostico: string | null
  medico_referente: string | null
  hospital_origen: string | null
  notas_medicas: string | null
  plan_sesiones: number | null
  sesiones_completadas: number
  sesiones_restantes: number | null
  fecha_primera_sesion: string | null // DATE
  fecha_ultima_sesion: string | null // DATE
  estado: EstadoPaciente
  created_at: string
  updated_at: string
}

export interface PacienteInsert {
  nombre: string
  email?: string
  telefono: string
  fecha_nacimiento?: string
  diagnostico?: string
  medico_referente?: string
  hospital_origen?: string
  notas_medicas?: string
  plan_sesiones?: number
  estado?: EstadoPaciente
}

export interface PacienteUpdate {
  nombre?: string
  email?: string
  telefono?: string
  fecha_nacimiento?: string
  diagnostico?: string
  medico_referente?: string
  hospital_origen?: string
  notas_medicas?: string
  plan_sesiones?: number
  sesiones_restantes?: number
  estado?: EstadoPaciente
}

// ── Cita ─────────────────────────────────────────────────────
export interface Cita {
  id: string
  paciente_id: string
  terapeuta_id: string | null
  equipo_id: string | null
  fecha_hora: string // TIMESTAMPTZ
  duracion_minutos: number
  tipo_sesion: TipoSesion
  estado: EstadoCita
  notas_terapeuta: string | null
  recordatorio_enviado: boolean
  cancelada_por: string | null
  motivo_cancelacion: string | null
  created_at: string
  updated_at: string
}

// Cita con datos relacionados (para vistas)
export interface CitaConRelaciones extends Cita {
  paciente?: {
    nombre: string
    telefono: string
  }
  terapeuta?: {
    nombre: string
  }
  equipo?: {
    nombre: string
    tipo: TipoEquipo
  }
}

export interface CitaInsert {
  paciente_id: string
  terapeuta_id?: string
  equipo_id?: string
  fecha_hora: string
  duracion_minutos?: number
  tipo_sesion?: TipoSesion
  estado?: EstadoCita
  notas_terapeuta?: string
}

export interface CitaUpdate {
  terapeuta_id?: string
  equipo_id?: string
  fecha_hora?: string
  duracion_minutos?: number
  tipo_sesion?: TipoSesion
  estado?: EstadoCita
  notas_terapeuta?: string
  cancelada_por?: string
  motivo_cancelacion?: string
}

// ── Lead ─────────────────────────────────────────────────────
export interface LeadMobility {
  id: string
  nombre: string
  email: string | null
  telefono: string
  diagnostico_preliminar: string | null
  medico_referente: string | null
  fuente: FuenteLead | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  estado: EstadoLead
  notas: string | null
  contactado_en: string | null // TIMESTAMPTZ
  convertido_a_paciente_id: string | null
  created_at: string
  updated_at: string
}

export interface LeadMobilityInsert {
  nombre: string
  email?: string
  telefono: string
  diagnostico_preliminar?: string
  medico_referente?: string
  fuente?: FuenteLead
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  notas?: string
}

export interface LeadMobilityUpdate {
  nombre?: string
  email?: string
  telefono?: string
  diagnostico_preliminar?: string
  medico_referente?: string
  estado?: EstadoLead
  notas?: string
  contactado_en?: string
  convertido_a_paciente_id?: string
}

// ── Vistas ───────────────────────────────────────────────────
export interface OcupacionDiaria {
  fecha: string // DATE
  sesiones_ocupadas: number
  equipos_en_uso: number
  porcentaje_ocupacion: number
}

export interface PacienteProximoVencimiento {
  id: string
  nombre: string
  telefono: string
  email: string | null
  sesiones_restantes: number
  fecha_ultima_sesion: string | null
  prioridad_renovacion: 'urgente' | 'proximo' | 'normal'
}

// ── Horarios del Centro ──────────────────────────────────────
export interface HorarioCentro {
  id: string
  dia_semana: number // 0=Domingo, 1=Lunes, ..., 6=Sábado
  hora_inicio: string // TIME
  hora_fin: string // TIME
  duracion_slot_minutos: number
  activo: boolean
}

// ── Tipos auxiliares ─────────────────────────────────────────
export interface SlotDisponible {
  fecha_hora: string
  equipo_id: string
  equipo_nombre: string
  terapeuta_id?: string
  terapeuta_nombre?: string
}

export interface MetricasOcupacion {
  porcentaje_ocupacion_hoy: number
  porcentaje_ocupacion_semana: number
  sesiones_hoy: number
  sesiones_semana: number
  equipos_en_uso_ahora: number
  proximas_citas: CitaConRelaciones[]
}
