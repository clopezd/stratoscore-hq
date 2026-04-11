# StratosCore — Production Readiness Checklist

> Usar antes de declarar un cliente "en produccion".
> Ultima actualizacion: 2026-04-10

---

## Checklist por cliente

### Infraestructura

- [ ] Dominio propio configurado (o subdominio de stratoscore.app)
- [ ] SSL/HTTPS activo y funcionando
- [ ] Variables de entorno configuradas en Vercel (produccion)
- [ ] Build pasa sin errores (`npm run build`)

### Seguridad

- [ ] RLS activo en TODAS las tablas del cliente (`scripts/audit-rls.sql`)
- [ ] Todos los endpoints admin requieren autenticacion (`requireAuth()`)
- [ ] Endpoints publicos tienen rate limiting
- [ ] No hay credenciales hardcodeadas en el codigo
- [ ] Headers de seguridad verificados (`curl -I https://dominio`)

### Datos

- [ ] Migraciones SQL aplicadas en produccion (`npx supabase db push`)
- [ ] Datos de prueba eliminados o separados de produccion
- [ ] Backups verificados (PITR activo en Supabase)

### Funcionalidad

- [ ] Flujo principal funciona end-to-end (login → dashboard → accion principal)
- [ ] Al menos 5 tests E2E pasando (Playwright)
- [ ] Paginas cargan en < 3 segundos
- [ ] Mobile responsive verificado

### Monitoring

- [ ] Vercel Analytics activo
- [ ] Error tracking configurado (logs accesibles)
- [ ] Health check endpoint respondiendo (`/api/[cliente]/health`)

### Usuario real

- [ ] Al menos 1 usuario real (no del equipo) ha usado el sistema
- [ ] Feedback recopilado y procesado
- [ ] Bugs criticos del feedback resueltos

---

## Estado por cliente

### Videndum

| Item | Estado | Nota |
|------|--------|------|
| Dominio | Pendiente | Usa stratoscore.app/videndum |
| SSL | OK | Via Vercel |
| RLS | Verificar | Correr audit-rls.sql |
| Auth en endpoints | OK | 8/9 con Supabase session |
| Tests E2E | Pendiente | 0 tests |
| Usuario real | Pendiente | Solo demos internas |

### Mobility

| Item | Estado | Nota |
|------|--------|------|
| Dominio | Pendiente | |
| SSL | OK | Via Vercel |
| RLS | Verificar | |
| Auth en endpoints | Parcial | 2 endpoints sin auth |
| Tests E2E | Pendiente | |
| Usuario real | Pendiente | |

### MedCare

| Item | Estado | Nota |
|------|--------|------|
| Dominio | Pendiente | medcare.cr no configurado |
| SSL | OK | Via Vercel |
| RLS | Verificar | Datos de pacientes — prioridad |
| Auth en endpoints | OK | 4 endpoints asegurados hoy |
| Rate limiting | OK | availability, booking |
| Integracion Huli | OK | Webhooks + citas funcionando |
| Tests E2E | Pendiente | |
| Usuario real | Parcial | Formulario publico activo |

### Bidhunter

| Item | Estado | Nota |
|------|--------|------|
| Dominio | N/A | Solo API + extension |
| SSL | OK | Via Vercel |
| RLS | Verificar | |
| Auth en endpoints | OK | 15 endpoints asegurados hoy |
| Extension auth | OK | X-Extension-Key configurado |
| Tests E2E | Pendiente | |
| Usuario real | Parcial | Carlos + Tico Restoration |

---

## Candidato mas cercano a produccion: MedCare

**Razon:**
- Integracion con sistema externo real (Huli)
- Formulario publico de agendamiento funcional
- Endpoints asegurados con auth
- Rate limiting implementado
- Datos reales de doctores y equipos

**Faltante para produccion:**
1. Dominio medcare.cr apuntando a Vercel
2. Correr audit-rls.sql y verificar tablas
3. 5 tests E2E minimos
4. 1 paciente real agendando via web
