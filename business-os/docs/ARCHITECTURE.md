# StratosCore — Decisiones Arquitectonicas

> Por que elegimos lo que elegimos.
> Ultima actualizacion: 2026-04-10

---

## Decision 1: Next.js 16 (y no Remix, Astro, o SvelteKit)

**Elegimos Next.js porque:**
- React Server Components permiten queries directos a Supabase sin API intermediaria
- App Router con layouts anidados encaja con la estructura multi-tenant
- Vercel deployment es zero-config y con CDN global
- Ecosistema mas grande: mas librerias, mas ejemplos, mas soporte de IA
- Turbopack para desarrollo rapido

**Trade-offs aceptados:**
- Bundle size mas grande que Astro/Svelte
- Vendor coupling con Vercel (mitigado: es deployable en cualquier Node.js host)
- Complejidad del App Router vs Pages Router

## Decision 2: Supabase (y no Firebase, PlanetScale, o Prisma + raw Postgres)

**Elegimos Supabase porque:**
- PostgreSQL real con RLS — seguridad por defecto en la capa de datos
- Auth integrado con JWT y OAuth
- Realtime via WebSockets (Phoenix channels)
- Storage S3-compatible
- Dashboard web para debugging rapido
- SDK de TypeScript con tipos auto-generados

**Trade-offs aceptados:**
- Menor flexibilidad que raw PostgreSQL (mitigado: acceso SQL directo disponible)
- Dependencia de Supabase como hosted service (mitigado: self-hostable con Docker)
- Connection pooling via PgBouncer limita ciertas queries

## Decision 3: Multi-tenant en una codebase (y no microservicios)

**Elegimos monorepo multi-tenant porque:**
- 1 developer = 1 codebase. Microservicios requieren equipo para justificarse
- Shared components (Shell, Auth, Logo) reutilizados entre clientes
- Deploy atomico: un push deploya todo
- Consistencia: mismos patrones en todos los modulos
- RLS en Supabase da aislamiento de datos sin separar infra

**Trade-offs aceptados:**
- Un bug en un modulo podria afectar el build de todos (mitigado: serverless functions son independientes)
- Codebase crece con cada cliente (mitigado: features/ separa logica por cliente)
- No escala a 50+ clientes sin reorganizar (plan de separacion documentado en ARCHITECTURE-SECURITY.md)

## Decision 4: OpenRouter (y no Anthropic SDK directo)

**Elegimos OpenRouter porque:**
- Acceso a 200+ modelos con una sola API key
- Zero vendor lock-in: cambiar modelo = cambiar 1 string
- Modelos gratuitos disponibles (Gemini Flash) para reducir costos
- Fallback automatico si un provider falla

**Trade-offs aceptados:**
- Una capa mas de latencia (~50ms)
- Dependencia de OpenRouter como intermediario (mitigado: facil de reemplazar con SDK directo)

## Decision 5: Vercel AI SDK (y no LangChain o llamadas directas)

**Elegimos Vercel AI SDK porque:**
- Streaming nativo de respuestas
- Provider-agnostic: funciona con OpenRouter, OpenAI, Anthropic, Google
- Structured outputs con Zod schemas
- Integracion nativa con Next.js (RSC + API routes)
- Tool calling estandarizado

**Trade-offs aceptados:**
- Menos flexible que LangChain para pipelines complejos
- Menor comunidad que LangChain (pero documentacion mas limpia)

## Decision 6: Claude Agent SDK para el bot (y no framework custom)

**Elegimos Claude Agent SDK porque:**
- Ejecucion de tools (Read, Write, Bash) directa en el servidor
- Contexto de 200K tokens = el agente "ve" todo el proyecto
- grammY como framework de Telegram (ligero, bien tipado)
- PM2 para process management (restart, logs, clustering)

**Trade-offs aceptados:**
- Costo de API por cada interaccion de Telegram
- Latencia de respuesta (5-30 segundos dependiendo de la tarea)
- Dependencia de Anthropic para el bot (mitigado: el bot es operacional, no critico)

---

## Diagrama de stack

```
Usuario
  │
  ├── Browser → Vercel CDN → Next.js 16 (RSC + API Routes)
  │                              │
  │                              ├── Supabase (PostgreSQL + Auth + Storage)
  │                              └── OpenRouter → Claude/Gemini/GPT
  │
  └── Telegram → grammY bot → Claude Agent SDK → Tools (Read/Write/Bash)
                                   │
                                   └── PM2 (process manager)
```
