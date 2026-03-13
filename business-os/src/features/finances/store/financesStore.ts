import { create } from 'zustand'
import { Transaction, GastoMensual, GastoAnual, FinanceKPIs, VistaRango } from '../types'

interface CustomDateRange {
  start: Date | null
  end: Date | null
}

interface FinancesState {
  transactions: Transaction[]
  gastosMensuales: GastoMensual[]
  gastosAnuales: GastoAnual[]
  kpis: FinanceKPIs
  vista: VistaRango
  customDateRange: CustomDateRange
  isLoading: boolean
  error: string | null

  // Transactions
  setTransactions: (data: Transaction[]) => void
  addTransaction: (t: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  removeTransaction: (id: string) => void

  // Gastos mensuales
  setGastosMensuales: (data: GastoMensual[]) => void
  addGastoMensual: (g: GastoMensual) => void
  updateGastoMensual: (id: string, updates: Partial<GastoMensual>) => void
  removeGastoMensual: (id: string) => void

  // Gastos anuales
  setGastosAnuales: (data: GastoAnual[]) => void
  addGastoAnual: (g: GastoAnual) => void
  updateGastoAnual: (id: string, updates: Partial<GastoAnual>) => void
  removeGastoAnual: (id: string) => void

  // KPIs & filters
  setKpis: (kpis: FinanceKPIs) => void
  setVista: (vista: VistaRango) => void
  setCustomDateRange: (start: Date, end: Date) => void

  // Status
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const DEFAULT_KPIS: FinanceKPIs = {
  totalIngresos: 0,
  totalGastos: 0,
  balance: 0,
  transaccionesCount: 0,
}

export const useFinancesStore = create<FinancesState>()((set) => ({
  transactions: [],
  gastosMensuales: [],
  gastosAnuales: [],
  kpis: DEFAULT_KPIS,
  vista: 'mensual',
  customDateRange: { start: null, end: null },
  isLoading: false,
  error: null,

  setTransactions: (data) => set({ transactions: data }),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  updateTransaction: (id, updates) =>
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

  setGastosMensuales: (data) => set({ gastosMensuales: data }),
  addGastoMensual: (g) => set((s) => ({ gastosMensuales: [...s.gastosMensuales, g] })),
  updateGastoMensual: (id, updates) =>
    set((s) => ({
      gastosMensuales: s.gastosMensuales.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGastoMensual: (id) =>
    set((s) => ({ gastosMensuales: s.gastosMensuales.filter((g) => g.id !== id) })),

  setGastosAnuales: (data) => set({ gastosAnuales: data }),
  addGastoAnual: (g) => set((s) => ({ gastosAnuales: [...s.gastosAnuales, g] })),
  updateGastoAnual: (id, updates) =>
    set((s) => ({
      gastosAnuales: s.gastosAnuales.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGastoAnual: (id) =>
    set((s) => ({ gastosAnuales: s.gastosAnuales.filter((g) => g.id !== id) })),

  setKpis: (kpis) => set({ kpis }),
  setVista: (vista) => set({ vista }),
  setCustomDateRange: (start, end) => set({ customDateRange: { start, end } }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
