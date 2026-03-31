# StratosCore HQ — Como se hizo la plataforma

## Stack Tecnologico

| Categoria | Tecnologia | Para que sirve |
|-----------|-----------|----------------|
| **Framework** | Next.js 16 (App Router) | Framework principal de React para web moderna con renderizado servidor/cliente |
| **Lenguaje** | TypeScript 5.9 | JavaScript con tipado estatico para codigo mas seguro y mantenible |
| **UI Library** | React 19 | Libreria de interfaces de usuario basada en componentes |
| **Estilos** | Tailwind CSS 4 | Framework CSS utilitario para disenar directo en el HTML |
| **Componentes UI** | shadcn/ui + Componentes Neu custom | Sistema de componentes preconstruidos y personalizados |
| **Animaciones** | Framer Motion 12 | Animaciones fluidas y transiciones en la interfaz |
| **Iconos** | Lucide React | Pack de iconos modernos y consistentes |
| **Estado global** | Zustand 5 | Manejo de estado global simple y eficiente |
| **Base de datos** | PostgreSQL (Supabase) | Base de datos relacional en la nube |
| **Autenticacion** | Supabase Auth + SSR | Login con email, roles (owner/member), whitelist de emails |
| **IA / Chat** | Vercel AI SDK + OpenRouter | Chat con IA, streaming, voz, agentes autonomos |
| **Graficas** | Recharts 3 | Graficos interactivos para dashboards financieros |
| **PDF** | jsPDF + autotable | Generacion de reportes PDF exportables |
| **Excel** | xlsx + xlsx-js-style | Exportacion de datos a hojas de calculo |
| **Pizarra** | Excalidraw + Mermaid | Dibujo libre y diagramas tecnicos |
| **Drag & Drop** | dnd-kit | Arrastrar y soltar en el tablero Kanban |
| **Notificaciones** | Web Push API (VAPID) | Notificaciones push al navegador |
| **Deploy** | Vercel | Hosting, CI/CD automatico, dominios, cron jobs |
| **Control de version** | Git + GitHub | Codigo versionado con ramas y pull requests |

---

## Modulos de la Aplicacion

| Modulo | Que hace | Tecnologias clave |
|--------|----------|-------------------|
| **Mission Control** | Dashboard principal con acciones rapidas, tarjetas de clientes y feed de actividad | React, Zustand, Supabase |
| **Chat IA** | Conversaciones con inteligencia artificial, entrada/salida por voz | Vercel AI SDK, OpenRouter, WebRTC |
| **Dashboard de Tareas** | Gestion de tareas en vista Kanban y Lista | React, dnd-kit, Supabase |
| **Agentes IA** | 11 agentes autonomos (CFO, CTO, CMO, etc.) que ejecutan tareas diarias | Cron jobs, API routes, Claude/OpenRouter |
| **Finanzas** | Seguimiento financiero, reportes anuales, gastos recurrentes | Recharts, jsPDF, Supabase |
| **Videndum** | Analisis de inteligencia de negocio, discovery, feedback, requisitos | Claude API, PDF export |
| **Calendario** | Programacion de eventos y citas | Calendar API, Supabase |
| **Pizarra (Draw)** | Herramienta de dibujo libre y diagramas | Excalidraw, Mermaid |
| **Mobility** | Gestion de pacientes y terapeutas | Supabase, Calendar |
| **Encuestas** | Sistema de encuestas publicas con URLs dinamicas | Next.js dynamic routes |
| **Notificaciones** | Push notifications al navegador | Web Push, VAPID keys |

---

## Arquitectura General

```
Usuario (Navegador)
    |
    v
  Vercel (Hosting + CDN)
    |
    v
  Next.js 16 (App Router)
    |
    ├── Paginas publicas (landing, login, encuestas)
    ├── Paginas protegidas (dashboard, chat, finanzas...)
    │       |
    │       ├── Middleware → valida sesion + subdominios
    │       ├── Supabase → base de datos + auth
    │       ├── Vercel AI SDK → chat con IA
    │       └── Zustand → estado global del frontend
    │
    └── API Routes (38+ endpoints)
            |
            ├── /api/chat/* → sistema de chat IA
            ├── /api/agents/* → gestion de agentes
            ├── /api/cron/* → tareas programadas
            ├── /api/videndum/* → inteligencia de negocio
            ├── /api/notifications/* → push notifications
            └── /api/openclaw/* → integracion con Agent Server
```

---

## Diseño Visual

| Aspecto | Detalle |
|---------|---------|
| **Tema** | Modo claro y oscuro con toggle |
| **Color primario** | Electric Cyan (#00F2FE) |
| **Fondo oscuro** | Deep Carbon (#001117) |
| **Texto claro** | Platinum (#E0EDE0) |
| **Texto secundario** | Stellar Gray (#8B949E) |
| **Accesibilidad** | Contraste WCAG AA (17.3:1 en modo claro) |
| **Responsivo** | Adaptable a movil, tablet y desktop |

---

## Seguridad

| Medida | Implementacion |
|--------|---------------|
| **Autenticacion** | Email + password con verificacion por correo |
| **Whitelist** | Solo emails autorizados pueden registrarse |
| **Roles** | Owner y Member con permisos diferenciados |
| **Headers** | HSTS, X-Frame-Options, X-Content-Type-Options |
| **Middleware** | Redireccion automatica a login si no hay sesion |
| **Tokens** | Cookies seguras con Supabase SSR |

---

## Infraestructura

| Componente | Servicio | Funcion |
|------------|----------|---------|
| **Frontend + API** | Vercel | Hosting, builds automaticos, dominio |
| **Base de datos** | Supabase (PostgreSQL) | Datos, auth, storage |
| **Agent Server** | VPS propio | Bot de Telegram, agentes IA, Claude SDK |
| **IA** | OpenRouter / OpenAI | Modelos de lenguaje para chat y agentes |
| **Cron Jobs** | Vercel Cron | Ejecucion diaria de agentes a las 4:00 PM |
| **Repositorio** | GitHub | Codigo fuente, versionado, CI/CD |
