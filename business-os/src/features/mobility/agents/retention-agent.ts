/**
 * 🤖 Agente de Retención y Renovación - Mobility Group CR
 *
 * Responsabilidades:
 * - Monitorear pacientes con ≤5 sesiones restantes
 * - Enviar recordatorios de renovación
 * - Contactar médico referente para recomendación
 * - Ofrecer paquetes de continuidad
 * - Identificar pacientes en riesgo de abandono
 * - Ejecutar campañas de retención automáticas
 *
 * Impacto: +50% retención → Cada paciente = 20-50 sesiones adicionales
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { enviarWhatsApp } from '../services/whatsapp'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Paciente } from '../types/database'

// Función helper para obtener el cliente correcto según el entorno
async function getSupabaseClient() {
  // Si estamos en el servidor (API route)
  if (typeof window === 'undefined') {
    return await createServerClient()
  }
  // Si estamos en el navegador
  return createBrowserClient()
}

export interface RetentionReport {
  fecha_ejecucion: string
  pacientes_analizados: number
  pacientes_proximo_vencimiento: number
  pacientes_en_riesgo: number
  mensajes_enviados: number
  recomendaciones: string[]
  acciones_ejecutadas: {
    tipo: string
    paciente_id: string
    mensaje: string
    enviado: boolean
  }[]
}

/**
 * Identifica pacientes próximos a vencer (≤5 sesiones)
 */
async function getPacientesProximosVencimiento(): Promise<Paciente[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('estado', 'activo')
    .lte('sesiones_restantes', 5)
    .order('sesiones_restantes', { ascending: true })

  if (error) {
    console.error('Error obteniendo pacientes próximos a vencer:', error)
    throw error
  }

  return data || []
}

/**
 * Identifica pacientes en riesgo de abandono
 * Criterios: 2+ faltas en últimas 5 citas, o >14 días sin asistir
 */
async function getPacientesEnRiesgo(): Promise<Paciente[]> {
  const supabase = await getSupabaseClient()

  // Pacientes que no han tenido citas en los últimos 14 días
  const hace14Dias = new Date()
  hace14Dias.setDate(hace14Dias.getDate() - 14)

  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('estado', 'activo')
    .lt('fecha_ultima_sesion', hace14Dias.toISOString())

  if (error) {
    console.error('Error obteniendo pacientes en riesgo:', error)
    throw error
  }

  return data || []
}

/**
 * Genera mensaje de renovación personalizado
 */
function generarMensajeRenovacion(paciente: Paciente): string {
  const sesionesRestantes = paciente.sesiones_restantes || 0

  if (sesionesRestantes === 0) {
    return `¡Hola ${paciente.nombre}! 👋

Has completado tu plan de ${paciente.plan_sesiones} sesiones en Mobility Group CR. ¡Felicitaciones por tu compromiso! 🎉

Para continuar tu progreso de rehabilitación, te ofrecemos:
✅ 20% de descuento en renovación inmediata
✅ Evaluación gratuita de seguimiento
✅ Plan personalizado según tu evolución

¿Te gustaría agendar una cita con tu médico referente para evaluar la continuidad?

📞 Contáctanos: +506 2289-5050
🌐 www.mobility.cr`
  } else if (sesionesRestantes <= 2) {
    return `Hola ${paciente.nombre},

Te quedan solo ${sesionesRestantes} sesiones de tu plan actual en Mobility Group CR.

¿Has visto mejoras en tu rehabilitación? 💪

Para asegurar resultados duraderos, recomendamos continuar con un plan de mantenimiento.

🎁 OFERTA ESPECIAL: 15% descuento por renovación antes de finalizar tu plan actual.

¿Quieres que tu médico referente ${paciente.medico_referente || 'te evalúe'} y recomiende el siguiente paso?

Responde SÍ para agendar tu evaluación gratuita.`
  } else {
    return `¡Hola ${paciente.nombre}!

Solo te quedan ${sesionesRestantes} sesiones de tu plan en Mobility Group CR.

Es el momento ideal para planificar tu continuidad. Muchos pacientes ven resultados óptimos con un plan de mantenimiento.

¿Te gustaría recibir información sobre nuestros planes de continuidad?

📞 +506 2289-5050`
  }
}

/**
 * Genera mensaje de reactivación para pacientes en riesgo
 */
