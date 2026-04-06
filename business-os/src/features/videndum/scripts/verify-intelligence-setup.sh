#!/bin/bash
# verify-intelligence-setup.sh
# Script de verificación para Videndum Intelligence System

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║    VIDENDUM INTELLIGENCE — VERIFICACIÓN DE SETUP             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project paths
BUSINESS_OS="/home/cmarioia/proyectos/stratoscore-hq/business-os"
SQL_FILE="$BUSINESS_OS/supabase/migrations/008_EJECUTAR_PRIMERO.sql"

# 1. Verificar archivo SQL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Verificando archivo SQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "$SQL_FILE" ]; then
    SIZE=$(du -h "$SQL_FILE" | cut -f1)
    echo -e "   ${GREEN}✅ 008_EJECUTAR_PRIMERO.sql existe${NC} (${SIZE})"
else
    echo -e "   ${RED}❌ 008_EJECUTAR_PRIMERO.sql NO encontrado${NC}"
fi

echo ""

# 2. Verificar Forecasting Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Verificando Forecasting Agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AGENT_PATH="/home/cmarioia/proyectos/stratoscore-hq/agent-server/src/agents/videndum-forecasting-agent.ts"
if [ -f "$AGENT_PATH" ]; then
    LINES=$(wc -l < "$AGENT_PATH")
    echo -e "   ${GREEN}✅ videndum-forecasting-agent.ts existe${NC} (${LINES} líneas)"
else
    echo -e "   ${RED}❌ videndum-forecasting-agent.ts NO encontrado${NC}"
fi

echo ""

# 3. Verificar Dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Verificando Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AGENT_DIR="/home/cmarioia/proyectos/stratoscore-hq/agent-server"
cd "$AGENT_DIR"

if npm list @anthropic-ai/sdk 2>/dev/null | grep -q "@anthropic-ai/sdk"; then
    VERSION=$(npm list @anthropic-ai/sdk 2>/dev/null | grep "@anthropic-ai/sdk" | awk '{print $NF}')
    echo -e "   ${GREEN}✅ @anthropic-ai/sdk instalado${NC} (${VERSION})"
else
    echo -e "   ${RED}❌ @anthropic-ai/sdk NO instalado${NC}"
fi

if npm list @supabase/supabase-js 2>/dev/null | grep -q "@supabase/supabase-js"; then
    VERSION=$(npm list @supabase/supabase-js 2>/dev/null | grep "@supabase/supabase-js" | awk '{print $NF}')
    echo -e "   ${GREEN}✅ @supabase/supabase-js instalado${NC} (${VERSION})"
else
    echo -e "   ${RED}❌ @supabase/supabase-js NO instalado${NC}"
fi

echo ""

# 4. Verificar Variables de Entorno
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Verificando Variables de Entorno..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENV_FILE="$AGENT_DIR/.env"

if grep -q "^SUPABASE_URL=" "$ENV_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ SUPABASE_URL configurada${NC}"
else
    echo -e "   ${RED}❌ SUPABASE_URL NO configurada${NC}"
fi

if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configurada${NC}"
else
    echo -e "   ${RED}❌ SUPABASE_SERVICE_ROLE_KEY NO configurada${NC}"
fi

if grep -q "^ANTHROPIC_API_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ ANTHROPIC_API_KEY configurada${NC}"
else
    echo -e "   ${YELLOW}⚠️  ANTHROPIC_API_KEY NO configurada${NC} (requerida para funcionar)"
fi

echo ""

# 5. Verificar Documentación
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Verificando Documentación..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$BUSINESS_OS"

DOCS=(
    "docs/intelligence/README.md"
    "docs/intelligence/QUICK_START_VIDENDUM_INTELLIGENCE.md"
    "docs/intelligence/VIDENDUM_INTELLIGENCE_READY.md"
    "docs/intelligence/VIDENDUM_INTELLIGENCE_SETUP.md"
    "docs/intelligence/VIDENDUM_INTELLIGENCE_SYSTEM.md"
    "docs/intelligence/VIDENDUM_COMPETIDORES_DIRECTOS.md"
    "docs/intelligence/VIDENDUM_PLAN_REALTIME_DATACUBE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "   ${GREEN}✅${NC} $doc"
    else
        echo -e "   ${RED}❌${NC} $doc NO encontrado"
    fi
done

echo ""

# 6. Resumen y Next Steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMEN Y PRÓXIMOS PASOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Anthropic key is configured
if ! grep -q "^ANTHROPIC_API_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo -e "${YELLOW}"
    echo "⚠️  ACCIÓN REQUERIDA:"
    echo ""
    echo "1. Obtener Anthropic API Key:"
    echo "   https://console.anthropic.com/settings/keys"
    echo ""
    echo "2. Agregar a $ENV_FILE:"
    echo "   echo 'ANTHROPIC_API_KEY=sk-ant-api03-...' >> $ENV_FILE"
    echo ""
    echo "3. Reiniciar agent-server:"
    echo "   pm2 restart stratoscore-agent --update-env"
    echo -e "${NC}"
else
    echo -e "${GREEN}"
    echo "✅ Variables de entorno configuradas correctamente"
    echo ""
    echo "Siguiente paso:"
    echo "   cd $AGENT_DIR"
    echo "   npx tsx src/agents/videndum-forecasting-agent.ts"
    echo -e "${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Ver instrucciones completas:"
echo "   cat business-os/docs/intelligence/README.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
