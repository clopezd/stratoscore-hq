/**
 * POST /api/daily-brief
 *
 * Manually trigger the daily brief (for testing). Auth required.
 * For automated daily delivery, see /api/daily-brief/cron (Vercel Cron).
 */
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { sendDailyBrief } from '@/features/daily-brief/services/briefBuilder'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  try {
    const result = await sendDailyBrief()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Daily brief error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
