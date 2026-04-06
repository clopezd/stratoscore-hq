# Plan de Conexión T-1: Cubo Excel de Videndum → StratosCore

> **Objetivo:** Sincronización automatizada diaria (T-1) del cubo Excel de Videndum
> **Tecnología Origen:** Microsoft Excel (cubo de datos)
> **Latencia Target:** < 24 horas (T-1 business day)
> **Autor:** StratosCore HQ
> **Fecha:** 2026-03-13 (actualizado para Excel)

---

## 🎯 Situación Actual

### Arquitectura Existente

```
┌─────────────────────────────────┐
│  Videndum Data Cube (EXCEL)     │  ← Archivo Excel actualizado por equipo de BI
│  📊 videndum_data_cube.xlsx     │     (SharePoint, OneDrive, o servidor local)
│  - Hoja: Revenue                │
│  - Hoja: Order Intake           │
│  - Hoja: Order Book             │
│  - Hoja: Opportunities          │
│  - Hoja: Inventory              │
└─────────────────────────────────┘
           │
           │ 1. Exportación manual → CSV (actual)
           ▼
┌─────────────────────────────────┐
│  videndum_records.csv            │
│  (~20k filas, histórico estático)│
└─────────────────────────────────┘
           │
           │ 2. import-videndum.mjs (batch manual)
           ▼
┌─────────────────────────────────┐
│  Supabase PostgreSQL             │
│  ├── videndum_records (core)     │
│  ├── order_intake                │
│  ├── order_book                  │
│  ├── opportunities               │
│  ├── opportunities_unfactored    │
│  ├── opportunities_history       │
│  ├── global_inventory            │
│  └── VIEW: videndum_full_context │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Next.js 16 Dashboard            │
│  /videndum                       │
│  - KPIs (CAGR, B2B, CV)          │
│  - Intelligence UI               │
│  - Executive Summary             │
└─────────────────────────────────┘
```

### ❌ Problemas Actuales

1. **Latencia:** Datos actualizados manualmente (días/semanas de retraso)
2. **Escalabilidad:** CSV manual no escala para actualizaciones frecuentes
3. **Auditabilidad:** Sin trazabilidad de cambios en tiempo real
4. **Integridad:** Riesgo de versiones inconsistentes entre cubo y dashboard
5. **Operacional:** Requiere intervención manual de Carlos o equipo de Videndum

---

## 🏗️ Arquitectura Propuesta: Sincronización Automatizada T-1 (Excel)

### ✅ Opción Recomendada: **OneDrive/SharePoint API + Cron Job**

```
┌────────────────────────────────────────────┐
│  Videndum Excel Cube                       │
│  📊 Ubicación: SharePoint/OneDrive/SFTP    │
│  - videndum_data_cube.xlsx                 │
│  - Actualizado diariamente a las 8:00 AM   │
└────────────────────────────────────────────┘
           │
           │ [Opción A] Microsoft Graph API (si OneDrive/SharePoint)
           │ [Opción B] SFTP/FTP automated download
           │ [Opción C] Shared folder mount (si red local)
           ▼
┌────────────────────────────────────────────┐
│  Agent Server - Cron Job (9:00 AM daily)   │
│  /home/.../agent-server/src/agents/        │
│   videndum-excel-sync.ts                   │
│                                             │
│  1. Download Excel (Graph API / SFTP)      │
│  2. Parse XLSX → JSON (npm: xlsx)          │
│  3. Validate schema (Zod)                  │
│  4. Transform → Supabase schema            │
│  5. Upsert to Supabase (batch 500)         │
│  6. Log success + notify Telegram          │
└────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  Supabase PostgreSQL                        │
│  - videndum_records (updated daily)        │
│  - Timestamp: last_sync_at                 │
└────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  Dashboard - Badge "Última actualización"  │
│  "Datos actualizados: hace 2 horas"        │
└────────────────────────────────────────────┘
```

---

## 📋 Plan de Implementación (3 Opciones según Ubicación del Excel)

