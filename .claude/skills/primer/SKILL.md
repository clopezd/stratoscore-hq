---
name: primer
description: Carga el contexto completo del proyecto (arquitectura, stack, estado, negocios) al inicio de una sesión. Usa cuando el usuario pida "dame contexto", "qué hay aquí", "estado del proyecto".
triggers: primer, contexto, estado, overview, resumen proyecto, qué tengo, dónde estoy
---

# Primer — Cargar contexto del proyecto

Lee los archivos críticos del proyecto y arma un resumen ejecutivo: arquitectura, stack, estado actual, módulos activos.

## Qué hace

1. Lee `CLAUDE.md` raíz y sub-proyectos
2. Lee `README.md` principal
3. Inspecciona `package.json` de cada sub-proyecto
4. Verifica estado de procesos (`pm2 status` si aplica)
5. Lee docs activos en `docs/`
6. Genera un resumen de 1 pantalla

## Output

```
## StratosCore HQ — Estado actual

### Sub-proyectos activos
- business-os (Next.js 16) → puerto 3000 ✅
- agent-server (Agent SDK + grammY) → puerto 3099 ✅
- Mission-Control (PWA)

### Negocios
- Videndum, Mobility, Bidhunter, MedCare, Confirma

### Módulos en business-os
- /finanzas — finanzas personales
- /clients/{videndum,mobility,...}

### Bugs conocidos
- (ninguno activo)

### Próximos pasos sugeridos
- ...
```

## Cuándo usar

- Al iniciar sesión nueva
- Después de ausencia larga
- Antes de trabajar en feature grande

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
