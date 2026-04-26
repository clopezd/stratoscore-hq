/**
 * Builds the daily brief Telegram message and sends it.
 * Window: yesterday 00:00 UTC → today 00:00 UTC.
 */
import { ALL_CLIENTS, CLIENT_EMOJIS, CLIENT_LABELS, type ClientBrief, type ClientId, type CommitInfo } from '../types'
import { parsePRD } from './prdParser'
import { filterCommitsByClient, getCommitsInRange, getPipelineActionsForClient } from './activitySources'

function yesterdayWindowUTC(): { since: string; until: string; dateLabel: string } {
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const since = new Date(todayUTC.getTime() - 86400000)
  const until = todayUTC
  return {
    since: since.toISOString(),
    until: until.toISOString(),
    dateLabel: since.toISOString().slice(0, 10),
  }
}

function renderClient(brief: ClientBrief): string {
  const emoji = CLIENT_EMOJIS[brief.client]
  const label = CLIENT_LABELS[brief.client]
  const lines: string[] = [`${emoji} *${label}*`]

  // Activity
  if (brief.activity.commits.length === 0 && brief.activity.pipelineActions === 0) {
    lines.push(`  Ayer: sin actividad`)
  } else {
    const commits = brief.activity.commits.slice(0, 3)
    const more = brief.activity.commits.length - commits.length
    const commitLines = commits.map((c: CommitInfo) => `  • ${c.hash} ${c.subject}`)
    lines.push(`  Ayer: ${brief.activity.commits.length} commit${brief.activity.commits.length === 1 ? '' : 's'}${brief.activity.pipelineActions ? ` + ${brief.activity.pipelineActions} acciones pipeline` : ''}`)
    lines.push(...commitLines)
    if (more > 0) lines.push(`  • …y ${more} más`)
  }

  // PRD progress
  if (!brief.prd.exists) {
    lines.push(`  ⚠️ Sin PRD — responde \`/prd-${brief.client}\` para arrancar uno`)
    return lines.join('\n')
  }

  const bar = renderProgressBar(brief.prd.pct)
  lines.push(`  PRD: ${bar} ${brief.prd.pct}% (${brief.prd.done}/${brief.prd.total})`)
  if (brief.prd.pending.length > 0) {
    const next = brief.prd.pending.slice(0, 2).map((p) => `  → ${p}`)
    lines.push(...next)
    if (brief.prd.pending.length > 2) lines.push(`  → …y ${brief.prd.pending.length - 2} más`)
  } else {
    lines.push(`  ✅ Todos los hitos completados`)
  }
  return lines.join('\n')
}

function renderProgressBar(pct: number): string {
  const filled = Math.round(pct / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

export async function buildDailyBriefMessage(): Promise<{ message: string; briefs: ClientBrief[] }> {
  const { since, until, dateLabel } = yesterdayWindowUTC()

  const allCommits = await getCommitsInRange(since, until)

  const briefs: ClientBrief[] = []
  for (const client of ALL_CLIENTS) {
    const commits = filterCommitsByClient(allCommits, client)
    const pipelineActions = await getPipelineActionsForClient(client, since, until)
    const prd = parsePRD(client)
    briefs.push({
      client,
      prd,
      activity: { client, commits, pipelineActions },
    })
  }

  const totalCommits = briefs.reduce((s, b) => s + b.activity.commits.length, 0)
  const header = [
    `📋 *Daily Brief — ${dateLabel}*`,
    `${totalCommits} commit${totalCommits === 1 ? '' : 's'} ayer en ${briefs.filter((b) => b.activity.commits.length > 0).length}/${briefs.length} clientes`,
    '',
  ].join('\n')

  const sections = briefs.map(renderClient).join('\n\n')

  return { message: header + sections, briefs }
}

export async function sendDailyBrief(): Promise<{ ok: boolean; message: string; telegram_sent: boolean }> {
  const { message } = await buildDailyBriefMessage()

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  let telegramSent = false
  if (botToken && chatId) {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })
    telegramSent = res.ok
  }
  return { ok: true, message, telegram_sent: telegramSent }
}
