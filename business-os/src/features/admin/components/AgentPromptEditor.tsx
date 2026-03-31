'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

interface AgentPromptEditorProps {
  currentPrompt: string
  onSave: (prompt: string) => void
}

export function AgentPromptEditor({ currentPrompt, onSave }: AgentPromptEditorProps) {
  const [prompt, setPrompt] = useState(currentPrompt)
  const isDirty = prompt !== currentPrompt

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-white/70 mb-1">
          System Prompt del CFO Agent
        </h3>
        <p className="text-xs text-gray-400 dark:text-white/30">
          Instrucciones personalizadas para el agente financiero
        </p>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={12}
        placeholder="Ej: Eres un CFO experto. Analiza las transacciones y genera insights..."
        className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] text-gray-700 dark:text-white/70 placeholder:text-gray-400 dark:placeholder:text-white/30 resize-y font-mono"
      />
      <div className="flex justify-end">
        <button
          onClick={() => onSave(prompt)}
          disabled={!isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" /> Guardar
        </button>
      </div>
    </div>
  )
}
