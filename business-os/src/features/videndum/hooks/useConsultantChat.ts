'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ConsultantMessage, ToolCall } from '../types/consultant'

type SSEEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_start'; toolName: string; toolId: string }
  | { type: 'tool_done'; toolId: string }
  | { type: 'result'; text: string }
  | { type: 'error'; message: string }

export function useConsultantChat(radarContext?: string | null) {
  const [messages, setMessages] = useState<ConsultantMessage[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ConsultantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date(),
    }
    const assistantId = `a-${Date.now()}`
    const assistantMsg: ConsultantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      streaming: true,
      createdAt: new Date(),
    }

    setMessages(prev => {
      const history = [...prev, userMsg, assistantMsg]
      return history
    })
    setLoading(true)
    abortRef.current = new AbortController()

    // Build messages array for the API (exclude the empty assistant placeholder)
    const historyForApi = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    console.log('[ConsultantChat] sendMessage — POST /api/videndum/consultant', { messageCount: historyForApi.length, hasRadar: !!radarContext })

    try {
      const res = await fetch('/api/videndum/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi, radarContext: radarContext ?? undefined }),
        signal: abortRef.current.signal,
      })

      console.log('[ConsultantChat] response status:', res.status, res.statusText)

      if (res.status === 401) {
        console.error('[ConsultantChat] 401 Unauthorized — redirigiendo a /login')
        window.location.href = '/login'
        return
      }

      if (!res.ok || !res.body) {
        let errBody: unknown
        try { errBody = await res.json() } catch { errBody = await res.text().catch(() => '(no body)') }
        console.error('[ConsultantChat] HTTP error', res.status, res.statusText, errBody)
        const errMsg = typeof errBody === 'object' && errBody !== null && 'error' in errBody
          ? String((errBody as Record<string, unknown>).error)
          : `HTTP ${res.status} — ${res.statusText}`
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: errMsg, error: true, streaming: false }
              : m
          )
        )
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''
      let toolCalls: ToolCall[] = []

      // RAF-batched text updates
      let pending = false
      let rafId = 0
      const flush = () => {
        pending = false
        const snap = accumulated
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: snap } : m)
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
          const raw = line.slice(6)
          if (raw === '[DONE]') continue

          let event: SSEEvent
          try { event = JSON.parse(raw) as SSEEvent } catch { continue }

          switch (event.type) {
            case 'text_delta':
              accumulated += event.text
              if (!pending) {
                pending = true
                rafId = requestAnimationFrame(flush)
              }
              break

            case 'tool_start':
              toolCalls = [...toolCalls, { toolId: event.toolId, toolName: event.toolName, status: 'running' }]
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, toolCalls: [...toolCalls] } : m)
              )
              break

            case 'tool_done':
              toolCalls = toolCalls.map(t =>
                t.toolId === event.toolId ? { ...t, status: 'done' as const } : t
              )
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, toolCalls: [...toolCalls] } : m)
              )
              break

            case 'result':
              cancelAnimationFrame(rafId)
              pending = false
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: event.text, streaming: false, toolCalls: [...toolCalls] }
                    : m
                )
              )
              break

            case 'error':
              cancelAnimationFrame(rafId)
              pending = false
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: event.message ?? 'Error', error: true, streaming: false }
                    : m
                )
              )
              break
          }
        }
      }

      cancelAnimationFrame(rafId)
      if (pending) flush()

      // Ensure streaming flag is off
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId && m.streaming ? { ...m, streaming: false } : m
        )
      )
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[ConsultantChat] abortado por el usuario')
        setMessages(prev =>
          prev.map(m => m.id === assistantId && m.streaming ? { ...m, streaming: false } : m)
        )
        return
      }
      console.error('[ConsultantChat] fetch/stream error:', err)
      if (err instanceof Error) {
        console.error('[ConsultantChat] error name:', err.name, '| message:', err.message)
        console.error('[ConsultantChat] stack:', err.stack)
      }
      const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : 'Error de conexión desconocido'
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: errMsg, error: true, streaming: false }
            : m
        )
      )
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, messages])

  const clearMessages = useCallback(() => setMessages([]), [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, loading, sendMessage, clearMessages, stop }
}
