---
name: playwright-cli
description: Testing E2E automatizado con Playwright — genera, ejecuta y depura tests. Usa cuando el usuario pida "tests e2e", "probar el flujo", "verificar que funcione".
triggers: playwright, e2e, test, testing, ui test, smoke test, regression
---

# Playwright CLI — Testing E2E

Genera y ejecuta tests E2E con Playwright. Soporta grabación de flujos, assertions automáticas, CI.

## Capacidades

- **Codegen** — grabar flujos interactivamente
- **Generación automática** — a partir de una descripción
- **Ejecución headed/headless**
- **Trace viewer** — debug visual de fallos
- **Cross-browser** — Chromium, Firefox, WebKit

## Comandos

```bash
# Generar test grabando interacción
npx playwright codegen http://localhost:3000

# Correr todos los tests
npx playwright test

# Un archivo específico, con browser visible
npx playwright test login.spec.ts --headed

# Ver trace de un fallo
npx playwright show-trace trace.zip

# Generar reporte HTML
npx playwright show-report
```

## Estructura

```
tests/
├── e2e/
│   ├── login.spec.ts
│   ├── checkout.spec.ts
│   └── dashboard.spec.ts
├── fixtures/
│   └── auth.ts
└── playwright.config.ts
```

## Patrones comunes

- Page Object Model para flujos reusables
- Fixtures de auth (login una vez, reutilizar cookie)
- `beforeEach` con datos seed

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
