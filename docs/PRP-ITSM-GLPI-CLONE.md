# PRP — ITSM Platform (GLPI-like) sobre StratosCore
**Product Requirements Proposal**
Fecha: 2026-04-18 | Autor: Carlos Mario + Claude
Status: Draft v1 — pendiente validación

---

## 1. Visión

Construir una plataforma ITSM moderna equivalente al núcleo funcional de **GLPI** (help desk + gestión de activos + CMDB), aprovechando la infraestructura multi-tenant de **Business OS** y los 18 skills de **SaaS Factory V4**.

**Diferenciadores vs GLPI:**
- IA nativa para triaje y resolución de tickets (GLPI no la tiene)
- Notificaciones por WhatsApp + Telegram + email
- UI moderna (Next.js 16 + React 19) vs PHP legacy de GLPI
- Multi-tenant SaaS desde día 1 (cada empresa aislada por RLS)
- Integración con el resto del ecosistema StratosCore

**Principio rector:** No clonar GLPI 1:1 (son 20 años de features). Replicar el **80% más usado** con stack moderno y UX superior.

---

## 2. Alcance

### 2.1 Dentro del alcance (MVP — Fase 1)

| Módulo | Features | Prioridad |
|--------|----------|-----------|
| **Help Desk** | Tickets (CRUD), estados, prioridades, asignación, comentarios, adjuntos, SLA básico | P0 |
| **Inventario** | Activos HW/SW (manual + CSV import), categorías, ubicaciones, estados | P0 |
| **CMDB básico** | Relaciones activo↔activo, activo↔usuario, activo↔ticket | P1 |
| **Usuarios/Roles** | Admin, Técnico, Cliente final. Multi-tenant con RLS | P0 |
| **Knowledge Base** | Artículos markdown, categorías, búsqueda full-text | P1 |
| **Dashboard** | Tickets abiertos, SLA breach, activos por estado, carga por técnico | P0 |
| **Notificaciones** | Email (Resend) + WhatsApp (opcional) al cambiar estado de ticket | P1 |
| **IA (diferenciador)** | Auto-categorización de tickets, sugerencias de respuesta, búsqueda semántica en KB | P1 |

### 2.2 Fuera del alcance (Fase 2+)

- Agente de inventario automático (tipo GLPI Agent) — requiere binario nativo
- Gestión de contratos, licencias, compras con workflows
- Proyectos + Gantt
- Plugins de terceros
- Reporting personalizable drag-and-drop
- Federación LDAP/Active Directory (usaremos solo Supabase Auth en MVP)

---

## 3. Arquitectura Técnica

### 3.1 Stack

```
Frontend:     Next.js 16 (App Router) + React 19 + Tailwind + shadcn/ui
State:        Zustand (global) + React Query (server state)
Backend:      Next.js API Routes + Server Actions
DB:           Supabase Postgres + RLS multi-tenant
Auth:         Supabase Auth (email/password + magic link)
Storage:      Supabase Storage (adjuntos de tickets)
IA:           Claude Sonnet 4.6 via Anthropic SDK (triaje, sugerencias)
Notif:        Resend (email) + WhatsApp Business API (opcional)
Deploy:       Vercel (frontend) + Supabase (DB/Auth/Storage)
```

### 3.2 Ubicación en el monorepo

```
business-os/
├── src/features/
│   └── itsm/                      ← Nuevo módulo
│       ├── tickets/
│       ├── assets/
│       ├── cmdb/
│       ├── knowledge-base/
│       └── dashboard/
├── src/app/
│   └── (itsm)/
│       ├── tickets/
│       ├── activos/
│       └── kb/
└── supabase/migrations/
    └── 20260418_itsm_schema.sql   ← Nuevo schema
```

**Decisión:** ITSM vive como módulo dentro de `business-os` (igual que Finanzas), no como proyecto separado. Aprovecha auth, layout, multi-tenant, y deployment existente.

### 3.3 Schema de base de datos (resumen)

