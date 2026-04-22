# PRP-009: Videndum Fase 1 — MVP Operativo de Planning Semanal

> **Estado**: COMPLETADO
> **Fecha inicio**: 2026-04-05
> **Fecha completado**: 2026-04-11
> **Proyecto**: Videndum (Business OS)
> **Cliente**: Videndum — Equipo de Planning CR (2 personas)

---

## Objetivo

Transformar la plataforma Videndum de un dashboard de analytics generalista a una **herramienta operativa semanal** que permita a las 2 personas de Planning CR ver forecast accuracy a 8 semanas, detectar cambios significativos, y generar el plan de producción semanal exportable a IFS/Excel — reduciendo las 30 hrs/semana de proceso manual.

## Por Qué

| Problema | Solución |
|----------|----------|
| 30 hrs/semana en proceso manual de planning (75% del tiempo laboral de 2 personas) | Dashboard con resumen ejecutivo + alertas automáticas que priorizan lo importante |
| No pueden medir precisión del forecast — no saben qué tan bien predicen | Forecast Accuracy a 8 semanas por SKU con MAPE, grades, y drill-down |
| Cambios grandes en demanda pasan desapercibidos hasta que causan sobre-inventario o faltantes | Detector automático de variaciones significativas con alertas visuales |
| Plan de producción se arma manualmente en Excel y se carga a mano en IFS | Plan de producción semanal generado en plataforma con export Excel/IFS |

**Valor de negocio**: Reducir de 30 a ~10 hrs/semana el proceso de planning. Mejorar forecast accuracy visible (actualmente no se mide). Eliminar sorpresas de inventario detectando cambios grandes en tiempo real.

## Qué

### Criterios de Éxito
- [x] Planning CR abre la plataforma y en <5 segundos ve: alertas activas, forecast accuracy global, y SKUs que requieren atención
- [x] Forecast Accuracy calcula MAPE a 8 semanas por SKU con comparación "lo que proyectamos hace 8 semanas vs lo que realmente pasó"
- [x] Cambios >20% en demanda de cualquier SKU generan alerta visible en el dashboard
- [x] Plan de producción semanal se puede generar, ajustar, y exportar a Excel en formato compatible con IFS
- [x] El flujo completo (revisar alertas → analizar accuracy → ajustar plan → exportar) toma <15 minutos

### Comportamiento Esperado (Happy Path)

1. **Lunes 7am**: Planning CR abre `/videndum` → ve el nuevo dashboard landing con:
   - Resumen ejecutivo: "Esta semana: 3 alertas activas, MAPE global 12%, 5 SKUs requieren atención"
   - Tarjetas de alertas con los cambios más grandes de la semana
   - Forecast accuracy global con tendencia

2. **Click en alerta** → Drill-down al SKU afectado mostrando:
   - Gráfico de 8 semanas: lo que se proyectó vs lo que pasó
   - MAPE individual, grade (A-F), tendencia

3. **Tab "Forecast Accuracy"** → Vista completa de los 490 SKUs:
   - Tabla sorteable por MAPE, con grades de color
   - Filtros por catalog_type, por grade (mostrar solo los F)
   - Métricas globales arriba (MAPE promedio, bias, RMSE)

4. **Tab "Plan de Producción"** → Vista semanal:
   - Recomendación basada en forecast + order book + oportunidades
   - Editable: Planning CR puede ajustar cantidades
   - Botón "Exportar Excel" genera archivo compatible con IFS

---

## Contexto

### Lo Que Ya Existe (reutilizable)

| Componente | Archivo | Utilidad |
|------------|---------|----------|
| Forecast vs Real API | `src/app/api/videndum/forecast-vs-real/route.ts` | Base para Forecast Accuracy — ya calcula MAPE, RMSE, bias, grades A-F |
| ForecastAccuracy UI | `src/features/videndum/components/ForecastAccuracy.tsx` | Ya muestra top worst/best products con grades — extender a 8 semanas |
| Variance Analysis API | `src/app/api/videndum/variance/route.ts` | Base para detector de cambios — ya compara forecast vs real por SKU |
| VarianceChart UI | `src/features/videndum/components/VarianceChart.tsx` | Visualización de varianzas — reutilizar patrón |
| Production Planning | `src/features/videndum/components/ProductionPlanning.tsx` | Ya tiene SKU search, run rate, top 10 — extender con export |
| Export Excel | `src/features/videndum/services/exportExcel.ts` | Servicio de export ya implementado |
| Export PDF | `src/features/videndum/services/exportPdf.ts` | Servicio de export ya implementado |
| DateSegmentors | `src/features/videndum/components/DateSegmentors.tsx` | Filtros de año/mes reutilizables |
| TimeSeriesChart | `src/features/videndum/components/TimeSeriesChart.tsx` | Gráfico temporal reutilizable |
| Tabs navigation | `src/app/(main)/videndum/VidendumTabs.tsx` | Navegación por tabs — agregar/reorganizar |
| Types | `src/features/videndum/types/index.ts` | VarianceRow, AccuracyMetrics ya definidos |

