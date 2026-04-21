# TICO RESTORATION — Especificaciones de Diseño Web

**Documento:** Design Specification & Visual Guide  
**Versión:** 1.0  
**Fecha:** 21 de Abril, 2026

---

## 🎨 Sistema de Diseño

### **Paleta de Colores**

```
Primary:
├── Deep Blue: #003366 (Confianza, profesionalismo)
│   └── Uso: Headers, botones CTA, backgrounds
│
├── Light Blue: #E8F4F8 (Backgrounds, overlays)
│   └── Uso: Section backgrounds, cards hover
│
├── Accent Orange: #FF6B35 (Energía, acción)
│   └── Uso: CTAs, hover states, highlights

Neutros:
├── Dark Gray: #1A1A1A (Texto principal)
├── Medium Gray: #666666 (Texto secundario)
├── Light Gray: #F5F5F5 (Backgrounds)
└── White: #FFFFFF (Borrador limpio)
```

### **Tipografía**

```
Display Headings (H1-H2):
├── Font: Playfair Display (serif, premium)
├── Weight: 700 (bold)
├── Size: H1 = 48px desktop, 32px mobile
├── Line Height: 1.2
└── Color: #003366

Body Text:
├── Font: Inter (sans-serif, moderna)
├── Weight: 400 (regular)
├── Size: 16px desktop, 14px mobile
├── Line Height: 1.6
└── Color: #1A1A1A

CTA Buttons:
├── Font: Inter
├── Weight: 600 (semibold)
├── Size: 14px
├── Text: ALL CAPS, letter-spacing +1px
└── Color: #FFFFFF sobre #FF6B35
```

### **Componentes de Iconografía**

```
Style: Line icons, 24-48px, stroke-width 2px

Icons utilizados:
├── 🏗️ Building (Renovación)
├── 🎨 Palette (Pintura)
├── 💧 Droplet (Waterproofing)
├── ✓ Check (Garantía)
├── 📱 Phone (Contacto)
└── 📍 Location (Ubicación)
```

---

## 📐 Estructura de Grilla

### **Desktop (1200px+)**
```
[Margin 40px] [Content Grid 12 col] [Margin 40px]
              └─ Column width: 80px
              └─ Gutter: 20px
```

### **Tablet (768px-1199px)**
```
[Margin 24px] [Content Grid 8 col] [Margin 24px]
              └─ Column width: 64px
              └─ Gutter: 16px
```

### **Mobile (<768px)**
```
[Margin 16px] [Content Grid 1 col] [Margin 16px]
              └─ 100% width
```

---

## 🏠 PÁGINA: HOME

### **Sección 1: HERO (100vh)**

**Layout:**
```
┌───────────────────────────────────────┐
│ Background: Video background          │
│ overlay: gradient #003366 (80% opacity)
│                                        │
│          ┌────────────────────────┐   │
│          │  "Transformamos        │   │
│          │   Espacios             │   │
│          │   Comerciales"         │   │
│          │                        │   │
│          │  Tagline:             │   │
│          │  "Pintura | Restaur.  │   │
│          │   | Waterproofing"    │   │
│          │                        │   │
│          │  [VER PORTFOLIO] ──┐  │   │
│          │  [PRESUPUESTO]    ──┤  │   │
│          └────────────────────────┘   │
└───────────────────────────────────────┘
```

