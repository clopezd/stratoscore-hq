import { NextResponse } from 'next/server'
import { createClient } from './server'

/**
 * Verifica que hay una sesion activa de Supabase.
 * Retorna el user si esta autenticado, o un NextResponse 401 si no.
 *
 * Uso en API routes:
 * ```ts
 * const auth = await requireAuth()
 * if (auth.response) return auth.response // 401
 * const user = auth.user
 * ```
 */
export async function requireAuth(): Promise<
  | { user: { id: string; email?: string }; response: null }
  | { user: null; response: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return { user, response: null }
}