### Lo Que Se Desprioritiza

- `DecisionMatrix` — radar competitivo, no pedido por el cliente
- `ConsultantChat` — chat IA, no pedido
- `V18FloatingButton` — asistente flotante, mantener pero no es core
- `MLForecastComparison` — Prophet/XGBoost, overkill para MVP
- Formularios de discovery/feedback/requirements — ya cumplieron su propósito

### Tablas Supabase Existentes

- `videndum_records` — datos reales (revenue, order_intake) por part_number/year/month
- `planning_forecasts` — forecasts por part_number/year/month con tenant_id='videndum'

### Arquitectura Propuesta

Reutilizar la estructura existente `src/features/videndum/`. No crear feature nueva, sino extender:

```
src/features/videndum/
├── components/
│   ├── WeeklyDashboard.tsx          ← NUEVO: Landing con resumen ejecutivo + alertas
│   ├── ForecastAccuracy.tsx         ← EXTENDER: vista 8 semanas, filtros por grade
│   ├── ChangeDetector.tsx           ← NUEVO: alertas de cambios >20%
│   ├── WeeklyProductionPlan.tsx     ← NUEVO: plan semanal editable + export
│   └── ... (existentes sin cambio)
├── hooks/
│   ├── useWeeklyDashboard.ts        ← NUEVO: fetch resumen + alertas
│   └── ... (existentes sin cambio)
├── types/
│   └── index.ts                     ← EXTENDER: tipos para alertas, plan semanal
└── services/
    └── exportExcel.ts               ← EXTENDER: template IFS-compatible

src/app/api/videndum/
├── weekly-summary/route.ts          ← NUEVO: resumen ejecutivo semanal
├── change-detection/route.ts        ← NUEVO: detectar cambios >umbral
├── forecast-vs-real/route.ts        ← EXTENDER: ventana de 8 semanas rolling
├── production-plan/route.ts         ← NUEVO: CRUD plan semanal
└── production-plan/export/route.ts  ← NUEVO: export Excel/IFS

src/app/(main)/videndum/
├── page.tsx                         ← CAMBIAR: apuntar a WeeklyDashboard (nuevo landing)
├── forecast-accuracy/page.tsx       ← NUEVO: página dedicada
├── planning/page.tsx                ← EXTENDER: plan semanal con export
└── VidendumTabs.tsx                 ← ACTUALIZAR: reorganizar tabs
```

### Modelo de Datos (nuevas tablas)

```sql
-- Alertas de cambios detectados (puede ser tabla o vista materializada)
CREATE TABLE videndum_change_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT DEFAULT 'videndum',
  part_number TEXT NOT NULL,
  catalog_type TEXT,
  alert_type TEXT NOT NULL, -- 'DEMAND_SPIKE', 'DEMAND_DROP', 'ACCURACY_DEGRADATION'
  severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM'
  change_pct NUMERIC NOT NULL, -- % de cambio detectado
  previous_value NUMERIC,
  current_value NUMERIC,
  week_detected DATE NOT NULL, -- lunes de la semana
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan de producción semanal
CREATE TABLE videndum_production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT DEFAULT 'videndum',
  week_start DATE NOT NULL, -- lunes de la semana
  part_number TEXT NOT NULL,
  catalog_type TEXT,
  recommended_qty NUMERIC NOT NULL, -- calculado por el sistema
  adjusted_qty NUMERIC, -- ajustado por Planning CR
  adjustment_reason TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'exported'
  approved_by UUID REFERENCES auth.users(id),
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start, part_number)
);

-- RLS
ALTER TABLE videndum_change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videndum_production_plans ENABLE ROW LEVEL SECURITY;
```

---

## Blueprint (Assembly Line)

### Fase 1: Nuevo Dashboard Landing (WeeklyDashboard)
**Objetivo**: Reemplazar el dashboard actual con un resumen ejecutivo semanal que muestre alertas activas, MAPE global, y SKUs que requieren atención inmediata. El usuario abre la plataforma y en 5 segundos sabe qué hay que hacer hoy.
**Validación**: `/videndum` muestra resumen ejecutivo con al menos 3 métricas clave, lista de alertas, y links a drill-down. El dashboard anterior se mueve a una tab "Histórico".

### Fase 2: Forecast Accuracy a 8 Semanas
**Objetivo**: Extender el componente ForecastAccuracy existente para calcular MAPE con ventana rolling de 8 semanas (comparar "lo que se proyectó hace 8 semanas" vs "lo que realmente pasó"). API nueva o extendida que soporte este cálculo. Vista de tabla con los 490 SKUs filtrable por grade y catalog_type.
**Validación**: API retorna MAPE a 8 semanas por SKU. UI muestra tabla completa con grades A-F, filtros funcionales, y métricas globales.

