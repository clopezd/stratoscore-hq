import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile, getRedirectPath } from '@/lib/supabase/user-profile'

export default async function RootPage() {
  // Si llegan aquí es porque el middleware dejó pasar (tiene sesión)
  // Usuarios sin sesión ven /landing.html via rewrite en middleware
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(supabase, user.id)
  redirect(getRedirectPath(profile))
}
