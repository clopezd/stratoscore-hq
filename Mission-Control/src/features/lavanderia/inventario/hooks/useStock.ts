'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStockPorUbicacion } from '../services/inventarioService'
import type { StockPorUbicacion } from '../types/inventario'

export function useStock() {
  const [stock, setStock] = useState<StockPorUbicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = useCallback(async () => {
    try {
      const data = await getStockPorUbicacion()
      setStock(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar stock')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStock()

    const supabase = createClient()
    const channel = supabase
      .channel('inventario_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'movimientos_inventario' },
        () => fetchStock()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchStock])

  return { stock, loading, error, refetch: fetchStock }
}
