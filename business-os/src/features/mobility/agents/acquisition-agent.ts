/**
 * 🤖 Agente de Captación y Conversión - Mobility Group CR
 *
 * Responsabilidades:
 * - Monitorear leads entrantes (formulario web, WhatsApp, llamadas)
 * - Responder automáticamente en <5 min (tasa de conversión +300%)
 * - Clasificar leads por urgencia/prioridad (scoring automático)
 * - Agendar primera evaluación automáticamente
 * - Seguimiento de leads fríos (reactivación cada 7 días)
 * - Reportar tasa de conversión Lead → Paciente
 *
 * Impacto: +40% conversión (de 30% a 70% según industria)
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { enviarWhatsApp } from '../services/whatsapp'
import { createClient as createServerClient } from '@/lib/supabase/server'

async function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return await createServerClient()
  }
  return createBrowserClient()
}

export interface LeadMobility {
  id: string
  nombre: string
  telefono: string
  email?: string
  diagnostico_preliminar?: string  // Cambiado de diagnostico_tentativo
  medico_referente?: string
  fuente?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  estado: string
  notas?: string
  contactado_en?: string  // Cambiado de contactado_at
  convertido_a_paciente_id?: string  // Cambiado de convertido_at
  created_at: string
  updated_at?: string
}

export interface AcquisitionReport {
  fecha_ejecucion: string
  leads_analizados: number
  leads_nuevos: number
  leads_sin_contactar: number
  leads_frios: number
  mensajes_enviados: number
  leads_calificados: number
  tasa_conversion_estimada: number
  recomendaciones: string[]
  acciones_ejecutadas: {
    tipo: string
    lead_id: string
    mensaje: string
    enviado: boolean
  }[]
}

/**
 * Obtiene leads nuevos (sin contactar)
 * @param minutosMax - Opcional: solo leads de últimos N minutos (default: todos)
 */
async function getLeadsNuevos(minutosMax?: number): Promise<LeadMobility[]> {
  const supabase = await getSupabaseClient()

  let query = supabase
    .from('leads_mobility')
    .select('*')
    .eq('estado', 'nuevo')

  // Filtro de tiempo opcional
  if (minutosMax) {
    const haceTiempo = new Date()
    haceTiempo.setMinutes(haceTiempo.getMinutes() - minutosMax)
    query = query.gte('created_at', haceTiempo.toISOString())
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo leads nuevos:', error)
    return []
  }

  console.log(`🔍 Encontrados ${data?.length || 0} leads con estado=nuevo`)
  return data || []
}


/**
 * Obtiene leads fríos (contactados pero sin conversión en 7+ días)
 */
async function getLeadsFrios(): Promise<LeadMobility[]> {
  const supabase = await getSupabaseClient()

  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)

  const { data, error} = await supabase
    .from('leads_mobility')
    .select('*')
    .eq('estado', 'contactado')
    .lt('contactado_en', hace7Dias.toISOString())
    .order('contactado_en', { ascending: true })

  if (error) {
    console.error('Error obteniendo leads fríos:', error)
    return []
  }

  return data || []
}

/**
 * Calcula score de prioridad del lead
 * Alta: Condiciones neurológicas urgentes (ACV, lesión medular)
 * Media: Rehabilitación post-quirúrgica
 * Baja: Dolor crónico, prevención
 */
function calcularPrioridad(lead: LeadMobility): 'alta' | 'media' | 'baja' {
  const mensajeCompleto = `${lead.notas || ''} ${lead.diagnostico_preliminar || ''}`.toLowerCase()

  // Keywords de alta prioridad (neurológico urgente)
  const keywordsAlta = [
    'acv', 'derrame', 'infarto cerebral', 'lesión medular', 'espinal',
    'parkinson', 'esclerosis múltiple', 'hemiplejia', 'paraplejia',
  ]

  // Keywords de media prioridad (post-operatorio, rehabilitación)
  const keywordsMedia = [
    'cirugía', 'operación', 'post-operatorio', 'fractura', 'ligamento',
    'rodilla', 'cadera', 'hombro', 'columna', 'rehabilitación',
  ]

  if (keywordsAlta.some((kw) => mensajeCompleto.includes(kw))) {
    return 'alta'
  }

  if (keywordsMedia.some((kw) => mensajeCompleto.includes(kw))) {
    return 'media'
  }

  return 'baja'
}

