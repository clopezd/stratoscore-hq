---
name: bucle-agentico
description: Ejecuta un PRP paso a paso con validación automática entre pasos (build, typecheck, tests). Usa cuando el usuario pida "implementa este PRP", "bucle agéntico", "ejecuta el plan".
triggers: bucle, agéntico, ejecutar prp, implementar plan, loop, validación automática
---

# Bucle Agéntico — Ejecución validada

Toma un PRP y lo ejecuta en loop: implementa un paso → valida (build/test/typecheck) → si falla corrige → siguiente paso.

## Cuándo usar

- Después de generar un PRP con el skill `prp`
- Para features que requieren múltiples archivos coordinados
- Cuando quieres que el agente se auto-corrija sin intervención

## Flujo

```
┌─→ leer paso N del PRP
│   ↓
│   implementar (Edit/Write)
│   ↓
│   validar (npm run build, test, lint)
│   ↓
│   ¿falla? → corregir → reintentar (max 3x)
│   ↓
└── paso N+1
```

## Validaciones por defecto

- `npm run build` (Next.js / TypeScript)
- `npm run typecheck` si existe
- `npm run lint` si existe
- Tests específicos del PRP

## Límites

- Max 3 reintentos por paso (evita loops infinitos)
- Si falla 3x consecutivas → para y reporta al usuario

## Relacionado

- `prp` — genera el plan que este skill ejecuta

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
