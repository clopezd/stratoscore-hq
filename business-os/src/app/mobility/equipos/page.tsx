import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelEquipos } from '@/features/mobility/components/PanelEquipos'

export default async function EquiposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar que el usuario tenga rol de admin u operador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'operador'].includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Restringido
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección
          </p>
        </div>
      </div>
    )
  }

  return <PanelEquipos />
}
