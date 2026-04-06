import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportesAnalytics } from '@/features/mobility/components/ReportesAnalytics'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar que el usuario tenga rol de admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Restringido
          </h1>
          <p className="text-gray-600">
            Solo administradores pueden acceder a los reportes
          </p>
        </div>
      </div>
    )
  }

  return <ReportesAnalytics />
}
