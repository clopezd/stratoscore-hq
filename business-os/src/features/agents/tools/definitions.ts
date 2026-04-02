import { tool } from 'ai'
import { z } from 'zod'
import * as db from './shared'
import type { AgentSlug, AlertSeverity } from '../types'

// ── Shared tools (available to most agents) ──

const getProductsTool = tool({
  description: 'Obtiene la lista de productos activos del portafolio',
  parameters: z.object({}),
  execute: async () => {
    const products = await db.getProducts()
    return { products }
  },
})

const getLatestSnapshotsTool = tool({
  description: 'Obtiene snapshots de métricas recientes. days=1 para hoy, days=7 para última semana.',
  parameters: z.object({
    product_id: z.string().optional().describe('Filtrar por producto específico'),
    days: z.number().default(1).describe('Número de días hacia atrás'),
  }),
  execute: async ({ product_id, days }) => {
    const snapshots = await db.getLatestSnapshots(product_id, days)
    return { snapshots, count: snapshots.length }
  },
})

const getMetricAverageTool = tool({
  description: 'Calcula el promedio de una métrica en los últimos N días',
  parameters: z.object({
    product_id: z.string().describe('ID del producto'),
    metric_key: z.string().describe('Clave de la métrica (mrr, dau, churn_rate, etc.)'),
    days: z.number().default(7).describe('Días para calcular el promedio'),
  }),
  execute: async ({ product_id, metric_key, days }) => {
    const average = await db.getMetricAverage(product_id, metric_key, days)
    return { product_id, metric_key, average, period_days: days }
  },
})

const createAlertTool = tool({
  description: 'Crea una alerta en el sistema. Usa severity: critical para 🔴, warning para 🟡, info para 🟢',
  parameters: z.object({
    type: z.string().describe('Tipo de alerta (mrr_drop, churn_spike, uptime_low, etc.)'),
    severity: z.enum(['critical', 'warning', 'info']).describe('Severidad'),
    product_id: z.string().optional().describe('Producto afectado'),
    message: z.string().describe('Mensaje descriptivo de la alerta'),
    data: z.record(z.unknown()).optional().describe('Datos de contexto adicionales'),
  }),
  execute: async ({ type, severity, product_id, message, data }) => {
    const exists = await db.deduplicateAlert(type, product_id, 24)
    if (exists) return { created: false, reason: 'Alerta similar ya existe en las últimas 24h' }
    await db.createAlert(type, severity as AlertSeverity, message, product_id, data)
    return { created: true }
  },
})

const getActiveAlertsTool = tool({
  description: 'Obtiene alertas activas (no resueltas)',
  parameters: z.object({
    product_id: z.string().optional().describe('Filtrar por producto'),
  }),
  execute: async ({ product_id }) => {
    const alerts = await db.getActiveAlerts(product_id)
    return { alerts, count: alerts.length }
  },
})

const getGoalsTool = tool({
  description: 'Obtiene goals estratégicos por estado',
  parameters: z.object({
    product_id: z.string().optional(),
    status: z.string().default('active'),
  }),
  execute: async ({ product_id, status }) => {
    const goals = await db.getGoals(product_id, status)
    return { goals }
  },
})

const getLatestReportsTool = tool({
  description: 'Obtiene los últimos reportes de agentes específicos',
  parameters: z.object({
    agent_slugs: z.array(z.string()).describe('Slugs de los agentes (cfo, cto, cmo, cpo, etc.)'),
    limit: z.number().default(1).describe('Reportes por agente'),
  }),
  execute: async ({ agent_slugs, limit }) => {
    const reports = await db.getLatestReports(agent_slugs as AgentSlug[], limit)
    return { reports }
  },
})

const saveReportTool = tool({
  description: 'Guarda el reporte generado por este agente',
  parameters: z.object({
    content: z.string().describe('Contenido del reporte en markdown'),
    report_type: z.string().default('daily'),
    metadata: z.record(z.unknown()).optional(),
  }),
  execute: async () => {
    // agent_slug se inyecta en runtime, este es un placeholder
    return { saved: true }
  },
})

// ── Collector-specific ──