### **Opción A: Excel en OneDrive/SharePoint** ⭐ RECOMENDADO

**Requisitos:**
- Cuenta de servicio (Service Principal) con permisos de lectura en SharePoint
- O delegated access si es OneDrive personal

**Paquetes a instalar:**

```bash
cd agent-server
npm install @microsoft/microsoft-graph-client @azure/identity xlsx
```

**Implementación:**

```typescript
// agent-server/src/agents/videndum-excel-sync.ts
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
)

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken('https://graph.microsoft.com/.default')
      return token.token
    }
  }
})

export async function syncVidendumExcel() {
  console.log('📥 Downloading Excel from SharePoint...')

  // 1. Download Excel
  const fileUrl = '/sites/VidendumBI/Shared Documents/videndum_data_cube.xlsx'
  const stream = await graphClient
    .api(fileUrl)
    .get()

  // 2. Parse XLSX
  const workbook = XLSX.read(stream, { type: 'buffer' })

  // 3. Extract sheets
  const revenueSheet = workbook.Sheets['Revenue']
  const revenueData = XLSX.utils.sheet_to_json(revenueSheet)

  const orderIntakeSheet = workbook.Sheets['Order Intake']
  const orderIntakeData = XLSX.utils.sheet_to_json(orderIntakeSheet)

  // 4. Transform to Supabase schema
  const records = [
    ...transformRevenue(revenueData),
    ...transformOrderIntake(orderIntakeData)
  ]

  // 5. Upsert to Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const BATCH_SIZE = 500
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('videndum_records')
      .upsert(batch, {
        onConflict: 'tenant_id,part_number,catalog_type,metric_type,year,month'
      })

    if (error) throw error
  }

  console.log(`✅ Synced ${records.length} records`)

  // 6. Update last_sync timestamp
  await supabase
    .from('sync_metadata')
    .upsert({
      source: 'videndum_excel',
      last_sync_at: new Date().toISOString(),
      records_synced: records.length
    })

  // 7. Notify via Telegram
  await notifyTelegram(`✅ Videndum Excel sync: ${records.length} registros actualizados`)
}

function transformRevenue(rows: any[]) {
  return rows.map(row => ({
    tenant_id: 'videndum',
    part_number: row['Part Number'],
    catalog_type: row['Catalog Type'],
    metric_type: 'revenue',
    year: parseInt(row['Year']),
    month: parseInt(row['Month']) || null,
    quantity: parseFloat(row['Amount']),
    source_sheet: 'Excel_' + new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}

function transformOrderIntake(rows: any[]) {
  return rows.map(row => ({
    tenant_id: 'videndum',
    part_number: row['Part Number'],
    catalog_type: row['Catalog Type'],
    metric_type: 'order_intake',
    year: parseInt(row['Year']),
    month: parseInt(row['Month']) || null,
    quantity: parseFloat(row['Quantity']),
    source_sheet: 'Excel_' + new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}
```

**Configuración del cron:**

```typescript
// agent-server/src/server.ts
import { scheduleJob } from 'node-cron'
import { syncVidendumExcel } from './agents/videndum-excel-sync'

// Run every day at 9:00 AM (después de que Videndum actualice a las 8 AM)
scheduleJob('0 9 * * *', async () => {
  try {
    await syncVidendumExcel()
  } catch (err) {
    console.error('❌ Videndum Excel sync failed:', err)
    await notifyTelegram(`⚠️ Error en sync de Videndum: ${err.message}`)
  }
})
```

---

### **Opción B: Excel en SFTP/FTP Server**

**Requisitos:**
- Credenciales SFTP (host, user, password/key)
- Ruta del archivo en servidor

**Paquetes a instalar:**

```bash
cd agent-server
npm install ssh2-sftp-client xlsx
```

**Implementación:**

