# StratosCore — Onboarding para Developers

> Objetivo: un dev nuevo productivo en 1 dia.
> Ultima actualizacion: 2026-04-10

---

## Prerequisitos

- Node.js 20+
- Git
- Cuenta de Supabase (pedir acceso a Carlos)
- VS Code o editor con TypeScript support

---

## Setup local (30 minutos)

### 1. Clonar el repositorio

```bash
git clone [repo-url] stratoscore-hq
cd stratoscore-hq/business-os
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Pedir a Carlos los valores de:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`

### 4. Verificar que compila

```bash
npm run build
```

Si hay errores, probablemente faltan variables de entorno.

### 5. Correr en desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

---

## Estructura del proyecto

```
business-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # Rutas protegidas (requieren login)
│   │   │   ├── videndum/       # UI de Videndum
│   │   │   ├── medcare/        # UI de MedCare
│   │   │   ├── finanzas/       # UI de Finanzas
│   │   │   └── ...
│   │   ├── (auth)/             # Login, signup, forgot password
│   │   └── api/                # API routes (serverless functions)
│   │       ├── videndum/       # 22 endpoints
│   │       ├── medcare/        # 11 endpoints
│   │       ├── bidhunter/      # 15 endpoints
│   │       ├── finance/        # 12 endpoints
│   │       └── mobility/       # 3 endpoints
│   ├── features/               # Logica de negocio por cliente
│   │   ├── videndum/           # components, hooks, services, types, brand.ts
│   │   ├── mobility/           # components, agents, whatsapp, brand.ts
│   │   ├── bidhunter/          # agents, components, services
│   │   ├── medcare/            # lib (Huli), components, services
│   │   └── finances/           # components, types
│   ├── shared/                 # Componentes compartidos (Logo, Shell, etc)
│   └── lib/
│       └── supabase/           # Cliente Supabase (server.ts, service.ts, auth-guard.ts)
├── public/                     # Assets estaticos, fonts, imagenes
├── supabase/migrations/        # 59 migraciones SQL
├── middleware.ts                # Routing + security headers
├── tailwind.config.ts          # Brand colors
└── docs/                       # Documentacion
```

---

## Patrones clave

### Autenticacion en API routes

```typescript
import { requireAuth } from '@/lib/supabase/auth-guard'

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  // auth.user disponible aqui
}
```

### Acceso a datos (respeta RLS)

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('tabla').select('*')
// RLS filtra automaticamente por usuario
```

### Acceso admin (bypasses RLS — solo para operaciones internas)

```typescript
import { createServiceClient } from '@/lib/supabase/service'

const supabase = createServiceClient()
// CUIDADO: esto ve TODOS los datos
```

### Brand por cliente

Cada cliente tiene `src/features/[cliente]/brand.ts` con colores, logos, y contacto.

---

## Como agregar un feature nuevo

1. Crear componente en `src/features/[cliente]/components/`
2. Crear API route en `src/app/api/[cliente]/[endpoint]/route.ts`
3. Agregar `requireAuth()` al API route
4. Crear pagina en `src/app/(main)/[cliente]/[page]/page.tsx`
5. `npm run build` para verificar

## Como agregar un cliente nuevo

1. Crear `src/features/[nuevo-cliente]/brand.ts`
2. Crear `src/features/[nuevo-cliente]/CLIENT.md`
3. Crear rutas: `src/app/(main)/[nuevo-cliente]/`
4. Crear APIs: `src/app/api/[nuevo-cliente]/`
5. Crear migracion SQL: `npx supabase migration new [nombre]`
6. Agregar RLS policies a las tablas nuevas

---

## Comandos frecuentes

```bash
npm run dev          # Servidor de desarrollo (Turbopack)
npm run build        # Verificar que compila sin errores
npm run lint         # Linter

# Base de datos
npx supabase migration new [nombre]   # Nueva migracion
npx supabase db push                  # Aplicar migraciones

# Testing
npx playwright test                   # E2E tests
npx playwright test --ui              # UI mode
```

---

## Documentacion de referencia

| Doc | Que contiene |
|-----|-------------|
| `CLAUDE.md` (raiz) | Instrucciones para el agente IA |
| `business-os/CLAUDE.md` | Arquitectura y skills |
| `docs/SECURITY.md` | Framework de seguridad |
| `docs/RUNBOOK.md` | Operaciones diarias |
| `docs/METRICS.md` | Metricas del proyecto |
| `features/[cliente]/CLIENT.md` | Documentacion por cliente |
