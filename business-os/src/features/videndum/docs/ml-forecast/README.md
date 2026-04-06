# Videndum ML Forecast Engine — MVP

Sistema de predicción semanal usando Prophet (Meta) para forecasting robusto.

---

## 🚀 Setup Inicial (Solo 1 vez)

### 1. Aplicar migración SQL en Supabase

**Opción A: Desde el dashboard de Supabase**
1. Ve a https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql
2. Abre el archivo `business-os/supabase/migrations/007_ml_forecast_system.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor de Supabase
5. Click "Run"

**Opción B: Desde terminal (necesitas SUPABASE_SERVICE_ROLE_KEY)**
```bash
cd /home/cmarioia/proyectos/stratoscore-hq
PGPASSWORD='RkY.BPf56*wkuvW' psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.csiiulvqzkgijxbgdqcv -d postgres -f business-os/supabase/migrations/007_ml_forecast_system.sql
```

### 2. Instalar dependencias Python

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast

# Crear virtual environment
python3 -m venv venv

# Activar venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

**Dependencias que se instalarán:**
- `prophet==1.1.5` (modelo de forecasting de Meta)
- `pandas==2.1.4` (manipulación de datos)
- `numpy==1.26.2` (operaciones numéricas)
- `psycopg2-binary==2.9.9` (conexión a PostgreSQL/Supabase)

**Tiempo estimado:** 2-3 minutos

---

## 🎯 Ejecutar Forecast

### Opción 1: Batch mode (Top 20 SKUs) — Recomendado

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast
./run_forecast.sh
```

**Lo que hace:**
- Extrae los Top 20 SKUs por revenue 2024
- Para cada SKU:
  - Extrae datos históricos (últimos 24 meses)
  - Entrena modelo Prophet
  - Genera forecast 4 semanas adelante
  - Guarda predicciones en `ml_forecast_predictions`

**Tiempo estimado:** 3-5 minutos

**Output esperado:**
```
🚀 Videndum ML Forecast Engine — MVP
✓ Dependencias instaladas

📊 20 SKUs a procesar

[1/20] Procesando MT055XPRO3...
[MT055XPRO3] Extrayendo datos históricos...
[MT055XPRO3] Entrenando modelo Prophet...
[MT055XPRO3] Generando forecast 4 semanas...
[MT055XPRO3] Guardando 4 predicciones en DB...
[MT055XPRO3] ✓ Completado (4 semanas forecast)

...

============================================================
RESUMEN
============================================================
✓ Exitosos: 18/20
❌ Errores: 2

Errores:
  - SKU-ABC: No hay datos históricos para SKU SKU-ABC
  - SKU-XYZ: Pocos datos (5 meses). Mínimo 6 meses requerido.
```

### Opción 2: SKU específico

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast
./run_forecast.sh MT055XPRO3 4
```

**Output esperado:**
```
🎯 Forecast para MT055XPRO3 — 4 semanas

[MT055XPRO3] Extrayendo datos históricos...
[MT055XPRO3] Entrenando modelo Prophet...
[MT055XPRO3] Generando forecast 4 semanas...
[MT055XPRO3] Guardando 4 predicciones en DB...
[MT055XPRO3] ✓ Completado (4 semanas forecast)

============================================================
PREDICCIONES:
============================================================

  Semana: 2026-W12 (2026-03-16)
  Forecast: 2850 unidades
  Rango 95%: [2420, 3274]
  Tendencia: -15.0% | Estacionalidad: +8.0%
  Confianza: 87% | Anomalía: 0.12

  Semana: 2026-W13 (2026-03-23)
  Forecast: 2920 unidades
  Rango 95%: [2480, 3360]
  Tendencia: -15.0% | Estacionalidad: +10.5%
  Confianza: 89% | Anomalía: 0.08

  ...
