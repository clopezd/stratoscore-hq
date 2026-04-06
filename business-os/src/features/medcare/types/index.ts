// ============================================================
// Tipos - MedCare Imagenología
// ============================================================

export type TipoEstudio = 'mamografia' | 'ultrasonido'
export type EstadoLeadMedcare = 'nuevo' | 'contactado' | 'cita_agendada' | 'completado' | 'descartado'
export type HorarioPreferido = 'manana' | 'tarde' | 'cualquiera'
export type GeneroMedcare = 'Femenino' | 'Masculino' | 'Otro'

export interface ServicioMedcare {
  id: string
  nombre: string
  tipo: TipoEstudio
  equipo_id: string
  duracion_minutos: number
  precio: number | null
  preparacion: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface LeadMedcare {
  id: string
  nombre: string
  email: string | null
  telefono: string
  servicio_id: string | null
  tipo_estudio: TipoEstudio | null
  medico_referente: string | null
  fecha_preferida: string | null
  horario_preferido: HorarioPreferido | null
  fuente: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  estado: EstadoLeadMedcare
  notas: string | null
  contactado_en: string | null
  cita_id: string | null
  // Campos de importación CSV
  fecha_nacimiento: string | null
  genero: GeneroMedcare | null
  servicio_previo: string | null
  fecha_ultima_cita: string | null
  origen_importacion: boolean
  edad_calculada: number | null
  created_at: string
  updated_at: string
}

export interface LeadMedcareInsert {
  nombre: string
  telefono: string
  email?: string
  servicio_id?: string
  tipo_estudio?: TipoEstudio
  medico_referente?: string
  fecha_preferida?: string
  horario_preferido?: HorarioPreferido
  fuente?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  notas?: string
  // Campos de importación
  fecha_nacimiento?: string
  genero?: GeneroMedcare
  servicio_previo?: string
  fecha_ultima_cita?: string
  origen_importacion?: boolean
  edad_calculada?: number
}

export interface LeadMedcareUpdate {
  nombre?: string
  telefono?: string
  email?: string
  estado?: EstadoLeadMedcare
  notas?: string
  contactado_en?: string
  cita_id?: string
}

export interface MedcareOcupacion {
  fecha: string
  equipo: string
  estudios_agendados: number
  porcentaje_ocupacion: number
}

// Tipos para importación CSV
export interface CSVPacienteRow {
  Nombre: string
  Telefono: string
  Fecha_Nacimiento: string
  Servicio_Realizado: string
  Fecha_Ultima_Cita: string
  Genero?: string
  Email?: string
}

export interface CSVValidationResult {
  valid: boolean
  errors: string[]
  totalRows: number
  validRows: number
}

export interface PacienteFiltrado {
  nombre: string
  telefono: string
  email?: string
  fecha_nacimiento: string
  edad: number
  genero: string
  servicio_previo: string
  fecha_ultima_cita: string
  meses_sin_cita: number
  razon_reactivacion: string
}
