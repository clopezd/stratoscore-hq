/**
 * 📱 Servicio de WhatsApp con Twilio
 *
 * Envía mensajes de WhatsApp reales usando Twilio API
 */

import twilio from 'twilio'

// Configuración de Twilio desde variables de entorno
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

// Validar que las credenciales existan
if (!accountSid || !authToken) {
  console.warn('⚠️ Twilio no configurado. Credenciales faltantes en .env.local')
}

// Inicializar cliente Twilio
const client = accountSid && authToken ? twilio(accountSid, authToken) : null

/**
 * Formatear número de teléfono de Costa Rica a formato internacional
 *
 * Ejemplos:
 * - "88887777" -> "+50688887777"
 * - "+50688887777" -> "+50688887777"
 * - "50688887777" -> "+50688887777"
 * - "8888-7777" -> "+50688887777"
 */
export function formatPhoneNumberCR(phone: string): string {
  // Remover espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '')

  // Si empieza con +, dejarlo como está
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // Si empieza con 506, agregar +
  if (cleaned.startsWith('506')) {
    return '+' + cleaned
  }

  // Si es número local (8 dígitos), agregar código de país
  if (cleaned.length === 8) {
    return '+506' + cleaned
  }

  // En cualquier otro caso, asumir que es correcto
  return cleaned
}

/**
 * Envía un mensaje de WhatsApp
 *
 * @param to - Número de WhatsApp del destinatario (formato: +506XXXXXXXX o 88887777)
 * @param message - Contenido del mensaje
 * @returns Promise<boolean> - true si se envió exitosamente
 */
export async function enviarWhatsApp(
  to: string,
  message: string
): Promise<boolean> {
  // Si no está configurado Twilio, modo simulado
  if (!client) {
    console.log('📱 [SIMULADO] WhatsApp a:', to)
    console.log('Mensaje:', message)
    console.log('---')
    return true
  }

  try {
    // Formatear número de teléfono a formato internacional
    const phoneFormatted = formatPhoneNumberCR(to)
    // Asegurar formato correcto de WhatsApp
    const toFormatted = phoneFormatted.startsWith('whatsapp:') ? phoneFormatted : `whatsapp:${phoneFormatted}`

    console.log(`📱 Enviando WhatsApp a ${toFormatted}...`)

    // Enviar mensaje real
    const messageSent = await client.messages.create({
      body: message,
      from: whatsappFrom,
      to: toFormatted,
    })

    console.log(`✅ WhatsApp enviado. SID: ${messageSent.sid}`)
    console.log(`   Estado: ${messageSent.status}`)

    return true
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error)

    // Log del error específico de Twilio
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
    }

    return false
  }
}

/**
 * Envía WhatsApp a múltiples destinatarios
 *
 * @param messages - Array de {to, message}
 * @returns Promise<number> - Cantidad de mensajes enviados exitosamente
 */
export async function enviarWhatsAppBatch(
  messages: Array<{ to: string; message: string }>
): Promise<number> {
  let enviados = 0

  for (const { to, message } of messages) {
    const resultado = await enviarWhatsApp(to, message)
    if (resultado) {
      enviados++
    }

    // Delay de 1 segundo entre mensajes (rate limiting de Twilio)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`📊 Batch completado: ${enviados}/${messages.length} enviados`)

  return enviados
}

/**
 * Verifica si Twilio está configurado correctamente
 */
export function twilioConfigurado(): boolean {
  return !!(accountSid && authToken)
}

/**
 * Obtiene el estado de la configuración
 */
export function getEstadoTwilio() {
  return {
    configurado: twilioConfigurado(),
    accountSid: accountSid ? `${accountSid.substring(0, 8)}...` : 'NO CONFIGURADO',
    whatsappFrom: whatsappFrom,
    modo: twilioConfigurado() ? 'REAL' : 'SIMULADO',
  }
}