const saveSnapshotTool = tool({
  description: 'Guarda métricas del día para un producto',
  parameters: z.object({
    product_id: z.string().describe('ID del producto'),
    metrics: z.record(z.number()).describe('Diccionario de métricas: { mrr: 1500, dau: 230, ... }'),
  }),
  execute: async ({ product_id, metrics }) => {
    const count = await db.saveSnapshot(product_id, metrics)
    return { saved: count, product_id }
  },
})

const logCollectorErrorTool = tool({
  description: 'Registra un error de recolección de datos',
  parameters: z.object({
    product_id: z.string(),
    error_message: z.string(),
    error_data: z.record(z.unknown()).optional(),
  }),
  execute: async ({ product_id, error_message, error_data }) => {
    await db.logCollectorError(product_id, error_message, error_data)
    return { logged: true }
  },
})

// ── CFO-specific ──

const getFinancialSummaryTool = tool({
  description: 'Obtiene resumen financiero: ingresos y gastos del periodo',
  parameters: z.object({
    product_id: z.string().optional(),
    days: z.number().default(30),
  }),
  execute: async ({ product_id, days }) => {
    const summary = await db.getFinancialSummary(product_id, days)
    const totalIncome = summary.income.reduce((s, i) => s + Number(i.amount), 0)
    const totalExpenses = summary.expenses.reduce((s, e) => s + Number(e.amount), 0)
    return {
      income: summary.income,
      expenses: summary.expenses,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      margin: totalIncome - totalExpenses,
    }
  },
})

const getSubscriptionsTool = tool({
  description: 'Obtiene suscripciones/costos operacionales activos',
  parameters: z.object({
    product_id: z.string().optional(),
  }),
  execute: async ({ product_id }) => {
    const subs = await db.getSubscriptions(product_id)
    const totalMonthly = subs.reduce((s, sub) => {
      const cost = Number(sub.cost)
      return s + (sub.billing_cycle === 'annual' ? cost / 12 : cost)
    }, 0)
    return { subscriptions: subs, total_monthly_cost: totalMonthly }
  },
})

// ── CTO-specific ──

const getCollectorErrorsTool = tool({
  description: 'Obtiene errores de colectores de métricas',
  parameters: z.object({
    days: z.number().default(7),
  }),
  execute: async ({ days }) => {
    const errors = await db.getCollectorErrors(days)
    return { errors, count: errors.length }
  },
})

// ── CMO-specific ──

const getPipelineSummaryTool = tool({
  description: 'Obtiene el pipeline activo de deals de la agencia B2B',
  parameters: z.object({}),
  execute: async () => {
    const deals = await db.getPipelineSummary()
    const totalValue = deals.reduce((s, d) => s + Number(d.value ?? 0), 0)
    return { deals, count: deals.length, total_pipeline_value: totalValue }
  },
})

// ── CEO-specific ──

const saveDailyActionsTool = tool({
  description: 'Guarda las acciones decididas para hoy',
  parameters: z.object({
    actions: z.array(z.object({
      action: z.string().describe('Descripción de la acción'),
      priority: z.number().describe('1 = más importante'),
      urgent: z.boolean().default(false),
    })),
  }),
  execute: async ({ actions }) => {
    await db.saveDailyActions(actions)
    return { saved: actions.length }
  },
})

const getDailyActionsTool = tool({
  description: 'Obtiene las acciones del día (del CEO)',
  parameters: z.object({
    date: z.string().optional().describe('Fecha YYYY-MM-DD, default: hoy'),
  }),
  execute: async ({ date }) => {
    const actions = await db.getDailyActions(date)
    return { actions }
  },
})

// ── Journalist-specific ──

const saveJournalEntryTool = tool({
  description: 'Guarda la entrada del diario de negocio',
  parameters: z.object({
    date: z.string().describe('Fecha YYYY-MM-DD'),
    content: z.string().describe('Contenido en markdown'),
    summary: z.string().describe('Resumen de 1 línea'),
    metrics_summary: z.record(z.unknown()).optional(),
  }),
  execute: async ({ date, content, summary, metrics_summary }) => {
    await db.saveJournalEntry(date, content, summary, metrics_summary)
    return { saved: true, date }
  },
})

const getJournalEntriesTool = tool({
  description: 'Obtiene entradas recientes del diario',
  parameters: z.object({
    days: z.number().default(7),
  }),
  execute: async ({ days }) => {
    const entries = await db.getJournalEntries(days)
    return { entries }
  },
})

// ── Strategist-specific ──