/**
 * Genera mensaje de bienvenida personalizado
 */
function generarMensajeBienvenida(lead: LeadMobility): string {
  const prioridad = calcularPrioridad(lead)

  if (prioridad === 'alta') {
    return `¡Hola ${lead.nombre}! 👋

Gracias por contactar a Mobility Group CR. Recibimos tu solicitud y entendemos la urgencia de tu situación.

🏥 Somos especialistas en rehabilitación neurológica con tecnología Lokomat de última generación.

Queremos ayudarte lo antes posible:
✅ Evaluación médica SIN COSTO
✅ Disponibilidad ESTA SEMANA
✅ Equipos de robótica avanzada

¿Cuándo te gustaría venir para tu evaluación?

Responde con tu disponibilidad y te agendamos de inmediato.

📍 Escazú, Oficentro Trilogía
📞 +506 2289-5050
🌐 www.mobility.cr

Tu equipo Mobility 💙`
  } else if (prioridad === 'media') {
    return `Hola ${lead.nombre},

¡Gracias por escribirnos! En Mobility Group CR somos expertos en rehabilitación con tecnología robótica.

🤖 Contamos con equipos Lokomat para acelerar tu recuperación.

Te ofrecemos:
✅ Evaluación inicial GRATIS
✅ Plan personalizado según tu necesidad
✅ Equipo médico especializado

¿Te gustaría agendar tu evaluación?

Tenemos disponibilidad próxima semana. Responde SÍ y te contactamos para coordinar.

Saludos,
Equipo Mobility Group CR
📞 +506 2289-5050`
  } else {
    return `Hola ${lead.nombre},

Gracias por tu interés en Mobility Group CR, centro líder en rehabilitación robótica.

Ofrecemos:
🤖 Tecnología Lokomat
🧠 Rehabilitación neurológica y ortopédica
💪 Planes personalizados

¿Te gustaría recibir más información o agendar una evaluación?

Responde y con gusto te ayudamos.

Mobility Group CR
+506 2289-5050 | www.mobility.cr`
  }
}

/**
 * Genera mensaje de reactivación para leads fríos
 */
function generarMensajeReactivacion(lead: LeadMobility, diasInactivo: number): string {
  return `Hola ${lead.nombre},

Hace ${diasInactivo} días nos consultaste sobre rehabilitación en Mobility Group CR.

¿Sigue vigente tu interés? 🤔

Te recordamos que ofrecemos:
🎁 Evaluación inicial SIN COSTO
🤖 Tecnología Lokomat de última generación
📅 Disponibilidad inmediata

Si deseas más información o agendar tu cita, responde a este mensaje.

Estamos aquí para ayudarte 💙

Equipo Mobility
+506 2289-5050`
}

/**
 * Envía mensaje al lead (WhatsApp real con Twilio)
 */
async function enviarMensajeLead(
  lead: LeadMobility,
  mensaje: string
): Promise<boolean> {
  return await enviarWhatsApp(lead.telefono, mensaje)
}

/**
 * Actualiza el estado del lead
 */
async function actualizarEstadoLead(
  leadId: string,
  estado: string,
  prioridad?: 'alta' | 'media' | 'baja'
): Promise<void> {
  const supabase = await getSupabaseClient()

  const updateData: any = { estado }

  if (estado === 'contactado') {
    updateData.contactado_en = new Date().toISOString()
  }

  // Agregar prioridad en notas si existe
  if (prioridad) {
    updateData.notas = `Prioridad: ${prioridad}`
  }

  await supabase
    .from('leads_mobility')
    .update(updateData)
    .eq('id', leadId)
}

/**
 * Ejecuta el agente de captación completo
 */
