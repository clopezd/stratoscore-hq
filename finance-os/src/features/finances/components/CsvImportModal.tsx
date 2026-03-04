'use client'

import { useState } from 'react'
import { X, Upload, Eye, Check, AlertCircle, Loader2 } from 'lucide-react'
import { createTransaction } from '../services/transactions'
import { Transaction, TransactionInput, CUENTAS, Cuenta, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types'
import { TRANSFER_CATEGORY } from '@/lib/categoryColors'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImported: (transactions: Transaction[]) => void
}

interface ParsedRow {
  tipo: string
  monto: number
  categoria: string
  descripcion: string
  fecha: string
  cuenta: string
  error?: string
}

const VALID_TIPOS = ['ingreso', 'gasto', 'transferencia'] as const
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, TRANSFER_CATEGORY]

function parseCSV(raw: string): ParsedRow[] {
  const lines = raw.trim().split('\n').filter((l) => l.trim())
  return lines.map((line, i) => {
    // Soporte para coma y punto y coma como separador
    const sep = line.includes(';') ? ';' : ','
    const cols = line.split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ''))
    const [tipo = '', montoStr = '', categoria = '', descripcion = '', fecha = '', cuenta = ''] = cols

    const tipoClean = tipo.toLowerCase() as (typeof VALID_TIPOS)[number]
    const monto = parseFloat(montoStr.replace(/[$,\s]/g, ''))

    const errors: string[] = []
    if (!VALID_TIPOS.includes(tipoClean)) errors.push(`tipo "${tipo}" inválido`)
    if (isNaN(monto) || monto <= 0) errors.push(`monto "${montoStr}" inválido`)

    // Cuenta: si está vacía, default a primera
    const cuentaFinal = CUENTAS.find((c) => c.toLowerCase() === cuenta.toLowerCase()) ?? CUENTAS[0]

    // Categoría: si no es válida, usar la primera disponible para el tipo
    let categoriaFinal = categoria
    if (!ALL_CATEGORIES.includes(categoria as never) && tipoClean !== 'transferencia') {
      categoriaFinal = tipoClean === 'ingreso' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    }
    if (tipoClean === 'transferencia') categoriaFinal = TRANSFER_CATEGORY

    // Fecha: si vacía o inválida, usar hoy
    let fechaFinal = fecha
    if (!fecha || isNaN(Date.parse(fecha))) {
      fechaFinal = new Date().toISOString().slice(0, 10)
    }

    return {
      tipo: tipoClean,
      monto,
      categoria: categoriaFinal,
      descripcion,
      fecha: fechaFinal,
      cuenta: cuentaFinal,
      error: errors.length > 0 ? `Línea ${i + 1}: ${errors.join(', ')}` : undefined,
    }
  })
}

function fmtMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

