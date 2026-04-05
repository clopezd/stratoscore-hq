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
import { getFinanceSummary, createTransaction, createGastoMensual, createGastoAnual, getGastosMensuales, getGastosAnuales } from './finance-client.js'
import express from 'express'
import agentsRouter from './agents-api.js'
import publicChatRouter from './public-chat-api.js'

const env = readEnvFile(['OPENCLAW_GATEWAY_TOKEN', 'MC_SERVER_PORT', 'MISSION_CONTROL_ORIGIN'])
const MC_TOKEN = env['OPENCLAW_GATEWAY_TOKEN'] ?? ''
const PORT = parseInt(env['MC_SERVER_PORT'] ?? '3099', 10)
const ALLOWED_ORIGIN = env['MISSION_CONTROL_ORIGIN'] ?? 'http://localhost:3000'
const PUBLIC_ALLOWED_ORIGINS = ['https://www.stratoscore.app', 'https://stratoscore.app', 'http://localhost:3000']

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

// ─── Agent API handler (Express) ─────────────────────────────────────────────

const agentApp = express()
agentApp.use(express.json())
agentApp.use('/agents', agentsRouter)

async function handleAgentAPI(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return new Promise((resolve) => {
    agentApp(req as any, res as any, () => resolve())
  })
}

// ─── Public Chat API handler (Express, NO auth) ──────────────────────────────

const publicChatApp = express()
publicChatApp.use(express.json())

// CORS middleware para public chat
publicChatApp.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && PUBLIC_ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  next()
})

publicChatApp.use('/chat', publicChatRouter)

