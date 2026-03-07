'use client'

import { useState } from 'react'
import { createAccessCode, deleteAccessCode } from '../actions/admin'

interface AccessCode {
  id: string
  code: string
  is_used: boolean
  created_at: string
  used_at: string | null
  used_by_email: string | null
}

interface Props {
  codes: AccessCode[]
}

export function CodesManager({ codes: initialCodes }: Props) {
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setLastGenerated(null)

    const result = await createAccessCode()

    if (result.error) {
      setError(result.error)
    } else if (result.code) {
      const newCode: AccessCode = {
        id: crypto.randomUUID(),
        code: result.code,
        is_used: false,
        created_at: new Date().toISOString(),
        used_at: null,
        used_by_email: null,
      }
      setLastGenerated(result.code)
      setCodes([newCode, ...codes])
    }

    setGenerating(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteAccessCode(id)
    if (result.error) {
      setError(result.error)
    } else {
      setCodes(codes.filter(c => c.id !== id))
    }
    setDeletingId(null)
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const unused = codes.filter(c => !c.is_used).length
  const used = codes.filter(c => c.is_used).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Disponibles</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{unused}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Utilizados</p>
          <p className="mt-1 text-3xl font-bold text-gray-400">{used}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:col-span-1 col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-3xl font-bold text-gray-700">{codes.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-900">Generar código de acceso</p>
            <p className="mt-0.5 text-xs text-blue-600">El código generado puede ser compartido con un empleado o cliente para que se registre.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generando...' : '+ Nuevo código'}
          </button>
        </div>

        {lastGenerated && (
          <div className="mt-4 flex items-center gap-3">
            <span className="rounded-md bg-white px-4 py-2 font-mono text-xl font-bold tracking-widest text-blue-700 shadow-sm">
              {lastGenerated}
            </span>
            <button
              onClick={() => handleCopy(lastGenerated)}
              className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
            >
              {copied === lastGenerated ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Todos los códigos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Código</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Creado</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Registrado por</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Fecha uso</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    No hay códigos generados aún.
                  </td>
                </tr>
              )}
              {codes.map(c => (
                <tr key={c.id} className={c.is_used ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold tracking-widest ${c.is_used ? 'text-gray-400' : 'text-gray-900'}`}>
                        {c.code}
                      </span>
                      {!c.is_used && (
                        <button
                          onClick={() => handleCopy(c.code)}
                          className="rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                          {copied === c.code ? '✓' : 'copiar'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {c.is_used ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Usado</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Disponible</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.used_by_email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {c.used_at
                      ? new Date(c.used_at).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!c.is_used && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === c.id ? '...' : 'Eliminar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
