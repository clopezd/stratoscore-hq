'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Play,
  Zap,
  ExternalLink,
  FileCode,
  Settings,
  Trash2,
  CalendarPlus,
  CalendarCheck,
  LayoutGrid,
  FolderKanban
} from 'lucide-react'
import ValidationRulesModal from './ValidationRulesModal'

interface PersonalTask {
  id: string
  title: string
  description: string | null
  category: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  canvas_group: string | null
  client_id: string | null
  on_complete_action: any
  auto_execute: boolean
  due_date: string | null
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  links: Array<{ label: string; url: string }> | null
  related_files: string[] | null
  created_at: string
  updated_at: string
}

const STATUS_CONFIG = {
  todo: { label: 'Por Hacer', icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  in_progress: { label: 'En Curso', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  blocked: { label: 'Bloqueado', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  done: { label: 'Completado', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  archived: { label: 'Archivado', icon: Circle, color: 'text-gray-600', bg: 'bg-gray-500/5' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'text-gray-500' },
  medium: { label: 'Media', color: 'text-yellow-500' },
  high: { label: 'Alta', color: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'text-red-500' }
}

export function PersonalTasksCanvas() {
  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [rulesModalTask, setRulesModalTask] = useState<{ id: string; title: string } | null>(null)
  const [viewMode, setViewMode] = useState<'status' | 'project'>('status')

  useEffect(() => {
    loadTasks()

    // Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('personal-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'personal_tasks'
      }, () => {
        loadTasks()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function loadTasks() {
    try {
      const res = await fetch('/api/personal-tasks')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTasks(data || [])
    } catch (err) {
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: PersonalTask['status']) {
    const supabase = createClient()

    // Obtener la tarea para verificar si tiene auto-ejecución
    const task = tasks.find(t => t.id === taskId)

    const { error } = await supabase
      .from('personal_tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    // Si cambió a 'done' y tiene auto-ejecución, ejecutar acción
    if (newStatus === 'done' && task?.auto_execute && task.on_complete_action) {
      console.log('🤖 Ejecutando acción automática...')
      await executeAction(task)
    }
  }

  async function executeAction(task: PersonalTask) {
    if (!task.on_complete_action) return

    try {
      // Llamar al API para ejecutar la acción
      const response = await fetch('/api/personal-tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Acción ejecutada:', result.result)
        // Mostrar notificación de éxito
        alert(`Acción ejecutada: ${JSON.stringify(result.result, null, 2)}`)
      } else {
        console.error('❌ Error ejecutando acción:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (err) {
      console.error('Error calling execute API:', err)
      alert(`Error de red: ${err}`)
    }
  }

  async function deleteTask(taskId: string) {
    const supabase = createClient()

    // Primero eliminar reglas de validación asociadas
    await supabase
      .from('task_completion_rules')
      .delete()
      .eq('task_id', taskId)

    // Eliminar logs de validación
    await supabase
      .from('task_validation_log')
      .delete()
      .eq('task_id', taskId)

    // Eliminar logs de acciones
    await supabase
      .from('task_actions_log')
      .delete()
      .eq('task_id', taskId)

    // Eliminar la tarea
    const { error } = await supabase
      .from('personal_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
    }
  }

  async function validateAllTasks() {
    setValidating(true)
    setValidationMessage(null)
    try {
      const response = await fetch('/api/personal-tasks/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (result.success) {
        const parts = []
        if (result.newClients > 0) parts.push(`${result.newClients} proyecto(s) nuevo(s)`)
        if (result.completed > 0) parts.push(`${result.completed} completada(s)`)
        if (result.started > 0) parts.push(`${result.started} iniciada(s)`)
        if (parts.length === 0) parts.push('Sin cambios')
        setValidationMessage({ type: 'success', text: `OK — ${parts.join(', ')}` })
      } else {
        setValidationMessage({ type: 'error', text: result.error || 'No se pudo validar' })
      }
    } catch (err) {
      console.error('Error validating tasks:', err)
      setValidationMessage({ type: 'error', text: 'Sin conexion con agent-server' })
    } finally {
      setValidating(false)
      setTimeout(() => setValidationMessage(null), 5000)
    }
  }

  // Agrupar tareas por estado
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = []
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, PersonalTask[]>)

  // Agrupar tareas por canvas_group
  const tasksByGroup = tasks.reduce((acc, task) => {
    const group = task.canvas_group || 'sin-grupo'
    if (!acc[group]) acc[group] = []
    acc[group].push(task)
    return acc
  }, {} as Record<string, PersonalTask[]>)

  const statuses: Array<PersonalTask['status']> = ['todo', 'in_progress', 'blocked', 'done']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Toolbar: View Toggle + Validación */}
      <div className="flex items-center justify-between gap-3">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-white/20 bg-white/5 p-0.5">
          <button
            onClick={() => setViewMode('status')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'status'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Por Estado
          </button>
          <button
            onClick={() => setViewMode('project')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'project'
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Por Proyecto
          </button>
        </div>

        <div className="flex items-center gap-3">
          {validationMessage && (
            <div className={`px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 ${
              validationMessage.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {validationMessage.type === 'success' ? 'OK' : 'Error'} — {validationMessage.text}
            </div>
          )}
          <button
            onClick={validateAllTasks}
            disabled={validating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-4 h-4 ${validating ? 'animate-pulse' : ''}`} />
            {validating ? 'Validando...' : 'Validar Tareas'}
          </button>
        </div>
      </div>

      {/* Stats Overview - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statuses.map(status => {
          const config = STATUS_CONFIG[status]
          const count = tasksByStatus[status]?.length || 0
          const Icon = config.icon

          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
              className={`p-3 md:p-4 rounded-xl border transition-all ${
                selectedStatus === status
                  ? 'border-white/30 bg-white/5'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${config.color}`} />
                <span className="text-xl md:text-2xl font-bold">{count}</span>
              </div>
              <div className="text-xs md:text-sm text-white/60">{config.label}</div>
            </button>
          )
        })}
      </div>

      {/* ═══ VIEW: Por Estado (Kanban columns by status) ═══ */}
      {viewMode === 'status' && (
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          {statuses.map(status => {
            const config = STATUS_CONFIG[status]
            const statusTasks = tasksByStatus[status] || []
            const Icon = config.icon

            if (selectedStatus && selectedStatus !== status) return null

            return (
              <div key={status} className="flex-shrink-0 w-72 md:w-auto space-y-3">
                {/* Column Header */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-white/80">{config.label}</span>
                  <span className="ml-auto text-xs text-white/60">{statusTasks.length}</span>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onExecuteAction={executeAction}
                      onManageRules={() => setRulesModalTask({ id: task.id, title: task.title })}
                      onDelete={deleteTask}
                    />
                  ))}

                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-white/50 text-sm">
                      Sin tareas
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ VIEW: Por Proyecto (Kanban columns by client/project) ═══ */}
      {viewMode === 'project' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(tasksByGroup)
            .sort(([, a], [, b]) => {
              // Ordenar: proyectos con más tareas activas primero
              const activeA = a.filter(t => t.status !== 'done' && t.status !== 'archived').length
              const activeB = b.filter(t => t.status !== 'done' && t.status !== 'archived').length
              return activeB - activeA
            })
            .map(([group, groupTasks]) => {
              // Filtrar por estado si hay uno seleccionado
              const filteredTasks = selectedStatus
                ? groupTasks.filter(t => t.status === selectedStatus)
                : groupTasks

              if (selectedStatus && filteredTasks.length === 0) return null

              const activeTasks = groupTasks.filter(t => t.status !== 'done' && t.status !== 'archived').length
              const doneTasks = groupTasks.filter(t => t.status === 'done').length

              return (
                <div key={group} className="flex-shrink-0 w-80 md:w-96 space-y-3">
                  {/* Project Header */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/20">
                    <FolderKanban className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white/90 capitalize">{group.replace(/-/g, ' ')}</span>
                    <div className="ml-auto flex items-center gap-2">
                      {activeTasks > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">{activeTasks} activas</span>
                      )}
                      {doneTasks > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">{doneTasks} listas</span>
                      )}
                    </div>
                  </div>

                  {/* Tasks grouped by status within project */}
                  <div className="space-y-1">
                    {statuses.map(status => {
                      const tasksInStatus = filteredTasks.filter(t => t.status === status)
                      if (tasksInStatus.length === 0) return null
                      const config = STATUS_CONFIG[status]
                      const Icon = config.icon

                      return (
                        <div key={status} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 px-2 pt-2">
                            <Icon className={`w-3 h-3 ${config.color}`} />
                            <span className={`text-[11px] font-medium ${config.color}`}>{config.label}</span>
                            <span className="text-[10px] text-white/60">{tasksInStatus.length}</span>
                          </div>
                          {tasksInStatus.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={updateTaskStatus}
                              onExecuteAction={executeAction}
                              onManageRules={() => setRulesModalTask({ id: task.id, title: task.title })}
                              onDelete={deleteTask}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Validation Rules Modal */}
      {rulesModalTask && (
        <ValidationRulesModal
          taskId={rulesModalTask.id}
          taskTitle={rulesModalTask.title}
          onClose={() => setRulesModalTask(null)}
          onRulesUpdated={loadTasks}
        />
      )}
    </div>
  )
}

function TaskCard({
  task,
  onStatusChange,
  onExecuteAction,
  onManageRules,
  onDelete
}: {
  task: PersonalTask
  onStatusChange: (id: string, status: PersonalTask['status']) => void
  onExecuteAction: (task: PersonalTask) => void
  onManageRules: () => void
  onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  return (
    <div className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium leading-tight pr-2">{task.title}</h4>
        <div className="flex items-center gap-1">
          {task.priority !== 'medium' && (
            <div className={`text-xs px-1.5 py-0.5 rounded ${priorityConfig.color} opacity-60`}>
              {task.priority === 'urgent' && '🔥'}
              {task.priority === 'high' && '⬆️'}
              {task.priority === 'low' && '⬇️'}
            </div>
          )}
          <button
            onClick={onManageRules}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-cyan-500/20 rounded text-cyan-400"
            title="Gestionar reglas de validación"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400"
            title="Eliminar tarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirm Delete Bar */}
      {confirmDelete && (
        <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-md bg-red-500/10 border border-red-500/20">
          <span className="text-xs text-red-400">Eliminar tarea?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onDelete(task.id); setConfirmDelete(false) }}
              className="text-xs font-medium px-3 py-1 rounded bg-red-500/30 text-red-300 hover:bg-red-500/50 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-medium px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-xs text-white/50 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Category */}
      {task.category && (
        <div className="inline-block text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60 mb-2">
          {task.category}
        </div>
      )}

      {/* Related Files */}
      {task.related_files && task.related_files.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
            <FileCode className="w-3 h-3" />
            <span>{task.related_files.length} archivo(s)</span>
          </div>
        </div>
      )}

      {/* Links */}
      {task.links && task.links.length > 0 && (
        <div className="flex gap-2 mb-3">
          {task.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Actions — Status buttons */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 flex-wrap">
        {(['todo', 'in_progress', 'blocked', 'done'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s]
          const Icon = cfg.icon
          const isActive = task.status === s
          return (
            <button
              key={s}
              onClick={() => onStatusChange(task.id, s)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                isActive
                  ? `${cfg.bg} ${cfg.color} border-current/25`
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </button>
          )
        })}

        {/* Execute Action Button */}
        {task.on_complete_action && (
          <button
            onClick={() => onExecuteAction(task)}
            className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
            title={task.auto_execute ? 'Auto-ejecuta al completar' : 'Ejecutar acción'}
          >
            <Zap className={`w-3.5 h-3.5 ${task.auto_execute ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Dates */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-white/50">
        <div className="flex items-center gap-1">
          <CalendarPlus className="w-3 h-3" />
          Creada {new Date(task.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Vence {new Date(task.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </div>
        )}
        {task.status === 'done' && task.completed_at && (
          <div className="flex items-center gap-1 text-green-400/80">
            <CalendarCheck className="w-3 h-3" />
            Completada {new Date(task.completed_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  )
}
