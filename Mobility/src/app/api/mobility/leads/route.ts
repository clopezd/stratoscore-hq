import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Rate limiting simple en memoria (por IP)
const intentos = new Map<string, { count: number; resetAt: number }>()
const MAX_INTENTOS = 5
const VENTANA_MS = 60 * 60 * 1000 // 1 hora

function checkRateLimit(ip: string): boolean {
  const ahora = Date.now()
  const registro = intentos.get(ip)

  if (!registro || ahora > registro.resetAt) {
    intentos.set(ip, { count: 1, resetAt: ahora + VENTANA_MS })
    return true
  }

  if (registro.count >= MAX_INTENTOS) return false

  registro.count++
  return true
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta más tarde.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { nombre, telefono, email, diagnostico_preliminar, medico_referente, fuente } = body

    // Validación básica
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }
    if (!telefono || typeof telefono !== 'string' || telefono.trim().length < 7) {
      return NextResponse.json({ error: 'Teléfono válido es requerido' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('leads_mobility')
      .insert({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email?.trim() || null,
        diagnostico_preliminar: diagnostico_preliminar?.trim() || null,
        medico_referente: medico_referente?.trim() || null,
        fuente: fuente || 'web',
        estado: 'nuevo',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[mobility/leads] Error inserting lead:', error.message)
      return NextResponse.json({ error: 'Error guardando solicitud' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
}
