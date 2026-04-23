import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListaTerapeutas } from '@/features/mobility/components/ListaTerapeutas'

export default async function TerapeutasPage() {
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

  return <ListaTerapeutas />
}
