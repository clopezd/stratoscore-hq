import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListaPacientes } from '@/features/mobility/components/ListaPacientes'

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'operador'].includes(profile.role)) {
    redirect('/mobility')
  }

  return <ListaPacientes />
}
