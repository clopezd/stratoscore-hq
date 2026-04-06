# 🧪 Cómo Probar Agentes con WhatsApp Business — GUÍA RÁPIDA

**Objetivo:** Ver tus agentes de Mobility respondiendo automáticamente por WhatsApp en menos de 10 minutos.

---

## ✅ Paso 1: Activar Sandbox de Twilio (2 min)

**Desde tu WhatsApp personal:**

1. **Agregar contacto:** `+1 415 523 8886`

2. **Buscar tu keyword:**
   - Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Verás algo como: "To connect your sandbox, send **join shadow-storm** to..."

3. **Enviar mensaje de WhatsApp a +1 415 523 8886:**
   ```
   join shadow-storm
   ```
   (Reemplaza `shadow-storm` con TU keyword)

4. **Esperar confirmación:**
   ```
   ✅ Twilio Sandbox: You are all set!
   ```

**⚠️ IMPORTANTE:** Solo los números que hagan este paso recibirán mensajes.

---

## ✅ Paso 2: Levantar Servidor (1 min)

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os
npm run dev
```

Espera a ver: `✓ Ready in ...`

---

## ✅ Paso 3: Crear Lead de Prueba con TU Número (1 min)

**Opción A — Desde terminal (más rápido):**

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os

# IMPORTANTE: Cambia +50688882224 a TU número
node scripts/crear-lead-test.mjs +50688882224
```

**Opción B — Desde Supabase SQL:**

1. Ve a: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql

2. Ejecuta (cambia el teléfono):
   ```sql
   INSERT INTO leads_mobility (nombre, telefono, diagnostico_preliminar, fuente, estado)
   VALUES (
     'Tu Nombre Test',
     '+50688882224',  -- ← CAMBIA ESTO
     'ACV urgente - necesito rehabilitación Lokomat',
     'web',
     'nuevo'
   );
   ```

---

## ✅ Paso 4: Ejecutar Agente de Captación (1 min)

**Opción A — Desde UI (recomendado):**

1. Ir a: http://localhost:3000/mobility
2. Scroll hasta "🤖 Agentes Inteligentes"
3. Click en el botón de **"Captación y Conversión"** → **"Ejecutar"**
4. Ver resultados en pantalla

**Opción B — Desde terminal:**

```bash
curl -X POST http://localhost:3000/api/mobility/agents \
  -H "Content-Type: application/json" \
  -d '{"agent":"acquisition"}'
```

---

## ✅ Paso 5: Verificar que Llegó el Mensaje (30 seg)

**En tu WhatsApp deberías recibir:**

```
¡Hola Tu Nombre Test! 👋

Gracias por contactar a Mobility Group CR. Recibimos tu solicitud
y entendemos la urgencia de tu situación.

🏥 Somos especialistas en rehabilitación neurológica con
tecnología Lokomat de última generación.

Queremos ayudarte lo antes posible:
✅ Evaluación médica SIN COSTO
✅ Disponibilidad ESTA SEMANA
✅ Equipos de robótica avanzada

¿Cuándo te gustaría venir para tu evaluación?

Responde con tu disponibilidad y te agendamos de inmediato.

📍 Escazú, Oficentro Trilogía
📞 +506 2289-5050
🌐 www.mobility.cr

Tu equipo Mobility 💙
```

**⏱️ Tiempo esperado:** Deberías recibir el mensaje en menos de 10 segundos.

---

## 🔍 Troubleshooting

### ❌ No recibí el mensaje

**1. Verificar que te uniste al Sandbox:**
   - Revisa que recibiste "You are all set!" de Twilio
   - Si no, repite Paso 1

**2. Verificar que el agente detectó el lead:**

   Revisa los logs del servidor (donde corre `npm run dev`):
   ```
   Deberías ver:
   🤖 Ejecutando Agente de Captación y Conversión...
   🆕 1 leads nuevos (respondiendo en <5 min)  ← Debería ser 1, no 0
   📱 Enviando WhatsApp a whatsapp:+50688882224...
   ✅ WhatsApp enviado. SID: SM...
   ```

**3. Si dice "0 leads nuevos":**

   El lead es muy viejo (>5 min). Solución:
   ```bash
   # Borrar y crear uno nuevo
   node scripts/crear-lead-test.mjs +50688882224

   # Ejecutar agente INMEDIATAMENTE
   curl -X POST http://localhost:3000/api/mobility/agents \
     -H "Content-Type: application/json" \
     -d '{"agent":"acquisition"}'
   ```

**4. Verificar en dashboard de Twilio:**

   - Ve a: https://console.twilio.com/us1/monitor/logs/sms
   - Busca tu número
   - Verás el estado: `delivered`, `queued`, o `failed`
   - Si dice `failed`, haz click en "Troubleshoot" para ver el error

