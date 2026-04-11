# StratosCore — Runbook de Operaciones

> Guia para que CUALQUIER miembro del equipo pueda operar el sistema.
> Ultima actualizacion: 2026-04-10

---

## Acceso a servicios

| Servicio | URL | Credenciales |
|----------|-----|-------------|
| Vercel Dashboard | vercel.com/dashboard | Login con cuenta de Carlos |
| Supabase (Stratoscore-HQ) | supabase.com → proyecto `csiiulvqzkgijxbgdqcv` | Login con clopezd |
| Supabase (Lavanderia) | supabase.com → proyecto `noxdpibbmaujvhvhobef` | Login con clopezd |
| PM2 (Agent Server) | SSH al servidor | Ver .env del servidor |
| Telegram Bot | @stratoscore_bot | Token en .env del agent-server |

---

## Operaciones diarias

### Verificar que todo funciona

```bash
# Estado del agent server
pm2 status

# Logs recientes
pm2 logs stratoscore-agent --lines 50

# Health check de Business OS
curl -s https://stratoscore.app | head -5

# Estado de Supabase (desde el dashboard web)
# → verificar que el proyecto esta "Active"
```

### Reiniciar Agent Server

```bash
# Reiniciar sin perder estado
pm2 restart ecosystem.config.cjs --update-env

# Si PM2 no responde
pm2 kill
pm2 start ecosystem.config.cjs
```

### Deploy de Business OS

```bash
# Deploy automatico: cada push a main se deploya via Vercel
cd /home/cmarioia/proyectos/stratoscore-hq/business-os
git add [archivos]
git commit -m "descripcion del cambio"
git push origin main
# → Vercel detecta el push y deploya en ~60 segundos
```

### Deploy manual (si el automatico falla)

```bash
# Desde el directorio de business-os
npx vercel --prod
```

---

## Rollback

### Business OS (Vercel)

1. Ir a vercel.com/dashboard → proyecto business-os → Deployments
2. Encontrar el deploy anterior que funcionaba
3. Click en los "..." → "Promote to Production"
4. El rollback es instantaneo (< 5 segundos)

### Agent Server

```bash
# Ver historial de git
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
git log --oneline -10

# Revertir al commit anterior
git revert HEAD
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

### Base de datos (Supabase)

1. Ir a Supabase Dashboard → proyecto → Settings → Database
2. Point-in-Time Recovery: seleccionar fecha/hora antes del problema
3. **PRECAUCION**: Esto restaura TODA la base de datos a ese punto

---

## Revisar logs

### Business OS (Vercel)

1. vercel.com/dashboard → proyecto → Logs
2. Filtrar por "Error" para ver solo errores
3. O desde CLI: `npx vercel logs --follow`

### Agent Server (PM2)

```bash
# Logs en tiempo real
pm2 logs stratoscore-agent --lines 100

# Logs de error solamente
pm2 logs stratoscore-agent --err --lines 50

# Logs guardados en disco
ls ~/.pm2/logs/
cat ~/.pm2/logs/stratoscore-agent-error.log
```

### Supabase

1. Supabase Dashboard → Logs → API Logs
2. Filtrar por status code (4xx, 5xx)
3. Para queries lentas: Logs → Database → Query Performance

---

## Rotar API keys

### Supabase API Key

1. Supabase Dashboard → Settings → API
2. Regenerar `anon` key o `service_role` key
3. Actualizar en Vercel: Settings → Environment Variables
4. Actualizar en `.env.local` del desarrollo local
5. Redeploy: `git commit --allow-empty -m "rotate api keys" && git push`

### Huli API Key (MedCare)

1. Obtener nueva API key del panel de Huli
2. Actualizar `HULI_API_KEY` en Vercel Environment Variables
3. Redeploy

### OpenRouter API Key

1. openrouter.ai → API Keys → crear nueva
2. Actualizar `OPENROUTER_API_KEY` en Vercel y en agent-server .env
3. Redeploy Business OS + reiniciar agent-server

### Telegram Bot Token

1. Hablar con @BotFather en Telegram → /revoke → /token
2. Actualizar `TELEGRAM_BOT_TOKEN` en agent-server .env
3. `pm2 restart ecosystem.config.cjs --update-env`

---

## Emergencias

### El sitio esta caido

1. Verificar status.vercel.com — si Vercel esta caido, esperar
2. Verificar Supabase Dashboard — si el proyecto esta pausado, reactivar
3. Revisar Vercel Deployments — si el ultimo deploy fallo, hacer rollback
4. Revisar logs de errores en Vercel

### El bot de Telegram no responde

1. `pm2 status` — verificar que esta running
2. `pm2 logs stratoscore-agent --lines 20` — ver errores
3. `pm2 restart stratoscore-agent` — reiniciar
4. Si persiste: verificar que el token de Telegram es valido

### Un cliente reporta datos incorrectos

1. NO modificar datos directamente en produccion
2. Verificar en Supabase Dashboard → Table Editor
3. Documentar el issue
4. Aplicar fix via codigo y deploy

---

## Scheduled tasks

```bash
# Ver tareas programadas
cd /home/cmarioia/proyectos/stratoscore-hq/agent-server
npx tsx src/schedule-cli.ts list

# MedCare tiene crons en Vercel:
# /api/medcare/cron/confirmaciones — confirmar citas del dia siguiente
# /api/medcare/cron/recordatorios — recordatorios de citas
# /api/medcare/cron/reengagement — re-contactar leads frios
```

---

## Contactos

| Rol | Persona | Contacto |
|-----|---------|----------|
| Lead Architect | Carlos Mario | Telegram / WhatsApp |
| Security | [Sobrino] | [contacto] |
| Dev Support | [Hijo] | [contacto] |
