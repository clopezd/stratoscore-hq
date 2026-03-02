'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, MessageSquare, Plus, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useChat } from '@/features/chat/hooks/useChat'
import { useChatHistory, type ChatSession } from '@/features/chat/hooks/useChatHistory'
import { MarkdownMessage } from '@/features/chat/components/MarkdownMessage'

export function ChatBubble() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionsRef = useRef<HTMLDivElement>(null)

  const {
    sessions,
    createSession,
    saveMessages,
    loadMessages: loadPersistedMessages,
  } = useChatHistory()

  const { messages, loading, sendMessage, loadMessages, clearMessages, detachStream } = useChat({
    sessionId,
    onSave: async (userMsg, assistantMsg, audioUrl, imageUrl) => {
      if (!sessionId) return
      await saveMessages(sessionId, [
        { role: 'user', content: userMsg, audioUrl, imageUrl },
        { role: 'assistant', content: assistantMsg },
      ])
    },
  })

  // Load latest session when opening for the first time
  useEffect(() => {
    if (!open || initialized) return
    if (sessions.length > 0) {
      const latest = sessions[0]
      setSessionId(latest.id)
      loadPersistedMessages(latest.id).then(loadMessages)
      setInitialized(true)
    }
  }, [open, sessions, initialized, loadPersistedMessages, loadMessages])

  // Smart auto-scroll: only scroll if user is near the bottom
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Close session picker on outside click
  useEffect(() => {
    if (!sessionsOpen) return
    const handler = (e: MouseEvent) => {
      if (sessionsRef.current && !sessionsRef.current.contains(e.target as Node)) {
        setSessionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sessionsOpen])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    let sid = sessionId
    if (!sid) {
      const session = await createSession(text)
      sid = session.id
      setSessionId(sid)
      setInitialized(true)
    }

    setInput('')
    await sendMessage(text, { chatSessionId: sid })
  }, [input, loading, sessionId, createSession, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const switchSession = useCallback(async (session: ChatSession) => {
    if (session.id === sessionId) {
      setSessionsOpen(false)
      return
    }
    detachStream()
    clearMessages()
    setSessionId(session.id)
    const persisted = await loadPersistedMessages(session.id)
    loadMessages(persisted)
    setSessionsOpen(false)
  }, [sessionId, detachStream, clearMessages, loadPersistedMessages, loadMessages])

  const handleNewSession = useCallback(() => {
    detachStream()
    clearMessages()
    setSessionId(null)
    setSessionsOpen(false)
  }, [detachStream, clearMessages])

  const activeSession = sessions.find((s) => s.id === sessionId)

  // Don't render on /chat page or on mobile (< md)
  if (pathname === '/chat') return null

  return (
    <>
      {/* Floating button — hidden on mobile */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-purple-600/80 shadow-lg shadow-purple-500/25
            hidden md:flex items-center justify-center
            hover:scale-105 active:scale-95 transition-transform
            border-2 border-purple-400/30 hover:border-purple-400/60"
        >
          <MessageSquare size={22} className="text-white" />
        </button>
      )}

      {/* Chat popup — hidden on mobile */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50
          w-[380px] h-[520px]
          hidden md:flex flex-col
          bg-[#0e0e18] border border-white/[0.08] rounded-2xl
          shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-violet-400/30 flex items-center justify-center">
                  <MessageSquare size={14} className="text-purple-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0e0e18]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Assistant</p>
                <p className="text-[10px] text-white/30">AI Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Session picker toggle */}
              <div className="relative" ref={sessionsRef}>
                <button
                  onClick={() => setSessionsOpen((v) => !v)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
                  title="Conversations"
                >
                  <MessageSquare size={15} />
                </button>

                {/* Session dropdown */}
                {sessionsOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 max-h-64 overflow-y-auto
                    bg-[#111118] border border-white/[0.1] rounded-xl shadow-xl shadow-black/40 z-50"
                  >
                    <button
                      onClick={handleNewSession}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white/80 transition-colors border-b border-white/[0.06]"
                    >
                      <Plus size={12} />
                      New conversation
                    </button>
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => switchSession(s)}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors truncate
                          ${s.id === sessionId
                            ? 'bg-white/[0.08] text-white'
                            : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                          }`}
                      >
                        {s.title}
                      </button>
                    ))}
                    {sessions.length === 0 && (
                      <p className="text-[11px] text-white/20 px-3 py-2">No history</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Active session indicator */}
          {activeSession && (
            <button
              onClick={() => setSessionsOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 border-b border-white/[0.04] text-[10px] text-white/25 hover:text-white/40 hover:bg-white/[0.02] transition-colors"
            >
              <span className="truncate">{activeSession.title}</span>
              <ChevronDown size={10} className="shrink-0" />
            </button>
          )}

          {/* Messages */}
          <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-violet-400/20 flex items-center justify-center">
                  <MessageSquare size={18} className="text-purple-300/60" />
                </div>
                <p className="text-xs text-white/20">Type something to start...</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600/20 text-white/90 rounded-br-md'
                      : 'bg-white/[0.06] text-white/80 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                      <MarkdownMessage content={msg.content} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.streaming && (
                    <span className="inline-block w-1.5 h-4 bg-purple-400/60 animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-end gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none resize-none max-h-24"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 disabled:text-white/15 transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