export async function ejecutarAgenteAdquisicion(): Promise<AcquisitionReport> {
  console.log('🤖 Ejecutando Agente de Captación y Conversión...')

  const reporte: AcquisitionReport = {
    fecha_ejecucion: new Date().toISOString(),
    leads_analizados: 0,
    leads_nuevos: 0,
    leads_sin_contactar: 0,
    leads_frios: 0,
    mensajes_enviados: 0,
    leads_calificados: 0,
    tasa_conversion_estimada: 0,
    recomendaciones: [],
    acciones_ejecutadas: [],
  }

  try {
    // 1. Procesar TODOS los leads NUEVOS (estado=nuevo)
    const leadsNuevos = await getLeadsNuevos() // Sin filtro de tiempo
    reporte.leads_nuevos = leadsNuevos.length
    reporte.leads_sin_contactar = 0 // Ya no se usa esta categoría

    console.log(`🆕 ${leadsNuevos.length} leads nuevos sin contactar`)

    for (const lead of leadsNuevos) {
      const prioridad = calcularPrioridad(lead)
      const mensaje = generarMensajeBienvenida(lead)
      const enviado = await enviarMensajeLead(lead, mensaje)

      if (enviado) {
        await actualizarEstadoLead(lead.id, 'contactado', prioridad)
        reporte.mensajes_enviados++
        reporte.leads_calificados++
      }

      reporte.acciones_ejecutadas.push({
        tipo: 'bienvenida_nuevo_lead',
        lead_id: lead.id,
        mensaje,
        enviado,
      })
    }

    // 3. Reactivar leads FRÍOS (7+ días sin conversión)
    const leadsFrios = await getLeadsFrios()
    reporte.leads_frios = leadsFrios.length

    console.log(`🧊 ${leadsFrios.length} leads fríos (reactivando)`)

    for (const lead of leadsFrios) {
      const diasInactivo = Math.floor(
        (new Date().getTime() - new Date(lead.contactado_en || lead.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )

      const mensaje = generarMensajeReactivacion(lead, diasInactivo)
      const enviado = await enviarMensajeLead(lead, mensaje)

      if (enviado) {
        reporte.mensajes_enviados++
      }

      reporte.acciones_ejecutadas.push({
        tipo: 'reactivacion',
        lead_id: lead.id,
        mensaje,
        enviado,
      })
    }

    // 4. Calcular métricas y recomendaciones
    reporte.leads_analizados = leadsNuevos.length + leadsFrios.length

    // Tasa de conversión estimada (asumiendo 70% con respuesta automática)
    const leadsAltaPrioridad = leadsNuevos.filter((l) => calcularPrioridad(l) === 'alta').length
    reporte.tasa_conversion_estimada = Math.round(
      (leadsAltaPrioridad * 0.8 + (leadsNuevos.length - leadsAltaPrioridad) * 0.6) /
        (leadsNuevos.length || 1) *
        100
    )

    // Recomendaciones
    if (leadsNuevos.length > 10) {
      reporte.recomendaciones.push(
        `🚨 Pico de leads (${leadsNuevos.length}): Activar equipo de respuesta rápida`
      )
    }

    if (leadsNuevos.length > 5) {
      reporte.recomendaciones.push(
        `⚠️ ${leadsNuevos.length} leads nuevos: Monitorear respuestas de WhatsApp`
      )
    }

    if (leadsFrios.length > 10) {
      reporte.recomendaciones.push(
        `🎯 Campaña de reactivación masiva: ${leadsFrios.length} leads recuperables`
      )
    }

    if (leadsAltaPrioridad > 3) {
      reporte.recomendaciones.push(
        `🏥 ${leadsAltaPrioridad} casos neurológicos urgentes: Ofrecer citas esta semana`
      )
    }

    console.log('✅ Agente de Captación ejecutado exitosamente')
    console.log(`📤 ${reporte.mensajes_enviados} mensajes enviados`)
    console.log(`🎯 Tasa de conversión estimada: ${reporte.tasa_conversion_estimada}%`)

    return reporte
  } catch (error) {
    console.error('❌ Error ejecutando agente de captación:', error)
    throw error
  }
}
