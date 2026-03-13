import { Bot, Context, InputFile } from 'grammy'
import { TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_ID, TYPING_REFRESH_MS, MAX_MESSAGE_LENGTH } from './config.js'
import { getSession, setSession, clearSession, getMemoriesByChatId, clearMemories } from './db.js'
// Note: clearMemories added to db.ts
import { runAgent } from './agent.js'
import { createApprovalHandler, resolveApproval } from './approvals.js'
import { buildMemoryContext, saveConversationTurn } from './memory.js'
import { voiceCapabilities, transcribeAudio, synthesizeSpeech } from './voice.js'
import { downloadMedia, buildPhotoMessage, buildDocumentMessage } from './media.js'
import { listTasks } from './db.js'
import { logger } from './logger.js'
import { mcStart, mcEnd, mcError } from './mc-client.js'
import { getFinanceSummary } from './finance-client.js'

// ─── Formatting ─────────────────────────────────────────────────────────────

/**
 * Convierte markdown a HTML compatible con Telegram (modo HTML).
 * Protege code blocks primero para evitar doble-escape.
 */
export function formatForTelegram(text: string): string {
  // Extraer code blocks con placeholders
  const codeBlocks: string[] = []
  let result = text.replace(/```[\s\S]*?```/g, (match) => {
    const lang = match.match(/^```(\w+)/)?.[1] ?? ''
    const code = match.replace(/^```\w*\n?/, '').replace(/```$/, '')
    const escaped = escapeHtml(code)
    codeBlocks.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`)
    return `\x00CODEBLOCK${codeBlocks.length - 1}\x00`
  })

  // Inline code
  const inlineCodes: string[] = []
  result = result.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`)
    return `\x00INLINE${inlineCodes.length - 1}\x00`
  })

  // Escapar HTML en texto normal
  result = escapeHtml(result)

  // Bold y italic (en texto ya escapado, solo afectan ** y *)
  result = result
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/__(.+?)__/g, '<b>$1</b>')
    .replace(/_(.+?)_/g, '<i>$1</i>')

  // Restaurar code blocks e inline codes
  result = result.replace(/\x00INLINE(\d+)\x00/g, (_, i) => inlineCodes[parseInt(i)])
  result = result.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)])

  return result
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Divide un mensaje largo en chunks que respetan el límite de Telegram.
 * Corta en newlines, nunca en medio de una palabra.
 */
export function splitMessage(text: string, limit = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= limit) return [text]

  const chunks: string[] = []
  const lines = text.split('\n')
  let current = ''

  for (const line of lines) {
    const candidate = current ? current + '\n' + line : line
    if (candidate.length > limit) {
      if (current) chunks.push(current)
      // Si una sola línea excede el límite, cortarla por palabras
      if (line.length > limit) {
        const words = line.split(' ')
        let wordChunk = ''
        for (const word of words) {
          const wc = wordChunk ? wordChunk + ' ' + word : word
          if (wc.length > limit) {
            if (wordChunk) chunks.push(wordChunk)
            wordChunk = word
          } else {
            wordChunk = wc
          }
        }
        current = wordChunk
      } else {
        current = line
      }
    } else {
      current = candidate
    }
  }

  if (current) chunks.push(current)
  return chunks
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function isAuthorised(chatId: number | string): boolean {
  return String(chatId) === String(ALLOWED_CHAT_ID)
}

// ─── Core message handler ────────────────────────────────────────────────────

export async function handleMessage(
  ctx: Context,
  rawText: string,
  forceVoiceReply = false,
  bot?: Bot,
): Promise<void> {
  const chatId = String(ctx.chat?.id)
  if (!isAuthorised(chatId)) {
    await ctx.reply('Unauthorized.')
    return
  }

  // Indicador de escritura en loop
  let typingActive = true
  const sendTyping = async () => {
    if (!typingActive) return
    try {
      await ctx.api.sendChatAction(ctx.chat!.id, 'typing')
    } catch {
      // ignorar errores de typing
    }
  }
  await sendTyping()
  const typingInterval = setInterval(() => { void sendTyping() }, TYPING_REFRESH_MS)

  // Run ID único por conversación (para Mission Control)
  const runId = `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  mcStart(runId, rawText, 'telegram')

  try {
    // Contexto de memoria
    const memoryCtx = await buildMemoryContext(chatId, rawText)
    const fullMessage = memoryCtx ? `${memoryCtx}\n\n${rawText}` : rawText

    // Sesión Claude Code (getSession returns string | undefined directly)
    const sessionId = getSession(chatId)

    const approvalHandler = bot ? createApprovalHandler(bot, chatId) : undefined

    const result = await runAgent(
      fullMessage,
      sessionId,
      sendTyping,
      approvalHandler,
    )

    typingActive = false
    clearInterval(typingInterval)

    const responseText = result.text?.trim() ?? ''

    if (result.newSessionId) {
      setSession(chatId, result.newSessionId)
    }

    // Guardar turno en memoria
    if (responseText) {
      await saveConversationTurn(chatId, rawText, responseText)
    }

    // Notificar Mission Control — conversación completada
    mcEnd(runId, responseText)

    // Respuesta de texto (siempre se envía, chunks si es largo)
    if (!responseText) {
      await ctx.reply('(sin respuesta)')
      return
    }

    const formatted = formatForTelegram(responseText)
    const chunks = splitMessage(formatted)
    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: 'HTML' })
    }

    // TTS — convierte TODA respuesta a audio si ElevenLabs está configurado
    // ElevenLabs flash acepta hasta ~5000 caracteres; respuestas más largas se omiten
    const caps = voiceCapabilities()
    logger.info({ tts: caps.tts, responseLen: responseText.length }, 'TTS check')
    if (caps.tts && responseText.length <= 5000) {
      try {
        logger.info('synthesizing speech via ElevenLabs...')
        const audioBuffer = await synthesizeSpeech(responseText)
        logger.info({ bytes: audioBuffer.length }, 'TTS ok, sending voice')
        await ctx.replyWithVoice(new InputFile(audioBuffer, 'response.mp3'))
      } catch (err) {
        const detail = String(err).replace(/^Error:\s*/, '')
        console.error('[TTS] ElevenLabs falló:', detail)
        logger.error({ err }, 'TTS failed')
        await ctx.reply(`⚠️ Error de audio: ${detail}`)
      }
    } else if (caps.tts) {
      logger.info({ responseLen: responseText.length }, 'TTS skipped: response too long')
    }
  } catch (err) {
    clearInterval(typingInterval)
    typingActive = false
    logger.error({ err, chatId }, 'handleMessage error')
    mcError(runId, String(err))
    const msg = String(err)
    if (msg.includes('exit code 1') || msg.includes('exited with code 1')) {
      await ctx.reply('⚠️ El agente encontró un error al ejecutar. Intenta de nuevo o usa /newchat si persiste.')
    } else {
      await ctx.reply(`Error: ${msg}`)
    }
  }
}

