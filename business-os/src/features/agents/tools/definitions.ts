import { z } from 'zod'
import * as db from './shared'
import type { AgentSlug, AlertSeverity } from '../types'

// AI SDK v6: tools son objetos planos { description, parameters, execute }

// ── Shared tools ──

const getProductsTool = {
  description: 'Obtiene la lista de productos/proyectos activos del portafolio',
  parameters: z.object({}),
  execute: async () => {
    const products = await db.getProducts()
    return { products }
  },
}

const getLatestSnapshotsTool = {
  description: 'Obtiene snapshots de métricas recientes. days=1 para hoy, days=7 para última semana.',
  parameters: z.object({
    product_id: z.string().optional().describe('Filtrar por producto específico'),
    days: z.number().default(1).describe('Número de días hacia atrás'),
  }),
  execute: async ({ product_id, days }: { product_id?: string; days: number }) => {
    const snapshots = await db.getLatestSnapshots(product_id, days)
    return { snapshots, count: snapshots.length }
  },
}

const getMetricAverageTool = {
  description: 'Calcula el promedio de una métrica en los últimos N días',
  parameters: z.object({
    product_id: z.string().describe('ID del producto'),
    metric_key: z.string().describe('Clave de la métrica'),
    days: z.number().default(7).describe('Días para calcular el promedio'),
  }),
  execute: async ({ product_id, metric_key, days }: { product_id: string; metric_key: string; days: number }) => {
    const average = await db.getMetricAverage(product_id, metric_key, days)
    return { product_id, metric_key, average, period_days: days }
  },
}

const createAlertTool = {
  description: 'Crea una alerta en el sistema. Severity: critical=🔴, warning=🟡, info=🟢',
  parameters: z.object({
    type: z.string().describe('Tipo de alerta'),
    severity: z.enum(['critical', 'warning', 'info']),
    product_id: z.string().optional(),
    message: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ type, severity, product_id, message, data }: { type: string; severity: string; product_id?: string; message: string; data?: Record<string, unknown> }) => {
    const exists = await db.deduplicateAlert(type, product_id, 24)
    if (exists) return { created: false, reason: 'Alerta similar ya existe en las últimas 24h' }
    await db.createAlert(type, severity as AlertSeverity, message, product_id, data)
    return { created: true }
  },
}

const getActiveAlertsTool = {
  description: 'Obtiene alertas activas (no resueltas)',
  parameters: z.object({
    product_id: z.string().optional(),
  }),
  execute: async ({ product_id }: { product_id?: string }) => {
    const alerts = await db.getActiveAlerts(product_id)
    return { alerts, count: alerts.length }
  },
}

const getGoalsTool = {
  description: 'Obtiene goals estratégicos por estado',
  parameters: z.object({
    product_id: z.string().optional(),
    status: z.string().default('active'),
  }),
  execute: async ({ product_id, status }: { product_id?: string; status: string }) => {
    const goals = await db.getGoals(product_id, status)
    return { goals }
  },
}

const getLatestReportsTool = {
  description: 'Obtiene los últimos reportes de agentes específicos',
  parameters: z.object({
    agent_slugs: z.array(z.string()).describe('Slugs de los agentes'),
    limit: z.number().default(1),
  }),
  execute: async ({ agent_slugs, limit }: { agent_slugs: string[]; limit: number }) => {
    const reports = await db.getLatestReports(agent_slugs as AgentSlug[], limit)
    return { reports }
  },
}

// ── Collector-specific ──

const saveSnapshotTool = {
  description: 'Guarda métricas del día para un producto',
  parameters: z.object({
    product_id: z.string(),
    metrics: z.record(z.string(), z.number()).describe('Diccionario de métricas: { leads: 15, citas: 8, ... }'),
  }),
  execute: async ({ product_id, metrics }: { product_id: string; metrics: Record<string, number> }) => {
    const count = await db.saveSnapshot(product_id, metrics)
    return { saved: count, product_id }
  },
}

const logCollectorErrorTool = {
  description: 'Registra un error de recolección de datos',
  parameters: z.object({
    product_id: z.string(),
    error_message: z.string(),
    error_data: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ product_id, error_message, error_data }: { product_id: string; error_message: string; error_data?: Record<string, unknown> }) => {
    await db.logCollectorError(product_id, error_message, error_data)
    return { logged: true }
  },
}

