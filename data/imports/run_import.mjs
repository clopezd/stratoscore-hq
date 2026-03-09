// run_import.mjs — Importa videndum_insert.sql a Supabase en lotes
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://csiiulvqzkgijxbgdqcv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo';
const BATCH_SIZE = 500;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const sql = readFileSync(new URL('./videndum_insert.sql', import.meta.url), 'utf-8');

// --- 1. TRUNCATE ---
console.log('Truncando tabla videndum_records...');
const { error: truncErr } = await supabase.rpc('exec_sql', { query: 'TRUNCATE TABLE public.videndum_records;' }).catch(() => ({ error: null }));
// Fallback: delete all rows if rpc not available
const { error: delErr } = await supabase.from('videndum_records').delete().neq('tenant_id', '__NEVER__');
if (delErr) {
  console.warn('Delete fallback falló:', delErr.message);
} else {
  console.log('Tabla limpiada.');
}

// --- 2. Parse VALUES ---
// Extraer el bloque de VALUES del INSERT
const insertMatch = sql.match(/INSERT INTO[^(]+\(([^)]+)\)\s*VALUES\s*([\s\S]+);?\s*$/i);
if (!insertMatch) {
  console.error('No se encontró el bloque INSERT en el SQL.');
  process.exit(1);
}

const columns = insertMatch[1].split(',').map(c => c.trim());
console.log('Columnas:', columns);

const valuesBlock = insertMatch[2];

// Parsear cada fila de valores
const rows = [];
const rowRegex = /\(([^)]+)\)/g;
let match;
while ((match = rowRegex.exec(valuesBlock)) !== null) {
  const parts = match[1].split(',').map(s => {
    const v = s.trim();
    if (v === 'NULL') return null;
    if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
    const n = Number(v);
    return isNaN(n) ? v : n;
  });
  const obj = {};
  columns.forEach((col, i) => { obj[col] = parts[i]; });
  rows.push(obj);
}

console.log(`Filas parseadas: ${rows.length}`);

// --- 3. Insertar en lotes ---
let inserted = 0;
let errors = 0;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from('videndum_records').insert(batch);
  if (error) {
    console.error(`Error en lote ${i}-${i + BATCH_SIZE}:`, error.message);
    errors++;
  } else {
    inserted += batch.length;
    process.stdout.write(`\rInsertadas: ${inserted}/${rows.length}`);
  }
}

console.log(`\n\nImportación completada.`);
console.log(`  ✓ Insertadas: ${inserted}`);
if (errors > 0) console.log(`  ✗ Lotes con error: ${errors}`);
