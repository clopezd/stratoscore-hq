# ConFIRMA - Análisis Técnico Completo
**Plataforma Inteligente de Aprobaciones**

---

## 📋 Resumen Ejecutivo

**Nombre:** ConFIRMA - Plataforma de Aprobaciones
**Empresa:** COFASA
**Tecnología Actual:** Microsoft Power Apps + SharePoint
**Objetivo:** Digitalizar flujos de aprobación, eliminar trámites en papel

---

## 🗂️ Modelo de Datos (SharePoint Lists)

### 1. **Registros de Aprobacion** (Tabla principal)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Integer | ID único |
| Título | Text | Título de la plantilla asignada |
| Asunto | Text | Asunto de la solicitud |
| Descripción | Text (Multiline) | Descripción detallada |
| Prioridad | Choice | "Alta", "Media", "Baja" |
| Estado | Choice | "Borrador", "Enviada", "Pendiente de Aprobacion", "Procesado", "Rechazado", "Cancelado" |
| APinf | Text | Información adicional del aprobador |
| Datos adjuntos | Attachments | Archivos adjuntos |
| Creado por | Person | Usuario solicitante |
| Creado | DateTime | Fecha de creación |
| Modificado por | Person | Último modificador |
| Modificado | DateTime | Última modificación |

### 2. **Matriz de Mantenimiento** (Plantillas de flujos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Integer | ID único |
| Título | Text | Nombre de la plantilla |
| Area | Text | Área de la empresa |
| Proceso | Text | Proceso asociado |
| Prioridad | Choice | Prioridad por defecto |
| Aprobadores | Person (Multiple) | Lista de aprobadores para este flujo |
| Estado | Choice | "Activo", "Inactivo" |

### 3. **Log de Aprobadores** (Registro de acciones)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Integer | ID único |
| Título | Text | Referencia a la solicitud |
| Aprobador | Person | Persona que aprobó/rechazó |
| Nivel | Number | Nivel de aprobación (1, 2, 3...) |
| Resultado | Choice | "Aprobado", "Rechazado", "Pendiente" |
| Fecha de Acción | DateTime | Cuándo se ejecutó la acción |
| Comentarios | Text | Observaciones del aprobador |

### 4. **Registros de Plantillas**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID | Integer | ID único |
| Nombre | Text | Nombre de la plantilla |
| Descripción | Text | Descripción de uso |
| Área | Text | Área aplicable |
| Estado | Choice | "Activa", "Inactiva" |

---

## 🎨 Pantallas de la App

### 1. **ScrInicio** (Home/Pantalla principal)
- **Función:** Pantalla de inicio con 2 opciones principales
- **Botones:**
  - "Solicitud de Aprobación" → Crear nueva solicitud
  - "Portal de Flujos" → Ver y gestionar flujos existentes
- **Información mostrada:**
  - Logo de la empresa
  - Fecha actual
  - Versión 2.0

### 2. **ScrCrg** (Carga/Loading)
- **Función:** Pantalla de entrada/login (inicio de la app)
- **Lógica:** Verifica si viene de un link de aprobación o es acceso normal

### 3. **ScrSolicitud** (Nueva Solicitud)
- **Campos del formulario:**
  - Solicitante (auto: User().FullName)
  - Asunto (text input)
  - Descripción (textarea)
  - Prioridad (radio buttons: Alta/Media/Baja)
  - Datos adjuntos (file upload)
  - Nivel de aprobación (dinámico)
  - Aprobadores por nivel (combo box, máx 3 por nivel)

- **Validaciones:**
  - No se puede agregar un aprobador duplicado
  - Máximo 3 aprobadores por nivel
  - Máximo 12 aprobadores totales
  - Los niveles deben ser consecutivos (no saltar del 1 al 3)

- **Acciones:**
  - Guardar como Borrador
  - Enviar solicitud (cambia estado a "Pendiente de Aprobacion")

