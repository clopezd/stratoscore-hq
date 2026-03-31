import { createServiceClient } from '@/lib/supabase/service'
import type {
  Product,
  MetricSnapshot,
  AgentReport,
  Alert,
  AlertSeverity,
  AgentSlug,
  Goal,
  CollectorError,
  Subscription,
  Deal,
  JournalEntry,
  DailyAction,
  IncomeEntry,
  ExpenseEntry,
} from '../types'

function supabase() {
  return createServiceClient()
}

// ── Products ──

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase()
    .from('products')
    .select('*')
    .eq('status', 'active')
  if (error) throw new Error(`getProducts: ${error.message}`)
  return data ?? []
}

// ── Metrics Snapshots ──

export async function getLatestSnapshots(
  productId?: string,
  days: number = 1
): Promise<MetricSnapshot[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const dateStr = since.toISOString().split('T')[0]

  let q = supabase()
    .from('metrics_snapshots')
    .select('*')
    .gte('snapshot_date', dateStr)
    .order('snapshot_date', { ascending: false })

  if (productId) q = q.eq('product_id', productId)

  const { data, error } = await q
  if (error) throw new Error(`getLatestSnapshots: ${error.message}`)
  return data ?? []
}

export async function getMetricAverage(
  productId: string,
  metricKey: string,
  days: number = 7
): Promise<number> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const dateStr = since.toISOString().split('T')[0]

  const { data, error } = await supabase()
    .from('metrics_snapshots')
    .select('value')
    .eq('product_id', productId)
    .eq('metric_key', metricKey)
    .gte('snapshot_date', dateStr)

  if (error) throw new Error(`getMetricAverage: ${error.message}`)
  if (!data?.length) return 0

  return data.reduce((sum, d) => sum + Number(d.value), 0) / data.length
}

export async function saveSnapshot(
  productId: string,
  metrics: Record<string, number>
): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const rows = Object.entries(metrics).map(([metric_key, value]) => ({
    product_id: productId,
    metric_key,
    value,
    snapshot_date: today,
  }))

  const { error } = await supabase()
    .from('metrics_snapshots')
    .upsert(rows, { onConflict: 'product_id,metric_key,snapshot_date' })

  if (error) throw new Error(`saveSnapshot: ${error.message}`)
  return rows.length
}

// ── Agent Reports ──

export async function getLatestReports(
  agentSlugs: AgentSlug[],
  limit: number = 1
): Promise<AgentReport[]> {
  const { data, error } = await supabase()
    .from('agent_reports')
    .select('*')
    .in('agent_slug', agentSlugs)
    .order('created_at', { ascending: false })
    .limit(limit * agentSlugs.length)

  if (error) throw new Error(`getLatestReports: ${error.message}`)
  return data ?? []
}

export async function saveReport(
  agentSlug: AgentSlug,
  content: string,
  reportType: string = 'daily',
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase()
    .from('agent_reports')
    .insert({ agent_slug: agentSlug, report_type: reportType, content, metadata })

  if (error) throw new Error(`saveReport: ${error.message}`)
}

// ── Alerts ──

