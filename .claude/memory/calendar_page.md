---
name: Calendario de temporada — diseño y wiring
description: Página /calendario-temporada construida 2026-05-01 con Gantt anual de frutas. Estado, decisiones y bugs pendientes
type: project
---

**Creado 2026-05-01.** Frame Figma `07 — Calendario de temporada · Desktop 1440` (id `730:24739`) en sección `🎬 Prototype — User Journey v1`. Conectada desde Home (link "Ver calendario completo →" `696:22827` → NAVIGATE smart-animate 0.3s).

**Why this format:** se eligió Gantt anual (12 meses × frutas) sobre alternativas (grid mensual, vista por fruta). Razón: responde a "¿cuándo vuelve la papaya?" sin click, alinea con la tesis de estacionalidad de Bionta y diferencia frente a competencia que no expone seasonality. Decisión validada por el fundador 2026-05-01.

## Estructura

| Bloque | id | Notas |
|---|---|---|
| Hero | dentro de `730:24739` | Eyebrow "CALENDARIO DE TEMPORADA" amber, título "Cuándo está en su mejor momento.", claim |
| Breadcrumb | `735:3968` | `Home / Calendario de temporada` (Home clickable) |
| Filters | dentro | 5 chips estación (Todo el año active + Primavera/Verano/Otoño/Invierno) + search input con icono Material `search` SVG (NO emoji) |
| Gantt card | `730:24759` | Container cream, padding 24, radius 24. Header de meses + 12 filas de frutas |
| Today line | `735:3973` | Vertical 2px verde Bionta @ 70% opacity, x = centro de columna MAY |
| Today pill | `735:3939` | Pill verde con texto cream "HOY · MAY", absolute-positioned como sibling de gantt card (no dentro), 8px de aire por encima del card top |
| Legend | dentro | Pico de temporada (amber) · Disponible (verde @ 55%) · Hoy (dark) |
| CTA section | dentro | Verde Bionta full-bleed, "No te pierdas la temporada." + botón "Empezar suscripción →" |
| Newsletter | dentro | Input email + botón Suscribirme |
| Footer | dentro | Cloned del Home |

## Datos placeholder (reemplazar por reales en v1)

12 frutas hardcoded en el código que generó la página. Estructura `{ name, origin, from, to, peak[] }` donde `from/to/peak` son índices 0-11 de meses.

| Fruta | Origen | Window | Peak |
|---|---|---|---|
| Mango Ataulfo | Málaga · España | mar–sep | abr–jun |
| Papaya Formosa | Canarias · España | todo el año | abr–ago |
| Piña Victoria | Costa Rica | feb–jul | abr–jun |
| Maracuyá | Colombia | mar–oct | may–ago |
| Mango Kent | Perú | dic–mar (envuelve) | ene–feb |
| Carambola | Brasil | sep–dic | oct–nov |
| Pitahaya roja | Colombia | jun–nov | ago–sep |
| Guayaba | Brasil | may–oct | jul–ago |
| Tamarindo | México | ene–may | feb–mar |
| Lichi | Madagascar | jun–ago | jul |
| Coco fresco | Costa de Marfil | todo el año | may–sep |
| Mango Tommy | Perú | nov–feb (envuelve) | dic–ene |

## Bug pendiente

**Mango Tommy peak rendering:** el cálculo simple `Math.min/max(peak)` para rangos envolventes (peak `[11, 0]`) genera una barra ámbar de pico que abarca todo el año en lugar de cubrir solo nov+dic+ene+feb. Fix: aplicar el mismo handler de wrap que ya existe para `from > to` en la barra verde de disponibilidad. El green bar de Mango Tommy sí está bien (dos segmentos nov→dic y ene→feb).

## How to apply

- Para añadir más frutas: editar el array `fruits` en el script generador. Cada fruta = una row con label izquierdo (200 px) + track (12 × ~79 px).
- Para cambiar mes "actual": editar `TODAY_MONTH` (0-indexed). Mover `Today line` x y la `Today pill` x acorde.
- Mes width derivado de: `(content_width - 48 padding - 200 label) / 12 = 79.33 px`. Si cambia el ancho del page o del label izquierdo, recalcular.
- Layout es VERTICAL auto-layout en el page raíz, así que añadir secciones es seguro mientras se respete `layoutSizingHorizontal: FILL` en cada child.
