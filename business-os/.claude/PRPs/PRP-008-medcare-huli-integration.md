# PRP-008: MedCare × HuliPractice — Middleware de Crecimiento

**Cliente:** MedCare Centro Médico (Medaquere S.A.)
**Fecha:** 2026-04-07
**Estado:** 🔨 En desarrollo — spec completo obtenido
**Prioridad:** Alta — mamógrafo con agenda vacía

---

## Contexto

MedCare ya usa **HuliPractice** como su sistema EHR/Practice Management. La oportunidad es construir un middleware que conecte el sistema de captación de pacientes (leads, WhatsApp, landing) directamente con la agenda de Huli, creando un ciclo automático:

```
Captación → Calificación → Agendamiento (Huli) → Confirmación → Seguimiento
```

### Información Confirmada de Huli API (2024, soporte directo)

| Aspecto | Detalle |
|---------|---------|
| **API** | REST, documentada en api.huli.io/docs |
| **Auth** | API Key → JWT (POST /practice/v2/authorization/token) |
| **Header requerido** | `id_organization` en todas las requests |
| **Webhooks** | `APPOINTMENT_CREATED`, `APPOINTMENT_UPDATED`, `APPOINTMENT_CANCELLED`, `APPOINTMENT_RESCHEDULED`, `CHECKUP_CREATED`, `CHECKUP_UPDATED` |
| **Webhooks setup** | Solicitar a soporte@hulipractice.com |
| **Endpoints clave** | patient-file (CRUD), availability, appointment (CRUD + cancel/confirm/reschedule/no-show), doctor |

### Lo Que Ya Existe en Business OS

- `medcare_servicios` — tabla de servicios (mamografía, ultrasonido)
- `medcare_leads` — leads con estado, fuente, UTM tracking
- Dashboard autenticado (`/medcare`)
- Landing pública (`/medcare/agendar-estudio`)
- Tipos TypeScript completos (`features/medcare/types/`)

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│                    CAPTACIÓN                             │
│  Landing /agendar  │  WhatsApp Bot  │  Referido Médico  │
└────────┬───────────┴───────┬────────┴───────┬───────────┘
         │                   │                │
         ▼                   ▼                ▼
