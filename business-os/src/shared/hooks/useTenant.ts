'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { CLIENT_NAME, CLIENT_SUBTITLE } from '@/shared/config/client'

export interface TenantBrand {
  name: string
  subtitle: string
  logoUrl: string | null
  loading: boolean
}

const FALLBACK: TenantBrand = {
  name:     CLIENT_NAME,
  subtitle: CLIENT_SUBTITLE,
  logoUrl:  null,
  loading:  false,
}

export function useTenant(): TenantBrand {
  const { profile } = useAuth()
  const [tenant, setTenant] = useState<TenantBrand>({ ...FALLBACK, loading: true })

  useEffect(() => {
    if (!profile?.tenant_id) {
      setTenant(FALLBACK)
      return
    }

    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('tenants')
        .select('name, logo_url')
        .eq('id', profile!.tenant_id!)
        .single()

      if (cancelled) return

      if (data) {
        setTenant({
          name:     data.name,
          subtitle: '',
          logoUrl:  data.logo_url,
          loading:  false,
        })
      } else {
        setTenant(FALLBACK)
      }
    }

    load()
    return () => { cancelled = true }
  }, [profile?.tenant_id])

  return tenant
}
