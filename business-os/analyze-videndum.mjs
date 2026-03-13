/**
 * analyze-videndum.mjs
 * Análisis estadístico histórico de Videndum (2020-2025)
 * Métricas: tendencia YoY, CAGR, desviación estándar, estacionalidad, Book-to-Bill
 * Uso: node analyze-videndum.mjs
 */

const TOKEN   = 'sbp_34619b60d4c8b10f2e30a500caae0adb73be1747'
const PROJECT = 'csiiulvqzkgijxbgdqcv'
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`

async function q(sql) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const data = await r.json()
  if (data.message) throw new Error(data.message)
  return data
}

function fmt(n, decimals = 0) {
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals })
}

function pct(v) {
  const n = Number(v)
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function bar(value, max, width = 30) {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function stddev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  return { mean, stddev: Math.sqrt(variance), cv: (Math.sqrt(variance) / mean) * 100 }
}

// ── 1. Revenue anual total (INV + PKG) ─────────────────────────────────────
async function revenueAnual() {
  return q(`
    SELECT year, SUM(quantity) AS total
    FROM public.videndum_records
    WHERE metric_type = 'revenue' AND month IS NULL
    GROUP BY year ORDER BY year
  `)
}

// ── 2. Order Intake anual ───────────────────────────────────────────────────
async function orderIntakeAnual() {
  return q(`
    SELECT year, SUM(quantity) AS total
    FROM public.videndum_records
    WHERE metric_type = 'order_intake' AND month IS NULL
    GROUP BY year ORDER BY year
  `)
}

// ── 3. Revenue mensual (para StdDev y estacionalidad) ──────────────────────
async function revenueMensual() {
  return q(`
    SELECT year, month, SUM(quantity) AS total
    FROM public.videndum_records
    WHERE metric_type = 'revenue' AND month IS NOT NULL
    GROUP BY year, month ORDER BY year, month
  `)
}

// ── 4. Top 10 parts por revenue ─────────────────────────────────────────────
async function topParts() {
  return q(`
    SELECT part_number, catalog_type, SUM(quantity) AS total
    FROM public.videndum_records
    WHERE metric_type = 'revenue'
    GROUP BY part_number, catalog_type
    ORDER BY total DESC LIMIT 10
  `)
}

// ── 5. Estacionalidad: promedio por mes (todos los años) ────────────────────
async function estacionalidad() {
  return q(`
    SELECT month,
      ROUND(AVG(monthly_total)::numeric, 0) AS avg_revenue,
      COUNT(*) AS years_with_data
    FROM (
      SELECT year, month, SUM(quantity) AS monthly_total
      FROM public.videndum_records
      WHERE metric_type = 'revenue' AND month IS NOT NULL
      GROUP BY year, month
    ) sub
    GROUP BY month ORDER BY month
  `)
}

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '═'.repeat(60))
  console.log('  VIDENDUM — ANÁLISIS HISTÓRICO 2020–2025')
  console.log('═'.repeat(60))

  const [revAnual, oiAnual, revMensual, tops, estac] = await Promise.all([
    revenueAnual(), orderIntakeAnual(), revenueMensual(), topParts(), estacionalidad()
  ])

  // ── SECCIÓN 1: Revenue YoY ────────────────────────────────────────────────
  console.log('\n📈  REVENUE ANUAL (INV + PKG)')
  console.log('─'.repeat(60))
  const revVals = revAnual.map(r => Number(r.total))
  const maxRev = Math.max(...revVals)
  revAnual.forEach((r, i) => {
    const yoy = i === 0 ? null : ((revVals[i] - revVals[i-1]) / revVals[i-1]) * 100
    const bar_ = bar(revVals[i], maxRev, 25)
    const yoyStr = yoy === null ? '  base  ' : pct(yoy).padStart(7)
    console.log(`  ${r.year}  ${bar_}  ${fmt(revVals[i]).padStart(10)}  YoY: ${yoyStr}`)
  })

  // CAGR
  const cagr = ((revVals[revVals.length-1] / revVals[0]) ** (1 / (revAnual.length - 1)) - 1) * 100
  const { mean, stddev: sd, cv } = stddev(revVals)
  console.log(`\n  CAGR (${revAnual[0].year}–${revAnual[revAnual.length-1].year}):  ${pct(cagr)}`)
  console.log(`  Media anual:              ${fmt(mean, 0)}`)
  console.log(`  Desviación estándar:      ${fmt(sd, 0)}`)
  console.log(`  Coef. de variación:       ${cv.toFixed(1)}%  ${cv < 15 ? '(baja volatilidad ✓)' : cv < 30 ? '(volatilidad moderada)' : '(alta volatilidad ⚠)'}`)

  // ── SECCIÓN 2: Order Intake YoY + Book-to-Bill ────────────────────────────
  console.log('\n\n📦  ORDER INTAKE ANUAL')
  console.log('─'.repeat(60))
  const oiVals = oiAnual.map(r => Number(r.total))
  const maxOI = Math.max(...oiVals)
  oiAnual.forEach((r, i) => {
    const yoy = i === 0 ? null : ((oiVals[i] - oiVals[i-1]) / oiVals[i-1]) * 100
    const bar_ = bar(oiVals[i], maxOI, 25)
    const yoyStr = yoy === null ? '  base  ' : pct(yoy).padStart(7)
    // Book-to-Bill
    const revRow = revAnual.find(x => x.year === r.year)
    const bb = revRow ? (Number(r.total) / Number(revRow.total)).toFixed(2) : 'N/A'
    console.log(`  ${r.year}  ${bar_}  ${fmt(oiVals[i]).padStart(10)}  YoY: ${yoyStr}  B2B: ${bb}`)
  })
  console.log(`\n  Book-to-Bill > 1.0 = demanda creciente`)
  console.log(`  Book-to-Bill < 1.0 = consumiendo backlog`)

  // ── SECCIÓN 3: Tendencia mensual — StdDev y MoM ───────────────────────────
  console.log('\n\n📊  REVENUE MENSUAL — TENDENCIA & VOLATILIDAD')
  console.log('─'.repeat(60))
  const mensualVals = revMensual.map(r => Number(r.total))
  const { mean: mMean, stddev: mSd, cv: mCv } = stddev(mensualVals)
  console.log(`  Registros mensuales:      ${revMensual.length} meses con data`)
  console.log(`  Media mensual:            ${fmt(mMean, 0)}`)
  console.log(`  Desviación estándar:      ${fmt(mSd, 0)}`)
  console.log(`  Coef. de variación:       ${mCv.toFixed(1)}%`)

  // Últimos 12 meses con data
  const last12 = revMensual.slice(-12)
  if (last12.length >= 2) {
    console.log(`\n  Últimos ${last12.length} meses (MoM):`)
    last12.forEach((r, i) => {
      const mom = i === 0 ? null : ((Number(last12[i].total) - Number(last12[i-1].total)) / Number(last12[i-1].total)) * 100
      const momStr = mom === null ? '' : `  MoM: ${pct(mom)}`
      const mName = ['', 'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][r.month]
      console.log(`    ${r.year}-${mName}  ${fmt(Number(r.total)).padStart(10)}${momStr}`)
    })
  }

  // ── SECCIÓN 4: Estacionalidad ──────────────────────────────────────────────
  console.log('\n\n🗓  ESTACIONALIDAD — PROMEDIO MENSUAL (todos los años)')
  console.log('─'.repeat(60))
  const estacVals = estac.map(r => Number(r.avg_revenue))
  const maxEstac = Math.max(...estacVals)
  const mNames = ['', 'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  estac.forEach(r => {
    const b = bar(Number(r.avg_revenue), maxEstac, 20)
    console.log(`  ${mNames[r.month]}  ${b}  ${fmt(Number(r.avg_revenue)).padStart(10)}`)
  })
  const peakMonth = estac.reduce((a, b) => Number(a.avg_revenue) > Number(b.avg_revenue) ? a : b)
  const lowMonth  = estac.reduce((a, b) => Number(a.avg_revenue) < Number(b.avg_revenue) ? a : b)
  console.log(`\n  Mes pico:    ${mNames[peakMonth.month]} (${fmt(Number(peakMonth.avg_revenue))})`)
  console.log(`  Mes valle:   ${mNames[lowMonth.month]} (${fmt(Number(lowMonth.avg_revenue))})`)

  // ── SECCIÓN 5: Top 10 Parts ───────────────────────────────────────────────
  console.log('\n\n🏆  TOP 10 PARTS POR REVENUE HISTÓRICO')
  console.log('─'.repeat(60))
  const maxTop = Number(tops[0].total)
  tops.forEach((r, i) => {
    const b = bar(Number(r.total), maxTop, 20)
    const type = (r.catalog_type ?? 'N/A').padEnd(3)
    console.log(`  ${String(i+1).padStart(2)}. [${type}] ${r.part_number.padEnd(25)} ${b}  ${fmt(Number(r.total)).padStart(10)}`)
  })

  // ── RESUMEN EJECUTIVO ─────────────────────────────────────────────────────
  console.log('\n\n✅  RESUMEN EJECUTIVO')
  console.log('═'.repeat(60))
  const firstYear = revAnual[0], lastYear = revAnual[revAnual.length-1]
  const totalRevChange = ((revVals[revVals.length-1] - revVals[0]) / revVals[0]) * 100
  console.log(`  Período analizado:    ${firstYear.year}–${lastYear.year} (${revAnual.length} años)`)
  console.log(`  Revenue ${firstYear.year}:        ${fmt(revVals[0])}`)
  console.log(`  Revenue ${lastYear.year}:        ${fmt(revVals[revVals.length-1])}`)
  console.log(`  Crecimiento total:    ${pct(totalRevChange)}`)
  console.log(`  CAGR:                 ${pct(cagr)} anual`)
  console.log(`  Volatilidad anual:    CV ${cv.toFixed(1)}%`)
  console.log(`  Mes más fuerte:       ${mNames[peakMonth.month]}`)
  console.log('═'.repeat(60) + '\n')
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
