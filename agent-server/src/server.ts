/**
 * Mission Control Web Server — exposes a local HTTP endpoint so Mission Control
 * dashboard can send messages to the Agent (Claude Code Agent SDK) from the browser.
 *
 * Endpoints:
 *   POST /chat            { message: string } → { text: string }
 *   POST /chat/stream     { message: string } → SSE stream
 *   POST /chat/interrupt  {}                  → gracefully stop active query
 *   POST /newchat         {}                  → { ok: true }
 *   GET  /commands         → available slash commands
 *   GET  /models           → available AI models
 *   GET  /usage?days=30    → usage summary (tokens, cost)
 *   GET  /schedule         → list cron jobs
 *   POST /schedule/:id/:action → run/pause/resume a cron job
 *
 * Auth: Bearer token (OPENCLAW_GATEWAY_TOKEN)
 * Port: MC_SERVER_PORT env var, default 3099
 */

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { timingSafeEqual } from 'crypto'
import { readEnvFile } from './env.js'
import { PROJECT_ROOT } from './config.js'
import { runAgent, runAgentStream, getAvailableModels, EffortLevel, type Query } from './agent.js'
import { getSession, setSession, clearSession, listTasks, getTask, updateTaskStatus, updateTaskAfterRun, saveQueryUsage, getUsageSummary } from './db.js'
import { computeNextRun, runDueTasks } from './scheduler.js'
import { buildMemoryContext, saveConversationTurn } from './memory.js'
import { logger } from './logger.js'
import { getFinanceSummary } from './finance-client.js'

const env = readEnvFile(['OPENCLAW_GATEWAY_TOKEN', 'MC_SERVER_PORT', 'MISSION_CONTROL_ORIGIN'])
const MC_TOKEN = env['OPENCLAW_GATEWAY_TOKEN'] ?? ''
const PORT = parseInt(env['MC_SERVER_PORT'] ?? '3099', 10)
const ALLOWED_ORIGIN = env['MISSION_CONTROL_ORIGIN'] ?? 'http://localhost:3000'

if (!MC_TOKEN) {
  console.error('FATAL: OPENCLAW_GATEWAY_TOKEN is not set. Server will reject all requests.')
}

function isTokenValid(provided: string): boolean {
  if (!MC_TOKEN) return false
  if (provided.length !== MC_TOKEN.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(MC_TOKEN))
}

// Separate session key for web chat (different from Telegram session)
const SESSION_KEY = 'mc-web'

// Active query reference for interrupt support
let activeQuery: Query | null = null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setCORSHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function sendJSON(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
  })
}

