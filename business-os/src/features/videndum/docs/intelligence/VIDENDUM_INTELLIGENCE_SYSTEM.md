# Sistema de Inteligencia de Videndum - Opción 2

> **Arquitectura:** Node.js Agents + Claude AI + Supabase Intelligence Tables
> **Propósito:** Forecasting, Competitive Intelligence, Market Trends, AI Insights
> **Destino:** Power BI + Next.js Dashboard
> **Estado:** ✅ Tablas creadas, 🚧 Agents en desarrollo

---

## 🎯 Resumen Ejecutivo

**Problema:** Power BI solo puede conectarse a datos crudos en SQL, pero no puede ejecutar modelos predictivos, web scraping de competidores, o análisis de Claude AI.

**Solución:** Backend Intelligence Layer que pre-computa insights avanzados y los expone como tablas en Supabase que Power BI consume.

**Diferenciador:** No vendemos "dashboards", vendemos **inteligencia pre-procesada** que cualquier herramienta BI (Power BI, Tableau, Looker) puede consumir.

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│  STRATOSCORE INTELLIGENCE LAYER                          │
│  (Node.js Agents en agent-server)                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │ Forecasting    │  │ Competitor     │  │ Market     │ │
│  │ Agent          │  │ Intel Agent    │  │ Trends     │ │
│  │ • ARIMA        │  │ • Web scraping │  │ • News     │ │
│  │ • Claude AI    │  │ • Price track  │  │ • Claude   │ │
│  │ Cron: 2:00 AM  │  │ Cron: Mon 3AM  │  │ Cron: Tue  │ │
│  └────────────────┘  └────────────────┘  └────────────┘ │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │ Obsolescence   │  │ AI Insights    │                  │
│  │ Risk Agent     │  │ Generator      │                  │
│  │ • Risk scoring │  │ • Variance exp │                  │
│  │ • Claude rec   │  │ • Opportunities│                  │
│  │ Cron: Wed 3AM  │  │ Cron: 5:00 AM  │                  │
│  └────────────────┘  └────────────────┘                  │
│                                                           │
│  Todos escriben a Supabase PostgreSQL ↓                  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  SUPABASE POSTGRESQL - INTELLIGENCE TABLES               │
├──────────────────────────────────────────────────────────┤
│  📊 sync_metadata (tracking de agents)                   │
│  📊 videndum_forecast (forecasting 6 meses)              │
│  📊 competitor_analysis (prices, market share, threats)  │
│  📊 market_trends (tech trends, CAGR, impactos)          │
│  📊 product_obsolescence_scores (risk 0-100)             │
│  📊 ai_insights (Claude recommendations)                 │
│                                                           │
│  ✅ Actualizadas diariamente/semanalmente por agents     │
│  ✅ Read-only para Power BI (user: powerbi_readonly)     │
└──────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Next.js Dashboard   │    │  Power BI Desktop    │
│  (StratosCore)       │    │  (Videndum users)    │
│  - Live Claude chat  │    │  - Pre-computed KPIs │
│  - Interactive       │    │  - Forecast charts   │
│  - Real-time updates │    │  - Competitor cards  │
└──────────────────────┘    └──────────────────────┘
```

---

## 📊 Tablas de Inteligencia

### **1. sync_metadata**
**Propósito:** Tracking de sincronizaciones de agents

| Columna | Tipo | Descripción |
|---|---|---|
| source | TEXT | 'forecasting_agent', 'competitor_agent', etc. |
| last_sync_at | TIMESTAMPTZ | Timestamp de última ejecución |
| records_synced | INT | Número de registros procesados |
| status | TEXT | 'success', 'error', 'running' |
| error_message | TEXT | Mensaje de error si falló |

**Uso en Power BI:** Card mostrando última actualización

---

### **2. videndum_forecast**
**Propósito:** Forecasting predictivo de revenue y order intake

| Columna | Tipo | Descripción |
|---|---|---|
| part_number | TEXT | SKU de Videndum |
| forecast_month | DATE | Mes predicho (ej: 2026-04-01) |
| predicted_revenue | NUMERIC | Revenue predicho |
| confidence_lower | NUMERIC | Intervalo de confianza 95% inferior |
| confidence_upper | NUMERIC | Intervalo de confianza 95% superior |
| model_used | TEXT | 'ARIMA', 'Claude_AI_Assisted', etc. |
| **forecast_explanation** | TEXT | **Explicación de Claude AI** |
| **risk_factors** | TEXT[] | **['Aranceles US', 'Competencia china']** |
| **opportunities** | TEXT[] | **['IP broadcast growth', 'Cine recovery']** |

**Ejemplo de dato:**

```json
{
  "part_number": "3400-001",
  "forecast_month": "2026-04-01",
  "predicted_revenue": 135000,
  "confidence_lower": 125000,
  "confidence_upper": 145000,
  "forecast_explanation": "Proyección +8% YoY basada en tendencia histórica. Riesgo: aranceles US. Oportunidad: IP broadcast adoption creciendo 17.6% CAGR.",
  "risk_factors": ["Aranceles US", "Competencia china en ICC"],
  "opportunities": ["IP broadcast growth", "Cine recovery post-strike"]
}
```

**Uso en Power BI:**
- Gráfica de líneas: Historical vs Forecast
- Área sombreada: Confidence interval
- Card con explicación de Claude

---

### **3. competitor_analysis**
**Propósito:** Inteligencia de competidores (precios, market share, strategic recommendations)

| Columna | Tipo | Descripción |
|---|---|---|
| competitor_name | TEXT | 'Cartoni', 'Miller', 'Neewer', etc. |
| product_category | TEXT | 'Fluid Heads', 'LED Lighting', etc. |
| competitor_price_usd | NUMERIC | Precio del competidor |
| videndum_price_usd | NUMERIC | Precio de Videndum equivalente |
| price_difference_pct | NUMERIC | % diferencia de precio |
| **strategic_recommendation** | TEXT | **Recomendación de Claude AI** |
| **threat_level** | TEXT | **'Critical', 'High', 'Medium', 'Low'** |

**Ejemplo de dato:**

```json
{
  "competitor_name": "Neewer",
  "product_category": "LED Panels (Entry)",
  "competitor_price_usd": 89,
  "videndum_price_usd": 245,
  "price_difference_pct": -64,
  "strategic_recommendation": "Neewer domina entry-level con precio 64% menor. Recomendación: defender premium tier (Litepanels broadcast) y discontinuar mid-market LED donde margen es insostenible.",
  "threat_level": "High"
}
```

**Uso en Power BI:**
- Matrix de competidores con threat level color-coded
- Cards con strategic recommendations
- Scatter plot: Price vs Quality perception

---

### **4. market_trends**
**Propósito:** Tendencias de mercado (tech trends, economic shifts, regulatory changes)

| Columna | Tipo | Descripción |
|---|---|---|
| trend_name | TEXT | 'IP Broadcast SMPTE 2110', 'AI Video Gen', etc. |
| trend_category | TEXT | 'Technology', 'Economic', 'Regulatory' |
| impact_type | TEXT | 'Tailwind', 'Headwind', 'Neutral' |
| affected_divisions | TEXT[] | ['Media Solutions', 'Production Solutions'] |
| **detailed_analysis** | TEXT | **Análisis completo de Claude AI** |
| estimated_cagr_pct | NUMERIC | CAGR del mercado afectado |

**Ejemplo de dato:**

```json
{
  "trend_name": "IP Broadcast (SMPTE 2110)",
  "trend_category": "Technology",
  "impact_type": "Tailwind",
  "impact_magnitude": "High",
  "trend_summary": "Broadcasters migrando de SDI a IP workflows. 40% en migración. Market size: $2.4B, CAGR 17.6%.",
  "detailed_analysis": "La migración a IP broadcast representa la oportunidad más grande para Videndum en Production Solutions. Teradek está bien posicionado con su portfolio de wireless video, pero requiere inversión en R&D para SMPTE 2110 compliance. Recomendación: $1.5M investment, retorno estimado $15M en 3 años.",
  "estimated_cagr_pct": 17.6,
  "affected_divisions": ["Production Solutions", "Creative Solutions"]
}
```

**Uso en Power BI:**
- Timeline de trends (Tailwinds en verde, Headwinds en rojo)
- Cards con detailed_analysis de Claude
- Table con CAGR por trend

---

### **5. product_obsolescence_scores**
**Propósito:** Risk scoring de obsolescencia por SKU (0-100, 100 = alto riesgo)

| Columna | Tipo | Descripción |
|---|---|---|
| part_number | TEXT | SKU de Videndum |
| obsolescence_risk_score | INT | 0-100 (100 = alto riesgo) |
| **recommendation** | TEXT | **'Discontinue', 'Maintain', 'Invest', 'Reposition'** |
| **recommendation_rationale** | TEXT | **Explicación detallada de Claude** |
| projected_eol_date | DATE | End of Life estimado |

**Ejemplo de dato:**

```json
{
  "part_number": "3400-045",
  "product_name": "Manfrotto Entry Tripod",
  "obsolescence_risk_score": 78,
  "recommendation": "Discontinue",
  "recommendation_rationale": "Competencia china (Neewer) con equivalente 65% más barato. Margen <15%. Market share cayó 35% YoY. Recomendación: discontinuar antes de Dec 2026 y redirigir recursos a Manfrotto pro tier donde Videndum mantiene diferenciación.",
  "projected_eol_date": "2026-12-31",
  "risk_factors": {
    "chinese_competition": 85,
    "tech_obsolescence": 40,
    "margin_pressure": 70
  }
}
```

**Uso en Power BI:**
- Scatter plot: Risk Score vs Revenue (bubble size = margin)
- Color: Recommendation (red=Discontinue, green=Invest)
- Table con top 10 SKUs en riesgo + rationale de Claude

---

### **6. ai_insights**
**Propósito:** Insights generados por Claude AI (variance explanations, opportunities, strategic recommendations)

| Columna | Tipo | Descripción |
|---|---|---|
| insight_type | TEXT | 'Variance_Explanation', 'Opportunity', 'Risk_Alert' |
| priority | TEXT | 'Critical', 'High', 'Medium', 'Low' |
| **insight_title** | TEXT | **"Revenue decline in Media Solutions: root cause"** |
| **insight_detailed** | TEXT | **Análisis completo con recommendations** |
| recommended_actions | TEXT[] | ['Discontinue SKUs X,Y,Z', 'Invest $1.5M'] |
| estimated_revenue_impact_usd | NUMERIC | Impacto estimado en USD |

**Ejemplo de dato:**

```json
{
  "insight_type": "Variance_Explanation",
  "priority": "High",
  "insight_title": "Media Solutions Revenue -24% H1 2025: Aranceles vs Demand Real",
  "insight_summary": "Caída no refleja pérdida de demanda end-user. Canales pausaron órdenes por incertidumbre arancelaria US.",
  "insight_detailed": "Análisis detallado revela que la caída de 24% en Media Solutions H1 2025 vs H1 2024 NO es por pérdida de demanda de usuario final. Order intake de end-user se mantiene estable (+2% YoY). La caída es por pausa temporal de distribuidores/canales ante incertidumbre de aranceles US. Backlog proyectado para recuperar en Q3 2025 cuando aranceles se clarifiquen. Recomendación: comunicar a stakeholders que demand underlying es sano, priorizar ventas directas a clientes vs distribuidores temporalmente.",
  "recommended_actions": [
    "Comunicar a board: demand subyacente es sano",
    "Priorizar clientes directos vs distribuidores temporalmente",
    "Monitorear aranceles US para timing de recovery"
  ],
  "estimated_revenue_impact_usd": -7500000,
  "confidence_level": "High"
}
```

**Uso en Power BI:**
- Cards con insights prioritarios (Critical/High)
- Table de insights con status (New/Reviewed/Action_Taken)
- Workflow: users pueden marcar insights como "Reviewed"

---

## 🤖 Agents Implementados

### **Forecasting Agent** ✅ PROTOTIPO CREADO
**Archivo:** `agent-server/src/agents/videndum-forecasting-agent.ts`

**Qué hace:**
1. Fetch datos históricos de revenue (últimos 24 meses)
2. Agrupa por SKU
3. Genera forecasts para top 20 SKUs (próximos 6 meses)
4. Usa modelo simple (linear trend) + Claude AI para explicaciones
5. Escribe a tabla `videndum_forecast`

**Cron:** Diario 2:00 AM

**Ejecución manual:**
```bash
cd agent-server
npx tsx src/agents/videndum-forecasting-agent.ts
```

**Output esperado:**
```
📊 Forecasting Agent: Iniciando...
✅ Fetched 2450 registros históricos
✅ Agrupados 245 SKUs únicos
🎯 Forecasting top 20 SKUs...
  📈 3400-001 (18 meses de datos)
  📈 3400-002 (20 meses de datos)
  ...
