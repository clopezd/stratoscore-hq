import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CodesManager } from '@/features/lavanderia/admin/components/CodesManager'

export default async function AdminCodesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/lavanderia')

  const { data: rawCodes } = await supabase
    .from('access_codes')
    .select('id, code, is_used, created_at, used_at, used_by')
    .order('created_at', { ascending: false })

  const codes = rawCodes ?? []

  const usedByIds = codes
    .filter(c => c.used_by !== null)
    .map(c => c.used_by as string)

  let emailMap: Record<string, string> = {}

  if (usedByIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', usedByIds)

    emailMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name ?? '']))
  }

  const codesWithEmail = codes.map(c => ({
    id: c.id,
    code: c.code,
    is_used: c.is_used,
    created_at: c.created_at,
    used_at: c.used_at,
    used_by_email: c.used_by ? (emailMap[c.used_by] ?? null) : null,
  }))

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Códigos de acceso</h1>
        <p className="mt-1 text-sm text-gray-500">
          Genera y gestiona los códigos que los usuarios necesitan para registrarse.
        </p>
      </div>
      <CodesManager codes={codesWithEmail} />
    </div>
  )
}
