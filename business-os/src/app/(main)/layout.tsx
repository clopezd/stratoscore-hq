import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/user-profile'
import { DashboardShell } from './dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? ''
    const next = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : ''
    redirect(`/login${next}`)
  }

  // Reusar el mismo cliente Supabase para evitar contención del lock de cookies
  let userProfile = null
  try {
    userProfile = await getUserProfile(supabase, user.id)
  } catch (error) {
    console.error('Error loading user profile in layout:', error)
  }

  return <DashboardShell userProfile={userProfile}>{children}</DashboardShell>
}
