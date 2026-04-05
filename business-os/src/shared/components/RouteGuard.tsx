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
    const allowed = canAccessRoute(pathname, role)
    if (!allowed) {
      console.warn(`[RouteGuard] Blocked ${pathname} — role="${role}", redirecting to /dashboard`)
      router.replace('/dashboard')
    }
  }, [pathname, role, loading, router])

  // Durante la carga no bloqueamos — el server layout ya validó la sesión.
  // El useEffect redirigirá si el rol no tiene permiso una vez que cargue.
  if (!loading && !canAccessRoute(pathname, role)) return null

  return <>{children}</>
}
