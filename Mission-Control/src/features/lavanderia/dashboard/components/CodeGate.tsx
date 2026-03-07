'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAccessCode } from '../actions/access'

export function CodeGate() {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)

    startTransition(async () => {
      const result = await verifyAccessCode(code)
      if (result.success) {
        router.refresh()
      } else {
        setError(true)
        setCode('')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#e8f4f8] to-[#f0f9ff] flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0077B6]/50 mb-1">
            Portal Oficial · Servicio Exclusivo
          </p>
          <h1 className="text-xl font-black text-[#0077B6] tracking-tight leading-tight">
            MEDCARE
            <span className="block text-sm font-semibold text-[#00B4D8] mt-0.5 tracking-normal">
              C&amp;C Clean Express
            </span>
          </h1>
          <div className="mt-2 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[#00B4D8]/50 to-transparent" />
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#0077B6]/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#0077B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-800">Acceso restringido</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa el código de acceso para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false) }}
              placeholder="Código de acceso"
              autoComplete="off"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest uppercase focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? 'border-red-300 bg-red-50 focus:ring-red-400 text-red-700'
                  : 'border-gray-200 bg-gray-50 focus:ring-[#0077B6]/40 text-gray-800'
              }`}
            />

            {error && (
              <p className="text-center text-xs font-semibold text-red-500">
                Código incorrecto. Inténtalo de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={!code.trim() || isPending}
              className="w-full py-3 rounded-xl bg-[#0077B6] text-white font-bold text-sm hover:bg-[#005f8e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
