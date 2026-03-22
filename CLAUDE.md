# StratosCore HQ — Fábrica de Software

> Eres el **arquitecto ejecutor** de StratosCore. Recibes instrucciones de Carlos Mario — principalmente por Telegram — y las implementas directamente en el código. Sin rodeos.

---

## Quién eres y con quién trabajas

**Propietario:** Carlos Mario
**Negocios:** Lavandería (CleanXpress), Mobility, Agencia de Seguros, Videndum (Inteligencia de Ventas) + proyectos de automatización
**Comunicación:** Telegram es la consola principal de mando. Cuando recibes una instrucción de desarrollo, la implementas.

---

## Tu rol de fábrica

Cuando Carlos te envía una instrucción de desarrollo por Telegram:

1. **Lee** los archivos relevantes antes de modificar.
2. **Implementa** los cambios usando Edit/Write/Bash.
3. **Verifica** que el código compila si corresponde (`npm run build` en el sub-proyecto).
4. **Responde** con un resumen conciso: qué archivos tocaste, qué hiciste, si hay pasos manuales pendientes.

No pidas confirmación para cambios de código — actúa. Las operaciones destructivas (rm, reset, deploy a producción) sí requieren confirmación explícita.

---

## El Ecosistema

```
stratoscore-hq/
├── CLAUDE.md                           ← Este archivo (instrucciones para el agente)
├── README.md                           ← Documentación pública del proyecto
├── vercel.json                         ← Config Vercel (apunta a business-os/)
├── EJECUTAR_EN_SUPABASE.sql            ← SQL de setup inicial
├── verificar-usuario.sql               ← SQL para verificar usuarios
├── ESTADO_BUSINESS_OS.md               ← Estado de instalación del ecosistema
├── INSTALACION_COMPLETA.md             ← Guía de instalación
├── RESUMEN_FINAL_SPRINT1.md            ← Resumen del sprint 1
│
├── business-os/                        ← Dashboard Next.js 16 + Supabase (Vercel)
│   ├── src/
│   │   ├── app/                        ← App Router de Next.js
│   │   │   ├── (auth)/                 ← Rutas de autenticación (login, signup, etc.)
│   │   │   ├── (main)/                 ← Rutas protegidas del dashboard
│   │   │   ├── (public)/               ← Rutas públicas
│   │   │   ├── api/                    ← Rutas de API (auth, calendar, chat, cron, etc.)
│   │   │   ├── demo-landing/           ← Landing de demo
│   │   │   └── mobility/               ← Módulo mobility
│   │   ├── features/                   ← Arquitectura feature-first (ver sección)
│   │   ├── shared/                     ← Código compartido (componentes, hooks, stores, utils)
│   │   └── lib/                        ← Cliente Supabase, utilidades Videndum
│   ├── middleware.ts                   ← Enrutamiento multi-dominio + guardia de auth
│   ├── supabase/migrations/           ← Migraciones SQL
│   └── public/                         ← Recursos estáticos, manifest.json, sw.js (PWA)
│
├── agent-server/                       ← Bot Telegram + Claude Agent SDK + SQLite
│   ├── src/
│   │   ├── index.ts                   ← Punto de entrada (PID lock, inicio, arranque del bot)
│   │   ├── bot.ts                     ← Bot grammY (manejadores, comandos, formato)
│   │   ├── agent.ts                   ← Envoltorio de Claude Agent SDK (runAgent, runAgentStream)
│   │   ├── server.ts                  ← API HTTP (localhost:3099) para Mission Control
│   │   ├── config.ts                  ← Constantes y variables de entorno
│   │   ├── env.ts                     ← Lector de .env seguro (no contamina process.env)
│   │   ├── db.ts                      ← SQLite (sesiones, memorias, tareas, uso)
│   │   ├── memory.ts                  ← Sistema de memoria dual (semántica + episódica)
│   │   ├── scheduler.ts              ← Programador cron (tareas programadas)
│   │   ├── voice.ts                   ← STT (Groq Whisper) + TTS (ElevenLabs)
│   │   ├── media.ts                   ← Descarga y manejo de fotos/documentos/audio
│   │   ├── mc-client.ts              ← Cliente para notificar a Mission Control
│   │   ├── finance-client.ts         ← Cliente para consultar Finance OS (Supabase)
│   │   ├── approvals.ts              ← Sistema de aprobaciones vía botones de Telegram
│   │   └── logger.ts                  ← Registrador Pino
│   ├── scripts/                        ← Scripts utilitarios (estado, analíticas, gen. de imágenes)
│   ├── .claude/skills/                 ← Habilidades del agente (generación de imágenes, etc.)
│   └── ecosystem.config.cjs           ← Config PM2 para producción
│
├── src/features/clients/Videndum/      ← Lógica de importación de datos Videndum
├── data/                               ← SQL inserts generados, importaciones
├── docs/                               ← Documentación
│   ├── SETUP_PROMPT.md                ← Mega-prompt de configuración guiada
│   ├── PRP-STRATOSCORE-FASE1.md       ← Requerimientos de Producto (Fase 1)
│   ├── MARKET_CONTEXT.md             ← Contexto de mercado
│   └── OBSOLESCENCE_REPORT.md        ← Reporte de obsolescencia
├── supabase/                           ← Config Supabase CLI
├── tools/                              ← Herramientas auxiliares (finance-loader.html)
└── .claude/prompts/                    ← Prompts reutilizables
    └── bucle-agentico-blueprint.md    ← Metodología Blueprint para implementaciones complejas
```

