import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// ── Routing table ─────────────────────────────────────────────────────────
//
//  stratoscore.app          → flujo normal (/ = landing, /dashboard = auth…)
//  www.stratoscore.app      → flujo normal
//  lavanderia.stratoscore.app → rewrite a /lavanderia  (app operativa)
//  lavanderia-logistica-*.vercel.app → landing page (/)
//
// ─────────────────────────────────────────────────────────────────────────

/** Dominios raíz: siempre flujo normal de auth/landing. */
const MAIN_HOSTNAMES = new Set(['stratoscore.app', 'www.stratoscore.app'])

/**
 * Devuelve true si el hostname tiene el subdominio EXACTAMENTE 'lavanderia'
 * seguido por un punto (no 'lavanderia-logistica' ni 'lavanderia2').
 * Funciona en producción (lavanderia.stratoscore.app) y localhost
 * (lavanderia.localhost:3000).
 */
function isLavanderiaSubdomain(host: string): boolean {
  const hostname = host.split(':')[0] // quitar puerto
  return hostname.startsWith('lavanderia.')
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]
  const pathname = request.nextUrl.pathname

  // ── 1. Dominios raíz → flujo normal (landing en /, dashboard con auth) ─
  if (MAIN_HOSTNAMES.has(hostname)) {
    return await updateSession(request)
  }

  // ── 2. Subdominio EXACTAMENTE 'lavanderia.' → App operativa ────────────
  // lavanderia.stratoscore.app  →  rewrite interno a /lavanderia/*
  // Guard anti-loop: solo si la ruta aún no apunta a /lavanderia
  if (isLavanderiaSubdomain(hostname)) {
    if (!pathname.startsWith('/lavanderia') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? '/lavanderia' : `/lavanderia${pathname}`
      return NextResponse.rewrite(url)
    }
    // Ya está en /lavanderia (o /api) → dejar pasar sin reescribir
    return NextResponse.next()
  }

  // ── 3. Vercel preview URL del proyecto lavandería → Landing Page ────────
  // lavanderia-logistica-*.vercel.app  →  /  (landing pública)
  // Usamos hostname (sin puerto) para el match
  if (hostname.includes('lavanderia-logistica')) {
    if (pathname === '/') {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.rewrite(url)
  }

  // ── 4. Cualquier otro host → flujo normal de auth ──────────────────────
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
