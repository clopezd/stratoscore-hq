import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import fs from 'fs'

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const margin = 20
const contentW = W - margin * 2

// Colors
const CYAN = [8, 145, 178]
const INDIGO = [99, 102, 241]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const WHITE = [255, 255, 255]
const LIGHT_BG = [240, 253, 250]

let y = 0

function newPage() {
  doc.addPage()
  y = margin
}

function drawFooter(pageNum) {
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('StratosCore — Confidencial', margin, H - 10)
  doc.text(`${pageNum}`, W - margin, H - 10, { align: 'right' })
}

// ═══════════════════════════════════════════════════════════
// PÁGINA 1 — Portada
// ═══════════════════════════════════════════════════════════
doc.setFillColor(...CYAN)
doc.rect(0, 0, W, H, 'F')

// Gradient effect
doc.setFillColor(...INDIGO)
doc.rect(0, H * 0.6, W, H * 0.4, 'F')

// Title
doc.setTextColor(...WHITE)
doc.setFontSize(42)
doc.setFont('helvetica', 'bold')
doc.text('MedCare', W / 2, 80, { align: 'center' })

doc.setFontSize(18)
doc.setFont('helvetica', 'normal')
doc.text('Sistema de Agendamiento Digital', W / 2, 95, { align: 'center' })
doc.text('Mamografía + Ultrasonido', W / 2, 105, { align: 'center' })

// Divider
doc.setDrawColor(...WHITE)
doc.setLineWidth(0.5)
doc.line(W / 2 - 40, 115, W / 2 + 40, 115)

doc.setFontSize(14)
doc.text('Propuesta de Producto Mínimo Viable', W / 2, 130, { align: 'center' })

// Bottom info
doc.setFontSize(11)
doc.text('Preparado por: StratosCore', W / 2, H - 50, { align: 'center' })
doc.text('Marzo 2026', W / 2, H - 40, { align: 'center' })
doc.text('Confidencial', W / 2, H - 30, { align: 'center' })

// ═══════════════════════════════════════════════════════════
// PÁGINA 2 — El Problema
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('El Problema', margin, y)
y += 15

doc.setTextColor(...DARK)
doc.setFontSize(11)
doc.setFont('helvetica', 'normal')

const problema = [
  'Tienen un mamógrafo digital y un equipo de ultrasonido nuevo.',
  'La inversión ya está hecha. Ahora necesitan llenar la agenda.',
  '',
  'Hoy, la captación de pacientes depende de:',
]
problema.forEach(line => {
  doc.text(line, margin, y)
  y += line === '' ? 4 : 6
})

y += 4
const problemas = [
  ['Boca a boca', 'Lento, impredecible, no escalable'],
  ['Llamadas telefónicas', 'Requiere personal dedicado, horario limitado'],
  ['Sin presencia digital', 'Los pacientes buscan en Google y no los encuentran'],
  ['Sin seguimiento', 'Leads que llaman y no se les da seguimiento'],
  ['Sin métricas', 'No saben cuántos pacientes pierden ni por qué'],
]

autoTable(doc, {
  startY: y,
  head: [['Situación Actual', 'Impacto']],
  body: problemas,
  margin: { left: margin, right: margin },
  headStyles: { fillColor: CYAN, fontSize: 10, font: 'helvetica' },
  bodyStyles: { fontSize: 10, textColor: DARK },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 55 },
    1: { cellWidth: contentW - 55 },
  },
})

y = doc.lastAutoTable.finalY + 15

doc.setFillColor(...LIGHT_BG)
doc.roundedRect(margin, y, contentW, 25, 3, 3, 'F')
doc.setTextColor(...CYAN)
doc.setFontSize(11)
doc.setFont('helvetica', 'bold')
doc.text('Resultado: Equipos subutilizados, agenda vacía, inversión sin retorno.', margin + 5, y + 10)
doc.setFont('helvetica', 'normal')
doc.setTextColor(...GRAY)
doc.setFontSize(10)
doc.text('Cada día sin pacientes es dinero perdido en depreciación del equipo.', margin + 5, y + 18)