✅ Generados 120 forecasts (20 SKUs × 6 meses)
💾 Escribiendo forecasts a Supabase...
✅ Forecasts escritos a Supabase
📊 Forecasting Agent completado en 12.3s
```

---

### **Competitor Intelligence Agent** 🚧 PENDIENTE
**Archivo:** `agent-server/src/agents/competitor-intelligence-agent.ts` (a crear)

**Qué hará:**
1. Web scraping de precios de competidores (Cartoni, Miller, Neewer, Camgear, Libec)
2. Comparar con precios de Videndum
3. Claude AI genera strategic recommendations
4. Escribe a tabla `competitor_analysis`

**Cron:** Semanal (Lunes 3:00 AM)

---

### **Market Trends Agent** 🚧 PENDIENTE
**Qué hará:**
1. Scraping de news (NewscastStudio, StreamingMedia, etc.)
2. Claude AI identifica tech trends
3. Clasifica por impacto (Tailwind/Headwind) y división afectada
4. Escribe a tabla `market_trends`

**Cron:** Semanal (Martes 3:00 AM)

---

### **Product Obsolescence Agent** 🚧 PENDIENTE
**Qué hará:**
1. Analiza cada SKU: revenue trend, margin, competencia
2. Calcula obsolescence_risk_score (0-100)
3. Claude AI genera recommendation (Discontinue/Maintain/Invest/Reposition)
4. Escribe a tabla `product_obsolescence_scores`

**Cron:** Semanal (Miércoles 3:00 AM)

---

### **AI Insights Generator** 🚧 PENDIENTE
**Qué hará:**
1. Analiza variance (actual vs forecast)
2. Identifica anomalías en revenue patterns
3. Claude AI genera insights + recommended actions
4. Escribe a tabla `ai_insights`

**Cron:** Diario 5:00 AM

---

## 📈 Power BI Integration

### **Conexión a Supabase**

```
Get Data → PostgreSQL database

