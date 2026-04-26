/**
 * GET /api/daily-brief/cron
 *
 * Vercel Cron — runs every day at 13:00 UTC (8am EST).
 * Authenticated via CRON_SECRET bearer.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendDailyBrief } from '@/features/daily-brief/services/briefBuilder'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendDailyBrief()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Daily brief cron error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
