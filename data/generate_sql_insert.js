const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('data/imports/Historico Vent Mod.xlsx');

const MAPPINGS = [
  {
    sheetName: 'Revenue', metricType: 'revenue',
    partCol: 1, catCol: 2,
    annualCols: [{col:3,year:2020},{col:4,year:2021},{col:5,year:2022},{col:6,year:2023},{col:7,year:2024}],
    monthCols:  [{col:8,year:2025,month:1},{col:9,year:2025,month:2},{col:10,year:2025,month:3},
                 {col:11,year:2025,month:4},{col:12,year:2025,month:5},{col:13,year:2025,month:6},
                 {col:14,year:2025,month:7},{col:15,year:2025,month:8},{col:16,year:2025,month:9},{col:17,year:2025,month:10}],
  },
  {
    sheetName: 'Order intake', metricType: 'order_intake',
    partCol: 1, catCol: null,
    annualCols: [{col:2,year:2020},{col:3,year:2021},{col:4,year:2022},{col:5,year:2023},{col:6,year:2024}],
    monthCols:  [{col:7,year:2025,month:1},{col:8,year:2025,month:2},{col:9,year:2025,month:3},
                 {col:10,year:2025,month:4},{col:11,year:2025,month:5},{col:12,year:2025,month:6},
                 {col:13,year:2025,month:7},{col:14,year:2025,month:8},{col:15,year:2025,month:9},{col:16,year:2025,month:10}],
  },
];

const esc = v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;

let allValues = [];

for (const m of MAPPINGS) {
  const ws = wb.Sheets[m.sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    const pn = row[m.partCol];
    if (!pn || typeof pn !== 'string' || !pn.trim()) continue;
    const cat = m.catCol !== null ? (row[m.catCol] === 'INV' || row[m.catCol] === 'PKG' ? row[m.catCol] : null) : null;

    const timeCols = [
      ...m.annualCols.map(c => ({ col: c.col, year: c.year, month: null })),
      ...m.monthCols.map(c => ({ col: c.col, year: c.year, month: c.month })),
    ];

    for (const { col, year, month } of timeCols) {
      const raw = row[col];
      if (raw === null || raw === undefined || raw === '') continue;
      const qty = typeof raw === 'number' ? raw : parseFloat(String(raw));
      if (isNaN(qty) || qty === 0) continue;

      allValues.push(
        `('videndum', ${esc(pn.trim())}, ${esc(cat)}, ${esc(m.metricType)}, ${year}, ${month === null ? 'NULL' : month}, ${qty}, ${esc(m.sheetName)})`
      );
    }
  }
}

// Partir en chunks de 1000 filas por INSERT (más seguro para el SQL editor)
const CHUNK = 1000;
const header = `-- Videndum Records Import — ${allValues.length} filas\n-- Ejecutar en: https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql/new\n\nTRUNCATE TABLE public.videndum_records;\n\n`;
const cols = '(tenant_id, part_number, catalog_type, metric_type, year, month, quantity, source_sheet)';

let sql = header;
for (let i = 0; i < allValues.length; i += CHUNK) {
  const chunk = allValues.slice(i, i + CHUNK);
  sql += `INSERT INTO public.videndum_records ${cols} VALUES\n${chunk.join(',\n')};\n\n`;
}

const outPath = path.join('data/imports/videndum_insert.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
const kb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`✅ SQL generado: ${outPath}`);
console.log(`   ${allValues.length} filas | ${Math.ceil(allValues.length/CHUNK)} bloques INSERT | ${kb} KB`);