drawFooter(2)

// ═══════════════════════════════════════════════════════════
// PÁGINA 3 — La Solución
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('La Solución', margin, y)
y += 12

doc.setTextColor(...DARK)
doc.setFontSize(12)
doc.setFont('helvetica', 'bold')
doc.text('Sistema de Agendamiento Digital MedCare', margin, y)
y += 8

doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
const solucion = [
  'Una plataforma web profesional que permite a pacientes agendar',
  'sus estudios de mamografía y ultrasonido desde cualquier dispositivo,',
  '24 horas al día, 7 días a la semana.',
]
solucion.forEach(line => { doc.text(line, margin, y); y += 6 })

y += 8

// Features
const features = [
  ['Landing de Captación', 'Página profesional donde el paciente selecciona su estudio,\nelige fecha y horario, y agenda en menos de 2 minutos.\nOptimizada para celular (el 80% del tráfico viene de móvil).'],
  ['Panel Operativo', 'Dashboard en tiempo real con:\n• Leads nuevos con alerta inmediata\n• Estado de cada solicitud\n• Métricas de conversión\n• Ocupación del mamógrafo y ultrasonido'],
  ['Catálogo de Servicios', '8 estudios precargados con duración y preparación:\n• Mamografía Screening y Diagnóstica\n• US Mamario, Abdominal, Pélvico, Tiroideo, Renal, MSK'],
  ['Tracking de Campañas', 'Cada link puede llevar parámetros UTM para medir\nqué campaña (Google, Instagram, referidos) trae más pacientes.'],
]

features.forEach(([title, desc]) => {
  doc.setFillColor(248, 250, 252)
  const descLines = desc.split('\n')
  const boxH = 8 + descLines.length * 5
  doc.roundedRect(margin, y, contentW, boxH + 4, 2, 2, 'F')

  doc.setTextColor(...CYAN)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin + 5, y + 6)

  doc.setTextColor(...GRAY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  descLines.forEach((line, i) => {
    doc.text(line, margin + 5, y + 12 + i * 5)
  })

  y += boxH + 8
})

drawFooter(3)

// ═══════════════════════════════════════════════════════════
// PÁGINA 4 — Flujo del Paciente
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('Flujo del Paciente', margin, y)
y += 15

const pasos = [
  ['1', 'Ve el anuncio', 'Instagram, Google, WhatsApp, o referido médico'],
  ['2', 'Entra al link', 'medcare.stratoscore.com/agendar-estudio'],
  ['3', 'Selecciona estudio', 'Mamografía o Ultrasonido — ve preparación necesaria'],
  ['4', 'Llena sus datos', 'Nombre, teléfono, fecha preferida (2 minutos)'],
  ['5', 'Recibe confirmación', 'El equipo MedCare lo contacta en < 30 minutos'],
  ['6', 'Se agenda la cita', 'Queda en el calendario del equipo correspondiente'],
  ['7', 'Recordatorios', '24h y 2h antes — con instrucciones de preparación'],
  ['8', 'Asiste al estudio', 'Llega preparado, sin sorpresas'],
]

pasos.forEach(([num, titulo, desc]) => {
  // Circle
  doc.setFillColor(...CYAN)
  doc.circle(margin + 8, y + 1, 5, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(num, margin + 8, y + 2.5, { align: 'center' })

  // Content
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, margin + 18, y)

  doc.setTextColor(...GRAY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(desc, margin + 18, y + 5.5)

  // Line
  if (num !== '8') {
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin + 8, y + 6, margin + 8, y + 14)
  }

  y += 16
})

y += 10
doc.setFillColor(...LIGHT_BG)
doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F')
doc.setTextColor(...CYAN)
doc.setFontSize(11)
doc.setFont('helvetica', 'bold')
doc.text('Resultado: De ver un anuncio a cita confirmada en menos de 5 minutos.', margin + 5, y + 8)
doc.setTextColor(...GRAY)
doc.setFontSize(9)
doc.setFont('helvetica', 'normal')
doc.text('Sin llamadas, sin esperas, sin papeleo. Disponible 24/7.', margin + 5, y + 15)

