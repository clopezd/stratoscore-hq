---
name: add-mobile
description: Convierte un proyecto Next.js en PWA instalable o prepara un wrapper Expo. Usa cuando el usuario pida "app móvil", "PWA", "versión para celular".
triggers: mobile, móvil, pwa, expo, react native, app store, celular, instalable
---

# Add Mobile — Versión móvil

Agrega capacidades móviles: PWA instalable con manifest, service worker, offline support, o wrapper Expo.

## Cuándo usar

- "Quiero que mi web sea instalable como app"
- "Necesito una versión nativa"
- "Agrega soporte offline"

## Qué genera

### PWA
- `manifest.json` con iconos generados
- Service worker (next-pwa)
- Hook `usePWAInstall`
- Iconos en múltiples tamaños

### Expo wrapper (opcional)
- Estructura `mobile/` con Expo Router
- WebView a la app web
- Config de deep links

## Stack

- next-pwa o Workbox
- Expo + React Native (opcional)

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
