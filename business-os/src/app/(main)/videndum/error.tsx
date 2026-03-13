'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Videndum Error Boundary]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white/[0.03] border border-red-500/20 rounded-xl p-8 text-center">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Error al cargar Videndum
        </h2>

        <p className="text-sm text-white/50 mb-1">
          Ocurrió un problema al cargar el dashboard
        </p>

        <p className="text-xs font-mono text-red-400/70 bg-red-500/5 rounded px-3 py-2 mb-6 break-words">
          {error.message}
        </p>

        {error.digest && (
          <p className="text-[10px] text-white/20 mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Reintentar
        </button>

        <div className="mt-6 pt-6 border-t border-white/[0.05]">
          <p className="text-xs text-white/30">
            Si el problema persiste, contacta al administrador
          </p>
        </div>
      </div>
    </div>
  )
}
