# 🏥 Mobility Group CR — Setup

Sistema de gestión integral para centro de rehabilitación robótica.

## 📊 Objetivo

Aumentar la ocupación del centro del **30% actual al 80%** mediante:
- Sistema de agendamiento online 24/7
- CRM médico para gestión de pacientes
- Automatizaciones de retención
- Analytics de ocupación

---

## 🚀 Instalación (Primera Vez)

### Paso 1: Aplicar Migración de Base de Datos

Conecta a tu Supabase Dashboard y ejecuta el SQL:

```bash
# Opción A: Desde Supabase Dashboard
1. Ir a https://supabase.com/dashboard/project/csiiulvqzkgijxbgdqcv/sql
2. Copiar contenido de: Mission-Control/supabase/migrations/004_mobility_tables.sql
3. Ejecutar

# Opción B: Desde CLI (si tienes supabase-cli instalado)
cd Mission-Control
supabase db push
```

**Esto crea:**
- ✅ Tabla `terapeutas` — Profesionales que atienden
- ✅ Tabla `equipos` — Lokomat, Armeo, etc.
- ✅ Tabla `pacientes` — Base de datos de pacientes
- ✅ Tabla `citas` — Sistema de agendamiento
- ✅ Tabla `leads_mobility` — Captación de leads
- ✅ Tabla `horarios_centro` — Horarios de apertura
- ✅ Vistas: `ocupacion_diaria`, `pacientes_proximo_vencimiento`
- ✅ Trigger automático: actualización de sesiones

---

### Paso 2: Verificar Instalación

```bash
cd Mission-Control
npm run dev
```

Abre: **http://localhost:3000/mobility**

Debes ver el dashboard con:
- Métricas de ocupación (0% inicial)
- Sección de próximas citas (vacía)
- Sección de renovaciones (vacía)

---

## 📋 Datos Iniciales

La migración crea automáticamente:

**3 equipos Lokomat:**
- `lokomat_1` — Lokomat Principal (Sala 1)
- `lokomat_2` — Lokomat 2 (Sala 2)
- `lokomat_3` — Lokomat 3 (Sala 3)

**Horarios del centro:**
- Lunes a Viernes: 8:00 AM - 6:00 PM
- Sábado: 8:00 AM - 1:00 PM
- Slots de 60 minutos

---

## 🎯 Flujo de Uso

### 1. Crear Terapeutas (Opcional)

Desde la consola de Supabase:

```sql
INSERT INTO terapeutas (nombre, email, especialidades, lokomat_certificado)
VALUES
  ('Dr. Carlos Rodríguez', 'carlos@mobility.cr', ARRAY['neurológico', 'ortopédico'], true),
  ('Dra. Ana Morales', 'ana@mobility.cr', ARRAY['pediátrico'], true);
```

### 2. Crear Pacientes

```sql
INSERT INTO pacientes (nombre, telefono, diagnostico, plan_sesiones)
VALUES
  ('Juan Pérez', '+50688887777', 'Lesión medular L4', 20),
  ('María González', '+50688886666', 'Rehabilitación post-ACV', 30);
```

### 3. Agendar Citas

```sql
INSERT INTO citas (paciente_id, equipo_id, fecha_hora, tipo_sesion)
VALUES
  (
    (SELECT id FROM pacientes WHERE nombre = 'Juan Pérez' LIMIT 1),
    'lokomat_1',
    '2026-03-13 09:00:00+00',
    'rehabilitacion'
  );
```

---

## 📊 Métricas Disponibles

### Vista: `ocupacion_diaria`
```sql
SELECT * FROM ocupacion_diaria ORDER BY fecha DESC LIMIT 7;
```

Retorna:
- Fecha
- Sesiones ocupadas
- Equipos en uso
- % de ocupación

### Vista: `pacientes_proximo_vencimiento`
```sql
SELECT * FROM pacientes_proximo_vencimiento;
```

Retorna pacientes con ≤5 sesiones restantes (oportunidad de renovación).

---

## 🔄 Automatización: Actualización de Sesiones

Cuando una cita se marca como `completada`, el trigger automático:

1. ✅ Incrementa `sesiones_completadas` del paciente
2. ✅ Actualiza `sesiones_restantes`
3. ✅ Actualiza `fecha_ultima_sesion`

**Ejemplo:**
```sql
-- Completar una cita
UPDATE citas
SET estado = 'completada'
WHERE id = 'cita-uuid-aqui';

-- El paciente se actualiza automáticamente
```

---

## 🛠️ Próximos Pasos (Desarrollo)

### Semana 1 ✅ (Actual)
- [x] Migración de base de datos
- [x] Tipos TypeScript
- [x] Servicios de Supabase
- [x] Dashboard básico

### Semana 2 (Siguiente)
- [ ] Formulario de nuevo paciente
- [ ] Formulario de nueva cita
- [ ] Vista de calendario semanal
- [ ] Panel de gestión de equipos
- [ ] Recordatorios automáticos (WhatsApp/Email)

### Semana 3
- [ ] Sistema de leads (captación web)
- [ ] Flujos automatizados de renovación
- [ ] Dashboard de analytics avanzado
- [ ] Reportes descargables

### Semana 4
- [ ] Landing page pública
- [ ] Sistema de booking online (pacientes)
- [ ] Integración Twilio (WhatsApp Business)
- [ ] Campaña de contenido SEO

---

## 🔐 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:

- **Staff (admin/operador):** Acceso completo a todo
- **Pacientes (futuro):** Solo ven sus propias citas
- **Público:** Sin acceso (excepto horarios del centro)

---

## 📞 Contacto

**Cliente:** Mobility Group CR
**Ubicación:** Escazú, Oficentro Trilogía
**Equipos:** 3 Lokomat + robótica adicional
**Objetivo:** 30% → 80% ocupación

---

## 🐛 Troubleshooting

### Error: "relation 'pacientes' does not exist"
**Solución:** No se aplicó la migración. Ejecutar el SQL en Supabase Dashboard.

### Error: "permission denied for table pacientes"
**Solución:** Tu usuario no tiene rol `admin` o `operador`. Ejecutar:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'tu-user-id-aqui';
```

### Dashboard muestra 0% ocupación
**Normal:** No hay citas creadas todavía. Crear datos de prueba con los SQL de arriba.

---

**¡Sistema listo para producción!** 🚀
