---
name: autoresearch
description: Investigación automática multi-fuente (web, docs, código) con síntesis final. Usa cuando el usuario pida "investiga", "busca información sobre", "compara opciones".
triggers: investigar, research, buscar, comparar, análisis, documentación, benchmark
---

# Autoresearch — Investigación automática

Ejecuta investigación multi-fuente sobre un tema: web search, docs oficiales, código en el repo, con síntesis final estructurada.

## Flujo

1. **Plan** — descompone la pregunta en sub-preguntas
2. **Búsqueda paralela**:
   - Web search (Brave/Perplexity)
   - Docs oficiales (WebFetch)
   - Código local (Grep)
3. **Síntesis** — genera reporte con fuentes citadas
4. **Guarda** en `docs/research/{topic}-{date}.md`

## Cuándo usar

- "Investiga qué librería usar para X"
- "Compara Stripe vs MercadoPago para mi caso"
- "Busca las mejores prácticas de RLS en Supabase"

## Output

```markdown
# Research: {topic}
Fecha: 2026-04-20

## TL;DR
- Recomendación clara
- 2-3 bullets con razones

## Fuentes consultadas
1. [Título] - URL - fecha acceso
2. ...

## Análisis detallado
...

## Siguientes pasos sugeridos
...
```

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