// ─── Request handler ─────────────────────────────────────────────────────────

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  setCORSHeaders(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Auth
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '')
  if (!isTokenValid(token)) {
    sendJSON(res, 401, { error: 'Unauthorized' })
    return
  }

  const body = await readBody(req)
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(body) } catch { /* ignore */ }

  // GET /models — return available models (hardcoded + SDK fallback)
  if (req.method === 'GET' && req.url === '/models') {
    const MODELS = [
      { value: 'claude-opus-4-6',           displayName: 'Opus 4.6',   description: 'Most capable. Agents and code.',    supportsEffort: true },
      { value: 'claude-sonnet-4-6',         displayName: 'Sonnet 4.6', description: 'Balance of speed + intelligence.', supportsEffort: true },
      { value: 'claude-haiku-4-5-20251001', displayName: 'Haiku 4.5',  description: 'Fastest. Light tasks.',            supportsEffort: true },
    ]

    // Try SDK models first, fallback to hardcoded
    try {
      const sessionId = getSession(SESSION_KEY)
      const sdkModels = await getAvailableModels(sessionId)
      sendJSON(res, 200, { models: sdkModels.length > 0 ? sdkModels : MODELS })
    } catch {
      sendJSON(res, 200, { models: MODELS })
    }
    return
  }

  // POST /chat/interrupt — gracefully interrupt the active query
  if (req.method === 'POST' && req.url === '/chat/interrupt') {
    if (activeQuery) {
      try {
        await activeQuery.interrupt()
        activeQuery = null
        sendJSON(res, 200, { ok: true })
      } catch (err) {
        logger.error({ err }, 'interrupt error')
        activeQuery = null
        sendJSON(res, 200, { ok: true, message: 'Interrupt attempted' })
      }
    } else {
      sendJSON(res, 200, { ok: true, message: 'No active query' })
    }
    return
  }

  // GET /commands — return available slash commands
  if (req.method === 'GET' && req.url === '/commands') {
    sendJSON(res, 200, {
      commands: [
        { name: '/clear',   description: 'New conversation — clear history' },
        { name: '/compact', description: 'Compress context (reduce token usage)' },
        { name: '/status',  description: 'Agent status: model, active tasks, session' },
        { name: '/tasks',   description: 'Current tasks on the Kanban board' },
        { name: '/agents',  description: 'Live status of all agents' },
        { name: '/context', description: 'Current context usage (tokens)' },
        { name: '/model',   description: 'Switch AI model' },
        { name: '/help',    description: 'Show all available commands' },
      ],
    })
    return
  }

  // POST /newchat — reset Claude Code session
  if (req.method === 'POST' && req.url === '/newchat') {
    clearSession(SESSION_KEY)
    sendJSON(res, 200, { ok: true })
    return
  }

  // POST /chat/stream — SSE streaming endpoint for real-time chat
  if (req.method === 'POST' && req.url === '/chat/stream') {
    const message = typeof parsed['message'] === 'string' ? parsed['message'].trim() : ''
    if (!message) {
      sendJSON(res, 400, { error: 'message required' })
      return
    }

    // Intercept /model <name> — change model without sending to agent
    const modelMatch = message.match(/^\/model\s+(.+)$/i)
    if (modelMatch) {
      const modelName = modelMatch[1].trim()
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })

      try {
        const sessionId = getSession(SESSION_KEY)
        const { query: sdkQuery } = await import('@anthropic-ai/claude-agent-sdk')
        const stream = sdkQuery({
          prompt: '/status',
          options: {
            cwd: PROJECT_ROOT,
            ...(sessionId && { resume: sessionId }),
            settingSources: ['project', 'user'],
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
          },
        })
        await stream.setModel(modelName)
        await stream.interrupt()
        res.write(`data: ${JSON.stringify({ type: 'model_changed', model: modelName })}\n\n`)
      } catch (err) {
        logger.error({ err }, 'setModel error')
        res.write(`data: ${JSON.stringify({ type: 'error', message: `Failed to switch model: ${String(err)}` })}\n\n`)
      } finally {
        res.write('data: [DONE]\n\n')
        res.end()
      }
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })

    const ac = new AbortController()
    // Graceful interrupt on client disconnect, fallback to abort
    req.on('close', () => {
      if (activeQuery) {
        activeQuery.interrupt().catch(() => ac.abort())
      } else {
        ac.abort()
      }
    })

    try {
      const sessionId = getSession(SESSION_KEY)
      const memCtx = await buildMemoryContext(SESSION_KEY, message)
      const fullMessage = memCtx ? `${memCtx}\n\n${message}` : message

      const effort = typeof parsed['effort'] === 'string'
        ? (['low', 'medium', 'high', 'max'].includes(parsed['effort']) ? parsed['effort'] as EffortLevel : undefined)
        : undefined

      let newSessionId: string | undefined
      let resultText = ''

      for await (const event of runAgentStream(fullMessage, sessionId, ac.signal, effort, (q) => {
        activeQuery = q
      })) {
        if (ac.signal.aborted) break

        // Capture session ID for persistence
        if (event.type === 'init') {
          newSessionId = event.sessionId
        }
        if (event.type === 'result') {
          resultText = event.text
        }
        // Corrupted session: clear it so the next request starts a fresh conversation
        if (event.type === 'session_corrupted') {
          clearSession(SESSION_KEY)
          newSessionId = undefined
        }

        // Save usage data to SQLite
        if (event.type === 'usage') {
          saveQueryUsage({
            sessionKey: SESSION_KEY,
            costUsd: event.costUsd,
            inputTokens: event.inputTokens,
            outputTokens: event.outputTokens,
            durationMs: event.durationMs,
            numTurns: event.numTurns,
          })
        }

        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }

      // Persist session and memory
      if (newSessionId) setSession(SESSION_KEY, newSessionId)
      if (resultText.trim()) {
        await saveConversationTurn(SESSION_KEY, message, resultText.trim())
      }
    } catch (err) {
      logger.error({ err }, 'server /chat/stream error')
      res.write(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`)
    } finally {
      activeQuery = null
      res.write('data: [DONE]\n\n')
      res.end()
    }
    return
  }

  // POST /chat — run agent and return response (non-streaming)
  if (req.method === 'POST' && req.url === '/chat') {
    const message = typeof parsed['message'] === 'string' ? parsed['message'].trim() : ''
    if (!message) {
      sendJSON(res, 400, { error: 'message required' })
      return
    }

    try {
      const sessionId = getSession(SESSION_KEY)
      const memCtx = await buildMemoryContext(SESSION_KEY, message)
      const fullMessage = memCtx ? `${memCtx}\n\n${message}` : message

      const result = await runAgent(fullMessage, sessionId)

      if (result.newSessionId) {
        setSession(SESSION_KEY, result.newSessionId)
      }

      const responseText = result.text?.trim() ?? ''
      if (responseText) {
        await saveConversationTurn(SESSION_KEY, message, responseText)
      }

      sendJSON(res, 200, {
        text: responseText,
        ...(result.slashCommands && { slashCommands: result.slashCommands }),
        ...(result.isCompact && {
          compact: {
            tokensBefore: result.tokensBefore,
            tokensAfter: result.tokensAfter,
          },
        }),
      })
    } catch (err) {
      logger.error({ err }, 'server /chat error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // GET /usage — usage summary (tokens, cost, queries)
  if (req.method === 'GET' && req.url?.startsWith('/usage')) {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const days = parseInt(url.searchParams.get('days') ?? '30', 10)
    const sinceMs = Date.now() - 86_400_000 * days
    sendJSON(res, 200, getUsageSummary(sinceMs))
    return
  }

  // GET /schedule — list all cron jobs
  if (req.method === 'GET' && req.url === '/schedule') {
    sendJSON(res, 200, { tasks: listTasks() })
    return
  }

  // POST /schedule/:id/:action — run/pause/resume a cron job
  const scheduleMatch = req.url?.match(/^\/schedule\/([^/]+)\/(run|pause|resume)$/)
  if (req.method === 'POST' && scheduleMatch) {
    const [, taskId, action] = scheduleMatch
    const task = getTask(taskId)
    if (!task) {
      sendJSON(res, 404, { error: `Task "${taskId}" not found` })
      return
    }

    if (action === 'pause') {
      updateTaskStatus(taskId, 'paused')
      sendJSON(res, 200, { ok: true })
      return
    }

    if (action === 'resume') {
      const nextRun = computeNextRun(task.schedule)
      updateTaskStatus(taskId, 'active')
      updateTaskAfterRun(taskId, task.last_result ?? '', nextRun)
      sendJSON(res, 200, { ok: true, nextRun })
      return
    }

    // action === 'run' — execute async, return 202 immediately
    sendJSON(res, 202, { ok: true, message: `Task "${taskId}" queued for execution` })
    runAgent(task.prompt)
      .then((result) => {
        const text = result.text?.trim() ?? ''
        const nextRun = computeNextRun(task.schedule)
        updateTaskAfterRun(taskId, text || '(no output)', nextRun)
        logger.info({ taskId }, 'manual run completed')
      })
      .catch((err) => {
        const nextRun = computeNextRun(task.schedule)
        updateTaskAfterRun(taskId, `Error: ${String(err)}`, nextRun)
        logger.error({ err, taskId }, 'manual run error')
      })
    return
  }

  // GET /mc/report — proxy al endpoint de Mission Control
  if (req.method === 'GET' && req.url === '/mc/report') {
    try {
      const mcRes = await fetch('http://localhost:3000/api/openclaw/report', {
        headers: { Authorization: `Bearer ${MC_TOKEN}` },
        signal: AbortSignal.timeout(10_000),
      })
      if (!mcRes.ok) {
        sendJSON(res, mcRes.status, { error: `Mission Control respondió ${mcRes.status}` })
        return
      }
      const data = await mcRes.json()
      sendJSON(res, 200, data)
    } catch {
      sendJSON(res, 503, { error: 'Mission Control no disponible' })
    }
    return
  }

  // GET /finance/summary — resumen financiero vía Supabase
  if (req.method === 'GET' && req.url === '/finance/summary') {
    try {
      const summary = await getFinanceSummary()
      if (!summary) {
        sendJSON(res, 503, { error: 'ANALYTICS_SUPABASE vars no configuradas' })
        return
      }
      sendJSON(res, 200, summary)
    } catch (err) {
      logger.error({ err }, 'finance/summary error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  sendJSON(res, 404, { error: 'Not found' })
}

// ─── Start server ─────────────────────────────────────────────────────────────

export function startMCServer(): void {
  const server = createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      logger.error({ err }, 'server unhandled error')
      try {
        sendJSON(res, 500, { error: 'Internal server error' })
      } catch { /* headers already sent */ }
    })
  })

  server.listen(PORT, '127.0.0.1', () => {
    logger.info({ port: PORT }, 'MC web server listening on localhost')
    console.log(`✓ MC server on http://localhost:${PORT}`)
  })
}
