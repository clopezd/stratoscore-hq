---
name: supabase
description: Gestión completa de Supabase — crear/modificar esquemas, políticas RLS, queries, migraciones, Edge Functions. Usa cuando el usuario pida cambios de BD.
triggers: supabase, base de datos, rls, migración, schema, tabla, postgres, query, edge function
---

# Supabase — Gestión de base de datos

Opera sobre Supabase: esquemas, RLS, queries, migraciones, Edge Functions. Genera SQL seguro y tipado.

## Capacidades

### Esquemas
- Crear tablas con tipos correctos
- Agregar/modificar columnas
- Índices (btree, gin, gist)
- Triggers y funciones PL/pgSQL

### RLS (Row Level Security)
- Políticas por tenant (`auth.uid()`)
- Políticas read-only vs write
- Templates para multi-tenant SaaS
- Verificación automática de políticas

### Queries
- Generación de queries tipadas (TypeScript)
- Joins complejos
- Full-text search
- pgvector para embeddings

### Migraciones
- Archivos en `supabase/migrations/YYYYMMDDHHMMSS_desc.sql`
- Verificación local con `supabase db reset`

### Edge Functions
- Scaffold en `supabase/functions/{name}/index.ts`
- Deploy con `supabase functions deploy`

## Comandos clave

```bash
supabase start              # Stack local
supabase db reset           # Aplicar migraciones limpio
supabase db push            # Push a producción
supabase gen types typescript --local > lib/database.types.ts
```

## Requisitos

- Supabase CLI instalado
- Proyecto vinculado (`supabase link`)
- `SUPABASE_ACCESS_TOKEN` para deploys

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
