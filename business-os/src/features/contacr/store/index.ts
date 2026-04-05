import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Empresa, Movimiento, DashboardKPIs } from '../types'

interface ContaCRState {
  empresas: Empresa[]
  empresaActiva: Empresa | null
  movimientos: Movimiento[]
  kpis: DashboardKPIs
  isLoading: boolean
  error: string | null

  setEmpresas: (empresas: Empresa[]) => void
  setEmpresaActiva: (empresa: Empresa | null) => void
  addEmpresa: (empresa: Empresa) => void
  setMovimientos: (movimientos: Movimiento[]) => void
  setKpis: (kpis: DashboardKPIs) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useContaCRStore = create<ContaCRState>()(
  persist(
    (set) => ({
      empresas: [],
      empresaActiva: null,
      movimientos: [],
      kpis: { totalIngresos: 0, totalGastos: 0, balance: 0, movimientosCount: 0 },
      isLoading: false,
      error: null,

      setEmpresas: (empresas) => set({ empresas }),
      setEmpresaActiva: (empresa) => set({ empresaActiva: empresa }),
      addEmpresa: (empresa) => set((s) => ({ empresas: [...s.empresas, empresa] })),
      setMovimientos: (movimientos) => set({ movimientos }),
      setKpis: (kpis) => set({ kpis }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'contacr-store',
      partialize: (state) => ({ empresaActiva: state.empresaActiva }),
    }
  )
)
