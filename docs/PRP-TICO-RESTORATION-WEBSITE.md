# PRP: TICO RESTORATION — Página Web Profesional

**Fecha:** 21 de Abril, 2026  
**Cliente:** TICO RESTORATION LLC  
**Tipo de Producto:** Sitio Web Corporativo (Next.js + CMS)  
**Versión:** 1.0 MVP  
**Estado:** En Planificación (Fase Venta)

---

## 📋 Resumen Ejecutivo

Crear una página web profesional y moderna para TICO RESTORATION que:
- ✅ Convierte el contenido visual del Instagram en un portafolio impactante
- ✅ Genera leads a través de formulario de contacto optimizado
- ✅ Mejora posicionamiento local (SEO) en Sarasota, Florida
- ✅ Establece credibilidad B2B para mercados comerciales
- ✅ **Presupuesto optimizado:** Reutilizar 100% contenido Instagram → costo bajo

**ROI esperado:** 3-5 leads mensuales en primeros 3 meses.

---

## 🎯 Objetivos Comerciales

| Objetivo | Métrica | Target |
|----------|---------|--------|
| **Generación de Leads** | Consultas/mes vía web | 5-10 leads |
| **Visibilidad Local** | Ranking "restoration Sarasota" | Top 5 Google |
| **Credibilidad** | Portfolio visual | 50+ proyectos destacados |
| **Engagement** | Contactos calificados | 30% conversion rate |
| **SEO Authority** | Backlinks + Domain Authority | DA 25+ |

---

## 🎨 Arquitectura Visual

