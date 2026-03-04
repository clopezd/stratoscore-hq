# PRP — StratosCore OS Personal · Fase 1
**Product Requirements Proposal**
Fecha: 2026-03-02 | Autor: Carlos Mario + Claude

---

## 1. Visión

StratosCore es el sistema operativo personal para gestionar tres negocios y proyectos de automatización desde un único punto de control. No es una app de productividad — es la capa de comando sobre Lavandería, Mobility y la Agencia de Seguros.

**Principio rector:** Menos dashboards, más decisiones. El sistema debe reducir la fricción cognitiva de operar tres negocios simultáneamente.

---

## 2. Estado Actual del Sistema

### 2.1 Lo que está funcionando

| Componente | Estado | Detalles |
|------------|--------|----------|
| Mission Control | ✅ 95% | Board, Chat, Cron, Calendar, Draw, Activity — todos operativos |
| Agent Server | ✅ 95% | Telegram bot configurado, memoria dual-sector, scheduler, voz (ElevenLabs) |
| Finance OS | ⚠️ 70% | Código completo pero sin `.env.local`, sin tablas DB, con datos placeholder |

### 2.2 Bugs críticos (bloquean integración)

**BUG-001 · Token mismatch MC ↔ Agent Server**
```
Mission Control:   OPENCLAW_GATEWAY_TOKEN=secreto123
Agent Server:      OPENCLAW_GATEWAY_TOKEN=tumision_2026
```
→ El chat de Mission Control falla con 401. Deben coincidir.

**BUG-002 · Finance OS sin entorno configurado**
- No existe `finance-os/.env.local`
- Las cuentas son placeholders en inglés (`Primary Checking`, `Credit Card 1`...)
- Sin tablas Supabase creadas → la app no arranca correctamente

---

## 3. Roadmap de Fases

```
Fase 1A: Reparar (1-2 días)
Fase 1B: Personalizar (2-3 días)
Fase 2:  Integrar negocios (1-2 semanas)
Fase 3:  Automatizar (continuo)
```

---

## 4. Fase 1A — Reparar · Make it Work (Prioridad: AHORA)

### 4A-1 · Fix token mismatch

**Acción:** Alinear el token en ambos lados. Elegir uno y aplicarlo.

```bash
# En agent-server/.env
OPENCLAW_GATEWAY_TOKEN=<token_elegido>

# En Mission-Control/.env.local
OPENCLAW_GATEWAY_TOKEN=<mismo_token>
```

**Test:** Abrir el chat en Mission Control → debe conectar y responder sin error 401.

---

### 4A-2 · Configurar Finance OS

**Paso 1 — Crear `.env.local`:**
```bash
cp finance-os/.env.example finance-os/.env.local
```
Luego completar con las credenciales de Supabase (mismo proyecto o proyecto separado).

**Paso 2 — Crear tablas en Supabase:**
Ejecutar el SQL del `docs/SETUP_PROMPT.md` (Sección 3B) en el editor SQL de Supabase.

**Paso 3 — Personalizar cuentas (ver Fase 1B).**

---

### 4A-3 · Verificar Agent Server en producción

```bash
cd agent-server && npx tsx scripts/status.ts
```
Confirmar que el servidor está activo en puerto 3099 y el bot Telegram responde.

---

## 5. Fase 1B — Personalizar · Make it Yours (Prioridad: ESTA SEMANA)

### 5B-1 · Actualizar CLAUDE.md

El `CLAUDE.md` actual es el template genérico de Business OS. Debe reemplazarse con contexto real de StratosCore:

**Contenido a agregar:**
- Nombre: Carlos Mario
- Negocios: Lavandería, Mobility, Agencia de Seguros
- Stack de decisiones (qué herramientas usa, qué métricas importan)
- Tono y preferencias de comunicación del agente
- Contexto de cada negocio para que el agente responda con inteligencia

---

### 5B-2 · Configurar cuentas en Finance OS

Reemplazar el array `CUENTAS` en `finance-os/src/features/finances/types/index.ts`:

```typescript
// Reemplazar los placeholders con las cuentas reales:
export const CUENTAS = [
  'Banco Principal',          // ← nombre real
  'Cuenta Lavandería',        // ← separar por negocio si aplica
  'Cuenta Mobility',
  'Cuenta Seguros',
  'Efectivo',
  'Tarjeta de Crédito',
] as const
```

---

### 5B-3 · Configurar cron jobs iniciales

Reemplazar los cron jobs de ejemplo con tareas reales útiles:

