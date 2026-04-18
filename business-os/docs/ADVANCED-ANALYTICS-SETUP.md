# Advanced Analytics Setup Guide

Guía de instalación y configuración del módulo Advanced Analytics.

## 📋 Requisitos previos

- Next.js 16+ (business-os)
- Supabase proyecto activo
- Cuenta Anthropic con API key
- (Opcional) Cuenta Microsoft Power BI con credenciales

## 🚀 Paso 1: Configuración de Base de Datos

### 1.1 Crear migración Supabase

```bash
cd business-os
npx supabase migration new add_advanced_analytics
```

### 1.2 Copiar schema SQL

Copiar el contenido de `src/features/advanced-analytics/lib/database.sql` en la migración creada.

### 1.3 Ejecutar migración

```bash
npx supabase db push
```

Verificar que las tablas fueron creadas:

```bash
supabase db query "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

## 🔑 Paso 2: Variables de Entorno

Agregar a `.env.local`:

```env
# Supabase (ya debería estar)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Power BI (opcional)
NEXT_PUBLIC_POWERBI_CLIENT_ID=xxx
POWERBI_CLIENT_SECRET=xxx
POWERBI_TENANT_ID=xxx
```

## 📦 Paso 3: Instalar dependencias

```bash
npm install @anthropic-ai/sdk --legacy-peer-deps
# Si usas Power BI:
npm install powerbi-embedded --legacy-peer-deps
```

## 🔧 Paso 4: Compilar proyecto

```bash
npm run build
# Debe compilar sin errores
```

## ✅ Paso 5: Verificar endpoints

```bash
# 1. Obtener suscripción (sin datos)
curl http://localhost:3000/api/advanced-analytics/subscription \
  -H "Content-Type: application/json"

# 2. Crear suscripción (admin only)
curl -X POST http://localhost:3000/api/advanced-analytics/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "plan": "pro",
    "power_bi_workspace_id": "xxx"
  }'

# 3. Hacer análisis
curl -X POST http://localhost:3000/api/advanced-analytics/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "query": "¿Cuál fue mi mejor producto este mes?",
    "data_source": "power_bi"
  }'
```

## 🎨 Paso 6: Agregar página UI

La página ya está creada en:

```
business-os/src/app/(main)/advanced-analytics/page.tsx
```

Acceder a: `http://localhost:3000/advanced-analytics`

## 💳 Paso 7: Integración con Stripe (opcional)

Para monetizar Advanced Analytics:

### 7.1 Crear producto Stripe

```bash
curl https://api.stripe.com/v1/products \
  -u sk_test_xxx: \
  -d name="Advanced Analytics Pro" \
  -d type="service"
```

### 7.2 Crear precio

```bash
curl https://api.stripe.com/v1/prices \
  -u sk_test_xxx: \
  -d product="prod_xxx" \
  -d unit_amount=9900 \
  -d currency=usd \
  -d recurring[interval]=month \
  -d recurring[usage_type]=licensed
```

### 7.3 Webhook en agent-server

Crear un webhook que escuche `customer.subscription.created`:

```typescript
// agent-server/src/webhooks/stripe-advanced-analytics.ts
export async function handleAdvancedAnalyticsSubscription(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Obtener tenant_id del customer
  const tenant = await getTenantByStripeId(customerId);

  // Crear registro en advanced_analytics_subscriptions
  await supabase
    .from('advanced_analytics_subscriptions')
    .insert({
      tenant_id: tenant.id,
      user_id: tenant.owner_id,
      plan: getPlanFromProduct(subscription.items.data[0].price.product),
      status: 'active',
      expires_at: null,
    });
}
```

## 🤖 Paso 8: Scheduled Reports (Opcional)

Agregar en `agent-server/ecosystem.config.cjs`:

```javascript
{
  name: 'advanced-analytics-cron',
  script: 'src/cron/advanced-analytics.ts',
  instances: 1,
  exec_mode: 'cluster',
  cron_time: '0 */6 * * *', // Cada 6 horas
  max_memory_restart: '500M',
}
```

