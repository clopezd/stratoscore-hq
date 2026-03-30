# Brief de Reconstruccion Web — StratosCore

> Documento generado por el equipo de 4 agentes expertos + inventario de assets.
> Fecha: 2026-03-30

---

## 1. ESTADO ACTUAL — Diagnostico consolidado

### Calificacion global: 4.5/10

| Area | Nota | Veredicto |
|------|------|-----------|
| Brandboard definido | 8/10 | Profesional, coherente — pero NO implementado en codigo |
| Logo en codigo | 2/10 | 3 identidades distintas coexisten |
| Paleta CSS | 7/10 | Tokens buenos, cyan falla como texto, faltan estados |
| Componentes UI | 3/10 | shadcn configurado sin usar, Neu* son stubs |
| UX/Accesibilidad | 4/10 | Zero focus states, sidebar rota en light mode |
| Performance | 3/10 | 177 client components, zero Server Components |
| Landing publica | 5/10 | Existe pero con contenido placeholder |

---

## 2. INVENTARIO DE ASSETS ACTUALES

### Imagenes y logos
| Asset | Path | Estado | Accion |
|-------|------|--------|--------|
| `stratoscore-brand.jpg` | `public/` | Brandboard profesional (cubo 3D + paleta + Aeonik) | FUENTE DE VERDAD — mantener |
| `Logo.png` | `src/shared/assets/images/` | Cubo isometrico 3D (297KB) | Mantener como referencia, crear SVG |
| `favicon.png` | `public/` | Logo de VIDENDUM, no StratosCore | REEMPLAZAR con isotipo StratosCore |
| `icon.svg` | `public/` | "Claw marks" violeta/azul — otra identidad | REEMPLAZAR con cubo isometrico |
| `videndum-logo.png` | `public/assets/` | Logo de cliente Videndum | Mantener para multi-tenant |

### Componentes de logo
| Componente | Path | Estado | Accion |
|------------|------|--------|--------|
| `StratoscoreLogo.tsx` | `src/shared/components/` | Chevrons >> + system-ui | RECONSTRUIR con cubo del brandboard |
| `VidendumLogo.tsx` | `src/shared/components/` | Corchetes + wordmark | Mantener (es logo de cliente) |
| `Logo.tsx` | `src/shared/components/` | Generico con fallback a Logo.png | Actualizar fallback |

### Fuentes
| Fuente | Path | Estado | Accion |
|--------|------|--------|--------|
| SpaceGrotesk-Regular.woff2 | `src/fonts/` | Solo peso Regular (400) | AGREGAR Medium (500) + Bold (700) |

### Paginas publicas existentes
| Pagina | Path | Estado |
|--------|------|--------|
| Landing `/welcome` | `(public)/welcome/page.tsx` | 256 lineas, contenido real pero mejorable |
| Login | `(auth)/login/page.tsx` | Glassmorphism, funcional |
| Signup | `(auth)/signup/page.tsx` | Misma estetica que login |
| Forgot password | `(auth)/forgot-password/page.tsx` | Funcional |
| Check email | `(auth)/check-email/page.tsx` | Funcional |
| Update password | `(auth)/update-password/page.tsx` | Funcional |
| Encuesta `[slug]` | `(public)/encuesta/[slug]/page.tsx` | Dinamica, funcional |
| Videndum Discovery | `(public)/videndum-discovery/` | Formulario multi-seccion |
| Demo scroll 3D | `demo-landing/scroll-3d/page.tsx` | Avanzado, canvas + scroll animation |

---

## 3. PROBLEMAS CRITICOS (Bloquean calidad profesional)

### P0 — Resolver antes de cualquier rediseno

