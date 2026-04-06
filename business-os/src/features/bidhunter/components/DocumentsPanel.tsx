'use client'

import { useState, useEffect, useCallback } from 'react'
import type { OpportunityDocument, ExtractedData } from '../types'
import {
  Upload, FileText, Trash2, Loader2, CheckCircle2, XCircle,
  AlertTriangle, Zap, ChevronDown, ChevronRight, RefreshCw,
  Shield, DollarSign, Calendar, Ruler, ClipboardList, Search
} from 'lucide-react'
import type { KeywordAudit } from '../agents/pdf-extractor'

const MAX_STORAGE_SIZE = 50 * 1024 * 1024 // 50MB — Supabase free plan limit
const PAGE_BATCH_SIZE = 20 // Process N pages at a time to limit memory

/**
 * Extract text from PDF in the browser using pdf.js.
 * Memory-safe: processes pages in batches of PAGE_BATCH_SIZE, freeing each page after extraction.
 * For 200MB+ PDFs, reads the file in a streaming fashion via pdfjs-dist.
 */
async function extractTextInBrowser(
  file: File,
  onProgress?: (phase: string, pct: number) => void,
): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  onProgress?.('loading', 0)

  // Use a Uint8Array view to avoid doubling memory with ArrayBuffer copy
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const totalPages = pdf.numPages
  const chunks: string[] = []

  onProgress?.('extracting', 0)

  // Process pages in batches to limit concurrent memory usage
  for (let batchStart = 1; batchStart <= totalPages; batchStart += PAGE_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + PAGE_BATCH_SIZE - 1, totalPages)
    const batchPromises: Promise<string>[] = []

    for (let i = batchStart; i <= batchEnd; i++) {
      batchPromises.push(
        pdf.getPage(i).then(async (page) => {
          const content = await page.getTextContent()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = content.items.map((item: any) => item.str).join(' ')
          page.cleanup()
          return text
        })
      )
    }

    const batchTexts = await Promise.all(batchPromises)
    chunks.push(...batchTexts)

    const pct = Math.round((batchEnd / totalPages) * 100)
    onProgress?.('extracting', pct)
  }

  await pdf.destroy()
  onProgress?.('done', 100)

  return { text: chunks.join('\n'), pages: totalPages }
}

interface DocumentsPanelProps {
  opportunityId: string
  onExtractionComplete?: () => void
  lang?: 'en' | 'es'
}

interface DocWithExtraction extends OpportunityDocument {
  extracted_data?: ExtractedData | null
}

const DOC_TYPES = [
  { value: 'specs', label: 'Specifications' },
  { value: 'finish_schedule', label: 'Finish Schedule' },
  { value: 'plans', label: 'Plans / Drawings' },
  { value: 'addendum', label: 'Addendum' },
  { value: 'bid_form', label: 'Bid Form' },
  { value: 'other', label: 'Other' },
]

