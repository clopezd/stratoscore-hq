# MedCare — Assets fuente

Carpeta con archivos originales del cliente MedCare. **Estos archivos NO se commitean** (ver `.gitignore`), son referencia local únicamente.

Los derivados optimizados que sí se sirven al usuario viven en `business-os/public/medcare/`.

## Estructura

```
assets/
├── brand-book/          ← Libro de marca oficial de MedCare (Pantone, tipografías, logos)
├── brand-mamografo/     ← Lineamientos de marca del fabricante del mamógrafo (Fujifilm Sophinity)
├── fotos-reales/        ← Fotos del centro, equipo médico, instalaciones
└── README.md
```

## Flujo de trabajo

1. **Llegan archivos nuevos** → se ponen en la subcarpeta correspondiente
2. **Se procesan/optimizan** → salen variantes (JPG/PNG web, tamaños redimensionados, WebP)
3. **Los derivados se copian a** `public/medcare/` → allí sí se commitean porque son livianos
4. **Las referencias en código** van a `public/medcare/archivo.ext`, nunca a `assets/`

## Archivos actuales

### brand-book/
- `LIBRO-DE-MARCA-MEDCARE.pdf` — 123 MB, Noviembre 2022 (extraído: colores Pantone 7621 C + Black 6 C + 538 C + 642 C, tipografías Montserrat + Encode Sans, variantes de logo horizontal/vertical, área de seguridad, normas de uso)

### brand-mamografo/
- _(pendiente que el cliente entregue)_

### fotos-reales/
- _(pendiente que el cliente entregue)_