// ─── Bot creation ────────────────────────────────────────────────────────────

export function createBot(): Bot {
  const bot = new Bot(TELEGRAM_BOT_TOKEN)
  const caps = voiceCapabilities()

  // /start
  bot.command('start', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) {
      await ctx.reply('Unauthorized.')
      return
    }
    await ctx.reply(
      '⚡ <b>EXECUTOR — Tu Asistente Ejecutivo IA</b>\n\n' +
      '<b>Comandos EXECUTOR:</b>\n' +
      '/finanzas — Resumen financiero del mes\n' +
      '/tareas — Tareas de Mission Control\n' +
      '/reporte — Reporte ejecutivo completo\n\n' +
      '<b>Comandos básicos:</b>\n' +
      '/newchat — Nueva conversación\n' +
      '/memory — Ver memorias guardadas\n' +
      '/forget — Borrar memorias\n' +
      '/schedule — Tareas programadas\n' +
      '/voice — Estado de voz (STT/TTS)\n' +
      '/chatid — Mostrar chat ID\n\n' +
      `<b>Capacidades:</b>\n` +
      `STT: ${caps.stt ? '✓ Activo' : '✗ Desactivado'}\n` +
      `TTS: ${caps.tts ? '✓ Activo' : '✗ Desactivado'}\n\n` +
      `<i>Powered by Claude Agent SDK</i>`,
      { parse_mode: 'HTML' }
    )
  })

  // /chatid — útil para confirmar el ID correcto
  bot.command('chatid', async (ctx) => {
    await ctx.reply(`Chat ID: ${ctx.chat.id}`)
  })

  // /newchat — limpia sesión de Claude Code (nueva conversación)
  bot.command('newchat', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    clearSession(String(ctx.chat.id))
    await ctx.reply('Nueva conversación iniciada. Contexto previo borrado.')
  })

  // /forget — borra memorias
  bot.command('forget', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    clearMemories(String(ctx.chat.id))
    await ctx.reply('Memorias borradas.')
  })

  // /memory — muestra memorias guardadas
  bot.command('memory', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const memories = getMemoriesByChatId(String(ctx.chat.id), 20)

    if (memories.length === 0) {
      await ctx.reply('No hay memorias guardadas.')
      return
    }

    const lines = memories.map(
      (m, i) => `${i + 1}. [${m.sector}] ${m.content.slice(0, 100).replace(/\n/g, ' ')}`
    )
    const text = `Memorias (${memories.length}):\n\n${lines.join('\n')}`
    await ctx.reply(text)
  })

  // /voice — estado de capacidades de voz
  bot.command('voice', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const c = voiceCapabilities()
    await ctx.reply(
      `Estado de voz:\n` +
      `STT (Groq Whisper): ${c.stt ? '✓ activo' : '✗ sin GROQ_API_KEY'}\n` +
      `TTS (ElevenLabs): ${c.tts ? '✓ activo' : '✗ sin ELEVENLABS_API_KEY/VOICE_ID'}`
    )
  })

  // /schedule — lista tareas programadas
  bot.command('schedule', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const tasks = listTasks()

    if (tasks.length === 0) {
      await ctx.reply('No hay tareas programadas.')
      return
    }

    const lines = tasks.map((t) => {
      const tz = process.env['SCHEDULER_TZ'] ?? 'UTC'
      const nextDate = t.next_run
        ? new Date(t.next_run * 1000).toLocaleString('en-US', { timeZone: tz })
        : 'N/A'
      const status = t.status === 'active' ? '✓' : '⏸'
      return `${status} <b>${t.id}</b>\n   ${t.schedule} → ${nextDate}`
    })

    const text = `<b>Tareas programadas (${tasks.length})</b>\n\n${lines.join('\n\n')}`
    const chunks = splitMessage(text)
    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: 'HTML' })
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTOR COMMANDS — Comandos especializados del agente ejecutivo
  // ═══════════════════════════════════════════════════════════════════════════

  // /finanzas — resumen financiero del mes actual
  bot.command('finanzas', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'typing')
      const summary = await getFinanceSummary()

      if (!summary) {
        await ctx.reply('⚠️ Finance OS no está configurado. Configura ANALYTICS_SUPABASE_URL y ANALYTICS_SUPABASE_KEY.')
        return
      }

      const { month, income, expenses, net_balance, pending_amount, active_recurring_monthly, recent_transactions } = summary

      let text = `<b>💰 Resumen Financiero — ${month}</b>\n\n`
      text += `<b>Ingresos:</b> $${income.toLocaleString()}\n`
      text += `<b>Gastos:</b> $${expenses.toLocaleString()}\n`
      text += `<b>Balance neto:</b> $${net_balance.toLocaleString()}\n\n`

      if (pending_amount > 0) {
        text += `⚠️ <b>Pendiente de pago:</b> $${pending_amount.toLocaleString()}\n\n`
      }

      if (active_recurring_monthly > 0) {
        text += `🔄 <b>Gastos recurrentes/mes:</b> $${active_recurring_monthly.toLocaleString()}\n\n`
      }

      if (recent_transactions.length > 0) {
        text += `<b>Últimas 5 transacciones:</b>\n`
        recent_transactions.forEach((tx) => {
          const tipo = tx.tipo === 'ingreso' ? '📈' : tx.tipo === 'gasto' ? '📉' : '↔️'
          const estado = tx.estado === 'pendiente' ? ' ⏳' : ''
          text += `${tipo} $${tx.monto} — ${tx.descripcion || tx.categoria || 'Sin descripción'}${estado}\n`
        })
      }

      const chunks = splitMessage(text)
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: 'HTML' })
      }
    } catch (err) {
      logger.error({ err }, '/finanzas error')
      await ctx.reply(`❌ Error: ${String(err)}`)
    }
  })

  // /tareas — lista de tareas de Mission Control (desde el board)
  bot.command('tareas', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'typing')

      // Por ahora, un mensaje placeholder
      // TODO: Integrar con Mission Control API cuando esté disponible
      await ctx.reply(
        '<b>📋 Tareas de Mission Control</b>\n\n' +
        'Esta función estará disponible cuando se complete la integración con el API de tareas.\n\n' +
        'Mientras tanto, usa <b>/schedule</b> para ver tareas programadas.',
        { parse_mode: 'HTML' }
      )
    } catch (err) {
      logger.error({ err }, '/tareas error')
      await ctx.reply(`❌ Error: ${String(err)}`)
    }
  })

  // /reporte — reporte ejecutivo completo (finanzas + tareas + agenda)
  bot.command('reporte', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'typing')

      let text = '<b>📊 REPORTE EJECUTIVO</b>\n'
      text += `<i>Generado el ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</i>\n\n`

      // 1. Finanzas
      const summary = await getFinanceSummary()
      if (summary) {
        const { month, income, expenses, net_balance, pending_amount } = summary
        text += '<b>💰 FINANZAS</b>\n'
        text += `Mes: ${month}\n`
        text += `Ingresos: $${income.toLocaleString()}\n`
        text += `Gastos: $${expenses.toLocaleString()}\n`
        text += `Balance: $${net_balance.toLocaleString()}`

        if (net_balance < 0) text += ' ⚠️'
        if (net_balance > 0) text += ' ✅'

        text += '\n'

        if (pending_amount > 0) {
          text += `Pendiente: $${pending_amount.toLocaleString()} ⏳\n`
        }
      } else {
        text += '<b>💰 FINANZAS</b>\n'
        text += 'Finance OS no configurado\n'
      }

      text += '\n'

      // 2. Tareas programadas
      const tasks = listTasks()
      const activeTasks = tasks.filter(t => t.status === 'active')
      text += '<b>⏰ TAREAS PROGRAMADAS</b>\n'
      text += `Total: ${tasks.length} | Activas: ${activeTasks.length}\n`

      if (activeTasks.length > 0) {
        const nextTask = activeTasks
          .filter(t => t.next_run)
          .sort((a, b) => (a.next_run ?? 0) - (b.next_run ?? 0))[0]

        if (nextTask && nextTask.next_run) {
          const nextDate = new Date(nextTask.next_run * 1000)
          const tz = process.env['SCHEDULER_TZ'] ?? 'UTC'
          text += `Próxima: ${nextTask.id} — ${nextDate.toLocaleString('es-MX', { timeZone: tz })}\n`
        }
      }

      text += '\n'

      // 3. Estado del sistema
      text += '<b>⚙️ SISTEMA</b>\n'
      text += `Agent Server: ✅ Online\n`
      text += `Telegram Bot: ✅ Activo\n`
      text += `Mission Control: http://localhost:3000\n`

      const chunks = splitMessage(text)
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: 'HTML' })
      }
    } catch (err) {
      logger.error({ err }, '/reporte error')
      await ctx.reply(`❌ Error: ${String(err)}`)
    }
  })

  // Mensajes de texto normales
  bot.on('message:text', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    await handleMessage(ctx, ctx.message.text, false, bot)
  })

  // Voice notes (STT → Claude → opcional TTS)
  bot.on('message:voice', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    if (!caps.stt) {
      await ctx.reply('STT no disponible. Configura GROQ_API_KEY.')
      return
    }

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'typing')
      const fileId = ctx.message.voice.file_id
      const localPath = await downloadMedia(fileId, 'voice.oga')
      const transcript = await transcribeAudio(localPath)

      logger.info({ length: transcript.length }, 'voice transcribed')

      // Indicar que fue transcrito (útil para debugging)
      await handleMessage(ctx, `[Nota de voz]: ${transcript}`, true, bot)
    } catch (err) {
      logger.error({ err }, 'voice handler error')
      await ctx.reply(`Error procesando nota de voz: ${String(err)}`)
    }
  })

  // Fotos
  bot.on('message:photo', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'upload_photo')
      // Tomar la foto de mayor resolución
      const photos = ctx.message.photo
      const best = photos[photos.length - 1]
      const localPath = await downloadMedia(best.file_id, 'photo.jpg')
      const caption = ctx.message.caption
      const message = buildPhotoMessage(localPath, caption)
      await handleMessage(ctx, message, false, bot)
    } catch (err) {
      logger.error({ err }, 'photo handler error')
      await ctx.reply(`Error procesando foto: ${String(err)}`)
    }
  })

  // Documentos
  bot.on('message:document', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'upload_document')
      const doc = ctx.message.document
      const localPath = await downloadMedia(doc.file_id, doc.file_name ?? 'document')
      const caption = ctx.message.caption
      const message = buildDocumentMessage(localPath, doc.file_name ?? 'document', caption)
      await handleMessage(ctx, message, false, bot)
    } catch (err) {
      logger.error({ err }, 'document handler error')
      await ctx.reply(`Error procesando documento: ${String(err)}`)
    }
  })

  // Callback queries — approval buttons
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data
    const match = data.match(/^(approve|deny):(.+)$/)
    if (!match) {
      await ctx.answerCallbackQuery()
      return
    }

    const [, action, toolUseId] = match
    const approved = action === 'approve'
    const resolved = resolveApproval(toolUseId, approved)

    if (resolved) {
      const statusText = approved ? '✅ Aprobado' : '❌ Denegado'
      try {
        // Strip inline keyboard and append status
        const orig = ctx.callbackQuery.message
        const origText = orig && 'text' in orig ? orig.text : ''
        await ctx.editMessageText(
          origText + `\n\n${statusText}`,
          { parse_mode: 'HTML' },
        )
      } catch { /* ignore edit errors */ }
      await ctx.answerCallbackQuery(statusText)
    } else {
      // Already resolved (timeout or abort)
      await ctx.answerCallbackQuery('Ya fue resuelto.')
    }
  })

  // Error handler global
  bot.catch((err) => {
    logger.error({ err: err.error, ctx: err.ctx?.update }, 'bot error')
  })

  return bot
}

// ─── Sender para el scheduler ────────────────────────────────────────────────

/**
 * Retorna una función sender que el scheduler usa para enviar mensajes al grupo/DM.
 */
export function createSender(bot: Bot) {
  return async (chatId: string, text: string, threadId?: number): Promise<void> => {
    const formatted = formatForTelegram(text)
    const chunks = splitMessage(formatted)

    for (const chunk of chunks) {
      await bot.api.sendMessage(chatId, chunk, {
        parse_mode: 'HTML',
        ...(threadId ? { message_thread_id: threadId } : {}),
      })
    }
  }
}