**5. Verificar credenciales de Twilio:**
   ```bash
   cat business-os/.env.local | grep TWILIO
   ```

   Debe mostrar:
   ```
   TWILIO_ACCOUNT_SID=ACbc50fa...
   TWILIO_AUTH_TOKEN=341bc640...
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

---

## 🎯 Probar los Otros 2 Agentes

### 💎 Agente de Retención (pacientes próximos a vencer)

**1. Crear paciente de prueba con TU número:**

```sql
-- En Supabase SQL Editor
INSERT INTO pacientes (
  nombre,
  telefono,
  diagnostico,
  plan_sesiones,
  sesiones_completadas,
  sesiones_restantes
)
VALUES (
  'Tu Nombre Test',
  '+50688882224',  -- ← CAMBIA ESTO
  'Rehabilitación post-ACV',
  20,
  18,
  2  -- Solo 2 sesiones restantes → alta prioridad
);
```

**2. Ejecutar agente:**

```bash
curl -X POST http://localhost:3000/api/mobility/agents \
  -H "Content-Type: application/json" \
  -d '{"agent":"retention"}'
```

**3. Deberías recibir:**

```
Hola Tu Nombre Test,

Te quedan solo 2 sesiones de tu plan actual en Mobility Group CR.

¿Has visto mejoras en tu rehabilitación? 💪

Para asegurar resultados duraderos, recomendamos continuar con
un plan de mantenimiento.

🎁 OFERTA ESPECIAL: 15% descuento por renovación antes de
finalizar tu plan actual.

¿Quieres que tu médico referente te evalúe y recomiende el
siguiente paso?

Responde SÍ para agendar tu evaluación gratuita.
```

---

### 📊 Agente de Optimización (slots vacíos)

Este agente NO envía mensajes, solo genera reportes y campañas sugeridas.

```bash
curl -X POST http://localhost:3000/api/mobility/agents \
  -H "Content-Type: application/json" \
  -d '{"agent":"optimization"}'
```

Verás en el JSON de respuesta:
- Ocupación actual vs objetivo (30% → 80%)
- Slots vacíos por horario
- Campañas promocionales generadas automáticamente

---

## 🚀 Automatizar los Agentes (Paso Siguiente)

Una vez que funcione manualmente, puedes automatizar con cron jobs.

**Ejemplo con PM2:**

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'agente-captacion',
      script: 'curl',
      args: '-X POST http://localhost:3000/api/mobility/agents -d \'{"agent":"acquisition"}\'',
      cron_restart: '*/5 * * * *', // Cada 5 minutos
      autorestart: false
    },
    {
      name: 'agente-retencion',
      script: 'curl',
      args: '-X POST http://localhost:3000/api/mobility/agents -d \'{"agent":"retention"}\'',
      cron_restart: '0 9 * * *', // Diario a las 9 AM
      autorestart: false
    }
  ]
}
```

O con **Vercel Cron** (para producción):

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/mobility/agents?agent=acquisition",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/mobility/agents?agent=retention",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 📊 Métricas Esperadas

Con agentes corriendo automáticamente cada 5 min (captación) y diario (retención):

| Métrica | Antes | Con Agentes |
|---------|-------|-------------|
| Respuesta a leads | 24h | **<5 min** |
| Conversión leads | 30% | **70%** |
| Retención pacientes | 40% | **90%** |
| Mensajes/mes | 0 | **~300** |
| Revenue adicional/mes | — | **~₡5.7M** |

---

## ✅ Checklist de Éxito

- [ ] Me uní al Sandbox de Twilio (recibí confirmación)
- [ ] Servidor corriendo en `http://localhost:3000`
- [ ] Creé lead con MI número de teléfono
- [ ] Ejecuté agente de captación
- [ ] **RECIBÍ mensaje de WhatsApp** ← ¡EL OBJETIVO!
- [ ] Probé agente de retención (opcional)
- [ ] Revisé dashboard de Twilio y vi `delivered`

---

## 🎉 Siguiente Nivel: WhatsApp Business API (Producción)

El Sandbox es perfecto para testing, pero tiene limitaciones:

**Sandbox (actual):**
- ✅ Gratis
- ❌ Requiere que cada número se una primero
- ❌ Solo para testing

**WhatsApp Business API (upgrade):**
- ✅ Enviar a cualquier número SIN activación previa
- ✅ Usar tu propio número de empresa
- ✅ Sin límites de mensajes
- ❌ Costo: ~$1000 USD setup + mensajes
- ❌ Proceso de aprobación: 5-7 días

Para producción real con pacientes de Mobility, eventualmente necesitarás upgradearte.

---

**¿Problemas?** Revisa la sección Troubleshooting arriba o verifica los logs en:
- Servidor: `npm run dev` (terminal donde lo ejecutas)
- Twilio: https://console.twilio.com/us1/monitor/logs/sms

**¡Éxito!** Si recibiste el mensaje de WhatsApp, tus agentes están funcionando 🎉
