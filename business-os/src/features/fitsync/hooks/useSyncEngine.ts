'use client'

import { useState, useCallback } from 'react'
import type { SyncContext } from '../types/sync'
import type { SyncAdjustments } from '../types/sync'

interface UseSyncEngineReturn {
  adjustments: SyncAdjustments | null
  syncing: boolean
  error: string | null
  runSync: (context: SyncContext) => Promise<SyncAdjustments | null>
  lastSyncTime: string | null
}

export function useSyncEngine(): UseSyncEngineReturn {
  const [adjustments, setAdjustments] = useState<SyncAdjustments | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('fitsync_sync_adjustments')
    if (!saved) return null
    try {
      const parsed = JSON.parse(saved)
      // Only use if from today
      if (parsed.date === new Date().toISOString().split('T')[0]) {
        return parsed.adjustments
      }
    } catch {}
    return null
  })
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const runSync = useCallback(async (context: SyncContext): Promise<SyncAdjustments | null> => {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch('/api/fitsync/sync-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: SyncAdjustments = await res.json()
      setAdjustments(data)
      setLastSyncTime(new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }))

      // Cache for today
      localStorage.setItem('fitsync_sync_adjustments', JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        adjustments: data,
      }))

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
      return null
    } finally {
      setSyncing(false)
    }
  }, [])

  return { adjustments, syncing, error, runSync, lastSyncTime }
}
