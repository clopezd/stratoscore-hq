#!/bin/bash

# ============================================================================
# VIDENDUM ML FORECAST — Script de Ejecución
# ============================================================================

set -e

echo "🚀 Videndum ML Forecast Engine — MVP"
echo ""

# Verificar que existe .env.local
if [ ! -f "../.env.local" ]; then
  echo "❌ Error: No se encontró .env.local en business-os/"
  echo "   Crea el archivo con DATABASE_URL=..."
  exit 1
fi

# Cargar variables de entorno
set -a
source ../.env.local
set +a

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL no configurada en .env.local"
  exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Error: Python 3 no instalado"
  exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "venv" ]; then
  echo "📦 Creando virtual environment..."
  python3 -m venv venv
fi

echo "📦 Activando venv e instalando dependencias..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "✓ Dependencias instaladas"
echo ""

# Ejecutar forecast
if [ -z "$1" ]; then
  # Modo batch (Top 20 SKUs)
  echo "🎯 Ejecutando forecast para Top 20 SKUs (batch mode)..."
  echo "   Esto puede tomar 2-5 minutos..."
  echo ""
  python3 forecast_engine.py
else
  # Modo single SKU
  SKU=$1
  WEEKS=${2:-4}
  echo "🎯 Ejecutando forecast para SKU: $SKU ($WEEKS semanas)..."
  echo ""
  python3 forecast_engine.py "$SKU" "$WEEKS"
fi

echo ""
echo "✅ Forecast completado. Revisa la tabla ml_forecast_predictions en Supabase."
echo ""
