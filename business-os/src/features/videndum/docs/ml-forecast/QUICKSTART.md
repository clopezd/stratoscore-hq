# ML Forecast — Quick Start (5 Minutos)

## ✅ Estado Actual

- ✅ Migración SQL aplicada (tablas creadas en Supabase)
- ✅ API endpoint `/api/videndum/ml-forecast` lista
- ✅ UI en `/videndum/ml-forecast` funcional
- ⚠️ Falta: Ejecutar primer forecast (3-5 minutos)

---

## 🚀 Ejecutar Primer Forecast (Ahora)

```bash
# 1. Ir al directorio
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast

# 2. Ejecutar script (instala deps + corre forecast)
./run_forecast.sh
```

**Tiempo:** 3-5 minutos (primera vez instala Prophet, luego más rápido)

**Lo que hace:**
- Instala Prophet, pandas, numpy, psycopg2
- Extrae Top 20 SKUs por revenue 2024
- Para cada SKU: entrena modelo + genera forecast 4 semanas
- Guarda predicciones en `ml_forecast_predictions`

---

## 📊 Ver Resultados

1. **En UI:** http://localhost:3000/videndum/ml-forecast
   - Gráfico ML Forecast vs. Histórico
   - Tabla detallada por semana
   - Selector de SKU

2. **En Supabase:**
   ```sql
   SELECT * FROM ml_forecast_predictions
   ORDER BY week_start_date DESC, ml_prediction DESC
   LIMIT 20;
   ```

---

## 🔄 Cuando Tengas Datos UK

### 1. Subir Forecast UK

Opción A: SQL directo (Supabase dashboard)
```sql
INSERT INTO uk_forecast_weekly (sku, week, week_start_date, forecast_units, uploaded_by)
VALUES
  ('MT055XPRO3', '2026-W12', '2026-03-16', 5000, 'uk_planning@videndum.com'),
  ('MT055XPRO3', '2026-W13', '2026-03-23', 5200, 'uk_planning@videndum.com')
ON CONFLICT (sku, week) DO UPDATE SET
  forecast_units = EXCLUDED.forecast_units;
```

Opción B: CSV import (próximamente script Python)

### 2. Ver Comparación en UI

- Refresca http://localhost:3000/videndum/ml-forecast
- Ahora verás línea naranja "UK Forecast"
- Podrás comparar ML vs. UK vs. Histórico

### 3. Registrar Demanda Real (post-facto)

Cuando termina la semana:
```sql
INSERT INTO weekly_demand_actual (sku, week, week_start_date, units_sold)
VALUES ('MT055XPRO3', '2026-W12', '2026-03-16', 3450);
```

Ahora verás línea verde "Real Demand" en UI + accuracy calculado.

---

## 📅 Mantenimiento

**Ejecutar forecast cada lunes:**
```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/ml-forecast
./run_forecast.sh
```

O automatizar con cron:
```bash
# Cada lunes 7 AM
0 7 * * 1 cd /path/to/ml-forecast && ./run_forecast.sh >> /tmp/forecast.log 2>&1
```

---

## 📖 Documentación Completa

- **README.md** — Guía completa (setup, troubleshooting, fases futuras)
- **forecast_engine.py** — Código del modelo Prophet
- **requirements.txt** — Dependencias Python

---

## 🎯 Qué Esperar

**Con datos actuales (solo históricos):**
- ML Forecast basado en tendencia + estacionalidad
- Rango de confianza 95%
- Comparación vs. promedio histórico 12 meses

**Cuando agregues datos UK + Real:**
- Comparación 3-way: ML vs. UK vs. Real
- Accuracy tracking automático
- Identificación: ¿quién predice mejor? (ML o UK)
- Early warnings cuando UK está >20% fuera de banda ML

---

## ✅ Todo Listo!

Sistema de ML Forecast operacional. Ejecuta `./run_forecast.sh` y en 5 minutos tendrás predicciones para Top 20 SKUs.
