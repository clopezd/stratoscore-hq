import { Target, MessageSquare, Zap } from 'lucide-react'
import Link from 'next/link'

const agents = [
  {
    id: 'hunter',
    name: 'HUNTER',
    tagline: 'Lead Generation Engine',
    description: 'Encuentra prospectos calificados 24/7 con scraping inteligente y scoring automático.',
    color: '#00F2FE',
    icon: Target,
    status: 'planned',
    metrics: {
      leadsPerMonth: '0',
      avgScore: '0%',
      campaigns: '0',
    },
  },
  {
    id: 'closer',
    name: 'CLOSER',
    tagline: 'Sales Automation Agent',
    description: 'Atiende consultas multicanal, califica intención y agenda demos automáticamente.',
    color: '#27C93F',
    icon: MessageSquare,
    status: 'planned',
    metrics: {
      conversations: '0',
      responseRate: '0%',
      demos: '0',
    },
  },
  {
    id: 'executor',
    name: 'EXECUTOR',
    tagline: 'Agentic Operating System',
    description: 'Tu asistente ejecutivo. Gestiona inbox, genera reportes y ejecuta tareas complejas.',
    color: '#FFBD2E',
    icon: Zap,
    status: 'active',
    metrics: {
      tasksCompleted: '0',
      timeSaved: '0h',
      automationRate: '0%',
    },
  },
]

export default function AgentsPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(0,242,254,0.6)' }}>
            [ AGENT_LAYER ]
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#E0EDE0' }}>
          Control de Agentes IA
        </h1>
        <p className="text-base md:text-lg" style={{ color: '#8B949E' }}>
          Gestiona y monitorea tus 3 agentes autónomos desde aquí.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon
          const isActive = agent.status === 'active'

          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group relative rounded-2xl overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(0,17,23,0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: isActive ? 'pointer' : 'not-allowed',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {/* Top accent */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${agent.color}60, transparent)`,
                }}
              />

              {/* Status badge */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase"
                  style={{
                    background: isActive ? 'rgba(39,201,63,0.15)' : 'rgba(139,148,158,0.15)',
                    color: isActive ? '#27C93F' : '#8B949E',
                    border: `1px solid ${isActive ? 'rgba(39,201,63,0.3)' : 'rgba(139,148,158,0.3)'}`,
                  }}
                >
                  {isActive ? '● ACTIVE' : '○ PLANNED'}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}30`,
                  }}
                >
                  <IconComponent size={24} style={{ color: agent.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: agent.color }}>
                    {agent.name}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: '#8B949E' }}>
                    {agent.tagline}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#8B949E' }}>
                {agent.description}
              </p>

              {/* Metrics */}
              <div className="space-y-2">
                {Object.entries(agent.metrics).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{
                      background: 'rgba(0,17,23,0.4)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span className="text-xs capitalize" style={{ color: '#8B949E' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-bold" style={{ color: agent.color }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hover indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Info footer */}
      <div
        className="mt-10 p-4 rounded-xl text-center"
        style={{
          background: 'rgba(0,242,254,0.05)',
          border: '1px solid rgba(0,242,254,0.15)',
        }}
      >
        <p className="text-sm" style={{ color: '#8B949E' }}>
          💡 <span style={{ color: '#E0EDE0' }}>EXECUTOR</span> está activo vía Telegram.{' '}
          <span style={{ color: '#00F2FE' }}>CLOSER</span> y{' '}
          <span style={{ color: '#00F2FE' }}>HUNTER</span> se implementarán en las próximas semanas.
        </p>
      </div>
    </div>
  )
}
