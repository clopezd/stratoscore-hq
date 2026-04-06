# Videndum Intelligence System

> Sistema de inteligencia predictiva basado en agents (Node.js + Claude AI)

---

## 🚀 Quick Start (8 minutos)

### Paso 1: Ejecutar SQL en Supabase (5 min)

1. Abrir: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv
2. Click **SQL Editor** → **New query**
3. Copiar TODO el contenido de:
   ```bash
   cat business-os/supabase/migrations/008_EJECUTAR_PRIMERO.sql
   ```
4. Pegar en SQL Editor y hacer click en **Run**

**Verificar:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'sync_metadata',
    'videndum_forecast',
    'competitor_analysis',
    'market_trends',
    'product_obsolescence_scores',
    'ai_insights'
  );
```
Deberías ver **6 tablas**.

---

### Paso 2: Configurar ANTHROPIC_API_KEY (2 min)

1. Obtener clave: https://console.anthropic.com/settings/keys
2. Agregar a agent-server:
   ```bash
   echo 'ANTHROPIC_API_KEY=sk-ant-api03-TU-CLAVE-AQUI' >> agent-server/.env
   pm2 restart stratoscore-agent --update-env
   ```

---

### Paso 3: Probar Forecasting Agent (1 min)

```bash
cd agent-server
npx tsx src/agents/videndum-forecasting-agent.ts
```

**Salida esperada:**
```
📊 Forecasting Agent: Iniciando...
✅ Fetched 15847 registros históricos
✅ Agrupados 324 SKUs únicos
🎯 Forecasting top 20 SKUs...
✅ Generados 120 forecasts
💾 Escribiendo forecasts a Supabase...
✅ Forecasts escritos a Supabase
```

---

## 📊 ¿Qué hace este sistema?

El Intelligence System pre-computa insights usando Claude AI que luego pueden ser consumidos por Power BI o Next.js dashboards:

### Agents Implementados:

✅ **Forecasting Agent** (LISTO)
- Genera forecasts 6 meses adelante para top 20 SKUs
- Linear regression + Claude AI para explicaciones
- Incluye risk factors y opportunities
- Corre: Semanal (Domingos 2:00 AM)

### Agents Pendientes (7-8 días desarrollo):

🔍 **Competitor Intelligence Agent** (2 días)
- Web scraping de precios (Cartoni, Miller, Camgear, Libec, Neewer)
- Comparación con precios Videndum
- Recommendations estratégicas de Claude AI

📈 **Market Trends Agent** (2 días)
- News scraping de tendencias tech/market
- Análisis de impacto en categorías Videndum
- CAGR projections por segmento

⚠️ **Product Obsolescence Agent** (1.5 días)
- Risk scoring 0-100 por SKU
- EOL projections
- Discontinue vs Invest recommendations

💡 **AI Insights Generator** (2 días)
- Variance analysis (forecast vs actual)
- Opportunity detection
- Strategic recommendations

---

## 📁 Estructura

```
business-os/
├── docs/intelligence/
│   ├── README.md                              ← Estás aquí
│   ├── QUICK_START_VIDENDUM_INTELLIGENCE.md   ← Quick start expandido
│   ├── VIDENDUM_INTELLIGENCE_READY.md         ← Resumen ejecutivo
│   ├── VIDENDUM_INTELLIGENCE_SETUP.md         ← Setup detallado
│   ├── VIDENDUM_INTELLIGENCE_SYSTEM.md        ← Arquitectura completa
│   ├── VIDENDUM_COMPETIDORES_DIRECTOS.md      ← Análisis competidores
│   └── VIDENDUM_PLAN_REALTIME_DATACUBE.md     ← Plan sync Excel
│
├── supabase/migrations/
│   ├── 008_intelligence_tables.sql            ← Esquema SQL completo
│   └── 008_EJECUTAR_PRIMERO.sql               ← Mismo archivo, ejecutar este
│
└── scripts/
    ├── verify-intelligence-setup.sh           ← Verificar estado
    └── apply-intelligence-migration.mjs       ← Aplicar SQL (requiere psql)
```

```
agent-server/
└── src/agents/
    └── videndum-forecasting-agent.ts          ← Forecasting Agent (303 líneas)
```

---

## 📖 Documentación

- **[QUICK_START_VIDENDUM_INTELLIGENCE.md](QUICK_START_VIDENDUM_INTELLIGENCE.md)** - Pasos rápidos (8 min)
- **[VIDENDUM_INTELLIGENCE_READY.md](VIDENDUM_INTELLIGENCE_READY.md)** - Resumen ejecutivo
- **[VIDENDUM_INTELLIGENCE_SETUP.md](VIDENDUM_INTELLIGENCE_SETUP.md)** - Setup detallado
- **[VIDENDUM_INTELLIGENCE_SYSTEM.md](VIDENDUM_INTELLIGENCE_SYSTEM.md)** - Arquitectura completa (29KB)

---

## 💰 Costos

| Servicio | Costo mensual |
|---|---|
| Anthropic Claude API | $15-25/mes |
| Supabase | $0 (plan actual) |
| Agent Server | $0 (ya existe) |
| **Total** | **$15-25/mes** |

---

## 🔍 Verificar Estado

```bash
cd business-os
./scripts/verify-intelligence-setup.sh
```

---

## ⚡ Siguiente Paso

Una vez probado el Forecasting Agent, reportar resultados y continuar con:
1. Competitor Intelligence Agent (2 días)
2. Market Trends Agent (2 días)
3. Product Obsolescence Agent (1.5 días)
4. AI Insights Generator (2 días)
