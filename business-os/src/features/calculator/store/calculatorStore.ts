import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FinancialInputs, CalculatedMetrics, DEFAULT_INPUTS, WIZARD_STEPS } from '../types'
import { calculateMetrics } from '../services/calculator'

interface CalculatorState {
  currentStep: number
  inputs: FinancialInputs
  metrics: CalculatedMetrics | null
  nextStep: () => void
  prevStep: () => void
  calculate: () => void
  updateInputs: (partial: Partial<FinancialInputs>) => void
  reset: () => void
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      inputs: DEFAULT_INPUTS,
      metrics: null,

      nextStep: () => {
        const { currentStep } = get()
        if (currentStep < WIZARD_STEPS.length) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      calculate: () => {
        const { inputs } = get()
        const metrics = calculateMetrics(inputs)
        set({ metrics })
      },

      updateInputs: (partial) => {
        set((state) => ({ inputs: { ...state.inputs, ...partial } }))
      },

      reset: () => {
        set({ currentStep: 1, inputs: DEFAULT_INPUTS, metrics: null })
      },
    }),
    { name: 'calculator-store' },
  ),
)