| # | Problema | Archivo(s) | Impacto |
|---|----------|------------|---------|
| 1 | **3 identidades visuales coexisten** — chevrons, cubo, claw marks | StratoscoreLogo.tsx, icon.svg, favicon.png | Marca fragmentada, no profesional |
| 2 | **`ignoreBuildErrors: true`** en TypeScript | next.config.ts | Puede deployar codigo roto |
| 3 | **177 `'use client'`, CERO Server Components** | Todo el proyecto | Bundle JS ~2MB+, rendimiento malo |
| 4 | **Sidebar rota en light mode** — `text-white/30` hardcodeado | SidebarNav.tsx, Header.tsx | Light mode inutilizable |
| 5 | **Zero focus states** — `outline-none` en inputs y botones | LoginForm, SidebarNav, Header | Accesibilidad critica (WCAG fail) |
| 6 | **Zoom bloqueado** `maximumScale: 1` | layout.tsx | Viola WCAG 2.2 SC 1.4.4 |
| 7 | **Cyan `#00F2FE` como texto** — contraste 1.46:1 sobre blanco | Multiples componentes | WCAG AA fail total |
| 8 | **Tailwind v3 + v4 coexisten** — config duplicada | tailwind.config.ts + globals.css @theme | Conflicto de tokens |
| 9 | **shadcn/ui configurado sin instalar** — Neu* son stubs | components.json, NeuButton, NeuCard | Componentes no funcionales |
| 10 | **Code splitting: 2/10** — Excalidraw 800KB, Mermaid 500KB eager | Dynamic imports ausentes | Initial load enorme |

---

## 4. DECISIONES REQUERIDAS

Antes de implementar, estas decisiones definen la direccion:

### Decision 1: Identidad del logo
- **Opcion A:** Implementar el cubo isometrico del brandboard como SVG (recomendado)
- **Opcion B:** Crear un logo nuevo desde cero
- **Opcion C:** Refinar los chevrons actuales

### Decision 2: Tipografia
- **Opcion A:** Aeonik (la del brandboard) — licencia ~$50-200
- **Opcion B:** Inter (gratis, Google Fonts) — la mas similar, estandar SaaS
- **Opcion C:** General Sans o Satoshi (gratis, Fontshare) — mas personalidad
- **Opcion D:** Mantener Space Grotesk — agregar pesos Medium + Bold

### Decision 3: Light mode
- **Opcion A:** Arreglar light mode (migrar todo a tokens CSS)
- **Opcion B:** Eliminar light mode, ir full dark como Linear (mas rapido)

### Decision 4: Nombre en PWA/manifest
- **Opcion A:** "StratosCore" (marca principal)
- **Opcion B:** "Mission Control" (nombre actual)
- **Opcion C:** "StratosCore — Mission Control" (compuesto)

### Decision 5: Landing page
- **Opcion A:** Refactorizar la landing actual (`/welcome`) con nuevo branding
- **Opcion B:** Reconstruir desde cero con nuevo diseño
- **Opcion C:** Landing minimalista estilo Linear/Vercel

---

## 5. PALETA DE COLORES PROPUESTA

Mantiene la identidad brand, corrige problemas de contraste:

### Colores primitivos (escalas completas)
```
CYAN (brand)
cyan-50:   #ecfeff
cyan-100:  #cffafe
cyan-200:  #a5f3fc
cyan-300:  #67e8f9
cyan-400:  #22d3ee    ← dark mode interactive (10:1 sobre #0a0a0f)
cyan-500:  #00C4CC    ← brand primary (ajustado para mejor contraste)
cyan-600:  #0891b2    ← light mode interactive (7.2:1 sobre blanco)
cyan-700:  #0e7490
cyan-800:  #155e75
cyan-900:  #164e63

CARBON (brand)
carbon-50:  #f0f4f5
carbon-100: #d8e2e6
carbon-200: #b0c4cc
carbon-300: #7a9aa6
carbon-400: #4d7380
carbon-500: #2d4f5c
carbon-600: #1a3340
carbon-700: #0f2230
carbon-800: #081820
carbon-900: #001117    ← brand bg (Deep Carbon, sin cambio)
carbon-950: #000a0e
```