```typescript
import * as sftp from 'ssh2-sftp-client'
import * as XLSX from 'xlsx'

export async function syncVidendumExcelSFTP() {
  const client = new sftp()

  await client.connect({
    host: process.env.VIDENDUM_SFTP_HOST,
    port: 22,
    username: process.env.VIDENDUM_SFTP_USER,
    password: process.env.VIDENDUM_SFTP_PASSWORD
  })

  const remotePath = '/data/exports/videndum_data_cube.xlsx'
  const localPath = '/tmp/videndum_data_cube.xlsx'

  await client.get(remotePath, localPath)
  await client.end()

  // Parse Excel (igual que Opción A)
  const workbook = XLSX.readFile(localPath)
  // ... resto del proceso
}
```

---

### **Opción C: Excel en Carpeta Compartida (Red Local/SMB)**

**Requisitos:**
- Carpeta compartida montada en el servidor (ej: `/mnt/videndum_share`)
- Permisos de lectura

**Paquetes a instalar:**

```bash
cd agent-server
npm install xlsx
```

**Implementación:**

```typescript
import * as XLSX from 'xlsx'
import { existsSync } from 'fs'

export async function syncVidendumExcelLocal() {
  const filePath = '/mnt/videndum_share/videndum_data_cube.xlsx'

  // Verificar que existe
  if (!existsSync(filePath)) {
    throw new Error('Excel file not found at ' + filePath)
  }

  const workbook = XLSX.readFile(filePath)
  // ... resto del proceso (igual que Opción A)
}
```

**Configuración del mount (en servidor Linux):**

```bash
# /etc/fstab
//videndum-server/share /mnt/videndum_share cifs username=readonly,password=xxx,ro 0 0
```

---

## 📊 Comparación de Opciones

| Criterio | OneDrive/SharePoint | SFTP/FTP | Carpeta Compartida |
|---|---|---|---|
| **Complejidad** | Media 🔨 | Baja 🟢 | Muy baja 🟢 |
| **Seguridad** | Alta (OAuth2) ✅ | Media (SSH) ⚠️ | Baja (credenciales) ⚠️ |
| **Escalabilidad** | Alta ✅ | Media ⚠️ | Baja ❌ |
| **Costo** | Gratis (con M365) 💰 | Variable 💰 | Gratis 💰 |
| **Mantenimiento** | Bajo ✅ | Bajo ✅ | Medio (mount) ⚠️ |
| **Recomendado si** | Excel en OneDrive/SharePoint | Videndum usa SFTP | Servidor en misma red |

---

## 🛠️ Estructura del Excel Requerida

Para que la sincronización funcione, **necesito que me confirmes la estructura exacta** del Excel de Videndum. Ejemplo esperado:

### Hoja "Revenue"

| Part Number | Catalog Type | Year | Month | Amount |
|---|---|---|---|---|
| 3400-001 | INV | 2024 | 1 | 125000 |
| 3400-002 | PKG | 2024 | 1 | 87500 |
| 3400-001 | INV | 2024 | 2 | 130000 |

### Hoja "Order Intake"

| Part Number | Catalog Type | Year | Month | Quantity |
|---|---|---|---|---|
| 3400-001 | INV | 2024 | 1 | 1250 |
| 3400-002 | PKG | 2024 | 1 | 875 |

### Hoja "Order Book"

| Part Number | Catalog Type | Year | Month | Backlog |
|---|---|---|---|---|
| 3400-001 | INV | 2024 | 1 | 300 |

### Hoja "Opportunities"

| Part Number | Catalog Type | Year | Month | Amount | Probability % | Stage |
|---|---|---|---|---|---|---|
| 3400-003 | INV | 2024 | 3 | 50000 | 60 | Proposal |

### Hoja "Inventory"

| Part Number | Catalog Type | Year | Month | Stock | Warehouse |
|---|---|---|---|---|---|
| 3400-001 | INV | 2024 | 1 | 450 | Cartago |

---

## ✅ Checklist de Implementación

### **Paso 1: Configuración de Acceso** (CARLOS - ACCIÓN REQUERIDA)

