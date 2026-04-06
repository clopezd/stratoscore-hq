import { NextRequest, NextResponse } from 'next/server'

// POST /api/personal-tasks/validate-rule
// Test a rule before saving it
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rule_type, rule_config } = body

    if (!rule_type || !rule_config) {
      return NextResponse.json(
        { error: 'rule_type and rule_config required' },
        { status: 400 }
      )
    }

    // Forward to agent-server for validation
    const response = await fetch('http://localhost:3099/tasks/validate-rule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer tumision_2026',
      },
      body: JSON.stringify({ rule_type, rule_config }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