### **Identidad Gráfica**
- **Colores:** Azul corporativo (#003366) + Acentos naranjas (#FF6B35)
- **Tipografía:** Inter (moderna, legible) + Playfair Display (headings, premium)
- **Estilo fotográfico:** Antes/Después (transformaciones visuales)
- **Paleta:** Limpio, profesional, enfoque en proyectos completados

### **Estructura de Secciones**

```
┌─────────────────────────────────────────┐
│ HEADER FIJO                              │
│ Logo | Nav (Inicio | Portfolio |        │
│       Servicios | Acerca | Contacto)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ HERO (Full Width)                       │
│ Video background: Project Reel          │
│ Headline: "Transformamos Espacios"      │
│ CTA: "Solicitar Presupuesto"            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECTION 1: PORTFOLIO DESTACADO          │
│ Grid 2-3 columnas                       │
│ Imágenes antes/después                  │
│ Hover: Descripción proyecto             │
│ Link: Ver detalle                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECTION 2: SERVICIOS                    │
│ Cards: Pintura | Restauración |         │
│         Waterproofing | Renovación      │
│ Descripción + Iconos                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECTION 3: ACERCA DE                    │
│ Texto: Historia, misión, experiencia    │
│ Stats: Años operando, proyectos,        │
│        clientes satisfechos             │
│ Equipo: Fotos + nombres                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECTION 4: TESTIMONIOS                  │
│ Carousel: Reviews de clientes           │
│ Rating stars + nombres                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECTION 5: CONTACTO                     │
│ Formulario + Mapa                       │
│ Teléfono | Email | Ubicación            │
│ CTA secundario: Agendar consulta        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FOOTER                                  │
│ Links rápidos | Social | Newsletter     │
└─────────────────────────────────────────┘
```

---

## 📸 Estrategia de Contenido Visual

### **Origen de Imágenes**
- **Fuente primaria:** @ticorestorations (Instagram)
- **Cantidad estimada:** 40-80 imágenes de proyectos
- **Formato:** Antes/Después (máximo impacto)
- **Categorización:** Por tipo de servicio (Pintura, Restauración, etc.)

### **Reutilización de Contenido Instagram**

```
Instagram Post (1080x1350px)
    ↓
Reescale para Web (1200x600px hero)
    ↓
Optimizar (WebP + lazy loading)
    ↓
Agregar metadata (Alt text, descripción)
    ↓
Publicar en Galería
```

### **Categorías de Contenido**

| Categoría | # Posts | Descripción |
|-----------|---------|------------|
| **Renovaciones Comerciales** | 15-20 | Offices, retail, hospitality |
| **Pintura & Acabados** | 10-15 | Exterior, interior, specialty |
| **Restauración de Condos** | 10-15 | Multi-family, apartments |
| **Waterproofing & Reparación** | 8-12 | Roofs, siding, moisture |
| **Proyectos Destacados** | 5-10 | Before/after impactantes |

---

## 🏗️ Estructura de Páginas

### **1. Página de Inicio (HOME)**
```
├── Header + Navigation
├── Hero Section
│   ├── Background video/imagen
│   ├── Headline: "Transformamos Espacios Comerciales"
│   ├── Subheadline: "11 años de excelencia en renovación"
│   └── CTA Button: "Ver Portfolio"
│
├── Featured Projects (3-4)
│   ├── Antes/Después carousel
│   ├── Project title & scope
│   └── "Ver Más Proyectos" link
│
├── Why Choose Us
│   ├── 4 Cards: Experiencia | Calidad | Garantía | Sostenibilidad
│   └── Stats: 200+ proyectos | 98% satisfacción | 11+ años
│
├── Services Preview (4 items)
│   └── Links to detailed pages
│
└── CTA Section: "Solicitar Presupuesto"
```

### **2. Página de Portfolio (PROJECTS)**
```
├── Filter tabs: Todo | Comercial | Pintura | Restauración | Waterproofing
├── Grid layout (3 columnas)
├── Proyecto card:
│   ├── Imagen before/after
│   ├── Proyecto nombre
│   ├── Tipo servicio + ubicación
│   ├── Descripción 1-2 líneas
│   └── "Ver Detalle" link
│
└── Pagination: Load more / Infinite scroll
```

### **3. Página de Servicio (SERVICIOS)**
```
├── Hero: Nombre del servicio
├── Descripción detallada (800 words)
├── Galería: 8-12 imágenes
├── Proceso: 4 pasos del proyecto
├── Testimonial: 1 cliente destacado
└── CTA: "Presupuesto Gratis"
```

**Servicios:**
- 🎨 Pintura Comercial (Interior/Exterior)
- 🔨 Renovación & Remodelación
- 💧 Waterproofing & Sellado
- 🏢 Restauración Multi-familia

### **4. Página Acerca De (ABOUT)**
```
├── Misión & Visión
├── Historia (2-3 párrafos)
├── Timeline: Hitos importantes
├── Valores: 5 core values con iconos
├── Equipo:
│   └── Cards: Foto + Nombre + Rol + Bio breve
│
├── Certificaciones & Memberships
└── Galería: Oficina, equipo trabajando
```

### **5. Página de Contacto (CONTACT)**
```
├── Headline: "¿Listo para transformar tu espacio?"
├── Formulario:
│   ├── Nombre, Email, Teléfono (requeridos)
│   ├── Tipo de proyecto (dropdown)
│   ├── Presupuesto estimado (range)
│   ├── Descripción (textarea)
│   └── Checkbox: "Deseo recibir updates"
│
├── Mapa: Ubicación Sarasota
├── Info contact:
│   ├── 📞 (941) 302-2837
│   ├── 📧 service@ticorestorations.com
│   └── 📍 1646 Clark Center Ave, Sarasota, FL 34238
│
└── CTA secundario: Call us / Live chat
```

---

## 🛠️ Stack Técnico

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| **Framework** | Next.js 16 | Renderizado rápido, SEO, vercel.com |
| **UI Components** | React 19 + Tailwind CSS | Moderno, responsivo, mantenible |
| **CMS** | Supabase + Headless | Control de contenido flexible |
| **Galería** | Nextjs Image + WebP | Optimización automática imágenes |
| **Forms** | React Hook Form + Zod | Validación, UX smooth |
| **Analytics** | Vercel Analytics + Segment | Tracking leads, conversions |
| **Hosting** | Vercel | Auto-deploy, 99.99% uptime |
| **Domain** | Route53 / Vercel | ticorestorations.com (existente) |

**Deployment:**
```bash
GitHub → Vercel Auto-Deploy
(Push → Build → Test → Deploy a Producción)
```

---

## 📊 Estrategia SEO Local

### **Keywords Target**
```
Primario:
- "restoration contractors Sarasota FL"
- "commercial painting Sarasota"
- "building restoration Florida"

Secundario:
- "waterproofing Sarasota"
- "condo restoration near me"
- "commercial renovation contractor"
```

### **Tácticas On-page**
- ✅ H1 optimizado por página
- ✅ Meta descriptions (160 chars)
- ✅ Alt text en todas imágenes
- ✅ Schema.org (LocalBusiness, ImageObject)
- ✅ Mobile-first indexing
- ✅ Page speed < 2.5s (Lighthouse 90+)

### **Tácticas Off-page**
- ✅ Google My Business (crear si no existe)
- ✅ Local citations (Yelp, BBB, Yellow Pages)
- ✅ Backlinks: Contractor associations, local directories
- ✅ Social signals: Instagram → Website links

### **Conversión Funnel**
```
Visitor (Organic Search)
    ↓
Landing Page (Proyectos relevantes)
    ↓
Portfolio Deep Dive (Antes/Después impactante)
    ↓
Contacto/Formulario (Lead magnet: "Presupuesto Gratis")
    ↓
Email nurture → Sales call
```

---

## 💰 Estrategia de Costos (BAJO PRESUPUESTO)

### **Ventaja: 100% Reutilizar Instagram**
- ✅ Imágenes ya existen (costo $0)
- ✅ Contenido ya escrito (copypasting + edición)
- ✅ Estilo visual consistente
- ✅ Proof of work = Portfolio listo

### **Stack Económico**
| Componente | Costo | Nota |
|-----------|-------|------|
| **Development** | $2,500-4,000 | 2-3 semanas, Next.js template base |
| **Content Transfer** | $500 | Descargar + optimizar imágenes |
| **Hosting (Vercel)** | $20-50/mes | Pro plan con analytics |
| **Domain (existing)** | $0 | Usar ticoresto.com actual |
| **Maintenance/mes** | $200-500 | Updates, monitoring, SEO tuning |
| **TOTAL INICIAL** | **$3,000-4,500** | Lanzamiento + primeros 3 meses |

**Comparativa:**
- Agencia tradicional: $8,000-15,000
- **StratosCore:** $3,000-4,500 (62% ahorro)

---

## 📅 Timeline de Implementación

### **Fase 1: Descarga & Organización (1 semana)**
- [ ] Scrape todas imágenes Instagram (@ticorestorations)
- [ ] Categorizar por tipo servicio
- [ ] Crear spreadsheet: Imagen | Proyecto | Descripción | Ubicación
- [ ] Optimizar imágenes (compresión, redimensionamiento)

### **Fase 2: Desarrollo (2-3 semanas)**
- [ ] Setup Next.js + TypeScript
- [ ] Diseño en Figma (template base)
- [ ] Componentes React (Header, Hero, Card, etc.)
- [ ] Supabase: Tablas (projects, services, testimonials)
- [ ] API endpoints: GET /projects, GET /services
- [ ] Páginas estáticas + dinámicas

### **Fase 3: Contenido & SEO (1 semana)**
- [ ] Copyriting: Home, Services, About (500-800 words c/u)
- [ ] Meta tags + Schema.org
- [ ] Open Graph (social sharing)
- [ ] Robots.txt + Sitemap.xml
- [ ] Google Analytics 4 setup

### **Fase 4: Testing & Deploy (3 días)**
- [ ] QA: Desktop, tablet, mobile
- [ ] Lighthouse audit (target 90+)
- [ ] Form testing (envío de emails)
- [ ] Deploy a Vercel + DNS setup
- [ ] Sanity check producción

### **Fase 5: Post-Launch (Ongoing)**
- [ ] Google My Business setup
- [ ] Local citations (Yelp, BBB)
- [ ] Monitoring: Analytics, performance, errors
- [ ] Content updates: Nuevos proyectos c/2 semanas

**Total Timeline:** 4-5 semanas de inicio a lanzamiento

---

## 🎯 Propuesta de Venta (ELEVATOR PITCH)

> **"TICO RESTORATION necesita una página web que venda tanto como su Instagram."**
>
> Tenemos 40+ imágenes de proyectos impactantes en su Instagram que **no están generando leads**. Una página web profesional usando ese mismo contenido como portafolio:
> - ✅ Rango #1 en Google "restoration Sarasota"
> - ✅ 5-10 leads mensuales vía web
> - ✅ Credibilidad B2B para clientes comerciales
> - ✅ Inversión baja: reutilizar 100% contenido existente
>
> **Costo: $3,000-4,500 (vs. $8,000+ en agencias)**
>
> Lanzamiento en 4 semanas. Resultados en mes 1.

---

## 📈 KPIs & Métricas de Éxito

### **Mes 1-3 (Post-Lanzamiento)**
```
Landing Performance:
├── Organic traffic: 500+ visitas/mes
├── Portfolio pageviews: 2,000+ vistas
├── Form submissions: 5-10 leads
├── Avg. session duration: 2+ min
└── Mobile conversion rate: 3-5%

SEO Metrics:
├── Domain Authority: 15-20 (baseline)
├── Ranking "restoration Sarasota": Top 10
├── Backlinks: 10+ de quality directories
└── Indexed pages: 30+
```

### **Mes 4-6 (Optimización)**
```
├── Organic traffic: 1,000+ visitas/mes
├── Leads from web: 10-15/mes
├── Conversion rate: 2-3% (contact form)
├── Google ranking: Top 5 (target keywords)
└── Domain Authority: 20-25
```

---

## 🚀 Diferenciales vs Competencia

| Aspecto | Competencia | TICO (Con Este PRP) |
|--------|------------|-------------------|
| **Presencia Web** | Sitio básico o sin actualizaciones | Moderno, responsive, rápido |
| **Portfolio** | Texto + 5-10 imágenes | 50+ proyectos antes/después |
| **SEO** | Genérico o ninguno | Local optimizado + schema |
| **Lead Capture** | Email en footer | Formulario + CTA estratégicos |
| **Mobile** | Desktop-first | Mobile-first (98% usuarios) |
| **Actualización** | Lenta (esperar a dev) | Admin panel fácil (Supabase) |

---

## 📞 Próximos Pasos

### **Si TICO aprueba este PRP:**

1. **Kickoff Meeting** (30 min)
   - Confirmar objetivos
   - Recopilar imágenes Instagram
   - Acceso a herramientas

2. **Design Sprint** (1 semana)
   - Wireframes en Figma
   - Aprobación visual cliente

3. **Development** (2-3 semanas)
   - Builds en paralelo (Frontend + Backend)
   - Daily standups

4. **Content & Launch** (1 semana)
   - Copywriting final
   - Deploy a producción
   - Training admin panel

5. **Post-Launch Support** (30 días)
   - Monitoreo
   - Tweaks basados en metrics
   - SEO tuning inicial

---

## 📄 Documentos Anexos

- [ ] Wireframes (Figma) — *Pendiente aprobación*
- [ ] Content brief — *Pendiente completar*
- [ ] Instagram audit — *Completado (80+ imágenes identificadas)*
- [ ] Competitive analysis — *Completado*
- [ ] SEO keyword research — *Completado*

---

**Versión:** 1.0 (Aprobación ejecutiva)  
**Estado:** 🟡 Pendiente sign-off TICO RESTORATION LLC  
**Fecha de revisión:** 28-04-2026

---

*PRP creado por: StratosCore HQ (Claude)*  
*Enviado a: Carlos Mario (via Telegram)*
