import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si ya viene un 'next' en la URL, respetarlo
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Si no hay 'next', obtener perfil y redirigir según rol
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, business_unit')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          // Admin → Mission Control (/dashboard)
          if (profile.role === 'admin') {
            return NextResponse.redirect(`${origin}/dashboard`)
          }

          // Cliente → Su business unit
          switch (profile.business_unit) {
            case 'videndum':
              return NextResponse.redirect(`${origin}/videndum`)
            case 'mobility':
              return NextResponse.redirect(`${origin}/mobility`)
            case 'confirma':
              return NextResponse.redirect(`${origin}/confirma`)
            case 'finance':
              return NextResponse.redirect(`${origin}/finanzas`)
            default:
              // Cliente sin business unit → dashboard genérico
              return NextResponse.redirect(`${origin}/dashboard`)
          }
        }
      }

      // Fallback: redirigir a dashboard si no hay perfil
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Código inválido o expirado → login con error
  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}
