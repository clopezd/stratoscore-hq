# Security Audit — 2026-04-10

> Auditoria interna de API routes y RLS policies.
> Ejecutada por: Claude Agent + equipo StratosCore

---

## Resumen ejecutivo

| Metrica | Valor | Estado |
|---------|-------|--------|
| Total API routes | ~48 | - |
| Sin autenticacion | ~45% | CRITICO |
| Sin rate limiting | ~91% | ALTO |
| Con validacion de inputs | ~32% | MEDIO |

---

## Hallazgos criticos

### 1. Bidhunter — 0% autenticacion

**Severidad: CRITICA**

Todos los 15 endpoints de Bidhunter son publicos. Cualquier persona con la URL puede:
- Ver todas las oportunidades de negocio
- Generar y editar bids
- Subir y borrar documentos
- Ejecutar el scraper con credenciales
- Ver KPIs y reportes

**Endpoints afectados:**
- `POST /api/bidhunter/scrape` — Acepta email/password sin auth
- `GET/PUT /api/bidhunter/opportunities` — Lista completa expuesta
- `GET/DELETE /api/bidhunter/documents/[id]` — Borrar sin auth
- `POST /api/bidhunter/draft` — Generar bids sin auth
- `POST /api/bidhunter/add` — Agregar oportunidades sin auth
- `POST /api/bidhunter/import-extension` — CORS abierto
- Y 9 mas...

**Remediacion:** Agregar Supabase session auth o Bearer token a TODOS los endpoints.

### 2. MedCare — Datos medicos sin proteccion

**Severidad: CRITICA**

4 endpoints exponen datos de pacientes sin autenticacion:
- `GET /api/medcare/agenda` — Agenda del dia con nombres de pacientes
- `GET /api/medcare/analytics` — Metricas de citas y pacientes
- `GET /api/medcare/intelligence` — Inteligencia de negocio
- `POST /api/medcare/cancel` — Cancelar citas sin auth

**Remediacion:** Agregar Supabase session auth. Estos endpoints SOLO deben ser accesibles desde el dashboard autenticado.

### 3. Finance — Datos financieros personales expuestos

**Severidad: CRITICA**

Los 4 endpoints de finanzas usan `supabaseAdmin` (service client) sin verificar sesion del usuario:
- `GET/POST /api/finance/transactions`
- `GET/POST /api/finance/categories`
- `GET/POST /api/finance/cuentas`
- `GET /api/finance/summary`

**Remediacion:** Agregar Supabase session auth. Estos son datos financieros personales de Carlos.

### 4. Bidhunter Scraper — Credenciales en texto plano

**Severidad: ALTA**

`POST /api/bidhunter/scrape` acepta `{ email, password }` como JSON body sin autenticacion. Las credenciales del portal de scraping viajan como texto plano en el request body.

**Remediacion:** 
- Agregar autenticacion al endpoint
- Mover credenciales a environment variables (no enviar por API)
- O: encriptar credenciales antes de enviar

---

## Hallazgos de prioridad media

### 5. Rate limiting casi inexistente

Solo MedCare tiene rate limiting implementado (availability: 30/min, webhooks: 100/min, booking: 5/hr).

**Todos los demas modulos carecen de rate limiting.**

**Remediacion:** Implementar rate limiting global en middleware o por modulo.

### 6. Validacion de inputs inconsistente

- Videndum usa Zod (bien)
- MedCare usa checks manuales (aceptable)
- Bidhunter y Finance: validacion minima o nula

**Remediacion:** Estandarizar en Zod para todos los endpoints.

### 7. CORS abierto en import-extension

`/api/bidhunter/import-extension` tiene CORS habilitado para cualquier origen. Deberia restringirse al ID de la extension de Chrome.

---

## Modulos con buena seguridad (referencia)

### Videndum — BIEN
- 8 de 9 endpoints requieren Supabase session
- Dashboard usa Zod para validacion
- Cache headers configurados (300s)

### MedCare (parcial) — ACEPTABLE
- Webhooks con verificacion de token
- Crons con CRON_SECRET
- Rate limiting en endpoints publicos
- **Pero:** 4 endpoints internos sin auth

---

## Plan de remediacion

### Semana 1 — Criticos (datos expuestos)

| # | Accion | Endpoints | Responsable |
|---|--------|-----------|-------------|
| 1 | Auth en MedCare internos | agenda, analytics, intelligence, cancel | Security Analyst |
| 2 | Auth en Finance | transactions, categories, cuentas, summary | Security Analyst |
| 3 | Auth en Bidhunter (todos) | 15 endpoints | Lead Architect |
| 4 | Mover credenciales scraper a env vars | scrape | Lead Architect |

### Semana 2 — Altos

| # | Accion | Responsable |
|---|--------|-------------|
| 5 | Rate limiting global en middleware | Lead Architect |
| 6 | Restringir CORS en import-extension | Software Engineer |
| 7 | Auth en Mobility endpoints | Software Engineer |

### Semana 3 — Medios

| # | Accion | Responsable |
|---|--------|-------------|
| 8 | Estandarizar validacion con Zod | Software Engineer |
| 9 | Sanitizar mensajes de error en produccion | Software Engineer |
| 10 | Correr OWASP ZAP scan externo | Security Analyst |

---

## Tareas asignadas

### Para el Security Analyst (sobrino)

**Tarea 1: Auditar RLS de MedCare**
- Correr `scripts/audit-rls.sql` en Supabase SQL Editor
- Verificar que `medcare_leads` y `medcare_servicios` tienen RLS activo
- Verificar que las policies filtran por usuario autenticado
- Documentar hallazgos

**Tarea 2: Revisar endpoints MedCare**
- Intentar acceder a `GET /api/medcare/agenda` sin autenticacion (curl)
- Intentar acceder a `GET /api/medcare/analytics` sin autenticacion
- Documentar si los datos de pacientes son accesibles
- Proponer fix (agregar session check)

**Tarea 3: OWASP ZAP Scan**
- Instalar OWASP ZAP (zaproxy.org)
- Correr scan basico contra `https://stratoscore.app`
- Exportar reporte HTML
- Marcar findings criticos

### Para el Software Engineer (hijo)

**Tarea 1: Tests E2E de autenticacion**
- Escribir test Playwright que verifica:
  - Endpoints protegidos retornan 401 sin sesion
  - Endpoints publicos retornan 200 sin sesion
  - Login flow funciona end-to-end

**Tarea 2: Implementar auth en Finance endpoints**
- Agregar `createServerClient` de Supabase a cada route
- Verificar sesion antes de procesar request
- Retornar 401 si no hay sesion

**Tarea 3: Implementar auth en Mobility endpoints**
- Mismo patron que Finance
- Verificar sesion en agents/route.ts y acciones/route.ts

---

## Verificacion post-remediacion

Despues de aplicar fixes, verificar con:

```bash
# Endpoints protegidos deben retornar 401 sin auth
curl -s -o /dev/null -w "%{http_code}" https://stratoscore.app/api/medcare/agenda
# Esperado: 401

curl -s -o /dev/null -w "%{http_code}" https://stratoscore.app/api/finance/summary
# Esperado: 401

curl -s -o /dev/null -w "%{http_code}" https://stratoscore.app/api/bidhunter/opportunities
# Esperado: 401

# Endpoints publicos deben seguir funcionando
curl -s -o /dev/null -w "%{http_code}" https://stratoscore.app/api/medcare/availability?from=2026-04-10&to=2026-04-16
# Esperado: 200
```
