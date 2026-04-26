/**
 * GET /api/bidhunter/cron/weekly-report
 *
 * Vercel Cron endpoint — runs every Monday at 8am UTC (see vercel.json).
 * Authenticated via CRON_SECRET bearer token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateAndSendWeeklyReport } from '@/features/bidhunter/services/weeklyReportService'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await generateAndSendWeeklyReport()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Weekly report cron error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