- [ ] **Confirmar ubicación del Excel:**
  - [ ] OneDrive/SharePoint (proveer URL del archivo)
  - [ ] SFTP/FTP (proveer host, user, password)
  - [ ] Carpeta compartida (proveer ruta de red)
  - [ ] Otro (especificar)

- [ ] **Si es OneDrive/SharePoint:**
  - [ ] Crear Service Principal en Azure AD ([guía aquí](https://learn.microsoft.com/en-us/graph/auth-register-app-v2))
  - [ ] Dar permisos `Files.Read.All` o `Sites.Read.All`
  - [ ] Proveer credenciales:
    - `AZURE_TENANT_ID`
    - `AZURE_CLIENT_ID`
    - `AZURE_CLIENT_SECRET`
    - URL completa del archivo en SharePoint

- [ ] **Si es SFTP:**
  - [ ] Crear usuario read-only en servidor SFTP
  - [ ] Proveer credenciales:
    - `VIDENDUM_SFTP_HOST`
    - `VIDENDUM_SFTP_PORT` (default: 22)
    - `VIDENDUM_SFTP_USER`
    - `VIDENDUM_SFTP_PASSWORD` o `VIDENDUM_SFTP_KEY_PATH`
    - Ruta completa del archivo: `/path/to/videndum_data_cube.xlsx`

- [ ] **Si es carpeta compartida:**
  - [ ] Proveer ruta de red (ej: `//server/share/videndum_data_cube.xlsx`)
  - [ ] Proveer credenciales de Windows/Samba
  - [ ] Confirmar que el servidor de StratosCore tiene acceso a la red de Videndum

- [ ] **Confirmar estructura del Excel:**
  - [ ] Enviar screenshot de las primeras 5 filas de cada hoja
  - [ ] O enviar Excel de ejemplo (puede ser con datos dummy)
  - [ ] Confirmar nombres exactos de las hojas (ej: "Revenue" o "Ingresos")
  - [ ] Confirmar nombres de columnas (case-sensitive)

### **Paso 2: Desarrollo** (STRATOSCORE - 3-5 días)

- [ ] Instalar dependencias (Graph API / SFTP / xlsx)
- [ ] Implementar `agent-server/src/agents/videndum-excel-sync.ts`
- [ ] Crear transformación de schema Excel → Supabase
  - [ ] `transformRevenue()`
  - [ ] `transformOrderIntake()`
  - [ ] `transformOrderBook()`
  - [ ] `transformOpportunities()`
  - [ ] `transformInventory()`
- [ ] Validación de schema con Zod
- [ ] Configurar cron job (9:00 AM diario)
- [ ] Implementar logging detallado
- [ ] Implementar notificaciones Telegram (success + error)
- [ ] Crear tabla `sync_metadata` en Supabase

```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL UNIQUE,
  last_sync_at TIMESTAMPTZ NOT NULL,
  records_synced INT NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('success', 'error', 'running')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sync_metadata (source, last_sync_at, records_synced, status)
VALUES ('videndum_excel', now(), 0, 'success')
ON CONFLICT (source) DO NOTHING;
```

### **Paso 3: Testing** (2 días)

- [ ] Test manual de descarga de Excel desde ubicación real
- [ ] Test de parsing de todas las hojas
- [ ] Test de transformación (verificar tipos de datos, NULLs, duplicados)
- [ ] Test de upsert a Supabase staging table
- [ ] Comparar totales: Excel vs Supabase (debe coincidir 100%)
  ```sql
  -- Verificar totales
  SELECT
    SUM(quantity) AS total_revenue
  FROM videndum_records
  WHERE metric_type = 'revenue' AND year = 2024;
  -- Comparar con suma en Excel
  ```
- [ ] Test de manejo de errores:
  - [ ] Excel no disponible (timeout)
  - [ ] Schema inválido (columnas faltantes)
  - [ ] Red caída
  - [ ] Supabase no responde
- [ ] Test de retry logic
- [ ] Test de notificaciones Telegram

### **Paso 4: Producción** (1 día)

- [ ] Deploy código a `agent-server`
- [ ] Configurar variables de entorno en `.env`
- [ ] Ejecutar primera sincronización manual
  ```bash
  cd agent-server
  npx tsx src/agents/videndum-excel-sync.ts
  ```
- [ ] Validar dashboard muestra datos actualizados
- [ ] Validar badge "Última actualización" funciona
- [ ] Reiniciar PM2 con nuevas variables
  ```bash
  pm2 restart stratoscore-agent --update-env
  ```
- [ ] Activar cron job automático
- [ ] Monitorear logs las primeras 2 semanas
  ```bash
  pm2 logs stratoscore-agent --lines 100 | grep videndum
  ```

---

## 📈 Indicador de Última Actualización en Dashboard

Agregar badge en el dashboard para mostrar cuándo fue la última sincronización:

```tsx
// business-os/src/features/videndum/components/LastSyncBadge.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LastSyncBadge() {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [recordCount, setRecordCount] = useState<number>(0)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('sync_metadata')
      .select('last_sync_at, records_synced')
      .eq('source', 'videndum_excel')
      .single()
      .then(({ data }) => {
        if (data) {
          setLastSync(new Date(data.last_sync_at))
          setRecordCount(data.records_synced)
        }
      })
  }, [])

  if (!lastSync) return null

  const hoursAgo = Math.floor((Date.now() - lastSync.getTime()) / 1000 / 60 / 60)
  const color = hoursAgo < 24 ? 'text-emerald-400' : hoursAgo < 48 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-3 text-xs text-vid-muted">
      <div className={`flex items-center gap-1.5 ${color}`}>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span>Última actualización: hace {hoursAgo}h</span>
      </div>
      <span className="text-vid-subtle">
        {recordCount.toLocaleString()} registros sincronizados
      </span>
    </div>
  )
}
```

**Uso en el dashboard:**

```tsx
// business-os/src/app/(main)/videndum/page.tsx
import { LastSyncBadge } from '@/features/videndum/components/LastSyncBadge'

export default function VidendumPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Videndum Dashboard</h1>
        <LastSyncBadge />
      </div>
      {/* resto del dashboard */}
    </div>
  )
}
```

---

## 🚨 Manejo de Errores y Notificaciones

```typescript
// agent-server/src/agents/videndum-excel-sync.ts

export async function syncVidendumExcelWithRetry() {
  const MAX_RETRIES = 3
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      const result = await syncVidendumExcel()

      // Notificar éxito
      await notifyTelegram(`
✅ Videndum Excel Sync Exitoso

📊 Registros sincronizados: ${result.recordCount}
⏰ Timestamp: ${new Date().toLocaleString('es-CR')}
📈 Total revenue 2024: ${result.totalRevenue2024.toLocaleString()}
🔄 Intento: ${attempt + 1}/${MAX_RETRIES}
      `)

      return result

    } catch (err) {
      attempt++
      console.error(`❌ Sync failed (attempt ${attempt}/${MAX_RETRIES}):`, err)

      if (attempt === MAX_RETRIES) {
        // Notificar fallo final
        await notifyTelegram(`
⚠️ ERROR CRÍTICO en Videndum Excel Sync

❌ Error: ${err.message}
📍 Ubicación: agent-server/videndum-excel-sync
⏰ ${new Date().toLocaleString('es-CR')}
🔄 Intentos agotados: ${MAX_RETRIES}

🔧 Acciones:
1. Revisar logs: pm2 logs stratoscore-agent
2. Verificar acceso al Excel
3. Validar credenciales (Azure/SFTP)
4. Contactar a Videndum IT si persiste

Próximo intento programado: mañana 9:00 AM
        `)
        throw err
      }

      // Esperar antes de reintentar (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000 * 60 // 2min, 4min, 8min
      console.log(`⏳ Waiting ${waitTime / 1000 / 60} minutes before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
}
```

---

## 💰 Costos

| Componente | Costo |
|---|---|
| Microsoft Graph API | **Gratis** (incluido en M365) |
| OneDrive storage | **Gratis** (5GB incluidos) |
| SFTP server (si aplicable) | **Variable** (depende de proveedor) |
| npm package `xlsx` | **Gratis** (MIT license) |
| Supabase storage | **Gratis** (hasta 1GB en Free tier) |
| Agent Server compute | **Ya existe** (0 costo adicional) |
| Desarrollo (5-6 días) | **Interno** |
| **TOTAL** | **$0 USD/mes** 💰 |

---

## ⏱️ Estimación de Tiempos

| Fase | Tiempo | Responsable | Dependencia |
|---|---|---|---|
| Configuración de acceso | 1-2 horas | **Carlos** | Permisos de Videndum IT |
| Desarrollo del sync agent | 3 días | StratosCore | Estructura del Excel confirmada |
| Testing y validación | 2 días | StratosCore | - |
| Deploy a producción | 0.5 días | StratosCore | - |
| **TOTAL** | **5-6 días** | - | **Acceso al Excel** |

---

## 🎯 Resultado Final

**Flujo automatizado:**

```
8:00 AM → Videndum actualiza Excel en SharePoint/SFTP
9:00 AM → Agent Server ejecuta cron job
9:01 AM → Descarga Excel desde ubicación configurada
9:02 AM → Parse XLSX → Transforma → Valida schema
9:03 AM → Upsert a Supabase (18,453 registros en batches de 500)
9:05 AM → Dashboard muestra datos actualizados automáticamente
9:06 AM → Telegram notifica: "✅ Videndum sync: 18,453 registros actualizados"
```

**Latencia:**
- **Target:** T-1 (< 24 horas)
- **Óptimo:** 1 hora (8:00 AM → 9:05 AM mismo día)
- **Máximo:** 25 horas (si hay falla, reintento al día siguiente)

**Confiabilidad:**
- Retry automático con exponential backoff (3 intentos)
- Notificaciones Telegram en success y error
- Logging detallado en PM2
- Badge visual en dashboard de última sincronización

---

## 🚀 Próximos Pasos Inmediatos

### **[CARLOS - ACCIÓN REQUERIDA]**

Necesito que me proveas **la siguiente información** para empezar el desarrollo:

1. **Ubicación del Excel:**
   - [ ] ¿OneDrive/SharePoint? → Proveer URL completa
   - [ ] ¿SFTP/FTP? → Proveer host, user, password, ruta
   - [ ] ¿Carpeta compartida? → Proveer ruta de red
   - [ ] ¿Otro? → Especificar

2. **Estructura del Excel:**
   - [ ] Enviar screenshot de primeras 5 filas de cada hoja
   - [ ] O enviar Excel de ejemplo (datos dummy OK)
   - [ ] Confirmar nombres de hojas: Revenue, Order Intake, etc.
   - [ ] Confirmar nombres de columnas (case-sensitive)

3. **Frecuencia de actualización:**
   - [ ] ¿Videndum actualiza el Excel diariamente? ¿A qué hora?
   - [ ] ¿Semanalmente? ¿Qué día y hora?

4. **Credenciales de acceso:**
   - [ ] Si OneDrive/SharePoint: crear Service Principal + proveer tenant ID, client ID, secret
   - [ ] Si SFTP: crear usuario read-only + proveer host, user, password
   - [ ] Si carpeta: proveer user/password de red

Una vez que tenga esta información, **inicio el desarrollo inmediatamente** (estimado: 5-6 días hasta producción).

---

## 📚 Referencias

- [Microsoft Graph API - Files](https://learn.microsoft.com/en-us/graph/api/driveitem-get)
- [npm package: xlsx](https://www.npmjs.com/package/xlsx)
- [npm package: @microsoft/microsoft-graph-client](https://www.npmjs.com/package/@microsoft/microsoft-graph-client)
- [npm package: ssh2-sftp-client](https://www.npmjs.com/package/ssh2-sftp-client)
- [node-cron documentation](https://www.npmjs.com/package/node-cron)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
