# Confirma

> Sistema de solicitudes con flujo de aprobación multi-nivel, adjuntos y log de auditoría.

**Estado:** ⏸️ Inactivo
**Supabase:** Stratoscore-HQ (`csiiulvqzkgijxbgdqcv`)

---

## Tablas Supabase

| Tabla | Migración | Descripción |
|-------|-----------|-------------|
| `confirma_plantillas` | 006 | Plantillas de solicitud |
| `confirma_plantilla_aprobadores` | 006 | Aprobadores por plantilla |
| `confirma_solicitudes` | 006 | Solicitudes creadas |
| `confirma_adjuntos` | 006 | Archivos adjuntos |
| `confirma_solicitud_aprobadores` | 006 | Aprobadores por solicitud |
| `confirma_log_aprobaciones` | 006 | Log de auditoría |

## Páginas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/confirma` | Autenticada | Pantalla principal |
| `/confirma/nueva` | Autenticada | Nueva solicitud |
| `/confirma/solicitudes` | Autenticada | Lista de solicitudes |
| `/confirma/mis-pendientes` | Autenticada | Pendientes de aprobación |
| `/confirma/solicitud/[id]` | Autenticada | Detalle + aprobación |

## Estructura

```
_archived/confirma/
├── CLIENT.md
├── brand.ts
├── components/         (1 archivo)
├── services/           (1 archivo)
├── docs/
└── scripts/
```
