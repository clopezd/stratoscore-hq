# Mobility

> Gestión de terapia física: terapeutas, pacientes, calendario, leads, WhatsApp bot y 3 agentes IA.

**Estado:** 🔨 En desarrollo
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)

---

## Tablas Supabase

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `terapeutas` | 004 | Terapeutas del centro |
| `equipos` | 004 | Equipos de rehabilitación |
| `pacientes` | 004 | Pacientes registrados |
| `citas` | 004 | Citas y sesiones |
| `leads_mobility` | 004 | Leads de captación |
| `horarios_centro` | 004 | Horarios del centro |
| `ocupacion_diaria` | 004 | Vista: ocupación por día |
| `pacientes_proximo_vencimiento` | 004 | Vista: pacientes por vencer |

## API Routes (`/api/mobility/`)

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/agents` | POST | Orquestación de agentes IA |
| `/test-whatsapp` | POST | Test de envío WhatsApp |

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/mobility` | Standalone | Dashboard principal |
| `/mobility/pacientes` | Standalone | Gestión de pacientes |
| `/mobility/calendario` | Standalone | Calendario semanal |
| `/mobility/terapeutas` | Standalone | Gestión de terapeutas |
| `/mobility/leads` | Standalone | Gestión de leads |
| `/mobility/solicitar-evaluacion` | Standalone | Formulario público |
| `/mobility/equipos` | Standalone | Gestión de equipos |
| `/mobility/reportes` | Standalone | Reportes y analytics |

## Agentes IA

| Agente | Archivo | Función |
|--------|---------|---------|
| Optimization | `optimization-agent.ts` | Optimización de agenda y recursos |
| Retention | `retention-agent.ts` | Retención de pacientes vía WhatsApp |
| Acquisition | `acquisition-agent.ts` | Captación de nuevos leads |

## Estructura

```
mobility/
├── CLIENT.md
├── brand.ts
├── agents/             (3 archivos)
├── components/         (20 archivos)
├── services/           (8 archivos, incluye whatsapp.ts)
├── types/              (1 archivo)
├── docs/
└── scripts/
```
