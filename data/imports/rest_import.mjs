import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://csiiulvqzkgijxbgdqcv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaWl1bHZxemtnaWp4YmdkcWN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ5MzI1MCwiZXhwIjoyMDg4MDY5MjUwfQ.1J3dw0LZCAZ9_Otey_rsRGiqgxVhjuVFM5MuZfXegLo';
const TABLE = 'videndum_records';
const BATCH_SIZE = 500;

const csv = readFileSync('/home/cmarioia/proyectos/stratoscore-hq/data/imports/videndum_records.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

const rows = lines.slice(1).map(line => {
  const vals = line.split(',');
  const obj = {};
  headers.forEach((h, i) => {
    const v = vals[i];
    obj[h] = v === '' ? null : v;
  });
  // Cast numerics
  if (obj.year) obj.year = parseInt(obj.year);
  if (obj.month) obj.month = parseInt(obj.month);
  if (obj.quantity) obj.quantity = parseFloat(obj.quantity);
  return obj;
});

console.log(`Total filas: ${rows.length}`);

// 1. Truncate first via RPC or just upsert — we'll delete all then insert
// Use DELETE to clear the table
const delRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?tenant_id=neq.___none___`, {
  method: 'DELETE',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
});
console.log(`DELETE status: ${delRes.status}`);

// 2. Insert in batches
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Error en lote ${i}-${i + BATCH_SIZE}: ${err}`);
    process.exit(1);
  }

  inserted += batch.length;
  process.stdout.write(`\r${inserted}/${rows.length} filas insertadas...`);
}

console.log('\n¡Import completado!');

// 3. Verificar
const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=count`, {
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: 'count=exact',
    'Range-Unit': 'items',
    Range: '0-0',
  },
});
const contentRange = countRes.headers.get('content-range');
console.log(`Content-Range: ${contentRange}`);
