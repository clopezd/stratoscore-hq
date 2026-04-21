# Cómo Agregar Tus Imágenes de Instagram

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
```
001_proyecto.jpg
002_proyecto.jpg
003_proyecto.jpg
...
```

## Paso 3: Actualizar HTML
Edita `tico-restoration-dynamic.html`:

Busca esta línea:
```javascript
const portfolioData = [...]
```

Y reemplazala con:
```javascript
// Cargar desde JSON
let portfolioData = [];
fetch('../tico_instagram/projects.json')
  .then(r => r.json())
  .then(data => {
    portfolioData = data;
    loadPortfolio();
  });
```

## Paso 4: Agregar metadata
Edita `projects.json` con datos de cada proyecto:
```json
{
  "id": 1,
  "title": "Tu Proyecto",
  "category": "comercial",
  "description": "Descripción corta",
  "image": "001_proyecto.jpg"
}
```

## ✅ Listo
Abre `tico-restoration-dynamic.html` en tu navegador.