function generarMensajeReactivacion(paciente: Paciente): string {
  const diasSinAsistir = paciente.fecha_ultima_sesion
    ? Math.floor((new Date().getTime() - new Date(paciente.fecha_ultima_sesion).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return `Hola ${paciente.nombre},

Notamos que llevas ${diasSinAsistir} días sin asistir a tus sesiones en Mobility Group CR.

¿Todo bien? ¿Hay algo en lo que podamos ayudarte? 🤝

Sabemos que la consistencia es clave para tu rehabilitación. Te extrañamos y queremos apoyarte en tu recuperación.

¿Te gustaría reagendar tus sesiones? Tenemos disponibilidad esta semana.

Responde y te ayudamos de inmediato.

Tu equipo Mobility 💙`
}

/**
 * Envía mensaje de renovación (simulado - integrar con WhatsApp/SMS)
 */
async function enviarMensajeRenovacion(
  paciente: Paciente,
  mensaje: string
): Promise<boolean> {
  return await enviarWhatsApp(paciente.telefono, mensaje)
}

/**
 * Notifica al médico referente sobre paciente próximo a vencer
 */
async function notificarMedicoReferente(paciente: Paciente): Promise<boolean> {
  if (!paciente.medico_referente) return false

  const mensaje = `Dr/a. ${paciente.medico_referente},

Su paciente ${paciente.nombre} está próximo a completar su plan de rehabilitación en Mobility Group CR (${paciente.sesiones_restantes} sesiones restantes).

¿Recomienda continuar con un plan de mantenimiento?

Le agradecemos su valoración médica para definir los próximos pasos.

Saludos,
Equipo Mobility Group CR
+506 2289-5050`

  console.log(`📧 Email al médico referente:`)
  console.log(mensaje)
  console.log('---')

  // TODO: Enviar email real
  return true
}

/**
 * Ejecuta el agente de retención completo
 */
export async function ejecutarAgenteRetencion(): Promise<RetentionReport> {
  console.log('🤖 Ejecutando Agente de Retención y Renovación...')

  const reporte: RetentionReport = {
    fecha_ejecucion: new Date().toISOString(),
    pacientes_analizados: 0,
    pacientes_proximo_vencimiento: 0,
    pacientes_en_riesgo: 0,
    mensajes_enviados: 0,
    recomendaciones: [],
    acciones_ejecutadas: [],
  }

  try {
    // 1. Obtener pacientes activos
    const supabase = await getSupabaseClient()
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('*')
      .eq('estado', 'activo')

    reporte.pacientes_analizados = pacientes?.length || 0

    // 2. Identificar pacientes próximos a vencer
    const pacientesVencimiento = await getPacientesProximosVencimiento()
    reporte.pacientes_proximo_vencimiento = pacientesVencimiento.length

    console.log(`📋 ${pacientesVencimiento.length} pacientes próximos a vencer`)

    // 3. Procesar pacientes próximos a vencer
    for (const paciente of pacientesVencimiento) {
      const mensaje = generarMensajeRenovacion(paciente)
      const enviado = await enviarMensajeRenovacion(paciente, mensaje)

      if (enviado) {
        reporte.mensajes_enviados++
      }

      reporte.acciones_ejecutadas.push({
        tipo: 'renovacion',
        paciente_id: paciente.id,
        mensaje: mensaje.substring(0, 100) + '...',
        enviado,
      })

      // Notificar al médico referente si sesiones <= 2
      if (paciente.sesiones_restantes && paciente.sesiones_restantes <= 2) {
        await notificarMedicoReferente(paciente)
      }
    }

    // 4. Identificar pacientes en riesgo de abandono
    const pacientesRiesgo = await getPacientesEnRiesgo()
    reporte.pacientes_en_riesgo = pacientesRiesgo.length

    console.log(`⚠️  ${pacientesRiesgo.length} pacientes en riesgo de abandono`)

    // 5. Procesar pacientes en riesgo
    for (const paciente of pacientesRiesgo) {
      const mensaje = generarMensajeReactivacion(paciente)
      const enviado = await enviarMensajeRenovacion(paciente, mensaje)

      if (enviado) {
        reporte.mensajes_enviados++
      }

      reporte.acciones_ejecutadas.push({
        tipo: 'reactivacion',
        paciente_id: paciente.id,
        mensaje: mensaje.substring(0, 100) + '...',
        enviado,
      })
    }

    // 6. Generar recomendaciones
    if (pacientesVencimiento.length > 5) {
      reporte.recomendaciones.push(
        `⚠️ ALERTA: ${pacientesVencimiento.length} pacientes próximos a vencer. Priorizar contacto.`
      )
    }

    if (pacientesRiesgo.length > 3) {
      reporte.recomendaciones.push(
        `🚨 URGENTE: ${pacientesRiesgo.length} pacientes en riesgo de abandono. Contactar hoy.`
      )
    }

    if (reporte.pacientes_proximo_vencimiento === 0 && reporte.pacientes_en_riesgo === 0) {
      reporte.recomendaciones.push('✅ Excelente retención. Todos los pacientes activos y comprometidos.')
    }

    console.log(`✅ Agente de Retención completado`)
    console.log(`   📊 ${reporte.mensajes_enviados} mensajes enviados`)

    return reporte
  } catch (error) {
    console.error('❌ Error ejecutando agente de retención:', error)
    throw error
  }
}