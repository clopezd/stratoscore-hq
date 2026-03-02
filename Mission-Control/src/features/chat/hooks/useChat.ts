'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

export interface CompactMeta {
  tokensBefore?: number
  tokensAfter?: number
}

export interface ToolCall {
  toolId: string
  toolName: string
  status: 'running' | 'done'
}

export interface UsageMeta {
  costUsd: number
  inputTokens: number
  outputTokens: number
  durationMs: number
  numTurns: number
  contextUsed?: number
  contextTotal?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
  audioUrl?: string
  imageUrl?: string
  compact?: CompactMeta
  metadata?: { source?: string; jobId?: string; jobLabel?: string } | null
  toolCalls?: ToolCall[]
  usage?: UsageMeta
  streaming?: boolean
}

// SSE event types from Agent Server
type SSEEvent =
  | { type: 'init'; sessionId: string; slashCommands?: string[] }
  | { type: 'text_delta'; text: string }
  | { type: 'tool_start'; toolName: string; toolId: string }
  | { type: 'tool_done'; toolId: string }
  | { type: 'compact'; tokensBefore?: number; tokensAfter?: number }
  | { type: 'usage'; costUsd: number; inputTokens: number; outputTokens: number; durationMs: number; numTurns: number; contextUsed?: number; contextTotal?: number }
  | { type: 'result'; text: string }
  | { type: 'model_changed'; model: string }
  | { type: 'interrupt' }
  | { type: 'error'; message: string }

interface UseChatOptions {
  sessionId?: string | null
  onSave?: (userMsg: string, assistantMsg: string, audioUrl?: string, imageUrl?: string) => Promise<void>
}

export function useChat({ sessionId, onSave }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const intentionalStopRef = useRef(false)
  const streamSessionRef = useRef<string | null>(null)

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const stopStreaming = useCallback(async () => {
    // 1. Send graceful interrupt to agent server
    fetch('/api/chat/interrupt', { method: 'POST' }).catch(() => {})
    // 2. Abort fetch as fallback
    abortRef.current?.abort()
  }, [])

  // Detach stream when user switches to a different session.
  // Agent keeps processing in background.
  const detachStream = useCallback(() => {
    if (!loading) return
    intentionalStopRef.current = false
    setLoading(false)
  }, [loading])

  const sendMessage = useCallback(async (text: string, opts?: { audioUrl?: string; effort?: string; imageUrl?: string; chatSessionId?: string }) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    streamSessionRef.current = opts?.chatSessionId ?? null

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      audioUrl: opts?.audioUrl,
      imageUrl: opts?.imageUrl,
    }
    const assistantId = `a-${Date.now()}`
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
      toolCalls: [],
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setLoading(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, ...(opts?.effort && { effort: opts.effort }) }),
        signal: abortRef.current.signal,
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: data.error || 'Connection error', error: true, streaming: false }
              : m
          )
        )
        return
      }

      // Read SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''
      let compactMeta: CompactMeta | undefined
      let usageMeta: UsageMeta | undefined
      let toolCalls: ToolCall[] = []

      // RAF text batching – avoid setState on every tiny text_delta
      let pendingFlush = false
      let rafId = 0
      const flushText = () => {
        pendingFlush = false
        const snapshot = accumulatedText
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: snapshot } : m
          )
        )
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          let event: SSEEvent
          try {
            event = JSON.parse(data) as SSEEvent
          } catch {
            continue
          }

          switch (event.type) {
            case 'text_delta':
              accumulatedText += event.text
              if (!pendingFlush) {
                pendingFlush = true
                rafId = requestAnimationFrame(flushText)
              }
              break

            case 'tool_start':
              toolCalls = [...toolCalls, { toolId: event.toolId, toolName: event.toolName, status: 'running' }]
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, toolCalls: [...toolCalls] } : m
                )
              )
              break

            case 'tool_done':
              toolCalls = toolCalls.map((t) =>
                t.toolId === event.toolId ? { ...t, status: 'done' as const } : t
              )
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, toolCalls: [...toolCalls] } : m
                )
              )
              break

            case 'compact':
              compactMeta = { tokensBefore: event.tokensBefore, tokensAfter: event.tokensAfter }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, compact: compactMeta } : m
                )
              )
              break

            case 'usage':
              usageMeta = {
                costUsd: event.costUsd,
                inputTokens: event.inputTokens,
                outputTokens: event.outputTokens,
                durationMs: event.durationMs,
                numTurns: event.numTurns,
                contextUsed: event.contextUsed,
                contextTotal: event.contextTotal,
              }
              break

            case 'result':
              cancelAnimationFrame(rafId)
              pendingFlush = false
              accumulatedText = event.text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: event.text, streaming: false, usage: usageMeta, compact: compactMeta, toolCalls: [...toolCalls] }
                    : m
                )
              )
              break

            case 'model_changed':
              setCurrentModel(event.model)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: `Model changed to **${event.model}**`, streaming: false }
                    : m
                )
              )
              break

            case 'error':
              cancelAnimationFrame(rafId)
              pendingFlush = false
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: event.message || 'Agent error', error: true, streaming: false }
                    : m
                )
              )
              break
          }
        }
      }

      // Cancel any pending RAF flush
      cancelAnimationFrame(rafId)
      if (pendingFlush) flushText()

      // Mark streaming done (in case we didn't get a result event)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && m.streaming
            ? { ...m, streaming: false, usage: usageMeta }
            : m
        )
      )

      // Persist to Supabase
      if (accumulatedText.trim() && onSave) {
        onSave(trimmed, accumulatedText.trim(), opts?.audioUrl, opts?.imageUrl).catch(() => {})
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User aborted - mark message as done with what we have
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.streaming
              ? { ...m, streaming: false }
              : m
          )
        )
        // Still save what we got
        setMessages((prev) => {
          const msg = prev.find((m) => m.id === assistantId)
          if (msg?.content.trim() && onSave) {
            onSave(trimmed, msg.content.trim(), opts?.audioUrl, opts?.imageUrl).catch(() => {})
          }
          return prev
        })
        return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Connection interrupted. Send the message again.', error: true, streaming: false }
            : m
        )
      )
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading, onSave])

  const loadMessages = useCallback((
    persisted: Array<{ id: string; role: 'user' | 'assistant'; content: string; created_at: string; audio_url?: string | null; metadata?: { source?: string; jobId?: string; jobLabel?: string } | null }>,
  ) => {
    setMessages(
      persisted.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        audioUrl: m.audio_url ?? undefined,
        metadata: m.metadata ?? undefined,
      })),
    )
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  return { messages, loading, sendMessage, loadMessages, clearMessages, appendMessage, stopStreaming, detachStream, currentModel }
}
