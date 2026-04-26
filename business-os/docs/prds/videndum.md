---
client: videndum
status: in_progress
created: 2026-04-25
---

# PRD — Videndum

## Objetivo

Reemplazar el proceso de planificación manual de Videndum (UK + ML forecast desincronizados) con una herramienta unificada que: (1) presente la matriz run-rate semanal a 13 semanas por SKU, (2) explique automáticamente por qué la varianza ML vs UK es lo que es, (3) sugiera ajustes con justificación y los registre como decisiones, (4) detecte amenazas competitivas estructurales antes de que pierdan participación.

## Hitos

### Run Rate Matrix
- [x] Matriz semanal 13 semanas con export Excel
- [x] Interpretación automática por SKU
- [x] Run rate solo histórico
- [x] Calendario real para semanas (no 1..13)
- [x] Bandeja de decisiones pendientes colapsada
- [x] Paginación real (>100 SKUs)
- [x] Clasificación ABC-XYZ + Lifecycle por SKU
- [x] MAPE histórico
- [x] Capacity check
- [ ] Capacity check trimestral con alertas a planta
- [ ] Comparativo SKU vs SKU para canibalización

### Forecasting & Análisis
- [ ] Reentrenamiento ML automático mensual
- [ ] Explicación causal de varianza ML vs UK por SKU (LLM con contexto)
- [ ] Histórico de decisiones con resultado real (cerrar el loop)
- [ ] Dashboard ejecutivo con KPIs forecast accuracy

### Competencia
- [ ] Radar competitivo: detectar amenazas estructurales
- [ ] Alertas en Telegram cuando un competidor lanza producto en categoría D-Pro

### Integraciones
- [ ] Integración con SAP para pull de demanda real
- [ ] Webhook desde portal cliente para registrar decisiones aprobadas

### Estado del módulo
- [x] Tablas Supabase activas
- [x] APIs core (`/api/videndum/*`)
- [x] UI en `/videndum`
- [ ] Documentación de operación para Carlos
- [ ] Onboarding para usuario final de Videndum
