# Videndum

> Planificación de producción, forecasting ML, análisis de varianza y radar competitivo.

**Estado:** 🔨 En desarrollo
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)

---

## Tablas Supabase

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `planning_forecasts` | 002 | Forecasts de planificación |
| `order_intake` | 003 | Intake de órdenes |
| `order_book` | 003 | Libro de órdenes |
| `opportunities` | 003 | Oportunidades de venta |
| `opportunities_unfactored` | 003 | Oportunidades sin ponderar |
| `opportunities_history` | 003 | Historial de oportunidades |
| `global_inventory` | 003 | Inventario global |
| `ml_forecast_predictions` | 007 | Predicciones ML |
| `uk_forecast_weekly` | 007 | Forecast semanal UK |
| `planning_adjustments` | 007 | Ajustes de planificación |
| `weekly_demand_actual` | 007 | Demanda real semanal |
| `competitor_activity_log` | 007 | Log de actividad competitiva |
| `ml_model_performance` | 007 | Performance del modelo ML |
| `sync_metadata` | 008 | Metadata de sincronización |
| `videndum_forecast` | 008 | Forecast Videndum |
| `competitor_analysis` | 008 | Análisis competitivo |
| `market_trends` | 008 | Tendencias de mercado |
| `product_obsolescence_scores` | 008 | Scores de obsolescencia |
| `ai_insights` | 008 | Insights generados por IA |
| `client_feedback` | 012 | Feedback del cliente |
| `client_requirements` | 013 | Requerimientos del cliente |
| `platform_redesign_feedback` | 014 | Feedback de rediseño |
| `client_discovery` | 015 | Discovery de clientes |

## API Routes (`/api/videndum/`)

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/analysis` | POST | Análisis profundo |
| `/analysis-ui` | POST | Datos para UI de análisis |
| `/analytics` | GET | Métricas y analytics |
| `/consultant` | POST | Chat estratégico IA |
| `/dashboard` | GET | Datos del dashboard |
| `/discovery` | GET, POST, PATCH | Formulario discovery |
| `/executive-summary` | POST | Resumen ejecutivo |
| `/feedback` | GET, POST | Feedback del cliente |
| `/forecast-adjustments` | GET | Ajustes de forecast |
| `/forecast-vs-real` | GET | Forecast vs demanda real |
| `/forecast-vs-real/export` | GET | Exportar datos |
| `/forecast-vs-real/timeseries` | GET | Series de tiempo |
| `/ingest` | POST | Ingesta de datos |
| `/intelligence` | POST | Motor de inteligencia |
| `/intelligence-ui` | POST | UI de inteligencia |
| `/ml-forecast` | GET | Forecast ML |
| `/platform-redesign` | GET, POST, PATCH | Rediseño de plataforma |
| `/production-planning` | GET | Planificación producción |
| `/requirements` | GET, POST, PATCH | Requerimientos |
| `/variance` | GET | Análisis de varianza |

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/videndum` | Autenticada | Dashboard principal |
| `/videndum/analisis` | Autenticada | Análisis profundo |
| `/videndum/planning` | Autenticada | Planificación producción |
| `/videndum/ml-forecast` | Autenticada | Forecast ML |
| `/videndum/feedback` | Autenticada | Formulario feedback |
| `/videndum/requirements` | Autenticada | Requerimientos |
| `/videndum/ingesta` | Autenticada | Ingesta de datos |
| `/videndum/redesign` | Autenticada | Rediseño plataforma |
| `/videndum/discovery` | Pública | Formulario discovery |

## Estructura

```
videndum/
├── CLIENT.md
├── brand.ts
├── components/         (24 archivos)
├── hooks/              (2 archivos)
├── services/           (2 archivos)
├── types/              (2 archivos)
├── docs/
└── scripts/
```
