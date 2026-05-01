---
name: Prototipo Figma — User Journey v1
description: Sección Prototype con flujo end-to-end clickable Home → PDP → Drawer cart → Cart → Checkout → Confirmation → Mi Cuenta + Calendario
type: project
---

**Creado 2026-04-26**, ampliado **2026-05-01** con drawer cart, calendar, breadcrumbs y logo→Home. Sección Figma `🎬 Prototype — User Journey v1` (id `696:22802`) en página `🏠 Design v2 `.

**How to apply:**
- Abrir en Figma Desktop, seleccionar Home (`696:22803`) → Present mode (`Cmd+Alt+Enter`).
- Flow start point: "Bionta — Customer Journey v1" — empieza en Home.
- **IMPORTANTE — viewport:** cambiar el Device del prototipo a "Desktop" o "None" (no usar MacBook Pro 14"). Los frames son 1440 wide y MBP 14" preset es 1512 → upscale 5% que produce blur. Ver sección "Viewport gotcha" abajo.

## Frames del journey

| # | Frame | id | Notas |
|---|---|---|---|
| 1 | 01 — Home | `696:22803` | Imágenes de fruta reales aplicadas 2026-05-01 (antes eran placeholders grises) |
| 2 | 02a — PDP Cerrada | `696:23079` | Tiene breadcrumb |
| 3 | 02b — PDP Personalizable | `696:23266` | Tiene breadcrumb |
| 4 | 03 — Cart Page | `696:23627` | Breadcrumb añadido 2026-05-01 |
| 5 | 04 — Checkout | `696:23809` | Breadcrumb añadido 2026-05-01 |
| 6 | 05 — Order Confirmation | `696:23842` | Breadcrumb añadido 2026-05-01 |
| 7 | 06 — Mi Cuenta Dashboard | `696:23912` | Breadcrumb añadido 2026-05-01 |
| 8 | 07 — Calendario de temporada | `730:24739` | Nuevo 2026-05-01. Gantt 12 frutas × 12 meses |

## Drawer cart (overlays — añadidos 2026-05-01)

PDP CTAs ya **no navegan directo a Cart** — abren drawer overlay.

| Overlay | id | Producto |
|---|---|---|
| Drawer overlay — PDP Cerrada | `730:23835` | Caja Cerrada Grande |
| Drawer overlay — PDP Personalizable | `730:23877` | Caja Personalizable Grande |

Estructura: viewport 1440×900 con backdrop 50% black + drawer right-pinned 440×900. Drawer instance del componente `Cart / Drawer` variant `State=SingleOnce`.

## Connections (reactions ON_CLICK)

| Source CTA | Source id | Destination | Type |
|---|---|---|---|
| Home — "Comprar mi caja" | `696:22813` | PDP Cerrada | NAVIGATE smart-animate 0.3s |
| Home — "Ver fruta de esta semana" | `696:22814` | PDP Personalizable | NAVIGATE smart-animate 0.3s |
| Home — "Ver calendario completo →" | `696:22827` | Calendario | NAVIGATE smart-animate 0.3s |
| PDP Cerrada — "Comprar esta caja" | `696:23112` | Drawer overlay (Cerrada) | **OVERLAY DISSOLVE 0.3s** |
| PDP Personalizable — "Personalizar mi caja" | `696:23296` | Drawer overlay (Personalizable) | **OVERLAY DISSOLVE 0.3s** |
| Drawer · Tramitar pedido → | varía por overlay | Cart Page | NAVIGATE smart-animate 0.3s |
| Drawer · Ver carrito completo | varía | Cart Page | NAVIGATE smart-animate 0.3s |
| Drawer · × close | varía | — | CLOSE_OVERLAY |
| Drawer · Backdrop click | varía | — | CLOSE_OVERLAY |
| Cart — "Tramitar pedido →" | `I696:23641;693:18269` | Checkout | NAVIGATE smart-animate 0.3s |
| Checkout — "Pagar 122,55 €" | `696:23838` | Order Confirmation | NAVIGATE smart-animate 0.3s |
| OC — "Ir a Mi Cuenta" | `696:23910` | Mi Cuenta Dashboard | NAVIGATE smart-animate 0.3s |
| Logo Bionta (todos los frames excepto Home) | varía | Home | NAVIGATE smart-animate 0.3s |
| Breadcrumb "Home" (todas las páginas interiores) | varía | Home | NAVIGATE smart-animate 0.3s |

## Patrones consistentes

- **Logo Bionta de la nav navega siempre a Home** en todas las pantallas excepto la propia Home.
- **Breadcrumbs** en TODAS las páginas interiores. Patrón `Home / [Sección]`. "Home" clickable, página actual en gris muted. Texto Clash Display Medium 13 (Home) y Regular 13 (página actual). Posicionados justo debajo del Nav.

## Gaps conocidos (actualizado)

- ~~No hay drawer cart intermedio~~ → **Resuelto 2026-05-01** con overlays.
- **Cart no tiene productos "reales"** desde el drawer/PDP — drawer muestra "Caja Cerrada/Personalizable Grande" hardcodeado, Cart Page muestra mockup mixto 122,55 €. Conectar cart state en v1.1.
- **Configurador personalizable** no tiene flujo interactivo de "elegir 6 frutas". Click en "Personalizar mi caja" → drawer (mocked, no muestra selección).
- **Express checkout** (Apple Pay / Google Pay) sin reactions — decorativos.
- **Mango Tommy en Calendar** muestra barra de pico envolviendo todo el año (peak `[11,0]` → min/max calc no maneja wrap). Fix antes de meter datos reales.
- **OC → Mi Cuenta** conecta a Dashboard pero el AccountBanner "Crear contraseña" no tiene reaction.

## Viewport gotcha (importante)

- Frames del journey son **1440** wide (Desktop standard).
- Preset Figma "MacBook Pro 14"" es **1512 × 982** — upscaling 5% = blur visible.
- **Solución:** en panel Prototype del page → Device dropdown → "Desktop" (1440×1024) o "None".
- `prototypeDevice` es **read-only** en Plugin API → el cambio es manual.

## API notes (para futuras iteraciones)

- `node.setReactionsAsync()` schema: `{ trigger, actions: [{ type, destinationId, navigation, transition }] }`. Usar `actions` plural (2025+ schema), nunca `action` singular.
- **OVERLAY navigation NO acepta `SMART_ANIMATE` transition** — usar `DISSOLVE`. Razón: smart-animate compara layers entre source/destination y un overlay tiene contenido completamente distinto al frame de fondo. Si quieres animar matching elements, eso es `NAVIGATE`, no `OVERLAY`.
- `flowStartingPoints` se setea a nivel de PAGE: `figma.currentPage.flowStartingPoints = [{ nodeId, name }]`.
- `overlayPositionType` y `overlayBackgroundInteraction` también read-only desde plugin — set manualmente desde la UI si necesitas drawer right-pinned con scrim.