drawFooter(4)

// ═══════════════════════════════════════════════════════════
// PÁGINA 5 — Servicios Incluidos
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('Servicios Precargados', margin, y)
y += 12

doc.setTextColor(...DARK)
doc.setFontSize(11)
doc.setFont('helvetica', 'normal')
doc.text('El sistema viene configurado con los siguientes estudios:', margin, y)
y += 10

autoTable(doc, {
  startY: y,
  head: [['Estudio', 'Tipo', 'Duración', 'Preparación']],
  body: [
    ['Mamografía Screening', 'Mamografía', '20 min', 'Sin desodorante/talco, ropa de 2 piezas'],
    ['Mamografía Diagnóstica', 'Mamografía', '30 min', 'Sin desodorante/talco, traer estudios previos'],
    ['US Mamario', 'Ultrasonido', '30 min', 'Sin preparación'],
    ['US Abdominal', 'Ultrasonido', '30 min', 'Ayuno 6-8 horas'],
    ['US Pélvico', 'Ultrasonido', '30 min', 'Tomar 4-6 vasos de agua 1h antes'],
    ['US Tiroideo', 'Ultrasonido', '20 min', 'Sin preparación'],
    ['US Renal', 'Ultrasonido', '30 min', 'Ayuno 6-8h + agua 1h antes'],
    ['US Musculoesquelético', 'Ultrasonido', '30 min', 'Sin preparación'],
  ],
  margin: { left: margin, right: margin },
  headStyles: { fillColor: CYAN, fontSize: 9, font: 'helvetica' },
  bodyStyles: { fontSize: 9, textColor: DARK },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 42 },
    1: { cellWidth: 25 },
    2: { cellWidth: 20, halign: 'center' },
    3: { cellWidth: contentW - 87 },
  },
})

y = doc.lastAutoTable.finalY + 12

doc.setTextColor(...GRAY)
doc.setFontSize(10)
doc.text('Los servicios, precios y preparaciones son 100% personalizables.', margin, y)
y += 6
doc.text('Se pueden agregar nuevos estudios en cualquier momento.', margin, y)

drawFooter(5)

// ═══════════════════════════════════════════════════════════
// PÁGINA 6 — Métricas y KPIs
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('Métricas en Tiempo Real', margin, y)
y += 15

const metricas = [
  ['Leads Nuevos', 'Cuántas personas solicitan cita cada día/semana/mes'],
  ['Tasa de Conversión', '% de leads que efectivamente agendan y asisten'],
  ['Ocupación por Equipo', '% de agenda utilizada del mamógrafo y ultrasonido'],
  ['Fuente de Leads', 'Qué canal trae más pacientes (Google, IG, referidos)'],
  ['Tiempo de Respuesta', 'Cuánto tardamos en contactar cada lead'],
  ['Tipo de Estudio', 'Qué servicios tienen más demanda'],
]

autoTable(doc, {
  startY: y,
  head: [['KPI', 'Qué Mide']],
  body: metricas,
  margin: { left: margin, right: margin },
  headStyles: { fillColor: INDIGO, fontSize: 10, font: 'helvetica' },
  bodyStyles: { fontSize: 10, textColor: DARK },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 50 },
  },
})

y = doc.lastAutoTable.finalY + 15

doc.setFillColor(...LIGHT_BG)
doc.roundedRect(margin, y, contentW, 30, 3, 3, 'F')
doc.setTextColor(...CYAN)
doc.setFontSize(11)
doc.setFont('helvetica', 'bold')
doc.text('¿Por qué importan las métricas?', margin + 5, y + 8)
doc.setTextColor(...DARK)
doc.setFontSize(10)
doc.setFont('helvetica', 'normal')
doc.text('Porque permiten tomar decisiones con datos:', margin + 5, y + 15)
doc.text('• Si Google trae más pacientes que Instagram → invertir más ahí', margin + 5, y + 21)
doc.text('• Si mamografía tiene más demanda → ampliar horarios de mamógrafo', margin + 5, y + 27)

