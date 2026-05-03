# MedCare — Centro Médico Especializado

> Imagenología diagnóstica de alta tecnología: mamografía digital 3D + ultrasonido mamario.
> Integración directa con HuliPractice para agendamiento y gestión de pacientes.

**Estado:** 🔨 En desarrollo — Integración HuliPractice activa
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)
**Ubicación:** 50m norte esquina NE Edificio Centro Colón, Merced, San José
**Teléfono:** 4070-0330 | **WhatsApp:** 8368-2100
**Horario:** L-V 8am-8pm | Sáb 8am-7pm
**Instagram:** @medcare_cr | **Web:** medcare.cr

---

## Servicios y Precios

### Precios regulares

| Estudio | Precio |
|---------|--------|
| Ultrasonido mamario | ₡49,000 |
| Mamografía digital 3D | ₡35,000 |
| Mamografía + Ultrasonido mamario | ₡65,000 |

### Promoción Mayo 2026

| Promo | Precio | Ahorro |
|-------|--------|--------|
| Mamografía + Ultrasonido mamario | **₡65,000** | ₡19,000 (23% off) |

**Flujo promo:** La mamografía se agenda automáticamente vía web. El ultrasonido se coordina por teléfono después de confirmar la mamografía.

---

## El Mamógrafo

MedCare cuenta con un mamógrafo de última generación con las siguientes capacidades:

### Tecnología

- **Tomosíntesis (3D):** Adquisición tridimensional completa de la mama, no solo una imagen plana. Permite reconstruir capas milímetro a milímetro para detectar lesiones que en 2D quedarían ocultas.
- **Adquisición 3D en 10 segundos:** Captura rápida que minimiza la incomodidad de la paciente y reduce artefactos por movimiento.
- **Menos dolor:** Diseño de compresión optimizado que reduce significativamente la molestia durante el estudio comparado con mamógrafos convencionales.
- **Calidad de imagen superior:** Resolución de alta definición que facilita la detección temprana de microcalcificaciones, masas y distorsiones arquitecturales.

### Inteligencia Artificial

- **IA integrada:** Algoritmos de detección asistida que marcan áreas sospechosas para el radiólogo, reduciendo la probabilidad de falsos negativos.
- **Hologramas mamarios:** Reconstrucción holográfica de la mama que permite al radiólogo visualizar la estructura en 3D completo.
- **Posicionamiento consistente:** La IA asegura que la mama quede posicionada de la misma manera en cada estudio, lo que:
  - Garantiza comparabilidad entre estudios previos y actuales
  - Produce imágenes ordenadas y estandarizadas
  - Facilita el diagnóstico del radiólogo al eliminar variaciones de posición

### Ventaja competitiva

La combinación de tomosíntesis + IA + hologramas posiciona a MedCare como centro de referencia en mamografía digital en Costa Rica. La mayoría de centros aún usan mamógrafos 2D convencionales.

---

## Equipo médico

### Radiólogos (operan ultrasonido)

| ID Huli | Nombre | Rol |
|---------|--------|-----|
| 49493 | Dr. Solís | Radiólogo |
| 18828 | Dr. Pastora | Radiólogo |
| 14145 | Dr. Hernández | Radiólogo |
| 97620 | Dr. Marden | Radiólogo |

### Equipo de mamografía

| ID Huli | Descripción |
|---------|-------------|
| 96314 | Mamógrafo digital 3D (equipo, no doctor) |

### Clínica

| ID Huli | Nombre |
|---------|--------|
| 9694 | MedCare Centro Médico Especializado |

---

## Integración Huli (REST API v2)

### Arquitectura

```
Paciente (web/WhatsApp)
    ↓
Formulario de agendamiento (/medcare/agendar-estudio)
    ↓
POST /api/medcare/book
    ↓
┌─────────────────────────────────────────┐
│  1. findOrCreatePatient (tel → nombre)  │
│  2. getAvailability (slots del doctor)  │
│  3. createAppointment (con sourceEvent) │
│  4. Guardar lead en Supabase            │
└─────────────────────────────────────────┘
    ↓
Huli EHR (api.huli.io/practice/v2/...)
    ↓
Webhooks → POST /api/medcare/webhooks/huli
    ↓
Sincronización con medcare_leads en Supabase
```

