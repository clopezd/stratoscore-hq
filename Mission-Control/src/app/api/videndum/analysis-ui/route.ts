/**
 * Proxy seguro para el análisis IA de Videndum.
 * Verifica sesión Supabase antes de reenviar la petición al endpoint de análisis
 * con el token de servidor — el cliente nunca lo ve.
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.text()

  const analysisUrl = new URL('/api/videndum/analysis', req.url).toString()
  const upstream = await fetch(analysisUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENCLAW_GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!upstream.ok) {
    const msg = await upstream.text()
    return new Response(msg, { status: upstream.status })
  }

  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
