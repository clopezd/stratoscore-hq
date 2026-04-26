/**
 * POST /api/bidhunter/weekly-report
 *
 * User-triggered weekly pipeline report. Auth required.
 * For automated weekly delivery, the Vercel cron at
 * /api/bidhunter/cron/weekly-report runs every Monday at 8am.
 */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { generateAndSendWeeklyReport } from '@/features/bidhunter/services/weeklyReportService'

export const runtime = 'nodejs'

export async function POST() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const result = await generateAndSendWeeklyReport()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Weekly report error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
