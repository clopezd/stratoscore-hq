'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IngestResult {
  ok: boolean
  sheet: string
  file_name: string
  rows_parsed: number
  rows_saved: number
  rows_errored: number
  skipped: number
  years: number[]
  unique_parts: number
  message: string
}

interface FileUploaderProps {
  onSuccess?: (result: IngestResult) => void
}

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; fileName: string }
  | { status: 'success'; result: IngestResult }
  | { status: 'error'; message: string; fileName?: string }

// ── Component ──────────────────────────────────────────────────────────────────

export function FileUploader({ onSuccess }: FileUploaderProps) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setState({ status: 'error', message: 'Solo se aceptan archivos .xlsx, .xls o .csv', fileName: file.name })
      return
    }

    setState({ status: 'uploading', fileName: file.name })

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/videndum/ingest', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok || data.error) {
        setState({ status: 'error', message: data.error ?? `HTTP ${res.status}`, fileName: file.name })
        return
      }

      const result = data as IngestResult
      setState({ status: 'success', result })
      onSuccess?.(result)
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Error de conexión',
        fileName: file.name,
      })
    }
  }, [onSuccess])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    upload(files[0])
  }, [upload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const reset = () => {
    setState({ status: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Idle / drop zone ────────────────────────────────────────────────────────

  if (state.status === 'idle') {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
          cursor-pointer select-none transition-all px-8 py-14
          ${dragOver
            ? 'border-violet-400/70 bg-violet-500/[0.06]'
            : 'border-white/[0.10] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className={`p-4 rounded-full transition-colors ${dragOver ? 'bg-violet-500/20' : 'bg-white/[0.05]'}`}>
          <Upload size={24} className={dragOver ? 'text-violet-300' : 'text-white/30'} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-white/70">
            {dragOver ? 'Suelta el archivo aquí' : 'Arrastra un Excel aquí o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-white/30">Formatos aceptados: .xlsx, .xls, .csv</p>
          <p className="text-xs text-white/20">Hoja esperada: &quot;Forecast Production&quot; — columnas año/mes por part number</p>
        </div>
      </div>
    )
  }

  // ── Uploading ───────────────────────────────────────────────────────────────

  if (state.status === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-14">
        <div className="p-4 rounded-full bg-violet-500/10">
          <RefreshCw size={24} className="text-violet-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-white/70">Procesando archivo…</p>
          <p className="text-xs text-white/30 font-mono">{state.fileName}</p>
          <p className="text-xs text-white/20 mt-2">Parseando Excel · Transformando filas · Guardando en Supabase</p>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-8 py-10">
        <div className="p-3 rounded-full bg-red-500/10">
          <AlertCircle size={22} className="text-red-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-red-300">Error al procesar el archivo</p>
          {state.fileName && (
            <p className="text-xs text-white/30 font-mono">{state.fileName}</p>
          )}
          <p className="text-xs text-red-300/70 mt-2 max-w-sm">{state.message}</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mt-1"
        >
          <X size={11} />
          Intentar con otro archivo
        </button>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────

  const { result } = state
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-emerald-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">Ingesta completada</p>
        </div>
        <button
          onClick={reset}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
        >
          <Upload size={10} />
          Subir otro
        </button>
      </div>

      {/* Summary grid */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Registros guardados" value={result.rows_saved.toLocaleString()} color="text-emerald-300" />
        <StatCard label="Part numbers únicos" value={result.unique_parts.toLocaleString()} />
        <StatCard label="Años cubiertos" value={`${result.years[0]}–${result.years[result.years.length - 1]}`} />
        <StatCard label="Filas parseadas" value={result.rows_parsed.toLocaleString()} />
        {result.skipped > 0 && <StatCard label="Filas omitidas" value={result.skipped.toLocaleString()} color="text-amber-400" />}
        {result.rows_errored > 0 && <StatCard label="Errores de guardado" value={result.rows_errored.toLocaleString()} color="text-red-400" />}
      </div>

      {/* File info */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <FileSpreadsheet size={11} className="text-white/25 shrink-0" />
        <p className="text-[11px] text-white/35 truncate">
          {result.file_name} · hoja <span className="font-mono text-white/50">{result.sheet}</span>
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'text-white/80' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2.5">
      <p className={`text-sm font-semibold font-mono ${color}`}>{value}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
    </div>
  )
}
