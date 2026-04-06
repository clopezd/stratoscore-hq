# Cómo Generar el PDF de la Propuesta Mobility

## 📄 Archivos Disponibles

- **[MOBILITY_PROPUESTA_PILOTO.html](MOBILITY_PROPUESTA_PILOTO.html)** — Versión HTML lista para convertir a PDF
- **[MOBILITY_PROPUESTA_PILOTO.md](MOBILITY_PROPUESTA_PILOTO.md)** — Versión Markdown (backup)

---

## 🎯 MÉTODO 1: Desde el Navegador (Más Fácil)

### Pasos:

1. **Abrir el archivo HTML en Chrome/Edge:**
   ```bash
   cd /home/cmarioia/proyectos/stratoscore-hq/business-os/docs/mobility/
   google-chrome MOBILITY_PROPUESTA_PILOTO.html
   # O en WSL con Windows:
   explorer.exe MOBILITY_PROPUESTA_PILOTO.html
   ```

2. **Imprimir como PDF:**
   - Presiona `Ctrl + P` (Windows/Linux) o `Cmd + P` (Mac)
   - En "Destino" selecciona **"Guardar como PDF"**
   - **Configuración recomendada:**
     - Diseño: **Vertical**
     - Márgenes: **Mínimos** o **Ninguno**
     - Escala: **100%**
     - Opciones: ✅ Gráficos de fondo
   - Click en **"Guardar"**
   - Nombre sugerido: `Propuesta_Mobility_Piloto_StratosCore.pdf`

3. **Resultado:**
   - PDF profesional con 10 páginas
   - Portada con gradiente azul
   - Tablas, gráficos y diseño intacto

---

## 🎯 MÉTODO 2: Usando Puppeteer (Automatizado)

Si quieres generar PDFs automáticamente desde código:

### 1. Instalar Puppeteer:

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os
npm install puppeteer
```

### 2. Crear script generador:

```bash
cd docs/mobility
nano generate-pdf.mjs
```

Contenido de `generate-pdf.mjs`:

```javascript
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Cargar HTML local
  const htmlPath = `file://${join(__dirname, 'MOBILITY_PROPUESTA_PILOTO.html')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Generar PDF
  await page.pdf({
    path: 'Propuesta_Mobility_Piloto_StratosCore.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  console.log('✅ PDF generado: Propuesta_Mobility_Piloto_StratosCore.pdf');
  await browser.close();
})();
```

### 3. Ejecutar:

```bash
node generate-pdf.mjs
```

### 4. Resultado:

- PDF generado en: `docs/mobility/Propuesta_Mobility_Piloto_StratosCore.pdf`

---

## 🎯 MÉTODO 3: Usando wkhtmltopdf (Linux/WSL)

### 1. Instalar wkhtmltopdf:

```bash
sudo apt-get update
sudo apt-get install wkhtmltopdf
```

### 2. Generar PDF:

```bash
cd /home/cmarioia/proyectos/stratoscore-hq/business-os/docs/mobility/

wkhtmltopdf \
  --page-size A4 \
  --margin-top 0 \
  --margin-right 0 \
  --margin-bottom 0 \
  --margin-left 0 \
  --enable-local-file-access \
  --print-media-type \
  MOBILITY_PROPUESTA_PILOTO.html \
  Propuesta_Mobility_Piloto_StratosCore.pdf
```

---

## 🎨 MÉTODO 4: Desde VSCode (Si Tienes Extensión)

### 1. Instalar extensión:

- Busca "Markdown PDF" en VSCode Extensions
- Instala "yzane.markdown-pdf"

### 2. Abrir archivo Markdown:

```
MOBILITY_PROPUESTA_PILOTO.md
```

### 3. Exportar:

- `Ctrl + Shift + P` → "Markdown PDF: Export (pdf)"
- Guardar como: `Propuesta_Mobility_Piloto_StratosCore.pdf`

**Nota:** El resultado desde Markdown será más simple que desde HTML. Usa MÉTODO 1 o 2 para mejor diseño.

---

## ✅ RECOMENDACIÓN FINAL

**Usa MÉTODO 1 (navegador)** por estas razones:

1. ✅ No requiere instalar nada
2. ✅ Preserva 100% el diseño
3. ✅ Control total sobre configuración
4. ✅ Funciona en cualquier sistema operativo
5. ✅ Resultado profesional garantizado

---

## 📋 Checklist Pre-Envío

Antes de enviar el PDF al cliente, verifica:

- [ ] Portada con logo StratosCore
- [ ] Fecha correcta (Marzo 2026)
- [ ] Pricing correcto ($1,500-2,000 + $500/mes)
- [ ] Todos los números de proyección visibles
- [ ] Tablas bien formateadas
- [ ] Gráficos de fondo visibles (gradientes azules)
- [ ] Sin errores de ortografía
- [ ] Contacto actualizado (email, WhatsApp)
- [ ] 10 páginas completas

---

## 🎯 Personalización Adicional

### Si quieres cambiar colores/diseño:

Edita el archivo HTML líneas 19-27:

```css
:root {
    --primary: #0066FF;      /* Azul principal */
    --secondary: #00C896;    /* Verde secundario */
    --dark: #1a1a2e;        /* Texto oscuro */
    --gray: #64748b;        /* Texto gris */
}
```

### Si quieres agregar tu logo:

Agrega en línea 93 del HTML (dentro de `.cover-footer`):

```html
<div class="logo">
    <img src="ruta/a/tu/logo.png" alt="StratosCore" height="40">
</div>
```

---

## 📧 Envío al Cliente

### Email sugerido:

```
Asunto: Propuesta Piloto — Sistema de Acompañamiento Clínico Mobility

Hola [Nombre],

Adjunto la propuesta completa del Proyecto Piloto que discutimos.

Resumen rápido:
• Setup: $1,500-2,000 USD (una vez)
• Mensualidad: $500 USD × 3 meses
• ROI proyectado: 815% en 90 días
• Sin compromisos post-piloto

¿Tienes 30 minutos esta semana para alinear detalles?

Quedo atento,
Carlos
StratosCore
carlos@stratoscore.app
```

---

**Última actualización:** 20 Marzo 2026
**Versión:** 1.0
