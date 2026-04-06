/**
 * ConFIRMA - Servicios de Backend
 * Sistema de Aprobaciones Multi-Nivel
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================
// Tipos
// ============================================================

export type Prioridad = 'Alta' | 'Media' | 'Baja'
export type EstadoSolicitud = 'Borrador' | 'Enviada' | 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada'
export type EstadoAprobador = 'Pendiente' | 'Aprobado' | 'Rechazado'

export interface Plantilla {
  id: string
  nombre: string
  descripcion?: string
  area?: string
  proceso?: string
  prioridad_defecto: Prioridad
  asunto_predefinido?: string
  descripcion_predefinida?: string
  estado: 'Activa' | 'Inactiva'
  created_at: string
  aprobadores?: PlantillaAprobador[]
}

export interface PlantillaAprobador {
  id: string
  plantilla_id: string
  nivel: number
  usuario_email: string
  usuario_nombre?: string
  orden: number
}

export interface Solicitud {
  id: string
  plantilla_id?: string
  asunto: string
  descripcion?: string
  prioridad: Prioridad
  estado: EstadoSolicitud
  nivel_actual: number
  total_niveles?: number
  ap_inf?: string
  created_at: string
  updated_at: string
  created_by: string
  finalizada_at?: string
  // Relaciones
  solicitante?: { email: string; nombre: string }
  aprobadores?: SolicitudAprobador[]
  adjuntos?: Adjunto[]
}

export interface SolicitudAprobador {
  id: string
  solicitud_id: string
  nivel: number
  usuario_email: string
  usuario_nombre?: string
  orden: number
  estado: EstadoAprobador
  fecha_accion?: string
  comentarios?: string
  created_at: string
}

export interface Adjunto {
  id: string
  solicitud_id: string
  nombre_archivo: string
  storage_path: string
  mime_type?: string
  tamano_bytes?: number
  uploaded_at: string
  uploaded_by: string
}

export interface LogAprobacion {
  id: string
  solicitud_id: string
  aprobador_id?: string
  accion: 'Aprobado' | 'Rechazado' | 'Comentario' | 'Reasignado'
  nivel: number
  usuario_email: string
  usuario_nombre?: string
  comentarios?: string
  metadata?: Record<string, any>
  created_at: string
}

// ============================================================
// Servicios: Plantillas
// ============================================================

export const plantillasService = {
  async listar(filtro?: { area?: string; proceso?: string; estado?: 'Activa' | 'Inactiva' }) {
    const supabase = createClient()
    let query = supabase
      .from('confirma_plantillas')
      .select('*')
      .order('nombre', { ascending: true })

    if (filtro?.area) query = query.eq('area', filtro.area)
    if (filtro?.proceso) query = query.eq('proceso', filtro.proceso)
    if (filtro?.estado) query = query.eq('estado', filtro.estado)

    const { data, error } = await query

    if (error) throw error
    return data as Plantilla[]
  },

  async obtener(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_plantillas')
      .select(`
        *,
        aprobadores:confirma_plantilla_aprobadores(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Plantilla
  },

  async crear(plantilla: Omit<Plantilla, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_plantillas')
      .insert(plantilla)
      .select()
      .single()

    if (error) throw error
    return data as Plantilla
  },

  async actualizar(id: string, cambios: Partial<Plantilla>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_plantillas')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Plantilla
  },

  async eliminar(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('confirma_plantillas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================================
// Servicios: Solicitudes
// ============================================================

export const solicitudesService = {
  async listar(filtro?: {
    estado?: EstadoSolicitud
    prioridad?: Prioridad
    created_by?: string
  }) {
    const supabase = createClient()
    let query = supabase
      .from('confirma_solicitudes')
      .select(`
        *,
        aprobadores:confirma_solicitud_aprobadores(*),
        adjuntos:confirma_adjuntos(count)
      `)
      .order('created_at', { ascending: false })

    if (filtro?.estado) query = query.eq('estado', filtro.estado)
    if (filtro?.prioridad) query = query.eq('prioridad', filtro.prioridad)
    if (filtro?.created_by) query = query.eq('created_by', filtro.created_by)

    const { data, error } = await query

    if (error) throw error
    return data as Solicitud[]
  },

  async obtener(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_solicitudes')
      .select(`
        *,
        aprobadores:confirma_solicitud_aprobadores(*),
        adjuntos:confirma_adjuntos(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Solicitud
  },

  async crear(solicitud: {
    asunto: string
    descripcion?: string
    prioridad: Prioridad
    plantilla_id?: string
    aprobadores: Array<{ nivel: number; usuario_email: string; usuario_nombre?: string; orden?: number }>
  }) {
    const supabase = createClient()

    // 1. Crear solicitud
    const { data: nuevaSolicitud, error: errorSolicitud } = await supabase
      .from('confirma_solicitudes')
      .insert({
        asunto: solicitud.asunto,
        descripcion: solicitud.descripcion,
        prioridad: solicitud.prioridad,
        plantilla_id: solicitud.plantilla_id,
        estado: 'Borrador',
        nivel_actual: 1
      })
      .select()
      .single()

    if (errorSolicitud) throw errorSolicitud

    // 2. Agregar aprobadores
    const aprobadores = solicitud.aprobadores.map((a) => ({
      solicitud_id: nuevaSolicitud.id,
      nivel: a.nivel,
      usuario_email: a.usuario_email,
      usuario_nombre: a.usuario_nombre,
      orden: a.orden || 1
    }))

    const { error: errorAprobadores } = await supabase
      .from('confirma_solicitud_aprobadores')
      .insert(aprobadores)

    if (errorAprobadores) throw errorAprobadores

    return nuevaSolicitud as Solicitud
  },

  async actualizar(id: string, cambios: Partial<Solicitud>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_solicitudes')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Solicitud
  },

  async enviar(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_solicitudes')
      .update({ estado: 'Enviada' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Solicitud
  },

  async cancelar(id: string, razon?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_solicitudes')
      .update({
        estado: 'Cancelada',
        ap_inf: razon,
        finalizada_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Solicitud
  },

  async misPendientes(usuario_email: string) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('confirma_mis_pendientes', {
      usuario_email_param: usuario_email
    })

    if (error) throw error
    return data
  }
}

// ============================================================
// Servicios: Aprobaciones
// ============================================================

export const aprobacionesService = {
  async aprobar(solicitudId: string, aprobadorEmail: string, comentarios?: string) {
    const supabase = createClient()

    // 1. Actualizar estado del aprobador
    const { error: errorAprobador } = await supabase
      .from('confirma_solicitud_aprobadores')
      .update({
        estado: 'Aprobado',
        fecha_accion: new Date().toISOString(),
        comentarios
      })
      .eq('solicitud_id', solicitudId)
      .eq('usuario_email', aprobadorEmail)
      .eq('estado', 'Pendiente')

    if (errorAprobador) throw errorAprobador

    // 2. Registrar en log
    const solicitud = await solicitudesService.obtener(solicitudId)
    const { error: errorLog } = await supabase
      .from('confirma_log_aprobaciones')
      .insert({
        solicitud_id: solicitudId,
        accion: 'Aprobado',
        nivel: solicitud.nivel_actual,
        usuario_email: aprobadorEmail,
        comentarios
      })

    if (errorLog) throw errorLog

    // 3. Avanzar nivel (función SQL se encarga de validar)
    const { error: errorAvanzar } = await supabase.rpc('confirma_avanzar_nivel', {
      solicitud_id_param: solicitudId
    })

    if (errorAvanzar) throw errorAvanzar

    return true
  },

  async rechazar(solicitudId: string, aprobadorEmail: string, comentarios: string) {
    const supabase = createClient()

    const { error } = await supabase.rpc('confirma_rechazar_solicitud', {
      solicitud_id_param: solicitudId,
      aprobador_email_param: aprobadorEmail,
      comentarios_param: comentarios
    })

    if (error) throw error
    return true
  },

  async obtenerLog(solicitudId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('confirma_log_aprobaciones')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as LogAprobacion[]
  }
}

// ============================================================
// Servicios: Adjuntos
// ============================================================

export const adjuntosService = {
  async subir(solicitudId: string, archivo: File) {
    const supabase = createClient()

    // 1. Subir a Supabase Storage
    const fileName = `${solicitudId}/${Date.now()}_${archivo.name}`
    const { data: storageData, error: storageError } = await supabase.storage
      .from('confirma-adjuntos')
      .upload(fileName, archivo)

    if (storageError) throw storageError

    // 2. Registrar en BD
    const { data, error } = await supabase
      .from('confirma_adjuntos')
      .insert({
        solicitud_id: solicitudId,
        nombre_archivo: archivo.name,
        storage_path: storageData.path,
        mime_type: archivo.type,
        tamano_bytes: archivo.size
      })
      .select()
      .single()

    if (error) throw error
    return data as Adjunto
  },

  async eliminar(id: string) {
    const supabase = createClient()

    // 1. Obtener datos del adjunto
    const { data: adjunto } = await supabase
      .from('confirma_adjuntos')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!adjunto) throw new Error('Adjunto no encontrado')

    // 2. Eliminar de storage
    const { error: storageError } = await supabase.storage
      .from('confirma-adjuntos')
      .remove([adjunto.storage_path])

    if (storageError) throw storageError

    // 3. Eliminar registro
    const { error } = await supabase
      .from('confirma_adjuntos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async descargar(storagePath: string) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('confirma-adjuntos')
      .download(storagePath)

    if (error) throw error
    return data
  },

  async obtenerURL(storagePath: string, expiresIn = 3600) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('confirma-adjuntos')
      .createSignedUrl(storagePath, expiresIn)

    return data?.signedUrl
  }
}
