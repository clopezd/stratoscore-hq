# StratosCore — Plan de Escalabilidad

> Ultima actualizacion: 2026-04-10

---

## Tiers de infraestructura

### Tier 1 — Startup (actual)

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Pro | $20/mes |
| Supabase | Pro | $25/mes |
| OpenRouter | Pay-as-you-go | ~$5-15/mes |
| **Total** | | **~$50-60/mes** |

**Soporta:**
- Hasta 5 clientes activos
- 100K filas por tabla
- 500 usuarios concurrentes
- 100GB de bandwidth
- 8GB de storage en Supabase

### Tier 2 — Crecimiento

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Pro (extra bandwidth) | $20-40/mes |
| Supabase | Team | $599/mes |
| OpenRouter | Pay-as-you-go | ~$20-50/mes |
| **Total** | | **~$650-700/mes** |

**Soporta:**
- Hasta 20 clientes
- Sin limite de filas
- SOC 2 compliance (Supabase Team)
- Priority support
- 250GB bandwidth
- Daily backups con 14 dias de retencion

### Tier 3 — Enterprise

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Enterprise | Custom ($500+/mes) |
| Supabase | Enterprise | Custom ($500+/mes) |
| OpenRouter/Directo | Volume pricing | $50-200/mes |
| **Total** | | **~$1,000-1,500/mes** |

**Soporta:**
- Clientes ilimitados
- SLA dedicado (99.99%)
- Soporte prioritario 24/7
- Custom domains por cliente
- HIPAA compliance (Supabase Enterprise)
- SSO / SAML

### Tier 4 — Self-hosted (independencia total)

| Servicio | Opcion | Costo |
|----------|--------|-------|
| Hosting | AWS/GCP/Hetzner | $100-300/mes |
| Supabase | Self-hosted (Docker) | $0 (infra propia) |
| PostgreSQL | RDS o self-managed | $50-200/mes |
| **Total** | | **~$200-500/mes** |

**Para cuando:**
- Un cliente requiere datos on-premise
- Regulacion exige jurisdiccion especifica
- Volumen justifica infra propia

---

## Comparacion de costos

| Escenario | StratosCore | Equipo tradicional |
|-----------|------------|-------------------|
| Startup (5 clientes) | $50/mes | $5,000-10,000/mes (5 devs + infra) |
| Crecimiento (20 clientes) | $700/mes | $15,000-25,000/mes (8 devs + DevOps + infra) |
| Enterprise | $1,500/mes | $30,000+/mes |

**El costo escala linealmente, no exponencialmente.** Pasar de $50 a $1,500 es un 30x en infra para soportar 100x mas clientes.

---

## Triggers de escalamiento

| Trigger | Accion | De → A |
|---------|--------|--------|
| >5 clientes activos | Evaluar Supabase Team | Tier 1 → Tier 2 |
| Datos medicos regulados (HIPAA) | Supabase Enterprise | Tier 2 → Tier 3 |
| >100K requests/dia | Vercel Enterprise | Tier 2 → Tier 3 |
| Cliente exige on-premise | Despliegue separado | Cualquier → Tier 4 |
| Costo de OpenRouter >$100/mes | Evaluar SDK directo | Optimizacion |

---

## Respuesta para prospectos

**No tecnico:** "Empezamos con infraestructura de $50/mes que soporta sus primeros miles de usuarios. Cuando crezca, escalamos linealmente — no hay sorpresas de costo. Compare eso con $10,000/mes de un equipo tradicional desde el dia uno."

**Tecnico:** "Vercel Pro + Supabase Pro. Edge network global, connection pooling con PgBouncer, autoscaling de serverless functions. Cuando necesite SOC 2 o HIPAA, subimos a Supabase Team/Enterprise. Cero re-arquitectura."
