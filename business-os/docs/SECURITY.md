# StratosCore — Security Framework

> Documento de referencia para auditorias, prospectos, y equipo interno.
> Ultima actualizacion: 2026-04-10

---

## Certificaciones de infraestructura

StratosCore esta construido sobre proveedores certificados:

| Certificacion | Proveedor | Alcance |
|--------------|-----------|---------|
| **SOC 2 Type II** | Supabase | Seguridad, disponibilidad, confidencialidad de datos |
| **SOC 2 Type II** | Vercel | Seguridad, confidencialidad, disponibilidad del hosting |
| **ISO 27001:2022** | Vercel | Sistema de gestion de seguridad de la informacion |
| **PCI DSS v4.0** | Vercel | Seguridad de datos de pago |
| **GDPR** | Vercel | Proteccion de datos personales (UE) |
| **HIPAA Ready** | Supabase | Datos medicos — requiere BAA en plan Team/Enterprise |

**Fuentes verificables:**
- Supabase: https://supabase.com/docs/guides/security/soc-2-compliance
- Vercel: https://security.vercel.com/

### Grades de seguridad verificables

Escaneos publicos que cualquiera puede verificar:

| Herramienta | URL de verificacion | Que mide |
|-------------|-------------------|----------|
| SecurityHeaders.com | securityheaders.com/?q=stratoscore.app | Headers HTTP de seguridad |
| Qualys SSL Labs | ssllabs.com/ssltest/?d=stratoscore.app | Certificado SSL/TLS |
| Mozilla Observatory | observatory.mozilla.org (buscar stratoscore.app) | Seguridad web integral |

*Nota: Correr estos scans despues de deployar los headers de seguridad del middleware.*

---

## Controles implementados

### Application Layer

| Control | Estado | Implementacion |
|---------|--------|----------------|
| Row Level Security (RLS) | Activo | PostgreSQL policies por `tenant_id` en todas las tablas |
| JWT Authentication | Activo | Supabase Auth — access token 1hr, refresh 7d |
| CORS Policies | Activo | Restrictivas por dominio en Vercel |
| Rate Limiting | Activo | Por IP + API key (MedCare: 5 bookings/hr, 30 availability/min) |
| Input Validation | Activo | Zod schemas en API routes |
| CSRF Protection | Activo | SameSite cookies + origin validation |

### Transport Layer

| Control | Estado | Implementacion |
|---------|--------|----------------|
| HTTPS/TLS 1.3 | Activo | Let's Encrypt via Vercel (auto-renovacion) |
| HSTS | Activo | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| X-Content-Type-Options | Activo | `nosniff` — previene MIME sniffing |
| X-Frame-Options | Activo | `DENY` — previene clickjacking |
| X-XSS-Protection | Activo | `1; mode=block` |
| Referrer-Policy | Activo | `strict-origin-when-cross-origin` |
| Permissions-Policy | Activo | camera, microphone, geolocation deshabilitados |

### Data Layer

| Control | Estado | Implementacion |
|---------|--------|----------------|
| Encryption at rest | Activo | AES-256 (Supabase managed) |
| Encryption in transit | Activo | TLS 1.3 |
| Backups automaticos | Activo | PITR cada 1hr (Supabase) |
| Secrets management | Activo | Environment variables — nunca en codigo |
| Connection pooling | Activo | PgBouncer (puerto 6543) |

---

## OWASP Top 10 — Mitigacion

| # | Vulnerabilidad | Mitigacion StratosCore |
|---|---------------|----------------------|
| A01 | Broken Access Control | RLS policies en PostgreSQL. Cada query filtra por tenant automaticamente. Middleware valida sesion. |
| A02 | Cryptographic Failures | TLS 1.3 en transito. AES-256 en reposo. JWT con rotacion. Secrets en env vars. |
| A03 | Injection | Supabase client usa parameterized queries. Zod valida inputs. No SQL raw en API routes. |
| A04 | Insecure Design | Multi-tenant con aislamiento por RLS. Principio de minimo privilegio en API keys. |
| A05 | Security Misconfiguration | Headers de seguridad en middleware. CORS restrictivo. No default credentials. |
| A06 | Vulnerable Components | Dependabot activo. `npm audit` en CI. Next.js y Supabase en versiones LTS. |
| A07 | Auth Failures | Supabase Auth maneja bruteforce protection, account lockout, y secure password hashing (bcrypt). |
| A08 | Data Integrity Failures | Vercel deploy desde `main` branch. No deploy manual. Git history immutable. |
| A09 | Logging & Monitoring | Vercel logs + PM2 logs para agent-server. Source maps para stack traces. |
| A10 | SSRF | No fetch a URLs proporcionadas por usuario. APIs externas con whitelist (Huli, OpenRouter). |

---

## Manejo de datos medicos (MedCare)

MedCare maneja datos de pacientes (nombre, telefono, citas medicas). Controles adicionales:

- RLS en `medcare_leads` y `medcare_servicios` — solo accesibles con autenticacion
- Rate limiting estricto: 5 bookings/hora por IP
- Datos de pacientes NO incluyen historial clinico, diagnosticos, ni imagenes medicas
- Webhooks de Huli validados con `HULI_WEBHOOK_SECRET`
- Acceso al dashboard MedCare requiere autenticacion Supabase

### Datos que SI almacenamos
- Nombre, telefono, email del paciente
- Fecha y tipo de cita agendada
- Estado del lead (nuevo, contactado, cita_agendada, completado)

### Datos que NO almacenamos
- Resultados de estudios (mamografia, ultrasonido)
- Historial clinico
- Imagenes medicas
- Diagnosticos

---

## Procedimiento de respuesta a incidentes

### Severidad 1 — Critica (datos expuestos, sistema caido)
1. Desactivar el endpoint/modulo afectado (Vercel: revert deploy)
2. Notificar a Carlos Mario inmediatamente
3. Identificar alcance del incidente
4. Documentar en `docs/INCIDENT-[fecha].md`
5. Aplicar fix y deploy
6. Post-mortem en 24hrs

### Severidad 2 — Alta (vulnerabilidad encontrada, sin explotacion)
1. Documentar hallazgo
2. Aplicar fix en < 24hrs
3. Verificar que no fue explotada (revisar logs)

### Severidad 3 — Media (mejora de seguridad)
1. Agregar a backlog
2. Implementar en siguiente sprint

---

## Politica de rotacion de credenciales

| Credencial | Frecuencia | Responsable |
|------------|------------|-------------|
| Supabase API keys | Cada 90 dias o ante sospecha | Carlos Mario |
| Huli API key | Cada 90 dias | Carlos Mario |
| OpenRouter API key | Cada 90 dias | Carlos Mario |
| JWT secrets | Manejado por Supabase (auto) | Supabase |
| Telegram bot token | Ante sospecha | Carlos Mario |

---

## Auditorias

### Automatizadas
- `scripts/audit-rls.sql` — Verifica RLS activo en todas las tablas
- `npm audit` — Vulnerabilidades en dependencias
- Vercel Security Headers check — headers en cada deploy

### Manuales (programadas)
- OWASP ZAP scan — Trimestral (responsable: equipo de seguridad)
- RLS policy review — Mensual
- Dependency update review — Mensual

---

## Contacto de seguridad

Para reportar vulnerabilidades: contactar a Carlos Mario Lopez directamente.
No hay bug bounty program activo en este momento.
