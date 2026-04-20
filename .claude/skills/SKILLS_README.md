# StratosCore Skills — SaaS Factory V4

18 skills especializados para el desarrollo ágil en StratosCore HQ.

## Cómo usar

Los skills están disponibles automáticamente en Claude Code (desktop/web/CLI). Invoca cualquiera así:

- Con slash: `/add-login`, `/supabase`, `/ai`
- Con intención natural: "agrega login a mi app" → activa `add-login`

## Catálogo

### 🚀 Features listas para usar
| Skill | Qué hace |
|-------|----------|
| [add-login](./add-login/SKILL.md) | Autenticación completa Next.js + Supabase |
| [add-payments](./add-payments/SKILL.md) | Integración Stripe / MercadoPago |
| [add-emails](./add-emails/SKILL.md) | Emails transaccionales con Resend |
| [add-mobile](./add-mobile/SKILL.md) | PWA instalable + wrapper Expo |
| [website-3d](./website-3d/SKILL.md) | Landing cinematográfica con Three.js |

### 🤖 Inteligencia artificial
| Skill | Qué hace |
|-------|----------|
| [ai](./ai/SKILL.md) | 11 templates: chat, RAG, vision, tools, agents |
| [image-generation](./image-generation/SKILL.md) | Generación/edición de imágenes con Gemini |
| [autoresearch](./autoresearch/SKILL.md) | Investigación multi-fuente con síntesis |

### 🏗️ Planificación e implementación
| Skill | Qué hace |
|-------|----------|
| [prp](./prp/SKILL.md) | Genera Product Requirements Prompt |
| [bucle-agentico](./bucle-agentico/SKILL.md) | Ejecuta PRP con validación automática |
| [primer](./primer/SKILL.md) | Carga contexto del proyecto |

### 🗄️ Infraestructura
| Skill | Qué hace |
|-------|----------|
| [supabase](./supabase/SKILL.md) | Esquemas, RLS, queries, Edge Functions |
| [playwright-cli](./playwright-cli/SKILL.md) | Testing E2E automatizado |
| [memory-manager](./memory-manager/SKILL.md) | Memoria persistente git-versioned |

### 🏭 SaaS Factory (meta-skills)
| Skill | Qué hace |
|-------|----------|
| [new-app](./new-app/SKILL.md) | Scaffold nuevo proyecto Next.js + SF |
| [update-sf](./update-sf/SKILL.md) | Actualizar SaaS Factory a último release |
| [eject-sf](./eject-sf/SKILL.md) | Desacoplar proyecto de SaaS Factory |
| [skill-creator](./skill-creator/SKILL.md) | Crear nuevos skills estandarizados |

## Estado actual

⚠️ **Estos son stubs de documentación.** Los scripts y templates ejecutables viven en `/home/cmarioia/proyectos/stratoscore-hq/business-os/.claude/skills/` (máquina local de Carlos).

Para tener la versión completa ejecutable en este entorno desktop, necesitas:
1. Hacer `git pull` de la rama que contenga los skills completos, o
2. Sincronizar los archivos desde la máquina local

## Formato estándar

Cada skill sigue este formato:

```yaml
---
name: skill-name
description: Descripción clara + "Usa cuando el usuario pida..."
triggers: palabra1, palabra2, palabra3
---

# Título legible

## Cuándo usar
## Qué hace
## Requisitos
## Estado
```

## Crear un skill nuevo

Usa el skill [`skill-creator`](./skill-creator/SKILL.md):

```
"crea un skill que haga X"
```
