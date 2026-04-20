---
name: add-payments
description: Integra pagos (Stripe, MercadoPago) a un proyecto Next.js. Usa cuando el usuario pida "agregar pagos", "checkout", "suscripciones", "cobrar".
triggers: pagos, payments, stripe, mercadopago, checkout, cobrar, suscripción, billing
---

# Add Payments — Integración de pagos

Añade procesamiento de pagos completo: checkout, webhooks, suscripciones, portal de cliente.

## Cuándo usar

- "Quiero cobrar por mi servicio"
- "Agrega Stripe a mi app"
- "Necesito suscripciones mensuales"

## Qué genera

- Ruta `/api/checkout` con Stripe Checkout Sessions
- Webhooks en `/api/webhooks/stripe` (validación de firma)
- Tabla `subscriptions` en Supabase con RLS
- Portal de cliente (`/account/billing`)
- Componente `PricingTable`

## Stack

- Stripe SDK (o MercadoPago según mercado)
- Next.js Route Handlers
- Supabase para persistencia

## Requisitos

- Variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Productos y precios creados en Stripe Dashboard

## Estado

🔨 **Skill stub** — Implementación completa pendiente. La lógica real vive en SaaS Factory V4.
