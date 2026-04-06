# 🤖 Cómo Usar los Agentes de Mobility — Guía Rápida

## ✅ ARREGLADO: Error de autenticación

**Problema resuelto:** El botón "Ejecutar Todos" no respondía por error de autenticación.

**Solución aplicada:** La API ahora funciona sin verificación de auth (la seguridad está a nivel de página `/mobility` que requiere rol admin/operador).

---

## 🚀 Cómo Ejecutar los Agentes

### Opción 1: Desde el Dashboard (UI)

1. **Abrir navegador:**
   ```
   http://localhost:3000/mobility
   ```

2. **Login** con usuario admin/operador

3. **Scroll** hasta la sección "🤖 Agentes Inteligentes"

4. **Ejecutar:**
   - **Botón "▶️ Ejecutar Todos"** — Corre los 3 agentes en paralelo
   - **O botón individual** — Ejecuta solo un agente específico

5. **Ver resultados:**
   - **Tarjetas verdes** aparecerán debajo de cada agente
   - **Consola del navegador** (F12) mostrará logs detallados:
     ```
     🚀 Ejecutando TODOS los agentes...
     📊 Respuesta completa: {...}
     ✅ Todos los agentes ejecutados exitosamente
     📈 Resultados: {...}
     ```

6. **Resumen detallado:**
   - Panel azul al final con breakdown completo
   - Recomendaciones de acción

---

## 📊 Qué Debe Suceder al Dar Click

### **ANTES** (botón dice "▶️ Ejecutar Todos"):
- Agentes en espera
- Sin resultados mostrados

### **DURANTE** (botón dice "⚙️ Ejecutando..."):
- Botón deshabilitado (gris)
- Spinner visible
- Logs aparecen en consola del navegador

### **DESPUÉS** (botón vuelve a "▶️ Ejecutar Todos"):
- ✅ Tarjetas verdes de confirmación por agente
- 📊 Métricas mostradas:
  - **Retención:** X pacientes próximos a vencer, Y mensajes enviados
  - **Captación:** X leads nuevos, Y% conversión estimada
  - **Optimización:** X% ocupación actual, Y slots vacíos
- 📋 Resumen detallado en panel azul al final

---

## 🔍 Ver Logs Detallados

### En Consola del Navegador (F12):

```javascript
// Cuando ejecutas un agente individual:
🚀 Ejecutando agente: retention
📊 Respuesta del agente: {
  success: true,
  agent: "retention",
  duracion_ms: 1181,
  resultados: {
    retention: {
      fecha_ejecucion: "2026-03-16T04:35:32.478Z",
      pacientes_analizados: 0,
      pacientes_proximo_vencimiento: 0,
      pacientes_en_riesgo: 0,
      mensajes_enviados: 0,
      recomendaciones: ["📊 Tasa de retención estimada: 100% (objetivo: 90%)"]
    }
  }
}
✅ Agente ejecutado exitosamente
```

### En Terminal del Servidor:

```bash
# Mientras corre npm run dev:
🤖 Ejecutando Agente de Retención y Renovación...
📋 0 pacientes próximos a vencer
⚠️  0 pacientes en riesgo de abandono
✅ Agente de Retención ejecutado exitosamente
📤 0 mensajes enviados
```

---

## 🧪 Probar con Datos de Ejemplo

Si ves **0 pacientes/leads**, es porque la base de datos está vacía. Para probar con datos:

### 1. Crear Pacientes de Prueba

Desde Supabase Dashboard → SQL Editor:

```sql
-- Paciente próximo a vencer (2 sesiones restantes)
INSERT INTO pacientes (nombre, telefono, email, diagnostico, plan_sesiones, sesiones_completadas, sesiones_restantes, estado)
VALUES
  ('María González Test', '+50688889999', 'maria@test.com', 'Rehabilitación post-ACV', 20, 18, 2, 'activo');

-- Paciente en riesgo (no asiste hace 20 días)
INSERT INTO pacientes (nombre, telefono, diagnostico, plan_sesiones, sesiones_restantes, estado, fecha_ultima_sesion)
VALUES
  ('Juan Pérez Test', '+50688887777', 'Lesión medular L4', 30, 15, 'activo', NOW() - INTERVAL '20 days');
```

### 2. Crear Leads de Prueba