### Autenticación

- **Método:** API Key → JWT Token
- **Endpoint:** `POST /practice/v2/authorization/token` con `{ api_key: HULI_API_KEY }`
- **JWT:** Válido ~1 hora, se renueva automáticamente con margen de 5 min
- **Header requerido:** `id_organization` en todas las requests

### Componentes

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| HuliClient | `lib/huli-client.ts` | REST client base (GET/POST/PUT, JWT auto-refresh) |
| HuliTypes | `lib/huli-types.ts` | Tipos TypeScript de todas las entidades Huli |
| HuliConnector | `lib/huli-connector.ts` | Singleton con funciones de negocio (pacientes, citas, disponibilidad, doctores) |
| SyncService | `services/syncService.ts` | Procesa webhooks Huli → actualiza medcare_leads |
| RateLimiter | `lib/rate-limiter.ts` | Control de tasa (booking: 5/hr, availability: 30/min, webhook: 100/min) |

### Endpoints Huli consumidos

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/practice/v2/authorization/token` | Obtener JWT |
| GET | `/practice/v2/organization` | Info de la organización |
| GET/POST | `/practice/v2/patient-file` | Buscar/crear pacientes |
| GET | `/practice/v2/availability/doctor/{id}/clinic/{id}` | Slots disponibles |
| POST | `/practice/v2/appointment` | Crear cita (requiere source_event) |
| PUT | `/practice/v2/appointment/{id}/cancel` | Cancelar cita |
| PUT | `/practice/v2/appointment/{id}/patient-confirm` | Confirmar cita |
| PUT | `/practice/v2/appointment/{id}/reschedule` | Reagendar cita |
| PUT | `/practice/v2/appointment/{id}/no-show` | Marcar no-show |
| GET | `/practice/v2/appointment/doctor/{id}` | Listar citas de doctor |
| GET | `/practice/v2/doctor/{id}` | Info del doctor |

### Webhooks recibidos

| Evento Huli | Acción en Supabase |
|-------------|-------------------|
| `APPOINTMENT_CREATED` | Estado → `cita_agendada` |
| `APPOINTMENT_UPDATED` | Actualizar fecha/estado |
| `APPOINTMENT_COMPLETED` | Estado → `completado` |
| `APPOINTMENT_CANCELLED` | Estado → `contactado` (re-engagement) |
| `APPOINTMENT_RESCHEDULED` | Actualizar fecha, mantener estado |
| `APPOINTMENT_NOSHOW` | Estado → `no_show` |

### Variables de entorno

```
HULI_API_KEY                  # API Key de la organización (requerido)
HULI_ORGANIZATION_ID          # ID numérico de la org (requerido)
HULI_API_URL                  # https://api.huli.io (default)
HULI_WEBHOOK_SECRET           # Para validar webhooks (opcional)
HULI_MAMOGRAFIA_DOCTOR_ID     # 96314 (default)
HULI_CLINIC_ID                # 9694 (default)
```

---

## API Routes

| Método | Ruta | Tipo | Descripción |
|--------|------|------|-------------|
| POST | `/api/medcare/book` | Público | Agendar cita (mamografía + lead en Supabase) |
| GET | `/api/medcare/availability` | Público | Slots disponibles (próximos 6 días) |
| GET | `/api/medcare/agenda` | Autenticado | Agenda del día (11 doctores + 5 equipos) |
| GET | `/api/medcare/analytics` | Autenticado | Métricas y KPIs |
| POST | `/api/medcare/cancel` | Autenticado | Cancelar cita |
| GET | `/api/medcare/intelligence` | Autenticado | Inteligencia de negocio |
| POST | `/api/medcare/webhooks/huli` | Webhook | Receptor de eventos Huli |
| POST | `/api/medcare/whatsapp` | Webhook | Bot de WhatsApp |
| GET | `/api/medcare/cron/confirmaciones` | Cron | Confirmar citas del día siguiente |
| GET | `/api/medcare/cron/recordatorios` | Cron | Recordatorios de citas |
| GET | `/api/medcare/cron/reengagement` | Cron | Re-contactar leads fríos |

---

## Base de datos (Supabase)

### Tablas

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `medcare_servicios` | 023 | Catálogo de servicios (mamografía, ultrasonido, combos) |
| `medcare_leads` | 023 | Leads y solicitudes — incluye campos Huli (patient_id, appointment_id, status) |

### Vistas

| Vista | Descripción |
|-------|-------------|
| `medcare_citas_hoy` | Citas del día actual |
| `medcare_ocupacion` | Porcentaje de ocupación por doctor/equipo |

### Estados del lead (`medcare_leads.estado`)

```
nuevo → contactado → cita_agendada → completado
                  ↘ no_show
                  ↘ cancelado
