'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useContaCRStore } from '../store'
import { importCsv, formatCRC } from '../services/movimientos'
import type { ImportResult } from '../types'

export function CsvImportView() {
  const { empresaActiva } = useContaCRStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        setHeaders(lines[0].split(',').map((h) => h.trim()))
        setPreview(
          lines.slice(1, 6).map((l) => l.split(',').map((c) => c.trim()))
        )
      }
    }
    reader.readAsText(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file || !empresaActiva) return
    setImporting(true)
    setError('')
    try {
      const res = await importCsv(empresaActiva.id, file)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview([])
    setHeaders([])
    setResult(null)
    setError('')
  }

  if (!empresaActiva) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-white/50 text-sm">Selecciona una empresa para importar datos</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Importar movimientos</h2>
        <p className="text-sm text-white/40 mt-1">
          Sube un archivo CSV con columnas: fecha, descripcion, tipo, categoria, monto, referencia
        </p>
      </div>

      {/* Resultado de importación */}
      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-emerald-300">Importación completada</h3>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-white/40">Importados:</span>
                  <span className="text-white font-medium ml-2">{result.importados}</span>
                </div>
                <div>
                  <span className="text-white/40">Errores:</span>
                  <span className="text-red-400 font-medium ml-2">{result.errores}</span>
                </div>
                <div>
                  <span className="text-white/40">Total ingresos:</span>
                  <span className="text-emerald-300 font-medium ml-2">{formatCRC(result.totalIngresos)}</span>
                </div>
                <div>
                  <span className="text-white/40">Total gastos:</span>
                  <span className="text-red-400 font-medium ml-2">{formatCRC(result.totalGastos)}</span>
                </div>
              </div>
              {result.detalleErrores.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.detalleErrores.map((err, i) => (
                    <p key={i} className="text-xs text-red-400/70">{err}</p>
                  ))}
                </div>
              )}
              <button
                onClick={reset}
                className="mt-4 px-4 py-1.5 text-xs bg-white/[0.06] rounded-lg text-white/60 hover:text-white/80 transition-colors"
              >
                Importar otro archivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!result && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-xl p-10 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-blue-400" />
                <span className="text-sm text-white/70">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); reset() }}
                  className="text-white/30 hover:text-white/60"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">Arrastra un archivo CSV o haz clic para seleccionar</p>
                <p className="text-[10px] text-white/30 mt-2">Formato: fecha, descripcion, tipo, categoria, monto, referencia</p>
              </>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-medium text-white/50">Vista previa (primeras 5 filas)</h3>
                <span className="text-[10px] text-white/30">{headers.length} columnas detectadas</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-white/40 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-white/60 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {file && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {importing ? 'Importando...' : `Importar a ${empresaActiva.nombre}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
