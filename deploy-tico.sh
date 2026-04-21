#!/bin/bash

# =============================================================================
# TICO RESTORATION - Deployment Automático a Vercel
# =============================================================================

set -e

echo "🚀 TICO RESTORATION - Deployment a Vercel"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variables
VERCEL_USER="clopezd"
DOMAIN="stratoscore.app"
SUBDOMAIN="tico"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo -e "${BLUE}📋 Información del Deployment:${NC}"
echo "Usuario Vercel: ${VERCEL_USER}"
echo "Dominio: ${FULL_DOMAIN}"
echo "Proyecto: stratoscore-hq"
echo "Rama: claude/tico-restoration-website-ntNPO"
echo ""

# Step 1: Verificar que estamos en rama correcta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "claude/tico-restoration-website-ntNPO" ]; then
    echo -e "${RED}❌ Estás en rama: $CURRENT_BRANCH${NC}"
    echo "Debes estar en: claude/tico-restoration-website-ntNPO"
    exit 1
fi
echo -e "${GREEN}✓ Rama correcta: $CURRENT_BRANCH${NC}"
echo ""

# Step 2: Verificar que Git está limpio
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️ Hay cambios sin commitear${NC}"
    git status
    exit 1
fi
echo -e "${GREEN}✓ Repositorio limpio${NC}"
echo ""

# Step 3: Hacer login en Vercel
echo -e "${BLUE}🔐 Paso 1: Verificar autenticación Vercel${NC}"
if ! vercel whoami 2>/dev/null; then
    echo -e "${YELLOW}📝 No estás autenticado. Abriendo navegador para login...${NC}"
    vercel login --sso
fi
echo ""

# Step 4: Deployar a Vercel
echo -e "${BLUE}⬆️ Paso 2: Deployar a Vercel${NC}"
vercel deploy --prod --name="tico-restoration" --skip-build-confirmation

echo ""
echo -e "${BLUE}🌐 Paso 3: Configurar dominio${NC}"
echo "Vercel URL asignada: https://tico-restoration.${VERCEL_USER}.vercel.app"
echo ""
echo -e "${YELLOW}⚠️ PRÓXIMOS PASOS (Manual en Vercel Dashboard):${NC}"
echo ""
echo "1️⃣ Ve a: https://vercel.com/dashboard"
echo "2️⃣ Busca proyecto: tico-restoration"
echo "3️⃣ Settings → Domains"
echo "4️⃣ Add Domain: ${FULL_DOMAIN}"
echo "5️⃣ Vercel te dará un CNAME"
echo ""
echo -e "${YELLOW}⚠️ ACTUALIZAR DNS (En tu proveedor):${NC}"
echo ""
echo "Type: CNAME"
echo "Name: ${SUBDOMAIN}"
echo "Value: (CNAME que te da Vercel)"
echo "TTL: 3600"
echo ""
echo -e "${YELLOW}⏱️ Espera ~5-10 minutos para propagación${NC}"
echo ""

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""
echo "Verifica en: https://vercel.com/dashboard"
echo "Pronto en: https://${FULL_DOMAIN}"
echo ""
