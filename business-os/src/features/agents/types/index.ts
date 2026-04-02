// Agent types for the Business OS 10-agent system

export type AgentSlug =
  | 'collector'
  | 'analyst'
  | 'cfo'
  | 'cto'
  | 'cmo'
  | 'cpo'
  | 'cdo'
  | 'ceo'
  | 'strategist'
  | 'journalist'
  | 'cleanup'
  | 'ghostwriter'

export type AgentTeam = 'strategic' | 'operational'

export type AlertSeverity = 'critical' | 'warning' | 'info'

export type DealStage = 'lead' | 'contacted' | 'demo' | 'proposal' | 'closed_won' | 'closed_lost'

export type GoalStatus = 'active' | 'completed' | 'archived' | 'cancelled'

export type BillingCycle = 'monthly' | 'annual'

export type ProductType = 'saas' | 'agency'

export interface AgentConfig {
  slug: AgentSlug
  name: string
  emoji: string
  team: AgentTeam
  schedule: string
  description: string
  reads: string[]
  writes: string[]
}

export interface Product {
  id: string
  name: string
  slug: string
  type: ProductType
  db_connection_string: string | null
  status: string
  created_at: string
}

export interface MetricSnapshot {
  id: string
  product_id: string
  metric_key: string
  value: number
  snapshot_date: string
  created_at: string
}

export interface AgentReport {
  id: string
  agent_slug: AgentSlug
  report_type: string | null
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Alert {
  id: string
  type: string
  severity: AlertSeverity
  product_id: string | null
  message: string
  data: Record<string, unknown> | null
  resolved: boolean
  resolved_at: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  entry_date: string
  content: string
  summary: string | null
  metrics_summary: Record<string, unknown> | null
  created_at: string
}

export interface DailyAction {
  id: string
  action_date: string
  action: string
  priority: number | null
  urgent: boolean
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface Goal {
  id: string
  title: string
  target_metric: string | null
  target_value: number | null
  current_value: number
  product_id: string | null
  deadline: string | null
  status: GoalStatus
  created_at: string
}

export interface CollectorError {
  id: string
  product_id: string | null
  error_message: string
  error_data: Record<string, unknown> | null
  retry_count: number
  resolved: boolean
  created_at: string
}

export interface Subscription {
  id: string
  name: string
  provider: string | null
  cost: number
  currency: string
  billing_cycle: BillingCycle
  product_id: string | null
  renewal_date: string | null
  status: string
  created_at: string
}

export interface Deal {
  id: string
  name: string
  company: string | null
  contact_email: string | null
  stage: DealStage
  value: number | null
  currency: string
  notes: string | null
  next_action: string | null
  next_action_date: string | null
  created_at: string
  updated_at: string
}

export interface IncomeEntry {
  id: string
  product_id: string | null
  amount: number
  currency: string
  description: string | null
  category: string | null
  entry_date: string
  created_at: string
}

export interface ExpenseEntry {
  id: string
  product_id: string | null
  amount: number
  currency: string
  description: string | null
  category: string | null
  entry_date: string
  created_at: string
}

export interface WeeklyReport {
  id: string
  week_number: number
  year: number
  content: string
  metrics_comparison: Record<string, unknown> | null
  projections: Record<string, unknown> | null
  created_at: string
}

export interface AgentRunResult {
  agent: AgentSlug
  success: boolean
  report?: string
  error?: string
  duration_ms: number
}
