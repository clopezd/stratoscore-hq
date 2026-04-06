import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSku() {
  // Buscar el SKU exacto
  console.log('🔍 Buscando SKU: AB5385/1401\n')
  
  const { data: exact, error: exactError } = await supabase
    .from('videndum_full_context')
    .select('part_number, catalog_type, year, month, revenue_qty')
    .eq('part_number', 'AB5385/1401')
    .limit(5)

  if (exactError) {
    console.error('❌ Error:', exactError.message)
  } else {
    console.log('Resultados exactos:', exact?.length || 0)
    if (exact && exact.length > 0) {
      console.log(exact)
    }
  }

  // Buscar similares
  console.log('\n🔍 Buscando SKUs similares (AB5385)...\n')
  
  const { data: similar, error: similarError } = await supabase
    .from('videndum_full_context')
    .select('part_number')
    .like('part_number', 'AB5385%')
    .limit(20)

  if (similarError) {
    console.error('❌ Error:', similarError.message)
  } else {
    const unique = [...new Set(similar?.map(s => s.part_number))]
    console.log(`Encontrados ${unique.length} SKUs similares:`)
    unique.forEach(sku => console.log(`  - ${sku}`))
  }

  // Buscar con /
  console.log('\n🔍 Buscando SKUs con "/" en el nombre...\n')
  
  const { data: withSlash, error: slashError } = await supabase
    .from('videndum_full_context')
    .select('part_number')
    .like('part_number', '%/%')
    .limit(100)

  if (slashError) {
    console.error('❌ Error:', slashError.message)
  } else {
    const unique = [...new Set(withSlash?.map(s => s.part_number))]
    console.log(`Encontrados ${unique.length} SKUs con "/":`)
    unique.slice(0, 20).forEach(sku => console.log(`  - ${sku}`))
  }

  // Total de SKUs únicos
  console.log('\n📊 Estadísticas generales:\n')
  
  const { data: all, error: allError } = await supabase
    .from('videndum_full_context')
    .select('part_number')

  if (!allError && all) {
    const uniqueSkus = [...new Set(all.map(s => s.part_number))]
    console.log(`Total SKUs únicos: ${uniqueSkus.length}`)
    console.log(`Total registros: ${all.length}`)
    
    // Primeros 20 SKUs alfabéticamente
    console.log('\n📝 Primeros 20 SKUs (alfabéticamente):')
    uniqueSkus.sort().slice(0, 20).forEach(sku => console.log(`  - ${sku}`))
  }
}

checkSku().catch(console.error)
