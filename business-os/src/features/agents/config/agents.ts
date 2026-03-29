import type { AgentConfig, AgentSlug } from '../types'

export const AGENTS: Record<AgentSlug, AgentConfig> = {
  collector: {
    slug: 'collector',
    name: 'Recolector',
    emoji: '📡',
    team: 'operational',
    schedule: '0 10 * * *', // 10:00am diario
    description: 'Sincroniza métricas de los 5 productos SaaS del portafolio',
    reads: ['products'],
    writes: ['metrics_snapshots', 'collector_errors'],
  },
  analyst: {
    slug: 'analyst',
    name: 'Analista',
    emoji: '🔍',
    team: 'operational',
    schedule: '5 10 * * *', // 10:05am diario
    description: 'Detecta anomalías en métricas y genera alertas automáticas',
    reads: ['metrics_snapshots', 'alerts'],
    writes: ['alerts'],
  },
  cfo: {
    slug: 'cfo',
    name: 'CFO',
    emoji: '💰',
    team: 'strategic',
    schedule: '10 10 * * *', // 10:10am diario
    description: 'Analiza márgenes, burn rate y rentabilidad por producto',
    reads: ['metrics_snapshots', 'income_entries', 'expense_entries', 'subscriptions'],
    writes: ['agent_reports', 'alerts'],
  },
  cto: {
    slug: 'cto',
    name: 'CTO',
    emoji: '⚙️',
    team: 'strategic',
    schedule: '15 10 * * *', // 10:15am diario
    description: 'Monitorea salud técnica, errores e infraestructura',
    reads: ['metrics_snapshots', 'collector_errors', 'subscriptions'],
    writes: ['agent_reports', 'alerts'],
  },
  cmo: {
    slug: 'cmo',
    name: 'CMO',
    emoji: '📈',
    team: 'strategic',
    schedule: '20 10 * * *', // 10:20am diario
    description: 'Analiza growth, funnels de conversión y pipeline de agencia',
    reads: ['metrics_snapshots', 'deals'],
    writes: ['agent_reports', 'alerts'],
  },
  cpo: {
    slug: 'cpo',
    name: 'CPO',
    emoji: '🎯',
    team: 'strategic',
    schedule: '25 10 * * *', // 10:25am diario
    description: 'Evalúa engagement, adoption y prioriza features',
    reads: ['metrics_snapshots', 'goals'],
    writes: ['agent_reports'],
  },
  ceo: {
    slug: 'ceo',
    name: 'CEO',
    emoji: '👔',
    team: 'strategic',
    schedule: '30 10 * * *', // 10:30am diario
    description: 'Sintetiza reportes del C-suite y decide acciones del día',
    reads: ['agent_reports', 'goals', 'alerts'],
    writes: ['agent_reports', 'daily_actions'],
  },
  strategist: {
    slug: 'strategist',
    name: 'Estratega',
    emoji: '🗺️',
    team: 'strategic',
    schedule: '0 11 * * 0', // Domingos 11:00am
    description: 'Reporte semanal W/W con proyecciones a 30/60/90 días',
    reads: ['agent_reports', 'metrics_snapshots', 'goals', 'journal_entries'],
    writes: ['agent_reports', 'weekly_reports'],
  },
  journalist: {
    slug: 'journalist',
    name: 'Periodista',
    emoji: '📓',
    team: 'operational',
    schedule: '35 10 * * *', // 10:35am diario (después del CEO)
    description: 'Escribe el diario operacional del negocio',
    reads: ['metrics_snapshots', 'agent_reports', 'alerts', 'daily_actions', 'deals'],
    writes: ['journal_entries'],
  },
  cleanup: {
    slug: 'cleanup',
    name: 'Limpieza',
    emoji: '🧹',
    team: 'operational',
    schedule: '0 2 * * 0', // Domingos 2:00am
    description: 'Limpia datos operacionales antiguos y archiva goals',
    reads: ['collector_errors', 'agent_reports', 'alerts', 'daily_actions', 'goals'],
    writes: ['collector_errors', 'agent_reports', 'alerts', 'daily_actions', 'goals'],
  },
}

/** Orden de ejecución diaria */
export const DAILY_EXECUTION_ORDER: AgentSlug[] = [
  'collector',
  'analyst',
  'cfo',
  'cto',
  'cmo',
  'cpo',
  'ceo',
  'journalist',
]

/** Agentes que corren solo los domingos */
export const WEEKLY_AGENTS: AgentSlug[] = ['cleanup', 'strategist']