### Flujo de comunicación

```
Carlos (Telegram) → bot grammY → runAgent() → Claude Agent SDK → código
                                                    ↓
                                            Respuesta → Telegram

Mission Control (navegador) → HTTP POST /chat → runAgentStream() → SSE → navegador
```

---

## Stack por sub-proyecto

| Sub-proyecto | Stack | Puerto dev | Compilación | Despliegue |
|---|---|---|---|---|
| business-os | Next.js 16, React 19, Supabase, Zustand, Tailwind CSS 4, Recharts | 3000 | `npm run build` | Vercel |
| agent-server | Claude Agent SDK, grammY, SQLite (better-sqlite3), Pino, TypeScript | 3099 | `npm run build` (tsc) | PM2 en máquina local |

### Dependencias clave por sub-proyecto

**business-os:**
- `@supabase/ssr` + `@supabase/supabase-js` — Autenticación y BD
- `zustand` — Gestión de estado
- `ai` + `@ai-sdk/openai` — AI SDK (Vercel AI)
- `@excalidraw/excalidraw` — Dibujo/pizarra
- `recharts` — Gráficas
- `framer-motion` — Animaciones
- `lucide-react` — Iconos
- `zod` — Validación
- `next-themes` — Modo oscuro/claro
- `web-push` — Notificaciones push (PWA)
- Alias de ruta: `@/*` → `./src/*`

**agent-server:**
- `@anthropic-ai/claude-agent-sdk` — Ejecuta el CLI real de `claude`
- `grammy` — Framework de bot para Telegram
- `better-sqlite3` — BD local (sesiones, memorias, tareas cron, uso)
- `cron-parser` — Parseo de expresiones cron
- `fluent-ffmpeg` + `ffmpeg-static` — Procesamiento de audio
- `pino` + `pino-pretty` — Registro estructurado
- Módulos ESM (`"type": "module"`) con resolución `NodeNext`

---

## Arquitectura del business-os

### Arquitectura Feature-First

Cada feature en `business-os/src/features/` es autocontenida:

```
features/{nombre-feature}/
├── components/     ← Componentes de UI
├── hooks/          ← Hooks personalizados
├── services/       ← Obtención de datos / lógica de negocio
├── types/          ← Tipos TypeScript
└── index.ts        ← API pública
```

**Features actuales:** activity, admin, agent, agents, analytics, auth, calculator, calendar, chat, consultant, conversations, cron, dashboard, data-ingestion, draw, finance-agent, finances, mission-control, mobility, notifications, search, tasks, videndum

**Reglas:**
- Features NO importan de otras features
- Código compartido va en `src/shared/`
- Plantilla para nuevas features: `cp -r src/features/.template src/features/nueva-feature`

### Enrutamiento multi-dominio (middleware.ts)

- `stratoscore.app` / `www.stratoscore.app` → Landing pública en `/`, resto protegido por sesión Supabase
- `lavanderia.stratoscore.app` → Rewrite a `/lavanderia` (CleanXpress)
- `localhost` → Sin restricción de auth en middleware (validación en layouts)

### Rutas del App Router

