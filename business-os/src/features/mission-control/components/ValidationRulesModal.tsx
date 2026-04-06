'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Play, Check, AlertCircle, Loader2 } from 'lucide-react'

interface Rule {
  id: string
  rule_type: string
  rule_config: Record<string, any>
  last_check_result?: boolean | null
  last_check_at?: string | null
  check_error?: string | null
}

interface ValidationRulesModalProps {
  taskId: string
  taskTitle: string
  onClose: () => void
  onRulesUpdated: () => void
}

const RULE_TEMPLATES = {
  file_exists: {
    label: '📁 File Exists',
    description: 'Verifica que un archivo existe',
    defaultConfig: { file_path: '/ruta/al/archivo.ts' },
    fields: [
      { key: 'file_path', label: 'Ruta del archivo', type: 'text', placeholder: '/home/user/project/file.ts' }
    ]
  },
  api_check: {
    label: '🌐 API Check',
    description: 'Verifica que un endpoint responde correctamente',
    defaultConfig: { url: 'http://localhost:3000/api/health', expected_status: 200 },
    fields: [
      { key: 'url', label: 'URL', type: 'text', placeholder: 'http://localhost:3000/api/endpoint' },
      { key: 'expected_status', label: 'Status esperado', type: 'number', placeholder: '200' }
    ]
  },
  test_passes: {
    label: '🧪 Test Passes',
    description: 'Ejecuta tests y verifica que pasan',
    defaultConfig: { command: 'npm test', cwd: '/ruta/proyecto' },
    fields: [
      { key: 'command', label: 'Comando', type: 'text', placeholder: 'npm test' },
      { key: 'cwd', label: 'Directorio de trabajo', type: 'text', placeholder: '/home/user/project' }
    ]
  },
  git_commit: {
    label: '📝 Git Commit',
    description: 'Verifica que existe un commit con cierto mensaje',
    defaultConfig: { message_contains: 'fix: bug', repo_path: '/ruta/repo' },
    fields: [
      { key: 'message_contains', label: 'Mensaje contiene', type: 'text', placeholder: 'fix: implementar feature' },
      { key: 'repo_path', label: 'Ruta del repo', type: 'text', placeholder: '/home/user/project' }
    ]
  },
  command_success: {
    label: '⚡ Command Success',
    description: 'Ejecuta comando y verifica exit code 0',
    defaultConfig: { command: 'curl -f http://localhost:3000', timeout: 5000 },
    fields: [
      { key: 'command', label: 'Comando', type: 'text', placeholder: 'curl -f http://localhost:3000' },
      { key: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: '5000' }
    ]
  }
}

export default function ValidationRulesModal({ taskId, taskTitle, onClose, onRulesUpdated }: ValidationRulesModalProps) {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedType, setSelectedType] = useState<keyof typeof RULE_TEMPLATES>('file_exists')
  const [newRuleConfig, setNewRuleConfig] = useState<Record<string, any>>(RULE_TEMPLATES.file_exists.defaultConfig)
  const [testingRule, setTestingRule] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; error?: string }>>({})

  useEffect(() => {
    loadRules()
  }, [taskId])

  async function loadRules() {
    setLoading(true)
    try {
      const response = await fetch(`/api/personal-tasks/rules?task_id=${taskId}`)
      const data = await response.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRule() {
    try {
      const response = await fetch('/api/personal-tasks/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          rule_type: selectedType,
          rule_config: newRuleConfig
        })
      })

      if (!response.ok) throw new Error('Failed to add rule')

      await loadRules()
      onRulesUpdated()
      setAdding(false)
      setNewRuleConfig(RULE_TEMPLATES[selectedType].defaultConfig)
    } catch (error) {
      console.error('Error adding rule:', error)
      alert('Error al agregar regla: ' + error)
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm('¿Eliminar esta regla de validación?')) return

    try {
      await fetch(`/api/personal-tasks/rules?rule_id=${ruleId}`, { method: 'DELETE' })
      await loadRules()
      onRulesUpdated()
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  async function handleTestRule(rule: Rule) {
    setTestingRule(rule.id)
    try {
      const response = await fetch('/api/personal-tasks/validate-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_type: rule.rule_type,
          rule_config: rule.rule_config
        })
      })

      const result = await response.json()
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { passed: result.passed, error: result.error }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [rule.id]: { passed: false, error: String(error) }
      }))
    } finally {
      setTestingRule(null)
    }
  }

  function handleTypeChange(type: keyof typeof RULE_TEMPLATES) {
    setSelectedType(type)
    setNewRuleConfig(RULE_TEMPLATES[type].defaultConfig)
  }

  function handleConfigChange(key: string, value: any) {
    setNewRuleConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">⚙️ Reglas de Validación Agéntica</h2>
            <p className="text-cyan-100 text-sm mt-1">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Existing Rules */}
              <div className="space-y-3 mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Reglas Activas ({rules.length})
                </h3>

                {rules.length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ Esta tarea no tiene reglas de validación. Agrégalas para que el sistema pueda validarla automáticamente.
                    </p>
                  </div>
                ) : (
                  rules.map((rule) => {
                    const template = RULE_TEMPLATES[rule.rule_type as keyof typeof RULE_TEMPLATES]
                    const testResult = testResults[rule.id]

                    return (
                      <div
                        key={rule.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{template?.label || rule.rule_type}</span>
                              {rule.last_check_result === true && (
                                <span className="text-green-400 text-xs flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Pasó
                                </span>
                              )}
                              {rule.last_check_result === false && (
                                <span className="text-red-400 text-xs flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Falló
                                </span>
                              )}
                            </div>
                            <pre className="text-xs text-gray-400 bg-black/30 rounded p-2 overflow-x-auto">
{JSON.stringify(rule.rule_config, null, 2)}
                            </pre>
                            {testResult && (
                              <div className={`mt-2 text-xs p-2 rounded ${testResult.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {testResult.passed ? '✅ Test pasó' : `❌ ${testResult.error}`}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTestRule(rule)}
                              disabled={testingRule === rule.id}
                              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                            >
                              {testingRule === rule.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              Test
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add New Rule */}
              {!adding ? (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-semibold transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Nueva Regla
                </button>
              ) : (
                <div className="bg-gray-800/70 border border-cyan-500/30 rounded-lg p-5">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-cyan-400" />
                    Nueva Regla de Validación
                  </h4>

                  {/* Rule Type Selector */}
                  <div className="mb-4">
                    <label className="text-gray-300 text-sm mb-2 block">Tipo de Regla</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(RULE_TEMPLATES).map(([type, template]) => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type as keyof typeof RULE_TEMPLATES)}
                          className={`p-3 rounded-lg border text-sm transition-all ${
                            selectedType === type
                              ? 'bg-cyan-600 border-cyan-400 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-cyan-500/50'
                          }`}
                        >
                          <div className="font-semibold">{template.label}</div>
                          <div className="text-xs opacity-80 mt-1">{template.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields */}
                  <div className="space-y-3 mb-4">
                    {RULE_TEMPLATES[selectedType].fields.map((field) => (
                      <div key={field.key}>
                        <label className="text-gray-300 text-sm mb-1 block">{field.label}</label>
                        <input
                          type={field.type}
                          value={newRuleConfig[field.key] || ''}
                          onChange={(e) => handleConfigChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddRule}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                    >
                      Guardar Regla
                    </button>
                    <button
                      onClick={() => {
                        setAdding(false)
                        setNewRuleConfig(RULE_TEMPLATES[selectedType].defaultConfig)
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
