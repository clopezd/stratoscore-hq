# Formulario de Levantamiento de Requerimientos - Videndum

> Sistema integrado para capturar las necesidades específicas del cliente y diseñar la solución de análisis y forecast a la medida.

---

## 🎯 Objetivo

Recopilar información completa sobre el negocio del cliente, su proceso actual, datos disponibles, y expectativas para diseñar un dashboard de análisis y forecast perfectamente ajustado a sus necesidades.

---

## 📋 Estructura del Formulario

### 10 Secciones de Levantamiento

#### **Información Básica**
- Nombre del Cliente / Empresa
- Rol de la persona de contacto

#### **1️⃣ Contexto del Negocio**
- Tipo de negocio (Manufactura, Distribución, etc.)
- Cantidad de SKUs
- Tamaño del equipo de planeación
- Herramientas actuales (Excel, ERP, Power BI, etc.)

#### **2️⃣ Proceso Actual de Forecast**
- Frecuencia de forecast (Diario, Semanal, Mensual, etc.)
- Horizonte de forecast (meses)
- Método actual (Manual, ML, Promedio móvil, etc.)
- Pain points del proceso actual

#### **3️⃣ Datos Disponibles**
- ¿Tienen historial de ventas reales? (Meses disponibles)
- ¿Hay factores externos que afectan? (Estacionalidad, promociones, etc.)
- Problemas de calidad de datos

#### **4️⃣ Métricas y KPIs Críticos**
- KPIs principales (MAPE, Fill Rate, Stockout %, etc.)
- MAPE aceptable (threshold)
- SKUs críticos que requieren mayor precisión
- Restricciones de planeación (MOQ, lead times, capacidad)

#### **5️⃣ Flujo de Decisiones**
- Quién crea el forecast inicial
- Quién aprueba/valida
- Frecuencia de aprobaciones
- Acciones cuando detectan alta varianza

#### **6️⃣ Integración y Outputs**
- ¿Necesitan exportar datos? (Excel, CSV, API, etc.)
- ¿Necesitan alertas automáticas? (Triggers)
- Sistemas a integrar (SAP, Odoo, WMS, etc.)

#### **7️⃣ Visualización y Reportes**
- Tipos de gráficos preferidos
- Quiénes usarán el dashboard
- Frecuencia de reportes ejecutivos
- ¿Necesitan acceso móvil?

#### **8️⃣ Expectativas y Prioridades**
- Top 3 prioridades (Precisión, Velocidad, Usabilidad, etc.)
- Mejora esperada vs sistema actual
- Urgencia de implementación (ASAP, 1 mes, 3 meses, Flexible)
- Rango de presupuesto (opcional)

#### **9️⃣ Casos de Uso Específicos**
- Caso de uso principal
- Caso de uso secundario
- Edge cases especiales

#### **🔟 Información Adicional**
- Criterios de éxito del proyecto
- Stakeholders clave
- Comentarios adicionales

---

## 🗂️ Arquitectura Técnica

### Base de Datos

**Tabla:** `client_requirements`

```sql
CREATE TABLE public.client_requirements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  client_name TEXT NOT NULL,
  contact_role TEXT,
  submitted_at TIMESTAMPTZ,

  -- 10 secciones de requerimientos
  -- (ver supabase/migrations/013_client_requirements_videndum.sql)

  status TEXT DEFAULT 'pending', -- pending | in_review | approved | implemented
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**RLS Policies:**
- ✅ Usuarios ven solo sus propios requerimientos
- ✅ Usuarios pueden insertar sus propios requerimientos
- ✅ Usuarios pueden actualizar requerimientos en status 'pending'
- ✅ Admins ven y actualizan todos los requerimientos

### API Endpoints

**POST `/api/videndum/requirements`**
- Guardar nuevo levantamiento de requerimientos
- Requiere autenticación
- Valida campos obligatorios (client_name)
- Status inicial: 'pending'

**GET `/api/videndum/requirements`**
- Obtener requerimientos del usuario (o todos si admin)
- Requiere autenticación
- Ordenados por fecha de envío (desc)

**PATCH `/api/videndum/requirements/:id`**
- Actualizar status de un requerimiento (solo admins)
- Status: pending → in_review → approved → implemented
- Registra reviewed_by y reviewed_at

### Componentes

**ClientRequirementsForm.tsx**
- Formulario multi-sección con navegación (10 pasos)
- Progress bar visual
- Validación básica en frontend
- Estados: loading, success, error
- Submit final en sección 10

**VidendumTabs.tsx**
- Tab "Requerimientos" con icono ClipboardList
- Tooltip: "Levantamiento de requerimientos para diseñar el dashboard a tu medida"
- Ruta: `/videndum/requirements`

---

## 🚀 Instalación

### 1. Aplicar Migración en Supabase

**Opción A: SQL Editor (Recomendado)**
```sql
-- Copiar el contenido completo de:
-- supabase/migrations/013_client_requirements_videndum.sql
-- Pegar en SQL Editor de Supabase Dashboard y ejecutar
```

**Opción B: Node Script**
```bash
cd business-os
node scripts/migrations/apply-requirements-migration.mjs
```

**Opción C: psql**
```bash
PGPASSWORD='RkY.BPf56*wkuvW' psql \
  -h aws-0-us-west-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.csiiulvqzkgijxbgdqcv \
  -d postgres \
  -f supabase/migrations/013_client_requirements_videndum.sql
