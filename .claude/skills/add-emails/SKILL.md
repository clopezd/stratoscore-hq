---
name: add-emails
description: Integra envío de emails transaccionales (Resend, SendGrid) con templates. Usa cuando el usuario pida "enviar emails", "notificaciones por correo", "bienvenida".
triggers: emails, correos, resend, sendgrid, notificación, transaccional, template
---

# Add Emails — Emails transaccionales

Añade sistema completo de emails: templates React Email, envío vía Resend, logs en Supabase.

## Cuándo usar

- "Enviar email de bienvenida"
- "Notificar por correo cuando pase X"
- "Agrega templates de email"

## Qué genera

- `lib/email/client.ts` — cliente Resend configurado
- `emails/` — templates en React Email (Welcome, PasswordReset, Invoice)
- `/api/email/send` — endpoint protegido con auth
- Tabla `email_logs` para auditoría

## Stack

- Resend (principal) o SendGrid
- React Email para templates
- Supabase para logs

## Requisitos

- `RESEND_API_KEY` en `.env.local`
- Dominio verificado en Resend

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