drawFooter(6)

// ═══════════════════════════════════════════════════════════
// PÁGINA 7 — Próximos Pasos + Inversión
// ═══════════════════════════════════════════════════════════
newPage()

doc.setTextColor(...CYAN)
doc.setFontSize(24)
doc.setFont('helvetica', 'bold')
doc.text('Próximos Pasos', margin, y)
y += 15

const pasosSiguientes = [
  ['1. Aprobación', 'Confirmar que el MVP cubre las necesidades iniciales'],
  ['2. Personalización', 'Ajustar branding, precios, y horarios de MedCare'],
  ['3. Activación', 'Publicar la landing y configurar el dominio'],
  ['4. Campañas', 'Lanzar anuncios en Google/Instagram con links de tracking'],
  ['5. Operación', 'Equipo MedCare gestiona leads desde el panel operativo'],
  ['6. Iteración', 'Basados en datos reales, agregar features según necesidad'],
]

pasosSiguientes.forEach(([paso, desc]) => {
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(paso, margin, y)

  doc.setTextColor(...GRAY)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(desc, margin + 35, y)
  y += 10
})

y += 10

// Evolución futura
doc.setTextColor(...CYAN)
doc.setFontSize(16)
doc.setFont('helvetica', 'bold')
doc.text('Evolución Futura (Post-MVP)', margin, y)
y += 10

const futuro = [
  ['Recordatorios WhatsApp', 'Mensajes automáticos 24h y 2h antes con preparación'],
  ['Agente IA de Captación', 'Respuesta automática a leads en < 5 minutos'],
  ['Calendario Visual', 'Vista semanal de citas por equipo con drag & drop'],
  ['Reportes PDF', 'Informes mensuales de ocupación y conversión'],
  ['Pagos Online', 'Cobro anticipado o depósito para reducir no-shows'],
]

autoTable(doc, {
  startY: y,
  head: [['Feature', 'Descripción']],
  body: futuro,
  margin: { left: margin, right: margin },
  headStyles: { fillColor: INDIGO, fontSize: 10, font: 'helvetica' },
  bodyStyles: { fontSize: 10, textColor: DARK },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  columnStyles: {
    0: { fontStyle: 'bold', cellWidth: 50 },
  },
})

drawFooter(7)

// ═══════════════════════════════════════════════════════════
// PÁGINA 8 — Cierre
// ═══════════════════════════════════════════════════════════
newPage()

doc.setFillColor(...CYAN)
doc.rect(0, 0, W, H, 'F')
doc.setFillColor(...INDIGO)
doc.rect(0, H * 0.65, W, H * 0.35, 'F')

doc.setTextColor(...WHITE)
doc.setFontSize(28)
doc.setFont('helvetica', 'bold')
doc.text('Cada día sin agenda llena', W / 2, 70, { align: 'center' })
doc.text('es retorno perdido.', W / 2, 85, { align: 'center' })

doc.setFontSize(16)
doc.setFont('helvetica', 'normal')
doc.text('Este MVP le permite a MedCare empezar a llenar', W / 2, 110, { align: 'center' })
doc.text('su agenda de mamografía y ultrasonido hoy mismo.', W / 2, 122, { align: 'center' })

doc.setDrawColor(...WHITE)
doc.setLineWidth(0.5)
doc.line(W / 2 - 30, 135, W / 2 + 30, 135)

doc.setFontSize(14)
doc.setFont('helvetica', 'bold')
doc.text('¿Comenzamos?', W / 2, 155, { align: 'center' })

doc.setFontSize(12)
doc.setFont('helvetica', 'normal')
doc.text('StratosCore', W / 2, H - 40, { align: 'center' })
doc.text('stratoscore.com', W / 2, H - 30, { align: 'center' })

// ═══════════════════════════════════════════════════════════
// Guardar
// ═══════════════════════════════════════════════════════════
const output = doc.output('arraybuffer')
const filename = 'MedCare-MVP-Propuesta-StratosCore.pdf'
fs.writeFileSync(filename, Buffer.from(output))
console.log(`PDF generado: ${filename}`)
