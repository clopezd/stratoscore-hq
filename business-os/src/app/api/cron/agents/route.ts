import { NextRequest, NextResponse } from 'next/server'
import { runDailyPipeline, runWeeklyPipeline } from '@/features/agents/services/scheduler'

/**
 * Cron endpoint para Vercel Cron Jobs.
 * Diario a las 10:00am CT → pipeline diario
 * Domingos a las 11:00am CT → pipeline semanal (además del diario)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Vercel cron envía el secret en el header
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = domingo

  const start = Date.now()
  const results = []

  // Pipeline diario siempre corre
  const daily = await runDailyPipeline()
  results.push({ type: 'daily', results: daily })

  // Domingos: también correr pipeline semanal
  if (dayOfWeek === 0) {
    const weekly = await runWeeklyPipeline()
    results.push({ type: 'weekly', results: weekly })
  }

  const totalAgents = results.reduce((s, r) => s + r.results.length, 0)
  const succeeded = results.reduce(
    (s, r) => s + r.results.filter((a) => a.success).length,
    0
  )

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    is_sunday: dayOfWeek === 0,
    total_agents: totalAgents,
    succeeded,
    failed: totalAgents - succeeded,
    duration_ms: Date.now() - start,
    results,
  })
}
