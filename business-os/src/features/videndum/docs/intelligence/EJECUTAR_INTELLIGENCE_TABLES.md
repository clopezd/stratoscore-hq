# Ejecutar Migración de Intelligence Tables en Supabase

> **Archivo SQL:** `business-os/supabase/migrations/008_intelligence_tables.sql`
> **Propósito:** Crear tablas de inteligencia para forecasting, competitor analysis, market trends, y AI insights

---

## 📋 Pasos para Ejecutar

### **1. Abrir Supabase SQL Editor**

1. Ir a: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv
2. Login con tu cuenta
3. En el menú lateral izquierdo, click en **"SQL Editor"**

---

### **2. Copiar el SQL**

Ejecuta en tu terminal:

```bash
cat /home/cmarioia/proyectos/stratoscore-hq/business-os/supabase/migrations/008_intelligence_tables.sql
```

O abre el archivo directamente desde VSCode:
- `business-os/supabase/migrations/008_intelligence_tables.sql`

---

### **3. Pegar y Ejecutar en Supabase**

1. En el SQL Editor de Supabase, click en **"New query"**
2. Pega todo el contenido del archivo `008_intelligence_tables.sql`
3. Click en **"Run"** (botón verde abajo a la derecha)

Deberías ver:

```
Success. No rows returned
```

---

### **4. Verificar que las Tablas Fueron Creadas**

En el SQL Editor, ejecuta este query:

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

**Resultado esperado:**

```
table_name
────────────────────────────────
ai_insights
competitor_analysis
market_trends
product_obsolescence_scores
sync_metadata
videndum_forecast
```

✅ **6 tablas creadas**

---

### **5. Verificar Seed Data de sync_metadata**

Ejecuta:

```sql
SELECT source, status, records_synced
FROM sync_metadata
ORDER BY source;
```

**Resultado esperado:**

```
source                 | status  | records_synced
───────────────────────┼─────────┼───────────────
ai_insights_agent      | success | 0
competitor_agent       | success | 0
forecasting_agent      | success | 0
market_trends_agent    | success | 0
obsolescence_agent     | success | 0
videndum_excel         | success | 0
```

✅ **6 sources inicializados**

---

## 📊 Tablas Creadas

| Tabla | Propósito | Actualización |
|---|---|---|
| **sync_metadata** | Tracking de sincronizaciones de agents | Cada agent run |
| **videndum_forecast** | Forecasting predictivo (revenue, order intake) | Diario (2:00 AM) |
| **competitor_analysis** | Inteligencia de competidores (precios, market share) | Semanal (Lunes 3:00 AM) |
| **market_trends** | Tendencias de mercado (tech, economic, regulatory) | Semanal (Martes 3:00 AM) |
| **product_obsolescence_scores** | Risk scoring de obsolescencia por SKU | Semanal (Miércoles 3:00 AM) |
| **ai_insights** | Insights generados por Claude AI | Diario (5:00 AM) |

---

## ✅ Siguiente Paso

Una vez ejecutado el SQL en Supabase, avísame y continuamos con la implementación de los **agents** que poblarán estas tablas.

---

## 🔍 Troubleshooting

### Error: "relation already exists"
- **Causa:** Ya ejecutaste el SQL antes
- **Solución:** No hay problema, el SQL usa `CREATE TABLE IF NOT EXISTS`

### Error: "permission denied"
- **Causa:** Usuario sin permisos
- **Solución:** Asegúrate de estar logged in como owner del proyecto en Supabase

### Error: "syntax error"
- **Causa:** SQL incompleto al copiar/pegar
- **Solución:** Asegúrate de copiar TODO el contenido del archivo (4300+ líneas)
