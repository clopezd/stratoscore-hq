---
name: update-sf
description: Actualiza SaaS Factory V4 (skills, templates, scripts) al último release en un proyecto existente. Usa cuando el usuario pida "actualiza SF", "nueva versión de factory".
triggers: update sf, saas factory, actualizar skills, upgrade factory, nueva versión
---

# Update SF — Actualizar SaaS Factory

Actualiza los skills, templates y scripts de SaaS Factory en un proyecto existente, preservando customizaciones locales.

## Flujo

1. **Detecta versión actual** — lee `.claude/skills/VERSION`
2. **Consulta último release** — repo canónico de SaaS Factory
3. **Diff** — muestra cambios por skill (added/modified/removed)
4. **Confirma con usuario** — antes de sobrescribir
5. **Actualiza** con merge inteligente (preserva secciones `## Custom`)
6. **Git commit** — con mensaje descriptivo

## Qué actualiza

- `.claude/skills/*/SKILL.md`
- `.claude/skills/*/scripts/`
- `.claude/skills/*/templates/`
- `.claude/settings.json` (si cambios de permisos)

## Qué NO toca

- `.claude/memories/` — memoria local
- `.claude/PRPs/` — PRPs del proyecto
- Secciones marcadas `## Custom` en SKILL.md

## Uso

```bash
# Verificar versión actual
cat .claude/skills/VERSION

# Ejecutar actualización
# (via este skill)
```

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
