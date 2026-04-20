---
name: prp
description: Genera un PRP (Product Requirements Prompt) detallado para planificar features complejas antes de implementar. Usa cuando el usuario pida "planificar feature", "PRP", "diseñar antes de codear".
triggers: prp, plan, planificar, diseño, requirements, spec, feature nueva
---

# PRP — Product Requirements Prompt

Genera un documento PRP en `business-os/.claude/PRPs/` que describe una feature de forma ejecutable por un agente: contexto, archivos relevantes, pasos, criterios de validación.

## Cuándo usar

- Antes de implementar una feature grande (>500 LOC estimadas)
- Cuando la tarea toca múltiples módulos
- Para alinear arquitectura antes de codear

## Qué genera

Un archivo `PRPs/PRP-{slug}.md` con:

1. **Objetivo** — qué se quiere lograr
2. **Contexto** — archivos, APIs, dependencias relevantes
3. **Arquitectura propuesta** — diagramas, esquemas, flujos
4. **Plan de implementación** — pasos numerados
5. **Criterios de validación** — tests, checks manuales
6. **Riesgos conocidos** — qué puede salir mal

## Flujo

1. Entrevista breve al usuario (3-5 preguntas)
2. Exploración de archivos relevantes
3. Generación del PRP
4. Revisión con el usuario antes de ejecutar

## Relacionado

- `bucle-agentico` — ejecuta un PRP paso a paso

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
