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
