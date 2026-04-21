# Cómo Descargar Contenido de Instagram de TICO RESTORATION

**Objetivo:** Extraer todas las imágenes y videos de Instagram para construir la página web profesional.

---

## 🚀 Opción 1: Descargar Manualmente (Más Fácil)

Si no quieres usar herramientas de programación, puedes descargar manualmente:

### Paso 1: Abrir el Perfil
```
https://www.instagram.com/ticorestorations/
```

### Paso 2: Descargar 1 por 1
1. Haz click en cada post
2. Haz click derecho en la imagen → "Guardar imagen como..."
3. Guarda en carpeta `tico_instagram/`

**⏱️ Tiempo:** ~30 min para 40+ imágenes

---

## 🛠️ Opción 2: Usar Herramienta Online (Recomendado)

### Usar: 4K Video Downloader
**Sitio:** https://www.4kdownload.com/products/product-videodownloader

**Pasos:**
1. Descarga e instala
2. Copia URL del perfil
3. Pega en la app
4. Click "Descargar"
5. Selecciona resolución máxima
6. ✅ Listo

**⏱️ Tiempo:** 5 min

---

## 💻 Opción 3: Script Python (Automático)

**Requisitos:**
```bash
pip install instagrapi Pillow
```

**Crear archivo:** `download_instagram.py`

```python
from instagrapi import Client
import os

username = "ticorestorations"
output_dir = "tico_instagram"
os.makedirs(output_dir, exist_ok=True)

cl = Client()
# NOTA: Necesita login con credenciales válidas
# Para evitar restricciones, mejor usa herramienta graphql

# Alternativa sin login: Usar Instagram Graph API
```

**Ejecutar:**
```bash
python download_instagram.py
```

---

## 📁 Estructura de Carpetas Esperada

Después de descargar, organiza así:

```
tico_instagram/
├── 001_hotel_miami.jpg
├── 002_office_painting.jpg
├── 003_condo_restoration.jpg
├── 004_waterproofing.jpg
├── 005_exterior_paint.jpg
└── 006_multi_family.jpg
```

---

## 🖼️ Cómo Integrar en la Página Web

### Método 1: Carpeta Local (Para Testing)

1. Guarda las imágenes en carpeta `images/`
2. Edita el HTML (tico-restoration-dynamic.html):

```javascript
// Reemplaza esto:
const portfolioData = [
    {
        id: 1,
        title: "Hotel Miami",
        image: "https://via.placeholder.com/400x300"
    }
];

// Con esto:
const portfolioData = [
    {
        id: 1,
        title: "Hotel Miami",
        image: "images/001_hotel_miami.jpg"
    }
];
```

### Método 2: Subir a Servidor (Producción)

1. **Opción A:** Vercel + GitHub
```bash
git add images/
git commit -m "Add Instagram portfolio images"
git push
# Auto-deploy a vercel.com
```

2. **Opción B:** Supabase Storage
```javascript
// Subir imágenes a Supabase Storage
const { data, error } = await supabase
  .storage
  .from('tico-portfolio')
  .upload('public/001.jpg', file)
```

3. **Opción C:** Cloudinary (Recomendado)
- Signup: https://cloudinary.com/
- Carga automática desde Instagram (tiene integración)
- URLs optimizadas automáticamente

---

## 🤖 Opción 4: Script Node.js (Avanzado)

### Instalar:
```bash
npm install insta-fetcher axios sharp
```

### Crear `scraper.js`:
```javascript
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Usar API pública (sin auth)
const scrapeInstagram = async (username) => {
  try {
    const response = await axios.get(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const medias = response.data.data.user.edge_owner_to_timeline_media.edges;

    // Crear carpeta
    if (!fs.existsSync('tico_instagram')) {
      fs.mkdirSync('tico_instagram');
    }

    // Descargar imágenes
    for (const [idx, edge] of medias.entries()) {
      const node = edge.node;
      const imageUrl = node.display_url;
      const filename = `${String(idx + 1).padStart(3, '0')}_tico.jpg`;

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(path.join('tico_instagram', filename), response.data);

      console.log(`✓ Descargado: ${filename}`);
    }

    console.log('✅ Descarga completada!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

scrapeInstagram('ticorestorations');
```

### Ejecutar:
```bash
node scraper.js
```

---

## 📊 Metadata: Información de Cada Post

Para incluir títulos y descripciones, captura también:

```python
{
    "id": 1,
    "title": "Hotel Miami Renovation",
    "category": "comercial",
    "description": "Renovación completa de 2000 sqft",
    "date": "2024-01-15",
    "likes": 120,
    "comments": 8,
    "image_url": "path/to/image.jpg"
}
```

**Guardar como JSON:**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Hotel Miami",
      "description": "...",
      "image": "001.jpg",
      "category": "comercial"
    }
  ]
}
```

Luego en HTML:
```javascript
fetch('projects.json')
  .then(r => r.json())
  .then(data => {
    portfolioData = data.projects;
    loadPortfolio();
  });
```

---

## ✅ Checklist Final

- [ ] Descargadas todas las imágenes de Instagram
- [ ] Organizadas en carpeta `tico_instagram/`
- [ ] Imágenes redimensionadas (max 1200px ancho)
- [ ] Comprimidas (max 100KB por imagen)
- [ ] Metadata capturada (título, descripción, categoría)
- [ ] HTML actualizado con rutas correctas
- [ ] Testeado localmente
- [ ] Subido a servidor (Vercel/GitHub)

---

## 🎨 Optimización de Imágenes

### Comprimir para Web:

**Con ImageMagick:**
```bash
convert input.jpg -quality 85 -resize 1200x output.jpg
```

**Con ffmpeg:**
```bash
ffmpeg -i input.jpg -q:v 5 output.jpg
```

**Convertir a WebP (mejor compresión):**
```bash
cwebp -q 80 input.jpg -o output.webp
```

---

## 🚀 Deploying

### Opción 1: Vercel (Recomendado)
```bash
npm install -g vercel
vercel
# Sigue los pasos
```

### Opción 2: GitHub Pages
```bash
git add .
git commit -m "Deploy TICO website"
git push origin main
# Settings → Pages → Deploy
```

### Opción 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

---

## 📞 Soporte

**Si tienes problemas:**
1. Verifica que las imágenes existan en la carpeta
2. Revisa la consola (F12 → Console) para errores
3. Asegúrate de usar rutas relativas correctas: `images/001.jpg`
4. Prueba con URLs de placeholder primero

---

**Próximo paso:** Una vez tengas las imágenes descargadas, comparte la carpeta para integrarlas en la página web dinámica.
