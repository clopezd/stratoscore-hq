import { NextRequest, NextResponse } from 'next/server'

interface ContactPayload {
  nombre: string
  email: string
  telefono: string
  servicio?: string
  mensaje?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactPayload = await req.json()

    if (!body.nombre || !body.email || !body.telefono) {
      return NextResponse.json(
        { error: 'Nombre, email y teléfono son requeridos' },
        { status: 400 }
      )
    }

    console.log('[TICO Contact]', {
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      servicio: body.servicio,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Consulta recibida. Responderemos en 24 horas.'
    })
  } catch (error) {
    console.error('[TICO Contact] Error:', error)
    return NextResponse.json(
      { error: 'Error procesando la consulta' },
      { status: 500 }
    )
  }
}