```

---

## 📊 Ver Resultados en UI

1. Ve a: **http://localhost:3000/videndum/ml-forecast**
2. Verás:
   - Selector de SKU
   - Gráfico comparativo: ML Forecast vs. Histórico (12m avg)
   - Tabla detallada por semana
   - KPIs: predicción próxima semana, rango de confianza, desviación

**Interpretación:**

| Campo | Significado |
|-------|-------------|
| **ML Forecast** | Predicción del modelo Prophet (tendencia + estacionalidad) |
| **Rango 95%** | Intervalo de confianza (95% prob. que demanda real caiga aquí) |
| **Histórico (12m avg)** | Promedio mensual últimos 12 meses / 4.33 semanas |
| **Δ %** | Desviación ML vs. Histórico. Si >20% → cambio de régimen posible |
| **Tendencia** | % cambio YoY (positivo = crecimiento, negativo = declive) |
| **Estacionalidad** | % ajuste por mes del año (ej: +10% en primavera) |

---

## 🔄 Actualizar con Datos Reales UK

### Cuando tengas forecast UK semanal:

**1. Prepara archivo CSV:**
```csv
sku,week,week_start_date,forecast_units,uploaded_by
MT055XPRO3,2026-W12,2026-03-16,5000,uk_planning@videndum.com
MT055XPRO3,2026-W13,2026-03-23,5200,uk_planning@videndum.com
JOBY-GRP-01,2026-W12,2026-03-16,1200,uk_planning@videndum.com
```

**2. Importa a Supabase:**

Opción A: SQL Editor en Supabase
```sql
INSERT INTO public.uk_forecast_weekly (sku, week, week_start_date, forecast_units, uploaded_by, source)
VALUES
  ('MT055XPRO3', '2026-W12', '2026-03-16', 5000, 'uk_planning@videndum.com', 'csv_import'),
  ('MT055XPRO3', '2026-W13', '2026-03-23', 5200, 'uk_planning@videndum.com', 'csv_import')
ON CONFLICT (sku, week) DO UPDATE SET
  forecast_units = EXCLUDED.forecast_units,
  uploaded_at = NOW();
```

Opción B: Script Python (próximamente)
```bash
python3 import_uk_forecast.py datos_uk.csv
```

**3. Verifica en UI:**
- Refresca http://localhost:3000/videndum/ml-forecast
- Ahora verás línea naranja "UK Forecast" en el gráfico
- Podrás comparar: ML vs. UK vs. Histórico

---

## 📈 Actualizar con Demanda Real Semanal

### Cuando termina la semana:

**1. Registra demanda real:**
```sql
INSERT INTO public.weekly_demand_actual (sku, week, week_start_date, units_sold, source)
VALUES
  ('MT055XPRO3', '2026-W12', '2026-03-16', 3450, 'erp')
ON CONFLICT (sku, week) DO UPDATE SET
  units_sold = EXCLUDED.units_sold;
```

**2. El sistema auto-calcula accuracy:**
```sql
-- Actualizar planning_adjustments con demanda real
UPDATE public.planning_adjustments
SET
  real_demand = 3450,
  accuracy_pct = (1 - ABS(final_approved - 3450) / 3450.0) * 100,
  overproduction_units = CASE WHEN final_approved > 3450 THEN final_approved - 3450 ELSE 0 END,
  stockout_units = CASE WHEN final_approved < 3450 THEN 3450 - final_approved ELSE 0 END
WHERE sku = 'MT055XPRO3' AND week = '2026-W12';
```

**3. Verifica accuracy en UI:**
- Línea verde "Real Demand" aparecerá en gráfico
- Podrás ver accuracy del forecast: `(1 - |forecast - real| / real) * 100`

---

## 🔧 Troubleshooting

### Error: "No hay datos históricos para SKU XXX"
**Causa:** El SKU no tiene registros en `videndum_full_context` con `month IS NOT NULL`

**Solución:** Verifica en Supabase:
```sql
SELECT year, month, SUM(revenue_qty)
FROM public.videndum_full_context
WHERE part_number = 'XXX'
  AND month IS NOT NULL