**Especificaciones:**
- H1: "Transformamos Espacios Comerciales" (Playfair Display, 56px)
- Subheadline: "11 años transformando negocios en Florida" (Inter, 18px, #E8F4F8)
- Video background: Auto-play, muted, loop (MP4 optimizado)
- Botones: CTA primario (#FF6B35) + secundario (outline)
- Scroll cue: "↓ Scroll para ver más" (fade-in animation)

**Media Query:**
- Desktop: Video background
- Tablet: Video con overlay más opaco
- Mobile: Static image instead video (+ performance)

---

### **Sección 2: FEATURED PROJECTS (Full width)**

**Layout:** Grid 3 columnas (12 col desktop)

```
┌──────────────────────────────────────────────────┐
│ "PROYECTOS DESTACADOS"                          │
│                                                  │
│ ┌──────────────┐  ┌──────────────┐ ┌──────────┐ │
│ │ Before/After │  │ Before/After │ │ Before/  │ │
│ │ Carousel     │  │ Carousel     │ │ After    │ │
│ │              │  │              │ │          │ │
│ │ Hotel Miami  │  │ Office Space │ │ Restaurant
│ │ Renovation   │  │ Painting     │ │ Restore  │ │
│ │ ───────────  │  │ ───────────  │ │ ──────── │ │
│ │ Scope:       │  │ Scope:       │ │ Scope:   │ │
│ │ 2000 sqft    │  │ 5000 sqft    │ │ 3000 sqft│ │
│ │              │  │              │ │          │ │
│ │ [Ver Detalle]│  │ [Ver Detalle]│ │ [Ver Det]│ │
│ └──────────────┘  └──────────────┘ └──────────┘ │
│                                                  │
│                   [VER TODOS LOS PROYECTOS]     │
└──────────────────────────────────────────────────┘
```

**Componentes:**
- Card width: 4 columnas (desktop), 6 columnas (tablet), 12 (mobile)
- Imagen before/after: Swiper.js (interactive slider)
- Hover effect: Overlay oscuro + "Ver Detalle" link
- Project meta: Nombre, ubicación, tipo servicio

---

### **Sección 3: SERVICIOS (4 Cards)**

**Layout:** 4 columnas equidistantes

```
┌────────────────────────────────────────────────────┐
│ "QUÉ OFRECEMOS"                                    │
│                                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ │ 🎨       │ │ 🏗️       │ │ 💧       │ │ ✓      │ │
│ │ PINTURA  │ │RENOVACIÓN│ │WATERPROOF│ │GARANTÍA│ │
│ │          │ │          │ │          │ │        │ │
│ │Interior/ │ │Condo |   │ │Roofing | │ │10 años │ │
│ │Exterior  │ │Comercial │ │Siding    │ │coverge │ │
│ │          │ │          │ │          │ │        │ │
│ │[+Info]   │ │[+Info]   │ │[+Info]   │ │[+Info] │ │
│ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└────────────────────────────────────────────────────┘
```

**Card Specs:**
- Background: Blanco con border-bottom 4px #FF6B35
- Icono: 48px, centered, color #FF6B35
- Heading: Inter 18px bold, #003366
- Description: 14px, gray, max 100 chars
- Hover: Shadow increase + bg light blue

---

### **Sección 4: STATS**

**Layout:** 4 columnas, números grandes

```
┌───────────────────────────────────────┐
│     200+        |     98%      |   11+  │
│   PROYECTOS     │  SATISFACCIÓN  │ AÑOS   │
│   COMPLETADOS   │   CLIENTES     │ OPERANDO
│                                      │
│     50+         |   24/7         |   5+   │
│  RESTAURADORES  │   DISPONIBLES  │ CERTIFICAC
│                                      │
└───────────────────────────────────────┘
```

**Estilo:**
- Números: Playfair Display 42px, bold, #FF6B35
- Labels: Inter 14px, uppercase, #666666
- Layout: Dark blue background (#003366), white text

---

### **Sección 5: TESTIMONIOS (Carousel)**

**Layout:** Carousel horizontal, 1 visible

```
┌──────────────────────────────────────┐
│ "CLIENTES SATISFECHOS"              │
│                                      │
│ ┌────────────────────────────────┐  │
│ │  ⭐⭐⭐⭐⭐                        │  │
│ │  "Excelente trabajo, muy       │  │
│ │   profesional. Recomendado"    │  │
│ │                                │  │
│ │  — Juan Pérez                  │  │
│ │    Hotel Miami Beach Owner     │  │
│ │                                │  │
│ │  [← Previous] | [Next →]       │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Carousel:**
- Swiper.js con autoplay (7s)
- Navigation arrows + dots
- Mobile: Full-width card

---

### **Sección 6: CTA FINAL (Call-to-Action)**

**Layout:** Banner full-width oscuro

```
┌──────────────────────────────────────┐
│ ¿Listo para transformar tu espacio?  │
│                                      │
│   [SOLICITAR PRESUPUESTO GRATIS]    │
│                                      │
│   📞 Llamar: (941) 302-2837         │
└──────────────────────────────────────┘
```

**Estilo:**
- Background: #003366
- Text: White, centered
- Button: Large, orange, hover effect
- Spacing: Padding 60px vertical

---

## 🖼️ PÁGINA: PORTFOLIO

### **Header Sección**

```
┌────────────────────────────────────────┐
│ "NUESTROS PROYECTOS"                   │
│ Explorar 50+ transformaciones de éxito │
└────────────────────────────────────────┘
```

### **Filter Tabs**

```
┌─────────────────────────────────────┐
│ [TODO] [COMERCIAL] [PINTURA]        │
│ [RESTAURACIÓN] [WATERPROOFING]      │
└─────────────────────────────────────┘
(Underline animation en active)
```

### **Gallery Grid**

```
┌─────────────────────────────────────┐
│  Desktop: 3 columnas (4 col c/card) │
│  Tablet:  2 columnas (6 col c/card) │
│  Mobile:  1 columna  (12 col)       │
│                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Image  │ │ Image  │ │ Image  │   │
│ │ (1:1)  │ │ (1:1)  │ │ (1:1)  │   │
│ │        │ │        │ │        │   │
│ │ Title  │ │ Title  │ │ Title  │   │
│ │ Type   │ │ Type   │ │ Type   │   │
│ └────────┘ └────────┘ └────────┘   │
│                                     │
│           [CARGAR MÁS]              │
└─────────────────────────────────────┘
```

### **Project Card Detail**

```
┌──────────────────────────┐
│                          │
│  [Imagen 1:1]            │
│                          │
│  ┌──────────────────────┐│
│  │ Before/After Toggle  ││
│  │ (Click para cambiar) ││
│  └──────────────────────┘│
│                          │
│  Hotel Miami Beach       │
│  Restoration Project     │
│                          │
│  📍 Miami, FL            │
│  🏷️ Commercial Renovation
│                          │
│  Scope: $50,000+         │
│  Duration: 3 months      │
│  Sq Ft: 2,000            │
│                          │
│  Descripción breve del   │
│  proyecto y resultados   │
│  (140 caracteres max)    │
│                          │
│  [VER CASO COMPLETO →]   │
└──────────────────────────┘
```

---

## 🔧 PÁGINA: SERVICIOS (Ejemplo: Pintura)

### **Hero Section**

```
┌────────────────────────────────────────┐
│ Fondo: Imagen impactante de proyecto   │
│                                        │
│        "SERVICIOS DE PINTURA"          │
│        Interior | Exterior | Specialty │
│                                        │
│     [SOLICITAR PRESUPUESTO]            │
└────────────────────────────────────────┘
```

### **Contenido**

```
┌────────────────────────────────────────┐
│ 1. Descripción Detallada (800 words)   │
│    ├─ Qué incluye el servicio          │
│    ├─ Beneficios                       │
│    └─ Casos de uso                     │
│                                        │
│ 2. Proceso (4 pasos)                   │
│    ├─ 1️⃣ Evaluación → 2️⃣ Presupuesto   │
│    ├─ 3️⃣ Ejecución → 4️⃣ Inspección    │
│    └─ Timeline + estimados             │
│                                        │
│ 3. Galería (8-12 imágenes)             │
│    ├─ Grid 3 columnas                  │
│    ├─ Antes/Después cards              │
│    └─ Lightbox modal on click          │
│                                        │
│ 4. Testimonial Card                    │
│    ├─ Cliente: "Excelente trabajo"     │
│    ├─ Rating: ⭐⭐⭐⭐⭐ (5 stars)      │
│    └─ Nombre + empresa                 │
│                                        │
│ 5. CTA Banner                          │
│    └─ [PRESUPUESTO GRATIS]             │
└────────────────────────────────────────┘
```

---

## 📞 PÁGINA: CONTACTO

### **Formulario**

```
┌───────────────────────────────────────┐
│ "¿Listo para comenzar?"                │
│                                        │
│ 📝 Formulario:                         │
│ ┌─────────────────────────────────┐  │
│ │ Nombre *                         │  │
│ │ Email *                          │  │
│ │ Teléfono *                       │  │
│ │                                 │  │
│ │ Tipo de Proyecto                │  │
│ │ [ Comercial ▼ ]                 │  │
│ │                                 │  │
│ │ Presupuesto Estimado            │  │
│ │ [ $0 ────────── $100,000 ]      │  │
│ │                                 │  │
│ │ Descripción del Proyecto        │  │
│ │ ┌─────────────────────────────┐ │  │
│ │ │ Cuéntanos sobre tu proyecto │ │  │
│ │ │ (min 20 caracteres)        │ │  │
│ │ └─────────────────────────────┘ │  │
│ │                                 │  │
│ │ ☐ Deseo recibir actualizaciones │  │
│ │                                 │  │
│ │    [ENVIAR CONSULTA]            │  │
│ └─────────────────────────────────┘  │
│                                        │
│ Validación:                            │
│ ├─ Required fields (*)               │
│ ├─ Email validation (RFC 5322)       │
│ ├─ Phone formatting (+1 XXXXX)       │
│ └─ Success message: "Gracias,        │
│    responderemos en 24 horas"        │
└───────────────────────────────────────┘
```

### **Información de Contacto**

```
Lado derecho del formulario (Desktop) / Abajo (Mobile)

┌─────────────────────────────────────┐
│ 📍 UBICACIÓN                         │
│ 1646 Clark Center Ave Unit B         │
│ Sarasota, FL 34238, USA              │
│                                      │
│ 📞 TELÉFONO                          │
│ (941) 302-2837                       │
│                                      │
│ 📧 EMAIL                             │
│ service@ticorestorations.com         │
│                                      │
│ ⏰ HORARIO                            │
│ Lunes - Viernes: 8:00 AM - 6:00 PM   │
│ Sábados: 9:00 AM - 2:00 PM           │
│ Domingos: Cerrado                    │
│                                      │
│ [GOOGLE MAP EMBED - Sarasota]        │
└─────────────────────────────────────┘
```

---

## ⚙️ INTERACCIONES & ANIMACIONES

### **Scroll Animations**
```
- Fade-in on scroll (opacity + translate)
- Stagger effect en grillas (cards con delay)
- Parallax subtle en hero section
- Scroll progress bar (top de página)
```

### **Hover Effects**
```
Portfolio cards:
├── Shadow increase
├── Image zoom (1.05x)
└── Overlay oscuro + "Ver Detalle"

Buttons:
├── Background color change
├── Shadow depth increase
└── Slight scale (1.02x)

Links:
├── Underline animation (bottom-to-top)
└── Color change a accent orange
```

### **Form Interactions**
```
Inputs:
├── Focus: Border color → #FF6B35
├── Label animation: Mueve hacia arriba
├── Validation: Icono checkmark verde
└── Error: Text rojo + ⚠️ icono

Submit Button:
├── Disabled state: Opacity 0.5, cursor not-allowed
├── Loading: Spinner animation
└── Success: Checkmark animation + redirect
```

### **Image Loading**
```
- Blur-up effect: LQIP (Low Quality Image Placeholder)
- Skeleton loaders en mobile
- Lazy loading (Intersection Observer)
- WebP con fallback JPG
```

---

## 📱 Responsive Design Checklist

### **Mobile (<768px)**
- [ ] Stack vertical (1 columna)
- [ ] Botones full-width (menos en grupos)
- [ ] Tipografía reducida (H1: 32px)
- [ ] Espaciado reducido (padding/margin -20%)
- [ ] Hamburger menu (desktop nav hidden)
- [ ] Imágenes: 100vw width, optimizadas
- [ ] Formulas: 1 input per row

### **Tablet (768px-1199px)**
- [ ] 2-3 columnas (ajuste grid)
- [ ] Tipografía media (H1: 40px)
- [ ] Espaciado balanceado
- [ ] Touch-friendly buttons (min 48px)

### **Desktop (1200px+)**
- [ ] 3-4 columnas (full layout)
- [ ] Tipografía grande (H1: 48-56px)
- [ ] Hover effects activos
- [ ] Máximo contenedor: 1400px

---

## 🎬 Loading States & Edge Cases

```
Skeleton Loaders:
├── Portfolio grid: Pulse animation
├── Testimonial carousel: Placeholder bars
└── Form submit: Loading spinner

Error States:
├── Form validation: Input rojo + mensaje
├── Network error: Retry button
└── 404 Page: Imagen + link home

Empty States:
├── No proyectos (si filtro no tiene resultados)
├── Portfolio vacío: Mensaje + CTA
└── Contacto enviado: Success modal
```

---

## ✅ Performance Target

```
Lighthouse Scores (Target):
├── Performance: 90+
├── Accessibility: 95+
├── Best Practices: 95+
└── SEO: 100

Page Speed:
├── First Contentful Paint (FCP): < 1.5s
├── Largest Contentful Paint (LCP): < 2.5s
├── Cumulative Layout Shift (CLS): < 0.1
└── Time to Interactive (TTI): < 3s

File Sizes:
├── Homepage: < 200KB gzipped
├── Images: < 100KB (WebP optimized)
└── Critical CSS: Inline (< 10KB)
```

---

*Especificaciones de Diseño v1.0*  
*Autor: StratosCore HQ*  
*Última actualización: 21-04-2026*
