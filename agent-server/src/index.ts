import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { TELEGRAM_BOT_TOKEN, STORE_DIR } from './config.js'
import { readEnvFile } from './env.js'
import { initDatabase } from './db.js'
import { initScheduler, stopScheduler } from './scheduler.js'
import { cleanupOldUploads } from './media.js'
import { runDecaySweep } from './memory.js'
import { createBot, createSender } from './bot.js'
import { startMCServer } from './server.js'
import { logger } from './logger.js'
import type { Bot } from 'grammy'

// ─── Global error handlers ───────────────────────────────────────────────────

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'unhandled promise rejection')
  // No matar el proceso — solo loguear
  // El agente debe seguir funcionando incluso si una promesa falla
})

process.on('uncaughtException', (error, origin) => {
  logger.fatal({ error, origin }, 'uncaught exception')
  // En excepciones no capturadas, es más seguro salir y dejar que PM2 reinicie
  releaseLock()
  process.exit(1)
})

const PID_FILE = join(STORE_DIR, 'agent-server.pid')
const LOCK_MARKER = 'agent-server/dist/index.js'

// ─── Lock ────────────────────────────────────────────────────────────────────

// Lee /proc/<pid>/cmdline en Linux. Si el archivo no existe o no se puede leer,
// devolvemos null (no podemos verificar identidad → tratamos como stale).
function readCmdline(pid: number): string | null {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ')
  } catch {
    return null
  }
}

function acquireLock(): void {
  mkdirSync(STORE_DIR, { recursive: true })
  if (existsSync(PID_FILE)) {
    const existingPid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10)
    let aliveAndOurs = false
    if (Number.isFinite(existingPid)) {
      try {
        process.kill(existingPid, 0)
        // El PID existe — pero verificar que sea el agente, no un PID reciclado
        const cmdline = readCmdline(existingPid)
        if (cmdline && cmdline.includes(LOCK_MARKER)) {
          aliveAndOurs = true
        } else {
          logger.warn({ pid: existingPid, cmdline }, 'PID alive but not agent-server (recycled). Removing stale lock.')
        }
      } catch {
        logger.warn({ pid: existingPid }, 'Stale PID file found, removing.')
      }
    }
    if (aliveAndOurs) {
      logger.error({ pid: existingPid }, 'Another instance is already running. Exiting.')
      process.exit(1)
    }
    unlinkSync(PID_FILE)
  }
  writeFileSync(PID_FILE, String(process.pid))
  logger.debug({ pid: process.pid, pidFile: PID_FILE }, 'lock acquired')
}

function releaseLock(): void {
  try {
    if (existsSync(PID_FILE)) unlinkSync(PID_FILE)
  } catch {
    // ignorar
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════╗')
  console.log('║         Agent Server v1           ║')
  console.log('╚═══════════════════════════════════╝')
  console.log()

  // Validar variables críticas (Telegram es opcional)
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN is not set. Telegram bot disabled.')
  }

  // Adquirir lock (singleton)
  acquireLock()

  // Base de datos
  initDatabase()
  logger.info('database initialized')

  // Expose gog CLI config to Agent SDK subprocess (non-secrets, needed for Google Workspace)
  const gogVars = readEnvFile(['GOG_KEYRING_PASSWORD', 'GOG_ENABLE_COMMANDS'])
  for (const [k, v] of Object.entries(gogVars)) { if (v) process.env[k] = v }

  // Mission Control web server (localhost:3099)
  startMCServer()

  // Memory decay al arrancar + cada 24h
  runDecaySweep()
  const decayInterval = setInterval(runDecaySweep, 24 * 60 * 60 * 1000)

  // Limpiar uploads viejos al arrancar
  cleanupOldUploads()

  // Crear bot (solo si hay token)
  let bot: Bot | undefined
  let sender: ((chatId: string, text: string, threadId?: number) => Promise<void>) | undefined
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'optional') {
    bot = createBot()
    sender = createSender(bot)
    logger.info('Telegram bot initialized')
  } else {
    logger.info('Telegram bot disabled - running without bot')
  }

  // Iniciar scheduler (seedea tareas default si no existen)
  initScheduler()
  logger.info('scheduler initialized')

  // SIGINT / SIGTERM — shutdown graceful
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down...')
    stopScheduler()
    clearInterval(decayInterval)
    releaseLock()

    if (bot) {
      try {
        await bot.stop()
      } catch {
        // ignorar errores al detener el bot
      }
    }

    logger.info('goodbye')
    process.exit(0)
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))

  // Iniciar polling de Telegram (solo si el bot está habilitado)
  if (bot) {
    logger.info('starting bot...')
    await bot.start({
      onStart: (info) => {
        logger.info({ username: info.username }, 'bot online')
        console.log(`\n✓ Bot @${info.username} is online. Send a message on Telegram!\n`)
      },
    })
  } else {
    logger.info('Telegram bot disabled - server running in API-only mode')
    console.log('\n✓ Agent Server running (Telegram disabled)\n')
  }
}

main().catch((err) => {
  logger.error({ err }, 'fatal error')
  releaseLock()
  process.exit(1)
})
