import { useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categoryColors'

// Stub temporal para Finance OS
export function useCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([])

  return {
    expenseCategories: [...EXPENSE_CATEGORIES],
    incomeCategories: [...INCOME_CATEGORIES],
    customCategories,
    addCategory: (category: string) => {
      setCustomCategories((prev) => [...prev, category])
    },
    removeCategory: (category: string) => {
      setCustomCategories((prev) => prev.filter((c) => c !== category))
    },
  }
}