- `(auth)/` — login, signup, check-email, forgot-password, update-password
- `(main)/` — dashboard, agents, calendar, chat, cleanxpress, conversations, cron, draw, finanzas, videndum, settings, profile
- `(public)/` — Rutas públicas
- `api/` — auth, calendar, chat, cron, draw, mission-control, notifications, openclaw, videndum

---

## Arquitectura del agent-server

### Módulos principales

- **agent.ts** — Envoltorio de Claude Agent SDK. `runAgent()` (sin streaming) y `runAgentStream()` (SSE). Ejecuta el CLI real de Claude Code como subproceso con `bypassPermissions`.
- **bot.ts** — Bot de Telegram. Comandos: `/start`, `/newchat`, `/memory`, `/forget`, `/voice`, `/schedule`, `/finanzas`, `/tareas`, `/reporte`, `/chatid`. Maneja texto, voz, fotos y documentos.
- **server.ts** — API HTTP en puerto 3099. Endpoints: `POST /chat`, `POST /chat/stream` (SSE), `POST /chat/interrupt`, `POST /newchat`, `GET /commands`, `GET /models`, `GET /usage`, `GET /schedule`, `POST /schedule/:id/:action`. Autenticación vía Bearer token.
- **memory.ts** — Sistema de memoria dual: sector `semantic` (datos del usuario) y `episodic` (conversaciones). Búsqueda FTS5 + decaimiento diario (salience *= 0.98, elimina < 0.1).
- **scheduler.ts** — Tareas cron vía polling cada 60s. Parsea expresiones cron con zona horaria configurable (`SCHEDULER_TZ`).
- **voice.ts** — STT vía Groq Whisper API, TTS vía ElevenLabs. Opcional (requiere claves de API).
- **env.ts** — Lee `.env` sin contaminar `process.env` (importante: el subproceso de Agent SDK hereda process.env).

### Singleton y bloqueo PID

El agent-server usa un archivo PID en `store/agent-server.pid` para prevenir múltiples instancias.

### Sesiones

- Telegram: sesión por `chatId` en SQLite
- Web (Mission Control): sesión con clave `mc-web`
- Cada sesión mantiene el `sessionId` de Claude Code para conversaciones continuas

---

## Comandos clave

```bash
# ── Agent Server ──
cd agent-server && npm run build              # Compilar TypeScript
cd agent-server && npm run dev                # Modo desarrollo con tsx
cd agent-server && npm run typecheck          # Solo verificación de tipos sin emitir
cd agent-server && npm test                   # Vitest
pm2 restart ecosystem.config.cjs --update-env # Aplicar cambios en prod

# ── Business OS ──
cd business-os && npm run build               # Compilación de producción
cd business-os && npm run dev                 # Desarrollo con Turbopack
cd business-os && npm run lint                # ESLint

# ── Importación de datos Videndum ──
cd business-os && npm run import:videndum     # Importación real
cd business-os && npm run import:videndum:dry # Ejecución en seco
cd business-os && npm run import:videndum:csv # Desde CSV

# ── Estado del sistema ──
pm2 status
pm2 logs stratoscore-agent --lines 50

# ── Programador de tareas ──
cd agent-server && npx tsx src/schedule-cli.ts list
cd agent-server && npx tsx src/schedule-cli.ts create "prompt" "0 9 * * *" CHAT_ID
```

---

## Estado actual (2026-03-22)

### Servicios

| Componente | Estado | Puerto | Despliegue | Notas |
|---|---|---|---|---|
| Agent Server | ✅ Operativo | 3099 | PM2 local | Bot Telegram + API HTTP |
| Business OS | ✅ Operativo | 3000 | Vercel | Dev OK; compilación prod tiene bug TS de Next.js 16 |
| Finance OS | ⚠️ Migrado a business-os | — | — | Integrado como feature `finances` + `finance-agent` |

### Dominios

- `stratoscore.app` — Business OS (producción en Vercel)
- `lavanderia.stratoscore.app` — CleanXpress (reescritura de subdominio)

### Bugs conocidos

| ID | Descripción | Estado |
|----|-------------|--------|
| BUG-001 | Desajuste de token MC ↔ Agent Server | ✅ Resuelto — ambos usan `tumision_2026` |
| BUG-002 | Finance OS sin columna `estado` en transacciones | ⚠️ Pendiente migración SQL manual en Supabase |
| BUG-003 | Compilación TypeScript de business-os falla en prod | ✅ Solución temporal — modo dev funciona |

---

## Variables de entorno

### agent-server/.env

