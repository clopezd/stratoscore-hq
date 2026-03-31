'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, Trash2, Loader2, PenLine, RefreshCw } from 'lucide-react'

interface PostDraft {
  id: string
  content: string
  report_type: string
  created_at: string
}

export default function PostsPage() {
  const [drafts, setDrafts] = useState<PostDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchDrafts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('agent_reports')
      .select('id, content, report_type, created_at')
      .eq('agent_slug', 'ghostwriter')
      .order('created_at', { ascending: false })
      .limit(50)

    setDrafts((data ?? []) as PostDraft[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  const copyToClipboard = async (id: string, content: string) => {
    // Extract just the post content (between **Post:** or after the header)
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteDraft = async (id: string) => {
    const supabase = createClient()
    await supabase.from('agent_reports').delete().eq('id', id)
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }

  const [error, setError] = useState<string | null>(null)

  const generateNew = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/agents/ghostwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchDrafts()
      } else {
        setError(data.error || `Error ${res.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de red')
    }
    setGenerating(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Parse the report content into individual post sections
  const parsePosts = (content: string): string[] => {
    const sections = content.split(/### Borrador \d+:/i)
    return sections
      .slice(1)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400/60">
            [ POSTS ]
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/90">
              Borradores LinkedIn
            </h1>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              Posts generados por tu Ghost Writer. Copia, edita y publica.
            </p>
          </div>
          <button
            onClick={generateNew}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <PenLine size={14} />
                Generar nuevo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      )}

      {/* Empty */}
      {!loading && drafts.length === 0 && (
        <div className="text-center py-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <PenLine size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm mb-4">
            No hay borradores todavía
          </p>
          <button
            onClick={generateNew}
            disabled={generating}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Generar el primero
          </button>
        </div>
      )}

      {/* Drafts */}
      {!loading && drafts.length > 0 && (
        <div className="space-y-6">
          {drafts.map((draft) => {
            const posts = parsePosts(draft.content)
            const showRaw = posts.length === 0

            return (
              <div
                key={draft.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Date header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                  <span className="text-xs text-white/30">
                    {formatDate(draft.created_at)}
                  </span>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {showRaw ? (
                  /* Raw content if can't parse */
                  <div className="p-5">
                    <div className="relative group">
                      <pre className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed font-sans">
                        {draft.content}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(draft.id, draft.content)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-white/[0.06] text-white/30 hover:text-white/70 hover:bg-white/[0.1] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {copiedId === draft.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Parsed posts */
                  <div className="divide-y divide-white/[0.04]">
                    {posts.map((post, i) => {
                      const postId = `${draft.id}-${i}`
                      // Try to extract just the post text (after **Post:**)
                      const postMatch = post.match(/\*\*Post:\*\*\s*([\s\S]*?)(?=\n---|\n\*\*Notas|$)/i)
                      const cleanPost = postMatch ? postMatch[1].trim() : post
                      // Extract title
                      const titleMatch = post.match(/^(.+?)[\n\r]/)
                      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : `Borrador ${i + 1}`

                      return (
                        <div key={postId} className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                              {title}
                            </h3>
                            <button
                              onClick={() => copyToClipboard(postId, cleanPost)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                              {copiedId === postId ? (
                                <>
                                  <Check size={12} />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  Copiar post
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">
                            {cleanPost}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Notes section */}
                {draft.content.includes('Notas para Carlos') && (
                  <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                    <p className="text-xs text-white/30">
                      {draft.content.match(/\*\*Notas para Carlos:\*\*\s*(.*?)$/ms)?.[1]?.trim() ?? ''}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