// ── CFO-specific ──

const getFinancialSummaryTool = {
  description: 'Obtiene resumen financiero: ingresos y gastos del periodo',
  parameters: z.object({
    product_id: z.string().optional(),
    days: z.number().default(30),
  }),
  execute: async ({ product_id, days }: { product_id?: string; days: number }) => {
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
}

const getSubscriptionsTool = {
  description: 'Obtiene suscripciones/costos operacionales activos',
  parameters: z.object({
    product_id: z.string().optional(),
  }),
  execute: async ({ product_id }: { product_id?: string }) => {
    const subs = await db.getSubscriptions(product_id)
    const totalMonthly = subs.reduce((s, sub) => {
      const cost = Number(sub.cost)
      return s + (sub.billing_cycle === 'annual' ? cost / 12 : cost)
    }, 0)
    return { subscriptions: subs, total_monthly_cost: totalMonthly }
  },
}

// ── CTO-specific ──

const getCollectorErrorsTool = {
  description: 'Obtiene errores de colectores de métricas',
  parameters: z.object({
    days: z.number().default(7),
  }),
  execute: async ({ days }: { days: number }) => {
    const errors = await db.getCollectorErrors(days)
    return { errors, count: errors.length }
  },
}

// ── CMO-specific ──

const getPipelineSummaryTool = {
  description: 'Obtiene el pipeline activo de deals',
  parameters: z.object({}),
  execute: async () => {
    const deals = await db.getPipelineSummary()
    const totalValue = deals.reduce((s, d) => s + Number(d.value ?? 0), 0)
    return { deals, count: deals.length, total_pipeline_value: totalValue }
  },
}

// ── CEO-specific ──

const saveDailyActionsTool = {
  description: 'Guarda las acciones decididas para hoy',
  parameters: z.object({
    actions: z.array(z.object({
      action: z.string(),
      priority: z.number(),
      urgent: z.boolean().default(false),
    })),
  }),
  execute: async ({ actions }: { actions: { action: string; priority: number; urgent: boolean }[] }) => {
    await db.saveDailyActions(actions)
    return { saved: actions.length }
  },
}

const getDailyActionsTool = {
  description: 'Obtiene las acciones del día (del CEO)',
  parameters: z.object({
    date: z.string().optional(),
  }),
  execute: async ({ date }: { date?: string }) => {
    const actions = await db.getDailyActions(date)
    return { actions }
  },
}

// ── Journalist-specific ──

const saveJournalEntryTool = {
  description: 'Guarda la entrada del diario de negocio',
  parameters: z.object({
    date: z.string(),
    content: z.string(),
    summary: z.string(),
    metrics_summary: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ date, content, summary, metrics_summary }: { date: string; content: string; summary: string; metrics_summary?: Record<string, unknown> }) => {
    await db.saveJournalEntry(date, content, summary, metrics_summary)
    return { saved: true, date }
  },
}

const getJournalEntriesTool = {
  description: 'Obtiene entradas recientes del diario',
  parameters: z.object({
    days: z.number().default(7),
  }),
  execute: async ({ days }: { days: number }) => {
    const entries = await db.getJournalEntries(days)
    return { entries }
  },
}

// ── Strategist-specific ──

const saveWeeklyReportTool = {
  description: 'Guarda el reporte semanal estratégico',
  parameters: z.object({
    week_number: z.number(),
    year: z.number(),
    content: z.string(),
    metrics_comparison: z.record(z.string(), z.unknown()).optional(),
    projections: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ week_number, year, content, metrics_comparison, projections }: { week_number: number; year: number; content: string; metrics_comparison?: Record<string, unknown>; projections?: Record<string, unknown> }) => {
    await db.saveWeeklyReport(week_number, year, content, metrics_comparison, projections)
    return { saved: true, week_number, year }
  },
}

// ── Cleanup-specific ──

const countRecordsTool = {
  description: 'Cuenta registros en una tabla',
  parameters: z.object({
    table: z.string(),
    filter: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ table, filter }: { table: string; filter?: Record<string, unknown> }) => {
    const count = await db.countRecords(table, filter)
    return { table, count }
  },
}

const deleteOldRecordsTool = {
  description: 'Elimina registros más antiguos que N días',
  parameters: z.object({
    table: z.string(),
    older_than_days: z.number(),
    extra_filter: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ table, older_than_days, extra_filter }: { table: string; older_than_days: number; extra_filter?: Record<string, unknown> }) => {
    const deleted = await db.deleteOldRecords(table, older_than_days, extra_filter)
    return { table, deleted }
  },
}

const archiveGoalsTool = {
  description: 'Archiva goals completados con más de 90 días',
  parameters: z.object({}),
  execute: async () => {
    const archived = await db.archiveGoals()
    return { archived }
  },
}

// ── CDO-specific ──

const getDesignAuditsTool = {
  description: 'Obtiene auditorías de diseño existentes',
  parameters: z.object({
    product_id: z.string().optional(),
    resolved: z.boolean().optional(),
  }),
  execute: async ({ product_id, resolved }: { product_id?: string; resolved?: boolean }) => {
    const audits = await db.getDesignAudits(product_id, resolved)
    return { audits, count: audits.length }
  },
}

const saveDesignAuditTool = {
  description: 'Registra un hallazgo de auditoría de diseño',
  parameters: z.object({
    product_id: z.string().optional(),
    audit_type: z.enum(['branding', 'accessibility', 'design_system', 'responsive', 'performance', 'benchmark']),
    area: z.string(),
    severity: z.enum(['critical', 'warning', 'info']),
    finding: z.string(),
    recommendation: z.string().optional(),
    score: z.number().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async (params: { product_id?: string; audit_type: string; area: string; severity: string; finding: string; recommendation?: string; score?: number; metadata?: Record<string, unknown> }) => {
    await db.saveDesignAudit(params)
    return { saved: true }
  },
}

const getDesignDebtSummaryTool = {
  description: 'Obtiene resumen de deuda de diseño',
  parameters: z.object({}),
  execute: async () => {
    const summary = await db.getDesignDebtSummary()
    return summary
  },
}

const resolveDesignAuditTool = {
  description: 'Marca una auditoría de diseño como resuelta',
  parameters: z.object({
    audit_id: z.string(),
  }),
  execute: async ({ audit_id }: { audit_id: string }) => {
    await db.resolveDesignAudit(audit_id)
    return { resolved: true }
  },
}

// ── Survey tools ──

const getSurveySummaryTool = {
  description: 'Obtiene resumen agregado de respuestas de una encuesta',
  parameters: z.object({
    survey_slug: z.string().default('validacion-nicho-v1'),
  }),
  execute: async ({ survey_slug }: { survey_slug: string }) => {
    const summary = await db.getSurveySummary(survey_slug)
    return summary
  },
}

// ── Memories ──

const getMemoriesTool = {
  description: 'Obtiene las memorias del dueño (identidad, tono, contexto, vocabulario)',
  parameters: z.object({
    category: z.string().optional(),
  }),
  execute: async ({ category }: { category?: string }) => {
    const memories = await db.getMemories(category)
    return { memories, count: memories.length }
  },
}

// ── Tool sets per agent ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getToolsForAgent(slug: AgentSlug, agentSlugForReport: AgentSlug): Record<string, any> {
  const saveReportWithSlug = {
    description: 'Guarda el reporte generado por este agente',
    parameters: z.object({
      content: z.string(),
      report_type: z.string().default('daily'),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
    execute: async ({ content, report_type, metadata }: { content: string; report_type: string; metadata?: Record<string, unknown> }) => {
      await db.saveReport(agentSlugForReport, content, report_type, metadata)
      return { saved: true, agent: agentSlugForReport }
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolSets: Record<AgentSlug, Record<string, any>> = {
    collector: {
      get_products: getProductsTool,
      collect_project_metrics: {
        description: 'Recolecta métricas reales de un proyecto consultando sus tablas en Supabase. Retorna un diccionario de métricas.',
        parameters: z.object({
          project_slug: z.string().describe('Slug del proyecto: videndum, mobility, bidhunter, medcare, finanzas'),
        }),
        execute: async ({ project_slug }: { project_slug: string }) => {
          const metrics = await db.collectProjectMetrics(project_slug)
          return { project_slug, metrics }
        },
      },
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
