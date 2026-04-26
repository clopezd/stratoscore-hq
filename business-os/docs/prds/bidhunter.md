---
client: bidhunter
status: in_progress
created: 2026-04-25
---

# PRD — BidHunter

## Objetivo

Carlos gana 5% de comisión sobre proyectos de pintura/coatings que cierre Tico Restoration (familiar) en BuildingConnected. BidHunter automatiza el proceso de 14 pasos manuales: scraping del Bid Board, scoring con IA según servicios de Tico, generación del Bid Form Excel listo para subir, y seguimiento del pipeline hasta won/lost para calcular comisión real.

## Hitos

### Scraping & Ingesta
- [x] Chrome Extension v1.3.0 — scraper del Bid Board
- [x] Endpoint `/api/bidhunter/import-extension` con dedup
- [x] Detección de SDVOSB y trades requeridos
- [x] Quick scan + Deep scan (relevance score)
- [ ] Auto-scrape diario sin intervención del usuario

### Scoring & Evaluación
- [x] Evaluator IA (Claude/Gemini) con perfil Tico
- [x] PDF extractor (finish schedule, sqft)
- [x] Bid estimate geométrico (fallback)
- [x] Alerta Telegram score ≥80 con link al brief
- [ ] Re-scoring automático si llegan nuevos PDFs

### Bid Form
- [x] Generador Excel con pricing Tico ($2.10 ext, $2.35 int, $15 stucco, 7% tax)
- [x] High-rise surcharge >4 pisos
- [x] Download desde Chrome Extension en página de BC (1 click)
- [ ] Validación humana de pricing antes de descarga (preview en UI)

### Pipeline & Comisión
- [x] Status: new → scored → interested → bid_sent → won/lost
- [x] Modal Won con `commission_pct` editable (default 5%)
- [x] Modal Lost con `loss_reason`
- [x] KPIs dashboard
- [x] Snapshot semanal de KPIs
- [x] Weekly Report Telegram lunes 8am EST
- [ ] Tablero de comisión esperada vs cobrada
- [ ] Sync automático de status desde BC (won/lost) cuando esté disponible

### Onboarding & E2E
- [ ] Validación E2E con Scott McDonald en un bid real ganado
- [ ] Documentación de operación para que Tico opere solo con la herramienta