```

### 2. Verificar Instalación

```bash
# El tab "Requerimientos" debe aparecer en /videndum
# La página debe cargar en /videndum/requirements
# El formulario debe renderizar las 10 secciones
```

---

## 📍 Uso

### Para el Cliente

1. Navegar a `/videndum/requirements`
2. Llenar el formulario (10-15 minutos)
3. Navegar entre secciones con "Anterior" / "Siguiente"
4. Progress bar muestra avance
5. Submit final en sección 10
6. Confirmación visual de éxito

### Para el Admin

1. **Ver requerimientos**: `GET /api/videndum/requirements`
2. **Revisar**: Analizar las respuestas del cliente
3. **Actualizar status**: `PATCH /api/videndum/requirements/:id`
   ```json
   {
     "id": "uuid",
     "status": "in_review" // o "approved" / "implemented"
   }
   ```
4. **Diseñar solución**: Usar las respuestas para customizar el dashboard

---

## 🎨 Características del Formulario

✅ **Navegación multi-sección**
- 10 secciones con navegación Anterior/Siguiente
- Progress bar visual
- Validación de campos requeridos

✅ **Tipos de inputs**
- Text inputs
- Textareas
- Number inputs
- Select dropdowns
- Checkboxes
- Arrays (comma-separated)

✅ **UX optimizada**
- Auto-scroll al cambiar de sección
- Success screen post-submit
- Error handling
- Loading states
- Responsive design

✅ **Datos estructurados**
- Arrays para listas (KPIs, factores externos, etc.)
- Enums para opciones fijas (frecuencia, urgencia, etc.)
- Booleans para toggles
- Timestamps automáticos

---

## 📊 Estados del Requerimiento

| Status | Descripción |
|--------|-------------|
| `pending` | Recién enviado por el cliente, esperando revisión |
| `in_review` | Admin está revisando y analizando las respuestas |
| `approved` | Requerimientos aprobados, listos para implementación |
| `implemented` | Solución implementada según los requerimientos |

---

## 🔍 Queries Útiles

### Ver todos los requerimientos pendientes
```sql
SELECT
  client_name,
  contact_role,
  submitted_at,
  top_3_priorities,
  timeline_urgency
FROM client_requirements
WHERE status = 'pending'
ORDER BY submitted_at DESC;
```

### Ver KPIs más solicitados
```sql
SELECT
  unnest(primary_kpis) AS kpi,
  COUNT(*) AS frequency
FROM client_requirements
GROUP BY kpi
ORDER BY frequency DESC;
```

### Ver urgencia promedio
```sql
SELECT
  timeline_urgency,
  COUNT(*) AS count
FROM client_requirements
GROUP BY timeline_urgency
ORDER BY count DESC;
```

---

## 🔐 Seguridad

- ✅ **Autenticación obligatoria**: Solo usuarios autenticados pueden llenar el formulario
- ✅ **RLS habilitado**: Cada usuario solo ve sus propios requerimientos
- ✅ **Admin-only updates**: Solo admins pueden cambiar el status
- ✅ **Audit trail**: `reviewed_by` y `reviewed_at` registran quién aprobó
- ✅ **Timestamps**: `created_at` y `updated_at` automáticos

---

## 📁 Archivos Creados

```
business-os/
├── supabase/migrations/
│   └── 013_client_requirements_videndum.sql      # Migración de DB
├── src/
│   ├── app/
│   │   ├── api/videndum/requirements/
│   │   │   └── route.ts                          # API endpoints
│   │   └── (main)/videndum/requirements/
│   │       └── page.tsx                          # Página principal
│   └── features/videndum/components/
│       └── ClientRequirementsForm.tsx            # Formulario
├── scripts/migrations/
│   └── apply-requirements-migration.mjs          # Script de instalación
└── docs/videndum/
    └── LEVANTAMIENTO_REQUERIMIENTOS.md          # Esta documentación
```

---

## 🎯 Próximos Pasos

1. ✅ Cliente llena el formulario de requerimientos
2. 📋 Admin revisa las respuestas
3. 🎨 Se diseña la solución customizada según las necesidades capturadas
4. 🚀 Se implementa el dashboard a medida
5. ✅ Se marca el requerimiento como 'implemented'

---

## 🤝 Notas para el Desarrollador

### Agregar nuevas preguntas

1. Actualizar la tabla en `013_client_requirements_videndum.sql`
2. Agregar campo en `ClientRequirementsPayload` (route.ts)
3. Agregar input en `ClientRequirementsForm.tsx`
4. Aplicar migración con `ALTER TABLE`

### Integrar con otros sistemas

```typescript
// Ejemplo: Enviar email cuando se envía un requerimiento
export async function POST(request: Request) {
  // ... guardar en DB

  // Notificar al equipo
  await sendEmail({
    to: 'team@stratoscore.app',
    subject: `Nuevo levantamiento: ${payload.client_name}`,
    body: `Cliente: ${payload.client_name}\nUrgencia: ${payload.timeline_urgency}`
  })
}
```

---

**Última actualización:** 2026-03-17
**Versión:** 1.0
**Mantenedor:** StratosCore Team
