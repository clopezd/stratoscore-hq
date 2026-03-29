import { NextRequest, NextResponse } from 'next/server'
import { runSingleAgent } from '@/features/agents/services/scheduler'
import { AGENTS } from '@/features/agents/config/agents'
import type { AgentSlug } from '@/features/agents/types'

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const token = process.env.OPENCLAW_GATEWAY_TOKEN ?? 'tumision_2026'
  return auth === `Bearer ${token}`
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  if (!AGENTS[slug as AgentSlug]) {
    return NextResponse.json(
      { error: `Agente "${slug}" no existe`, available: Object.keys(AGENTS) },
      { status: 404 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const prompt = body.prompt as string | undefined

  const result = await runSingleAgent(slug as AgentSlug, prompt)

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const config = AGENTS[slug as AgentSlug]
  if (!config) {
    return NextResponse.json(
      { error: `Agente "${slug}" no existe`, available: Object.keys(AGENTS) },
      { status: 404 }
    )
  }

  return NextResponse.json({
    slug: config.slug,
    name: config.name,
    emoji: config.emoji,
    team: config.team,
    schedule: config.schedule,
    description: config.description,
    reads: config.reads,
    writes: config.writes,
  })
}
