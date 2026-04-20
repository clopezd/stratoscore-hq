---
name: eject-sf
description: Desacopla SaaS Factory de un proyecto — copia skills inline y remueve dependencias. Usa cuando el usuario pida "eject SF", "independizar proyecto".
triggers: eject, desacoplar, independizar, quitar factory, standalone
---

# Eject SF — Desacoplar SaaS Factory

Convierte un proyecto dependiente de SaaS Factory en uno autónomo: copia skills inline, remueve referencias al repo canónico, documenta lo copiado.

## Cuándo usar

- Cliente quiere el código "en bruto" sin dependencias al framework
- Preparar un fork independiente
- Entregar a un equipo que no usará SF a futuro

## Qué hace

1. **Copia skills usados** a `.claude/skills-ejected/`
2. **Remueve** referencias al repo canónico de SF
3. **Congela versiones** de skills en `SKILLS_FROZEN.md`
4. **Genera resumen** de lo desacoplado

## Lo que NO hace

- No borra historia git
- No modifica el código de la app (solo la metadata del framework)
- No puede reversarse automáticamente — confirmar con el usuario

## Output

```
## Eject completado

- 12 skills copiados inline
- .claude/settings.json actualizado
- SKILLS_FROZEN.md generado con versiones

⚠️ Perderás updates automáticos de SF.
Para reconectar: eliminar .claude/skills-ejected y reinstalar SF.
```

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
