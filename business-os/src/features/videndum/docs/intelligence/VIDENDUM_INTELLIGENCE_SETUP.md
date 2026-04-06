# Videndum Intelligence System — Setup Instructions

> Sistema de inteligencia basado en agents (Node.js + Claude AI) para forecasting, competitive analysis, y AI insights

---

## 📊 Estado Actual

✅ **Completado:**
- Tablas SQL diseñadas (`008_intelligence_tables.sql`)
- Forecasting Agent implementado (`videndum-forecasting-agent.ts`)
- Dependencies instaladas (`@anthropic-ai/sdk`, `@supabase/supabase-js`)
- Documentación completa creada

⚠️ **Pendiente:**
1. Ejecutar SQL en Supabase (crear tablas)
2. Configurar ANTHROPIC_API_KEY en `.env`
3. Probar Forecasting Agent
4. Implementar agents restantes (4-5 días)

---

## 🚀 Paso 1: Ejecutar SQL en Supabase

### Opción A: SQL Editor de Supabase (RECOMENDADO)

1. Abrir: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv
2. Click en **"SQL Editor"** (menú izquierdo)
3. Click en **"New query"**
4. Copiar TODO el contenido de:
   ```bash
   cat /home/cmarioia/proyectos/stratoscore-hq/EJECUTAR_EN_SUPABASE.sql
   ```
5. Pegar en el SQL Editor
6. Click en **"Run"** (botón verde abajo derecha)

**Verificar que funcionó:**
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
  )
ORDER BY table_name;
```

Deberías ver **6 tablas**.

---

## 🔑 Paso 2: Configurar Anthropic API Key

### Obtener clave:
1. Ir a: https://console.anthropic.com/settings/keys
2. Crear nueva API key (si no tienes una)
3. Copiar la clave (empieza con `sk-ant-...`)

### Agregar a agent-server:

```bash
# Editar .env
nano /home/cmarioia/proyectos/stratoscore-hq/agent-server/.env

# Agregar al final del archivo:
ANTHROPIC_API_KEY=sk-ant-api03-...tu-clave-real...
```

### Reiniciar agent-server:

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
pm2 restart stratoscore-agent --update-env
pm2 logs stratoscore-agent --lines 10
```

---

## 🧪 Paso 3: Probar Forecasting Agent

Una vez ejecutado el SQL y configurada la API key:

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
npx tsx src/agents/videndum-forecasting-agent.ts
```

**Salida esperada:**
```
📊 Forecasting Agent: Iniciando...

✅ Fetched 15847 registros históricos
✅ Agrupados 324 SKUs únicos

🎯 Forecasting top 20 SKUs...

  📈 3400-001 (24 meses de datos)
  📈 3400-002 (18 meses de datos)
  ...

✅ Generados 120 forecasts

💾 Escribiendo forecasts a Supabase...
  ✓ 120/120 (100%)

✅ Forecasts escritos a Supabase

📊 Forecasting Agent completado en 45.3s
   120 forecasts generados (top 20 SKUs × 6 meses)
```

### Verificar resultados en Supabase:

```sql
SELECT
  part_number,
  forecast_month,
  predicted_revenue,
  forecast_explanation
