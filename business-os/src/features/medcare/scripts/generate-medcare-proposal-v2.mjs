/**
 * Genera PDF profesional — Propuesta MedCare Imagenología
 * Formato estándar StratosCore (mismo que BI y Mobility V3.1)
 * Ejecutar: node scripts/generate-medcare-proposal-v2.mjs
 */

import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, '../docs/medcare/MEDCARE-PROPUESTA-MVP.pdf');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Colors
const DARK_BLUE = [30, 58, 95];
const MEDIUM_BLUE = [52, 101, 164];
const LIGHT_GRAY = [244, 246, 248];
const TABLE_ALT = [250, 251, 253];
const WHITE = [255, 255, 255];
const TEXT_DARK = [33, 37, 41];
const TEXT_MEDIUM = [100, 100, 100];
const ACCENT_GREEN = [40, 167, 69];
const ACCENT_TEAL = [8, 145, 178];

// Layout
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const FOOTER_Y = PAGE_H - 15;

class ProposalPDF {
  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.y = 0;
    this.pageNum = 1;
  }

  setColor(rgb) { this.doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
  setFillColor(rgb) { this.doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
  setDrawColor(rgb) { this.doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

  checkPageBreak(needed = 30) {
    if (this.y + needed > FOOTER_Y - 10) this.addPage();
  }

  addPage() {
    this.addFooter();
    this.doc.addPage();
    this.pageNum++;
    this.y = 25;
  }

  addFooter() {
    this.setDrawColor(DARK_BLUE);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN_LEFT, FOOTER_Y - 3, PAGE_W - MARGIN_RIGHT, FOOTER_Y - 3);
    this.doc.setFontSize(8);
    this.setColor(TEXT_MEDIUM);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Pagina ${this.pageNum}`, PAGE_W / 2, FOOTER_Y, { align: 'center' });
    this.doc.text('StratosCore — Tecnologia para tu negocio', MARGIN_LEFT, FOOTER_Y);
    this.doc.text('Confidencial', PAGE_W - MARGIN_RIGHT, FOOTER_Y, { align: 'right' });
  }

  wrapText(text, maxWidth, fontSize = 10) {
    this.doc.setFontSize(fontSize);
    return this.doc.splitTextToSize(text, maxWidth);
  }

  writeWrapped(text, x, maxWidth, fontSize = 10, lineHeight = 5) {
    const lines = this.wrapText(text, maxWidth, fontSize);
    for (const line of lines) {
      this.checkPageBreak(lineHeight + 2);
      this.doc.text(line, x, this.y);
      this.y += lineHeight;
    }
  }

  // --- Components ---

  sectionTitle(text) {
    this.checkPageBreak(20);
    this.y += 8;
    this.setFillColor(DARK_BLUE);
    this.doc.roundedRect(MARGIN_LEFT, this.y - 5, CONTENT_W, 10, 1.5, 1.5, 'F');
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.setColor(WHITE);
    this.doc.text(text, MARGIN_LEFT + 5, this.y + 1);
    this.y += 12;
  }

  subSectionTitle(text) {
    this.checkPageBreak(15);
    this.y += 5;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.setColor(DARK_BLUE);
    this.doc.text(text, MARGIN_LEFT, this.y);
    this.setDrawColor(MEDIUM_BLUE);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN_LEFT, this.y + 1.5, MARGIN_LEFT + this.doc.getTextWidth(text), this.y + 1.5);
    this.y += 7;
  }

  paragraph(text) {
    this.doc.setFont('helvetica', 'normal');
    this.setColor(TEXT_DARK);
    this.writeWrapped(text, MARGIN_LEFT, CONTENT_W, 10, 5.5);
    this.y += 2;
  }

  boldParagraph(text) {
    this.doc.setFont('helvetica', 'bold');
    this.setColor(TEXT_DARK);
    this.writeWrapped(text, MARGIN_LEFT, CONTENT_W, 10, 5.5);
    this.y += 2;
  }

  bulletList(items) {
    this.doc.setFontSize(10);
    this.setColor(TEXT_DARK);
    for (const item of items) {
      this.checkPageBreak(8);
      this.setFillColor(MEDIUM_BLUE);
      this.doc.circle(MARGIN_LEFT + 2, this.y - 1, 1, 'F');
      const clean = item.replace(/\*\*/g, '');
      const lines = this.wrapText(clean, CONTENT_W - 6, 10);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) this.checkPageBreak(6);
        this.renderBoldLine(lines[i], MARGIN_LEFT + 6, item);
        this.y += 5.5;
      }
      this.y += 1;
    }
  }

  renderBoldLine(line, x, originalMarkdown) {
    const boldParts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = regex.exec(originalMarkdown)) !== null) boldParts.push(match[1]);

    if (boldParts.length === 0) {
      this.doc.setFont('helvetica', 'normal');
      this.setColor(TEXT_DARK);
      this.doc.text(line, x, this.y);
      return;
    }

    let remaining = line;
    let curX = x;
    for (const bp of boldParts) {
      const idx = remaining.indexOf(bp);
      if (idx === -1) continue;
      const before = remaining.substring(0, idx);
      if (before) {
        this.doc.setFont('helvetica', 'normal');
        this.setColor(TEXT_DARK);
        this.doc.text(before, curX, this.y);
        curX += this.doc.getTextWidth(before);
      }
      this.doc.setFont('helvetica', 'bold');
      this.setColor(TEXT_DARK);
      this.doc.text(bp, curX, this.y);
      curX += this.doc.getTextWidth(bp);
      remaining = remaining.substring(idx + bp.length);
    }
    if (remaining) {
      this.doc.setFont('helvetica', 'normal');
      this.setColor(TEXT_DARK);
      this.doc.text(remaining, curX, this.y);
    }
  }

  table(headers, rows, colWidths = null) {
    const numCols = headers.length;
    if (!colWidths) {
      const w = CONTENT_W / numCols;
      colWidths = Array(numCols).fill(w);
    }
    const cellPad = 3;

    const getRowHeight = (cells) => {
      let maxH = 8;
      for (let c = 0; c < cells.length; c++) {
        const lines = this.wrapText(cells[c].replace(/\*\*/g, ''), colWidths[c] - cellPad * 2, 9);
        const h = lines.length * 4.5 + 3;
        if (h > maxH) maxH = h;
      }
      return maxH;
    };

    // Header
    this.checkPageBreak(12);
    let x = MARGIN_LEFT;
    const headerH = getRowHeight(headers);
    this.setFillColor(DARK_BLUE);
    this.doc.rect(MARGIN_LEFT, this.y - 1, CONTENT_W, headerH, 'F');
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.setColor(WHITE);
    for (let c = 0; c < numCols; c++) {
      const lines = this.wrapText(headers[c], colWidths[c] - cellPad * 2, 9);
      let ly = this.y + 3;
      for (const line of lines) { this.doc.text(line, x + cellPad, ly); ly += 4.5; }
      x += colWidths[c];
    }
    this.y += headerH;

    // Rows
    for (let r = 0; r < rows.length; r++) {
      const rh = getRowHeight(rows[r]);
      this.checkPageBreak(rh + 2);
      this.setFillColor(r % 2 === 0 ? WHITE : TABLE_ALT);
      this.doc.rect(MARGIN_LEFT, this.y - 1, CONTENT_W, rh, 'F');
      this.setDrawColor([220, 220, 220]);
      this.doc.setLineWidth(0.2);
      this.doc.line(MARGIN_LEFT, this.y - 1 + rh, MARGIN_LEFT + CONTENT_W, this.y - 1 + rh);

      x = MARGIN_LEFT;
      this.doc.setFontSize(9);
      this.setColor(TEXT_DARK);
      for (let c = 0; c < numCols; c++) {
        const cellText = rows[r][c];
        const clean = cellText.replace(/\*\*/g, '');
        const isBold = cellText.includes('**');
        this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = this.wrapText(clean, colWidths[c] - cellPad * 2, 9);
        let ly = this.y + 3;
        for (const line of lines) { this.doc.text(line, x + cellPad, ly); ly += 4.5; }
        x += colWidths[c];
      }
      this.y += rh;
    }

    this.setDrawColor(DARK_BLUE);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN_LEFT, this.y - 1, MARGIN_LEFT + CONTENT_W, this.y - 1);
    this.y += 5;
  }

  highlightBox(text, bgColor = [240, 248, 240]) {
    this.checkPageBreak(15);
    const lines = this.wrapText(text, CONTENT_W - 10, 11);
    const h = lines.length * 6 + 6;
    this.setFillColor(bgColor);
    this.doc.roundedRect(MARGIN_LEFT, this.y - 2, CONTENT_W, h, 2, 2, 'F');
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.setColor(DARK_BLUE);
    let ly = this.y + 3;
    for (const line of lines) { this.doc.text(line, MARGIN_LEFT + 5, ly); ly += 6; }
    this.y += h + 3;
  }

  quotedBlock(text) {
    this.checkPageBreak(20);
    const lines = this.wrapText(text, CONTENT_W - 16, 10);
    const blockH = lines.length * 5.5 + 6;
    this.setFillColor([240, 245, 255]);
    this.doc.roundedRect(MARGIN_LEFT, this.y - 2, CONTENT_W, blockH, 2, 2, 'F');
    this.setFillColor(MEDIUM_BLUE);
    this.doc.rect(MARGIN_LEFT, this.y - 2, 3, blockH, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.setColor(TEXT_DARK);
    this.y += 3;
    for (const line of lines) { this.doc.text(line, MARGIN_LEFT + 10, this.y); this.y += 5.5; }
    this.y += 5;
  }

  numberedList(items) {
    this.doc.setFontSize(10);
    this.setColor(TEXT_DARK);
    for (let i = 0; i < items.length; i++) {
      this.checkPageBreak(10);
      this.setFillColor(DARK_BLUE);
      this.doc.circle(MARGIN_LEFT + 3, this.y - 1, 3, 'F');
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.setColor(WHITE);
      this.doc.text(`${i + 1}`, MARGIN_LEFT + 3, this.y, { align: 'center' });

      this.doc.setFontSize(10);
      this.setColor(TEXT_DARK);
      const clean = items[i].replace(/\*\*/g, '');
      const isBold = items[i].includes('**');
      if (isBold) {
        const parts = items[i].split(/\*\*(.*?)\*\*/);
        let cx = MARGIN_LEFT + 9;
        for (let p = 0; p < parts.length; p++) {
          this.doc.setFont('helvetica', p % 2 === 1 ? 'bold' : 'normal');
          this.doc.text(parts[p], cx, this.y);
          cx += this.doc.getTextWidth(parts[p]);
        }
      } else {
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(clean, MARGIN_LEFT + 9, this.y);
      }
      this.y += 7;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BUILD — MedCare Imagenologia
  // ═══════════════════════════════════════════════════════════

  build() {
    // === PORTADA ===
    this.buildCover();

    // === P2: LO QUE ENTENDIMOS ===
    this.addPage();
    this.sectionTitle('01 - Lo Que Entendimos');

    this.paragraph(
      'MedCare acaba de incorporar un mamografo digital y un equipo de ultrasonido. ' +
      'La inversion en equipo ya esta hecha. Ahora el reto es llenar la agenda.'
    );
    this.y += 2;

    this.table(
      ['Aspecto', 'Detalle'],
      [
        ['**Equipos nuevos**', 'Mamografo digital + Ultrasonido'],
        ['**Servicios**', '8 tipos de estudio (2 mamografias + 6 ultrasonidos)'],
        ['**Problema central**', 'Agenda vacia: los equipos estan sin generar ingresos'],
        ['**Causa raiz**', 'Sin presencia digital, sin sistema de captacion, sin seguimiento a leads'],
        ['**Objetivo**', 'Llenar agenda al 70-80% de ocupacion en 90 dias'],
      ],
      [40, CONTENT_W - 40]
    );

    this.highlightBox(
      'Cada dia con equipos sin pacientes es retorno perdido sobre una inversion ya realizada.',
      [255, 243, 240]
    );

    // === P3: LA SOLUCION ===
    this.sectionTitle('02 - La Solucion');

    this.paragraph(
      'Un Sistema de Agendamiento Digital que permite a pacientes agendar sus estudios ' +
      'de mamografia y ultrasonido desde cualquier dispositivo, 24/7, y le da a MedCare ' +
      'un panel operativo para gestionar cada lead en tiempo real.'
    );
    this.y += 3;

    this.subSectionTitle('Captacion 24/7');
    this.bulletList([
      '**Landing de conversion** optimizada para celular — el paciente agenda en menos de 2 minutos',
      '**Seleccion guiada** de estudio con instrucciones de preparacion incluidas',
      '**Captura de UTM** para medir que campana trae mas pacientes (Google, Instagram, referidos)',
      '**Formulario inteligente** con fecha y horario preferido para acelerar confirmacion',
    ]);

    this.subSectionTitle('Panel Operativo');
    this.bulletList([
      '**Dashboard en tiempo real** con leads nuevos, tasa de conversion y ocupacion por equipo',
      '**Gestion de leads** con acciones rapidas: contactar, agendar, descartar',
      '**Metricas por tipo de estudio** — saber que servicios tienen mas demanda',
      '**Fuente de leads** — ver que canal (Google, IG, referidos) trae mas pacientes',
    ]);

    // === P4: QUE INCLUYE ===
    this.addPage();
    this.sectionTitle('03 - Que Incluye');

    this.table(
      ['Entregable', 'Descripcion'],
      [
        ['**Landing publica**', 'Pagina profesional /medcare/agendar-estudio — sin login, mobile-first, con seleccion de estudio y captura de datos'],
        ['**Catalogo de 8 servicios**', '2 mamografias (screening + diagnostica) + 6 ultrasonidos (mamario, abdominal, pelvico, tiroideo, renal, musculoesqueletico)'],
        ['**Panel operativo**', 'Dashboard con KPIs, leads recientes, ocupacion por equipo, gestion completa de leads'],
        ['**Base de datos**', 'Tablas de servicios, leads y vistas de ocupacion con seguridad RLS'],
        ['**Tracking UTM**', 'Cada link puede llevar parametros para medir campanas de Google Ads, Instagram, referidos medicos'],
        ['**Preparaciones**', 'Cada servicio incluye instrucciones de preparacion que el paciente ve antes y despues de agendar'],
      ],
      [42, CONTENT_W - 42]
    );

    this.y += 3;
    this.subSectionTitle('Servicios Precargados');

    this.table(
      ['Estudio', 'Tipo', 'Duracion', 'Preparacion'],
      [
        ['Mamografia Screening', 'Mamografia', '20 min', 'Sin desodorante/talco, ropa de 2 piezas'],
        ['Mamografia Diagnostica', 'Mamografia', '30 min', 'Sin desodorante/talco, traer estudios previos'],
        ['US Mamario', 'Ultrasonido', '30 min', 'Sin preparacion'],
        ['US Abdominal', 'Ultrasonido', '30 min', 'Ayuno 6-8 horas'],
        ['US Pelvico', 'Ultrasonido', '30 min', 'Tomar 4-6 vasos de agua 1h antes'],
        ['US Tiroideo', 'Ultrasonido', '20 min', 'Sin preparacion'],
        ['US Renal', 'Ultrasonido', '30 min', 'Ayuno 6-8h + agua 1h antes'],
        ['US Musculoesqueletico', 'Ultrasonido', '30 min', 'Sin preparacion'],
      ],
      [42, 25, 18, CONTENT_W - 85]
    );

    this.paragraph('Los servicios, precios y preparaciones son 100% personalizables. Se pueden agregar nuevos estudios en cualquier momento.');

    // === P5: FLUJO DEL PACIENTE ===
    this.addPage();
    this.sectionTitle('04 - Flujo del Paciente');

    this.paragraph('Desde que el paciente ve un anuncio hasta que asiste a su estudio:');
    this.y += 3;

    this.numberedList([
      '**Ve el anuncio** en Instagram, Google, WhatsApp o por referido medico',
      '**Entra al link** de agendamiento (compartible, trackeable)',
      '**Selecciona su estudio** — Mamografia o Ultrasonido, con preparacion visible',
      '**Llena sus datos** — nombre, telefono, fecha preferida (2 minutos)',
      '**Recibe confirmacion** — el equipo MedCare lo contacta en < 30 minutos',
      '**Se agenda la cita** — queda en el calendario del equipo correspondiente',
      '**Recordatorios** — 24h y 2h antes con instrucciones de preparacion',
      '**Asiste al estudio** — llega preparado, sin sorpresas',
    ]);

    this.y += 5;
    this.highlightBox(
      'Resultado: De ver un anuncio a cita confirmada en menos de 5 minutos. Sin llamadas, sin esperas, sin papeleo. Disponible 24/7.',
      [230, 245, 255]
    );

    // === P6: INVERSION ===
    this.addPage();
    this.sectionTitle('05 - Inversion');

    this.paragraph('Modelo simple y predecible:');
    this.y += 3;

    this.table(
      ['Concepto', 'Monto', 'Detalle'],
      [
        ['**Implementacion inicial**', '**$1,500 USD**', 'Sistema completo: Landing + Panel Operativo + BD + Catalogo de servicios + Configuracion'],
        ['**Mensualidad**', '**$300 USD/mes**', 'Hosting + mantenimiento + soporte + actualizaciones + optimizacion continua'],
        ['**Presupuesto Ads**', 'A definir', 'Facebook/Instagram + Google (MedCare paga directo a plataformas)'],
      ],
      [42, 30, CONTENT_W - 72]
    );

    this.y += 3;
    this.subSectionTitle('Que incluye el setup de $1,500?');
    this.bulletList([
      '**Landing de captacion** /agendar-estudio con seleccion de estudio y formulario optimizado',
      '**Panel operativo** con dashboard, KPIs, gestion de leads y metricas',
      '**Catalogo de 8 servicios** con duraciones y preparaciones precargadas',
      '**Base de datos** con tablas de servicios, leads y vistas de ocupacion',
      '**Tracking de campanas** con parametros UTM para medir cada canal',
      '**Configuracion y puesta en marcha** del sistema completo',
    ]);

    this.y += 3;
    this.subSectionTitle('Que incluye la mensualidad de $300?');
    this.bulletList([
      '**Hosting y disponibilidad** del sistema 24/7',
      '**Soporte tecnico** para ajustes y mejoras',
      '**Actualizaciones** del sistema sin costo adicional',
      '**Optimizacion** basada en metricas reales de uso',
      '**Respaldo** automatico de datos',
    ]);

    this.y += 5;
    this.highlightBox(
      'Total primer mes: $1,800 USD (setup + mensualidad). Meses siguientes: $300 USD/mes.',
      [240, 248, 240]
    );

    // === P7: POR QUE ES RAZONABLE ===
    this.sectionTitle('06 - Por Que la Inversion es Razonable');

    this.table(
      ['Alternativa', 'Costo', 'Limitacion'],
      [
        ['Asistente de captacion', '$800-1,200 USD/mes', 'Horario limitado, sin metricas, sin tracking'],
        ['Coordinador de agenda', '$600-1,000 USD/mes', 'Solo atiende en horario laboral'],
        ['Software CRM generico', '$200-500 USD/mes', 'No especializado en imagenologia, requiere config'],
        ['**StratosCore MedCare**', '**$300 USD/mes**', '**24/7, especializado, con metricas en tiempo real**'],
      ],
      [45, 38, CONTENT_W - 83]
    );

    this.y += 3;
    this.subSectionTitle('Proyeccion de Retorno');
    this.paragraph(
      'Con un precio promedio de $50-80 USD por estudio de imagenologia:'
    );

    this.table(
      ['Escenario', 'Estudios/mes', 'Ingreso mensual', 'ROI vs inversion'],
      [
        ['Conservador', '20 estudios', '$1,000 - $1,600 USD', 'Cubre costos desde mes 1'],
        ['Moderado', '40 estudios', '$2,000 - $3,200 USD', 'La inversion se paga sola'],
        ['Optimista', '60+ estudios', '$3,000 - $4,800 USD', 'Retorno 10x sobre mensualidad'],
      ],
      [30, 30, 38, CONTENT_W - 98]
    );

    this.y += 3;
    this.highlightBox(
      'Con solo 5-6 estudios adicionales al mes, la mensualidad se paga sola.',
      [240, 248, 240]
    );

    // === P8: RESULTADOS ESPERADOS ===
    this.addPage();
    this.sectionTitle('07 - Resultados Esperados');

    this.paragraph('Proyeccion a 90 dias desde el lanzamiento:');
    this.y += 3;

    this.table(
      ['Periodo', 'Meta', 'Impacto'],
      [
        ['**Mes 1**', 'Lanzamiento + primeros leads', 'Validacion del sistema, primeras citas agendadas'],
        ['**Mes 2**', 'Optimizacion de campanas', '20-30 estudios/mes, datos para optimizar canales'],
        ['**Mes 3**', 'Ocupacion 70-80%', '40-60 estudios/mes, canales optimizados, flujo constante'],
      ],
      [25, 42, CONTENT_W - 67]
    );

    this.y += 3;
    this.subSectionTitle('KPIs Principales');

    this.table(
      ['KPI', 'Hoy', 'Meta Mes 3'],
      [
        ['**Estudios/mes**', '0 (equipo nuevo)', '40-60'],
        ['**Ocupacion mamografo**', '0%', '70-80%'],
        ['**Ocupacion ultrasonido**', '0%', '70-80%'],
        ['**Tiempo respuesta a leads**', 'Variable', '<30 minutos'],
        ['**Conversion lead a cita**', 'N/A', '50-60%'],
      ],
      [50, 40, CONTENT_W - 90]
    );

    // === P9: CRONOGRAMA ===
    this.y += 5;
    this.sectionTitle('08 - Cronograma de Implementacion');

    this.table(
      ['Fase', 'Que se hace', 'Duracion'],
      [
        ['**1. Setup**', 'Base de datos, catalogo de servicios, configuracion inicial', 'Dia 1-2'],
        ['**2. Landing**', 'Pagina publica de agendamiento con formulario y seleccion de estudio', 'Dia 3-4'],
        ['**3. Panel**', 'Dashboard operativo con KPIs, leads y gestion', 'Dia 5-6'],
        ['**4. Entrega**', 'Pruebas, ajustes de branding, capacitacion y puesta en marcha', 'Dia 7'],
      ],
      [25, CONTENT_W - 50, 25]
    );

    this.highlightBox('Tiempo total: 1 semana hasta operacion completa.', [230, 245, 255]);

    // === P10: EVOLUCION FUTURA ===
    this.sectionTitle('09 - Evolucion Futura (Post-MVP)');

    this.paragraph('El MVP es el punto de partida. Basados en datos reales, se pueden agregar:');
    this.y += 2;

    this.table(
      ['Feature', 'Descripcion', 'Impacto'],
      [
        ['**Recordatorios WhatsApp**', 'Mensajes automaticos 24h y 2h antes con preparacion', 'Reducir no-shows'],
        ['**Agente IA de Captacion**', 'Respuesta automatica a leads en < 5 minutos', '+40% conversion'],
        ['**Calendario Visual**', 'Vista semanal por equipo con drag & drop', 'Eficiencia operativa'],
        ['**Reportes PDF**', 'Informes mensuales de ocupacion y conversion', 'Visibilidad para decision'],
        ['**Pagos Online**', 'Cobro anticipado o deposito al agendar', 'Reducir no-shows, cash flow'],
      ],
      [42, 55, CONTENT_W - 97]
    );

    // === P11: PROXIMOS PASOS ===
    this.addPage();
    this.sectionTitle('10 - Proximos Pasos');
    this.y += 3;

    this.numberedList([
      '**Aprobacion** de esta propuesta',
      '**Pago del setup** ($1,500 USD) para iniciar implementacion',
      '**Implementacion** en 1 semana',
      '**Capacitacion** del equipo (1 sesion de 30 min)',
      '**Lanzamiento** — landing activa, panel operativo listo',
      '**Campanas** — lanzar anuncios en Google/Instagram con links de tracking',
    ]);

    // === PREGUNTAS FRECUENTES ===
    this.y += 5;
    this.sectionTitle('11 - Preguntas Frecuentes');

    this.subSectionTitle('Que pasa si necesito agregar mas servicios?');
    this.paragraph('Se pueden agregar nuevos estudios en cualquier momento desde el panel, sin costo adicional.');

    this.subSectionTitle('Cuanto tiempo requiere del equipo de MedCare?');
    this.paragraph('Setup: 1 hora (reunión inicial + entrega de accesos). Operacion: 15-30 min/dia para gestionar leads nuevos.');

    this.subSectionTitle('Que pasa si no funciona?');
    this.paragraph('El sistema se puede cancelar en cualquier momento. No hay permanencia minima. Los datos son de MedCare.');

    this.subSectionTitle('Puedo ver como funciona antes de pagar?');
    this.paragraph('Si. Se puede hacer una demostracion en vivo del sistema antes de tomar la decision.');

    // === RESUMEN EJECUTIVO ===
    this.y += 5;
    this.sectionTitle('Resumen Ejecutivo');

    this.quotedBlock(
      'Le construimos a MedCare un sistema de agendamiento digital para su mamografo y ultrasonido. ' +
      'Pagina profesional donde pacientes agendan en 2 minutos + panel operativo con metricas en tiempo real. ' +
      'Setup: $1,500 USD. Mensualidad: $300 USD/mes. Listo en 1 semana. ' +
      'Con solo 5-6 estudios adicionales al mes, la inversion se paga sola.'
    );

    // === CIERRE ===
    this.y += 10;
    this.setDrawColor(DARK_BLUE);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN_LEFT, this.y, PAGE_W - MARGIN_RIGHT, this.y);

    this.y += 12;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'italic');
    this.setColor(DARK_BLUE);
    this.doc.text('StratosCore — Tecnologia para tu negocio', PAGE_W / 2, this.y, { align: 'center' });

    // Signature lines
    this.y += 25;
    const sigW = 60;
    const sig1X = MARGIN_LEFT + 10;
    const sig2X = PAGE_W - MARGIN_RIGHT - sigW - 10;

    this.setDrawColor(TEXT_MEDIUM);
    this.doc.setLineWidth(0.3);
    this.doc.line(sig1X, this.y, sig1X + sigW, this.y);
    this.doc.line(sig2X, this.y, sig2X + sigW, this.y);

    this.y += 5;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.setColor(TEXT_MEDIUM);
    this.doc.text('StratosCore', sig1X + sigW / 2, this.y, { align: 'center' });
    this.doc.text('MedCare', sig2X + sigW / 2, this.y, { align: 'center' });

    this.y += 5;
    this.doc.text('Firma', sig1X + sigW / 2, this.y, { align: 'center' });
    this.doc.text('Firma', sig2X + sigW / 2, this.y, { align: 'center' });

    // Contacto
    this.y += 15;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.setColor(TEXT_MEDIUM);
    this.doc.text('carlos@stratoscore.app  |  stratoscore.app', PAGE_W / 2, this.y, { align: 'center' });

    this.addFooter();
  }

  buildCover() {
    const doc = this.doc;

    // Top bar
    this.setFillColor(DARK_BLUE);
    doc.rect(0, 0, PAGE_W, 8, 'F');

    // Brand
    this.y = 45;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    this.setColor(MEDIUM_BLUE);
    doc.text('STRATOSCORE', PAGE_W / 2, this.y, { align: 'center' });

    // Line
    this.y += 8;
    this.setDrawColor(DARK_BLUE);
    doc.setLineWidth(0.8);
    doc.line(PAGE_W / 2 - 30, this.y, PAGE_W / 2 + 30, this.y);

    // Title
    this.y += 20;
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    this.setColor(DARK_BLUE);
    doc.text('Propuesta Comercial', PAGE_W / 2, this.y, { align: 'center' });

    // Subtitle
    this.y += 14;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    this.setColor(TEXT_DARK);
    doc.text('Sistema de Agendamiento Digital', PAGE_W / 2, this.y, { align: 'center' });

    this.y += 10;
    doc.setFontSize(12);
    this.setColor(TEXT_MEDIUM);
    doc.text('Mamografia Digital + Ultrasonido', PAGE_W / 2, this.y, { align: 'center' });

    // Info box
    this.y += 35;
    const boxW = 100;
    const boxX = (PAGE_W - boxW) / 2;
    this.setFillColor(LIGHT_GRAY);
    doc.roundedRect(boxX, this.y, boxW, 55, 3, 3, 'F');

    this.y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    this.setColor(TEXT_DARK);
    doc.text('Preparado para:', boxX + 10, this.y);
    doc.setFont('helvetica', 'normal');
    doc.text('MedCare', boxX + 50, this.y);

    this.y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', boxX + 10, this.y);
    doc.setFont('helvetica', 'normal');
    doc.text('Marzo 2026', boxX + 50, this.y);

    this.y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Preparado por:', boxX + 10, this.y);
    doc.setFont('helvetica', 'normal');
    doc.text('StratosCore', boxX + 50, this.y);

    this.y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Version:', boxX + 10, this.y);
    doc.setFont('helvetica', 'normal');
    doc.text('MVP 1.0', boxX + 50, this.y);

    // Bottom bar
    this.setFillColor(DARK_BLUE);
    doc.rect(0, PAGE_H - 8, PAGE_W, 8, 'F');

    // Page number
    doc.setFontSize(8);
    this.setColor(TEXT_MEDIUM);
    doc.text('Pagina 1', PAGE_W / 2, FOOTER_Y, { align: 'center' });
  }

  save() {
    const buffer = this.doc.output('arraybuffer');
    fs.writeFileSync(OUTPUT_PATH, Buffer.from(buffer));
    console.log(`PDF generado: ${OUTPUT_PATH}`);
    console.log(`Tamano: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB`);
    console.log(`Paginas: ${this.pageNum}`);
  }
}

// --- Main ---
const pdf = new ProposalPDF();
pdf.build();
pdf.save();
