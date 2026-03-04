import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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
 */
function isLavanderiaSubdomain(host: string): boolean {
  const hostname = host.split(':')[0]
  return hostname.startsWith('lavanderia.')
}

// ── Auth helpers (inlined to avoid Edge Function module resolution issues) ──

function isEmailAllowed(email: string): boolean {
  const allowed = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) ?? []
  return allowed.includes(email.toLowerCase())
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              path: '/',
              sameSite: 'lax',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: SESSION_MAX_AGE,
              ...(options as object),
            })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isPublicRoute =
    isAuthRoute ||
    pathname === '/' ||
    pathname.startsWith('/lavanderia') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/update-password')

  if (isApiRoute) return supabaseResponse

  if (!isPublicRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && !isEmailAllowed(user.email ?? '')) {
    await supabase.auth.signOut()
    const url = new URL('/login', request.url)
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

// ── Middleware principal ───────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]
  const pathname = request.nextUrl.pathname

  // ── 0. Landing pública — sin auth desde cualquier host ──────────────────
  if (pathname === '/') {
    return NextResponse.next()
  }

  // ── 1. Dominios raíz → flujo normal (landing en /, dashboard con auth) ──
  if (MAIN_HOSTNAMES.has(hostname)) {
    return await updateSession(request)
  }

  // ── 2. Subdominio 'lavanderia.' → App operativa ──────────────────────────
  if (isLavanderiaSubdomain(hostname)) {
    if (!pathname.startsWith('/lavanderia') && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? '/lavanderia' : `/lavanderia${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // ── 3. Vercel preview URL del proyecto lavandería → Landing Page ─────────
  if (hostname.includes('lavanderia-logistica')) {
    if (pathname === '/') return NextResponse.next()
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
