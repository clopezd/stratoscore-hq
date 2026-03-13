'use client'

import { useState } from 'react'

// Stub temporal para Finance OS
export function ChatInterface() {
  const [message, setMessage] = useState('')

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-white/70 mb-2">Chat con Agente IA</p>
        <div className="h-64 bg-white/[0.02] rounded-lg p-4 mb-4 overflow-y-auto">
          <p className="text-xs text-white/40">Agente financiero en desarrollo...</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          disabled
          className="px-4 py-2 bg-indigo-500/50 text-white/50 rounded-lg text-sm cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
