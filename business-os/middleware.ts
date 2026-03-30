// Solo Web APIs — sin imports de Node.js ni librerías SSR.
// La validación completa de sesión Supabase ocurre en los Server Components/layouts.
import { type NextRequest, NextResponse } from 'next/server'

// ── Routing table ─────────────────────────────────────────────────────────
//
//  stratoscore.app / www.stratoscore.app  → landing (/) pública, resto protegido
//  lavanderia.stratoscore.app             → rewrite a /lavanderia
//  lavanderia-logistica-*.vercel.app      → siempre landing (/)
//
// ─────────────────────────────────────────────────────────────────────────

const MAIN_HOSTNAMES = new Set(['stratoscore.app', 'www.stratoscore.app'])

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/check-email',
  '/forgot-password',
  '/update-password',
  '/videndum-discovery',
  '/videndum/discovery',
  '/encuesta',
  '/demo-landing'
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function isLavanderiaSubdomain(hostname: string): boolean {
  return hostname.startsWith('lavanderia.') && !hostname.startsWith('lavanderia-')
}

/**
 * Detecta si hay una sesión Supabase activa usando solo cookies (Web API).
 * No valida el JWT — esa responsabilidad recae en createServerClient dentro
 * de cada layout/page protegida. Aquí solo se decide si redirigir o no.
 */
function hasSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
}

// ── Middleware principal ───────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Inyectar pathname como header para que los layouts puedan leerlo
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Resolución de hostname: x-forwarded-host → host → nextUrl.hostname
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.split(':')[0]?.trim()
  const hostHeader = request.headers.get('host')?.split(':')[0]?.trim()
  const hostname = forwardedHost ?? hostHeader ?? request.nextUrl.hostname

  // ── 1. Subdominio lavanderia → rewrite a /lavanderia ─────────────────────
  if (isLavanderiaSubdomain(hostname)) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return NextResponse.next({ request: { headers: requestHeaders } })
    const rewritePath = pathname === '/' ? '/lavanderia' : `/lavanderia${pathname}`
    return NextResponse.rewrite(new URL(rewritePath, request.url))
  }

  // ── 2. Preview URLs de lavanderia-logistica → forzar landing ─────────────
  if (hostname.includes('lavanderia-logistica')) {
    if (pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.rewrite(url)
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // ── 3. Dominios raíz (stratoscore.app, www.) ─────────────────────────────
  if (MAIN_HOSTNAMES.has(hostname)) {
    // Rutas públicas: siempre accesibles
    if (isPublicPath(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/lavanderia')) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    // Rutas protegidas: redirigir a login si no hay sesión (preserva la ruta original)
    if (!hasSession(request)) {
      const loginUrl = new URL('/login', request.url)
      if (pathname !== '/') loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // ── 4. Cualquier otro host (incluyendo localhost) → pasar con headers ────
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
