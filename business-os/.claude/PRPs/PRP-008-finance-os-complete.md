# PRP-008: Finance OS — Modulo Completo

> **Estado**: PENDIENTE
> **Fecha**: 2026-04-04
> **Proyecto**: Business OS — Finanzas Personales (Carlos Mario)

---

## Objetivo

Completar el modulo de finanzas personales para que sea un sistema CRUD full-stack funcional: APIs POST/PUT/DELETE en Next.js, endpoint de reportes mensuales, escritura de datos financieros desde el bot de Telegram via lenguaje natural, y multi-moneda USD/MXN operativo.

## Por Que

| Problema | Solucion |
|----------|----------|
| APIs solo son GET (read-only) — el frontend hace CRUD directamente via Supabase client, sin pasar por API routes | APIs RESTful completas (POST/PUT/DELETE) para transacciones, gastos mensuales, gastos anuales, categorias y cuentas |
| Bot de Telegram solo lee finanzas (/finanzas), no puede registrar gastos/ingresos | Agent Server con funciones de escritura: crear transacciones, gastos recurrentes y cuentas desde chat natural |
| Pagina de reportes mensuales llama a `/api/reportes/meses` que NO existe — siempre muestra "No hay reportes" | Crear endpoint `GET /api/finance/reportes/meses` que agrupa transacciones por mes |
| Multi-moneda existe en la UI (campo moneda/tasa_cambio) pero no se usa funcionalmente — todo se trata como USD | Conversion USD/MXN real con tasa configurable, summary que normaliza montos |
| Store Zustand definido con operaciones CRUD pero la pagina principal (`/finanzas`) no lo usa — usa useState local | Integrar el store Zustand existente en todas las paginas de finanzas |

**Valor de negocio**: Carlos puede registrar un gasto desde Telegram en 5 segundos ("gaste 50 dolares en comida"), ver reportes historicos por mes, y tener control real de multi-moneda.

## Que

### Criterios de Exito

- [ ] `POST /api/finance/transactions` crea una transaccion y retorna el objeto creado
- [ ] `PUT /api/finance/transactions/[id]` actualiza una transaccion
- [ ] `DELETE /api/finance/transactions/[id]` elimina una transaccion
- [ ] `POST/PUT/DELETE` funcional para gastos-mensuales, gastos-anuales, categorias y cuentas
- [ ] `GET /api/finance/reportes/meses` retorna array de meses con totales (ingresos, gastos, balance, count)
- [ ] Desde Telegram: "gaste 150 en comida con la tarjeta Personal" crea transaccion correcta en Supabase
- [ ] Desde Telegram: "agrega gasto mensual Netflix 15.99 dia 15 cuenta Personal" crea gasto_mensual
- [ ] Pagina `/finanzas` usa `useFinancesStore` en vez de useState local
- [ ] Multi-moneda: al crear transaccion en MXN se guarda moneda + tasa_cambio, summary muestra conversion
- [ ] `npm run build` pasa sin errores

### Comportamiento Esperado

**Flujo 1 — Registro desde Telegram:**
1. Carlos escribe en Telegram: "gaste 50 dolares en uber, cuenta Nequi"
2. El agente Claude interpreta: tipo=gasto, monto=50, moneda=USD, categoria=Transporte, cuenta=Nequi
3. Agent Server llama `POST /api/finance/transactions` con los datos
4. Responde: "Registrado: gasto $50 USD en Transporte (Uber) — cuenta Nequi"

**Flujo 2 — Gasto mensual desde Telegram:**
1. Carlos: "agrega gasto mensual: Spotify, $9.99, dia 15, cuenta Personal"
2. Agente interpreta y llama `POST /api/finance/gastos-mensuales`
3. Responde: "Gasto mensual agregado: Spotify $9.99/mes, dia 15, cuenta Personal"

**Flujo 3 — Reportes en UI:**
1. Carlos abre `/finanzas/finances/reports`
2. La pagina llama `GET /api/finance/reportes/meses`
3. Ve tarjetas por mes con ingresos, gastos, balance y conteo de transacciones

**Flujo 4 — Multi-moneda:**
1. Carlos: "gaste 1500 pesos en supermercado"
2. Sistema detecta MXN, aplica tasa (ej: 17.5), guarda monto=1500, moneda=MXN, tasa_cambio=17.5
3. Summary normaliza a USD: $85.71

---

## Contexto

### Referencias

- `src/features/finances/` — Feature completa con store, services, types, components
- `src/features/finances/services/transactions.ts` — CRUD completo via Supabase client (ya existe, pero client-side)
- `src/features/finances/store/financesStore.ts` — Zustand store con todas las operaciones CRUD
- `src/app/api/finance/` — Solo 3 endpoints GET: summary, transactions, categories
- `src/app/(main)/finanzas/page.tsx` — Pagina principal con CRUD directo via `createClient()` (no usa store ni API)
- `src/app/(main)/finanzas/finances/reports/page.tsx` — Llama a `/api/reportes/meses` que NO existe
- `agent-server/src/finance-client.ts` — Solo `getFinanceSummary()` (lectura)
- `agent-server/src/bot.ts` — Comando `/finanzas` solo lee, no tiene capacidad de escritura

### Arquitectura Propuesta

