'use client'

import { useState, useEffect, useCallback } from 'react'

export type Lang = 'en' | 'es'

const STORAGE_KEY = 'bidhunter-lang'

export function useLang(): [Lang, () => void] {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved === 'en' || saved === 'es') setLang(saved)
  }, [])

  const toggle = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'es' : 'en'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return [lang, toggle]
}

/* ── Diccionario ─────────────────────────────────────────────────────── */

const dict = {
  // ── Dashboard (page.tsx) ──
  bidhunter: { en: 'BidHunter', es: 'BidHunter' },
  subtitle: { en: 'Tico Restoration — Opportunity Pipeline', es: 'Tico Restoration — Pipeline de Oportunidades' },
  tico_profile: { en: 'Tico Profile', es: 'Perfil Tico' },
  score_new: { en: 'Score', es: 'Evaluar' },
  new_label: { en: 'New', es: 'Nuevas' },
  scrape_bc: { en: 'Scrape BC', es: 'Extraer BC' },
  total: { en: 'Total', es: 'Total' },
  scored: { en: 'Scored', es: 'Evaluadas' },
  interested: { en: 'Interested', es: 'Interesadas' },
  bid_sent: { en: 'Bid Sent', es: 'Oferta Enviada' },
  discarded: { en: 'Discarded', es: 'Descartadas' },
  avg_score: { en: 'Avg Score', es: 'Score Prom.' },
  pipeline_value: { en: 'Pipeline value', es: 'Valor del pipeline' },
  opportunities: { en: 'opportunities', es: 'oportunidades' },
  search_placeholder: { en: 'Search title, GC, description...', es: 'Buscar título, GC, descripción...' },
  all_status: { en: 'All Status', es: 'Todos los Estados' },
  min_score: { en: 'Min Score', es: 'Score Mínimo' },
  high: { en: 'High', es: 'Alto' },
  medium: { en: 'Medium', es: 'Medio' },
  low: { en: 'Low', es: 'Bajo' },
  all_states: { en: 'All States', es: 'Todos los Estados' },
  all_trades: { en: 'All Trades', es: 'Todos los Oficios' },
  clear: { en: 'Clear', es: 'Limpiar' },
  showing: { en: 'Showing', es: 'Mostrando' },
  of: { en: 'of', es: 'de' },
  no_opportunities: { en: 'No opportunities yet', es: 'Sin oportunidades aún' },
  scrape_to_pull: { en: 'Scrape BuildingConnected to pull opportunities automatically', es: 'Extrae de BuildingConnected para importar oportunidades automáticamente' },
  scrape_buildingconnected: { en: 'Scrape BuildingConnected', es: 'Extraer de BuildingConnected' },
  no_matches: { en: 'No matches for current filters', es: 'Sin resultados para los filtros actuales' },
  clear_filters: { en: 'Clear filters', es: 'Limpiar filtros' },
  unscored: { en: 'unscored', es: 'sin evaluar' },
  general_contractor: { en: 'General Contractor', es: 'Contratista General' },
  trades_required: { en: 'Trades Required', es: 'Oficios Requeridos' },
  location: { en: 'Location', es: 'Ubicación' },
  est_value: { en: 'Est. Value', es: 'Valor Est.' },
  deadline: { en: 'Deadline', es: 'Fecha Límite' },
  source: { en: 'Source', es: 'Fuente' },
  ai_score: { en: 'AI Score', es: 'Score IA' },
  matching_services: { en: 'Matching Services', es: 'Servicios Compatibles' },
  sdvosb_bonus: { en: '+15 SDVOSB bonus applied', es: '+15 bonus SDVOSB aplicado' },
  bid_estimate: { en: 'Bid Estimate', es: 'Estimado de Oferta' },
  exterior_painting: { en: 'Exterior painting', es: 'Pintura exterior' },
  interior_painting: { en: 'Interior painting', es: 'Pintura interior' },
  stucco_repairs: { en: 'Stucco repairs', es: 'Reparación de estuco' },
  high_rise_surcharge: { en: 'High-rise surcharge (+20%)', es: 'Recargo edificio alto (+20%)' },
  total_estimate: { en: 'Total Estimate', es: 'Estimado Total' },
  re_score: { en: 'Re-score', es: 'Re-evaluar' },
  not_scored_yet: { en: 'Not scored yet', es: 'Aún sin evaluar' },
  score_with_ai: { en: 'Score with AI', es: 'Evaluar con IA' },
  mark_interested: { en: 'Interested', es: 'Interesado' },
  mark_bid_sent: { en: 'Mark Bid Sent', es: 'Marcar Oferta Enviada' },
  discard: { en: 'Discard', es: 'Descartar' },
  reset: { en: 'Reset', es: 'Resetear' },
  view_on_bc: { en: 'View on BC', es: 'Ver en BC' },
  expired: { en: 'expired', es: 'expirado' },
  days_left: { en: 'd left', es: 'd restantes' },

  // ── Status labels ──
  status_new: { en: 'New', es: 'Nueva' },
  status_scored: { en: 'Scored', es: 'Evaluada' },
  status_interested: { en: 'Interested', es: 'Interesada' },
  status_discarded: { en: 'Discarded', es: 'Descartada' },
  status_bid_sent: { en: 'Bid Sent', es: 'Oferta Enviada' },
  status_won: { en: 'Won', es: 'Ganada' },
  status_lost: { en: 'Lost', es: 'Perdida' },

  // ── Won/Lost ──
  mark_won: { en: 'Mark Won', es: 'Marcar Ganada' },
  mark_lost: { en: 'Mark Lost', es: 'Marcar Perdida' },
  actual_value: { en: 'Actual Contract Value ($)', es: 'Valor Real del Contrato ($)' },
  loss_reason: { en: 'Loss Reason', es: 'Razón de Pérdida' },
  loss_reason_placeholder: { en: 'Price, timing, competitor...', es: 'Precio, tiempos, competidor...' },
  commission: { en: 'Commission', es: 'Comisión' },
  commission_pct: { en: 'Commission %', es: 'Comisión %' },
  confirm: { en: 'Confirm', es: 'Confirmar' },

  // ── Draft (Agente Redactor) ──
  draft_bid: { en: 'Draft Bid', es: 'Redactar Oferta' },
  draft_title: { en: 'Bid Draft Generator', es: 'Generador de Oferta' },
  generate_draft: { en: 'Generate Draft', es: 'Generar Borrador' },
  generating_draft: { en: 'Generating...', es: 'Generando...' },
  cover_letter: { en: 'Cover Letter', es: 'Carta de Presentación' },
  scope_of_work: { en: 'Scope of Work', es: 'Alcance del Trabajo' },
  pricing_breakdown: { en: 'Pricing Breakdown', es: 'Desglose de Precios' },
  total_amount: { en: 'Total Amount', es: 'Monto Total' },
  tone: { en: 'Tone', es: 'Tono' },
  professional: { en: 'Professional', es: 'Profesional' },
  aggressive: { en: 'Aggressive', es: 'Agresivo' },
  conservative: { en: 'Conservative', es: 'Conservador' },
  draft_language: { en: 'Draft Language', es: 'Idioma del Borrador' },
  regenerate: { en: 'Regenerate', es: 'Regenerar' },
  save_draft: { en: 'Save Draft', es: 'Guardar Borrador' },
  save_final: { en: 'Save & Mark Final', es: 'Guardar y Marcar Final' },
  draft_finalized: { en: 'Draft finalized — opportunity marked as Bid Sent', es: 'Borrador finalizado — oportunidad marcada como Oferta Enviada' },
  copy_clipboard: { en: 'Copy', es: 'Copiar' },
  version: { en: 'Version', es: 'Versión' },
  description: { en: 'Description', es: 'Descripción' },
  qty: { en: 'Qty', es: 'Cant.' },
  unit: { en: 'Unit', es: 'Unidad' },
  unit_price: { en: 'Unit Price', es: 'Precio Unit.' },
  line_total: { en: 'Total', es: 'Total' },

  // ── KPIs ──
  kpi_dashboard: { en: 'KPI Dashboard', es: 'Dashboard de KPIs' },
  win_rate: { en: 'Win Rate', es: 'Tasa de Ganancia' },
  response_rate: { en: 'Response Rate', es: 'Tasa de Respuesta' },
  commission_earned: { en: 'Commission', es: 'Comisión' },
  conversion_funnel: { en: 'Conversion Funnel', es: 'Embudo de Conversión' },
  weekly_trend: { en: 'Weekly Trends', es: 'Tendencias Semanales' },
  sdvosb_stats: { en: 'SDVOSB Performance', es: 'Rendimiento SDVOSB' },
  sdvosb_opps: { en: 'SDVOSB Opportunities', es: 'Oportunidades SDVOSB' },
  sdvosb_pct: { en: 'SDVOSB %', es: '% SDVOSB' },
  all_time: { en: 'All Time', es: 'Todo el Período' },
  quarter: { en: 'Quarter', es: 'Trimestre' },
  month: { en: 'Month', es: 'Mes' },
  week: { en: 'Week', es: 'Semana' },

  // ── Scrape page ──
  scrape_title: { en: 'Scrape BuildingConnected', es: 'Extraer de BuildingConnected' },
  scrape_subtitle: { en: 'Auto-import opportunities from the Bid Board', es: 'Importar oportunidades automáticamente del Bid Board' },
  bc_credentials: { en: 'BuildingConnected Credentials', es: 'Credenciales de BuildingConnected' },
  email: { en: 'Email', es: 'Correo' },
  password: { en: 'Password', es: 'Contraseña' },
  pages_to_scrape: { en: 'Pages to scrape', es: 'Páginas a extraer' },
  page_singular: { en: 'page', es: 'página' },
  pages_plural: { en: 'pages', es: 'páginas' },
  credentials_warning: { en: 'Credentials are NOT stored. They are used only during this scraping session and then discarded.', es: 'Las credenciales NO se almacenan. Solo se usan durante esta sesión de extracción y luego se descartan.' },
  start_scraping: { en: 'Start Scraping', es: 'Iniciar Extracción' },
  scraping_bc: { en: 'Scraping BuildingConnected...', es: 'Extrayendo de BuildingConnected...' },
  may_take: { en: 'This may take 30-60 seconds', es: 'Esto puede tomar 30-60 segundos' },
  working: { en: 'Working...', es: 'Procesando...' },
  scraped_label: { en: 'Scraped:', es: 'Extraídas:' },
  duplicates_skipped: { en: 'Duplicates skipped:', es: 'Duplicadas omitidas:' },
  go_score_them: { en: 'Go Score Them', es: 'Ir a Evaluarlas' },
  scrape_again: { en: 'Scrape Again', es: 'Extraer de Nuevo' },
  scraping_failed: { en: 'Scraping failed', es: 'La extracción falló' },
  try_again: { en: 'Try Again', es: 'Intentar de Nuevo' },

  // ── Add page ──
  quick_add: { en: 'Quick Add', es: 'Agregar Rápido' },
  add_subtitle: { en: 'Add opportunities from BuildingConnected', es: 'Agregar oportunidades de BuildingConnected' },
  added: { en: 'added', es: 'agregadas' },
  done: { en: 'Done', es: 'Listo' },
  one_by_one: { en: 'One by One', es: 'Una por Una' },
  bulk_paste: { en: 'Bulk Paste', es: 'Pegado Masivo' },
  saved: { en: 'Saved:', es: 'Guardado:' },
  project_title: { en: 'Project Title', es: 'Título del Proyecto' },
  gc_contact: { en: 'GC Contact', es: 'Contacto del GC' },
  city: { en: 'City', es: 'Ciudad' },
  state: { en: 'State', es: 'Estado' },
  building_sqft: { en: 'Building Sqft', es: 'Pies² del Edificio' },
  floors: { en: 'Floors', es: 'Pisos' },
  trades_click: { en: 'Trades Required (click to select)', es: 'Oficios Requeridos (clic para seleccionar)' },
  sdvosb_eligible: { en: 'SDVOSB Eligible (federal/diversity set-aside)', es: 'Elegible SDVOSB (federal/diversidad)' },
  scope_notes: { en: 'Scope Notes', es: 'Notas del Alcance' },
  scope_placeholder: { en: 'What you found in the finish schedule, drawings, scope of work...', es: 'Lo que encontraste en el schedule, planos, alcance del trabajo...' },
  save_next: { en: 'Save & Next', es: 'Guardar y Siguiente' },
  ctrl_enter: { en: 'Ctrl+Enter to save', es: 'Ctrl+Enter para guardar' },
  paste_spreadsheet: { en: 'Paste from spreadsheet or type manually', es: 'Pegar desde hoja de cálculo o escribir manualmente' },
  format_hint: { en: 'Tab-separated (from Excel/Sheets) or pipe-separated. One opportunity per line.', es: 'Separado por tabs (Excel/Sheets) o pipes. Una oportunidad por línea.' },
  rows: { en: 'rows', es: 'filas' },
  import_all: { en: 'Import All', es: 'Importar Todo' },

  // ── Import page ──
  import_opportunities: { en: 'Import Opportunities', es: 'Importar Oportunidades' },
  import_subtitle: { en: 'Upload CSV or JSON from BuildingConnected / PlanHub', es: 'Subir CSV o JSON de BuildingConnected / PlanHub' },
  drag_drop: { en: 'Drag & drop your file here', es: 'Arrastra y suelta tu archivo aquí' },
  csv_json_format: { en: 'CSV or JSON format', es: 'Formato CSV o JSON' },
  csv_format: { en: 'CSV Format', es: 'Formato CSV' },
  json_format: { en: 'JSON Format', es: 'Formato JSON' },
  cancel: { en: 'Cancel', es: 'Cancelar' },
  import_n: { en: 'Import', es: 'Importar' },
  title_col: { en: 'Title', es: 'Título' },
  gc_col: { en: 'GC', es: 'GC' },
  location_col: { en: 'Location', es: 'Ubicación' },
  value_col: { en: 'Value', es: 'Valor' },
  trades_col: { en: 'Trades', es: 'Oficios' },
  sdvosb_col: { en: 'SDVOSB', es: 'SDVOSB' },
  yes: { en: 'Yes', es: 'Sí' },
  showing_n_of: { en: 'Showing', es: 'Mostrando' },
  importing: { en: 'Importing', es: 'Importando' },
  opportunities_imported: { en: 'Opportunities Imported', es: 'Oportunidades Importadas' },
  ready_for_scoring: { en: 'Ready for AI scoring', es: 'Listas para evaluación IA' },
  go_to_pipeline: { en: 'Go to Pipeline', es: 'Ir al Pipeline' },

  // ── Profile page ──
  profile_title: { en: 'Tico Restoration Profile', es: 'Perfil Tico Restoration' },
  profile_subtitle: { en: 'Services, regions, and scoring preferences', es: 'Servicios, regiones y preferencias de scoring' },
  save: { en: 'Save', es: 'Guardar' },
  saved_btn: { en: 'Saved!', es: '¡Guardado!' },
  company_name: { en: 'Company Name', es: 'Nombre de la Empresa' },
  services_keywords: { en: 'Services & Keywords', es: 'Servicios y Palabras Clave' },
  add_service: { en: 'Add Service', es: 'Agregar Servicio' },
  service_name: { en: 'Service name', es: 'Nombre del servicio' },
  keywords_placeholder: { en: 'Keywords (comma-separated)', es: 'Palabras clave (separadas por coma)' },
  preferred_regions: { en: 'Preferred Regions', es: 'Regiones Preferidas' },
  preferred_states: { en: 'Preferred States', es: 'Estados Preferidos' },
  min_project_value: { en: 'Min Project Value ($)', es: 'Valor Mín. de Proyecto ($)' },
  max_project_value: { en: 'Max Project Value ($)', es: 'Valor Máx. de Proyecto ($)' },
  no_limit: { en: 'No limit', es: 'Sin límite' },
  sdvosb_boost: { en: 'SDVOSB Priority Boost (points)', es: 'Bonus Prioridad SDVOSB (puntos)' },
  sdvosb_boost_desc: { en: 'Extra points added to score for SDVOSB-eligible federal projects', es: 'Puntos extra agregados al score para proyectos federales elegibles SDVOSB' },
  pricing_formulas: { en: 'Pricing Formulas', es: 'Fórmulas de Precio' },
  pricing_desc: { en: 'Rates used to auto-estimate bids when scoring opportunities', es: 'Tarifas usadas para auto-estimar ofertas al evaluar oportunidades' },
  ext_painting_rate: { en: 'Exterior Painting ($/sqft)', es: 'Pintura Exterior ($/pie²)' },
  int_painting_rate: { en: 'Interior Painting ($/sqft)', es: 'Pintura Interior ($/pie²)' },
  stucco_rate: { en: 'Stucco Repairs ($/sqft)', es: 'Reparación Estuco ($/pie²)' },
  includes_materials: { en: 'Includes materials', es: 'Incluye materiales' },
  high_rise_pct: { en: 'High-Rise Surcharge (%)', es: 'Recargo Edificio Alto (%)' },
  high_rise_threshold: { en: 'High-Rise Floor Threshold', es: 'Umbral de Pisos Edificio Alto' },
  high_rise_threshold_desc: { en: 'Extra equipment required above this number of floors', es: 'Equipo extra requerido por encima de este número de pisos' },
  no_profile: { en: 'No Tico profile found. Run the database migration first.', es: 'No se encontró perfil de Tico. Ejecuta la migración de base de datos primero.' },
  applied_above: { en: 'Applied to buildings over', es: 'Aplicado a edificios de más de' },
  floors_word: { en: 'floors', es: 'pisos' },

  // ── Language toggle ──
  lang_en: { en: 'EN', es: 'EN' },
  lang_es: { en: 'ES', es: 'ES' },
} as const

export type DictKey = keyof typeof dict

export function t(key: DictKey, lang: Lang): string {
  return dict[key]?.[lang] ?? key
}
