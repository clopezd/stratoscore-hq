# Business OS — Arquitectura de Agentes

> **Stratoscore · Next.js + Supabase · Vercel AI SDK**
> 10 agentes autónomos que operan el portafolio de negocios.

---

## Contexto Global (inyectar en TODOS los agentes)

```
Eres parte del equipo de IA del Business OS de Stratoscore.

CONTEXTO DEL NEGOCIO:
- Portafolio de 5 productos SaaS + 1 agencia B2B de automatización
- Stack tecnológico: Next.js, Supabase, Vercel
- Moneda: USD (costos de infraestructura) y MXN (ingresos de agencia)
- El dueño es un solo operador que gestiona todo el portafolio
- Los datos vienen de la tabla `metrics_snapshots` (snapshots diarios por producto)
- Productos se identifican por `product_id` en la tabla `products`

REGLAS GENERALES:
- Sé directo y conciso. Nada de relleno corporativo.
- Usa datos reales de las tablas, nunca inventes números.
- Si no tienes datos suficientes, dilo explícitamente.
- Formatea números: MRR con $, porcentajes con %, fechas en formato corto.
- Cuando detectes algo urgente, márcalo con 🔴. Advertencias con 🟡. Positivo con 🟢.
- Responde siempre en español.
```

---

## Mapa de Agentes

| # | Agente | Slug | Equipo | Schedule | Dependencias |
|---|--------|------|--------|----------|-------------|
| 1 | CFO | `cfo` | Estratégico | Diario 10:10am | Recolector, Analista |
| 2 | CTO | `cto` | Estratégico | Diario 10:15am | Recolector, Analista |
| 3 | CMO | `cmo` | Estratégico | Diario 10:20am | Recolector, Analista |
| 4 | CPO | `cpo` | Estratégico | Diario 10:25am | Recolector, Analista |
| 5 | CEO | `ceo` | Estratégico | Diario 10:30am | CFO, CTO, CMO, CPO |
| 6 | Estratega | `strategist` | Estratégico | Domingos 11:00am | Todos |
| 7 | Recolector | `collector` | Operacional | Diario 10:00am | Ninguna |
| 8 | Analista | `analyst` | Operacional | Diario 10:05am | Recolector |
| 9 | Periodista | `journalist` | Operacional | Diario 10:10am | Todos |
| 10 | Limpieza | `cleanup` | Operacional | Domingos 2:00am | Ninguna |

---

## Orden de Ejecución Diaria

```
10:00am  →  Recolector    (sincroniza datos de los 5 SaaS)
10:05am  →  Analista      (detecta anomalías en datos frescos)
10:10am  →  CFO           (análisis financiero)
10:10am  →  Periodista    (empieza a recopilar para el diario)
10:15am  →  CTO           (salud técnica)
10:20am  →  CMO           (growth y funnels)
10:25am  →  CPO           (producto y engagement)
10:30am  →  CEO           (sintetiza todo + decide acciones)
10:35am  →  Periodista    (completa el diario con las acciones del CEO)
```

### Domingos (adicional):
```
02:00am  →  Limpieza      (mantenimiento de BD)
11:00am  →  Estratega     (reporte semanal + proyecciones)
```

---

## Tablas y Permisos por Agente

| Tabla | Collector | Analyst | CFO | CTO | CMO | CPO | CEO | Strategist | Journalist | Cleanup |
|-------|-----------|---------|-----|-----|-----|-----|-----|------------|------------|---------|
| products | R | R | R | R | R | R | R | R | R | R |
| metrics_snapshots | **W** | R | R | R | R | R | R | R | R | - |
| agent_reports | - | - | **W** | **W** | **W** | **W** | **W** | **W** | R | **D** |
| alerts | - | **W** | **W** | **W** | **W** | - | R | R | R | **D** |
| journal_entries | - | - | - | - | - | - | - | R | **W** | - |
| daily_actions | - | - | - | - | - | - | **W** | R | R | **D** |
| goals | - | - | - | - | - | R | R | R | - | **A** |
| collector_errors | **W** | R | - | R | - | - | - | - | - | **D** |
| subscriptions | - | - | R | R | - | - | - | - | - | - |
| deals | - | - | - | - | R | - | - | R | R | - |
| income_entries | - | - | R | - | - | - | - | - | - | - |
| expense_entries | - | - | R | - | - | - | - | - | - | - |

R=Lee, **W**=Escribe, **D**=Elimina, **A**=Archiva

---

## System Prompts

Los system prompts individuales de cada agente están en:
```
docs/agents/
├── 01-collector.md
├── 02-analyst.md
├── 03-cfo.md
├── 04-cto.md
├── 05-cmo.md
├── 06-cpo.md
├── 07-ceo.md
├── 08-strategist.md
├── 09-journalist.md
└── 10-cleanup.md
```

---

## Schema de Base de Datos

Migración completa en: `supabase/migrations/005_business_os_agents.sql`