FROM videndum_forecast
ORDER BY forecast_month DESC, predicted_revenue DESC
LIMIT 10;
```

---

## 📋 Paso 4: Implementar Agents Restantes

Una vez probado el Forecasting Agent, implementar:

| Agent | Propósito | Tiempo estimado | Cron |
|---|---|---|---|
| **Competitor Intelligence Agent** | Web scraping precios de Cartoni, Miller, Neewer, Camgear, Libec | 2 días | Lunes 3:00 AM |
| **Market Trends Agent** | News scraping + Claude analysis | 2 días | Martes 3:00 AM |
| **Product Obsolescence Agent** | Risk scoring por SKU | 1.5 días | Miércoles 3:00 AM |
| **AI Insights Generator** | Variance analysis, recommendations | 2 días | Diario 5:00 AM |

**Total:** 7.5 días de desarrollo

---

## 🎯 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     VIDENDUM INTELLIGENCE                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  Excel Data     │      │  Web Scraping   │
│  (T-1 Sync)     │      │  (Competitors)  │
└────────┬────────┘      └────────┬────────┘
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────┐
│         Supabase PostgreSQL             │
│  ┌────────────────────────────────┐    │
│  │  videndum_records (historical) │    │
│  └────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Agent Server (Node.js)          │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Forecasting Agent (ARIMA +     │  │
│  │  Claude AI)                     │  │
│  │  ├─ Linear regression           │  │
│  │  ├─ Claude AI explanations      │  │
│  │  └─ Risk/opportunity analysis   │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Competitor Intelligence Agent  │  │
│  │  ├─ Price scraping               │  │
│  │  ├─ Market share estimation      │  │
│  │  └─ Strategic recommendations    │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Market Trends Agent            │  │
│  │  ├─ News scraping                │  │
│  │  ├─ CAGR analysis                │  │
│  │  └─ Impact assessment            │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Obsolescence Agent             │  │
│  │  ├─ Risk scoring (0-100)         │  │
│  │  ├─ EOL projection               │  │
│  │  └─ Discontinue/Invest recs      │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  AI Insights Generator          │  │
│  │  ├─ Variance explanations        │  │
│  │  ├─ Opportunity detection        │  │
│  │  └─ Strategic recommendations    │  │
│  └─────────────────────────────────┘  │
│                                         │
│         Cron: Daily/Weekly              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Supabase PostgreSQL             │
│  ┌────────────────────────────────┐    │
│  │  videndum_forecast             │    │
│  │  competitor_analysis           │    │
│  │  market_trends                 │    │
│  │  product_obsolescence_scores   │    │
│  │  ai_insights                   │    │
│  │  sync_metadata                 │    │
│  └────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Power BI    │    │  Next.js     │
│  Dashboard   │    │  Dashboard   │
└──────────────┘    └──────────────┘
```

---

## 💰 Costos Estimados

| Servicio | Uso mensual | Costo |
|---|---|---|
| **Anthropic Claude API** | ~500 requests × 1000 tokens | $15-25/mes |
| **Supabase Database** | 6 nuevas tablas, ~50K rows | Gratis (plan actual) |
| **Agent Server** | PM2 en tu servidor actual | $0 (ya existe) |
| **Web Scraping** | Axios/Cheerio (sin proxy) | $0 |

**Total:** ~$15-25/mes

---

## 📚 Archivos Clave

| Archivo | Descripción |
|---|---|
| `EJECUTAR_EN_SUPABASE.sql` | SQL completo para ejecutar en Supabase SQL Editor |
| `agent-server/src/agents/videndum-forecasting-agent.ts` | Forecasting Agent (prototipo funcional) |
| `docs/VIDENDUM_INTELLIGENCE_SYSTEM.md` | Documentación completa del sistema |
| `docs/VIDENDUM_PLAN_REALTIME_DATACUBE.md` | Plan de sync con Excel cube de Videndum |
| `docs/VIDENDUM_COMPETIDORES_DIRECTOS.md` | Análisis de 5 competidores directos |

---

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY no configurada"
- Verificar que la clave esté en `.env`
- Verificar que no tenga espacios al inicio/final
- Reiniciar PM2: `pm2 restart stratoscore-agent --update-env`

### Error: "relation videndum_forecast does not exist"
- Ejecutar el SQL en Supabase primero
- Verificar con query de verificación (ver Paso 1)

### Error: "No hay suficientes datos históricos"
- El agent requiere mínimo 3 meses de datos por SKU
- Verificar que `videndum_records` tenga datos de revenue mensuales
- Query de verificación:
  ```sql
  SELECT COUNT(*) FROM videndum_records WHERE metric_type = 'revenue' AND month IS NOT NULL;
  ```

### Forecasts generados pero sin explicación de Claude
- Verificar ANTHROPIC_API_KEY
- Verificar que tienes créditos en cuenta de Anthropic
- El agent continúa funcionando sin explicaciones (modo degradado)

---

## ✅ Siguiente Acción

1. **Ejecutar SQL en Supabase** (5 minutos)
2. **Configurar ANTHROPIC_API_KEY** (2 minutos)
3. **Probar Forecasting Agent** (1 minuto)
4. **Reportar resultados a Claude** para continuar con siguiente agent

---

**¿Listo para empezar?** Ejecuta el SQL en Supabase y configura la API key 🚀