```sql
-- Tabla principal: tickets
itsm_tickets (
  id uuid PK,
  tenant_id uuid FK,           -- multi-tenant
  numero serial,               -- TK-0001
  titulo text,
  descripcion text,
  estado enum,                 -- abierto, en_progreso, resuelto, cerrado
  prioridad enum,              -- baja, media, alta, critica
  tipo enum,                   -- incidente, solicitud, problema
  categoria_id uuid FK,
  creador_id uuid FK,          -- usuario que abre
  asignado_id uuid FK,         -- técnico
  sla_vence timestamptz,
  activo_id uuid FK NULL,      -- CI relacionado
  created_at, updated_at, resuelto_at, cerrado_at
)

itsm_ticket_comentarios (ticket_id, autor_id, contenido, adjuntos, visible_cliente)
itsm_ticket_adjuntos (ticket_id, storage_path, nombre, tamaño)

-- Inventario
itsm_activos (id, tenant_id, nombre, tipo, marca, modelo, serial, estado, ubicacion_id, asignado_usuario_id, ...)
itsm_activo_relaciones (activo_origen_id, activo_destino_id, tipo_relacion)
itsm_ubicaciones (id, tenant_id, nombre, parent_id)

-- Categorías y SLAs
itsm_categorias (id, tenant_id, nombre, parent_id, sla_horas)
itsm_slas (id, tenant_id, nombre, tiempo_respuesta, tiempo_resolucion)

-- Knowledge Base
itsm_kb_articulos (id, tenant_id, titulo, contenido_md, categoria_id, autor_id, publicado, views)

-- Roles
itsm_roles_usuario (usuario_id, tenant_id, rol)  -- admin, tecnico, cliente
```

**RLS:** toda tabla filtra por `tenant_id = auth.jwt() ->> 'tenant_id'`. Aislamiento total entre empresas cliente.

---

## 4. Roadmap por Fases

```
Fase 1 — MVP Help Desk (2-3 semanas)
Fase 2 — Inventario + CMDB (1-2 semanas)
Fase 3 — IA + Knowledge Base (1 semana)
Fase 4 — Notificaciones + Dashboard (1 semana)
Fase 5 — Onboarding de tu amigo como primer cliente (1 semana)
─────────────────────────────────────────────
Total MVP completo: 6-8 semanas
```

### Fase 1 — MVP Help Desk (semanas 1-3)

**Sprint 1.1 — Scaffolding + Auth + Schema**
- [ ] Usar skill `supabase` para crear migración `itsm_schema.sql`
- [ ] Usar skill `add-login` si se necesita roles custom (admin/tecnico/cliente)
- [ ] Crear estructura `src/features/itsm/` con Zustand store
- [ ] RLS policies multi-tenant verificadas con tests

**Sprint 1.2 — CRUD de Tickets**
- [ ] Lista de tickets con filtros (estado, prioridad, asignado, tenant)
- [ ] Crear ticket (formulario con categoría, prioridad, adjuntos)
- [ ] Detalle de ticket con timeline de comentarios
- [ ] Cambio de estado + reasignación
- [ ] Búsqueda full-text en Postgres

**Sprint 1.3 — Roles y permisos**
- [ ] Cliente final: solo ve sus propios tickets
- [ ] Técnico: ve tickets asignados + de su categoría
- [ ] Admin: ve todo del tenant
- [ ] RouteGuard por rol

### Fase 2 — Inventario + CMDB (semanas 4-5)

- [ ] CRUD de activos (tipos: PC, servidor, switch, impresora, licencia SW, etc.)
- [ ] Import CSV de activos existentes
- [ ] Relaciones entre activos (drag-and-drop visual con React Flow)
- [ ] Vincular activo a ticket (clic desde ticket → "activo afectado")
- [ ] Historial de cambios por activo (audit log)

### Fase 3 — IA + Knowledge Base (semana 6)

- [ ] KB con editor markdown (tiptap o editor de shadcn)
- [ ] Búsqueda semántica con embeddings (pgvector en Supabase)
- [ ] **IA features:**
  - Al crear ticket, auto-sugerir categoría y prioridad
  - Auto-sugerir artículos relacionados de KB
  - Botón "Sugerir respuesta" en comentarios (usa Claude + contexto del ticket)
  - Resumen del ticket si tiene >10 comentarios

