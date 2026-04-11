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

const MAIN_HOSTNAMES = new Set(['stratoscore.app', 'www.stratoscore.app', 'app.stratoscore.app'])

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
  '/demo-landing',
  '/fitsync-landing',
  '/medcare/agendar-estudio'
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function isLavanderiaSubdomain(hostname: string): boolean {
  return hostname.startsWith('lavanderia.') && !hostname.startsWith('lavanderia-')
}

function isFitSyncSubdomain(hostname: string): boolean {
  return hostname.startsWith('fitsync.')
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

  // ── 0. Subdominio fitsync → rewrite a /fitsync-landing y /fitsync ────────
  if (isFitSyncSubdomain(hostname)) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
    }
    if (pathname === '/') {
      return addSecurityHeaders(NextResponse.rewrite(new URL('/fitsync-landing', request.url), { request: { headers: requestHeaders } }))
    }
    if (pathname === '/app' || pathname.startsWith('/app/')) {
      const appPath = pathname === '/app' ? '/fitsync' : `/fitsync${pathname.slice(4)}`
      return addSecurityHeaders(NextResponse.rewrite(new URL(appPath, request.url), { request: { headers: requestHeaders } }))
    }
    if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/fitsync')) {
      return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
    }
    return addSecurityHeaders(NextResponse.rewrite(new URL('/fitsync-landing', request.url), { request: { headers: requestHeaders } }))
  }

  // ── 1. Subdominio lavanderia → rewrite a /lavanderia ─────────────────────
  if (isLavanderiaSubdomain(hostname)) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
    const rewritePath = pathname === '/' ? '/lavanderia' : `/lavanderia${pathname}`
    return addSecurityHeaders(NextResponse.rewrite(new URL(rewritePath, request.url)))
  }

  // ── 2. Preview URLs de lavanderia-logistica → forzar landing ─────────────
  if (hostname.includes('lavanderia-logistica')) {
    if (pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return addSecurityHeaders(NextResponse.rewrite(url))
    }
    return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  // ── 3. Dominios raíz (stratoscore.app, www.) ─────────────────────────────
  if (MAIN_HOSTNAMES.has(hostname)) {
    if (pathname === '/') {
      return addSecurityHeaders(NextResponse.rewrite(new URL('/landing.html', request.url), { request: { headers: requestHeaders } }))
    }
    if (isPublicPath(pathname) || pathname === '/landing.html' || pathname.startsWith('/api/') || pathname.startsWith('/lavanderia')) {
      return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
    }
    if (!hasSession(request)) {
      const loginUrl = new URL('/login', request.url)
      if (pathname !== '/') loginUrl.searchParams.set('next', pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
    return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  // ── 4. Cualquier otro host (incluyendo localhost) → pasar con headers ────
  return addSecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } })
  )
}

// ── Security Headers (OWASP best practices) ───────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://*.supabase.co https://*.vercel-scripts.com https://*.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://openrouter.ai https://*.vercel-insights.com https://*.vercel-scripts.com https://api.huli.io https://wa.me; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  )
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
