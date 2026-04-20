---
name: memory-manager
description: Memoria persistente git-versioned — guarda hechos, decisiones, preferencias en archivos markdown versionados. Usa cuando el usuario pida "recuerda que", "guarda esto", "no olvides".
triggers: memoria, recordar, guardar, no olvides, preferencia, decisión, contexto persistente
---

# Memory Manager — Memoria persistente

Sistema de memoria git-versioned en archivos markdown. Cada "memoria" es un hecho, decisión o preferencia que el agente debe recordar entre sesiones.

## Ubicación

```
.claude/memories/
├── user-preferences.md      ← Cómo le gusta trabajar a Carlos
├── project-decisions.md     ← Decisiones arquitectónicas
├── business-rules.md        ← Reglas de negocio
└── recent-changes.md        ← Cambios importantes recientes
```

## Operaciones

### Guardar memoria
```
Usuario: "Recuerda que siempre uso Tailwind para estilos"
→ Append a user-preferences.md con timestamp
```

### Buscar memoria
```
Agente consulta relevantes antes de responder
→ grep en .claude/memories/
```

### Olvidar
```
Usuario: "Ya no uso Tailwind, olvida esa preferencia"
→ Marca como obsoleta (no borra, comenta)
```

## Formato

```markdown
## 2026-04-20 — Preferencia de estilos
**Contexto:** Carlos mencionó en sesión de finanzas
**Hecho:** Prefiere Tailwind sobre CSS modules
**Tags:** #ui #preferences
```

## Ventajas

- Git-versioned (historial auditable)
- Searchable (grep, ripgrep)
- Portable (cualquier agente puede leer)

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