```

---

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/medcare` | Autenticada | Dashboard: agenda del día, leads, ocupación, analytics |
| `/medcare/agendar-estudio` | Pública | Formulario multi-paso: tipo → servicio → slot → datos → confirmación |

---

## Estructura de archivos

```
features/medcare/
├── CLIENT.md                          ← Este archivo
├── brand.ts                           ← Colores, logo, contacto
├── types/
│   └── index.ts                       ← TipoEstudio, EstadoLead, ServicioMedcare, LeadMedcare
├── lib/
│   ├── huli-client.ts                 ← REST client (JWT auto-refresh)
│   ├── huli-types.ts                  ← Tipos Huli (pacientes, citas, disponibilidad, doctores)
│   ├── huli-connector.ts              ← Singleton de negocio (findOrCreatePatient, agendarEstudio)
│   ├── whatsapp-client.ts             ← Cliente WhatsApp Business API
│   └── rate-limiter.ts                ← Control de tasa por IP
├── components/
│   ├── DashboardMedcare.tsx           ← Dashboard principal
│   ├── FormularioAgendarEstudio.tsx   ← Formulario público multi-paso
│   ├── GestionLeadsMedcare.tsx        ← Gestión de leads (tabla + acciones)
│   └── ImportarPacientesModal.tsx     ← Import CSV de pacientes
├── services/
│   ├── leadsService.ts                ← CRUD leads Supabase
│   ├── serviciosService.ts            ← Catálogo de servicios
│   ├── syncService.ts                 ← Webhook Huli → Supabase
│   └── importService.ts              ← Import CSV con filtros inteligentes
├── docs/
│   ├── MEDCARE_BRIEF_MVP_MAMOGRAFIA.md  ← Estrategia de negocio completa
│   ├── WHATSAPP_BOT_FLOW.md             ← Flujos conversacionales del bot
│   ├── MEDCARE-PROPUESTA-MVP.html       ← Propuesta visual
│   └── INSTRUCCIONES-WHATSAPP-API-MEDCARE.html
├── hooks/
└── scripts/
    ├── generate-medcare-proposal.mjs
    └── generate-medcare-proposal-v2.mjs
```

---

## Branding

| Elemento | Valor |
|----------|-------|
| Color primario | `#C41E2A` (Rojo MedCare) |
| Color secundario | `#1A1A2E` (Navy oscuro) |
| Logo | `/medcare/logo-medcare.jpg` |
| Nombre completo | MedCare Centro Médico Especializado |
| Tagline | Centro Médico Especializado |
| Subtag | Mamografía Digital + Ultrasonido |

---

## PRPs relacionados

| PRP | Título | Estado |
|-----|--------|--------|
| PRP-002 | Inteligencia de negocio (viabilidad equipos, BI, AI consultant) | Pendiente |
| PRP-008 | Integración HuliPractice (middleware completo) | En desarrollo |

---

## Target de pacientes

1. **Preventivas (40-60 años):** Mujeres que necesitan mamografía anual de screening
2. **Referidas por médico:** Pacientes con orden médica para estudio diagnóstico
3. **Motivadas por familia:** Acompañadas o incentivadas por hijos/pareja

## KPIs objetivo

| Métrica | Meta Mes 1 | Meta Mes 3 |
|---------|-----------|-----------|
| Mamografías/semana | 15-20 | 40-50 |
| Conversión lead→cita | 40% | 50%+ |
| Re-booking anual | — | 60%+ |
