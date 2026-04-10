'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'

export default function FitSyncPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Flame size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">FitSync AI</h1>
          <p className="text-sm text-gray-400">Página de prueba</p>
        </div>
      </div>
      <button
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
      >
        Clicks: {count}
      </button>
      <p className="text-gray-500">Si ves esto, la ruta funciona. El problema está en los componentes.</p>
    </div>
  )
}