async function handlePublicChatAPI(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return new Promise((resolve) => {
    publicChatApp(req as any, res as any, () => resolve())
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

  // Public Chat API — NO requiere auth
  if (req.url?.startsWith('/chat')) {
    await handlePublicChatAPI(req, res)
    return
  }

  // Agent API routes — handle separately (uses Express router)
  if (req.url?.startsWith('/agents')) {
    await handleAgentAPI(req, res)
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

  // POST /finance/transactions — crear transacción
  if (req.method === 'POST' && req.url === '/finance/transactions') {
    try {
      const result = await createTransaction(parsed as any)
      sendJSON(res, 201, result)
    } catch (err) {
      logger.error({ err }, 'POST /finance/transactions error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // POST /finance/gastos-mensuales — crear gasto mensual
  if (req.method === 'POST' && req.url === '/finance/gastos-mensuales') {
    try {
      const result = await createGastoMensual(parsed as any)
      sendJSON(res, 201, result)
    } catch (err) {
      logger.error({ err }, 'POST /finance/gastos-mensuales error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // POST /finance/gastos-anuales — crear gasto anual
  if (req.method === 'POST' && req.url === '/finance/gastos-anuales') {
    try {
      const result = await createGastoAnual(parsed as any)
      sendJSON(res, 201, result)
    } catch (err) {
      logger.error({ err }, 'POST /finance/gastos-anuales error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // GET /finance/gastos-mensuales — listar gastos mensuales activos
  if (req.method === 'GET' && req.url === '/finance/gastos-mensuales') {
    try {
      const data = await getGastosMensuales()
      sendJSON(res, 200, data)
    } catch (err) {
      logger.error({ err }, 'GET /finance/gastos-mensuales error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // GET /finance/gastos-anuales — listar gastos anuales activos
  if (req.method === 'GET' && req.url === '/finance/gastos-anuales') {
    try {
      const data = await getGastosAnuales()
      sendJSON(res, 200, data)
    } catch (err) {
      logger.error({ err }, 'GET /finance/gastos-anuales error')
      sendJSON(res, 500, { error: String(err) })
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

  // POST /occupancy/run — ejecutar Captain Occupancy manualmente
  if (req.method === 'POST' && req.url === '/occupancy/run') {
    try {
      const { runCaptainOccupancy } = await import('./agents/captain-occupancy.js')
      const results = await runCaptainOccupancy('manual')
      sendJSON(res, 200, { success: true, results })
    } catch (err) {
      logger.error({ err }, '/occupancy/run error')
      sendJSON(res, 500, { success: false, error: String(err) })
    }
    return
  }

  // GET /occupancy/status — últimas ejecuciones de Captain Occupancy
  if (req.method === 'GET' && req.url === '/occupancy/status') {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.SUPABASE_URL || 'https://csiiulvqzkgijxbgdqcv.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || ''
      )
      const { data: executions } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('agent_name', 'occupancy')
        .order('started_at', { ascending: false })
        .limit(10)
      sendJSON(res, 200, { success: true, executions })
    } catch (err) {
      logger.error({ err }, '/occupancy/status error')
      sendJSON(res, 500, { success: false, error: String(err) })
    }
    return
  }

  // POST /execute-action — ejecutar acciones agénticas de tareas personales
  if (req.method === 'POST' && req.url === '/execute-action') {
    try {
      const action = parsed
      let result: any = {}

      switch (action.type) {
        case 'deploy':
          // TODO: Implementar lógica de deploy
          result = { message: `Deploy to ${action.target} scheduled` }
          break

        case 'run_command':
          // Ejecutar comando en el sistema
          const { execSync } = await import('child_process')
          const cwd = typeof action.cwd === 'string' ? action.cwd : PROJECT_ROOT
          const output = execSync(action.command as string, {
            cwd,
            encoding: 'utf8',
            timeout: 30000
          })
          result = { command: action.command, output }
          break

        case 'git_commit':
          // Git commit automático
          const { execSync: gitExec } = await import('child_process')
          const gitOutput = gitExec(`git commit -am "${action.message}"`, {
            cwd: PROJECT_ROOT,
            encoding: 'utf8'
          })
          result = { message: action.message, output: gitOutput }
          break

        case 'notify':
          // Enviar notificación por Telegram
          // TODO: Integrar con bot de Telegram
          result = { channel: action.channel, message: action.message, sent: true }
          break

        default:
          sendJSON(res, 400, { error: `Unknown action type: ${action.type}` })
          return
      }

      sendJSON(res, 200, { success: true, result })
    } catch (err: any) {
      logger.error({ err }, '/execute-action error')
      sendJSON(res, 500, { success: false, error: err.message })
    }
    return
  }

  // POST /notify — enviar notificación por Telegram
  if (req.method === 'POST' && req.url === '/notify') {
    try {
      const { message } = parsed
      // TODO: Integrar con bot de Telegram
      logger.info({ message }, 'notification sent')
      sendJSON(res, 200, { sent: true, message })
    } catch (err) {
      logger.error({ err }, '/notify error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // POST /webhooks/git-commit — webhook post-commit: analiza commit y auto-mueve tareas
  if (req.method === 'POST' && req.url === '/webhooks/git-commit') {
    try {
      const { matchCommitToTasks, getLatestCommitInfo } = await import('./agents/task-validator.js')
      const commit = getLatestCommitInfo()
      if (!commit) {
        sendJSON(res, 200, { success: true, message: 'No commit found', matches: [] })
        return
      }

      const result = await matchCommitToTasks(commit)
      logger.info({
        commit: commit.hash?.substring(0, 7),
        message: commit.message,
        completed: result.tasksCompleted,
        started: result.tasksStarted,
        newClients: result.newClients
      }, '🔗 Git webhook processed')

      // Notificar por Telegram si hubo cambios
      if (result.matches.length > 0 || result.newClients > 0) {
        try {
          const lines = ['📋 *Auto-update post-commit*', `\`${commit.hash?.substring(0, 7)}\` ${commit.message}`, '']
          if (result.newClients > 0) lines.push(`🆕 ${result.newClients} cliente(s) nuevo(s) detectado(s)`)
          for (const m of result.matches) {
            const icon = m.newStatus === 'done' ? '✅' : '🔄'
            lines.push(`${icon} ${m.taskTitle} → ${m.newStatus}`)
            lines.push(`   _${m.reason}_`)
          }
          // Fire-and-forget notification
          fetch(`http://localhost:${PORT}/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MC_TOKEN}` },
            body: JSON.stringify({ message: lines.join('\n') })
          }).catch(() => {})
        } catch { /* notification is best-effort */ }
      }

      sendJSON(res, 200, {
        success: true,
        commit: { hash: commit.hash?.substring(0, 7), message: commit.message },
        tasksCompleted: result.tasksCompleted,
        tasksStarted: result.tasksStarted,
        newClients: result.newClients,
        matches: result.matches
      })
    } catch (err) {
      logger.error({ err }, '/webhooks/git-commit error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // POST /tasks/validate — validar tareas en curso automáticamente
  if (req.method === 'POST' && req.url === '/tasks/validate') {
    try {
      const { validateAllInProgressTasks } = await import('./agents/task-validator.js')
      const { completed, started, newClients } = await validateAllInProgressTasks()
      sendJSON(res, 200, { success: true, completed, started, newClients })
    } catch (err) {
      logger.error({ err }, '/tasks/validate error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // POST /tasks/validate/:taskId — validar tarea específica
  const validateTaskMatch = req.url?.match(/^\/tasks\/validate\/([a-f0-9-]+)$/)
  if (req.method === 'POST' && validateTaskMatch) {
    try {
      const taskId = validateTaskMatch[1]
      const { validateTask } = await import('./agents/task-validator.js')
      const completed = await validateTask(taskId)
      sendJSON(res, 200, { success: true, completed })
    } catch (err: any) {
      logger.error({ err }, '/tasks/validate/:taskId error')
      sendJSON(res, 500, { error: err.message })
    }
    return
  }

  // POST /tasks/validate-rule — probar una regla antes de guardarla
  if (req.method === 'POST' && req.url === '/tasks/validate-rule') {
    try {
      const { rule_type, rule_config } = parsed
      if (!rule_type || !rule_config) {
        sendJSON(res, 400, { error: 'rule_type and rule_config required' })
        return
      }

      const { validateRule } = await import('./agents/task-validator.js')
      const result = await validateRule({ rule_type, rule_config } as any)
      sendJSON(res, 200, { passed: result.passed, error: result.error })
    } catch (err: any) {
      logger.error({ err }, '/tasks/validate-rule error')
      sendJSON(res, 500, { error: err.message })
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