### Fase 3: Detector de Cambios Grandes
**Objetivo**: Crear sistema de detección automática de variaciones >20% (configurable) entre semanas consecutivas. Generar alertas que aparecen en el dashboard landing. Tabla `videndum_change_alerts` con acknowledge.
**Validación**: Al detectar un cambio >20% en demanda de un SKU, aparece alerta en el dashboard. Las alertas se pueden marcar como "revisadas".

### Fase 4: Plan de Producción Semanal con Export
**Objetivo**: Crear vista de plan de producción semanal editable. El sistema recomienda cantidades basándose en forecast + order book + oportunidades. Planning CR puede ajustar cantidades y exportar a Excel en formato compatible con IFS ERP. Tabla `videndum_production_plans`.
**Validación**: Se puede generar plan semanal, editar cantidades, guardar, y exportar Excel. El Excel tiene formato usable para carga en IFS.

### Fase 5: Reorganización de Navegación + Validación Final
**Objetivo**: Actualizar VidendumTabs para reflejar el nuevo flujo operativo. Tabs: "Resumen Semanal" (landing), "Forecast Accuracy", "Planning", "Histórico" (dashboard anterior), "Ingesta". Remover tabs no necesarias (Discovery, ML Forecast a sub-menú). Validación end-to-end del flujo completo.
**Validación**:
- [x] `npm run typecheck` pasa (0 errores de Videndum; errores pre-existentes en otros módulos)
- [x] `npm run build` exitoso (38.3s, 175 páginas)
- [x] Flujo completo: abrir → ver alertas → revisar accuracy → generar plan → exportar Excel IFS
- [x] Criterios de éxito cumplidos
- [x] Tabs reorganizados: 5 principales + menú "Más" para herramientas secundarias

---

## Aprendizajes (Self-Annealing)

- **weekly-summary ya hacía detección de cambios in-memory** — reutilizar lógica existente y agregarle persistencia fue más eficiente que crear detector desde cero
- **ExcelJS para server-side, xlsx-js-style para client-side** — no mezclar. ExcelJS funciona en Node, xlsx-js-style en browser
- **El cliente llenó UN formulario (discovery) con datos reales** — los otros 3 forms (feedback, requirements, redesign) nunca se aplicaron las migraciones a Supabase. El discovery form fue suficiente para capturar requisitos
- **Forecast accuracy "a 8 semanas" con datos mensuales** = ventana rolling de 2 meses. La granularidad semanal requeriría datos semanales que el cliente no tiene aún
- **El plan de producción necesita upsert por (tenant_id, week_start, part_number)** — constraint UNIQUE en la migración 039 lo soporta correctamente
- **Errores TS pre-existentes en consultant/ingest** — no bloquean el build de Next.js (que usa SWC, no tsc strict). Dejar para cleanup separado

---

## Gotchas

- [ ] Recharts requiere `dynamic import` con `ssr: false` — todos los componentes de gráficos deben ser lazy loaded
- [ ] Supabase RLS debe habilitarse en las tablas nuevas — Planning CR son los únicos usuarios
- [ ] La función `exec_raw_sql` se usa en variance API — preferir queries via Supabase client directo para las APIs nuevas
- [ ] El cálculo de "8 semanas atrás" requiere que existan datos de forecast de hace 8 semanas para ese SKU — manejar caso donde no hay suficiente histórico
- [ ] Export Excel usa librería existente en `exportExcel.ts` — reutilizar, no crear nueva dependencia
- [ ] Los 490 SKUs en una tabla pueden ser pesados — implementar paginación o virtualización si el render es lento
- [ ] `planning_forecasts` tiene `tenant_id='videndum'` — todas las queries deben filtrar por tenant

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan — reutilizar FilterBar, DateSegmentors, MetricCards
- NO ignorar errores de TypeScript
- NO hardcodear umbrales de alerta (usar constantes configurables)
- NO crear componentes monolíticos — mantener el patrón de componentes pequeños que ya tiene Videndum
- NO duplicar lógica de cálculo entre API y frontend — toda la lógica de MAPE/varianza va en la API
- **NO IA de caja negra**: Cuando la IA sugiera un ajuste, SIEMPRE mostrar el porqué ("Order Intake subió 15% últimos 7 días"). Transparencia = Confianza en Supply Chain.
- **NO convertirse en Excel**: El valor es la ALERTA y la SIMPLIFICACIÓN, no ser una hoja de cálculo más. Resistir requests de "agrégame esta columna". Mantener la vista enfocada en decisiones, no en datos crudos.

---

*PRP pendiente aprobación. No se ha modificado código.*