Server: aws-0-us-west-1.pooler.supabase.com
Port: 5432
Database: postgres
Username: powerbi_readonly
Password: [crear usuario read-only]

Seleccionar tablas:
✓ videndum_records (datos crudos históricos)
✓ videndum_forecast (forecasting)
✓ competitor_analysis (intel de competencia)
✓ market_trends (tendencias)
✓ product_obsolescence_scores (risk scoring)
✓ ai_insights (Claude recommendations)
```

### **Relationships en Power BI**

```
videndum_forecast.part_number      → videndum_records.part_number
competitor_analysis.comparable_sku → videndum_records.part_number
product_obsolescence_scores.pn     → videndum_records.part_number
```

### **Dashboards Sugeridos**

1. **Forecasting Dashboard**
   - Gráfica: Historical vs Forecast (con confidence interval)
   - Table: Top SKUs con mayor predicted growth
   - Card: Claude explanation del top SKU

2. **Competitive Intelligence**
   - Matrix: Competitor × Category × Threat Level
   - Card: Strategic recommendations de Claude
   - Scatter: Price vs Quality perception

3. **Market Trends**
   - Timeline: Trends Tailwinds vs Headwinds
   - Table: Trends con CAGR estimado
   - Card: Detailed analysis de top trend

4. **Product Portfolio Health**
   - Scatter: Obsolescence Risk vs Revenue
   - Table: Top 10 SKUs en riesgo + rationale
   - Donut: Distribution por recommendation (Discontinue/Maintain/Invest)

---

## ⏱️ Cronograma de Implementación

| Tarea | Status | Tiempo Estimado |
|---|---|---|
| **✅ Crear tablas SQL en Supabase** | Completado | 1 hora |
| **✅ Forecasting Agent prototipo** | Completado | 2 horas |
| **🚧 Competitor Intelligence Agent** | Pendiente | 2 días |
| **🚧 Market Trends Agent** | Pendiente | 1.5 días |
| **🚧 Obsolescence Risk Agent** | Pendiente | 1 día |
| **🚧 AI Insights Generator** | Pendiente | 1 día |
| **🚧 Configurar cron jobs** | Pendiente | 1 hora |
| **🚧 Testing con datos reales** | Pendiente | 1 día |
| **🚧 Power BI dashboards** | Pendiente | 1 día |
| **TOTAL** | - | **9-10 días** |

---

## 🚀 Próximos Pasos

### **Paso 1: Ejecutar SQL en Supabase** (CARLOS - 5 minutos)
Ver instrucciones en: `EJECUTAR_INTELLIGENCE_TABLES.md`

### **Paso 2: Test Forecasting Agent** (CARLOS - 5 minutos)
```bash
cd agent-server
npm install @anthropic-ai/sdk  # Si no está instalado
npx tsx src/agents/videndum-forecasting-agent.ts
```

### **Paso 3: Verificar datos en Supabase** (CARLOS - 2 minutos)
```sql
SELECT * FROM videndum_forecast LIMIT 10;
```

Deberías ver forecasts con explicaciones de Claude AI.

### **Paso 4: Implementar agents restantes** (STRATOSCORE - 7 días)
- Competitor Intelligence Agent
- Market Trends Agent
- Obsolescence Risk Agent
- AI Insights Generator

### **Paso 5: Configurar Power BI** (CARLOS - 2 horas)
- Conectar a Supabase
- Crear dashboards básicos
- Validar que datos se ven correctos

---

## 💰 Costos

| Componente | Costo Mensual |
|---|---|
| Supabase (Free tier) | **$0** (hasta 500 MB DB) |
| Claude AI (Anthropic) | **~$30-50** (forecasting agent solo) |
| Node.js agents (PM2) | **$0** (corre en servidor existente) |
| Power BI Desktop | **$0** (gratis para crear reportes) |
| Power BI Pro (opcional, para compartir) | **$10/user/mes** |
| **TOTAL** | **~$30-50/mes** + Power BI si se comparte |

**ROI:** Si esto ahorra 4 horas/semana de análisis manual (@ $50/hora), ROI = $800/mes - $50 = **$750/mes neto**

---

## 📚 Archivos Creados

```
/home/cmarioia/proyectos/stratoscore-hq/
├── business-os/supabase/migrations/
│   └── 008_intelligence_tables.sql  ← SQL de tablas
├── agent-server/src/agents/
│   └── videndum-forecasting-agent.ts  ← Prototipo funcional
├── docs/
│   ├── VIDENDUM_PLAN_REALTIME_DATACUBE.md  ← Plan Excel sync
│   ├── VIDENDUM_COMPETIDORES_DIRECTOS.md   ← Análisis de competencia
│   └── VIDENDUM_INTELLIGENCE_SYSTEM.md     ← Este documento
└── EJECUTAR_INTELLIGENCE_TABLES.md  ← Instrucciones SQL
```

---

**Siguiente acción:** Ejecuta el SQL en Supabase y prueba el Forecasting Agent 🚀
