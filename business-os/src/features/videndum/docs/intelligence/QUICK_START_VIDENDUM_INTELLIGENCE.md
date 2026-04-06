# 🚀 Videndum Intelligence — Quick Start

> 3 pasos, 8 minutos total

---

## Paso 1: SQL en Supabase (5 min)

1. Abrir: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv
2. Click **SQL Editor** → **New query**
3. Ejecutar en tu terminal:
   ```bash
   cat /home/cmarioia/proyectos/stratoscore-hq/EJECUTAR_EN_SUPABASE.sql
   ```
4. Copiar TODO el output y pegar en SQL Editor
5. Click **Run** (botón verde)

**Verificar que funcionó:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'videndum_%'
   OR table_name IN ('sync_metadata', 'competitor_analysis', 'market_trends', 'product_obsolescence_scores', 'ai_insights');
```

Deberías ver **6 tablas** nuevas.

---

## Paso 2: Anthropic API Key (2 min)

1. Obtener clave: https://console.anthropic.com/settings/keys
2. Copiar la clave (empieza con `sk-ant-api03-...`)
3. Ejecutar:
   ```bash
   echo 'ANTHROPIC_API_KEY=sk-ant-api03-TU-CLAVE-AQUI' >> /home/cmarioia/proyectos/stratoscore-hq/agent-server/.env
   ```
4. Reiniciar:
   ```bash
   pm2 restart stratoscore-agent --update-env
   ```

---

## Paso 3: Probar Forecasting Agent (1 min)

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
npx tsx src/agents/videndum-forecasting-agent.ts
```

**Si todo funciona correctamente, verás:**
```
📊 Forecasting Agent: Iniciando...

✅ Fetched 15847 registros históricos
✅ Agrupados 324 SKUs únicos

🎯 Forecasting top 20 SKUs...

  📈 3400-001 (24 meses de datos)
  ...

✅ Generados 120 forecasts
💾 Escribiendo forecasts a Supabase...
  ✓ 120/120 (100%)

✅ Forecasts escritos a Supabase
📊 Forecasting Agent completado en 45.3s
```

---

## Verificar Resultados

En Supabase SQL Editor:

```sql
-- Ver forecasts generados (top 10)
SELECT
  part_number,
  forecast_month,
  predicted_revenue,
  LEFT(forecast_explanation, 100) as explanation
FROM videndum_forecast
ORDER BY forecast_month DESC, predicted_revenue DESC
LIMIT 10;

-- Ver status del agent
SELECT * FROM sync_metadata WHERE source = 'forecasting_agent';
```

---

## ✅ Listo!

Una vez que veas forecasts en la tabla `videndum_forecast`, avísale a Claude y continuamos con los 4 agents restantes:

1. Competitor Intelligence Agent (2 días)
2. Market Trends Agent (2 días)
3. Product Obsolescence Agent (1.5 días)
4. AI Insights Generator (2 días)

---

**Documentación completa:**
- `VIDENDUM_INTELLIGENCE_READY.md` - Resumen ejecutivo
- `VIDENDUM_INTELLIGENCE_SETUP.md` - Instrucciones detalladas
- `docs/VIDENDUM_INTELLIGENCE_SYSTEM.md` - Arquitectura completa
