# StratosCore — Arquitectura de Seguridad Multi-Tenant

> Ultima actualizacion: 2026-04-10

---

## Modelo de aislamiento

Cada cliente en Business OS tiene 3 capas de aislamiento:

### 1. Aislamiento de datos (PostgreSQL RLS)

Todas las tablas de cliente tienen Row Level Security activado. Las policies filtran por `tenant_id` o por usuario autenticado automaticamente.

```sql
-- Ejemplo: tabla de oportunidades de Bidhunter
CREATE POLICY "Users can only see their own data"
ON bh_opportunities
FOR ALL
USING (auth.uid() = user_id);
```

**Efecto:** Un query de Videndum NUNCA puede retornar datos de MedCare, sin importar que compartan la misma base de datos.

**Auditoria:** `scripts/audit-rls.sql` verifica que todas las tablas tengan RLS activo.

### 2. Aislamiento de rutas (Next.js App Router)

Cada cliente tiene su propio namespace de rutas:

```
/videndum/*      → Features Videndum
/mobility/*      → Features Mobility
/medcare/*       → Features MedCare
/finanzas/*      → Finanzas personales
/api/videndum/*  → APIs Videndum
/api/mobility/*  → APIs Mobility
/api/medcare/*   → APIs MedCare
/api/bidhunter/* → APIs Bidhunter
/api/finance/*   → APIs Finance
```

**Efecto:** Un usuario navegando `/videndum` no puede acceder a componentes de `/medcare` sin autenticacion.

### 3. Aislamiento de deploy (Vercel Serverless)

Cada API route se ejecuta como una serverless function independiente. Un crash en `/api/medcare/analytics` no afecta a `/api/videndum/dashboard`.

**Efecto:** Fallo en un modulo no tumba otros modulos. No hay proceso compartido.

---

## Autenticacion por capa

| Capa | Metodo | Implementacion |
|------|--------|----------------|
| Frontend (pages) | Supabase session cookie | Middleware verifica `sb-*-auth-token` cookie |
| API routes internas | `requireAuth()` | `src/lib/supabase/auth-guard.ts` — verifica `getUser()` |
| API routes publicas | Rate limiting | Solo availability, book, webhooks |
| Chrome extension | API key en header | `X-Extension-Key` → `BIDHUNTER_EXTENSION_KEY` |
| Crons | Bearer token | `CRON_SECRET` en header Authorization |
| Webhooks externos | Secret validation | `HULI_WEBHOOK_SECRET` para Huli |
| Agent Server | Bearer token | `OPENCLAW_GATEWAY_TOKEN` |

---

## Tablas por modulo

### Videndum
- `videndum_annual_sales` — RLS por auth
- `videndum_products` — RLS por auth
- `videndum_forecasts` — RLS por auth
- + 8 tablas mas (discovery, feedback, requirements, etc)

### MedCare
- `medcare_leads` — RLS activo, datos de pacientes
- `medcare_servicios` — RLS activo, catalogo

### Bidhunter
- `bh_opportunities` — RLS por auth
- `bh_opportunity_scores` — RLS por auth
- `bh_documents` — RLS por auth
- `bh_pipeline_log` — RLS por auth

### Finanzas
- `transacciones` — Datos personales de Carlos
- `cuentas` — Datos personales
- `finance_categories` — Configuracion
- `gastos_mensuales` / `gastos_anuales` / `gastos_recurrentes`

---

## Plan de separacion

Cuando un cliente justifique su propio proyecto Supabase:

| Trigger | Accion |
|---------|--------|
| Regulacion HIPAA/datos medicos estrictos | MedCare a su propio proyecto Supabase |
| Cliente pide aislamiento contractual | Nuevo proyecto Supabase, mismo codebase |
| >50K filas en tablas del cliente | Evaluar proyecto dedicado por performance |

**Proceso de separacion:**
1. Crear nuevo proyecto Supabase
2. Migrar tablas del cliente (export → import)
3. Cambiar env vars del modulo para apuntar al nuevo proyecto
4. Verificar RLS en nuevo proyecto
5. Redirect de API routes al nuevo proyecto

**Tiempo estimado: 1-2 dias.**

---

## Respuesta para prospectos

**No tecnico:** "Sus datos estan completamente separados de otros clientes. Es como tener su propio banco de datos privado dentro de nuestra plataforma. Nadie mas puede ver su informacion."

**Tecnico:** "Row Level Security en PostgreSQL con policies por tenant. Rutas aisladas por namespace. Serverless functions independientes — un crash en un modulo no afecta otros. Si necesita aislamiento total, migramos su data a un proyecto Supabase dedicado en 1-2 dias."
