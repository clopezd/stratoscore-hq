#!/bin/bash
# 🧪 Test completo de agentes de WhatsApp
#
# Uso: ./test-completo-whatsapp.sh +50688882224

set -e

TELEFONO="${1:-+50688882224}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Test Completo: Agentes de WhatsApp — Mobility"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Número de prueba: $TELEFONO"
echo ""

# 1. Verificar que el servidor está corriendo
echo "1️⃣  Verificando servidor..."
if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Servidor activo en http://localhost:3000"
else
    echo "   ❌ Servidor NO está corriendo"
    echo "   💡 Ejecuta primero: npm run dev"
    exit 1
fi

# 2. Verificar credenciales de Twilio
echo ""
echo "2️⃣  Verificando Twilio..."
if grep -q "TWILIO_ACCOUNT_SID=ACbc50fa" "$PROJECT_DIR/.env.local"; then
    echo "   ✅ Credenciales de Twilio configuradas"
else
    echo "   ❌ Credenciales de Twilio NO encontradas en .env.local"
    exit 1
fi

# 3. Crear lead de prueba
echo ""
echo "3️⃣  Creando lead de prueba..."
cd "$PROJECT_DIR"
node scripts/crear-lead-test.mjs "$TELEFONO" 2>&1 | grep -E "✅|❌"

# Esperar un segundo para que se guarde en BD
sleep 1

# 4. Ejecutar agente de captación
echo ""
echo "4️⃣  Ejecutando agente de captación..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/mobility/agents \
  -H "Content-Type: application/json" \
  -d '{"agent":"acquisition"}')

# Parsear respuesta
MENSAJES_ENVIADOS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('resultados', {}).get('acquisition', {}).get('mensajes_enviados', 0))" 2>/dev/null || echo "0")
LEADS_NUEVOS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('resultados', {}).get('acquisition', {}).get('leads_nuevos', 0))" 2>/dev/null || echo "0")

echo "   📊 Leads detectados: $LEADS_NUEVOS"
echo "   📤 Mensajes enviados: $MENSAJES_ENVIADOS"

# 5. Verificar resultado
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$MENSAJES_ENVIADOS" -gt 0 ]; then
    echo "✅ ¡ÉXITO! Se envió mensaje de WhatsApp"
    echo ""
    echo "📱 Verifica tu WhatsApp ahora en: $TELEFONO"
    echo ""
    echo "⚠️  Si no llega:"
    echo "   1. Verifica que te uniste al Sandbox de Twilio"
    echo "   2. Envía 'join <keyword>' a +1 415 523 8886"
    echo "   3. Ve a: https://console.twilio.com/us1/monitor/logs/sms"
else
    echo "⚠️  No se enviaron mensajes"
    echo ""
    echo "Posibles causas:"
    echo "   • Lead muy viejo (>5 min) — corre el script de nuevo"
    echo "   • No hay leads en la BD — verifica Supabase"
    echo "   • Error en el agente — revisa logs del servidor"
    echo ""
    echo "🔍 Respuesta completa del agente:"
    echo "$RESPONSE" | python3 -m json.tool
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
