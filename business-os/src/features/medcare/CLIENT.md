# MedCare

> MVP de imagenología: mamógrafo + ultrasonido, agendamiento de estudios y gestión de leads.

**Estado:** 🔨 En desarrollo — Integración HuliPractice
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)

---

## Tablas Supabase

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `medcare_servicios` | 023 | Servicios de imagenología |
| `medcare_leads` | 023 | Leads / solicitudes de estudio |
| `medcare_citas_hoy` | 023 | Vista: citas del día |
| `medcare_ocupacion` | 023 | Vista: ocupación |

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/medcare` | Autenticada | Dashboard |
| `/medcare/agendar-estudio` | Pública | Formulario de agendamiento |

## Integración Huli

**PRP:** `.claude/PRPs/PRP-008-medcare-huli-integration.md`

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| HuliClient | `lib/huli-client.ts` | REST client base |
| HuliTypes | `lib/huli-types.ts` | Tipos de entidades Huli |
| HuliConnector | `lib/huli-connector.ts` | Funciones de negocio |
| SyncService | `services/syncService.ts` | Sincronización webhook → leads |
| Webhook | `/api/medcare/webhooks/huli` | Receptor de eventos Huli |

## Estructura

```
features/medcare/
├── CLIENT.md
├── brand.ts
├── components/         (4 archivos)
├── services/           (3 archivos + syncService)
├── lib/                (huli-client, huli-types, huli-connector)
├── types/              (1 archivo)
├── docs/
├── hooks/
└── scripts/
```
