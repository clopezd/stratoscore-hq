'use client'

import { useState } from 'react'
import { Plus, X, RotateCcw } from 'lucide-react'

interface CategoryManagerProps {
  expenseCategories: string[]
  incomeCategories: string[]
  onAddCategory: (type: 'expense' | 'income', category: string) => void
  onRemoveCategory: (type: 'expense' | 'income', category: string) => void
  onUpdateCategory: (type: 'expense' | 'income', oldName: string, newName: string) => void
  onResetCategories: (type: 'expense' | 'income') => void
}

function CategoryList({
  title,
  type,
  categories,
  onAdd,
  onRemove,
  onReset,
}: {
  title: string
  type: 'expense' | 'income'
  categories: string[]
  onAdd: (type: 'expense' | 'income', cat: string) => void
  onRemove: (type: 'expense' | 'income', cat: string) => void
  onReset: (type: 'expense' | 'income') => void
}) {
  const [newCat, setNewCat] = useState('')

  const handleAdd = () => {
    const trimmed = newCat.trim()
    if (!trimmed) return
    onAdd(type, trimmed)
    setNewCat('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">{title}</h3>
        <button
          onClick={() => onReset(type)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/60 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Resetear
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/[0.06] dark:text-white/60"
          >
            {cat}
            <button
              onClick={() => onRemove(type, cat)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nueva categoria..."
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] text-gray-700 dark:text-white/70 placeholder:text-gray-400 dark:placeholder:text-white/30"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function CategoryManager({
  expenseCategories,
  incomeCategories,
  onAddCategory,
  onRemoveCategory,
  onResetCategories,
}: CategoryManagerProps) {
  return (
    <div className="space-y-8">
      <CategoryList
        title="Categorias de Gastos"
        type="expense"
        categories={expenseCategories}
        onAdd={onAddCategory}
        onRemove={onRemoveCategory}
        onReset={onResetCategories}
      />
      <CategoryList
        title="Categorias de Ingresos"
        type="income"
        categories={incomeCategories}
        onAdd={onAddCategory}
        onRemove={onRemoveCategory}
        onReset={onResetCategories}
      />
    </div>
  )
}