### Colores de estado
```
success:     #10b981  (emerald-500)
success-fg:  #065f46  (emerald-800) — 8.5:1 sobre blanco
warning:     #f59e0b  (amber-500)
warning-fg:  #92400e  (amber-800)  — 6.3:1 sobre blanco
error:       #ef4444  (red-500)
error-fg:    #991b1b  (red-800)    — 8.9:1 sobre blanco
info:        #3b82f6  (blue-500)
info-fg:     #1e40af  (blue-800)   — 9.5:1 sobre blanco
```

### Regla de uso del cyan
- `#00F2FE` (Electric Cyan original) → SOLO para glows, bordes decorativos, gradientes
- `#0891b2` (cyan-600) → Texto/botones interactivos en LIGHT mode
- `#22d3ee` (cyan-400) → Texto/botones interactivos en DARK mode

---

## 6. DESIGN TOKENS RECOMENDADOS

```css
/* TIER 1: Primitivos (nunca usar directo en componentes) */
@theme {
  --color-cyan-*: [escala completa];
  --color-carbon-*: [escala completa];
}

/* TIER 2: Semanticos (usar en componentes) */
:root {
  /* Surface */
  --surface-base: var(--color-carbon-50);
  --surface-card: #ffffff;
  --surface-elevated: var(--color-carbon-50);

  /* Content */
  --content-primary: var(--color-carbon-900);
  --content-secondary: var(--color-carbon-500);
  --content-tertiary: var(--color-carbon-400);
  --content-disabled: var(--color-carbon-300);

  /* Interactive */
  --interactive-primary: var(--color-cyan-600);
  --interactive-primary-hover: var(--color-cyan-700);
  --interactive-primary-active: var(--color-cyan-800);

  /* Border */
  --border-default: var(--color-carbon-200);
  --border-subtle: var(--color-carbon-100);
  --border-interactive: var(--color-cyan-500);

  /* Status */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

[data-theme="dark"] {
  --surface-base: #0a0a0f;
  --surface-card: rgba(255,255,255,0.03);
  --content-primary: #ffffff;
  --content-secondary: rgba(255,255,255,0.60);
  --content-tertiary: rgba(255,255,255,0.40);
  --content-disabled: rgba(255,255,255,0.20);
  --interactive-primary: #22d3ee;
  --border-default: rgba(255,255,255,0.08);
}
```

---

## 7. LOGO — Plan de reconstruccion

### Versiones necesarias (minimo para branding profesional SaaS)
1. **Isotipo** (cubo solo) → favicon, app icon, avatar, notificaciones
2. **Wordmark horizontal** (cubo + "STRATOS | CORE") → header, login, emails
3. **Wordmark stacked** (cubo arriba, texto abajo) → splash, presentaciones
4. **Monocromatico** (blanco sobre transparente) → watermarks, fondos oscuros
5. **Isotipo reducido** (cubo simplificado 16x16) → favicon real

### Implementacion tecnica
```
src/shared/components/
├── StratoscoreIcon.tsx        ← Isotipo (cubo SVG solo)
├── StratoscoreWordmark.tsx    ← Cubo + texto horizontal
├── StratoscoreLogo.tsx        ← Export unificado con variant prop
│   └── variant: 'icon' | 'wordmark' | 'stacked' | 'mono'
└── VidendumLogo.tsx           ← Sin cambios (logo de cliente)
```

### Assets a generar
```
public/
├── favicon.svg                ← Isotipo cubo (reemplaza favicon.png de Videndum)
├── icon-192.png               ← PWA icon 192x192
├── icon-512.png               ← PWA icon 512x512
├── icon.svg                   ← PWA icon SVG (reemplaza claw marks)
├── og-image.jpg               ← Open Graph para compartir en redes (1200x630)
└── apple-touch-icon.png       ← iOS icon 180x180
```

---

## 8. TIPOGRAFIA — Plan

### Si se elige Inter (recomendado por costo/calidad)
```bash
# Ya integrado en Next.js, no necesita archivo local
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
```