### 4. **ScrSolicitud_1** & **ScrSolicitud_2** (Variantes de edición)
- **Función:** Editar solicitudes existentes (desde Borrador o modificar)

### 5. **InterfUsuario** (Portal de Flujos)
- **Función:** Dashboard central para gestionar solicitudes
- **Vistas/Tabs:**
  - Historial (Procesado)
  - Borradores
  - Pendientes
  - Rechazados
  - Cancelados

- **Filtros por estado:**
  - Usa colecciones locales: `Historico`, `Borrador`, `Pendiente`, `Rechazado`, `Cancelado`

### 6. **ScrFlujoPend** (Flujo Pendiente - Vista de Aprobador)
- **Función:** Pantalla para APROBAR/RECHAZAR solicitudes
- **Información mostrada:**
  - Datos de la solicitud
  - Nivel actual de aprobación
  - Historial de aprobaciones previas

- **Acciones del aprobador:**
  - Aprobar (pasa al siguiente nivel o finaliza)
  - Rechazar (cambia estado a "Rechazado")
  - Agregar comentarios

### 7. **ScrFlujoPro** & **ScrFlujoPro_1** (Flujo Procesado - Vista detallada)
- **Función:** Ver detalles de solicitudes ya procesadas
- **Información:**
  - Todos los aprobadores por nivel
  - Resultado de cada aprobación
  - Timestamps

---

## 🔄 Flujos de Trabajo

### Flujo 1: Crear Solicitud
```
Usuario → ScrInicio → Click "Solicitud de Aprobación"
       → ScrSolicitud → Llena formulario
       → Selecciona plantilla (opcional)
       → Asigna aprobadores por nivel
       → Guarda como "Borrador" o "Envía"
       → SharePoint: Registros de Aprobacion (nuevo item)
```

### Flujo 2: Aprobación Multi-Nivel
```
Solicitud "Enviada" → Estado = "Pendiente de Aprobacion"
                    → Notificación a Aprobadores Nivel 1

Aprobador Nivel 1 → Abre link → ScrFlujoPend
                  → Aprobar/Rechazar
                  → Si APROBADO: pasa a Nivel 2
                  → Si RECHAZADO: Estado = "Rechazado" (fin)

Aprobador Nivel N → Mismo flujo
                  → Si es último nivel y APROBADO: Estado = "Procesado"

Log de Aprobadores → Registra cada acción con timestamp
```

### Flujo 3: Portal de Flujos (Consulta)
```
Usuario → ScrInicio → Click "Portal de Flujos"
       → InterfUsuario → Tabs de estados
       → Filtros dinámicos (Borrador, Pendiente, Historial, etc.)
       → Click en item → ScrFlujoPro (detalle)
```

---

## 🧠 Lógica de Negocio Clave

### Variables Globales (App.OnStart)

```powerapps
// Colecciones de solicitudes por estado
ClearCollect(Historico, Filter('Registros de Aprobacion', Estado = "Procesado"))
ClearCollect(Borrador, Filter('Registros de Aprobacion', Estado = "Borrador"))
ClearCollect(Pendiente, Filter('Registros de Aprobacion', Estado = "Pendiente de Aprobacion" Or Estado = "Enviada"))
ClearCollect(Rechazado, Filter('Registros de Aprobacion', Estado = "Rechazado"))
ClearCollect(Cancelado, Filter('Registros de Aprobacion', Estado = "Cancelado"))

// Colección de aprobadores plana (agrupados por Título > Nivel)
ClearCollect(colAprobadoresPlana,
  Ungroup(
    ForAll(
      GroupBy('Log de Aprobadores', Título, GrupoPorTitulo),
      ForAll(
        GroupBy(GrupoPorTitulo, Nivel, GrupoPorNivel) As GrupoDeNivelActual,
        {
          Titulo: Title,
          Nivel: GrupoDeNivelActual.Nivel,
          Aprobadores: Concat(GrupoDeNivelActual.GrupoPorNivel, Aprobador & "; "),
          Resultado: First(GrupoDeNivelActual.GrupoPorNivel).Resultado
        }
      )
    ),
    Value
  )
)
```

