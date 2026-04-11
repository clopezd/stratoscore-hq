# StratosCore — Equipo

> Ultima actualizacion: 2026-04-10

---

## Estructura

### Core Team

**Carlos Mario Lopez** — Founder & Lead Architect
- Arquitectura de sistemas, desarrollo full-stack, gestion de clientes
- Stack: TypeScript, Next.js, React, Supabase, Claude Agent SDK
- Responsable de: diseno de producto, implementacion, deploy, operaciones

**Claude Agent Engine** — AI Development Engine
- Motor de desarrollo asistido por IA (24/7)
- Generacion de codigo, testing, documentacion, analisis de seguridad
- Integrado via Telegram bot + CLI para desarrollo continuo

### Equipo en expansion

**[Nombre] Lopez** — Security Analyst (in training)
- Estudiante de Cybersecurity en USA (etapa final)
- Rol: Auditorias de seguridad, revision de RLS policies, OWASP testing
- Foco actual: Infraestructura MedCare (datos de pacientes)

**[Nombre] Lopez** — Software Engineer (in training)
- Estudiante de Computer Science (etapa final)
- Rol: Testing E2E con Playwright, desarrollo de features
- Foco actual: Suite de tests automatizados

---

## Modelo operativo

```
Carlos Mario (arquitectura + producto)
    |
    +-- Claude Agent (desarrollo 24/7)
    |
    +-- Security Analyst (auditorias)
    |
    +-- Software Engineer (testing + features)
```

### Ventajas del modelo

1. **Velocidad**: Claude Agent genera codigo de grado empresarial en horas, no semanas
2. **Consistencia**: Un solo arquitecto = cero "estilos mezclados" en el codigo
3. **Seguridad**: Especialista dedicado auditando infraestructura
4. **Continuidad**: Documentacion completa (RUNBOOK.md, ONBOARDING-DEV.md) para que cualquier miembro pueda operar el sistema

### Escalabilidad del equipo

- Modelo actual soporta hasta 5 clientes activos
- Para escalar: agregar developers TypeScript (onboarding en 1 dia via ONBOARDING-DEV.md)
- Infraestructura documentada permite handoff sin dependencia de una sola persona

---

## Documentacion de soporte

| Documento | Proposito |
|-----------|-----------|
| `RUNBOOK.md` | Operaciones diarias — como operar el sistema |
| `ONBOARDING-DEV.md` | Setup para un nuevo developer |
| `SECURITY.md` | Framework de seguridad completo |
| `ARCHITECTURE.md` | Decisiones arquitectonicas |
