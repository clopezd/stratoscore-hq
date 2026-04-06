# 🚀 Mission Control — Instrucciones de Instalación

## Paso 1: Ejecutar SQL en Supabase

1. **Abrir Supabase Dashboard:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto `csiiulvqzkgijxbgdqcv`

2. **Abrir SQL Editor:**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Copiar y Ejecutar SQL:**
   - Abre el archivo `EJECUTAR_EN_SUPABASE.sql`
   - Copia TODO el contenido
   - Pega en el editor de Supabase
   - Click en "Run" (o presiona Cmd/Ctrl + Enter)

4. **Verificar que funcionó:**
   Deberías ver un mensaje de éxito. Luego verifica las tablas:
   ```sql
   SELECT * FROM public.clients;
   SELECT * FROM public.activity_feed;
   ```

---

## Paso 2: Reiniciar el Servidor Next.js

```bash
# Desde business-os/
pkill -f "next dev"
npm run dev
```

---

## Paso 3: Acceder a Mission Control

1. **Abrir navegador:**
   ```
   http://localhost:3000/
   ```

2. **Iniciar sesión** (si no estás logueado)

3. **Deberías ver:**
   - ✅ Saludo personalizado ("Buenos días, Carlos")
   - ✅ Grid con 4 clientes: Videndum, Mobility, Totalcom, Finance
   - ✅ Quick Actions: My Tasks, Board, Overview
   - ✅ Activity Feed con últimas actividades

---

## 🎯 Estructura Final

```
/                    → Mission Control (hub central)
  /my-tasks          → Tus tareas
  /board             → Vista proyectos
  /settings          → Configuración

/videndum            → Dashboard Videndum (ya existe)
/mobility            → Dashboard Mobility (ya existe)
/totalcom            → Dashboard Totalcom (crear después)
/finance             → Finance OS (ya existe)
```

---

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined"
- Verifica que las tablas se crearon correctamente en Supabase
- Revisa que el RLS esté habilitado
- Verifica que tu sesión esté activa

### No aparecen los clientes
- Verifica el seed en Supabase: `SELECT * FROM public.clients;`
- Revisa la consola del navegador (F12) para errores

### Error 401 en /api/mission-control
- Tu sesión expiró, vuelve a iniciar sesión

---

## ✨ Próximos Pasos

Una vez que Mission Control funcione, puedes:

1. **Agregar más clientes** insertando en `public.clients`
2. **Personalizar métricas** editando los valores de cada cliente
3. **Crear dashboard de Totalcom** (si quieres)
4. **Agregar notificaciones** con nuevas actividades

---

## 📝 Archivos Creados

### Frontend
- `/src/features/mission-control/components/MissionControlDashboard.tsx`
- `/src/features/mission-control/components/ClientCard.tsx`
- `/src/features/mission-control/components/QuickActionCard.tsx`
- `/src/features/mission-control/components/ActivityFeed.tsx`
- `/src/features/mission-control/hooks/useMissionControl.ts`
- `/src/features/mission-control/types/index.ts`
- `/src/app/(main)/page.tsx`

### Backend
- `/src/app/api/mission-control/route.ts`

### Database
- `/supabase/migrations/010_mission_control_clients.sql`
- `EJECUTAR_EN_SUPABASE.sql` (versión simplificada)

---

**¿Todo listo?** Ejecuta el SQL en Supabase y luego accede a `http://localhost:3000/` 🚀
