'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WeeklySummaryData } from '../types'

export function useWeeklyDashboard() {
  const [data, setData] = useState<WeeklySummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/videndum/weekly-summary')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando resumen')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