const labels = {
  en: {
    title: 'PDF Documents',
    upload: 'Upload & Analyze PDF',
    uploading: 'Analyzing...',
    extractingText: 'Extracting text',
    sendingText: 'Sending to server...',
    extract: 'Extract Data',
    extracting: 'Extracting...',
    reExtract: 'Re-extract',
    delete: 'Delete',
    noDocuments: 'No documents uploaded. Upload bid specs, finish schedules, or plans to get accurate scoring.',
    docType: 'Document type',
    extractedData: 'Extracted Data',
    scope: 'Scope',
    finishSchedule: 'Finish Schedule',
    sqft: 'Painting SqFt',
    requirements: 'Requirements',
    deadlines: 'Deadlines',
    materials: 'Materials',
    confidence: 'Confidence',
    bonding: 'Bonding',
    insurance: 'Insurance',
    prevailingWage: 'Prevailing Wage',
    sdvosb: 'SDVOSB',
    liquidatedDmg: 'Liquidated Damages',
    exterior: 'Exterior',
    interior: 'Interior',
    stucco: 'Stucco',
    total: 'Total',
    preBid: 'Pre-bid Meeting',
    bidDue: 'Bid Due',
    start: 'Start',
    completion: 'Completion',
    pending: 'Pending extraction',
    processing: 'Processing...',
    completed: 'Extracted',
    failed: 'Failed',
    rescore: 'Re-score with PDF data',
    rescoring: 'Re-scoring...',
    exclusions: 'Exclusions',
    trades: 'Trades in Scope',
  },
  es: {
    title: 'Documentos PDF',
    upload: 'Subir y Analizar PDF',
    uploading: 'Analizando...',
    extractingText: 'Extrayendo texto',
    sendingText: 'Enviando al servidor...',
    extract: 'Extraer Datos',
    extracting: 'Extrayendo...',
    reExtract: 'Re-extraer',
    delete: 'Eliminar',
    noDocuments: 'Sin documentos. Sube specs, finish schedules o planos para scoring preciso.',
    docType: 'Tipo de documento',
    extractedData: 'Datos Extraídos',
    scope: 'Alcance',
    finishSchedule: 'Finish Schedule',
    sqft: 'SqFt de Pintura',
    requirements: 'Requisitos',
    deadlines: 'Fechas',
    materials: 'Materiales',
    confidence: 'Confianza',
    bonding: 'Fianza',
    insurance: 'Seguro',
    prevailingWage: 'Salario Prevaleciente',
    sdvosb: 'SDVOSB',
    liquidatedDmg: 'Daños Liquidados',
    exterior: 'Exterior',
    interior: 'Interior',
    stucco: 'Stucco',
    total: 'Total',
    preBid: 'Reunión Pre-bid',
    bidDue: 'Fecha Límite',
    start: 'Inicio',
    completion: 'Terminación',
    pending: 'Pendiente de extracción',
    processing: 'Procesando...',
    completed: 'Extraído',
    failed: 'Falló',
    rescore: 'Re-evaluar con datos PDF',
    rescoring: 'Re-evaluando...',
    exclusions: 'Exclusiones',
    trades: 'Oficios en Alcance',
  },
}

function formatNumber(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString()
}

function formatCurrency(n: number | null | undefined) {
  if (n == null) return '—'
  return `$${n.toLocaleString()}`
}

function StatusBadge({ status, lang }: { status: string; lang: 'en' | 'es' }) {
  const l = labels[lang]
  const config: Record<string, { icon: typeof CheckCircle2; color: string; text: string }> = {
    pending: { icon: AlertTriangle, color: 'text-yellow-400', text: l.pending },
    processing: { icon: Loader2, color: 'text-blue-400', text: l.processing },
    completed: { icon: CheckCircle2, color: 'text-green-400', text: l.completed },
    failed: { icon: XCircle, color: 'text-red-400', text: l.failed },
  }
  const c = config[status] || config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${c.color}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {c.text}
    </span>
  )
}

