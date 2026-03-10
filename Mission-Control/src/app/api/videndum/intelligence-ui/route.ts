/**
 * Proxy seguro para el Radar de Inteligencia Competitiva.
 * Verifica sesión Supabase antes de ejecutar el análisis.
 */
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 90

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const intelligenceUrl = new URL('/api/videndum/intelligence', new URL(req.url).origin).toString()

  const upstream = await fetch(intelligenceUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!upstream.ok) {
    const msg = await upstream.text()
    return new Response(msg, { status: upstream.status })
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}