### Si se mantiene Space Grotesk
- Descargar pesos: Regular (400), Medium (500), Bold (700)
- Agregar a `src/fonts/`
- Actualizar `layout.tsx` con los 3 pesos

---

## 9. COMPONENTES UI — Plan

### Paso 1: Instalar shadcn/ui base
```bash
cd business-os
npx shadcn@latest add button input select card dialog dropdown-menu toast badge avatar separator tabs tooltip
```

### Paso 2: Reemplazar stubs Neu*
| Stub actual | Reemplazar con | Cambio |
|-------------|----------------|--------|
| NeuButton | shadcn Button con variantes brand | Wrapper con estilos cyan |
| NeuCard | shadcn Card con tokens | Usa --surface-card, --border-default |
| NeuInput | shadcn Input | Focus ring cyan, tokens |
| NeuSelect | shadcn Select | Dropdown accesible |

### Paso 3: Componentes nuevos necesarios
- `<Breadcrumb>` — navegacion contextual
- `<EmptyState>` — estados vacios con ilustracion + CTA
- `<CardSkeleton>` — loading states
- `<MiniSidebar>` — sidebar colapsada con iconos (estilo Linear)

---

## 10. ACCESIBILIDAD — Fixes requeridos

### Criticos (P0)
```css
/* globals.css — Focus ring global */
:focus-visible {
  outline: 2px solid var(--interactive-primary);
  outline-offset: 2px;
}

/* Quitar zoom lock */
/* layout.tsx: cambiar maximumScale: 1 → maximumScale: 5 */

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .orb-animate, .fade-up, .fade-up-delay, .fade-up-late {
    animation: none;
  }
}
```

### ARIA fixes
- Sidebar mobile overlay: agregar `role="dialog"`, `aria-modal`
- Team section: agregar `tabIndex={0}`, `onKeyDown`
- Keyboard shortcuts modal: agregar `role="dialog"`, trap focus
- Mobile hamburger: agregar `aria-expanded`, `aria-label`
- View toggle: cambiar a `role="tablist"` con `aria-selected`

---

## 11. PERFORMANCE — Prerequisitos

### Antes del rediseno
```bash
# 1. Eliminar ignoreBuildErrors
# next.config.ts: typescript.ignoreBuildErrors = false

# 2. Bundle analyzer
npm install @next/bundle-analyzer

# 3. Dynamic imports para modulos pesados
# Excalidraw (~800KB), Mermaid (~500KB), recharts (~300KB), jspdf (~200KB)
const Excalidraw = dynamic(() => import('@excalidraw/excalidraw'), { ssr: false })
const Mermaid = dynamic(() => import('mermaid'), { ssr: false })

# 4. Migrar <img> a <Image> (11 instancias)

# 5. Eliminar tailwind.config.ts, consolidar en @theme {} de globals.css

# 6. Suspense boundaries en layouts
```

---

## 12. LANDING PAGE — Estructura propuesta

### Secciones (basada en la actual + mejoras)
```
1. HERO
   - Logo StratosCore (nuevo, cubo isometrico)
   - Headline principal + subtitulo
   - CTA primario + CTA secundario
   - Visual hero (mockup de dashboard o animacion)

2. SOCIAL PROOF
   - Logos de clientes reales (no placeholder)
   - Metricas clave ("+X clientes", "$X gestionados")

3. COMO FUNCIONA (3-4 cards)
   - Marketing & Webs
   - Seguimiento Automatico
   - Sistemas Agenticios
   - Dashboard en Vivo

4. CASO DE USO: CLINICAS
   - Beneficios especificos
   - Metricas de resultado
   - Imagen/mockup real

5. DIFERENCIADOR: AGENTES IA
   - Que son vs chatbots
   - Capacidades (C-Suite virtual)
   - Visualizacion del equipo de 11 agentes

6. PRICING (si aplica)
   - Tiers claros
   - CTA por tier

7. CTA FINAL
   - Logo grande
   - Frase de cierre
   - Boton primario

8. FOOTER
   - Links de navegacion
   - Contacto real
   - Legal
```