GROUP BY year, month
ORDER BY year, month;
```

Si no hay datos, ese SKU no se puede forecastear (necesita al menos 6 meses de historia).

---

### Error: "DATABASE_URL no configurada"
**Causa:** No existe `.env.local` o no tiene `DATABASE_URL`

**Solución:**
```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os
echo "DATABASE_URL=postgresql://postgres.csiiulvqzkgijxbgdqcv:RkY.BPf56*wkuvW@aws-0-us-west-1.pooler.supabase.com:6543/postgres" >> .env.local
```

---

### Error: Prophet fails con "No module named 'prophet'"
**Causa:** Virtual environment no activado o dependencias no instaladas

**Solución:**
```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📅 Mantenimiento Semanal

**Recomendado: Ejecutar forecast cada lunes AM**

Opción 1: Manual
```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast
./run_forecast.sh
```

Opción 2: Cron job (automatizado)
```bash
# Edita crontab
crontab -e

# Agrega esta línea (ejecuta cada lunes 7 AM)
0 7 * * 1 cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast && ./run_forecast.sh >> /tmp/ml-forecast.log 2>&1
```

---

## 🎓 Cómo Funciona (Técnico)

### Prophet Model

**Componentes:**
1. **Trend (Tendencia):** Linear o logistic growth
2. **Seasonality (Estacionalidad):**
   - Yearly: Detecta patrones anuales (ej: Q4 más alto)
   - Monthly custom: Detecta patrones mensuales (ej: pico primavera)
3. **Regressors (Opcional):**
   - `order_book`: Backlog confirmado (señal de demanda futura)
   - `opportunities`: Pipeline ponderado

**Fórmula:**
```
y(t) = g(t) + s(t) + h(t) + ε
donde:
  g(t) = tendencia (growth)
  s(t) = estacionalidad (seasonality)
  h(t) = holidays/eventos (no usado en MVP)
  ε = error aleatorio
```

**Training:**
- Input: Datos mensuales últimos 24 meses
- Output: Modelo entrenado
- Tiempo: ~5-10 segundos por SKU

**Prediction:**
- Input: Modelo + regresores futuros
- Output: Forecast mensual → convertido a semanal (/ 4.33)
- Intervalo confianza: 95% (± ~30-40% del forecast)

---

## 📊 Próximas Fases (Cuando tengas datos UK)

### Fase 2: Sistema Colaborativo CR ↔ UK
- Dashboard para que encargada CR proponga ajustes
- Workflow de aprobación UK
- Registro de razones de desviación

### Fase 3: XGBoost con Competencia
- Integrar datos de Radar Competitivo
- Features: precio relativo, lead time, eventos externos
- Target: Revenue real semanal
- Accuracy esperada: +5-10% vs. Prophet solo

### Fase 4: Early Warning System
- Alertas automáticas cuando UK forecast >20% fuera de banda ML
- Notificaciones competidor activo
- Stock-out alerts

---

## 📞 Soporte

**Creado por:** Claude Code (Anthropic)
**Fecha:** 2026-03-14
**Versión:** MVP v1.0

**Para reportar issues:**
1. Revisa logs: `cat /tmp/ml-forecast.log`
2. Verifica tablas en Supabase: `ml_forecast_predictions`
3. Consulta este README

---

## 🎯 KPIs a Trackear

Una vez tengas datos UK + Real Demand, mide:

| Métrica | Target | SQL Query |
|---------|--------|-----------|
| **ML Accuracy** | >85% | `SELECT AVG(accuracy_pct) FROM planning_adjustments WHERE model_version = 'mvp-v1.0'` |
| **ML vs UK (quien gana)** | ML >UK | Comparar accuracy_pct de cada uno |
| **Desviación promedio** | <15% | `SELECT AVG(ABS(deviation_pct)) FROM v_forecast_comparison` |

---

**¡Listo!** Ahora tienes un sistema de ML Forecast funcional. 🚀
