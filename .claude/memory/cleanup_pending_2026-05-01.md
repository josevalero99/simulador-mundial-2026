---
name: Cleanup pendiente — sesión 2026-05-01
description: Elementos del archivo Bionta Design marcados con 🗑 a la espera de validación del fundador antes de borrar/archivar
type: project
---

**Estado al cierre de sesión 2026-05-01.** Nada borrado todavía — el usuario validó cada lote pero pidió no ejecutar la deleción. Revisar y borrar/archivar cuando vuelva a tener tiempo.

## Lote 1: 13 componentes huérfanos vacíos

Vivían como Local Components sin parent (no visibles en canvas). Reagrupados en sección **`🗑 To delete (validar y borrar)`** (`730:18803`) en página `🏠 Design v2`, con prefix `🗑 BORRAR ·` y stroke rojo discontinuo. Cada uno con info adyacente (nombre, tamaño, hijos, instancias).

| ID | Nombre | Tamaño | Hijos | Instancias |
|---|---|---|---|---|
| `693:18844` a `693:18852` | Checkout/SubscriptionBanner | 720×100 | 0 | 0 |
| `693:18854`, `693:18856`, `693:18863`, `693:18866`, `693:18870` | Checkout/SubscriptionBanner | 100×100 | 0 | 0 |
| `693:18864`, `693:18865` | Test | 100×100 | 0 | 0 |
| `693:18868` | Checkout/SubscriptionBanner | 100×47 | 1 (text vacío) | 0 |

**Acción:** seleccionar todos en la sección y `Cmd+Backspace`. Después borrar la sección contenedora.

## Lote 2: 8 candidatos de duplicado / análisis histórico

Marcados con prefix **`🗑 SUGERENCIA ·`** y stroke rojo discontinuo en sus posiciones originales. NO borrados — son decisión del fundador.

| Tipo | id | Nombre original | Razón sugerida para borrar |
|---|---|---|---|
| FRAME | `644:4194` | Home v2 — Opción A · Tropical verde | El canónico es `01 — Home` (`696:22803`) usado en el journey |
| FRAME | `683:12762` | Home v2 — Migrated | Reemplazado por `01 — Home` |
| FRAME | `675:676` | Home v2 — Desktop 1440 (en `99.Things`) | Otro duplicado en página de scratch |
| SECTION | `683:8217` | Design analysis (18 361 × 8 984) | Auditoría histórica, info ya en `.claude/memory/` |
| SECTION | `681:1625` | Componentización — Auditoría (Home / 300:2840) | Histórico, info en memory |
| SECTION | `681:1873` | Home Audit — Product Lens · 2026-04-23 | Histórico, info en memory |
| SECTION | `681:2456` | Bionta · Typography (showcase histórico) | Sistema vivo está en `Design System` page |
| SECTION | `681:1493` | logo (exploración inicial) | Exploración temprana |

## Lote 3: páginas legacy (decisión grande, no marcadas)

Páginas enteras pre-v2 que conservan contenido pero podrían archivarse. Volúmenes:

| Página | Top-level | Frames | Recomendación |
|---|---|---|---|
| `Home` | 3 | 208 frames, 24 instances | Pre-v2. Archivar o borrar |
| `Cart` | 3 | 375 frames, 114 instances | Pre-v2 cart |
| `Product` | 6 | 105 frames, 69 instances | PDPs pre-v2 |
| `Components` | 8 | 87 frames, 6 components, 9 instances | Pre-v2 DS — verificar refs antes |
| `Page design` | 39 | 726 frames | Sketch área |
| `99.Things` | 7 | 386 frames | Scratch por nombre |
| `Icons` (legacy) | 4 | Solo 4 vectores sueltos | Borrar — catálogo vivo está en `🔣 Icons — v1` |
| `Backoffice` | 1 | 102 frames | WIP temprano. Mantener si Sprint 1-2 va a usarlo |
| `🧩 Componentización — Auditoría` | 1 | — | Archivar (info en memory) |
| `🔤 Typography` | 1 | — | Archivar |
| `🧭 Home Audit — Product Lens` | 1 | — | Archivar |

Convención sugerida si se archiva en lugar de borrar: prefix `📦 ARCHIVO ·` en el nombre de la página.

## Lote 4: bug pendiente

- **Mango Tommy en Calendar** (`730:24739`): peak `[11, 0]` envuelve año → `min/max` calc renderiza barra ámbar de pico abarcando todo el año. Fix antes de meter datos reales: handler para rangos envolventes en peak igual que ya hay para `from > to` en disponibilidad.

## Lote 5: surfaces sin verificar (sospecha de placeholders grises)

El bug arreglado 2026-05-01 (cards "Lo que hoy está en su mejor momento" sin fotos) afectaba a la versión migrada. Aplicado fix a 4 home variants (journey + Migrated + Tablet + Mobile). **No verificadas** las siguientes — sospecha de tener thumbnails grises sin imagen real:

- `02a — PDP Cerrada` (`696:23079`) — hero product image, gallery
- `02b — PDP Personalizable` (`696:23266`) — hero, configurador
- `03 — Cart Page` (`696:23627`) — Cart items thumbnails
- `04 — Checkout` (`696:23809`) — order summary thumbnails
- `05 — Order Confirmation` (`696:23842`) — items resumen
- `06 — Mi Cuenta Dashboard` (`696:23912`) — order history

**Acción:** scan visual en Present mode + grep imageHash null en cada surface. ~5 min de trabajo.
