'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WeeklySummaryData } from '../types'

export function useWeeklyDashboard() {
  const [data, setData] = useState<WeeklySummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null) // null = latest

  const fetchData = useCallback(async (period?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      const p = period ?? selectedPeriod
      if (p) {
        const [y, m] = p.split('-')
        params.set('year', y)
        params.set('month', String(parseInt(m)))
      }
      const qs = params.toString()
      const res = await fetch(`/api/videndum/weekly-summary${qs ? '?' + qs : ''}`)
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
  }, [selectedPeriod])

  useEffect(() => { fetchData() }, [fetchData])

  const changePeriod = useCallback((period: string | null) => {
    setSelectedPeriod(period)
    fetchData(period)
  }, [fetchData])

  return { data, loading, error, refresh: () => fetchData(), selectedPeriod, changePeriod }
}
