---
name: Prototipo Figma — User Journey v1
description: Sección Prototype con flujo end-to-end clickable Home → PDP → Cart → Checkout → Confirmation → Mi Cuenta
type: project
---

**Creado 2026-04-26.** Sección Figma `🎬 Prototype — User Journey v1` (id `696:22802`) en página `🏠 Design v2 ` con 7 frames del customer journey conectados.

**How to apply:**
- Abrir en Figma Desktop, seleccionar Home (`696:22803`) → Present mode (`Cmd+Alt+Enter`) → click en CTAs para navegar.
- Flow start point: "Bionta — Customer Journey v1" — empieza en Home.
- 7 reactions ON_CLICK con SMART_ANIMATE 0.3s configuradas.

## Frames del journey (en orden)

| # | Frame | id | Source |
|---|---|---|---|
| 1 | 01 — Home | `696:22803` | clone Home v2 — Migrated |
| 2 | 02a — PDP Cerrada | `696:23079` | clone PDP Cerrada — Migrated |
| 3 | 02b — PDP Personalizable | `696:23266` | clone PDP Personalizable — Migrated |
| 4 | 03 — Cart Page | `696:23627` | detached Cart/Page template |
| 5 | 04 — Checkout | `696:23809` | detached Checkout/Page template |
| 6 | 05 — Order Confirmation | `696:23842` | clone OC/Page template |
| 7 | 06 — Mi Cuenta Dashboard | `696:23912` | clone Mi Cuenta · Dashboard — Migrated |

## Connections (reactions ON_CLICK)

| Source CTA | Source id | Destination |
|---|---|---|
| Home — "Comprar mi caja" | `696:22813` | PDP Cerrada |
| Home — "Ver fruta de esta semana" | `696:22814` | PDP Personalizable |
| PDP Cerrada — "Comprar esta caja" | `696:23112` | Cart Page |
| PDP Personalizable — "Personalizar mi caja" | `696:23296` | Cart Page |
| Cart — "Tramitar pedido →" | `I696:23641;693:18269` | Checkout |
| Checkout — "Pagar 122,55 €" | `696:23838` | Order Confirmation |
| OC — "Ir a Mi Cuenta" | `696:23910` | Mi Cuenta Dashboard |

## Gaps conocidos

- **Cart/PDP gap:** el cart no tiene productos "reales" — siempre muestra el mockup base (mixed cart 122,55 €). Para v1.1 conectar PDP add-to-cart con cart state real.
- **No hay drawer cart intermedio** entre PDP y Cart Page — vamos directo a `/carrito`. El drawer existe como component (`693:18643`) pero no está integrado al journey.
- **Configurador personalizable** no tiene flujo interactivo de "elegir 6 frutas". Por ahora click en "Personalizar mi caja" lleva directo a Cart.
- **Express checkout** (Apple Pay / Google Pay) sin reactions — son botones decorativos en el prototipo.
- **OC → Mi Cuenta** conecta a Dashboard pero el AccountBanner "Crear contraseña" no tiene reaction (se puede añadir si es prioridad).

## API notes (para futuras iteraciones)

- Para reactions desde plugin Figma: usar `node.setReactionsAsync()` con schema `{ trigger, actions: [{ type, destinationId, navigation, transition }] }`. NO `action` singular — usar `actions` plural (2025+ schema).
- `flowStartingPoints` se setea a nivel de PAGE: `figma.currentPage.flowStartingPoints = [{ nodeId, name }]`.
