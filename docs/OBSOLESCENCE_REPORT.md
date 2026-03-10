# Reporte: Tendencias de Mercado vs. Inventario Actual
> Generado: 2026-03-10 · Fuente: videndum_full_context + MARKET_CONTEXT.md
> Análisis cruzado: datos reales de DB (2020-2025) vs. inteligencia de mercado Videndum plc

---

## Resumen Ejecutivo

El portfolio activo de Videndum pasó de **744 SKUs en 2020 a 941 en 2024** (+26%), pero el revenue total se mantuvo prácticamente estancado (£154K → £157K, +2% acumulado). Esto señala **proliferación de SKUs sin crecimiento real**: más referencias vendiendo menos por unidad. El mercado se está fragmentando y la presión de precios china está comprimiendo márgenes en la base del portfolio.

**Book-to-Bill 2025 (Oct): 0.87** — por cada unidad que se factura, solo entran 0.87 nuevas órdenes. La empresa está consumiendo backlog.

---

## Parte 1: Tendencias detectadas

### T1 — Competencia china destruyendo el segmento ICC
**Impacto:** ❌ Severo · **Segmento afectado:** Media Solutions (44% del revenue)

SmallRig, Tilta y DJI están capturando el segmento ICC/prosumer (tripods, cages, gimbals, bags, accesorios de smartphone) con precios 30-70% inferiores y calidad creciente. La marca "premium justified" de Manfrotto y JOBY pierde relevancia para creadores de contenido que compran directo en Amazon/AliExpress.

**Señal en los datos:** El revenue por SKU del portfolio INV (Anton/Bauer batteries, segmento de precio unitario alto) se comporta mejor que PKG a nivel de intake/revenue ratio. Los PKGs de menor precio están mostrando mayor volatilidad.

---

### T2 — Transición IP/wireless: los ganadores son Teradek, no el portfolio legacy
**Impacto:** ✅ Positivo para Creative Solutions · ⚠️ Neutro/negativo para Production legacy

El mercado de IP broadcast crece al **17.6% CAGR** (el segmento más rápido). Teradek es el producto mejor posicionado de Videndum para capturar esto. Sin embargo, el hardware SDI de producción (pedestals, robótica SDI) está bajo presión de sustitución.

**Señal en los datos:** `AB8075007401` (INV, Anton/Bauer) pasó de £27,531 revenue (2022) → £4,168 (2024), una caída del **85% en 2 años**. Este es el declive más pronunciado de todo el portfolio con datos. Aun siendo el SKU #2 por revenue histórico acumulado, ya apenas genera actividad nueva.

---

### T3 — AI generativa: amenaza de mediano plazo para ICC, no inmediata en broadcast
**Impacto:** ⚠️ Latente · **Horizonte:** 2026-2028

Las plataformas de video generativo (Sora, Runway, Kling) amenazan con reducir la demanda de equipos físicos en segmentos de contenido sintético (B-roll, publicidad, redes sociales). Videndum descarta su impacto inmediato en broadcast premium, pero su propio management reconoce que el segmento ICC es el más expuesto.

**Implicación para el portfolio:** los SKUs del segmento de accesorios para creadores de contenido individual (tripods ligeros, rigs básicos, fondos) son los primeros en riesgo si la demanda de producción física cede frente al video AI.

---

### T4 — Aranceles US 2025: disrupción de canal, no destrucción de demanda
**Impacto:** ⚠️ Temporal pero severo · **Recovery:** H2 2025 / 2026

Los importadores y distribuidores pausaron pedidos ante la incertidumbre arancelaria. El revenue H1 2025 cayó -25% pero la demanda del usuario final sigue estable. Esto genera un "gap" temporal entre sell-in (facturación a canal) y sell-through (venta final).

**Señal en los datos:** El Book-to-Bill de Oct 2025 es 0.87, pero el Order Book acumulado de los Top 20 productos sigue positivo (ABS2058-107001 tiene 537 unidades en backlog). El canal está consumiendo stock, no cancelando proyectos.

---

## Parte 2: Productos con mayor riesgo de obsolescencia

### 🔴 Riesgo ALTO — Declive confirmado en datos

| Part Number | Cat. | Rev. 2022 | Rev. 2023 | Rev. 2024 | Caída 3 años | Señal de mercado |
|---|---|---|---|---|---|---|
| `AB8075007401` | INV | 27,531 | 7,806 | 4,168 | **-85%** | Battery legacy, posible modelo EOL o sustituido por nueva generación |
| `AB100101` | INV | 3,047 | 1,918 | 186 | **-94%** | Casi sin revenue en 2024; riesgo de descontinuación |
| `AB100201` | INV | 3,421 | 1,412 | 220 | **-94%** | Misma familia que AB100101, patrón gemelo |
| `AB8675011501` | INV | 1,907 | 1,319 | 0 | **-100%** | Sin revenue en 2024. Dead product o reemplazado |
| `ABS2150-000401` | INV | 1,060 | 1,149 | 32 | **-97%** | Caída casi total en 2024 |
| `ABS2150-000401` | PKG | 1,022 | 1,331 | 218 | **-84%** | Versión PKG también en colapso |
| `AB1018A01` | INV | 801 | 715 | 70 | **-91%** | Declive sistemático |
| `AB8675015701` | INV | 1,185 | 630 | 33 | **-97%** | Próximo a cero |
| `AB8675015801` | INV | 382 | 418 | 0 | **-100%** | Sin revenue en 2024 |