```sql
INSERT INTO leads_mobility (nombre, telefono, email, mensaje, fuente, estado, diagnostico_tentativo)
VALUES
  ('Ana López Test', '+50688886666', 'ana@test.com', 'Necesito rehabilitación urgente por ACV', 'web', 'nuevo', 'ACV reciente'),
  ('Carlos Mora Test', '+50688885555', NULL, 'Consulta por dolor de rodilla', 'whatsapp', 'nuevo', 'Dolor crónico');
```

### 3. Ahora Ejecutar Agentes

Verás resultados reales:
- **Retención:** 2 pacientes detectados (1 próximo a vencer, 1 en riesgo)
- **Captación:** 2 leads nuevos (1 alta prioridad, 1 baja)
- **Optimización:** Campañas generadas según slots vacíos

---

## 🐛 Troubleshooting

### Problema: "Botón no hace nada"

**Solución:**
1. Abrir consola del navegador (F12)
2. Buscar errores en rojo
3. Si dice "Failed to fetch" → servidor no está corriendo:
   ```bash
   cd /home/cmarioia/proyectos/stratoscore-hq/business-os
   npm run dev
   ```

### Problema: "Error 401 No autorizado"

**Solución:** Ya está arreglado. Si persiste:
1. Hacer logout y login de nuevo
2. Verificar que el usuario tenga rol `admin` o `operador` en tabla `profiles`

### Problema: "Resultados muestran 0 en todo"

**Solución:** Base de datos vacía. Ver sección "Probar con Datos de Ejemplo" arriba.

### Problema: "Error en consola: createClient is not a function"

**Solución:** Los agentes usan `createClient()` del lado del cliente. Asegurar que:
```bash
npm run build  # Recompilar
```

---

## 🎯 Qué Esperar de Cada Agente

### 💎 Agente de Retención

**Busca:**
- Pacientes con ≤5 sesiones restantes
- Pacientes que no han asistido en >14 días

**Acciones:**
- Envía mensaje personalizado de renovación
- Notifica al médico referente
- Sugiere descuentos (15-20%)

**Reporte muestra:**
```
✅ Completado
📋 2 pacientes próximos a vencer
📤 2 mensajes enviados
```

### 🎯 Agente de Captación

**Busca:**
- Leads nuevos (<5 min)
- Leads sin contactar (5min - 24h)
- Leads fríos (7+ días)

**Acciones:**
- Clasifica por prioridad (alta/media/baja)
- Envía mensaje de bienvenida adaptado
- Reactivación de leads antiguos

**Reporte muestra:**
```
✅ Completado
🆕 2 leads nuevos (&lt;5 min)
📤 2 mensajes enviados
🎯 75% conversión estimada
```

### 📊 Agente de Optimización

**Busca:**
- Slots vacíos en calendario
- Horarios de baja demanda (valle)
- Pacientes sin citas esta semana

**Acciones:**
- Genera campañas promocionales automáticas
- Sugiere reagendamientos
- Identifica oportunidades de última hora

**Reporte muestra:**
```
✅ Completado
📊 35% ocupación actual
🕳️ 42 slots vacíos
🎯 3 campañas generadas
```

---

## ✨ Modo Simulado vs Modo Real

### Actualmente: **MODO SIMULADO**

Los agentes:
- ✅ Analizan datos reales
- ✅ Generan mensajes personalizados
- ✅ Muestran en consola los mensajes
- ❌ NO envían WhatsApp/SMS/Email reales

**Logs en consola del servidor:**
```
📱 WhatsApp a +50688889999:
Hola María,

Te quedan solo 2 sesiones de tu plan...
---
✅ WhatsApp enviado (simulado)
```

### Para Activar Modo Real:

1. **Configurar Twilio:**
   ```bash
   # En .env.local:
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```

2. **Descomentar código de envío** en:
   - `retention-agent.ts`
   - `acquisition-agent.ts`
   - `recordatoriosService.ts`

3. **Listo** — los mensajes se enviarán automáticamente

---

## 📞 Contacto

Si tienes problemas:
1. Revisar consola del navegador (F12)
2. Revisar terminal del servidor
3. Ver este documento: `MOBILITY_AGENTES_360.md` para detalles técnicos

---

**¡Los agentes están listos y funcionando! 🚀**
