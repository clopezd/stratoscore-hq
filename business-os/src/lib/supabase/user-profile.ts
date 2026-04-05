import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  user_id: string
  email: string
  role: 'admin' | 'client'
  business_unit?: 'videndum' | 'mobility' | 'confirma' | 'finance' | 'contacr' | null
  company_name?: string | null
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Obtiene el perfil completo del usuario autenticado
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    // Si no hay perfil, retornar null sin error
    if (!data) {
      console.log('No user profile found for user:', user.id)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error)
    return null
  }
}

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}

/**
 * Obtiene la ruta de redirección según el perfil del usuario
 */
export function getRedirectPath(profile: UserProfile | null): string {
  if (!profile) return '/login'

  // Admin → Mission Control
  if (profile.role === 'admin') {
    return '/'
  }

  // Cliente → Su business unit
  switch (profile.business_unit) {
    case 'videndum':
      return '/videndum'
    case 'mobility':
      return '/mobility'
    case 'confirma':
      return '/confirma'
    case 'finance':
      return '/finanzas'
    case 'contacr':
      return '/contacr'
    default:
      // Cliente sin business unit asignado → dashboard genérico
      return '/dashboard'
  }
}

/**
 * Actualiza el perfil del usuario actual
 */
export async function updateUserProfile(
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'email' | 'created_at' | 'updated_at'>>
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data as UserProfile
}
