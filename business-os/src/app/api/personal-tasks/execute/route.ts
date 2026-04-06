import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API para ejecutar acciones agénticas de tareas personales
 *
 * Ejemplos de acciones:
 * - {"type": "deploy", "target": "business-os", "branch": "main"}
 * - {"type": "notify", "channel": "telegram", "message": "Tarea completada"}
 * - {"type": "trigger_task", "task_id": "uuid-otra-tarea"}
 * - {"type": "run_command", "command": "npm run build", "cwd": "/path"}
 * - {"type": "git_commit", "message": "feat: complete task"}
 */

interface TaskAction {
  type: 'deploy' | 'notify' | 'trigger_task' | 'run_command' | 'git_commit' | 'webhook'
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    const { task_id } = await request.json()

    if (!task_id) {
      return NextResponse.json({ error: 'task_id required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Obtener la tarea
    const { data: task, error: taskError } = await supabase
      .from('personal_tasks')
      .select('*')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const action: TaskAction = task.on_complete_action

    if (!action) {
      return NextResponse.json({ error: 'No action defined' }, { status: 400 })
    }

    // Registrar inicio de ejecución
    const { data: logEntry } = await supabase
      .from('task_actions_log')
      .insert({
        task_id,
        action,
        status: 'running'
      })
      .select()
      .single()

    let result: any = {}
    let status: 'success' | 'error' = 'success'
    let errorMessage: string | null = null

    try {
      // Ejecutar según tipo
      switch (action.type) {
        case 'notify':
          result = await executeNotify(action)
          break

        case 'trigger_task':
          result = await executeTriggerTask(action, supabase)
          break

        case 'webhook':
          result = await executeWebhook(action)
          break

        case 'deploy':
        case 'run_command':
        case 'git_commit':
          // Estas requieren acceso al agent-server
          result = await executeViaAgentServer(action)
          break

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (err: any) {
      status = 'error'
      errorMessage = err.message
      result = { error: err.message }
    }

    // Actualizar log
    await supabase
      .from('task_actions_log')
      .update({
        status,
        result,
        error: errorMessage
      })
      .eq('id', logEntry!.id)

    return NextResponse.json({
      success: status === 'success',
      result,
      error: errorMessage
    })
  } catch (error: any) {
    console.error('Error executing task action:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ══════════════════════════════════════════════════════════════
// EJECUTORES DE ACCIONES
// ══════════════════════════════════════════════════════════════

async function executeNotify(action: TaskAction) {
  const { channel, message } = action

  if (channel === 'telegram') {
    // Llamar al agent-server para enviar notificación
    const response = await fetch('http://localhost:3099/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer tumision_2026'
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      throw new Error(`Telegram notification failed: ${response.statusText}`)
    }

    return { sent: true, channel, message }
  }

  throw new Error(`Unknown notification channel: ${channel}`)
}

async function executeTriggerTask(action: TaskAction, supabase: any) {
  const { task_id: targetTaskId } = action

  // Cambiar estado de la tarea objetivo a 'in_progress'
  const { error } = await supabase
    .from('personal_tasks')
    .update({ status: 'in_progress' })
    .eq('id', targetTaskId)

  if (error) {
    throw new Error(`Failed to trigger task: ${error.message}`)
  }

  return { triggered_task_id: targetTaskId }
}

async function executeWebhook(action: TaskAction) {
  const { url, method = 'POST', headers = {}, body } = action

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`)
  }

  const result = await response.json().catch(() => ({}))
  return { webhook_url: url, response: result }
}

async function executeViaAgentServer(action: TaskAction) {
  // Enviar al agent-server para ejecutar comandos de sistema
  const response = await fetch('http://localhost:3099/execute-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer tumision_2026'
    },
    body: JSON.stringify(action)
  })

  if (!response.ok) {
    throw new Error(`Agent server execution failed: ${response.statusText}`)
  }

  return await response.json()
}
