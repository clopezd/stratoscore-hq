# MedCare WhatsApp Bot — Flujo de Agendamiento

**Objetivo:** Bot conversacional que agenda mamografías y ultrasonidos por WhatsApp (8368-2100).
**Motor:** Claude SDK (via Agent Server) + HuliConnector
**Disponibilidad:** 24/7 respuesta automática, < 2 minutos

---

## Flujo Principal

```
Paciente escribe
    │
    ▼
[1. SALUDO + IDENTIFICACIÓN]
    "¡Hola! Soy el asistente de MedCare Centro Médico.
     ¿En qué puedo ayudarte?"
    │
    ├── Quiere agendar estudio ────────────▶ [2. TIPO DE ESTUDIO]
    ├── Pregunta por precios ──────────────▶ [PRECIOS]
    ├── Quiere cancelar/reagendar ─────────▶ [REAGENDAR]
    ├── Tiene urgencia/síntoma ────────────▶ [URGENCIA]
    └── Otra consulta ─────────────────────▶ [DERIVAR A HUMANO]

[2. TIPO DE ESTUDIO]
    "¿Qué estudio necesitas?
     1️⃣ Mamografía
     2️⃣ Ultrasonido
     3️⃣ No estoy segura"
    │
    ├── Mamografía ──▶ [3. SCREENING vs DIAGNÓSTICA]
    ├── Ultrasonido ──▶ [3B. TIPO DE US]
    └── No segura ───▶ "¿Tu médico te ordenó algún estudio?
                         Si no, te recomiendo una mamografía
                         de screening si tienes 40+ años"

[3. SCREENING vs DIAGNÓSTICA]
    "¿Tu médico te ordenó esta mamografía o
     es tu chequeo anual de prevención?"
    │
    ├── Chequeo anual ──▶ "Mamografía de Screening" → [4. DATOS]
    └── Orden médica ──▶ "Mamografía Diagnóstica" → [4. DATOS]

[3B. TIPO DE ULTRASONIDO]
    "¿Qué tipo de ultrasonido necesitas?
     1️⃣ Mamario
     2️⃣ Abdominal
     3️⃣ Pélvico
     4️⃣ Tiroideo
     5️⃣ Renal
     6️⃣ Musculoesquelético
     7️⃣ No sé — mi médico me lo indicó"

[4. DATOS PERSONALES]
    "Perfecto. Necesito algunos datos:
     - Nombre completo
     - Número de cédula (opcional)
     - Email (para enviarte la confirmación)"
    │
    ▼
[5. FECHA Y HORARIO]
    "¿Cuándo te gustaría la cita?"
    │
    ├── [Con Huli conectado]:
    │   → Consultar disponibilidad real de Huli
    │   → "Tenemos disponible:
    │      📅 Lunes 14 abril — 9:00am, 10:30am, 2:00pm
    │      📅 Martes 15 abril — 8:00am, 11:00am, 3:30pm
    │      ¿Cuál prefieres?"
    │
    └── [Sin Huli]:
        → "¿Qué fecha te conviene?
           Horario: L-V 8am-8pm, Sáb 8am-7pm"
        → Guardar como lead → staff confirma manualmente

[6. CONFIRMACIÓN]
    "✅ ¡Tu cita está agendada!

     📋 Estudio: Mamografía de Screening
     📅 Fecha: Lunes 14 abril, 9:00am
     📍 MedCare Centro Médico
        50m norte esquina NE Edificio Centro Colón
     📞 4070-0330

     ⚠️ Preparación:
     - No uses desodorante ni talco el día de la cita
     - Usa ropa cómoda de dos piezas

     Te enviaremos un recordatorio 24 horas antes.
     ¿Tienes alguna pregunta?"

[7. RECORDATORIOS] (automáticos vía cron)
    │
    ├── 24h antes:
    │   "Hola [nombre], te recordamos tu cita mañana:
    │    📋 Mamografía de Screening
    │    📅 Mañana [fecha] a las [hora]
    │    📍 MedCare Centro Médico
    │    ¿Confirmas que asistirás? Responde SÍ o NO"
    │
    └── 2h antes:
        "Tu cita en MedCare es en 2 horas.
         📍 50m norte esquina NE Edificio Centro Colón
         Te esperamos 🏥"
```

---

## Flujos Secundarios

