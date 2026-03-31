import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categoryColors'

interface AdminConfig {
  expense_categories: string[]
  income_categories: string[]
  agent_system_prompt: string
  custom_accounts: string[]
  calculator_defaults: Record<string, number>
}

const DEFAULT_CONFIG: AdminConfig = {
  expense_categories: [...EXPENSE_CATEGORIES],
  income_categories: [...INCOME_CATEGORIES],
  agent_system_prompt: '',
  custom_accounts: [],
  calculator_defaults: {},
}

export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('admin_config')
          .select('*')
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows found — use defaults
          throw fetchError
        }

        setConfig(data ? { ...DEFAULT_CONFIG, ...data.config } : DEFAULT_CONFIG)
      } catch (err) {
        console.error('Failed to load admin config:', err)
        // Fallback to defaults instead of breaking
        setConfig(DEFAULT_CONFIG)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const persist = useCallback(async (updated: AdminConfig) => {
    setConfig(updated)
    try {
      const supabase = createClient()
      await supabase.from('admin_config').upsert(
        { id: 'default', config: updated, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    } catch (err) {
      console.error('Failed to save admin config:', err)
    }
  }, [])

  const addCategory = useCallback(
    (type: 'expense' | 'income', category: string) => {
      if (!config) return
      const key = type === 'expense' ? 'expense_categories' : 'income_categories'
      if (config[key].includes(category)) return
      persist({ ...config, [key]: [...config[key], category] })
    },
    [config, persist]
  )

  const removeCategory = useCallback(
    (type: 'expense' | 'income', category: string) => {
      if (!config) return
      const key = type === 'expense' ? 'expense_categories' : 'income_categories'
      persist({ ...config, [key]: config[key].filter((c) => c !== category) })
    },
    [config, persist]
  )

  const updateCategory = useCallback(
    (type: 'expense' | 'income', oldName: string, newName: string) => {
      if (!config) return
      const key = type === 'expense' ? 'expense_categories' : 'income_categories'
      persist({
        ...config,
        [key]: config[key].map((c) => (c === oldName ? newName : c)),
      })
    },
    [config, persist]
  )

  const resetCategories = useCallback(
    (type: 'expense' | 'income') => {
      if (!config) return
      const key = type === 'expense' ? 'expense_categories' : 'income_categories'
      const defaults = type === 'expense' ? [...EXPENSE_CATEGORIES] : [...INCOME_CATEGORIES]
      persist({ ...config, [key]: defaults })
    },
    [config, persist]
  )

  const updateAccounts = useCallback(
    (accounts: string[]) => {
      if (!config) return
      persist({ ...config, custom_accounts: accounts })
    },
    [config, persist]
  )

  const resetAccounts = useCallback(() => {
    if (!config) return
    persist({ ...config, custom_accounts: [] })
  }, [config, persist])

  const updateAgentPrompt = useCallback(
    (prompt: string) => {
      if (!config) return
      persist({ ...config, agent_system_prompt: prompt })
    },
    [config, persist]
  )

  const updateCalculatorDefaults = useCallback(
    (defaults: Record<string, number>) => {
      if (!config) return
      persist({ ...config, calculator_defaults: defaults })
    },
    [config, persist]
  )

  return {
    config,
    isLoading,
    error,
    addCategory,
    removeCategory,
    updateCategory,
    resetCategories,
    updateAccounts,
    resetAccounts,
    updateAgentPrompt,
    updateCalculatorDefaults,
  }
}
