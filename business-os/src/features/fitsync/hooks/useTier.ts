'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FitSyncTier } from '../types/billing'

interface UseTierReturn {
  tier: FitSyncTier
  isPro: boolean
  isElite: boolean
  isPaid: boolean
  loading: boolean
  refresh: () => void
}

export function useTier(): UseTierReturn {
  const [tier, setTier] = useState<FitSyncTier>('free')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/fitsync/checkout/verify')
      const data = await res.json()
      setTier(data.tier || 'free')
    } catch {
      setTier('free')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return {
    tier,
    isPro: tier === 'pro' || tier === 'elite',
    isElite: tier === 'elite',
    isPaid: tier !== 'free',
    loading,
    refresh,
  }
}