export async function getActiveAlerts(productId?: string): Promise<Alert[]> {
  let q = supabase()
    .from('alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  if (productId) q = q.eq('product_id', productId)

  const { data, error } = await q
  if (error) throw new Error(`getActiveAlerts: ${error.message}`)
  return data ?? []
}

export async function createAlert(
  type: string,
  severity: AlertSeverity,
  message: string,
  productId?: string,
  alertData?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase()
    .from('alerts')
    .insert({
      type,
      severity,
      product_id: productId ?? null,
      message,
      data: alertData ?? null,
    })

  if (error) throw new Error(`createAlert: ${error.message}`)
}

export async function deduplicateAlert(
  type: string,
  productId: string | undefined,
  hours: number = 24
): Promise<boolean> {
  const since = new Date()
  since.setHours(since.getHours() - hours)

  let q = supabase()
    .from('alerts')
    .select('id')
    .eq('type', type)
    .eq('resolved', false)
    .gte('created_at', since.toISOString())
    .limit(1)

  if (productId) q = q.eq('product_id', productId)

  const { data } = await q
  return (data?.length ?? 0) > 0
}

// ── Financial ──

export async function getFinancialSummary(
  productId?: string,
  days: number = 30
): Promise<{ income: IncomeEntry[]; expenses: ExpenseEntry[] }> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const dateStr = since.toISOString().split('T')[0]

  let incomeQ = supabase()
    .from('income_entries')
    .select('*')
    .gte('entry_date', dateStr)
  let expenseQ = supabase()
    .from('expense_entries')
    .select('*')
    .gte('entry_date', dateStr)

  if (productId) {
    incomeQ = incomeQ.eq('product_id', productId)
    expenseQ = expenseQ.eq('product_id', productId)
  }

  const [incomeRes, expenseRes] = await Promise.all([incomeQ, expenseQ])

  if (incomeRes.error) throw new Error(`getFinancialSummary income: ${incomeRes.error.message}`)
  if (expenseRes.error) throw new Error(`getFinancialSummary expenses: ${expenseRes.error.message}`)

  return {
    income: incomeRes.data ?? [],
    expenses: expenseRes.data ?? [],
  }
}

export async function getSubscriptions(productId?: string): Promise<Subscription[]> {
  let q = supabase()
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')

  if (productId) q = q.eq('product_id', productId)

  const { data, error } = await q
  if (error) throw new Error(`getSubscriptions: ${error.message}`)
  return data ?? []
}

// ── Collector Errors ──

export async function logCollectorError(
  productId: string,
  errorMessage: string,
  errorData?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase()
    .from('collector_errors')
    .insert({
      product_id: productId,
      error_message: errorMessage,
      error_data: errorData ?? null,
    })

  if (error) throw new Error(`logCollectorError: ${error.message}`)
}