┌─────────────────────────────────────────────────────────┐
│              MEDCARE ENGINE (Business OS)                │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ LeadManager  │  │ IntentEngine │  │ HuliConnector  │ │
│  │ (Supabase)   │→ │ (Claude SDK) │→ │ (REST client)  │ │
│  └─────────────┘  └──────────────┘  └───────┬────────┘ │
│                                              │          │
│  ┌─────────────────────────────────────────┐ │          │
│  │ WebhookReceiver ← Huli Webhooks        │◄┘          │
│  │ (sync estado cita ↔ lead)               │            │
│  └─────────────────────────────────────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────┐            │
│  │ NotificationEngine                       │            │
│  │ (WhatsApp confirmación + recordatorios)  │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                  HULI PRACTICE (EHR)                     │
│  Agenda │ Pacientes │ Doctores │ Disponibilidad          │
└─────────────────────────────────────────────────────────┘
```

---

## Fases de Implementación

### Fase 1: HuliConnector — API Client (Semana 1)

**Objetivo:** Módulo TypeScript que encapsula toda comunicación con Huli API.

#### Archivos nuevos:
```
src/features/medcare/
├── lib/
│   ├── huli-client.ts          # REST client base (fetch + auth + error handling)
│   ├── huli-types.ts           # Tipos TypeScript de entidades Huli
│   └── huli-connector.ts       # Funciones de negocio (buscar disponibilidad, crear cita, etc.)
```

#### Endpoints esperados (pendiente validar con spec):
```typescript
// Disponibilidad
GET  /appointments/availability?doctor_id=X&date=YYYY-MM-DD
// Crear cita
POST /appointments { patient_id, doctor_id, datetime, service_type, notes }
// Buscar/crear paciente
GET  /patients?phone=XXXX | POST /patients { name, phone, email, ... }
// Doctores
GET  /doctors?specialty=radiologia
// Cita individual
GET  /appointments/:id
PATCH /appointments/:id { status }
```

#### Configuración:
```env
# .env.local
HULI_API_KEY=xxx                    # API Key (solicitar al owner de la org en Huli)
HULI_ORGANIZATION_ID=4001           # ID de organización (se entrega con el API Key)
HULI_API_URL=https://api.huli.io    # Base URL
HULI_WEBHOOK_SECRET=xxx             # Secret para validar webhooks entrantes
```

#### Validación:
- [ ] Conectar con sandbox de Huli
- [ ] Listar doctores disponibles
- [ ] Consultar slots de disponibilidad
- [ ] Crear paciente de prueba
- [ ] Crear cita de prueba

---

### Fase 2: Webhook Receiver (Semana 1-2)

**Objetivo:** Endpoint que recibe notificaciones de Huli y sincroniza estado con `medcare_leads`.

#### Archivos nuevos:
```
src/app/api/medcare/webhooks/huli/route.ts   # POST handler
src/features/medcare/services/syncService.ts  # Lógica de sincronización
```

#### Eventos manejados:
| Evento Huli | Acción en Business OS |
|-------------|----------------------|
| `cita.created` | Lead → `cita_agendada`, guardar `huli_appointment_id` |
| `cita.modified` | Actualizar fecha/hora en lead, notificar paciente |
| `cita.cancelled` | Lead → `contactado` (re-engagement), notificar |
| `cita.rescheduled` | Actualizar fecha, enviar nueva confirmación |

#### Migración SQL:
```sql
-- Agregar campos Huli a medcare_leads
ALTER TABLE medcare_leads ADD COLUMN huli_patient_id text;
ALTER TABLE medcare_leads ADD COLUMN huli_appointment_id text;
ALTER TABLE medcare_leads ADD COLUMN huli_appointment_status text;
ALTER TABLE medcare_leads ADD COLUMN fecha_cita timestamptz;
```

---

### Fase 3: Flujo de Agendamiento Integrado (Semana 2-3)

**Objetivo:** El formulario público y el WhatsApp bot agendan directo en Huli.

#### Flujo landing `/medcare/agendar-estudio`:
```
1. Paciente llena formulario (nombre, teléfono, tipo estudio, fecha preferida)
2. Server action: crear lead en Supabase
3. Server action: buscar/crear paciente en Huli
4. Server action: consultar disponibilidad Huli para fecha preferida
5. Mostrar slots disponibles al paciente
6. Paciente selecciona slot → crear cita en Huli
7. Confirmación por WhatsApp/SMS
```

#### Archivos modificados:
```
src/features/medcare/components/FormularioAgendarEstudio.tsx  # Agregar selector de slots
src/app/medcare/agendar-estudio/page.tsx                      # Server actions
src/app/api/medcare/availability/route.ts                     # GET disponibilidad
src/app/api/medcare/book/route.ts                             # POST crear cita
```

---

### Fase 4: Dashboard Integrado (Semana 3)

**Objetivo:** Dashboard MedCare muestra datos reales de Huli + métricas de conversión.

#### Métricas:
- Citas agendadas hoy/semana/mes (de Huli)
- Ocupación del mamógrafo (slots usados vs disponibles)
- Funnel: Lead → Contactado → Agendado → Completado → No-show
- Tasa de conversión por fuente (Instagram, Google, WhatsApp, referido)
- Revenue estimado (citas × precio promedio)

#### Archivos:
```
src/features/medcare/components/DashboardMedcare.tsx  # Refactor con datos Huli
src/features/medcare/services/analyticsService.ts     # Métricas combinadas
src/app/api/medcare/analytics/route.ts                # API endpoint
```

---

### Fase 5: WhatsApp Bot + Recordatorios (Semana 4)

**Objetivo:** Bot WhatsApp que agenda citas y envía recordatorios automáticos.

> Depende de decisión: ¿usar WhatsApp Business API directo o a través de Huli (si lo soporta)?

#### Flujos:
1. **Agendamiento conversacional**: paciente escribe → Claude SDK califica → ofrece slots de Huli → confirma cita
2. **Recordatorio 24h antes**: cron que revisa citas de mañana → envía WhatsApp
3. **Recordatorio 2h antes**: segundo aviso
4. **Recordatorio anual**: 11 meses después → "ya te toca tu mamografía"

---

## Dependencias Externas

| Dependencia | Estado | Bloqueante? |
|-------------|--------|-------------|
| **Huli API Key + Organization ID** | ⏳ Pendiente — MedCare debe solicitar al owner | Sí para Fase 1 |
| **Huli API Spec** | ✅ Completo — v2.0.0 mapeado |
| **WhatsApp Business API** | ⏳ Pendiente — definir proveedor | Solo Fase 5 |
| **Precio mamografía** | ⏳ Pendiente — preguntar a MedCare | Solo para analytics |

---

## Lo Que Podemos Hacer HOY (Sin Spec)

1. **Crear estructura del HuliConnector** con interfaces abstractas
2. **Crear migración SQL** para campos Huli en `medcare_leads`
3. **Crear webhook receiver** con estructura lista para recibir eventos
4. **Refactorizar dashboard** para preparar métricas integradas
5. **Reactivar MedCare** — sacar de `_archived/` y actualizar estado

---

## Estimación

| Fase | Esfuerzo | Requiere Huli API Key |
|------|----------|----------------------|
| Fase 1: HuliConnector | 1 día | Sí (para probar) |
| Fase 2: Webhooks | 0.5 día | No (estructura) |
| Fase 3: Agendamiento | 1.5 días | Sí |
| Fase 4: Dashboard | 1 día | Parcial |
| Fase 5: WhatsApp | 2 días | Sí |
| **Total** | **~6 días** | — |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| API de Huli cambia vs info de 2024 | Diseño con interfaces abstractas, adapter pattern |
| MedCare no tiene API Key habilitada | Contactar Huli soporte para sandbox |
| Webhooks requieren URL pública | Usar Vercel deployment (ya tenemos) |
| WhatsApp API costosa | Evaluar alternativas: Twilio, 360dialog, o vía Huli si lo soporta |

---

*PRP generado por StratosCore — 2026-04-07*