export default function DocumentsPanel({ opportunityId, onExtractionComplete, lang = 'en' }: DocumentsPanelProps) {
  const l = labels[lang]
  const [documents, setDocuments] = useState<DocWithExtraction[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ phase: string; pct: number } | null>(null)
  const [extractingId, setExtractingId] = useState<string | null>(null)
  const [rescoring, setRescoring] = useState(false)
  const [docType, setDocType] = useState('specs')
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/bidhunter/documents?opportunity_id=${opportunityId}`)
      if (!res.ok) return
      const docs: OpportunityDocument[] = await res.json()

      // Fetch extracted data for completed docs
      const enriched: DocWithExtraction[] = await Promise.all(
        docs.map(async (doc) => {
          if (doc.extraction_status === 'completed') {
            const detailRes = await fetch(`/api/bidhunter/documents/${doc.id}`)
            if (detailRes.ok) {
              const detail = await detailRes.json()
              return { ...doc, extracted_data: detail.extracted_data }
            }
          }
          return doc
        })
      )
      setDocuments(enriched)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [opportunityId])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const isLargeFile = file.size > MAX_STORAGE_SIZE

      let doc: { id: string }

      if (isLargeFile) {
        // Large PDF (>50MB): extract text in browser, send only text + metadata to server
        console.log(`[BidHunter] Large PDF (${(file.size / 1024 / 1024).toFixed(0)}MB) — extracting text in browser...`)
        const { text, pages } = await extractTextInBrowser(file, (phase, pct) => {
          setUploadProgress({ phase, pct })
        })

        setUploadProgress({ phase: 'sending', pct: 100 })
        const res = await fetch('/api/bidhunter/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunity_id: opportunityId,
            document_type: docType,
            filename: file.name,
            file_size: file.size,
            raw_text: text,
            page_count: pages,
            text_only: true, // Flag: no file in Storage
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.error || `Upload failed (${res.status})`)
        }
        doc = await res.json()
      } else {
        // Normal PDF (≤50MB): upload file to Supabase Storage
        const formData = new FormData()
        formData.append('file', file)
        formData.append('opportunity_id', opportunityId)
        formData.append('document_type', docType)

        const res = await fetch('/api/bidhunter/documents', { method: 'POST', body: formData })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.error || `Upload failed (${res.status})`)
        }
        doc = await res.json()
      }

      await fetchDocuments()

      // Auto-trigger LLM extraction immediately after upload
      if (doc.id) {
        setExtractingId(doc.id)
        try {
          const extractRes = await fetch(`/api/bidhunter/documents/${doc.id}/extract`, { method: 'POST' })
          if (extractRes.ok) {
            await fetchDocuments()
            setExpandedDocId(doc.id)
            onExtractionComplete?.()
          }
        } catch {
          // silent — user can retry manually
        } finally {
          setExtractingId(null)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setUploadProgress(null)
      e.target.value = '' // Reset input
    }
  }

  const handleExtract = async (docId: string) => {
    setExtractingId(docId)
    try {
      const res = await fetch(`/api/bidhunter/documents/${docId}/extract`, { method: 'POST' })
      if (!res.ok) {
        const text = await res.text()
        let message = 'Extraction failed'
        try { message = JSON.parse(text).error || message } catch { /* non-JSON response */ }
        throw new Error(message)
      }
      await fetchDocuments()
      setExpandedDocId(docId)
      onExtractionComplete?.()
    } catch (err) {
      console.error('Extraction error:', err)
    } finally {
      setExtractingId(null)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`/api/bidhunter/documents/${docId}`, { method: 'DELETE' })
      await fetchDocuments()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleRescore = async () => {
    setRescoring(true)
    try {
      const res = await fetch('/api/bidhunter/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [opportunityId] }),
      })
      if (res.ok) onExtractionComplete?.()
    } catch {
      // silent
    } finally {
      setRescoring(false)
    }
  }

  const hasExtracted = documents.some(d => d.extraction_status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-4">
        <Loader2 size={14} className="animate-spin" /> Loading documents...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header + Upload */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <FileText size={14} />
          {l.title} ({documents.length})
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded px-2 py-1 text-xs text-white/70"
          >
            {DOC_TYPES.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
          <label className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer
            ${uploading ? 'bg-white/[0.06] text-white/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'}
          `}>
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? l.uploading : l.upload}
            <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Upload Progress Bar (large PDFs) */}
      {uploadProgress && (
        <div className="bg-blue-500/[0.08] border border-blue-500/20 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-400">
              {uploadProgress.phase === 'loading' && (lang === 'es' ? 'Cargando PDF...' : 'Loading PDF...')}
              {uploadProgress.phase === 'extracting' && `${l.extractingText}... ${uploadProgress.pct}%`}
              {uploadProgress.phase === 'sending' && l.sendingText}
            </span>
            <span className="text-[10px] text-blue-400/60">{uploadProgress.pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <p className="text-xs text-white/30 italic py-2">{l.noDocuments}</p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white/[0.04] border border-white/[0.08] rounded-lg overflow-hidden">
              {/* Doc Header */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                    className="text-white/40 hover:text-white/70"
                  >
                    {expandedDocId === doc.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <FileText size={14} className="text-white/30 flex-shrink-0" />
                  <span className="text-xs text-white/70 truncate">{doc.filename}</span>
                  <span className="text-[10px] text-white/30 uppercase">{doc.document_type}</span>
                  {doc.file_size && (
                    <span className="text-[10px] text-white/20">{(doc.file_size / 1024).toFixed(0)}KB</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={doc.extraction_status} lang={lang} />
                  {(doc.extraction_status === 'pending' || doc.extraction_status === 'failed') && (
                    <button
                      onClick={() => handleExtract(doc.id)}
                      disabled={extractingId === doc.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-40"
                    >
                      {extractingId === doc.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                      {extractingId === doc.id ? l.extracting : l.extract}
                    </button>
                  )}
                  {doc.extraction_status === 'completed' && (
                    <button
                      onClick={() => handleExtract(doc.id)}
                      disabled={extractingId === doc.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white/[0.06] text-white/40 hover:text-white/60"
                    >
                      <RefreshCw size={10} />
                      {l.reExtract}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-400/50 hover:text-red-400 p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Expanded: Extracted Data */}
              {expandedDocId === doc.id && doc.extracted_data && (
                <ExtractedDataView data={doc.extracted_data} lang={lang} />
              )}
              {expandedDocId === doc.id && doc.extraction_status === 'failed' && doc.extraction_error && (
                <div className="px-3 pb-2 text-xs text-red-400/70">
                  Error: {doc.extraction_error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Re-score Button */}
      {hasExtracted && (
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-40"
        >
          {rescoring ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {rescoring ? l.rescoring : l.rescore}
        </button>
      )}
    </div>
  )
}

/* ── Extracted Data Visualization ───────────────────────────────── */

function ExtractedDataView({ data, lang }: { data: ExtractedData; lang: 'en' | 'es' }) {
  const l = labels[lang]

  return (
    <div className="px-3 pb-3 space-y-3 border-t border-white/[0.06]">
      {/* Confidence */}
      {data.confidence_score != null && (
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[10px] text-white/30">{l.confidence}:</span>
          <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${data.confidence_score >= 0.7 ? 'bg-green-500' : data.confidence_score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${data.confidence_score * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/50">{(data.confidence_score * 100).toFixed(0)}%</span>
        </div>
      )}

      {/* Keyword Audit */}
      <KeywordAuditSection audit={(data.raw_extraction as Record<string, unknown>)?.keyword_audit as KeywordAudit | null} lang={lang} />

      {/* Scope */}
      {data.scope_summary && (
        <div>
          <h5 className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
            <ClipboardList size={10} /> {l.scope}
          </h5>
          <p className="text-xs text-white/60 leading-relaxed">{data.scope_summary}</p>
        </div>
      )}

      {/* Trades & Exclusions */}
      <div className="flex gap-4">
        {data.trades_in_scope && data.trades_in_scope.length > 0 && (
          <div className="flex-1">
            <h5 className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{l.trades}</h5>
            <div className="flex flex-wrap gap-1">
              {data.trades_in_scope.map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400/80">{t}</span>
              ))}
            </div>
          </div>
        )}
        {data.exclusions && data.exclusions.length > 0 && (
          <div className="flex-1">
            <h5 className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{l.exclusions}</h5>
            <div className="flex flex-wrap gap-1">
              {data.exclusions.map(e => (
                <span key={e} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400/80">{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Painting SqFt — THE GOLD */}
      {(data.exterior_painting_sqft || data.interior_painting_sqft || data.stucco_sqft || data.total_painting_sqft) && (
        <div className="bg-green-500/[0.08] border border-green-500/20 rounded-lg p-2.5">
          <h5 className="text-[10px] text-green-400/80 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Ruler size={10} /> {l.sqft}
          </h5>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-xs text-white/30">{l.exterior}</div>
              <div className="text-sm font-bold text-green-400">{formatNumber(data.exterior_painting_sqft)}</div>
            </div>
            <div>
              <div className="text-xs text-white/30">{l.interior}</div>
              <div className="text-sm font-bold text-green-400">{formatNumber(data.interior_painting_sqft)}</div>
            </div>
            <div>
              <div className="text-xs text-white/30">{l.stucco}</div>
              <div className="text-sm font-bold text-green-400">{formatNumber(data.stucco_sqft)}</div>
            </div>
            <div>
              <div className="text-xs text-white/30">{l.total}</div>
              <div className="text-sm font-bold text-white">{formatNumber(data.total_painting_sqft)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Schedule */}
      {data.finish_schedule && data.finish_schedule.length > 0 && (
        <div>
          <h5 className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
            <FileText size={10} /> {l.finishSchedule}
          </h5>
          <div className="space-y-1">
            {data.finish_schedule.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/[0.03] rounded px-2 py-1">
                <span className="text-white/60">{item.area}</span>
                <span className="text-white/40">{item.finish_type}</span>
                <span className="text-white/80 font-medium">{formatNumber(item.sqft)} sqft</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {(data.bonding_required != null || data.insurance_minimum != null || data.prevailing_wage != null || data.sdvosb_requirement || data.liquidated_damages != null) && (
        <div>
          <h5 className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Shield size={10} /> {l.requirements}
          </h5>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {data.bonding_required != null && (
              <div className="flex items-center gap-1">
                <span className={data.bonding_required ? 'text-amber-400' : 'text-green-400'}>
                  {data.bonding_required ? '⚠' : '✓'}
                </span>
                <span className="text-white/50">{l.bonding}:</span>
                <span className="text-white/70">
                  {data.bonding_required ? (data.bonding_amount ? formatCurrency(data.bonding_amount) : 'Yes') : 'No'}
                </span>
              </div>
            )}
            {data.insurance_minimum != null && (
              <div className="flex items-center gap-1">
                <DollarSign size={10} className="text-white/30" />
                <span className="text-white/50">{l.insurance}:</span>
                <span className="text-white/70">{formatCurrency(data.insurance_minimum)}</span>
              </div>
            )}
            {data.prevailing_wage != null && (
              <div className="flex items-center gap-1">
                <span className={data.prevailing_wage ? 'text-amber-400' : 'text-green-400'}>
                  {data.prevailing_wage ? '⚠' : '✓'}
                </span>
                <span className="text-white/50">{l.prevailingWage}:</span>
                <span className="text-white/70">{data.prevailing_wage ? 'Yes' : 'No'}</span>
              </div>
            )}
            {data.sdvosb_requirement && (
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-green-400" />
                <span className="text-white/50">{l.sdvosb}:</span>
                <span className="text-green-400 font-medium">{data.sdvosb_requirement}</span>
              </div>
            )}
            {data.liquidated_damages != null && (
              <div className="flex items-center gap-1">
                <span className="text-red-400">⚠</span>
                <span className="text-white/50">{l.liquidatedDmg}:</span>
                <span className="text-red-400">${data.liquidated_damages}/day</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deadlines */}
      {(data.pre_bid_meeting || data.bid_due_date || data.project_start_date || data.project_completion_date) && (
        <div>
          <h5 className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Calendar size={10} /> {l.deadlines}
          </h5>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {data.pre_bid_meeting && (
              <div><span className="text-white/40">{l.preBid}:</span> <span className="text-white/70">{new Date(data.pre_bid_meeting).toLocaleDateString()}</span></div>
            )}
            {data.bid_due_date && (
              <div><span className="text-white/40">{l.bidDue}:</span> <span className="text-amber-400">{new Date(data.bid_due_date).toLocaleDateString()}</span></div>
            )}
            {data.project_start_date && (
              <div><span className="text-white/40">{l.start}:</span> <span className="text-white/70">{new Date(data.project_start_date).toLocaleDateString()}</span></div>
            )}
            {data.project_completion_date && (
              <div><span className="text-white/40">{l.completion}:</span> <span className="text-white/70">{new Date(data.project_completion_date).toLocaleDateString()}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Materials */}
      {data.materials_specified && data.materials_specified.length > 0 && (
        <div>
          <h5 className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{l.materials}</h5>
          <div className="flex flex-wrap gap-1">
            {data.materials_specified.map((m, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-400/80">
                {m.brand} {m.product}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Keyword Audit Section ──────────────────────────────────────── */

function KeywordAuditSection({ audit, lang }: { audit: KeywordAudit | null; lang: 'en' | 'es' }) {
  const [expanded, setExpanded] = useState(false)

  if (!audit) return null

  const primaryKw = audit.keywords.filter(k => k.type === 'primary')
  const secondaryKw = audit.keywords.filter(k => k.type === 'secondary')
  const totalKeywordHits = audit.keywords.reduce((sum, k) => sum + k.count, 0)

  const title = lang === 'es' ? 'Keywords Detectadas' : 'Keywords Found'
  const linesLabel = lang === 'es' ? 'líneas' : 'lines'
  const charsLabel = lang === 'es' ? 'caracteres' : 'chars'
  const selectedLabel = lang === 'es' ? 'líneas enviadas al LLM' : 'lines sent to LLM'
  const drawingLabel = lang === 'es' ? 'Muestras con "drawing"' : '"drawing" samples'
  const noKeywordsMsg = lang === 'es'
    ? 'Sin keywords de pintura detectadas — este PDF puede no contener datos relevantes'
    : 'No painting keywords detected — this PDF may not contain relevant data'

  return (
    <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-indigo-500/[0.04]"
      >
        <span className="text-[10px] text-indigo-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <Search size={10} />
          {title} ({totalKeywordHits})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-indigo-300/50">
            {primaryKw.length} primary / {secondaryKw.length} secondary
          </span>
          {expanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-2 border-t border-indigo-500/10">
          {/* Doc stats */}
          <div className="flex gap-3 pt-2 text-[10px] text-white/30">
            <span>{audit.total_lines.toLocaleString()} {linesLabel}</span>
            <span>{audit.total_chars.toLocaleString()} {charsLabel}</span>
            <span>{audit.lines_selected.toLocaleString()} {selectedLabel}</span>
          </div>

          {totalKeywordHits === 0 ? (
            <p className="text-[11px] text-amber-400/70 italic py-1">{noKeywordsMsg}</p>
          ) : (
            <>
              {/* Primary keywords */}
              {primaryKw.length > 0 && (
                <div>
                  <span className="text-[9px] text-red-400/60 uppercase tracking-wider">Primary</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {primaryKw.map(k => (
                      <span key={k.keyword} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400/80">
                        {k.keyword} <span className="text-red-400/50 font-bold">{k.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary keywords */}
              {secondaryKw.length > 0 && (
                <div>
                  <span className="text-[9px] text-blue-400/60 uppercase tracking-wider">Secondary</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {secondaryKw.map(k => (
                      <span key={k.keyword} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400/70">
                        {k.keyword} <span className="text-blue-400/40 font-bold">{k.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Drawing samples */}
          {audit.drawing_samples && audit.drawing_samples.length > 0 && (
            <div>
              <span className="text-[9px] text-green-400/60 uppercase tracking-wider">{drawingLabel}</span>
              <div className="mt-0.5 space-y-0.5">
                {audit.drawing_samples.map((s, i) => (
                  <div key={i} className="text-[10px] text-white/40 font-mono truncate">
                    <span className="text-green-400/50">L{s.line}:</span> {s.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
