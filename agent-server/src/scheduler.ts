import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
// cron-parser is CJS — use createRequire for reliable interop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { parseExpression } = _require('cron-parser') as any
import { getDueTasks, createTask, updateTaskAfterRun, taskExists } from './db.js'
import { runAgent } from './agent.js'
import { logger } from './logger.js'
import { ALLOWED_CHAT_ID } from './config.js'
import { mcCronResult } from './mc-client.js'

let schedulerInterval: ReturnType<typeof setInterval> | null = null

const SCHEDULER_TZ = process.env['SCHEDULER_TZ'] ?? 'UTC'

export function computeNextRun(cronExpression: string): number {
  const interval = parseExpression(cronExpression, { tz: SCHEDULER_TZ })
  return Math.floor(interval.next().getTime() / 1000)
}

export async function runDueTasks(): Promise<void> {
  const tasks = getDueTasks()
  if (tasks.length === 0) return

  for (const task of tasks) {
    logger.info({ taskId: task.id, prompt: task.prompt.slice(0, 80) }, 'running scheduled task')

    try {
      const result = await runAgent(task.prompt)
      const text = result.text?.trim() ?? ''
      const nextRun = computeNextRun(task.schedule)

      // Enviar resultado a Mission Control
      mcCronResult(task.id, text || '(no output)')

      updateTaskAfterRun(task.id, text || '(no output)', nextRun)
      logger.info({ taskId: task.id, nextRun }, 'task completed')
    } catch (err) {
      logger.error({ err, taskId: task.id }, 'scheduled task error')
      const nextRun = computeNextRun(task.schedule)
      mcCronResult(task.id, '', String(err))
      updateTaskAfterRun(task.id, `Error: ${String(err)}`, nextRun)
    }
  }
}

export function initScheduler(): void {
  seedDefaultTasks()

  // Poll every 60 seconds
  schedulerInterval = setInterval(() => {
    runDueTasks().catch((err) => logger.error({ err }, 'scheduler poll error'))
  }, 60_000)

  logger.info('scheduler started')
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
  }
}

// ============================================================
// SEED: Example cron jobs
// ============================================================

function seedDefaultTasks(): void {
  const DM = ALLOWED_CHAT_ID

  // Example cron jobs — customize these for your use case
  const tasks = [
    {
      id: 'daily-summary',
      chat_id: DM,
      thread_id: null,
      schedule: '0 9 * * *', // 9 AM daily
      prompt: `Generate a brief daily summary. Include:
- Any pending tasks or reminders
- Key metrics from your connected services
- Recommended priorities for today

Keep it concise and actionable.`,
    },
    {
      id: 'system-health',
      chat_id: DM,
      thread_id: null,
      schedule: '0 2 * * 1', // Mondays 2 AM
      prompt: `Run a weekly system health check:
- Check for outdated dependencies in package.json files
- Verify database connectivity
- Report any errors from recent logs

Format: Markdown with clear status indicators.`,
    },
  ]

  for (const task of tasks) {
    if (!taskExists(task.id)) {
      const nextRun = computeNextRun(task.schedule)
      createTask({
        id: task.id,
        chat_id: task.chat_id,
        thread_id: task.thread_id,
        prompt: task.prompt,
        schedule: task.schedule,
        next_run: nextRun,
        status: 'active',
        created_at: Math.floor(Date.now() / 1000),
      })
      logger.debug({ taskId: task.id, nextRun }, 'seeded default task')
    }
  }
}
