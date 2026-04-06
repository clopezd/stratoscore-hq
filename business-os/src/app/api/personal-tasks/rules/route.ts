import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/personal-tasks/rules?task_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const taskId = req.nextUrl.searchParams.get('task_id')

  if (!taskId) {
    return NextResponse.json({ error: 'task_id required' }, { status: 400 })
  }

  const { data: rules, error } = await supabase
    .from('task_completion_rules')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rules })
}

// POST /api/personal-tasks/rules
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  const { task_id, rule_type, rule_config } = body

  if (!task_id || !rule_type || !rule_config) {
    return NextResponse.json(
      { error: 'task_id, rule_type, and rule_config are required' },
      { status: 400 }
    )
  }

  // Validate rule_type
  const validTypes = ['file_exists', 'api_check', 'test_passes', 'git_commit', 'command_success']
  if (!validTypes.includes(rule_type)) {
    return NextResponse.json(
      { error: `Invalid rule_type. Must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  const { data: rule, error } = await supabase
    .from('task_completion_rules')
    .insert({
      task_id,
      rule_type,
      rule_config,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rule }, { status: 201 })
}

// DELETE /api/personal-tasks/rules
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const ruleId = req.nextUrl.searchParams.get('rule_id')

  if (!ruleId) {
    return NextResponse.json({ error: 'rule_id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('task_completion_rules')
    .delete()
    .eq('id', ruleId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