const saveWeeklyReportTool = tool({
  description: 'Guarda el reporte semanal estratégico',
  parameters: z.object({
    week_number: z.number(),
    year: z.number(),
    content: z.string(),
    metrics_comparison: z.record(z.unknown()).optional(),
    projections: z.record(z.unknown()).optional(),
  }),
  execute: async ({ week_number, year, content, metrics_comparison, projections }) => {
    await db.saveWeeklyReport(week_number, year, content, metrics_comparison, projections)
    return { saved: true, week_number, year }
  },
})

// ── Cleanup-specific ──

const countRecordsTool = tool({
  description: 'Cuenta registros en una tabla con filtros opcionales',
  parameters: z.object({
    table: z.string(),
    filter: z.record(z.unknown()).optional(),
  }),
  execute: async ({ table, filter }) => {
    const count = await db.countRecords(table, filter)
    return { table, count }
  },
})

const deleteOldRecordsTool = tool({
  description: 'Elimina registros más antiguos que N días',
  parameters: z.object({
    table: z.string(),
    older_than_days: z.number(),
    extra_filter: z.record(z.unknown()).optional(),
  }),
  execute: async ({ table, older_than_days, extra_filter }) => {
    const deleted = await db.deleteOldRecords(table, older_than_days, extra_filter)
    return { table, deleted }
  },
})

const archiveGoalsTool = tool({
  description: 'Archiva goals completados con más de 90 días',
  parameters: z.object({}),
  execute: async () => {
    const archived = await db.archiveGoals()
    return { archived }
  },
})

// ── CDO-specific ──

const getDesignAuditsTool = tool({
  description: 'Obtiene auditorías de diseño existentes, filtrable por producto y estado',
  parameters: z.object({
    product_id: z.string().optional().describe('Filtrar por producto'),
    resolved: z.boolean().optional().describe('Filtrar por estado: true=resueltas, false=abiertas'),
  }),
  execute: async ({ product_id, resolved }) => {
    const audits = await db.getDesignAudits(product_id, resolved)
    return { audits, count: audits.length }
  },
})

const saveDesignAuditTool = tool({
  description: 'Registra un hallazgo de auditoría de diseño (branding, accesibilidad, UI, tokens, responsive)',
  parameters: z.object({
    product_id: z.string().optional().describe('Producto afectado (null para hallazgos transversales)'),
    audit_type: z.enum(['branding', 'accessibility', 'design_system', 'responsive', 'performance', 'benchmark']).describe('Tipo de auditoría'),
    area: z.string().describe('Área específica (logo, palette, contrast, tokens, components, typography, layout)'),
    severity: z.enum(['critical', 'warning', 'info']).describe('Severidad: critical=rompe UX/accesibilidad, warning=inconsistencia, info=mejora'),
    finding: z.string().describe('Descripción del hallazgo'),
    recommendation: z.string().optional().describe('Recomendación concreta para resolver'),
    score: z.number().optional().describe('Score de 1-10 para el área evaluada'),
    metadata: z.record(z.unknown()).optional().describe('Datos adicionales (hex codes, contrast ratios, etc.)'),
  }),
  execute: async (params) => {
    await db.saveDesignAudit(params)
    return { saved: true }
  },
})

const getDesignDebtSummaryTool = tool({
  description: 'Obtiene resumen de deuda de diseño: total de issues abiertos por severidad y área',
  parameters: z.object({}),
  execute: async () => {
    const summary = await db.getDesignDebtSummary()
    return summary
  },
})

const resolveDesignAuditTool = tool({
  description: 'Marca una auditoría de diseño como resuelta',
  parameters: z.object({
    audit_id: z.string().describe('ID de la auditoría a resolver'),
  }),
  execute: async ({ audit_id }) => {
    await db.resolveDesignAudit(audit_id)
    return { resolved: true }
  },
})

// ── Survey tools ──

const getSurveySummaryTool = tool({
  description: 'Obtiene resumen agregado de respuestas de una encuesta. Muestra conteos por opción y textos libres.',
  parameters: z.object({
    survey_slug: z.string().default('validacion-nicho-v1').describe('Slug de la encuesta'),
  }),
  execute: async ({ survey_slug }) => {
    const summary = await db.getSurveySummary(survey_slug)
    return summary
  },
})

// ── Tool sets per agent ──

