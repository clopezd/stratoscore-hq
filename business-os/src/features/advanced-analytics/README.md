# Advanced Analytics Module

Módulo de análisis avanzados con Power BI y Claude AI para StratosCore HQ.

## Funcionalidades

✅ **Dashboard Power BI embebido** — Visualizaciones interactivas
✅ **Claude AI analysis** — Análisis inteligente de datos con lenguaje natural
✅ **Reportes automatizados** — Generación de reportes por frecuencia (daily/weekly/monthly)
✅ **RLS multi-tenant** — Acceso aislado por tenant
✅ **Planes pagos** — Pro y Enterprise

## Estructura

```
advanced-analytics/
├── components/          # Componentes React
│   ├── PowerBiDashboard.tsx
│   ├── ClaudeInsights.tsx
│   └── ReportGenerator.tsx
├── hooks/               # Hooks personalizados
│   └── useAdvancedAnalytics.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── lib/                 # Utilidades
│   └── database.sql
└── README.md
```

## Instalación

### 1. Base de datos Supabase

Ejecutar las migraciones:

```bash
cd business-os
npx supabase migration new advanced_analytics
# Copiar contenido de lib/database.sql en la migración
npx supabase db push
```

### 2. Variables de entorno

```env
ANTHROPIC_API_KEY=sk-...
NEXT_PUBLIC_POWERBI_CLIENT_ID=...
POWERBI_CLIENT_SECRET=...
POWERBI_TENANT_ID=...
```

### 3. Integración en app

```tsx
import { ClaudeInsights, PowerBiDashboard, ReportGenerator } from '@/features/advanced-analytics';
import { useAdvancedAnalytics } from '@/features/advanced-analytics/hooks';

export default function AnalyticsPage() {
  const { subscription, isEnabled } = useAdvancedAnalytics(tenantId);

  if (!isEnabled) {
    return <div>Advanced Analytics not enabled for your account</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <PowerBiDashboard config={powerBiConfig} reportId="..." />
      <ClaudeInsights tenantId={tenantId} />
      <ReportGenerator tenantId={tenantId} />
    </div>
  );
}
```

## APIs

### POST /api/advanced-analytics/analyze
Analiza datos con Claude AI.

```bash
curl -X POST http://localhost:3000/api/advanced-analytics/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "uuid",
    "user_id": "uuid",
    "query": "¿Cuáles fueron mis ventas el mes pasado?",
    "data_source": "power_bi"
  }'
```

### POST /api/advanced-analytics/reports
Crea un reporte automatizado.

```bash
curl -X POST http://localhost:3000/api/advanced-analytics/reports \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "uuid",
    "name": "Monthly Sales Report",
    "frequency": "monthly",
    "template": "sales",
    "enabled": true
  }'
```

### GET /api/advanced-analytics/subscription
Obtiene la suscripción del tenant.

```bash
curl http://localhost:3000/api/advanced-analytics/subscription?tenant_id=uuid
```

### POST /api/advanced-analytics/subscription
Activa Advanced Analytics para un tenant.

```bash
curl -X POST http://localhost:3000/api/advanced-analytics/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "uuid",
    "user_id": "uuid",
    "plan": "pro",
    "power_bi_workspace_id": "..."
  }'
```

## Pricing

| Plan | Precio | Features |
|------|--------|----------|
| Pro | $99/mes | 100 análisis/mes, 1 reporte automatizado |
| Enterprise | Contactar | Análisis ilimitados, reportes ilimitados |

## Flujo de integración con clientes

1. **Admin activa feature** — PATCH subscription endpoint
2. **Usuario accede a dashboard** — Componente verifica suscripción con hook
3. **Usuario hace preguntas** — Claude analiza y devuelve insights
4. **Reportes se generan** — Scheduled jobs (via agent-server cron)

## Próximos pasos

- [ ] Integración Power BI SDK
- [ ] Scheduled report generation (cron)
- [ ] Email delivery de reportes
- [ ] Webhooks para eventos (report ready, etc)
- [ ] Analytics de uso (tracking)