### Fase 4 — Notificaciones + Dashboard (semana 7)

- [ ] Email al cliente cuando cambia estado de su ticket (Resend)
- [ ] Email al técnico cuando se le asigna un ticket
- [ ] Dashboard con métricas:
  - Tickets abiertos por prioridad
  - SLA breach (en riesgo, vencidos)
  - Tiempo promedio de resolución
  - Carga por técnico
  - Activos por estado
- [ ] (Opcional) Integración WhatsApp vía agent-server Telegram-style

### Fase 5 — Onboarding del amigo (semana 8)

- [ ] Crear tenant para su empresa
- [ ] Importar sus tickets/activos actuales
- [ ] Capacitación (30 min video)
- [ ] Feedback loop: iterar 1 semana con él usándolo real

---

## 5. Skills de SaaS Factory a usar

| Skill | Uso en este proyecto |
|-------|----------------------|
| `prp` | Este documento + refinamiento por fase |
| `bucle-agentico` | Implementación iterativa de cada sprint |
| `supabase` | Migraciones, RLS, queries complejas |
| `add-login` | Auth con roles custom |
| `add-emails` | Notificaciones de tickets |
| `ai` | Auto-categorización, sugerencias, búsqueda semántica |
| `playwright-cli` | Tests E2E del flujo de tickets |
| `memory-manager` | Decisiones arquitectónicas persistentes |

---

## 6. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Scope creep (querer replicar todo GLPI) | Alto | PRP estricto, Fase 2+ solo después de validar MVP con usuario real |
| RLS mal configurado → leak entre tenants | Crítico | Tests automatizados de RLS en CI, skill `supabase` tiene checklist |
| UX inferior a GLPI en casos complejos | Medio | Feedback temprano del amigo desde Fase 1.2 |
| Costo de Claude API en auto-categorización | Bajo | Cache de categorizaciones por hash de título+descripción; usar Haiku 4.5 no Opus |
| Migración de datos de GLPI existente (si amigo ya lo usa) | Medio | Script de import CSV en Fase 5, no bloqueante del MVP |

---

## 7. Métricas de Éxito

**MVP validado cuando:**
- El amigo usa el sistema 1 semana completa sin volver a GLPI
- Tiempo para crear un ticket < 30 segundos (vs ~60s en GLPI)
- Auto-categorización de IA tiene >80% de precisión (medida vs reasignación manual)
- 0 leaks entre tenants en auditoría de RLS
- Lighthouse score >90 en mobile

---

## 8. Decisiones Pendientes (bloqueadores leves)

1. **¿El amigo será el primer cliente real o un beta-tester?** (afecta si es producto comercial o favor personal)
2. **¿Tenant único o multi-tenant desde el inicio?** → Recomiendo multi-tenant desde día 1; el costo incremental es bajo y abre el producto comercial.
3. **¿Nombre del producto?** → Sugerencias: `StratosDesk`, `StratosITSM`, `HelixDesk`, `Corehelp`.
4. **¿WhatsApp en MVP o Fase 2?** → Recomiendo Fase 2; email es suficiente para validar.
5. **¿Venderlo como producto SaaS o hosteo dedicado?** → SaaS multi-tenant es 10x más escalable; decidir al final del MVP.

---

## 9. Siguiente Paso Inmediato

Si Carlos aprueba este PRP:

1. Crear branch `feature/itsm-mvp` en `business-os`
2. Invocar skill `supabase` para generar migración del schema
3. Invocar skill `bucle-agentico` con Sprint 1.1 como primer objetivo
4. Demo funcional en 5 días (lista + crear + detalle de tickets)

---

**Decisión requerida de Carlos:**
- [ ] Aprobar alcance del MVP (Fase 1-4)
- [ ] Confirmar nombre del producto
- [ ] Confirmar si el amigo es primer cliente comercial o beta-tester
- [ ] Dar luz verde para empezar Sprint 1.1
