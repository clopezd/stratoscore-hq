# PRP-010: Agente Unificado StratosCore — Multicanal (Web + WhatsApp + Telegram)

> **Estado**: COMPLETADO
> **Fecha**: 2026-04-09
> **Proyecto**: StratosCore HQ (Business OS + Agent Server)

---

## Objetivo

Construir un agente conversacional unificado que responda en web (chat widget público), WhatsApp (Meta Cloud API) y Telegram (bot existente), usando un LLM real vía OpenRouter, con una capa de conversación channel-agnostic que conozca todos los clientes/servicios/precios de StratosCore y pueda responder consultas, calificar leads y derivar a Carlos.

## Por Qué

| Problema | Solución |
|----------|----------|
| El sales agent actual (`agent-server/src/agents/sales-agent.ts`) usa respuestas hardcodeadas con `if/else` — no genera respuestas dinámicas ni entiende contexto | Reemplazar con LLM real (OpenRouter) que genera respuestas contextuales usando knowledge base estructurada |
| WhatsApp webhook solo existe para MedCare (confirmación de citas), no hay un agente general conectado | Crear webhook unificado que reciba mensajes de WhatsApp y los rutee al agente StratosCore |
| Telegram bot usa Claude Agent SDK (tool-use complejo), no hay un canal público liviano para prospectos | El web widget y WhatsApp usan el mismo agente liviano, Telegram se mantiene como canal admin |
| No hay persistencia de sesión cross-channel — un lead que chatea en web y luego escribe por WhatsApp empieza de cero | Sesiones unificadas por identificador (email, teléfono) con historial compartido |

**Valor de negocio**: StratosCore necesita presencia comercial 24/7 en los canales donde están los prospectos. Un agente inteligente que responda, califique leads y agende demos sin intervención humana acelera el funnel de ventas.

## Qué

### Criterios de Éxito
- [ ] Un mensaje enviado al widget web en stratoscore.app recibe respuesta inteligente generada por LLM en <5 segundos
- [ ] Un mensaje enviado al WhatsApp de StratosCore recibe respuesta del mismo agente en <10 segundos
- [ ] El agente conoce: servicios, precios, casos de éxito, proceso, stack técnico, y clientes activos
- [ ] El historial de conversación persiste entre mensajes del mismo lead (misma sesión)
- [ ] Leads cualificados se guardan en tabla `sales_leads` con score BANT
- [ ] Carlos recibe notificación por Telegram cuando un lead tiene score >= 70 o pide demo

### Comportamiento Esperado

**Happy Path — Web Widget:**
1. Visitante abre stratoscore.app, ve el chat widget (esquina inferior derecha)
2. Escribe: "¿Cuánto cuesta un sistema de gestión para mi clínica?"
3. El agente responde con pricing contextualizado, menciona el caso Mobility/MedCare como referencia, y pregunta datos del proyecto
4. El visitante da su email → se crea lead en `sales_leads`
5. Carlos recibe notificación en Telegram: "Nuevo lead desde web: [nombre/email] — preguntó por sistema para clínica"

**Happy Path — WhatsApp:**
1. Prospecto escribe al número de StratosCore: "Hola, vi su página, me interesa un software para mi negocio"
2. El agente responde con contexto de StratosCore y pregunta sobre el proyecto
3. Conversación fluye naturalmente, agente califica con BANT
4. Cuando el lead está cualificado, el agente sugiere agendar demo y notifica a Carlos

**Happy Path — Continuidad cross-channel:**
1. Lead chatea en web y da su email: carlos@ejemplo.com
2. Más tarde escribe por WhatsApp desde +50688881234
3. Carlos vincula manualmente email+teléfono en el futuro (V2)
4. En V1: cada canal mantiene su propia sesión, pero el knowledge base es el mismo

---

## Contexto