Crear `agent-server/src/cron/advanced-analytics.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import { generateReport } from '@/features/advanced-analytics/lib/generator';

export async function generateScheduledReports() {
  const now = new Date();

  // Obtener reportes que deben ejecutarse ahora
  const { data: reports } = await supabase
    .from('automated_reports')
    .select('*')
    .eq('enabled', true)
    .lte('next_scheduled', now.toISOString());

  for (const report of reports || []) {
    try {
      const pdf = await generateReport(report);
      await sendReportEmail(report, pdf);
      await updateNextSchedule(report);
    } catch (error) {
      console.error(`Report generation failed: ${report.id}`, error);
    }
  }
}

cron.schedule('0 */6 * * *', generateScheduledReports);
```

## 📊 Paso 9: Integración Power BI (Avanzado)

Si tienes cuenta Power BI:

### 9.1 Registrar aplicación en Azure AD

1. Ir a Azure Portal
2. App registrations → New registration
3. Nombre: "StratosCore Advanced Analytics"
4. Redirect URI: `http://localhost:3000/api/advanced-analytics/powerbi/callback`

### 9.2 Obtener credenciales

- Client ID: Application (client) ID
- Client Secret: New client secret
- Tenant ID: Directory (tenant) ID

### 9.3 Guardar en `.env.local`

```env
NEXT_PUBLIC_POWERBI_CLIENT_ID=xxx
POWERBI_CLIENT_SECRET=xxx
POWERBI_TENANT_ID=xxx
```

### 9.4 Crear endpoint de autenticación

```typescript
// src/app/api/advanced-analytics/powerbi/auth/route.ts
import { getAccessToken } from '@/features/advanced-analytics/lib/powerbi';

export async function GET() {
  const token = await getAccessToken();
  return Response.json({ access_token: token });
}
```

## 🧪 Testing

### Test unitario del hook

```typescript
// __tests__/useAdvancedAnalytics.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAdvancedAnalytics } from '@/features/advanced-analytics';

describe('useAdvancedAnalytics', () => {
  it('should fetch subscription for tenant', async () => {
    const { result } = renderHook(() =>
      useAdvancedAnalytics('tenant-id-xxx')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subscription).toBeDefined();
  });
});
```

### Test E2E

```typescript
// e2e/advanced-analytics.spec.ts
import { test, expect } from '@playwright/test';

test('should show advanced analytics dashboard', async ({ page }) => {
  await page.goto('/advanced-analytics');

  // Verify title
  const title = page.locator('h1');
  await expect(title).toContainText('Advanced Analytics');

  // Verify components
  await expect(
    page.locator('text=Power BI Dashboard')
  ).toBeVisible();
  await expect(page.locator('text=AI Analysis')).toBeVisible();
  await expect(
    page.locator('text=Automated Reports')
  ).toBeVisible();
});
```

## 🚨 Troubleshooting

### Error: "supabaseUrl is required"

**Causa:** Variables de entorno no cargadas
**Solución:** Verificar `.env.local` existe y tiene valores

### Error: "Module not found: @anthropic-ai/sdk"

**Causa:** Dependencia no instalada
**Solución:** `npm install @anthropic-ai/sdk`

### Error: "RLS policy failed"

**Causa:** Usuario no tiene permisos
**Solución:** Verificar RLS policies en Supabase y que `users.tenant_id` está poblado

## 📝 Notas

- El módulo requiere que `users.tenant_id` esté poblado
- Power BI es opcional (funciona sin él)
- Claude API es requerido para análisis
- El pricing se controla en Stripe (integración futura)

## 🔗 Recursos

- [Advanced Analytics README](../src/features/advanced-analytics/README.md)
- [Anthropic Docs](https://docs.anthropic.com)
- [Power BI API Docs](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embedded-analytics-power-bi-service-principal)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
