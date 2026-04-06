# Videndum — Resumen Ejecutivo del Discovery

> Basado en las respuestas del cliente (2026-04-06)
> Record ID: `66ce812f-23b7-4f87-aa53-79ec4d582342`

---

## 1. El Cliente en Números

| Dato | Valor |
|------|-------|
| SKUs activos | 490 |
| Horizonte de forecast | 7 meses (~15 semanas operativas) |
| Datos históricos | Desde 2018 (~8 años) |
| Equipo de planning | 2 personas (Costa Rica) |
| Nivel técnico | Avanzado (Excel + Power BI) |
| Herramientas actuales | Excel + IFS ERP |
| Horas semanales en forecast | **30 horas/semana** |
| Quién hace forecast | Planning CR |
| Quién aprueba | Equipo SI&OP |
| Frecuencia de aprobación | Semanal |

---

## 2. Proceso Actual (cómo trabajan HOY)

> "Cada 3 meses nos envía el runrate por productos y lo introducimos en el sandpit. Semanalmente revisamos inventarios, order book, order intake, oportunidades. Con esto vamos definiendo el plan de producción de la planta."

**Ciclo:**
1. Reciben runrate trimestral por producto
2. Lo cargan en el sandpit (Excel)
3. Semanalmente revisan: inventarios, order book, order intake, oportunidades
4. Definen plan de producción
5. Explosionan en IFS ERP para compra de componentes

**Dolor clave:** 30 horas semanales entre 2 personas = **75% del tiempo laboral** dedicado a un proceso manual.

---

## 3. Los 3 Problemas Principales

### Problema #1: Proceso manual y poco preciso
- Todo el proceso de revisar información y definir plan de producción es manual
- Hay un Excel con fórmulas, pero insertar información y analizar comportamiento es a mano
- Pierden tiempo "procesando y arreglando información"

### Problema #2: Inventarios altos, compras tardes, cortos de producción
- El proceso lento causa decisiones tardías
- Resultado: sobre-inventario en unos SKUs, faltantes en otros
- Compras de componentes llegan tarde

### Problema #3: (no especificado, pero implícito)
- Falta de visibilidad en tiempo real
- No pueden anticipar problemas hasta que explotan

---

## 4. Lo Que Necesitan Ver

| Métrica clave | Prioridad |
|---------------|-----------|
| Precisión del forecast a 8 semanas | CRÍTICA |
| Forecast vs ejecutados | CRÍTICA |
| Detalle por SKU individual | ALTA |
| Semanas actuales vs proyectado hace 8 semanas | ALTA |

**Comparaciones:** Forecast vs Real (lo único que pidieron explícitamente)

---

## 5. Decisiones Que Toman

| Frecuencia | Decisión |
|------------|----------|
| **Diaria** | ¿Qué producir? |
| **Semanal** | Ajustar plan de producción para explosionar el ERP y compra de componentes |
| **Mensual** | Cumplimiento del plan para satisfacer órdenes de clientes y nivel de inventario correcto |

**Urgencia:** Semanal (decisiones deben tomarse en la misma semana)

---

## 6. Flujo de Trabajo Ideal (lo que quieren)

> "Entrar, ver resumen con propuestas para tomar decisiones, analizar riesgos y definir el plan de producción para empezar con la carga al ERP."

**Traducido a features:**
1. Dashboard de entrada con resumen ejecutivo
2. Propuestas automáticas (IA sugiere ajustes al plan)
3. Análisis de riesgos visual (qué SKUs están en peligro)
4. Definir plan de producción en la plataforma
5. Exportar/cargar al IFS ERP

---

## 7. Features Requeridas

### IMPRESCINDIBLES (must-have)
- Ver cambios grandes con impacto en el plan de producción

### DESEABLES (nice-to-have)
- Dashboard
- Notificaciones

### ÉXITO definido por el cliente
> "El forecast accuracy, con un pronóstico automático basado en la información actual"

---

## 8. Gap Analysis: Lo Que Tenemos vs Lo Que Necesitan