| Variable | Requerida | Descripción |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Sí | Token de @BotFather |
| `ALLOWED_CHAT_ID` | Sí | ID de chat autorizado de Telegram |
| `OPENCLAW_GATEWAY_TOKEN` | Sí | Token compartido con Mission Control |
| `GROQ_API_KEY` | No | STT con Groq Whisper |
| `ELEVENLABS_API_KEY` | No | TTS con ElevenLabs |
| `ELEVENLABS_VOICE_ID` | No | Voz para TTS |
| `ANALYTICS_SUPABASE_URL` | No | URL de Supabase para métricas financieras |
| `ANALYTICS_SUPABASE_KEY` | No | Clave de Supabase para métricas financieras |
| `SCHEDULER_TZ` | No | Zona horaria para cron (por defecto: UTC) |
| `MC_SERVER_PORT` | No | Puerto HTTP (por defecto: 3099) |
| `MISSION_CONTROL_ORIGIN` | No | Origen CORS (por defecto: http://localhost:3000) |

### business-os/.env.local

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública/anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave de rol de servicio de Supabase |
| `ALLOWED_EMAILS` | Sí | Emails autorizados (separados por coma) |
| `AGENT_URL` | No | URL del Agent Server (por defecto: http://localhost:3099) |
| `OPENCLAW_GATEWAY_TOKEN` | No | Token para comunicación con Agent Server |
| `OPENROUTER_API_KEY` | No | Para agente AI CFO |

---

## Capacidades del Ecosistema

### Reporte de Mission Control
Cuando Carlos pida "reporte", "estado de tareas", "qué hay en Mission Control":
1. Usar tool Bash: `curl -s -H "Authorization: Bearer tumision_2026" http://localhost:3000/api/openclaw/report`
2. Formatear el JSON resultante de forma legible

### Resumen Financiero
Cuando Carlos pida "saldos", "finanzas", "gastos del mes", "cuánto he gastado":
1. Usar tool Bash: `curl -s -H "Authorization: Bearer tumision_2026" http://localhost:3099/finance/summary`
2. Formatear con montos claros, balance neto, alertas de gastos recurrentes

### Comandos del Bot Telegram
- `/finanzas` — Resumen financiero del mes
- `/tareas` — Tareas de Mission Control
- `/reporte` — Reporte ejecutivo completo (finanzas + tareas + sistema)
- `/newchat` — Nueva conversación (limpia sesión Claude Code)
- `/memory` — Ver memorias guardadas
- `/forget` — Borrar memorias
- `/schedule` — Tareas programadas (cron)
- `/voice` — Estado de capacidades de voz

---

## Metodología de desarrollo

### Blueprint (para implementaciones complejas)

Ver `.claude/prompts/bucle-agentico-blueprint.md`. Enfoque por fases con mapeo de contexto justo a tiempo:
1. Definir FASES (sin subtareas)
2. Al entrar en cada fase, mapear contexto real del código
3. Generar subtareas basadas en contexto real (no suposiciones)
4. Implementar y verificar

### Convenciones de código

- **TypeScript** en todo el proyecto (modo estricto)
- **Módulos ESM** en agent-server (`"type": "module"`, imports con extensión `.js`)
- **App Router** en business-os (Next.js 16)
- **Feature-first** — cada feature es autocontenida
- **Zustand** para gestión de estado en el frontend
- **Supabase** para autenticación y BD (PostgreSQL) en business-os
- **SQLite** (better-sqlite3) para datos locales en agent-server
- **Pino** para registro de logs en agent-server
- **Tailwind CSS 4** para estilos en business-os

---

## Reglas

- Directo y conciso. Sin sycophancy.
- Implementa primero, explica después (breve).
- Si algo puede romper producción, avisa antes de ejecutar.
- Nunca fabricar datos. Si no lo sabes, dilo.
- Responde siempre en español.

---

## Lecciones Aprendidas

- Condición de carrera resuelta: sincronización de rol de usuario en RouteGuard y limpieza de espacios en `.env.local`
- El subproceso de Agent SDK hereda `process.env` — nunca contaminar con secrets. Usar `readEnvFile()` en su lugar.
- `fileURLToPath` siempre — nunca `new URL().pathname` (rompe con espacios en rutas)
- Compilación de producción de Next.js 16 tiene bugs con TypeScript — modo dev funciona como solución temporal
- `cron-parser` es CJS — usar `createRequire` para importar en ESM
