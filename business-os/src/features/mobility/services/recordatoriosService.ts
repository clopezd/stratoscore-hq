import { createClient } from '@/lib/supabase/client'
import type { CitaConRelaciones } from '../types/database'

export interface RecordatorioConfig {
  tipo: 'whatsapp' | 'sms' | 'email'
  horas_antes: number
  mensaje_template: string
}

export const RECORDATORIOS_DEFAULT: RecordatorioConfig[] = [
  {
    tipo: 'whatsapp',
    horas_antes: 24,
    mensaje_template: '¡Hola {paciente}! 👋\n\nTe recordamos tu cita en Mobility Group CR:\n📅 {fecha}\n⏰ {hora}\n🏥 {equipo}\n\n¿Necesitas reagendar? Llámanos al +506 2289-5050',
  },
  {
    tipo: 'whatsapp',
    horas_antes: 2,
    mensaje_template: 'Hola {paciente}, tu sesión de rehabilitación comienza en 2 horas ⏰\n\nNos vemos a las {hora} en {equipo}. ¡Te esperamos! 💪',
  },
]

/**
 * Obtiene las citas que necesitan recordatorio
 * @param horasAntes - Horas de anticipación (ej: 24h, 2h)
 */
export async function getCitasParaRecordatorio(horasAntes: number): Promise<CitaConRelaciones[]> {
  const supabase = createClient()

  const ahora = new Date()
  const limite_inferior = new Date(ahora.getTime() + horasAntes * 60 * 60 * 1000)
  const limite_superior = new Date(limite_inferior.getTime() + 15 * 60 * 1000) // Ventana de 15 min

  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      paciente:pacientes(*),
      terapeuta:terapeutas(*)
    `)
    .eq('estado', 'confirmada')
    .gte('fecha_hora', limite_inferior.toISOString())
    .lte('fecha_hora', limite_superior.toISOString())

  if (error) {
    console.error('Error obteniendo citas para recordatorio:', error)
    throw error
  }

  return data as CitaConRelaciones[]
}

/**
 * Marca un recordatorio como enviado
 */
export async function marcarRecordatorioEnviado(citaId: string, tipo: string, horasAntes: number) {
  const supabase = createClient()

  // Podrías crear una tabla `recordatorios_enviados` para tracking
  // Por ahora, solo lo registramos en consola
  console.log(`✅ Recordatorio ${tipo} enviado para cita ${citaId} (${horasAntes}h antes)`)

  // TODO: Implementar tabla de tracking
  // await supabase.from('recordatorios_enviados').insert({
  //   cita_id: citaId,
  //   tipo,
  //   horas_antes: horasAntes,
  //   enviado_at: new Date().toISOString(),
  // })

  return true
}

/**
 * Genera el mensaje de recordatorio personalizado
 */
export function generarMensajeRecordatorio(
  cita: CitaConRelaciones,
  template: string
): string {
  const fecha = new Date(cita.fecha_hora)

  const reemplazos: Record<string, string> = {
    '{paciente}': cita.paciente?.nombre || 'Paciente',
    '{fecha}': fecha.toLocaleDateString('es-CR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    '{hora}': fecha.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    '{equipo}': cita.equipo_id === 'lokomat_1'
      ? 'Lokomat Principal (Sala 1)'
      : cita.equipo_id === 'lokomat_2'
      ? 'Lokomat 2 (Sala 2)'
      : 'Lokomat 3 (Sala 3)',
    '{terapeuta}': cita.terapeuta?.nombre || 'Nuestro equipo',
  }

  let mensaje = template
  Object.entries(reemplazos).forEach(([key, value]) => {
    mensaje = mensaje.replace(new RegExp(key, 'g'), value)
  })

  return mensaje
}

/**
 * Envía recordatorio por WhatsApp (simulado - requiere integración Twilio)
 */
export async function enviarRecordatorioWhatsApp(
  telefono: string,
  mensaje: string
): Promise<boolean> {
  // TODO: Implementar con Twilio WhatsApp Business API
  console.log('📱 WhatsApp a', telefono)
  console.log('Mensaje:', mensaje)

  // Simulación
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ WhatsApp enviado (simulado)')
      resolve(true)
    }, 500)
  })
}

/**
 * Envía recordatorio por SMS (simulado)
 */
export async function enviarRecordatorioSMS(
  telefono: string,
  mensaje: string
): Promise<boolean> {
  console.log('💬 SMS a', telefono)
  console.log('Mensaje:', mensaje)

  // TODO: Implementar con Twilio SMS API
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ SMS enviado (simulado)')
      resolve(true)
    }, 500)
  })
}

/**
 * Envía recordatorio por Email
 */
export async function enviarRecordatorioEmail(
  email: string,
  asunto: string,
  mensaje: string
): Promise<boolean> {
  console.log('📧 Email a', email)
  console.log('Asunto:', asunto)
  console.log('Mensaje:', mensaje)

  // TODO: Implementar con Resend o servicio de email
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Email enviado (simulado)')
      resolve(true)
    }, 500)
  })
}

/**
 * Proceso principal: ejecuta el envío de recordatorios
 */
export async function procesarRecordatorios(horasAntes: number) {
  console.log(`🔔 Procesando recordatorios ${horasAntes}h antes...`)

  try {
    const citas = await getCitasParaRecordatorio(horasAntes)

    console.log(`📋 Encontradas ${citas.length} citas para recordatorio`)

    for (const cita of citas) {
      if (!cita.paciente) {
        console.warn(`⚠️ Cita ${cita.id} sin paciente asociado`)
        continue
      }

      const config = RECORDATORIOS_DEFAULT.find((r) => r.horas_antes === horasAntes)
      if (!config) {
        console.warn(`⚠️ No hay configuración de recordatorio para ${horasAntes}h`)
        continue
      }

      const mensaje = generarMensajeRecordatorio(cita, config.mensaje_template)

      let enviado = false
      if (config.tipo === 'whatsapp' && cita.paciente.telefono) {
        enviado = await enviarRecordatorioWhatsApp(cita.paciente.telefono, mensaje)
      } else if (config.tipo === 'sms' && cita.paciente.telefono) {
        enviado = await enviarRecordatorioSMS(cita.paciente.telefono, mensaje)
      } else if (config.tipo === 'email' && cita.paciente.email) {
        enviado = await enviarRecordatorioEmail(
          cita.paciente.email,
          'Recordatorio de Cita - Mobility Group CR',
          mensaje
        )
      }

      if (enviado) {
        await marcarRecordatorioEnviado(cita.id, config.tipo, horasAntes)
      }
    }

    console.log('✅ Proceso de recordatorios completado')
    return citas.length
  } catch (error) {
    console.error('❌ Error procesando recordatorios:', error)
    throw error
  }
}