---

## 13. HERRAMIENTAS RECOMENDADAS

| Herramienta | Para que | Prioridad |
|-------------|----------|-----------|
| **shadcn/ui** | Componentes accesibles y tematizables | P0 |
| **v0.dev** | Prototipar landing/componentes rapido | P1 |
| **SVGOMG** | Optimizar SVGs del logo | P1 |
| **@next/bundle-analyzer** | Ver que pesa en el bundle | P1 |
| **View Transitions API** | Transiciones de pagina nativas | P2 |
| **Framer Motion** (ya instalado) | Micro-interacciones | P2 |
| **Style Dictionary** | Design tokens como JSON (multi-proyecto) | P3 |
| **Playwright** | Visual regression testing | P3 |

---

## 14. FASES DE IMPLEMENTACION

### Fase 0: Fundacion (1-2 dias)
- [ ] Eliminar `ignoreBuildErrors`
- [ ] Eliminar `tailwind.config.ts`, consolidar en `@theme`
- [ ] Fix `maximumScale: 5`
- [ ] Focus ring global
- [ ] `prefers-reduced-motion`
- [ ] Dynamic imports para modulos pesados

### Fase 1: Identidad Visual (2-3 dias)
- [ ] Crear cubo isometrico como SVG en StratoscoreIcon.tsx
- [ ] Crear StratoscoreWordmark.tsx (cubo + texto)
- [ ] Unificar StratoscoreLogo.tsx con prop `variant`
- [ ] Generar favicon.svg, icon-192.png, icon-512.png, og-image.jpg
- [ ] Reemplazar favicon.png e icon.svg
- [ ] Actualizar manifest.json
- [ ] Instalar fuente (Inter o SpaceGrotesk con pesos)

### Fase 2: Design System (3-4 dias)
- [ ] Implementar nueva paleta con escalas completas
- [ ] Implementar tokens semanticos (surface, content, interactive, border, status)
- [ ] Instalar componentes shadcn/ui base
- [ ] Reemplazar stubs Neu* con wrappers sobre shadcn
- [ ] Migrar colores hardcodeados a tokens (sidebar, header, categoryColors)
- [ ] Fix light mode o eliminarlo

### Fase 3: Landing Publica (3-5 dias)
- [ ] Redisenar hero con nuevo branding
- [ ] Contenido real en social proof
- [ ] Secciones de producto con nuevo design system
- [ ] Seccion de agentes IA (diferenciador)
- [ ] CTA y footer profesionales
- [ ] SEO: meta tags, og-image, structured data

### Fase 4: Dashboard (5-7 dias)
- [ ] Mini-sidebar con iconos (estilo Linear)
- [ ] Breadcrumbs
- [ ] Empty states y loading skeletons
- [ ] Bento grid dashboard
- [ ] Migrar componentes clave a Server Components
- [ ] Suspense boundaries

### Fase 5: Polish (2-3 dias)
- [ ] Animaciones con Framer Motion (transiciones, hover)
- [ ] PWA completa (icons, screenshots, offline)
- [ ] ARIA fixes completos
- [ ] Testing visual con Playwright
- [ ] Lighthouse audit final (objetivo: 90+ en todas las categorias)

---

## 15. BENCHMARK — Donde queremos llegar

| Metrica | Actual (estimado) | Objetivo |
|---------|-------------------|----------|
| Lighthouse Performance | ~50 | 85+ |
| Lighthouse Accessibility | ~60 | 90+ |
| Lighthouse SEO | ~70 | 95+ |
| Initial JS bundle | ~2MB+ | <500KB |
| LCP | >4s | <2.5s |
| CLS | desconocido | <0.1 |
| Contraste WCAG AA | parcial | 100% |
| Design token coverage | ~40% | 95%+ |
| Logo versions | 1 (inconsistente) | 5 (sistema completo) |