### Referencias
- `agent-server/src/agents/sales-agent.ts` — Sales agent actual (hardcoded, sin LLM)
- `agent-server/src/public-chat-api.ts` — Endpoint público del widget (ya existe, rutea a sales-agent)
- `agent-server/src/bot.ts` — Bot Telegram existente (canal admin, no se modifica)
- `business-os/src/features/medcare/lib/whatsapp/whatsapp-client.ts` — Cliente WhatsApp Meta Cloud API (envío de mensajes, ya funciona)
- `business-os/src/app/api/medcare/whatsapp/route.ts` — Webhook WhatsApp MedCare (patrón de verificación + procesamiento)
- `business-os/src/features/agents/services/run-agent.ts` — Patrón OpenRouter + Vercel AI SDK (generateText)
- `business-os/src/features/agents/config/prompts.ts` — Prompts de agentes existentes (GLOBAL_CONTEXT)

### Arquitectura Propuesta

```
                    ┌─────────────────────┐
                    │   Knowledge Base    │
                    │  (servicios, precios,│
                    │   casos, proceso)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Conversation      │
                    │   Engine            │
                    │  (OpenRouter LLM +  │
                    │   system prompt +   │
                    │   session memory)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼─────┐ ┌───────▼───────┐ ┌──────▼──────┐
    │  Web Widget   │ │   WhatsApp    │ │  Telegram   │
    │  Adapter      │ │   Adapter     │ │  (existente)│
    │               │ │               │ │  Solo admin │
    │ POST /chat/   │ │ POST /api/    │ │  No se toca │
    │ message       │ │ whatsapp/     │ │             │
    └───────────────┘ └───────────────┘ └─────────────┘
```

**Ubicación del código:**

```
agent-server/src/
├── agents/
│   ├── sales-agent.ts         ← REESCRIBIR: usar LLM real
│   └── knowledge-base.ts      ← NUEVO: contexto estructurado
├── conversation-engine.ts      ← NUEVO: capa channel-agnostic
├── public-chat-api.ts          ← MODIFICAR: usar conversation-engine
└── sessions.ts                 ← NUEVO: persistencia de sesiones (SQLite)

business-os/src/
├── app/api/
│   └── stratoscore/
│       └── whatsapp/
│           └── route.ts        ← NUEVO: webhook WhatsApp unificado StratosCore
├── shared/components/
│   └── ChatWidget.tsx          ← NUEVO: widget flotante para stratoscore.app
```

### Modelo de Datos

```sql
-- Sesiones de conversación (SQLite en agent-server)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,            -- uuid
  channel TEXT NOT NULL,           -- 'web' | 'whatsapp' | 'telegram'
  external_id TEXT,                -- phone number (whatsapp), session_id (web), chat_id (telegram)
  lead_email TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  messages TEXT NOT NULL DEFAULT '[]',  -- JSON array de ConversationTurn
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',    -- 'active' | 'closed' | 'escalated'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_sessions_external ON chat_sessions(channel, external_id);
CREATE INDEX idx_sessions_email ON chat_sessions(lead_email);

-- Sales leads (Supabase, tabla existente sales_leads — se reutiliza)
-- Solo se modifica para agregar columna 'channel' si no existe
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web';
```

### Decisiones de Arquitectura

1. **Conversation Engine en agent-server (no en business-os)**: El agent-server ya tiene Express, SQLite, OpenRouter configurado, y el public-chat-api. Centralizar la lógica conversacional ahí evita duplicación.

2. **WhatsApp webhook en business-os**: El webhook de Meta necesita HTTPS público. Vercel (business-os) ya tiene dominio público y HTTPS. El webhook recibe el mensaje, lo reenvía al agent-server para procesamiento, y devuelve la respuesta vía Meta Cloud API.

3. **LLM via OpenRouter (no Claude Agent SDK)**: El sales agent debe ser liviano y rápido (<5s). Claude Agent SDK es overkill (tool-use, sessions). Usar `generateText` de Vercel AI SDK con OpenRouter es más simple y rápido.

4. **Knowledge base como archivo .ts (no BD)**: Los servicios, precios y casos de StratosCore cambian poco. Un archivo TypeScript con el knowledge base es más fácil de mantener que una tabla en BD.

