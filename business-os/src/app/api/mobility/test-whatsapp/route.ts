/**
 * 🧪 Endpoint de prueba para WhatsApp
 *
 * POST /api/mobility/test-whatsapp
 * Body: { "to": "+50688887777", "message": "Mensaje de prueba" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { enviarWhatsApp, formatPhoneNumberCR, twilioConfigurado, getEstadoTwilio } from '@/features/mobility/services/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Se requiere "to" y "message" en el body' },
        { status: 400 }
      )
    }

    // Enviar mensaje
    const enviado = await enviarWhatsApp(to, message)

    return NextResponse.json({
      success: enviado,
      to: formatPhoneNumberCR(to),
      message,
      twilio_estado: getEstadoTwilio()
    })
  } catch (error) {
    console.error('Error en test-whatsapp:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/mobility/test-whatsapp',
    descripcion: 'Endpoint de prueba para enviar WhatsApp con Twilio',
    body_ejemplo: {
      to: '+50688887777',
      message: 'Hola desde Mobility Group CR'
    },
    twilio_estado: getEstadoTwilio()
  })
}
