---
name: add-login
description: Agrega autenticación completa (login, signup, reset password) a un proyecto Next.js + Supabase. Usa cuando el usuario pida "agregar login", "autenticación", "sistema de usuarios".
triggers: login, auth, autenticación, signup, registro, password, usuarios, sesión
---

# Add Login — Autenticación completa

Añade flujo completo de autenticación a un proyecto Next.js + Supabase: login, signup, recuperación de contraseña y protección de rutas.

## Cuándo usar

- "Agrega login a mi app"
- "Quiero que los usuarios puedan registrarse"
- "Necesito proteger rutas con autenticación"

## Qué genera

- Páginas: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- Componentes: `LoginForm`, `SignupForm`, `AuthProvider`
- Middleware: protección de rutas privadas
- Integración con Supabase Auth
- Esquema inicial de tabla `profiles` con RLS

## Stack

- Next.js 16 (App Router)
- Supabase Auth
- React 19 + Server Components
- Zustand (estado de sesión)

## Requisitos

- Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`
- Proyecto Supabase con Auth habilitado

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4 (`/home/cmarioia/proyectos/stratoscore-hq/business-os/.claude/skills/add-login/`).