5. **Sesiones en SQLite (agent-server)**: Las sesiones son efímeras (expiran en 24h de inactividad). SQLite en agent-server es suficiente. No necesitan estar en Supabase.

6. **Telegram NO se modifica**: El bot Telegram es el canal admin de Carlos. Los prospectos usan web y WhatsApp. No mezclar.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase.

### Fase 1: Conversation Engine + Knowledge Base
**Objetivo**: Crear la capa channel-agnostic con LLM real (OpenRouter) que reemplaza al sales agent hardcodeado. Incluye knowledge base estructurado, system prompt del agente, gestión de sesiones en SQLite, y scoring BANT.
**Validación**: `curl POST /chat/message` con un mensaje devuelve respuesta generada por LLM (no hardcodeada) en <5s.

### Fase 2: Web Widget Mejorado
**Objetivo**: Crear componente `ChatWidget.tsx` embebible en stratoscore.app (landing) que se conecta al conversation engine vía `/chat/message`. UI flotante, responsive, con captura de email/nombre.
**Validación**: Visitar stratoscore.app, abrir widget, enviar mensaje, recibir respuesta inteligente. Lead aparece en BD si da email.

### Fase 3: WhatsApp Meta Cloud API
**Objetivo**: Crear webhook en business-os (`/api/stratoscore/whatsapp/route.ts`) que recibe mensajes de Meta, los reenvía al conversation engine en agent-server, y responde al usuario vía Meta Cloud API.
**Validación**: Enviar mensaje al número de WhatsApp de StratosCore, recibir respuesta inteligente del agente. Sesión persiste entre mensajes.

### Fase 4: Notificaciones a Carlos + Lead Escalation
**Objetivo**: Cuando un lead tiene score >= 70 o pide demo/cotización, enviar notificación automática a Carlos por Telegram (usando bot existente). Incluye resumen del lead y contexto de la conversación.
**Validación**: Chatear con el agente, mostrar interés alto → Carlos recibe notificación en Telegram con datos del lead.

### Fase 5: Validación Final
**Objetivo**: Sistema funcionando end-to-end en los 3 canales
**Validación**:
- [ ] `npm run build` exitoso en business-os y agent-server
- [ ] Web widget funciona en stratoscore.app
- [ ] WhatsApp webhook recibe y responde mensajes
- [ ] Notificaciones llegan a Carlos en Telegram
- [ ] Criterios de éxito cumplidos
- [ ] Rate limiting funciona en todos los canales

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

*(vacío — se llena durante implementación)*

---

## Gotchas

- [ ] OpenRouter con Vercel AI SDK: usar `.chat(modelId)` para forzar Chat Completions API (Responses API devuelve 400)
- [ ] WhatsApp Meta Cloud API: el webhook de verificación (GET) es requerido antes de poder recibir mensajes (POST)
- [ ] WhatsApp ventana de 24h: solo se pueden enviar mensajes de texto libre dentro de 24h del último mensaje del usuario. Después, solo templates aprobados
- [ ] Rate limiting: Meta tiene límites de mensajes por número. Implementar queue si hay mucho volumen
- [ ] El knowledge base debe actualizarse cuando cambien precios o servicios — considerar un mecanismo de refresh
- [ ] CORS: el widget web necesita que el agent-server permita requests desde stratoscore.app (ya configurado en public-chat-api)

## Anti-Patrones

- NO mezclar la lógica del bot Telegram admin con el agente público
- NO guardar conversaciones completas en Supabase (usar SQLite efímero para sesiones, solo leads cualificados van a Supabase)
- NO usar Claude Agent SDK para el sales agent (overkill, lento)
- NO hardcodear respuestas — todo pasa por LLM
- NO ignorar el historial de conversación al generar respuestas (el LLM necesita contexto)
- NO exponer el OPENROUTER_API_KEY al frontend (todo pasa por el backend)

---

*PRP pendiente aprobación. No se ha modificado código.*
