#!/bin/bash
# StratosCore — Project Metrics Generator
# Ejecutar desde business-os/

echo "=== STRATOSCORE PROJECT METRICS ==="
echo "Generated: $(date)"
echo ""

echo "--- General ---"
echo "First commit: $(git log --reverse --date=format:'%Y-%m-%d' --format='%ad' | head -1)"
echo "Total commits: $(git rev-list --count HEAD)"
echo "Total LOC: $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')"
echo "Migrations: $(ls supabase/migrations/ 2>/dev/null | wc -l)"
echo ""

echo "--- LOC por modulo ---"
for m in videndum mobility bidhunter medcare finances; do
  loc=$(find src/features/$m -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  echo "$m: ${loc:-0}"
done
echo ""

echo "--- Endpoints por modulo ---"
for m in videndum mobility bidhunter medcare finance; do
  count=$(find src/app/api/$m -name "route.ts" 2>/dev/null | wc -l)
  echo "$m: $count"
done
echo ""

echo "--- Commits por mes ---"
git log --date=format:'%Y-%m' --format="%ad" | sort | uniq -c
echo ""

echo "--- Archivos por modulo ---"
for m in videndum mobility bidhunter medcare finances; do
  count=$(find src/features/$m -type f 2>/dev/null | wc -l)
  echo "$m: $count"
done