const getMemoriesTool = tool({
  description: 'Obtiene las memorias del dueño (identidad, tono, contexto, vocabulario, ejemplos de posts, logros, aprendizajes)',
  parameters: z.object({
    category: z.string().optional().describe('Filtrar por categoría: identidad, tono, contexto, vocabulario, ejemplo_post, logro, proyecto, aprendizaje, contacto, otro'),
  }),
  execute: async ({ category }) => {
    const memories = await db.getMemories(category)
    return { memories, count: memories.length }
  },
})

export function getToolsForAgent(slug: AgentSlug, agentSlugForReport: AgentSlug) {
  // Override saveReport to inject the correct agent_slug
  const saveReportWithSlug = tool({
    description: 'Guarda el reporte generado por este agente',
    parameters: z.object({
      content: z.string().describe('Contenido del reporte en markdown'),
      report_type: z.string().default('daily'),
      metadata: z.record(z.unknown()).optional(),
    }),
    execute: async ({ content, report_type, metadata }) => {
      await db.saveReport(agentSlugForReport, content, report_type, metadata)
      return { saved: true, agent: agentSlugForReport }
    },
  })

  const toolSets: Record<AgentSlug, Record<string, ReturnType<typeof tool>>> = {
    collector: {
      get_products: getProductsTool,
      save_snapshot: saveSnapshotTool,
      log_collector_error: logCollectorErrorTool,
    },

    analyst: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_metric_average: getMetricAverageTool,
      get_active_alerts: getActiveAlertsTool,
      create_alert: createAlertTool,
    },

    cfo: {
      get_financial_summary: getFinancialSummaryTool,
      get_subscriptions: getSubscriptionsTool,
      get_latest_snapshots: getLatestSnapshotsTool,
      get_survey_summary: getSurveySummaryTool,
      create_alert: createAlertTool,
      save_report: saveReportWithSlug,
    },

    cto: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_collector_errors: getCollectorErrorsTool,
      get_subscriptions: getSubscriptionsTool,
      create_alert: createAlertTool,
      save_report: saveReportWithSlug,
    },

    cmo: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_pipeline_summary: getPipelineSummaryTool,
      get_survey_summary: getSurveySummaryTool,
      create_alert: createAlertTool,
      save_report: saveReportWithSlug,
    },

    cpo: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_goals: getGoalsTool,
      get_survey_summary: getSurveySummaryTool,
      save_report: saveReportWithSlug,
    },

    cdo: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_latest_reports: getLatestReportsTool,
      get_design_audits: getDesignAuditsTool,
      save_design_audit: saveDesignAuditTool,
      get_design_debt_summary: getDesignDebtSummaryTool,
      resolve_design_audit: resolveDesignAuditTool,
      get_survey_summary: getSurveySummaryTool,
      create_alert: createAlertTool,
      save_report: saveReportWithSlug,
    },

    ceo: {
      get_latest_reports: getLatestReportsTool,
      get_goals: getGoalsTool,
      get_active_alerts: getActiveAlertsTool,
      get_survey_summary: getSurveySummaryTool,
      save_daily_actions: saveDailyActionsTool,
      save_report: saveReportWithSlug,
    },

    strategist: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_latest_reports: getLatestReportsTool,
      get_goals: getGoalsTool,
      get_journal_entries: getJournalEntriesTool,
      get_survey_summary: getSurveySummaryTool,
      save_weekly_report: saveWeeklyReportTool,
      save_report: saveReportWithSlug,
    },

    journalist: {
      get_latest_snapshots: getLatestSnapshotsTool,
      get_latest_reports: getLatestReportsTool,
      get_active_alerts: getActiveAlertsTool,
      get_daily_actions: getDailyActionsTool,
      get_pipeline_summary: getPipelineSummaryTool,
      save_journal_entry: saveJournalEntryTool,
    },

    cleanup: {
      count_records: countRecordsTool,
      delete_old_records: deleteOldRecordsTool,
      archive_goals: archiveGoalsTool,
      create_alert: createAlertTool,
    },

    ghostwriter: {
      get_memories: getMemoriesTool,
      get_latest_reports: getLatestReportsTool,
      get_journal_entries: getJournalEntriesTool,
      get_latest_snapshots: getLatestSnapshotsTool,
      save_report: saveReportWithSlug,
    },
  }

  return toolSets[slug]
}
