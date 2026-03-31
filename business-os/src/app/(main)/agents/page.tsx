'use client'

import { useState } from 'react'
import { AGENTS, DAILY_EXECUTION_ORDER } from '@/features/agents/config/agents'
import { BusinessAgentCard } from '@/features/agents/components/BusinessAgentCard'
import { PipelineStatus } from '@/features/agents/components/PipelineStatus'
import { ReportModal } from '@/features/agents/components/ReportModal'
import { IdeaConsole } from '@/features/agents/components/IdeaConsole'
import { useAgentRunner } from '@/features/agents/hooks/useAgentRunner'
import type { AgentSlug } from '@/features/agents/types'

const STRATEGIC_AGENTS: AgentSlug[] = ['cfo', 'cto', 'cmo', 'cpo', 'cdo', 'ceo', 'strategist', 'ghostwriter']
const OPERATIONAL_AGENTS: AgentSlug[] = ['collector', 'analyst', 'journalist', 'cleanup']

export default function AgentsDashboardPage() {
  const { states, runAgent, runPipeline, pipelineRunning } = useAgentRunner()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400/60">
            [ BUSINESS_OS ]
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white/90">
              Centro de Agentes
            </h1>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              11 agentes autónomos operando tu portafolio
            </p>
          </div>

          {/* Pipeline controls */}
          <div className="flex gap-2">
            <button
              onClick={() => runPipeline('daily')}
              disabled={pipelineRunning}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30 border border-indigo-600 dark:border-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pipelineRunning ? '⏳ Ejecutando pipeline...' : '▶ Pipeline Diario'}
            </button>
            <button
              onClick={() => runPipeline('weekly')}
              disabled={pipelineRunning}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/50 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-white/[0.07] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Semanal
            </button>
          </div>
        </div>
      </div>

      {/* Idea Console */}
      <div className="mb-8">
        <IdeaConsole onResult={(slug, report) => setSelectedReport(report)} />
      </div>

      {/* Pipeline visualization */}
      <div className="mb-8">
        <PipelineStatus states={states} />
      </div>

      {/* Operational Agents */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-blue-600 dark:text-blue-300/60 uppercase tracking-wider mb-4">
          Equipo Operacional
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OPERATIONAL_AGENTS.map(slug => (
            <BusinessAgentCard
              key={slug}
              agent={AGENTS[slug]}
              running={states[slug]?.running}
              result={states[slug]?.result}
              onRun={() => runAgent(slug)}
              onViewReport={setSelectedReport}
            />
          ))}
        </div>
      </div>

      {/* Strategic Agents */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-purple-600 dark:text-purple-300/60 uppercase tracking-wider mb-4">
          Equipo Estratégico (C-Suite)
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRATEGIC_AGENTS.map(slug => (
            <BusinessAgentCard
              key={slug}
              agent={AGENTS[slug]}
              running={states[slug]?.running}
              result={states[slug]?.result}
              onRun={() => runAgent(slug)}
              onViewReport={setSelectedReport}
            />
          ))}
        </div>
      </div>

      {/* Schedule info */}
      <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 dark:text-white/30">
          ⏰ Pipeline diario automático a las <span className="text-gray-700 dark:text-white/50 font-medium">10:00am CT</span> · Lunes: CDO 10:27am · Domingos: Limpieza 2am + Estratega 11am
        </p>
      </div>

      {/* Report modal */}
      <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  )
}
