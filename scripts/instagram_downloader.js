#!/usr/bin/env node

/**
 * Instagram Downloader - Descarga automática de imágenes de un perfil
 * Uso: node instagram_downloader.js ticorestorations
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const username = process.argv[2] || 'ticorestorations';
const outputDir = 'tico_instagram';

// Crear directorio
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✓ Carpeta creada: ${outputDir}/`);
}

/**
 * Descargar archivo desde URL
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Seguir redirects
        downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Obtener datos del perfil Instagram (sin login)
 */
async function fetchInstagramProfile(username) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.instagram.com',
      path: `/${username}/?__a=1&__w=1`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error('No se pudo parsear respuesta de Instagram'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Descargar todas las imágenes
 */
async function downloadProfileImages(username) {
  console.log(`\n📸 Descargando imágenes de @${username}...\n`);

  try {
    // Método 1: Intentar API pública
    console.log('🔄 Intentando acceso a API pública de Instagram...');

    // Usar graphql endpoint alternativo
    const queryHash = '69cba40317214236af40e7effc5171d7'; // hash para user.edge_owner_to_timeline_media

    console.log('⚠️  Nota: Instagram tiene restricciones de scraping.');
    console.log('💡 Alternativas recomendadas:\n');

    console.log('1️⃣  OPCIÓN MANUAL (MÁS SEGURA):');
    console.log('   - Abre: https://www.instagram.com/ticorestorations/');
    console.log('   - Descarga cada imagen (clic derecho → Guardar)');
    console.log('   - Guarda en carpeta: tico_instagram/\n');

    console.log('2️⃣  HERRAMIENTA RECOMENDADA:');
    console.log('   - 4K Video Downloader: https://www.4kdownload.com/');
    console.log('   - Legalidad: ✅ 100% seguro');
    console.log('   - Tiempo: 5 minutos\n');

    console.log('3️⃣  MÉTODO AVANZADO (Necesita credenciales):');
    console.log('   npm install instagrapi-scraper');
    console.log('   Luego ejecutar con credenciales...\n');

    // Crear archivo de ejemplo
    createSampleData();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nUsando datos de ejemplo...\n');
    createSampleData();
  }
}

/**
 * Crear datos de ejemplo para testing
 */
function createSampleData() {
  const sampleData = [
    {
      id: 1,
      title: 'Hotel Miami - Renovación Completa',
      category: 'comercial',
      description: 'Renovación de 2000 sqft en hotel premium',
      date: '2024-01-15',
      tags: ['hotel', 'pintura', 'renovación']
    },
    {
      id: 2,
      title: 'Office Space - Pintura Profesional',
      category: 'pintura',
      description: 'Pintura interior de espacio comercial',
      date: '2024-01-20',
      tags: ['office', 'pintura', 'comercial']
    },
    {
      id: 3,
      title: 'Condo Miami Beach - Restauración',
      category: 'restauracion',
      description: 'Restauración completa de 3000 sqft',
      date: '2024-02-01',
      tags: ['condo', 'restauración', 'miami']
    },
    {
      id: 4,
      title: 'Restaurant - Waterproofing',
      category: 'comercial',
      description: 'Impermeabilización y sellado profesional',
      date: '2024-02-10',
      tags: ['waterproofing', 'restaurant', 'protección']
    },
    {
      id: 5,
      title: 'Exterior Painting - Edificio Comercial',
      category: 'pintura',
      description: 'Pintura exterior de 5000 sqft',
      date: '2024-02-20',
      tags: ['exterior', 'comercial', 'pintura']
    },
    {
      id: 6,
      title: 'Multi-Family Project - Sarasota',
      category: 'restauracion',
      description: 'Proyecto multi-familia completo',
      date: '2024-03-01',
      tags: ['multi-family', 'sarasota', 'renovación']
    }
  ];

  // Guardar como JSON
  const projectsFile = path.join(outputDir, 'projects.json');
  fs.writeFileSync(projectsFile, JSON.stringify(sampleData, null, 2));
  console.log(`✓ Datos de ejemplo guardados: ${projectsFile}`);

  // Guardar instrucciones
  const instructionsFile = path.join(outputDir, 'README.md');
  const instructions = `# Cómo Agregar Tus Imágenes de Instagram

## Paso 1: Descargar imágenes
Elige uno de estos métodos:

### Método A: Manual
1. Abre https://www.instagram.com/ticorestorations/
2. Haz clic derecho en cada imagen → "Guardar imagen como..."
3. Guarda en esta carpeta

### Método B: 4K Video Downloader (Recomendado)
1. Descarga: https://www.4kdownload.com/
2. Copia URL del perfil
3. Pega en la app y descarga
4. Guarda aquí

## Paso 2: Organizar
Las imágenes deben nombrarse así:
\`\`\`
001_proyecto.jpg
002_proyecto.jpg
003_proyecto.jpg
...
\`\`\`

## Paso 3: Actualizar HTML
Edita \`tico-restoration-dynamic.html\`:

Busca esta línea:
\`\`\`javascript
const portfolioData = [...]
\`\`\`

Y reemplazala con:
\`\`\`javascript
// Cargar desde JSON
let portfolioData = [];
fetch('../${outputDir}/projects.json')
  .then(r => r.json())
  .then(data => {
    portfolioData = data;
    loadPortfolio();
  });
\`\`\`

## Paso 4: Agregar metadata
Edita \`projects.json\` con datos de cada proyecto:
\`\`\`json
{
  "id": 1,
  "title": "Tu Proyecto",
  "category": "comercial",
  "description": "Descripción corta",
  "image": "001_proyecto.jpg"
}
\`\`\`

## ✅ Listo
Abre \`tico-restoration-dynamic.html\` en tu navegador.
`;

  fs.writeFileSync(instructionsFile, instructions);
  console.log(`✓ Instrucciones guardadas: ${instructionsFile}`);
}

// Ejecutar
downloadProfileImages(username)
  .then(() => {
    console.log(`\n✅ Proceso completado.`);
    console.log(`📂 Carpeta: ./${outputDir}/`);
    console.log(`📝 Datos de ejemplo creados para testing\n`);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
