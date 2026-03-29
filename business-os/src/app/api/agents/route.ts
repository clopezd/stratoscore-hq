import { NextResponse } from 'next/server'
import { AGENTS, DAILY_EXECUTION_ORDER, WEEKLY_AGENTS } from '@/features/agents/config/agents'

export async function GET() {
  const agents = Object.values(AGENTS).map((a) => ({
    slug: a.slug,
    name: a.name,
    emoji: a.emoji,
    team: a.team,
    schedule: a.schedule,
    description: a.description,
  }))

  return NextResponse.json({
    agents,
    daily_order: DAILY_EXECUTION_ORDER,
    weekly_agents: WEEKLY_AGENTS,
  })
}
