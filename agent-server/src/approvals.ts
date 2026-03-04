import type { Bot } from 'grammy'
import type { CanUseTool } from '@anthropic-ai/claude-agent-sdk'
import { logger } from './logger.js'

// ─── Safe tools — auto-approved ───────────────────────────────────────────────

const SAFE_TOOLS = new Set([
  'Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'LS',
  'TodoRead', 'TodoWrite', 'NotebookRead',
])

// ─── Pending approvals state ──────────────────────────────────────────────────

interface PendingApproval {
  resolve: (approved: boolean) => void
  timeoutId: ReturnType<typeof setTimeout>
  chatId: string
  messageId: number
  bot: Bot
}

const pending = new Map<string, PendingApproval>()

// ─── Resolve from Telegram callback ──────────────────────────────────────────

export function resolveApproval(toolUseId: string, approved: boolean): boolean {
  const entry = pending.get(toolUseId)
  if (!entry) return false

  clearTimeout(entry.timeoutId)
  pending.delete(toolUseId)
  entry.resolve(approved)
  return true
}

// ─── Message formatting ───────────────────────────────────────────────────────

function formatToolInput(toolName: string, input: Record<string, unknown>): string {
  const command =
    input['command'] ?? input['path'] ?? input['url'] ?? input['pattern'] ?? JSON.stringify(input)
  const preview = String(command).slice(0, 800)

  return (
    `🔐 <b>Aprobación requerida</b>\n\n` +
    `Herramienta: <code>${toolName}</code>\n` +
    `Comando:\n<pre>${escapeHtml(preview)}</pre>`
  )
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─── Factory ──────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

export function createApprovalHandler(bot: Bot, chatId: string): CanUseTool {
  return async (toolName, input, { toolUseID, signal }) => {
    // Auto-approve safe tools
    if (SAFE_TOOLS.has(toolName)) {
      return { behavior: 'allow' }
    }

    // If agent was aborted, deny immediately
    if (signal.aborted) {
      return { behavior: 'deny', message: 'Operación abortada.' }
    }

    logger.info({ toolName, toolUseID, chatId }, 'approval requested')

    const text = formatToolInput(toolName, input)
    const inlineKeyboard = {
      inline_keyboard: [[
        { text: '✅ Aprobar', callback_data: `approve:${toolUseID}` },
        { text: '❌ Denegar', callback_data: `deny:${toolUseID}` },
      ]],
    }

    // Send approval request to Telegram
    let messageId: number
    try {
      const msg = await bot.api.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      })
      messageId = msg.message_id
    } catch (err) {
      logger.error({ err }, 'failed to send approval message')
      return { behavior: 'deny', message: 'No se pudo enviar el mensaje de aprobación.' }
    }

    // Wait for user response or timeout
    const approved = await new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(async () => {
        pending.delete(toolUseID)
        resolve(false)

        try {
          await bot.api.editMessageText(
            chatId,
            messageId,
            text + '\n\n⏱ <i>Tiempo agotado — denegado automáticamente.</i>',
            { parse_mode: 'HTML' },
          )
        } catch { /* ignore */ }
      }, TIMEOUT_MS)

      // Auto-deny if agent aborted while waiting
      signal.addEventListener('abort', () => {
        if (pending.has(toolUseID)) {
          clearTimeout(timeoutId)
          pending.delete(toolUseID)
          resolve(false)
        }
      }, { once: true })

      pending.set(toolUseID, { resolve, timeoutId, chatId, messageId, bot })
    })

    logger.info({ toolName, toolUseID, approved }, 'approval resolved')

    if (approved) {
      return { behavior: 'allow' }
    }
    return { behavior: 'deny', message: 'Denegado por el usuario.' }
  }
}
