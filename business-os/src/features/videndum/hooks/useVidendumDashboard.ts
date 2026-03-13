'use client'

import { useState, useEffect, useCallback } from 'react'
import type { VidendumDashboardData, VidendumFilters, CatalogType, YearRange } from '../types'

const DEFAULT_FILTERS: VidendumFilters = {
  catalogType: 'all',
  yearRange: 'all',
}

export function useVidendumDashboard() {
  const [filters, setFilters] = useState<VidendumFilters>(DEFAULT_FILTERS)
  const [data, setData] = useState<VidendumDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (f: VidendumFilters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        catalog_type: f.catalogType,
        year_range: f.yearRange,
      })
      const res = await fetch(`/api/videndum/dashboard?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(filters)
  }, [filters, fetchData])

  const setCatalogType = (catalogType: CatalogType) =>
    setFilters(f => ({ ...f, catalogType }))

  const setYearRange = (yearRange: YearRange) =>
    setFilters(f => ({ ...f, yearRange }))

  return { data, loading, error, filters, setCatalogType, setYearRange }
}