export function CsvImportModal({ isOpen, onClose, onImported }: CsvImportModalProps) {
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<ParsedRow[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const validRows = preview?.filter((r) => !r.error) ?? []
  const invalidRows = preview?.filter((r) => r.error) ?? []

  const handlePreview = () => {
    if (!raw.trim()) return
    const rows = parseCSV(raw)
    setPreview(rows)
    setResult(null)
    setError(null)
  }

  const handleImport = async () => {
    if (!validRows.length) return
    setIsLoading(true)
    setError(null)

    const imported: Transaction[] = []
    let failed = 0

    for (const row of validRows) {
      try {
        const input: TransactionInput = {
          tipo: row.tipo as TransactionInput['tipo'],
          monto: row.monto,
          categoria: row.categoria,
          descripcion: row.descripcion || undefined,
          fecha_hora: new Date(row.fecha + 'T12:00:00').toISOString(),
          cuenta: row.cuenta as Cuenta,
        }
        const tx = await createTransaction(input)
        imported.push(tx)
      } catch {
        failed++
      }
    }

    setResult({ ok: imported.length, failed })
    if (imported.length > 0) onImported(imported)
    setIsLoading(false)
  }

  const handleClose = () => {
    setRaw('')
    setPreview(null)
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neu-bg/70 backdrop-blur-md" onClick={handleClose} />

      <div className="relative bg-neu-bg shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Importar CSV</h2>
            <p className="text-sm text-gray-500 mt-0.5">tipo, monto, categoria, descripcion, fecha, cuenta</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl bg-neu-bg shadow-neu hover:shadow-neu-inset transition-shadow">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Result state */}
        {result ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.ok > 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {result.ok > 0 ? <Check className="w-8 h-8 text-emerald-600" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {result.ok} transacciones importadas
              </p>
              {result.failed > 0 && (
                <p className="text-sm text-red-500 mt-1">{result.failed} fallaron</p>
              )}
            </div>
            <button onClick={handleClose} className="mt-2 px-6 py-2 rounded-xl bg-neu-bg shadow-neu hover:shadow-neu-sm text-gray-700 font-medium transition-all">
              Cerrar
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {/* Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Pega tu CSV aquí
              </label>
              <textarea
                className="w-full h-36 bg-neu-bg shadow-neu-inset rounded-xl p-3 text-sm font-mono text-gray-700 resize-none outline-none focus:ring-2 focus:ring-violet-300"
                placeholder={`ingreso,15000,Ventas Lavandería,Semana 1,2026-03-01,Lavandería\ngasto,2500,Insumos Lavandería,Detergente,2026-03-02,Lavandería\nIngreso,8000,Comisión Seguros,Póliza auto,2026-03-03,Seguros`}
                value={raw}
                onChange={(e) => { setRaw(e.target.value); setPreview(null) }}
              />
            </div>

            {/* Errores globales */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </p>
            )}

            {/* Preview */}
            {preview && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {validRows.length} válidas
                  </p>
                  {invalidRows.length > 0 && (
                    <p className="text-sm text-red-500">{invalidRows.length} con errores</p>
                  )}
                </div>

                {/* Errores de filas */}
                {invalidRows.map((r, i) => (
                  <p key={i} className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded mb-1">
                    {r.error}
                  </p>
                ))}

                {/* Tabla preview */}
                {validRows.length > 0 && (
                  <div className="overflow-x-auto rounded-xl bg-neu-bg shadow-neu-inset max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="text-gray-500 sticky top-0 bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Tipo</th>
                          <th className="px-3 py-2 text-left font-medium">Monto</th>
                          <th className="px-3 py-2 text-left font-medium">Categoría</th>
                          <th className="px-3 py-2 text-left font-medium">Descripción</th>
                          <th className="px-3 py-2 text-left font-medium">Fecha</th>
                          <th className="px-3 py-2 text-left font-medium">Cuenta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                r.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-700' :
                                r.tipo === 'gasto' ? 'bg-red-100 text-red-700' :
                                'bg-violet-100 text-violet-700'
                              }`}>{r.tipo}</span>
                            </td>
                            <td className={`px-3 py-2 font-semibold ${
                              r.tipo === 'ingreso' ? 'text-emerald-600' :
                              r.tipo === 'gasto' ? 'text-red-600' : 'text-violet-600'
                            }`}>{fmtMXN(r.monto)}</td>
                            <td className="px-3 py-2 text-gray-600">{r.categoria}</td>
                            <td className="px-3 py-2 text-gray-500 max-w-[120px] truncate">{r.descripcion || '—'}</td>
                            <td className="px-3 py-2 text-gray-500">{r.fecha}</td>
                            <td className="px-3 py-2 text-gray-600">{r.cuenta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!result && (
          <div className="flex gap-3 mt-6 flex-shrink-0">
            <button
              onClick={handlePreview}
              disabled={!raw.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neu-bg shadow-neu hover:shadow-neu-sm text-gray-700 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading || validRows.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar {validRows.length > 0 ? `(${validRows.length})` : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
