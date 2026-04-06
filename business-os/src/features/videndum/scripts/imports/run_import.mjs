import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

// Try session mode pooler (port 5432) - supports all SQL including DDL
const regions = ['us-east-1', 'us-east-2', 'eu-west-2', 'ap-southeast-1'];
let client = null;

for (const region of regions) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Intentando ${host}...`);
  const c = new Client({
    host,
    port: 5432,
    user: 'postgres.csiiulvqzkgijxbgdqcv',
    password: 'PJUEzdvtnbVA9eZ1',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await c.connect();
    console.log(`Conectado a ${region}!`);
    client = c;
    break;
  } catch (e) {
    console.log(`  Falló: ${e.message}`);
  }
}

if (!client) {
  console.error('No se pudo conectar a ningún pooler.');
  process.exit(1);
}

// 1. Crear tabla si no existe
await client.query(`
  CREATE TABLE IF NOT EXISTS public.videndum_records (
    id            bigserial PRIMARY KEY,
    tenant_id     text      NOT NULL,
    part_number   text      NOT NULL,
    catalog_type  text,
    metric_type   text      NOT NULL,
    year          int       NOT NULL,
    month         int,
    quantity      numeric,
    source_sheet  text,
    created_at    timestamptz DEFAULT now()
  );
`);
console.log('Tabla lista.');

// 2. Ejecutar el SQL completo
console.log('Ejecutando SQL (TRUNCATE + INSERT ~20K filas)...');
const sql = readFileSync('/home/cmarioia/proyectos/stratoscore-hq/data/imports/videndum_insert.sql', 'utf-8');
await client.query(sql);
console.log('¡SQL ejecutado!');

// 3. Verificar
const { rows } = await client.query('SELECT COUNT(*) FROM public.videndum_records');
console.log(`Filas importadas: ${rows[0].count}`);

await client.end();