```bash
# Briefing diario a las 8 AM (hora local)
npx tsx src/schedule-cli.ts create \
  "Genera un briefing de las próximas 24 horas: tareas pendientes, recordatorios y alertas para los negocios Lavandería, Mobility y Seguros." \
  "0 8 * * *" <CHAT_ID>

# Resumen semanal los lunes
npx tsx src/schedule-cli.ts create \
  "Genera el resumen semanal de actividad: qué se completó, qué quedó pendiente, qué requiere atención urgente esta semana." \
  "0 9 * * 1" <CHAT_ID>
```

---

### 5B-4 · Instalar como servicio de sistema (opcional pero recomendado)

Si el Agent Server no está corriendo como daemon permanente:

```bash
# Linux / WSL2 (usando PM2)
npm install -g pm2
cd agent-server && npm run build
pm2 start dist/index.js --name stratoscore-agent
pm2 save
pm2 startup   # genera el comando para auto-start al boot
```

---

## 6. Fase 2 — Integrar Negocios (Semana 2-3)

Esta fase añade inteligencia de negocio real al sistema. Cada área de negocio necesita:

### 6.1 · Lavandería

**Contexto para el agente:** rutas de recolección, clientes recurrentes, volumen de pedidos, alertas de capacidad.

**Features a construir:**
- [ ] Panel de métricas en Mission Control (pedidos/semana, revenue, clientes activos)
- [ ] Cron job: alerta si hay pedidos sin procesar después de X horas
- [ ] Integración Finance OS: categoría separada para ingresos/gastos de lavandería

---

### 6.2 · Mobility

**Contexto para el agente:** flota de vehículos, mantenimientos programados, conductores, métricas de utilización.

**Features a construir:**
- [ ] Panel de flota en Mission Control (o vista en board de tareas)
- [ ] Cron job: recordatorio de mantenimientos próximos
- [ ] Integración Finance OS: ingresos por vehículo, gastos de mantenimiento

---

### 6.3 · Agencia de Seguros

**Contexto para el agente:** cartera de clientes, renovaciones próximas, pipeline de ventas, comisiones.

**Features a construir:**
- [ ] Vista de pipeline en Mission Control (adaptar Kanban para seguimiento de pólizas)
- [ ] Cron job: alerta de renovaciones próximas (30/15/7 días)
- [ ] Integración Finance OS: comisiones por mes, proyección de ingresos

---

## 7. Fase 3 — Automatizar (Continuo)

Una vez que el sistema tiene contexto de los tres negocios, las automatizaciones de alto valor son:

| Automatización | Negocio | Impacto |
|---------------|---------|---------|
| Briefing diario consolidado | Los 3 | Alto — una sola revisión matutina |
| Alertas de anomalías en ingresos | Finance OS | Alto — detecta problemas antes |
| Generación automática de reportes | Los 3 | Medio — menos tiempo administrativo |
| Seguimiento de KPIs por negocio | Los 3 | Alto — visibilidad sin trabajo manual |
| Recordatorios de renovaciones | Seguros | Alto — impacto directo en retención |

---

## 8. Criterios de Éxito — Fase 1

La Fase 1 está completa cuando:

- [ ] Chat en Mission Control funciona sin errores (BUG-001 resuelto)
- [ ] Finance OS arranca y muestra dashboard con cuentas reales (BUG-002 resuelto)
- [ ] Agent Server activo como servicio permanente
- [ ] CLAUDE.md personalizado con contexto de los 3 negocios
- [ ] Al menos 2 cron jobs activos y útiles
- [ ] Al menos 1 transacción registrada en Finance OS por negocio (para validar el flujo)

---

## 9. Decisiones Pendientes

Antes de arrancar Fase 2, necesito respuestas de Carlos Mario:

1. **Finance OS:** ¿Un proyecto Supabase compartido con Mission Control, o uno separado?
2. **Cuentas:** ¿Cuáles son las cuentas bancarias/financieras reales que usa por negocio?
3. **Lavandería:** ¿Hay algún sistema de pedidos hoy (WhatsApp, app, hoja de cálculo)? ¿Queremos integrarlo?
4. **Mobility:** ¿Cuántos vehículos? ¿Qué métricas son las más críticas hoy?
5. **Seguros:** ¿Qué CRM o sistema usa hoy para la cartera de clientes?
6. **Despliegue:** ¿Mission Control ya está en Vercel, o solo corre local?

---

## 10. Próximo paso inmediato

**Hoy:** Resolver BUG-001 (token) + BUG-002 (Finance OS env) para tener los 3 componentes comunicándose.

¿Arrancamos con eso ahora?