### PRECIOS
```
"Los precios de nuestros estudios son:
 • Mamografía de screening: ₡XX,XXX
 • Mamografía diagnóstica: ₡XX,XXX
 • Ultrasonido: desde ₡XX,XXX

 Aceptamos seguros médicos. ¿Quieres verificar
 tu cobertura o agendar directamente?"
```
> PENDIENTE: Confirmar precios con MedCare

### URGENCIA
```
Si la paciente menciona: bulto, masa, dolor, sangrado, secreción

→ "Entiendo tu preocupación. Si tienes un síntoma
   que te preocupa, te recomiendo agendar una cita
   lo antes posible. Puedo agendarte para mañana
   o incluso hoy si hay disponibilidad.

   También puedes llamar directamente al 4070-0330
   para atención inmediata."

→ Marcar lead como URGENTE en Supabase
→ Notificar a staff de MedCare inmediatamente
```

### REAGENDAR
```
"¿Tienes una cita que quieres cambiar?
 Dame tu nombre y busco tu cita."

→ [Con Huli]: Buscar en Huli → ofrecer nuevas fechas
→ [Sin Huli]: Registrar solicitud → staff gestiona
```

### RECORDATORIO ANUAL (11 meses después)
```
"¡Hola [nombre]! Han pasado 11 meses desde tu
 última mamografía en MedCare.

 La mamografía anual es tu mejor herramienta de
 prevención. ¿Quieres agendar tu próxima cita?

 1️⃣ Sí, quiero agendar
 2️⃣ Ya me la hice en otro lugar
 3️⃣ Recordarme más tarde"
```

---

## System Prompt del Agente

```
Eres el asistente virtual de MedCare Centro Médico Especializado en Costa Rica.

Tu rol:
- Agendar citas de mamografía y ultrasonido por WhatsApp
- Responder preguntas sobre los estudios
- Ser empático y tranquilizador (muchas pacientes tienen miedo)

Información clave:
- Teléfono: 4070-0330
- WhatsApp: 8368-2100
- Dirección: 50m norte esquina NE Edificio Centro Colón, Merced, San José
- Horario: L-V 8am-8pm, Sáb 8am-7pm
- MedCare tiene +7 años de experiencia, resonancia 1.5T con IA, mamógrafo digital nuevo

Servicios disponibles:
- Mamografía de Screening (20 min) — preventiva, mujeres 40+
- Mamografía Diagnóstica (30 min) — con orden médica
- Ultrasonido Mamario (30 min)
- Ultrasonido Abdominal (30 min) — requiere ayuno 6-8h
- Ultrasonido Pélvico (30 min) — requiere vejiga llena
- Ultrasonido Tiroideo (20 min)
- Ultrasonido Renal (30 min) — requiere ayuno + agua
- Ultrasonido Musculoesquelético (30 min)

Reglas:
- NUNCA dar diagnósticos médicos
- Si mencionan síntomas urgentes (bulto, dolor, sangrado) → prioridad inmediata
- Siempre ser cálido pero profesional
- Responder en español costarricense (vos/usted según la paciente)
- Si no sabes algo, ofrece transferir a una persona del equipo
- Recordar enviar preparación del estudio en la confirmación
```

---

## Implementación Técnica

### Opción A: WhatsApp Business API (recomendada)
- **Proveedor:** Twilio / 360dialog / Meta Cloud API directo
- **Costo:** ~$0.05-0.08 USD por conversación (24h window)
- **Ventaja:** Mensajes template para recordatorios, botones interactivos

### Opción B: WhatsApp via Huli (si lo soporta)
- **Investigar:** Si Huli tiene integración nativa con WhatsApp
- **Ventaja:** Todo en un solo sistema

### Arquitectura
```
WhatsApp API → Webhook → Agent Server → Claude SDK
                                          │
                                          ├── HuliConnector (agendar)
                                          ├── Supabase (guardar lead)
                                          └── WhatsApp API (responder)
```

### Tablas adicionales (cuando se implemente)
```sql
medcare_whatsapp_conversations (
  id, phone, lead_id, state, context_json, last_message_at
)
medcare_reminders (
  id, lead_id, type, scheduled_at, sent_at, status
)
```

---

## Métricas del Bot

| KPI | Meta |
|-----|------|
| Tiempo de respuesta | < 30 segundos |
| Tasa de agendamiento | > 50% de conversaciones |
| Tasa de transferencia a humano | < 20% |
| Satisfacción | 4.5+ / 5 |

---

*Diseñado por StratosCore — 2026-04-07*