```
business-os/
├── src/app/api/finance/
│   ├── transactions/
│   │   ├── route.ts              ← GET (existe) + POST (nuevo)
│   │   └── [id]/route.ts         ← PUT + DELETE (nuevo)
│   ├── gastos-mensuales/
│   │   ├── route.ts              ← GET + POST (nuevo)
│   │   └── [id]/route.ts         ← PUT + DELETE (nuevo)
│   ├── gastos-anuales/
│   │   ├── route.ts              ← GET + POST (nuevo)
│   │   └── [id]/route.ts         ← PUT + DELETE (nuevo)
│   ├── categories/
│   │   ├── route.ts              ← GET (existe) + POST (nuevo)
│   │   └── [id]/route.ts         ← PUT + DELETE (nuevo)
│   ├── cuentas/
│   │   ├── route.ts              ← GET + POST (nuevo)
│   │   └── [id]/route.ts         ← PUT + DELETE (nuevo)
│   ├── reportes/
│   │   └── meses/route.ts        ← GET — reportes agrupados por mes (nuevo)
│   └── summary/route.ts          ← GET (existe, mejorar para multi-moneda)
│
agent-server/
├── src/
│   ├── finance-client.ts         ← Agregar funciones de escritura (POST/PUT/DELETE)
│   └── agent.ts                  ← Agregar tools de finanzas al system prompt del agente
```

### Modelo de Datos (existente — sin cambios de schema)

Las tablas ya existen en Supabase. Solo se necesitan las APIs:

```
transacciones: id, tipo, monto, categoria, descripcion, fecha_hora, cuenta, cuenta_destino, estado, moneda, tasa_cambio
gastos_mensuales: id, nombre_app, categoria, dia_de_cobro, monto, activo, cuenta
gastos_anuales: id, nombre_servicio, categoria, mes_de_cobro, dia_de_cobro, monto, activo, cuenta
finance_categories: id, nombre, tipo, icono, color, activo
cuentas: id, nombre, tipo, balance_inicial, fecha_corte, color, activa
```

**Multi-moneda:** Ya existe `moneda` (VARCHAR) y `tasa_cambio` (NUMERIC) en `transacciones`. Solo falta usarlos.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo fases. Las subtareas se generan al entrar a cada fase.

### Fase 1: APIs CRUD Completas

**Objetivo**: Crear endpoints POST/PUT/DELETE para las 5 entidades (transacciones, gastos-mensuales, gastos-anuales, categories, cuentas). Incluir validacion Zod en inputs.
**Validacion**: Cada endpoint responde correctamente via `curl`. `npm run build` pasa.

### Fase 2: API de Reportes Mensuales

**Objetivo**: Crear `GET /api/finance/reportes/meses` que agrupa transacciones por anio-mes y retorna totales. Conectar la pagina de reportes existente al nuevo endpoint.
**Validacion**: `/finanzas/finances/reports` muestra tarjetas por mes con datos reales.

### Fase 3: Integracion Zustand en UI

**Objetivo**: Refactorizar `/finanzas/page.tsx` para usar `useFinancesStore` y llamar a las nuevas APIs en vez de Supabase client directo. Eliminar duplicacion de estado local.
**Validacion**: La pagina principal funciona igual que antes pero usando store + APIs.

### Fase 4: Multi-Moneda Funcional

**Objetivo**: Implementar conversion USD/MXN en creacion de transacciones y en el summary. Tasa configurable (hardcoded inicial, luego configurable). UI muestra moneda original + equivalente USD.
**Validacion**: Crear transaccion en MXN, verificar que summary normaliza correctamente.

### Fase 5: Bot Telegram — Escritura de Finanzas

**Objetivo**: Agregar funciones de escritura en `finance-client.ts` (POST a las APIs). Actualizar el system prompt del agente para que interprete lenguaje natural financiero y use las funciones de escritura. Soportar: crear transaccion, crear gasto mensual, crear gasto anual.
**Validacion**: "gaste 50 en comida cuenta Personal" desde Telegram crea transaccion real en Supabase.

### Fase 6: Validacion Final

**Objetivo**: Sistema funcionando end-to-end
**Validacion**:
- [ ] `npm run build` exitoso
- [ ] Todos los endpoints CRUD responden correctamente
- [ ] Pagina de reportes muestra datos reales
- [ ] Store Zustand integrado en pagina principal
- [ ] Bot Telegram crea transacciones desde lenguaje natural
- [ ] Multi-moneda funcional (USD/MXN)
- [ ] Criterios de exito cumplidos

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

_(vacio — se llena durante ejecucion)_

---

## Gotchas

- [ ] La pagina `/finanzas/page.tsx` hace CRUD directo con `createClient()` — esto funciona porque no hay RLS estricto. Al migrar a APIs, asegurar que el service client tenga permisos.
- [ ] `finance-client.ts` en agent-server usa REST directo a Supabase (`ANALYTICS_SUPABASE_URL`). Las nuevas funciones POST deben llamar a las APIs de Business OS (`localhost:3000/api/finance/*`) o directamente a Supabase REST. Decidir cual patron usar.
- [ ] La pagina de reportes llama a `/api/reportes/meses` (sin prefijo `/finance/`). Hay que decidir si crear en esa ruta o en `/api/finance/reportes/meses` y actualizar el fetch.
- [ ] El bot Telegram no tiene "tools" formales — el agente Claude interpreta el mensaje y ejecuta via funciones. La integracion de escritura debe ser via system prompt + funciones en finance-client.
- [ ] Las tablas no tienen RLS habilitado (finanzas es personal de Carlos, no multi-tenant). No agregar RLS por ahora.
- [ ] `moneda` y `tasa_cambio` pueden ser null en transacciones existentes — tratar null como USD con tasa 1.0.

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes para monedas, tasas)
- NO omitir validacion Zod en inputs de usuario
- NO duplicar logica de CRUD entre API routes y services — los services client-side eventualmente pueden llamar a las APIs
- NO romper las paginas que ya funcionan (recurring, annual) mientras se refactoriza la principal

---

*PRP pendiente aprobacion. No se ha modificado codigo.*