**Interpretación:** La mayoría son SKUs del prefijo `AB8675*` y `AB10*` — consistente con baterías o accesorios de energía de modelos legacy de Anton/Bauer. El portfolio de baterías está siendo renovado: los modelos viejos colapsan mientras los nuevos (presumiblemente) los reemplazan. Si quedan unidades en inventario físico de estos SKUs, **son candidatos inmediatos a provisión o liquidación**.

---

### 🟡 Riesgo MEDIO — Intake desproporcionado vs. Revenue (posible descontinuación silenciosa)

| Part Number | Cat. | Total Rev. | Total Intake | Ratio I/R | Señal |
|---|---|---|---|---|---|
| `ABS2054-100101` | PKG | 25,590 | 1,290 | 0.05x | Revenue histórico alto pero intake mínimo → sin reposición de demanda |
| `ABV4162-107001` | PKG | 5,591 | 129 | 0.02x | Revenue residual, sin nuevos pedidos |
| `ABS2051-000101` | PKG | 5,933 | -62 | <0x | Intake NEGATIVO (devoluciones netas) |
| `AB8675016901` | PKG | 6,186 | 1,976 | 0.32x | Caída de £3,035 (2022) → £433 (2024) en PKG |

**Nota crítica:** `ABS2051-000101` tiene intake **negativo** (−62). Esto indica que las devoluciones superaron los nuevos pedidos en el período. Señal fuerte de producto en proceso de discontinuación o con problemas de calidad.

---

### 🟢 Portfolio sano — Demanda activa confirmada

| Part Number | Cat. | Order Book | Pipeline Pond. | Pipeline Factor |
|---|---|---|---|---|
| `ABS2058-107001` | PKG | 537 | 132.3 | 30% |
| `AB911601` | PKG | 277 | 30.0 | 32% |
| `ABS2051-000601` | PKG | 221 | 35.9 | 33% |
| `ABS2082-100001` | PKG | 180 | 39.0 | 33% |
| `AB1002M01` | INV | 27 | 4.2 | 41% |

Estos productos tienen **backlog confirmado y pipeline activo**. El factor de cierre en 30-41% indica oportunidades reales en negociación. Son el núcleo del portfolio de salud para 2025-2026.

---

## Parte 3: Nota sobre inventario físico (Global Inventory)

La tabla `global_inventory` contiene **1,894 part numbers únicos** con stock físico (usable qty). Sin embargo, un problema de mapeo de `catalog_type` (NULL en inventario vs. INV/PKG en revenue) impide cruzar estos datos directamente en la vista actual.

**Acción recomendada:** para identificar dead stock físico, ejecutar directamente:

```sql
SELECT gi.part_number, gi.quantity AS usable_qty,
       COALESCE(r.total_rev_2024, 0) AS rev_2024
FROM global_inventory gi
LEFT JOIN (
  SELECT part_number, SUM(quantity) AS total_rev_2024
  FROM videndum_records
  WHERE metric_type = 'revenue' AND year = 2024
  GROUP BY part_number
) r ON gi.part_number = r.part_number
WHERE gi.quantity > 0
ORDER BY COALESCE(r.total_rev_2024, 0) ASC
LIMIT 30;
```

---

## Conclusiones para el Gerente General

| Hallazgo | Urgencia | Acción sugerida |
|---|---|---|
| 9 SKUs con caída >84% en 2 años (revenue 2022→2024) | 🔴 Alta | Revisar si hay stock físico de estos SKUs → provisión contable |
| Book-to-Bill Oct 2025: 0.87 | 🟡 Media | Monitorizar mensualmente; si baja de 0.80 durante 3 meses → señal de alarma estructural |
| Pipeline factor promedio: 30-41% | 🟡 Media | Validar con equipo comercial; factor bajo = pipeline poco maduro |
| 1 producto con intake negativo (devoluciones netas) | 🔴 Alta | Investigar causa: ¿defecto de calidad? ¿EOL no comunicado? |
| SKU proliferación: +26% SKUs, +2% revenue (2020-2024) | 🟡 Media | Alineado con la estrategia de Videndum de reducir portfolio (2024-2025 restructuring) |
| Inventario físico no cruzable con pipeline (data gap) | 🟡 Media | Corregir `catalog_type` en global_inventory o ajustar la vista SQL |

---

*Fuentes de datos: videndum_full_context (Supabase), videndum_records, global_inventory, order_book, opportunities. Contexto de mercado: MARKET_CONTEXT.md*
