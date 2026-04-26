/**
 * Weekly pipeline report — snapshots KPIs, builds Telegram message, sends.
 * Used by both the user-triggered POST endpoint and the Vercel cron job.
 */
import { createClient } from '@supabase/supabase-js'
import { getKPIs, snapshotCurrentWeek, getRecentActivity } from './kpiService'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export async function generateAndSendWeeklyReport() {
  await snapshotCurrentWeek()

  const kpis = await getKPIs('all')
  const activity = await getRecentActivity(7)

  const supabase = getAdminClient()

  const { data: topOpps } = await supabase
    .from('bh_opportunities')
    .select('title, estimated_value, is_sdvosb_eligible, bh_opportunity_scores(score)')
    .in('status', ['scored', 'interested'])
    .order('created_at', { ascending: false })
    .limit(5)

  const soon = new Date(Date.now() + 7 * 86400000).toISOString()
  const { data: expiring } = await supabase
    .from('bh_opportunities')
    .select('title, deadline')
    .not('status', 'in', '("discarded","won","lost")')
    .lte('deadline', soon)
    .gte('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })
    .limit(5)

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const topList = (topOpps ?? [])
    .map(o => {
      const score = Array.isArray(o.bh_opportunity_scores)
        ? o.bh_opportunity_scores[0]?.score
        : (o.bh_opportunity_scores as { score: number } | null)?.score
      const val = o.estimated_value ? `$${Number(o.estimated_value).toLocaleString()}` : '?'
      const sdvosb = o.is_sdvosb_eligible ? ' (SDVOSB)' : ''
      return `  ${score || '?'}/100 — ${o.title} — ${val}${sdvosb}`
    })
    .join('\n')

  const expiringList = (expiring ?? [])
    .map(o => {
      const dl = o.deadline ? new Date(o.deadline) : null
      const daysLeft = dl ? Math.ceil((dl.getTime() - Date.now()) / 86400000) : '?'
      return `  - ${o.title} (${daysLeft}d)`
    })
    .join('\n')

  const msg = [
    `*BidHunter — Weekly Pipeline Report*`,
    `Week of ${dateRange}`,
    ``,
    `Pipeline: $${kpis.pipeline_value.toLocaleString()} (${kpis.total} opportunities)`,
    `New: ${kpis.new} | Scored: ${kpis.scored} | Interested: ${kpis.interested}`,
    `Bids Sent: ${kpis.bid_sent} | Won: ${kpis.won} | Lost: ${kpis.lost}`,
    `Win Rate: ${kpis.win_rate}% | Response Rate: ${kpis.response_rate}%`,
    `SDVOSB: ${kpis.sdvosb_count} opportunities`,
    `Commission Earned: $${kpis.commission_earned.toLocaleString()}`,
    ``,
    topList ? `*Top Opportunities:*\n${topList}` : '',
    expiringList ? `\n*Expiring Soon:*\n${expiringList}` : '',
    ``,
    `Activity this week: ${activity.length} actions`,
  ].filter(Boolean).join('\n')

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  let telegramSent = false
  if (botToken && chatId) {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'Markdown',
      }),
    })
    telegramSent = res.ok
  }

  return { ok: true, report: msg, telegram_sent: telegramSent }
}
