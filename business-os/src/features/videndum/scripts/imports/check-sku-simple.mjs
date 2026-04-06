import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.csiiulvqzkgijxbgdqcv',
  password: 'RkY.BPf56*wkuvW',
  database: 'postgres'
})

async function checkSku() {
  await client.connect()

  // Buscar el SKU exacto
  console.log('🔍 Buscando SKU: AB5385/1401\n')
  
  const exact = await client.query(
    `SELECT part_number, catalog_type, year, month, revenue_qty 
     FROM videndum_full_context 
     WHERE part_number = $1 
     LIMIT 5`,
    ['AB5385/1401']
  )
  
  console.log(`Resultados exactos: ${exact.rows.length}`)
  if (exact.rows.length > 0) {
    console.log(exact.rows)
  }

  // Buscar similares
  console.log('\n🔍 Buscando SKUs similares (AB5385)...\n')
  
  const similar = await client.query(
    `SELECT DISTINCT part_number 
     FROM videndum_full_context 
     WHERE part_number LIKE 'AB5385%' 
     LIMIT 20`
  )
  
  console.log(`Encontrados ${similar.rows.length} SKUs similares:`)
  similar.rows.forEach(row => console.log(`  - ${row.part_number}`))

  // Buscar con /
  console.log('\n🔍 Buscando SKUs con "/" ...\n')
  
  const withSlash = await client.query(
    `SELECT DISTINCT part_number 
     FROM videndum_full_context 
     WHERE part_number LIKE '%/%' 
     LIMIT 20`
  )
  
  console.log(`Encontrados ${withSlash.rows.length} SKUs con "/":`)
  withSlash.rows.forEach(row => console.log(`  - ${row.part_number}`))

  // Total de SKUs
  console.log('\n📊 Estadísticas generales:\n')
  
  const stats = await client.query(
    `SELECT COUNT(DISTINCT part_number) as unique_skus, COUNT(*) as total_records
     FROM videndum_full_context`
  )
  
  console.log(`Total SKUs únicos: ${stats.rows[0].unique_skus}`)
  console.log(`Total registros: ${stats.rows[0].total_records}`)

  // Primeros 20 SKUs
  console.log('\n📝 Primeros 20 SKUs (alfabéticamente):')
  
  const first20 = await client.query(
    `SELECT DISTINCT part_number 
     FROM videndum_full_context 
     ORDER BY part_number 
     LIMIT 20`
  )
  
  first20.rows.forEach(row => console.log(`  - ${row.part_number}`))

  await client.end()
}

checkSku().catch(console.error)
