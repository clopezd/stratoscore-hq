# StratosCore Web

Sitio corporativo de StratosCore — cinematográfico, 3D, bilingüe (ES/EN).

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 18** · TypeScript estricto
- **Tailwind CSS v4** con design tokens del brand book
- **React Three Fiber + drei + postprocessing** — cubo 3D interactivo en hero
- **GSAP + ScrollTrigger + Lenis** — smooth scroll y scroll storytelling
- **Framer Motion** — micro-interacciones
- **next-intl** — i18n (ES + EN)

## Estructura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx           # Root layout con providers
│   │   ├── page.tsx             # Home (Hero + 8 secciones)
│   │   └── opengraph-image.tsx  # OG dinámica por idioma
│   ├── globals.css              # Tokens + Tailwind v4
│   └── icon.tsx                 # Favicon dinámico
├── components/
│   ├── brand/                   # Logo (cubo SVG) + wordmark
│   ├── hero/                    # Hero + CubeScene (R3F)
│   ├── sections/                # Manifesto, Clients, Capabilities, Agents, Case, Numbers, Stack, CTA
│   ├── ui/                      # MagneticButton, CustomCursor, RevealText, SectionTag
│   └── layout/                  # Header, Footer, LocaleSwitcher
├── i18n/                        # next-intl config + routing
├── lib/                         # cn (twMerge), SmoothScroll (Lenis)
├── messages/                    # es.json · en.json (copy AIDA)
└── middleware.ts                # Locale routing
```

## Dev

```bash
npm install
npm run dev        # http://localhost:3100
npm run build      # producción
npm run typecheck  # validar tipos
```

## Paleta

- `#001117` Deep Carbon (background)
- `#00C4CC` Brand Cyan
- `#22d3ee` Interactive Cyan (dark mode)
- `#00F2FE` Electric Cyan (glows, bordes)

## Contenido

Copy con enfoque **AIDA** en `src/messages/`. Editable sin tocar código.
