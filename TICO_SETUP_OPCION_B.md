# TICO RESTORATION - Setup Opción B (Automático)

**Objetivo:** Descargar automáticamente imágenes de Instagram y construir la página web.

---

## 🚀 Método 1: Ejecutar Script de Setup (Recomendado)

### Paso 1: Abre Terminal
```bash
cd /home/user/stratoscore-hq
```

### Paso 2: Ejecuta el Setup
```bash
bash SETUP_TICO.sh
```

**Esto hará automáticamente:**
- ✅ Crea carpetas necesarias
- ✅ Instala dependencias (si es necesario)
- ✅ Genera datos de ejemplo
- ✅ Crea página de inicio

**Tiempo:** ~2 minutos

---

## 🖼️ Método 2: Descargar Imágenes (4K Video Downloader)

Este es el método **más recomendado** porque es rápido, legal y 100% seguro.

### Paso 1: Descargar la Herramienta
👉 **https://www.4kdownload.com/products/product-videodownloader**

Selecciona tu SO:
- 🖥️ Windows
- 🍎 macOS  
- 🐧 Linux

### Paso 2: Instalar
```bash
# En Linux:
wget https://dl.4kdownload.com/app/4kvideodownloaderfree_latest.tar.bz2
tar -xjf 4kvideodownloaderfree_latest.tar.bz2
```

### Paso 3: Copiar URL del Perfil
```
https://www.instagram.com/ticorestorations/
```

### Paso 4: Descargar con 4K Video Downloader
1. Abre la app
2. Pega la URL
3. Click "Descargar"
4. Selecciona **máxima calidad** (1920x1080)
5. Carpeta destino: `/home/user/stratoscore-hq/tico_instagram/images/`

**⏱️ Tiempo:** ~5 minutos para 40+ imágenes

---

## 📁 Método 3: Descargar Manualmente

Si prefieres hacerlo tú mismo:

### Paso 1: Crear Carpeta
```bash
mkdir -p tico_instagram/images
```

### Paso 2: Abrir Instagram
```
https://www.instagram.com/ticorestorations/
```

### Paso 3: Descargar Cada Imagen
```
Haz clic derecho en imagen → "Guardar imagen como..."
Guarda en: tico_instagram/images/
Nombra: 001_proyecto.jpg, 002_proyecto.jpg, etc.
```

**⏱️ Tiempo:** ~30 minutos para 40+ imágenes

---

## ✅ Después de Descargar: Estructura de Carpetas

Debería verse así:
```
stratoscore-hq/
├── tico_instagram/
│   ├── images/
│   │   ├── 001_hotel.jpg
│   │   ├── 002_office.jpg
│   │   ├── 003_condo.jpg
│   │   ├── 004_restaurant.jpg
│   │   ├── 005_exterior.jpg
│   │   └── 006_multi_family.jpg
│   └── projects.json
├── docs/
│   ├── tico-restoration-dynamic.html
│   ├── tico-restoration-prp.html
│   └── COMO-DESCARGAR-INSTAGRAM.md
├── index.html
└── SETUP_TICO.sh
```

---

## 🌐 Ver la Página Web

### Opción 1: Doble-Click (Lo más fácil)
```
Abre: /home/user/stratoscore-hq/index.html
```

### Opción 2: Servidor Local (Recomendado)
```bash
cd /home/user/stratoscore-hq
python3 -m http.server 8000
```

Luego abre en navegador:
```
http://localhost:8000
```

### Opción 3: Abrir Directamente
```bash
open docs/tico-restoration-dynamic.html
# o en Linux:
firefox docs/tico-restoration-dynamic.html
```

---

## 🎨 Personalizar la Página

### Actualizar Títulos y Descripciones

**Edita:** `tico_instagram/projects.json`

```json
{
  "projects": [
    {
      "id": 1,
      "title": "Hotel Miami - Renovación Completa",
      "category": "comercial",
      "description": "Renovación de 2000 sqft en hotel premium",
      "image": "001_hotel.jpg"
    },
    {
      "id": 2,
      "title": "Office Space - Pintura Profesional",
      "category": "pintura",
      "description": "Pintura interior de espacio comercial",
      "image": "002_office.jpg"
    }
  ]
}
```

### Cambiar Colores

**Edita:** `docs/tico-restoration-dynamic.html`

Busca:
```javascript
:root {
    --primary: #003366;    /* Azul oscuro */
    --accent: #FF6B35;     /* Naranja */
}
```

