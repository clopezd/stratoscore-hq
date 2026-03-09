'use client'

// ─── Videndum — Main Data Hook ────────────────────────────────────────────────
// Gestiona estado local + sincronización con Supabase (realtime opcional).

import { useState, useEffect, useCallback } from 'react'
import type { VidendumRecord, VidendumFilters, VidendumPagination } from '../types'
import { getRecords } from '../services/videndumService'

interface UseVidendumState {
  records: VidendumRecord[]
  loading: boolean
  error: string | null
  pagination: VidendumPagination
  filters: VidendumFilters
}

const DEFAULT_PAGINATION: VidendumPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
}

export function useVidendum(initialFilters: VidendumFilters = {}) {
  const [state, setState] = useState<UseVidendumState>({
    records: [],
    loading: true,
    error: null,
    pagination: DEFAULT_PAGINATION,
    filters: initialFilters,
  })

  const fetch = useCallback(
    async (filters: VidendumFilters = state.filters, page = state.pagination.page) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const result = await getRecords(filters, page, state.pagination.pageSize)
        setState((prev) => ({
          ...prev,
          records: result.data,
          pagination: result.pagination,
          loading: false,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        }))
      }
    },
    [state.filters, state.pagination.page, state.pagination.pageSize]
  )

  useEffect(() => {
    fetch(initialFilters, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFilters = useCallback((filters: VidendumFilters) => {
    setState((prev) => ({ ...prev, filters, pagination: { ...prev.pagination, page: 1 } }))
    fetch(filters, 1)
  }, [fetch])

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, pagination: { ...prev.pagination, page } }))
    fetch(state.filters, page)
  }, [fetch, state.filters])

  const refetch = useCallback(() => fetch(), [fetch])

  return {
    records: state.records,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    setFilters,
    setPage,
    refetch,
  }
}
