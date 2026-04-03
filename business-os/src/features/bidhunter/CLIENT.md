# BidHunter

> Scraping de oportunidades de licitación, scoring, generación de propuestas y KPIs de pipeline.

**Estado:** 🔨 En desarrollo
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)

---

## Tablas Supabase

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `bh_opportunities` | 024 | Oportunidades de licitación |
| `bh_opportunity_scores` | 024 | Scores de evaluación |
| `bh_tico_profile` | 024 | Perfil del contratista |
| `bh_pipeline_log` | 024 | Log del pipeline |
| `bh_bid_drafts` | 027 | Borradores de propuestas |
| `bh_kpi_snapshots` | 027 | Snapshots de KPIs |
| `bh_opportunity_documents` | 028 | Documentos PDF adjuntos |
| `bh_extracted_data` | 028 | Datos extraídos de PDFs |

## API Routes (`/api/bidhunter/`)

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/add` | POST | Agregar oportunidad |
| `/documents` | GET, POST | Gestión de documentos |
| `/documents/[id]` | GET, DELETE | Documento específico |
| `/documents/[id]/extract` | POST | Extraer datos de PDF |
| `/draft` | POST | Generar borrador de propuesta |
| `/import-extension` | POST | Import desde extensión Chrome |
| `/kpis` | GET | KPIs del pipeline |
| `/kpis/snapshot` | POST | Guardar snapshot de KPIs |
| `/opportunities` | GET | Listar oportunidades |
| `/profile` | GET, PUT | Perfil del contratista |
| `/score` | POST | Evaluar oportunidad |
| `/scrape` | POST | Scraping de sitios web |
| `/weekly-report` | GET | Reporte semanal |

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/bidhunter` | Standalone | Dashboard principal |
| `/bidhunter/add` | Standalone | Agregar oportunidad |
| `/bidhunter/import` | Standalone | Importar datos |
| `/bidhunter/scrape` | Standalone | Scraping web |
| `/bidhunter/kpis` | Standalone | Dashboard KPIs |
| `/bidhunter/profile` | Standalone | Perfil contratista |
| `/bidhunter/draft/[id]` | Standalone | Borrador de propuesta |
| `/bidhunter/proforma/[id]` | Standalone | Proforma |

## Agentes IA

| Agente | Archivo | Función |
|--------|---------|---------|
| Drafter | `drafter.ts` | Genera borradores de propuestas |
| Evaluator | `evaluator.ts` | Evalúa oportunidades |
| Scraper | `scraper.ts` | Scraping de sitios de licitación |
| PDF Extractor | `pdf-extractor.ts` | Extrae datos de PDFs |

## Estructura

```
bidhunter/
├── CLIENT.md
├── i18n.ts
├── agents/             (4 archivos)
├── components/         (1 archivo)
├── services/           (4 archivos)
├── types/              (1 archivo)
├── docs/
└── scripts/
```