export async function getCollectorErrors(days: number = 7): Promise<CollectorError[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase()
    .from('collector_errors')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getCollectorErrors: ${error.message}`)
  return data ?? []
}

// ── Goals ──

export async function getGoals(
  productId?: string,
  status: string = 'active'
): Promise<Goal[]> {
  let q = supabase()
    .from('goals')
    .select('*')
    .eq('status', status)

  if (productId) q = q.eq('product_id', productId)

  const { data, error } = await q
  if (error) throw new Error(`getGoals: ${error.message}`)
  return data ?? []
}

// ── Deals (Pipeline) ──

export async function getPipelineSummary(): Promise<Deal[]> {
  const { data, error } = await supabase()
    .from('deals')
    .select('*')
    .not('stage', 'in', '("closed_won","closed_lost")')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`getPipelineSummary: ${error.message}`)
  return data ?? []
}

export async function getDeals(stage?: string): Promise<Deal[]> {
  let q = supabase()
    .from('deals')
    .select('*')
    .order('updated_at', { ascending: false })

  if (stage) q = q.eq('stage', stage)

  const { data, error } = await q
  if (error) throw new Error(`getDeals: ${error.message}`)
  return data ?? []
}

// ── Journal ──

export async function saveJournalEntry(
  date: string,
  content: string,
  summary: string,
  metricsSummary?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase()
    .from('journal_entries')
    .upsert(
      {
        entry_date: date,
        content,
        summary,
        metrics_summary: metricsSummary ?? null,
      },
      { onConflict: 'entry_date' }
    )

  if (error) throw new Error(`saveJournalEntry: ${error.message}`)
}

export async function getJournalEntries(days: number = 7): Promise<JournalEntry[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const dateStr = since.toISOString().split('T')[0]

  const { data, error } = await supabase()
    .from('journal_entries')
    .select('*')
    .gte('entry_date', dateStr)
    .order('entry_date', { ascending: false })

  if (error) throw new Error(`getJournalEntries: ${error.message}`)
  return data ?? []
}

// ── Daily Actions ──

export async function saveDailyActions(
  actions: { action: string; priority: number; urgent: boolean }[]
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const rows = actions.map((a) => ({
    action_date: today,
    action: a.action,
    priority: a.priority,
    urgent: a.urgent,
  }))

  const { error } = await supabase().from('daily_actions').insert(rows)
  if (error) throw new Error(`saveDailyActions: ${error.message}`)
}

export async function getDailyActions(date?: string): Promise<DailyAction[]> {
  const targetDate = date ?? new Date().toISOString().split('T')[0]

  const { data, error } = await supabase()
    .from('daily_actions')
    .select('*')
    .eq('action_date', targetDate)
    .order('priority', { ascending: true })

  if (error) throw new Error(`getDailyActions: ${error.message}`)
  return data ?? []
}

// ── Weekly Reports ──

export async function saveWeeklyReport(
  weekNumber: number,
  year: number,
  content: string,
  metricsComparison?: Record<string, unknown>,
  projections?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase()
    .from('weekly_reports')
    .upsert(
      {
        week_number: weekNumber,
        year,
        content,
        metrics_comparison: metricsComparison ?? null,
        projections: projections ?? null,
      },
      { onConflict: 'week_number,year' }
    )

  if (error) throw new Error(`saveWeeklyReport: ${error.message}`)
}

// ── Cleanup ──

export async function countRecords(
  table: string,
  filter?: Record<string, unknown>
): Promise<number> {
  let q = supabase().from(table).select('*', { count: 'exact', head: true })

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      q = q.eq(key, value)
    }
  }

  const { count, error } = await q
  if (error) throw new Error(`countRecords(${table}): ${error.message}`)
  return count ?? 0
}

export async function deleteOldRecords(
  table: string,
  olderThanDays: number,
  extraFilter?: Record<string, unknown>
): Promise<number> {
  const since = new Date()
  since.setDate(since.getDate() - olderThanDays)

  let q = supabase()
    .from(table)
    .delete()
    .lt('created_at', since.toISOString())

  if (extraFilter) {
    for (const [key, value] of Object.entries(extraFilter)) {
      q = q.eq(key, value)
    }
  }

  const { data, error } = await q.select('id')
  if (error) throw new Error(`deleteOldRecords(${table}): ${error.message}`)
  return data?.length ?? 0
}

export async function archiveGoals(): Promise<number> {
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: goals, error: fetchErr } = await supabase()
    .from('goals')
    .select('*')
    .eq('status', 'completed')
    .lt('created_at', since.toISOString())

  if (fetchErr) throw new Error(`archiveGoals fetch: ${fetchErr.message}`)
  if (!goals?.length) return 0

  const { error: insertErr } = await supabase()
    .from('goals_archive')
    .insert(goals)

  if (insertErr) throw new Error(`archiveGoals insert: ${insertErr.message}`)

  const ids = goals.map((g) => g.id)
  const { error: delErr } = await supabase()
    .from('goals')
    .delete()
    .in('id', ids)

  if (delErr) throw new Error(`archiveGoals delete: ${delErr.message}`)
  return goals.length
}

// ── Design Audits (CDO) ──

export interface DesignAudit {
  id: string
  product_id: string | null
  audit_type: string
  area: string
  severity: string
  finding: string
  recommendation: string | null
  score: number | null
  resolved: boolean
  resolved_at: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getDesignAudits(
  productId?: string,
  resolved?: boolean
): Promise<DesignAudit[]> {
  let q = supabase()
    .from('design_audits')
    .select('*')
    .order('created_at', { ascending: false })

  if (productId) q = q.eq('product_id', productId)
  if (resolved !== undefined) q = q.eq('resolved', resolved)

  const { data, error } = await q
  if (error) throw new Error(`getDesignAudits: ${error.message}`)
  return data ?? []
}

export async function saveDesignAudit(audit: {
  product_id?: string
  audit_type: string
  area: string
  severity: string
  finding: string
  recommendation?: string
  score?: number
  metadata?: Record<string, unknown>
}): Promise<void> {
  const { error } = await supabase()
    .from('design_audits')
    .insert({
      product_id: audit.product_id ?? null,
      audit_type: audit.audit_type,
      area: audit.area,
      severity: audit.severity,
      finding: audit.finding,
      recommendation: audit.recommendation ?? null,
      score: audit.score ?? null,
      metadata: audit.metadata ?? null,
    })

  if (error) throw new Error(`saveDesignAudit: ${error.message}`)
}

export async function getDesignDebtSummary(): Promise<{
  total: number
  critical: number
  warning: number
  info: number
  by_area: Record<string, number>
}> {
  const { data, error } = await supabase()
    .from('design_audits')
    .select('severity, area')
    .eq('resolved', false)

  if (error) throw new Error(`getDesignDebtSummary: ${error.message}`)

  const items = data ?? []
  const byArea: Record<string, number> = {}
  let critical = 0, warning = 0, info = 0

  for (const item of items) {
    if (item.severity === 'critical') critical++
    else if (item.severity === 'warning') warning++
    else info++
    byArea[item.area] = (byArea[item.area] || 0) + 1
  }

  return { total: items.length, critical, warning, info, by_area: byArea }
}

export async function resolveDesignAudit(auditId: string): Promise<void> {
  const { error } = await supabase()
    .from('design_audits')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', auditId)

  if (error) throw new Error(`resolveDesignAudit: ${error.message}`)
}

// ── Surveys ──

export async function getSurveyResponses(surveySlug: string): Promise<{
  survey: { id: string; title: string; questions: unknown[] }
  responses: { answers: Record<string, unknown>; contact: string | null; created_at: string }[]
  total: number
}> {
  const { data: survey, error: surveyErr } = await supabase()
    .from('surveys')
    .select('id, title, questions')
    .eq('slug', surveySlug)
    .single()

  if (surveyErr || !survey) throw new Error(`getSurveyResponses: survey not found`)

  const { data: responses, error: respErr } = await supabase()
    .from('survey_responses')
    .select('answers, contact, created_at')
    .eq('survey_id', survey.id)
    .order('created_at', { ascending: false })

  if (respErr) throw new Error(`getSurveyResponses: ${respErr.message}`)

  return {
    survey,
    responses: responses ?? [],
    total: responses?.length ?? 0,
  }
}

export async function getSurveySummary(surveySlug: string): Promise<Record<string, unknown>> {
  const { survey, responses, total } = await getSurveyResponses(surveySlug)
  if (total === 0) return { total: 0, message: 'No hay respuestas aún' }

  const questions = survey.questions as { id: string; question: string; type: string; options?: string[] }[]
  const summary: Record<string, unknown> = { total_responses: total }

  for (const q of questions) {
    if (q.type === 'single' || q.type === 'multiple') {
      const counts: Record<string, number> = {}
      for (const r of responses) {
        const answer = r.answers[q.id]
        if (Array.isArray(answer)) {
          for (const a of answer) counts[a] = (counts[a] || 0) + 1
        } else if (typeof answer === 'string') {
          counts[answer] = (counts[answer] || 0) + 1
        }
      }
      // Sort by count descending
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
      summary[q.id] = { question: q.question, results: sorted, total_answers: sorted.reduce((s, e) => s + e[1], 0) }
    } else {
      // Text answers
      const texts = responses.map(r => r.answers[q.id]).filter(Boolean)
      summary[q.id] = { question: q.question, answers: texts, total_answers: texts.length }
    }
  }

  return summary
}

// ── Memories ──

export interface Memory {
  id: string
  category: string
  content: string
  source: string
  active: boolean
  created_at: string
}

export async function getMemories(category?: string): Promise<Memory[]> {
  let query = supabase()
    .from('memories')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw new Error(`getMemories: ${error.message}`)
  return (data ?? []) as Memory[]
}

export async function saveMemory(
  category: string,
  content: string,
  source: string = 'agent'
): Promise<void> {
  const { error } = await supabase()
    .from('memories')
    .insert({ category, content, source })

  if (error) throw new Error(`saveMemory: ${error.message}`)
}
