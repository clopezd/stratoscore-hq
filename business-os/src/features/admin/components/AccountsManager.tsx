'use client'

import { useState } from 'react'
import { Plus, X, RotateCcw } from 'lucide-react'

interface AccountsManagerProps {
  accounts: string[]
  onUpdate: (accounts: string[]) => void
  onReset: () => void
}

export function AccountsManager({ accounts, onUpdate, onReset }: AccountsManagerProps) {
  const [newAccount, setNewAccount] = useState('')

  const handleAdd = () => {
    const trimmed = newAccount.trim()
    if (!trimmed || accounts.includes(trimmed)) return
    onUpdate([...accounts, trimmed])
    setNewAccount('')
  }

  const handleRemove = (account: string) => {
    onUpdate(accounts.filter((a) => a !== account))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70">
            Cuentas Personalizadas
          </h3>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
            Agrega cuentas adicionales para tus transacciones
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/60 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Resetear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => (
          <span
            key={account}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/[0.06] dark:text-white/60"
          >
            {account}
            <button
              onClick={() => handleRemove(account)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {accounts.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-white/30">
            No hay cuentas personalizadas. Se usan las cuentas predeterminadas.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nueva cuenta..."
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
