#!/bin/bash

# =============================================================================
# TICO RESTORATION - Setup Automático
# Este script descarga imágenes y configura la página web
# =============================================================================

echo "🚀 TICO RESTORATION - Setup Automático"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Crear carpetas
echo -e "${BLUE}📁 Paso 1: Creando estructura de carpetas${NC}"
mkdir -p tico_instagram
mkdir -p tico_instagram/images
echo -e "${GREEN}✓ Carpetas creadas${NC}\n"

# Step 2: Descargar script de descarga
echo -e "${BLUE}⬇️ Paso 2: Preparando script de descarga${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js detectado${NC}"
    echo -e "${YELLOW}📝 Ejecutando script de descarga...${NC}\n"
    node scripts/instagram_downloader.js ticorestorations
else
    echo -e "${YELLOW}⚠️  Node.js no instalado${NC}"
    echo "   Instalando Node.js..."

    if command -v brew &> /dev/null; then
        brew install node
    elif command -v apt &> /dev/null; then
        sudo apt-get install nodejs npm
    else
        echo "❌ Por favor instala Node.js manualmente desde https://nodejs.org/"
        exit 1
    fi

    node scripts/instagram_downloader.js ticorestorations
fi

echo ""
echo -e "${BLUE}Step 3: Configurar página web${NC}"

# Step 3: Crear archivo HTML de inicio
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TICO RESTORATION - Selecciona Página</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #003366, #001f4d);
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            font-family: 'Playfair Display', serif;
        }
        .button-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
        }
        a {
            display: inline-block;
            padding: 15px 30px;
            background: #FF6B35;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            transition: all 0.3s;
            text-transform: uppercase;
        }
        a:hover {
            background: #ff5517;
            transform: translateY(-2px);
        }
        .subtitle {
            margin-bottom: 3rem;
            opacity: 0.9;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>TICO RESTORATION</h1>
        <p class="subtitle">Selecciona la versión de la página web</p>
        <div class="button-group">
            <a href="docs/tico-restoration-prp.html">Ver PRP Ejecutivo</a>
            <a href="docs/tico-restoration-dynamic.html">Ver Portfolio</a>
        </div>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}✓ Página de inicio creada: index.html${NC}\n"

# Step 4: Instrucciones finales
echo ""
echo -e "${BLUE}======================================"
echo "✅ SETUP COMPLETADO"
echo "======================================${NC}\n"

echo -e "${YELLOW}📌 PRÓXIMOS PASOS:${NC}\n"

echo "1️⃣  DESCARGAR IMÁGENES (Elige 1 método):"
echo "   "
echo "   A) Manual - Más seguro:"
echo "      • Abre: https://www.instagram.com/ticorestorations/"
echo "      • Descarga cada imagen (clic derecho)"
echo "      • Guarda en: ./tico_instagram/images/"
echo ""
echo "   B) 4K Video Downloader - Automático:"
echo "      • Descarga: https://www.4kdownload.com/"
echo "      • Copia URL del perfil"
echo "      • Selecciona máxima calidad"
echo "      • Guarda en: ./tico_instagram/images/"
echo ""

echo "2️⃣  VER PÁGINAS:"
echo "   • Abre en navegador:"
echo "     - file://$(pwd)/index.html"
echo "   • O usa servidor local:"
echo "     - python3 -m http.server 8000"
echo "     - Luego: http://localhost:8000"
echo ""

echo "3️⃣  ACTUALIZAR METADATA:"
echo "   • Edita: ./tico_instagram/projects.json"
echo "   • Agrega títulos, descripciones, categorías"
echo ""

echo "4️⃣  PERSONALIZAR HTML:"
echo "   • Edita: docs/tico-restoration-dynamic.html"
echo "   • Cambia colores, textos, información de contacto"
echo ""

echo -e "${GREEN}📚 Documentación:${NC}"
echo "   • Guía completa: docs/COMO-DESCARGAR-INSTAGRAM.md"
echo "   • PRP: docs/PRP-TICO-RESTORATION-WEBSITE.md"
echo ""

echo -e "${YELLOW}💡 Comando rápido para servir localmente:${NC}"
echo "   python3 -m http.server 8000"
echo ""

echo -e "${GREEN}¡Listo! 🚀${NC}"
echo ""
