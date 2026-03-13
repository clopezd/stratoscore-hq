import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
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

  return <DashboardShell>{children}</DashboardShell>
}
