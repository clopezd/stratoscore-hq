# MedCare

> MVP de imagenología: mamógrafo + ultrasonido, agendamiento de estudios y gestión de leads.

**Estado:** ⏸️ Inactivo
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

## Estructura

```
_archived/medcare/
├── CLIENT.md
├── brand.ts
├── components/         (3 archivos)
├── services/           (2 archivos)
├── types/              (1 archivo)
├── docs/
└── scripts/
```
