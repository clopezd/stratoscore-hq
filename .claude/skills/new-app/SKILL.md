---
name: new-app
description: Scaffold un nuevo proyecto Next.js + Supabase + Tailwind con SaaS Factory preconfigurado. Usa cuando el usuario pida "nuevo proyecto", "crear app", "nueva landing".
triggers: nueva app, new app, scaffold, nuevo proyecto, crear proyecto, boilerplate
---

# New App — Scaffold de nuevo proyecto

Crea un proyecto Next.js 16 + Supabase + Tailwind completo con SaaS Factory preinstalado, listo para desarrollar.

## Qué genera

```
{app-name}/
├── src/
│   ├── app/                  ← App Router
│   ├── components/
│   ├── lib/supabase/
│   └── features/
├── supabase/
│   ├── migrations/
│   └── config.toml
├── .claude/skills/           ← SaaS Factory skills
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Stack incluido

- Next.js 16 (App Router, Server Components)
- React 19
- Supabase (Auth + DB + Storage)
- Tailwind CSS 4
- Zustand (estado cliente)
- Zod (validación)
- TypeScript estricto

## Flujo

1. Pide nombre y descripción del proyecto
2. Crea estructura con `create-next-app` + templates
3. Configura Supabase local
4. Instala skills de SaaS Factory
5. Primer commit en git
6. Instrucciones de siguiente paso

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