### Validación de Aprobadores (ScrSolicitud)

```powerapps
// Botón "Agregar Aprobador" solo habilitado si:
DisplayMode = If(
  IsBlank(ComboBox3Aprobador.Selected) ||           // No ha seleccionado aprobador
  IsBlank(RadioGroup_2.Selected) ||                 // No ha seleccionado nivel
  CountRows(Aprobadores) = 12 ||                    // Límite de 12 aprobadores
  !IsBlank(LookUp(Aprobadores, Aprobador = ComboBox3Aprobador.Selected.DisplayName)) ||  // Ya existe
  CountRows(Filter(Aprobadores, Nivel = RadioGroup_2.Selected.Nivel)) >= 3 ||  // 3 por nivel
  !With({
    nivelSeleccionado: RadioGroup_2.Selected.Nivel,
    maxNivelActual: Max(Aprobadores, Nivel)
  }, nivelSeleccionado <= maxNivelActual + 1),      // Niveles consecutivos
  DisplayMode.Disabled,
  DisplayMode.Edit
)
```

### Uso de Plantillas

- Al seleccionar una plantilla de "Matriz de Mantenimiento":
  - Pre-llena Asunto (`_varasuntoplanti`)
  - Pre-llena Descripción (`_vardesplanti`)
  - Pre-llena Prioridad (`_varpriorilanti`)
  - Carga aprobadores sugeridos

---

## 🎯 Funcionalidades Principales

1. **Gestión de Solicitudes**
   - Crear, editar, eliminar solicitudes
   - Adjuntar archivos
   - Guardar borradores

2. **Flujos de Aprobación Multi-Nivel**
   - Hasta 12 aprobadores en total
   - Máximo 3 aprobadores por nivel
   - Niveles consecutivos obligatorios

3. **Plantillas Pre-configuradas**
   - Matriz de Mantenimiento define flujos comunes
   - Auto-completa datos al seleccionar plantilla

4. **Portal de Seguimiento**
   - Vista por estados (Borrador, Pendiente, Procesado, etc.)
   - Historial de aprobaciones
   - Búsqueda y filtros

5. **Notificaciones** (implícitas)
   - Links directos para aprobar (via email, asumido)
   - Parámetro "Link" en la URL detecta acceso de aprobador

---

## 📊 Estados de una Solicitud

```
Borrador → Enviada → Pendiente de Aprobacion
                   ↓
          [Aprobador Nivel 1]
                   ↓
         ┌─────────┴─────────┐
    Rechazado          [Nivel 2]
     (FIN)                ↓
                   [Nivel N]
                        ↓
                  ┌─────┴─────┐
              Rechazado   Procesado
               (FIN)         (FIN)
```

---

## 🔧 Integración Actual

- **Backend:** SharePoint Online (listas)
- **Autenticación:** Microsoft 365 (User().Email, User().FullName)
- **Notificaciones:** Probablemente Power Automate (no visible en .msapp)
- **Conectores:** Solo SharePoint (sin custom connectors)

---

## 📁 Archivos y Assets

- **Imágenes:**
  - `Home 1` - Imagen de fondo pantalla inicio
  - `Logo blanco` - Logo empresa (versión blanca)
  - `Logo blanco II` - Variante del logo
  - `ChatGPT Image...` - Banner superior

- **Tema:** `ConFIRMA` (custom theme)

---

## 🚀 Próximos Pasos para Migración

1. Crear esquema Supabase equivalente
2. Implementar API REST en Next.js
3. Migrar UI a React + shadcn/ui
4. Implementar autenticación (Supabase Auth)
5. Sistema de notificaciones (emails automáticos)
6. Panel de administración para plantillas

---

**Fecha de Análisis:** 2026-03-13
**Versión Power App:** 2.0
**Analizado por:** Claude Code (StratosCore HQ)
