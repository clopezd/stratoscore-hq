#!/usr/bin/env node
/**
 * 🧪 Test simple de WhatsApp con Twilio
 *
 * Uso:
 * TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=yyy node test-whatsapp-simple.mjs +50688882224
 */

import twilio from 'twilio'

// Credenciales hardcodeadas para testing rápido
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACbc50fa8e0edcdc6c169956463bf620c6'
const authToken = process.env.TWILIO_AUTH_TOKEN || '341bc640357e1b1a288ba795cf77b97b'
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

if (!accountSid || !authToken) {
  console.error('❌ Error: Faltan credenciales de Twilio en .env.local')
  console.error('   Asegúrate de tener:')
  console.error('   - TWILIO_ACCOUNT_SID')
  console.error('   - TWILIO_AUTH_TOKEN')
  process.exit(1)
}

const client = twilio(accountSid, authToken)

// Obtener número del argumento o usar default
const numeroDestino = process.argv[2] || '+50688882224'

console.log('📱 Twilio WhatsApp Test')
console.log('─'.repeat(50))
console.log(`De: ${whatsappFrom}`)
console.log(`Para: whatsapp:${numeroDestino}`)
console.log('─'.repeat(50))

const mensaje = `🧪 Test desde Mobility Group CR

Este es un mensaje de prueba para verificar que Twilio WhatsApp está funcionando correctamente.

Si recibes este mensaje, ¡todo está OK! ✅

Timestamp: ${new Date().toLocaleString('es-CR')}`

console.log('\n📤 Enviando mensaje...\n')

client.messages
  .create({
    from: whatsappFrom,
    to: `whatsapp:${numeroDestino}`,
    body: mensaje
  })
  .then((message) => {
    console.log('✅ Mensaje enviado exitosamente!')
    console.log('─'.repeat(50))
    console.log(`SID: ${message.sid}`)
    console.log(`Status: ${message.status}`)
    console.log(`To: ${message.to}`)
    console.log(`From: ${message.from}`)
    console.log('─'.repeat(50))
    console.log('\n💡 Verifica tu WhatsApp ahora.\n')
    console.log('⚠️  Si no llega:')
    console.log('   1. Verifica que activaste el Sandbox (join <keyword>)')
    console.log('   2. Ve a: https://console.twilio.com/us1/monitor/logs/sms')
    console.log('   3. Busca errores en los logs de Twilio')
  })
  .catch((error) => {
    console.error('❌ Error enviando mensaje:')
    console.error(error.message)

    if (error.code === 20003) {
      console.error('\n💡 Error de autenticación. Verifica:')
      console.error('   - TWILIO_ACCOUNT_SID es correcto')
      console.error('   - TWILIO_AUTH_TOKEN es correcto')
    }

    if (error.code === 21211) {
      console.error('\n💡 Número inválido. Asegúrate de usar formato:')
      console.error('   +50688887777 (con código de país)')
    }

    if (error.code === 63007 || error.message.includes('sandbox')) {
      console.error('\n💡 Error de Sandbox. Necesitas:')
      console.error('   1. Enviar WhatsApp a: +1 415 523 8886')
      console.error('   2. Mensaje: "join <tu-keyword>"')
      console.error('   3. Ver keyword en: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn')
    }

    process.exit(1)
  })
