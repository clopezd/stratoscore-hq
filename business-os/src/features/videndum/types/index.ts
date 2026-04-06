export type CatalogType = 'all' | 'INV' | 'PKG'
export type YearRange = 'all' | '3y' | '5y'

export interface VidendumFilters {
  catalogType: CatalogType
  yearRange: YearRange
}

export interface AnnualRow {
  year: number
  revenue: number
  order_intake: number
  book_to_bill: number
}

export interface SeasonalityRow {
  month: number
  avg_revenue: number
}

export interface TopPartRow {
  part_number: string
  catalog_type: string | null
  total_revenue: number
  total_intake: number
}

export interface VidendumKPIs {
  total_revenue: number
  cagr_pct: number
  cv_pct: number        // coef. variación anual
  avg_b2b: number
  peak_month: number    // 1-12
  year_from: number
  year_to: number
}

// ── Analytics (videndum_full_context) ────────────────────────────────────────

export interface MonthlyIntakeRow {
  month: number
  label: string          // 'Ene', 'Feb'…
  revenue_qty: number
  order_intake_qty: number
  book_to_bill: number | null
}

export interface PipelineRow {
  part_number: string
  catalog_type: string | null
  order_book_qty: number
  opportunities_qty: number
  opp_unfactored_qty: number
  pipeline_factor_pct: number | null
}

export interface AnalyticsKPIs {
  current_b2b: number | null        // B2B del último mes con datos
  current_month: number
  current_year: number
  total_order_book: number
  total_opportunities: number       // ponderadas
  total_opp_unfactored: number      // brutas
  coverage_ratio: number | null     // order_book / revenue (últimos 12m)
}

export interface AnalyticsData {
  monthly: MonthlyIntakeRow[]
  pipeline: PipelineRow[]
  kpis: AnalyticsKPIs
}

// ── Decision Matrix (Radar de Inteligencia Competitiva) ───────────────────────

export interface RiskEntry {
  part_number: string | null
  segment: string
  risk_type: 'OBSOLESCENCIA' | 'COMPETENCIA_CHINA' | 'SUSTITUCIÓN_IP' | 'DEMANDA_LATENTE' | 'GOING_CONCERN'
  severity: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA'
  competitor_threat: string | null
  competitor_advantage?: string      // ventaja estructural del competidor (precio/lead_time/región/canal)
  forecast_impact?: string           // por qué el DPRO falla en predecir este riesgo — CRÍTICO para gerente de planta
  evidence: string
  immediate_action: 'LIQUIDAR' | 'PROVISIONAR' | 'VIGILAR' | 'MANTENER'
}

export interface OpportunityEntry {
  segment: string
  market_trend: string
  cagr: string | null
  videndum_asset: string
  current_exploitation: 'SUBUTILIZADA' | 'BIEN_EXPLOTADA' | 'SIN_EXPLOTAR'
  gap: string
  recommendation: string
}

export interface ActionEntry {
  target: string
  type: 'SKU' | 'SEGMENTO' | 'MARCA'
  decision: 'LIQUIDAR' | 'PROVISIONAR' | 'VENDER_CANAL' | 'MANTENER' | 'INVERTIR' | 'VIGILAR'
  rationale: string
  urgency: 'INMEDIATA' | 'Q2_2026' | 'H2_2026' | '2027+'
}

export interface DecisionMatrixData {
  snapshot_date: string
  executive_summary: string
  risk_matrix: RiskEntry[]
  opportunity_matrix: OpportunityEntry[]
  action_table: ActionEntry[]
}

export interface VarianceRow {
  part_number: string
  catalog_type: string | null
  actual_qty: number
  forecast_qty: number
  variance_pct: number   // (actual - forecast) / forecast * 100
  matched_months: number
}

export interface VidendumDashboardData {
  annual: AnnualRow[]
  seasonality: SeasonalityRow[]
  top_parts: TopPartRow[]
  kpis: VidendumKPIs
}

// ── Weekly Dashboard (MVP Operativo) ────────────────────────────────────────

export interface WeeklyAlert {
  part_number: string
  catalog_type: string | null
  alert_type: 'DEMAND_SPIKE' | 'DEMAND_DROP' | 'ACCURACY_DEGRADATION'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  change_pct: number
  previous_value: number
  current_value: number
  period: string // "2026-M02 vs 2026-M01"
}

export interface WeeklyKPIs {
  mape_global: number           // MAPE últimos 2 meses (≈8 semanas)
  mape_prev: number | null      // MAPE del período anterior (para tendencia)
  mape_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  total_skus_analyzed: number
  skus_with_alerts: number
  total_order_book: number
  total_order_intake: number
  forecast_bias: number         // positivo = sobre-forecast
  period_label: string          // "Feb-Mar 2026"
}

export interface SkuAccuracy {
  part_number: string
  catalog_type: string | null
  mape: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  forecast_qty: number
  real_qty: number
  variance_pct: number
  months_compared: number
}

export interface WeeklySummaryData {
  kpis: WeeklyKPIs
  alerts: WeeklyAlert[]
  worst_skus: SkuAccuracy[]
  best_skus: SkuAccuracy[]
  accuracy_distribution: { grade: string; count: number; pct: number }[]
  available_periods: string[] // ['2026-02', '2026-01', '2025-12', ...]
}
