import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/actions/auth'

export const metadata: Metadata = {
  title: 'Lavandería Carlos — Panel Operativo',
  description: 'Panel de operaciones de la lavandería',
}

export default async function LavanderiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let isStaff = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
    isStaff = profile?.role === 'admin' || profile?.role === 'operador'
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #f0f8ff 0%, #e8f5fe 50%, #f0fcff 100%)' }}
    >
      <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-5">
          <Link href="/lavanderia" className="flex items-center gap-2 font-bold text-[#0077B6]">
            🫧 Lavandería Carlos
          </Link>

          <div className="h-4 w-px bg-gray-200" />

          <Link href="/lavanderia" className="text-sm font-semibold text-[#0077B6] hover:text-[#005f8e] transition-colors">
            Pedidos
          </Link>

          {isStaff && (
            <>
              <Link href="/lavanderia/recepcion" className="text-sm font-semibold text-[#0077B6] hover:text-[#005f8e] transition-colors">
                Recepción
              </Link>
              <Link href="/lavanderia/logistica" className="text-sm font-semibold text-[#0077B6] hover:text-[#005f8e] transition-colors">
                Logística
              </Link>
              <Link href="/lavanderia/inventario" className="text-sm font-semibold text-[#0077B6] hover:text-[#005f8e] transition-colors">
                Inventario
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/lavanderia/admin/codes" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Admin
              </Link>
              <Link href="/lavanderia/admin/historial" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Historial
              </Link>
            </>
          )}

          <form action={signout} className="ml-auto">
            <button type="submit" className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      <main className="relative z-10">{children}</main>
    </div>
  )
}
