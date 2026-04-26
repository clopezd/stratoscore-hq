# PRDs — Daily Brief

Cada cliente activo tiene un PRD aquí (`{cliente}.md`). El **Daily Brief** lo lee
cada mañana, cuenta hitos completados (`- [x]`) y pendientes (`- [ ]`), los compara
con commits del día anterior y publica un resumen en Telegram.

## Estructura esperada

```markdown
---
client: {nombre-en-minusculas}
status: in_progress | paused | done
created: YYYY-MM-DD
---

# PRD — {Nombre Cliente}

## Objetivo

{Un párrafo. El "para qué" del proyecto. El daily brief lo cita.}

## Hitos

### {Sección lógica}
- [x] hito completado
- [ ] hito pendiente
```

## Reglas

- **Un solo `## Objetivo`** por archivo (lo que va entre ese header y el siguiente `##`).
- **Checklists en formato GFM**: `- [ ]` y `- [x]` (espacios exactos).
- **Sin PRD** = el daily brief propondrá iniciarlo. Para arrancar uno, copia
  `videndum.md` como template.

## Clientes activos hoy

| Cliente | PRD |
|---------|-----|
| Videndum | [videndum.md](./videndum.md) |
| Mobility | [mobility.md](./mobility.md) |
| BidHunter | [bidhunter.md](./bidhunter.md) |
| Finanzas | _sin PRD aún_ |
