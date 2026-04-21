# TICO RESTORATION - Deployment a Vercel

**Dominio Final:** `TRestoration.stratoscore.app`

---

## 🚀 Opción 1: Deployment Automático (Recomendado)

Ejecuta este comando:

```bash
cd /home/user/stratoscore-hq
bash deploy-tico.sh
```

**Qué hace:**
- ✅ Verifica autenticación Vercel
- ✅ Deploya el proyecto
- ✅ Te da instrucciones para configurar el dominio

**Tiempo:** ~5 minutos

---

## 🎯 Opción 2: Deployment Manual (Si Opción 1 falla)

### Paso 1: Vercel Dashboard
```
https://vercel.com/dashboard/projects
```

### Paso 2: Importar Proyecto
1. Click "Add New" → "Project"
2. Busca: `stratoscore-hq`
3. Rama: `claude/tico-restoration-website-ntNPO`
4. Framework: Static
5. Click "Deploy"

### Paso 3: Configurar Dominio
1. Project Settings → Domains
2. Add Domain: `TRestoration.stratoscore.app`
3. Copia el CNAME que te da

### Paso 4: Actualizar DNS
En tu proveedor de dominio (donde registraste stratoscore.app):

```
Type: CNAME
Name: TRestoration
Value: (CNAME de Vercel)
TTL: 3600
```

### Paso 5: Esperar
Propagación DNS: 5-10 minutos

---

## ✅ Verificación

```bash
# Después de ~10 minutos, verifica:
curl -I https://TRestoration.stratoscore.app

# O abre en navegador:
https://TRestoration.stratoscore.app
```

Deberías ver tu página de TICO RESTORATION.

---

## 📊 Resultado

| Aspecto | Valor |
|---------|-------|
| **URL** | https://TRestoration.stratoscore.app |
| **Proyecto** | stratoscore-hq |
| **Rama** | claude/tico-restoration-website-ntNPO |
| **Proveedor** | Vercel |
| **Auto-deploy** | ✅ Activo (desde GitHub) |

---

## 🔄 Auto-Deploy desde GitHub

Cada vez que hagas push a `claude/tico-restoration-website-ntNPO`:
1. GitHub notifica a Vercel
2. Vercel redeploya automáticamente
3. Tu sitio se actualiza en ~1 minuto

**No necesitas hacer nada más.**

---

## 🆘 Si Algo Falla

### Puerto cerrado / Conexión rechazada
```bash
# Intenta con DNS diferente
nslookup TRestoration.stratoscore.app
```

### Dominio no resuelve
Espera más tiempo (hasta 24h en casos raros)

### Vercel no encuentra el proyecto
```bash
# Verifica que estés en rama correcta
git branch
git checkout claude/tico-restoration-website-ntNPO
```

---

## 📝 Después del Deployment

### Agregar Imágenes Reales
1. Descarga imágenes de Instagram (4K Video Downloader)
2. Guarda en: `tico_instagram/images/`
3. Edita: `tico_instagram/projects.json` con títulos/descripciones
4. Haz push a GitHub
5. Vercel redeploya automáticamente

### Personalizar la Página
Edita estos archivos:
- `index.html` - Página de inicio
- `docs/tico-restoration-dynamic.html` - Portfolio
- `tico_instagram/projects.json` - Datos de proyectos

Push → Auto-redeploy ✅

---

**¡Listo para deployment!** 🚀
