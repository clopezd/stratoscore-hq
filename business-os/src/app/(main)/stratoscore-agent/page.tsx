'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ChatSession {
  id: string
  channel: 'web' | 'whatsapp'
  lead_name: string | null
  lead_email: string | null
  lead_phone: string | null
  lead_score: number
  messages: Array<{ role: string; content: string; ts?: string }>
  status: 'active' | 'closed' | 'escalated'
  created_at: string
  updated_at: string
}

export default function StratoscoreAgentPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selected, setSelected] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'escalated' | 'web' | 'whatsapp'>('all')

  const loadSessions = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (filter === 'escalated') query = query.eq('status', 'escalated')
    if (filter === 'web') query = query.eq('channel', 'web')
    if (filter === 'whatsapp') query = query.eq('channel', 'whatsapp')

    const { data } = await query
    setSessions((data || []) as ChatSession[])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    loadSessions()
    const interval = setInterval(loadSessions, 15_000) // refresh cada 15s
    return () => clearInterval(interval)
  }, [loadSessions])

  const stats = {
    total: sessions.length,
    escalated: sessions.filter(s => s.status === 'escalated').length,
    web: sessions.filter(s => s.channel === 'web').length,
    whatsapp: sessions.filter(s => s.channel === 'whatsapp').length,
    avgScore: sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + s.lead_score, 0) / sessions.length)
      : 0,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Agente StratosCore
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Conversaciones del widget web y WhatsApp
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Escalados" value={stats.escalated} color="#f59e0b" />
        <StatCard label="Web" value={stats.web} color="#22d3ee" />
        <StatCard label="WhatsApp" value={stats.whatsapp} color="#25d366" />
        <StatCard label="Score prom." value={stats.avgScore} suffix="/100" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'escalated', 'web', 'whatsapp'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setSelected(null) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === f ? 'var(--interactive)' : 'var(--card)',
              color: filter === f ? '#001117' : 'var(--muted)',
              border: `1px solid ${filter === f ? 'var(--interactive)' : 'var(--border)'}`,
            }}
          >
            {f === 'all' ? 'Todos' : f === 'escalated' ? 'Escalados' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-4" style={{ minHeight: '60vh' }}>
        {/* Session list */}
        <div className="w-full md:w-96 flex-shrink-0 space-y-2 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              <p className="text-lg mb-1">Sin conversaciones</p>
              <p className="text-xs">Las conversaciones aparecerán aquí cuando alguien use el chat</p>
            </div>
          ) : sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full text-left p-3 rounded-lg transition-colors"
              style={{
                background: selected?.id === s.id ? 'var(--card-hover)' : 'var(--card)',
                border: `1px solid ${selected?.id === s.id ? 'var(--interactive)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{s.channel === 'whatsapp' ? '💬' : '🌐'}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {s.lead_name || s.lead_email || s.lead_phone || 'Anónimo'}
                  </span>
                </div>
                <ScoreBadge score={s.lead_score} />
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {s.messages?.filter((m: { role: string }) => m.role === 'user')[0]?.content || '...'}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {s.messages?.filter((m: { role: string }) => m.role === 'user').length || 0} msgs
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {timeAgo(s.updated_at)}
                </span>
              </div>
              {s.status === 'escalated' && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Escalado
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conversation detail */}
        <div className="hidden md:flex flex-1 flex-col rounded-lg overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {selected ? (
            <>
              <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {selected.lead_name || 'Sin nombre'}
                    </h2>
                    <div className="flex gap-3 text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      {selected.lead_email && <span>📧 {selected.lead_email}</span>}
                      {selected.lead_phone && <span>📱 {selected.lead_phone}</span>}
                      <span>{selected.channel === 'whatsapp' ? '💬 WhatsApp' : '🌐 Web'}</span>
                    </div>
                  </div>
                  <ScoreBadge score={selected.lead_score} large />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selected.messages?.map((msg: { role: string; content: string; ts?: string }, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: msg.role === 'user'
                          ? 'rgba(34,211,238,0.12)'
                          : 'rgba(255,255,255,0.04)',
                        color: 'var(--foreground)',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                      }}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.ts && (
                        <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--muted)' }}>
                          {new Date(msg.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--muted)' }}>
              <p>Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Components ─────────────────────────────────────────────────

function StatCard({ label, value, color, suffix }: {
  label: string; value: number; color?: string; suffix?: string
}) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color: color || 'var(--foreground)' }}>
        {value}{suffix}
      </p>
    </div>
  )
}

function ScoreBadge({ score, large }: { score: number; large?: boolean }) {
  const color = score >= 70 ? '#f59e0b' : score >= 40 ? '#22d3ee' : '#6b7280'
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-bold ${large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-[10px]'}`}
      style={{ background: `${color}20`, color }}
    >
      {score}
    </span>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}
