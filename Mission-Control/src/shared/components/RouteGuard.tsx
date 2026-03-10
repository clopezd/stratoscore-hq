'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { canAccessRoute } from '@/lib/permissions'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!canAccessRoute(pathname, role)) {
      router.replace('/dashboard')
    }
  }, [pathname, role, loading, router])

  // Durante la carga no bloqueamos — el server layout ya validó la sesión.
  // El useEffect redirigirá si el rol no tiene permiso una vez que cargue.
  if (!loading && !canAccessRoute(pathname, role)) return null

  return <>{children}</>
}
