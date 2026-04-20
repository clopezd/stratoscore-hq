---
name: skill-creator
description: Crea nuevos skills siguiendo el estándar de Claude Code (SKILL.md con frontmatter). Usa cuando el usuario pida "crea un skill", "nuevo skill", "agrega habilidad".
triggers: skill, crear skill, nuevo skill, habilidad, agregar capacidad
---

# Skill Creator — Crear nuevos skills

Genera skills nuevos siguiendo el estándar Claude Code: archivo `SKILL.md` con frontmatter YAML + documentación + scripts asociados.

## Flujo

1. **Entrevista** — 3 preguntas al usuario:
   - Nombre del skill (kebab-case)
   - Qué hace en una frase
   - Triggers típicos (palabras que lo activan)
2. **Genera estructura**:
   ```
   .claude/skills/{name}/
   ├── SKILL.md          ← frontmatter + docs
   ├── scripts/          ← scripts ejecutables (opcional)
   └── templates/        ← templates de archivos (opcional)
   ```
3. **Valida** — verifica frontmatter correcto

## Frontmatter estándar

```yaml
---
name: skill-name
description: Descripción en 1-2 líneas. Usa cuando...
triggers: keyword1, keyword2, keyword3
---
```

## Secciones obligatorias en SKILL.md

- **Descripción** — qué hace
- **Cuándo usar** — ejemplos de requests de usuario
- **Qué hace** — pasos o outputs
- **Requisitos** — env vars, dependencias

## Ejemplos de naming

✅ `add-login`, `website-3d`, `memory-manager`
❌ `login`, `3D`, `MemoryManager`

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
