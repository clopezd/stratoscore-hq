'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseCSV, parseJSON, rowToOpportunity } from '@/features/bidhunter/services/importService'
import { logPipelineAction } from '@/features/bidhunter/services/pipelineService'
import { useLang, t } from '@/features/bidhunter/i18n'
import { FileUp, ArrowLeft, Check, AlertTriangle, Loader2, FileText, Languages } from 'lucide-react'

type Step = 'upload' | 'preview' | 'importing' | 'done'

export default function ImportPage() {
  const router = useRouter()
  const [lang, toggleLang] = useLang()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof rowToOpportunity>[]>([])
  const [error, setError] = useState('')
  const [importedCount, setImportedCount] = useState(0)

  const handleFile = async (file: File) => {
    setError('')
    setFileName(file.name)

    try {
      const text = await file.text()
      const isJSON = file.name.endsWith('.json')
      const rows = isJSON ? parseJSON(text) : parseCSV(text)

      if (rows.length === 0) {
        setError(lang === 'es' ? 'No se encontraron filas en el archivo' : 'No rows found in the file')
        return
      }

      const parsed = rows.map(rowToOpportunity)
      setPreview(parsed)
      setStep('preview')
    } catch (err) {
      setError(`${lang === 'es' ? 'Error parseando archivo' : 'Error parsing file'}: ${(err as Error).message}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    setStep('importing')
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('bh_opportunities')
        .insert(preview)
        .select('id')

      if (err) throw err

      const count = data?.length ?? 0
      setImportedCount(count)
      await logPipelineAction('import', { file: fileName, count })
      setStep('done')
    } catch (err) {
      setError(`${lang === 'es' ? 'Error importando' : 'Error importing'}: ${(err as Error).message}`)
      setStep('preview')
    }
  }

  return (
    <div className="min-h-screen bg-vid-bg text-vid-fg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/bidhunter')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t('import_opportunities', lang)}</h1>
            <p className="text-xs text-white/40">{t('import_subtitle', lang)}</p>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
        >
          <Languages size={13} />
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-colors"
        >
          <FileUp size={40} className="text-white/20 mb-4" />
          <p className="text-sm text-white/50 mb-1">{t('drag_drop', lang)}</p>
          <p className="text-xs text-white/30">{t('csv_json_format', lang)}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />

          <div className="mt-8 grid md:grid-cols-2 gap-4 w-full max-w-xl">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-blue-400" />
                <span className="text-xs font-medium">{t('csv_format', lang)}</span>
              </div>
              <p className="text-[10px] text-white/30 font-mono leading-relaxed">
                title, gc_name, location, state_code, deadline, estimated_value, trades_required, is_sdvosb_eligible
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-amber-400" />
                <span className="text-xs font-medium">{t('json_format', lang)}</span>
              </div>
              <p className="text-[10px] text-white/30 font-mono leading-relaxed">
                {'[{"title": "...", "gc_name": "...", "trades_required": "painting|drywall"}]'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              <span className="font-medium text-white">{preview.length}</span> {t('opportunities', lang)} {lang === 'es' ? 'de' : 'from'} <span className="text-white/40">{fileName}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep('upload'); setPreview([]); setError('') }}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                <Check size={13} />
                {t('import_n', lang)} {preview.length} {t('opportunities', lang)}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 px-3 text-white/30 font-medium">#</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('title_col', lang)}</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('gc_col', lang)}</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('location_col', lang)}</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('value_col', lang)}</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('trades_col', lang)}</th>
                  <th className="text-left py-2 px-3 text-white/30 font-medium">{t('sdvosb_col', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((opp, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-white/20">{i + 1}</td>
                    <td className="py-2 px-3 text-white/70 max-w-[200px] truncate">{opp.title}</td>
                    <td className="py-2 px-3 text-white/40">{opp.gc_name ?? '-'}</td>
                    <td className="py-2 px-3 text-white/40">{opp.location ?? '-'}{opp.state_code ? `, ${opp.state_code}` : ''}</td>
                    <td className="py-2 px-3 text-white/40">{opp.estimated_value ? `$${Number(opp.estimated_value).toLocaleString()}` : '-'}</td>
                    <td className="py-2 px-3 text-white/40">{opp.trades_required?.join(', ') ?? '-'}</td>
                    <td className="py-2 px-3">{opp.is_sdvosb_eligible ? <span className="text-emerald-400">{t('yes', lang)}</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && (
              <p className="text-[10px] text-white/25 text-center py-2">
                {t('showing_n_of', lang)} 20 {t('of', lang)} {preview.length} {t('rows', lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Importing */}
      {step === 'importing' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-400 mb-4" />
          <p className="text-sm text-white/50">{t('importing', lang)} {preview.length} {t('opportunities', lang)}...</p>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Check size={28} className="text-green-400" />
          </div>
          <p className="text-lg font-bold mb-1">{importedCount} {t('opportunities_imported', lang)}</p>
          <p className="text-xs text-white/40 mb-6">{t('ready_for_scoring', lang)}</p>
          <button
            onClick={() => router.push('/bidhunter')}
            className="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            {t('go_to_pipeline', lang)}
          </button>
        </div>
      )}
    </div>
  )
}