Cambia a tus colores:
```javascript
:root {
    --primary: #1a1a1a;    /* Nuevo azul */
    --accent: #00cc66;     /* Nuevo accent */
}
```

### Cambiar Información de Contacto

Busca en HTML:
```html
<p><strong>(941) 302-2837</strong></p>
<p><strong>service@ticorestorations.com</strong></p>
<p><strong>Sarasota, Florida</strong></p>
```

Reemplaza con tu información.

---

## 📊 Arquitectura Técnica

```
┌─────────────────────────────────┐
│   Instagram (@ticorestorations) │
└──────────────┬──────────────────┘
               │
               ↓ (Descargar)
┌─────────────────────────────────┐
│   Carpeta: tico_instagram/      │
│   └─ images/ (40+ fotos)        │
│   └─ projects.json (metadata)   │
└──────────────┬──────────────────┘
               │
               ↓ (Cargar)
┌─────────────────────────────────┐
│   HTML Dinámico                 │
│   tico-restoration-dynamic.html │
│   └─ Carga imágenes + metadata  │
│   └─ Filtros por categoría      │
│   └─ Lightbox interactivo       │
└──────────────┬──────────────────┘
               │
               ↓ (Mostrar)
┌─────────────────────────────────┐
│   NAVEGADOR                     │
│   Portfolio profesional ✨      │
└─────────────────────────────────┘
```

---

## 🔍 Verificar que Funcione

### Checklist:

- [ ] Carpeta `tico_instagram/images/` contiene imágenes
- [ ] Archivo `tico_instagram/projects.json` existe
- [ ] Abres `index.html` en navegador
- [ ] Ves 2 botones: "Ver PRP" y "Ver Portfolio"
- [ ] Click en "Ver Portfolio" muestra las imágenes
- [ ] Filtros funcionan (Todos, Comercial, Pintura, etc.)
- [ ] Click en imagen abre lightbox
- [ ] Formulario de contacto funciona

Si algo no funciona:
1. Abre consola (F12 → Console)
2. Busca errores rojo
3. Verifica rutas de imágenes

---

## 🚨 Problemas Comunes

### Problema: Las imágenes no se cargan

**Solución:**
1. Verifica que las imágenes están en `tico_instagram/images/`
2. En `projects.json`, revisa que `"image": "001.jpg"` sea correcto
3. Si usas servidor local, recarga (Ctrl+Shift+R)

### Problema: "projects.json not found"

**Solución:**
```bash
node scripts/instagram_downloader.js ticorestorations
```

Esto regenera el archivo.

### Problema: Instagram bloquea la descarga

**Solución:**
Usa **4K Video Downloader** en lugar de script (más confiable).

---

## 📈 Próximos Pasos

### 1. Una vez tengas las imágenes:
```bash
# Optimizar (opcional pero recomendado)
for img in tico_instagram/images/*.jpg; do
  convert "$img" -quality 85 -resize 1200x "$img"
done
```

### 2. Deploy a Vercel (Gratuito)
```bash
npm i -g vercel
vercel
```

### 3. Deploy a GitHub
```bash
git add .
git commit -m "Add TICO RESTORATION portfolio"
git push origin main
```

---

## 💡 Tips Finales

**Optimizar imágenes para web:**
```bash
# Instalar herramientas
sudo apt-get install imagemagick

# Comprimir todas
for f in tico_instagram/images/*.jpg; do
  convert "$f" -quality 80 -resize 1200x "$f"
done
```

**Convertir a WebP (mejor compresión):**
```bash
sudo apt-get install webp
cwebp -q 80 imagen.jpg -o imagen.webp
```

**Servir HTTPS localmente (testing):**
```bash
python3 -m http.server --directory . --cgi 8000
```

---

## ✅ Checklist Final

- [x] Scripts creados y listos
- [x] Página dinámica funcionando
- [ ] **Tú:** Ejecuta SETUP_TICO.sh
- [ ] **Tú:** Descarga imágenes de Instagram
- [ ] **Tú:** Abre en navegador
- [ ] **Tú:** Personaliza colores/textos
- [ ] **Tú:** Deploy a Vercel/GitHub

---

## 📞 Contacto

Si necesitas ayuda:
1. Lee `docs/COMO-DESCARGAR-INSTAGRAM.md`
2. Revisa consola del navegador (F12)
3. Verifica rutas de archivos

**¡Listo para empezar! 🚀**
