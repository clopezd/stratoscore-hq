'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Brain,
  Plus,
  Mic,
  Square,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

interface Memory {
  id: string
  category: string
  content: string
  source: string
  active: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'identidad', label: 'Quién soy', emoji: '🧑' },
  { value: 'tono', label: 'Cómo hablo', emoji: '🗣️' },
  { value: 'contexto', label: 'Mi contexto', emoji: '🏢' },
  { value: 'vocabulario', label: 'Vocabulario', emoji: '📝' },
  { value: 'ejemplo_post', label: 'Ejemplo de post', emoji: '📱' },
  { value: 'logro', label: 'Logro', emoji: '🏆' },
  { value: 'proyecto', label: 'Proyecto', emoji: '🔧' },
  { value: 'aprendizaje', label: 'Aprendizaje', emoji: '💡' },
  { value: 'contacto', label: 'Contacto', emoji: '🤝' },
  { value: 'otro', label: 'Otro', emoji: '📌' },
] as const

type RecordState = 'idle' | 'recording' | 'processing'

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>('identidad')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [uploading, setUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMemories = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('memories')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data } = await query
    setMemories((data ?? []) as Memory[])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  const addMemory = async () => {
    const trimmed = content.trim()
    if (!trimmed) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('memories').insert({
      category,
      content: trimmed,
      source: 'manual',
    })
    setContent('')
    await fetchMemories()
    setSaving(false)
  }

  const deleteMemory = async (id: string) => {
    const supabase = createClient()
    await supabase.from('memories').update({ active: false }).eq('id', id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  // ── Voice recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start(100)
      setRecordState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      // mic permission denied
    }
  }

  const stopRecording = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    setRecordState('processing')

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
    })
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    chunksRef.current = []

    if (blob.size < 1000) {
      setRecordState('idle')
      setSeconds(0)
      return
    }

    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')
      const res = await fetch('/api/chat/transcribe', { method: 'POST', body: form })
      if (!res.ok) throw new Error('STT failed')
      const { text } = await res.json() as { text?: string }
      const transcription = text?.trim() || ''
      if (transcription) {
        setContent((prev) => prev ? `${prev}\n${transcription}` : transcription)
      }
    } catch {
      // transcription failed silently
    }
    setRecordState('idle')
    setSeconds(0)
  }

  // ── File upload ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const text = await file.text()
      setContent((prev) => prev ? `${prev}\n${text}` : text)
    } catch {
      // binary file — just add filename as reference
      setContent((prev) => prev ? `${prev}\n[Archivo adjunto: ${file.name}]` : `[Archivo adjunto: ${file.name}]`)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const filteredCount = (cat: string) => memories.filter((m) => cat === 'all' || m.category === cat).length
  const getCategoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat)

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400/60">
            [ MEMORIES ]
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/90">
          Mis Memorias
        </h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
          Todo lo que el Ghost Writer necesita saber sobre ti. Escribe, habla o sube documentos.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-6">
        {/* Category selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat.value
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe una memoria, pega un post de LinkedIn, o dicta con el micrófono..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.04] border border-white/[0.07] text-white/80 placeholder:text-white/25 resize-y font-mono"
        />

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* Voice */}
            {recordState === 'recording' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-red-400 tabular-nums">
                  {formatTime(seconds)}
                </span>
                <div className="flex items-end gap-px h-4">
                  {[3, 5, 7, 4, 6].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-red-400/70 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 80}ms`, animationDuration: '700ms' }}
                    />
                  ))}
                </div>
                <button
                  onClick={stopRecording}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400 ring-1 ring-red-500/40 hover:bg-red-500/30"
                >
                  <Square size={11} className="fill-current" />
                </button>
              </div>
            ) : recordState === 'processing' ? (
              <div className="flex items-center gap-2 text-purple-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Transcribiendo...</span>
              </div>
            ) : (
              <button
                onClick={startRecording}
                title="Grabar con voz"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              >
                <Mic size={16} />
              </button>
            )}

            {/* File upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Subir archivo (.txt, .md, .csv)"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            </button>
          </div>

          {/* Save */}
          <button
            onClick={addMemory}
            disabled={!content.trim() || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Guardar memoria
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-white/[0.1] text-white/80'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Todas ({memories.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = filteredCount(cat.value)
          if (filter !== 'all' && filter !== cat.value && count === 0) return null
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === cat.value
                  ? 'bg-white/[0.1] text-white/80'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {cat.emoji} {count}
            </button>
          )
        })}
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="px-2 py-1 text-white/20 hover:text-white/50"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Memories list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-20">
          <Brain size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">
            {filter === 'all' ? 'No hay memorias aún. Empieza a escribir.' : 'No hay memorias en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => {
            const catInfo = getCategoryInfo(memory.category)
            return (
              <div
                key={memory.id}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] text-white/40">
                        {catInfo?.emoji} {catInfo?.label ?? memory.category}
                      </span>
                      <span className="text-[10px] text-white/20">
                        {new Date(memory.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      </span>
                      {memory.source !== 'manual' && (
                        <span className="text-[10px] text-white/15">
                          via {memory.source}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">
                      {memory.content}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="p-1.5 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