### YA CONSTRUIDO (puede reutilizarse)
| Feature | Estado | Match con necesidad |
|---------|--------|---------------------|
| Dashboard histórico (2020-2025) | ✅ | Parcial — tiene datos pero no el resumen ejecutivo que quieren |
| KPIs (Revenue, CAGR, CoV, B2B) | ✅ | Bajo — no son las métricas que pidieron |
| Gráficos de estacionalidad | ✅ | Medio — útil para contexto |
| Variance analysis | ✅ | ALTO — es exactamente forecast vs real |
| Forecasting (linear regression) | ✅ | Medio — necesita mejorar a 8 semanas |
| DecisionMatrix (radar competitivo) | ✅ | Bajo — no lo pidieron |
| Formularios cliente | ✅ | Completado — ya no se necesitan más |
| Export PDF/Excel | ✅ | ALTO — necesitan sacar datos |
| Analytics (revenue vs intake) | ✅ | ALTO — directamente relevante |

### FALTA CONSTRUIR (prioridad según discovery)

| Feature | Prioridad | Justificación |
|---------|-----------|---------------|
| **Forecast Accuracy a 8 semanas** | P0 | Es LA métrica que pidieron. MAPE por SKU, comparando proyección de hace 8 semanas vs real |
| **Resumen ejecutivo con alertas** | P0 | "Entrar y ver resumen con propuestas" — landing page con lo importante del día |
| **Detección de cambios grandes** | P0 | Must-have explícito: "ver cambios grandes con impacto en el plan" |
| **Plan de producción semanal** | P1 | Salida del proceso — qué producir esta semana |
| **Propuestas automáticas (IA)** | P1 | "Propuestas para tomar decisiones" — Claude sugiere ajustes |
| **Análisis de riesgos por SKU** | P1 | "Analizar riesgos" — inventarios altos, faltantes, compras tardes |
| **Integración IFS/Excel** | P2 | Import/export con su ERP y hojas de cálculo |
| **Notificaciones** | P3 | Nice-to-have — alertas cuando algo requiere atención |

### CONSTRUIDO PERO NO NECESARIO (desprioritizar)
- Radar competitivo (DecisionMatrix) — no lo pidieron
- Consultant Chat IA — no lo pidieron
- Client feedback/requirements/redesign forms — ya cumplieron su propósito
- ML Forecast (Prophet/XGBoost) — overkill para lo que necesitan ahora

---

## 9. Redirección Estratégica del Proyecto

### ANTES (lo que estábamos construyendo)
- Plataforma de analytics generalista
- Inteligencia competitiva + forecasting ML
- Múltiples agents de IA (competitor, market trends, obsolescence)
- Formularios de captura extensos

### AHORA (lo que el cliente realmente necesita)
- **Herramienta operativa semanal** para 2 personas
- Forecast accuracy a 8 semanas por SKU
- Alertas de cambios grandes
- Plan de producción → exportar a IFS
- Simple, directo, accionable

### CAMBIO DE ENFOQUE
```
De: "Plataforma de BI con IA y analytics avanzado"
A:  "Herramienta operativa de planning semanal con forecast accuracy"
```

---

## 10. Propuesta de Roadmap Revisado

### Fase 1 — MVP Operativo (lo que necesitan YA)
1. **Nuevo Dashboard Landing** — Resumen ejecutivo semanal con alertas
2. **Forecast Accuracy 8 semanas** — MAPE por SKU, proyección vs real
3. **Detector de cambios grandes** — Alertas automáticas de variaciones significativas
4. **Plan de producción semanal** — Recomendación basada en datos + export Excel/IFS

### Fase 2 — Inteligencia
5. **Propuestas automáticas** — IA analiza datos y sugiere ajustes al plan
6. **Riesgo por SKU** — Scoring: sobre-inventario, faltante, compra tardía
7. **Notificaciones** — Email/push cuando hay algo que requiere atención

### Fase 3 — Integración
8. **Sync IFS** — Importar datos automáticamente del ERP
9. **Export directo** — Generar archivo de carga para IFS

---

## 11. Datos Clave para el Desarrollo

- **Granularidad:** Por SKU individual (490 SKUs)
- **Ventana de análisis:** 8 semanas hacia atrás (forecast accuracy)
- **Horizonte:** 15 semanas hacia adelante (plan de producción)
- **Frecuencia de uso:** Diaria (qué producir) + Semanal (ajuste de plan)
- **Usuarios:** 2 personas, ambas avanzadas técnicamente
- **Fuentes de datos:** IFS ERP + Excel (runrate trimestral + datos semanales)
- **Histórico disponible:** 8 años (2018-2026) — excelente para forecasting

---

*Generado: 2026-04-06 | Fuente: Discovery form + respuestas WhatsApp*
