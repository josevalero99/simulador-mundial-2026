# Inventario pre-migración — archivo origen `Bionta Design`

> Capturado 2026-05-31 vía MCP figma-console. File key origen: `v34S6c0aQGYqHY1eFIq48z`.
> Sirve de checklist verificable para validar la migración al final (Task 33).

## Variables (Task 2.2) — 79 variables en 3 collections ✅

| Collection | ID | Modos | Count |
|---|---|---|---|
| `Bionta / Typography` | `602:5160` | 1 (`Mode 1`) | 15 |
| `Bionta / Color Primitives` | `987:3211` | 1 (`Default`) | 28 |
| `Bionta / Color Semantic` | `987:3240` | 1 (`Default`) | 36 |

- ✅ Coincide con lo esperado: 28 primitives + 36 semantic + 15 typography.
- ⚠️ **Solo un modo por collection (no hay Dark).** Confirmado → en Capa 1 omitimos modo Dark (como anticipaba el plan).
- Las 36 semantic son **aliases** que apuntan a primitives (ej. `surface/brand` → `brand/yellow/500` `#FFC200`). Capturado con `resolveAliases` en `variables-source.json`.
- Datos completos (hex resueltos + aliasTo + keys) en `variables-source.json`.

## Design system (Task 2.3)

`figma_get_design_system_summary` reporta:

- **Totales: 1351 components · 69 component sets** ⚠️
- ⚠️ **Discrepancia con el plan:** el plan asumía "27 components / 147 variants". El número real es mucho mayor — la mayoría son **variantes de iconos** (la categoría Icon + los sets inflan el conteo). El "27/147" era una estimación del spec; el número real a migrar en Components (primitives+patterns, excluyendo iconos) hay que recalcularlo en Task 16.1 al clasificar.

Categorías detectadas (component / sets):

| Categoría | comp | sets |
|---|---|---|
| Icon | 20 | 0 |
| Card | 0 | 7 |
| Cart | 3 | 3 |
| OrderConfirmation | 2 | 2 |
| Checkout | 4 | 0 |
| Button | 0 | 1 |
| Badge & Chip | 0 | 1 |
| Checkbox | 0 | 1 |
| Checkbox + Text | 0 | 1 |
| Tooltip | 0 | 1 |
| Loader | 0 | 1 |
| Breadcrumbs (Item) | 0 | 1 |
| Breadcrumbs (Group) | 0 | 1 |
| Avatar | 0 | 1 |
| Navbar Bottom (Item) | 0 | 1 |

## Páginas (Task 2.4) — 20 páginas ⚠️

⚠️ **El archivo tiene 20 páginas, no las ~10 que listaba el plan.** Node IDs reales (válidos hoy):

| # | Node ID | Nombre |
|---|---|---|
| 1 | `300:2840` | Home |
| 2 | `333:156` | Cart |
| 3 | `300:3989` | Backoffice |
| 4 | `238:177` | Product |
| 5 | `147:2` | Design System |
| 6 | `397:180` | Icons |
| 7 | `147:3` | Components |
| 8 | `0:1` | Page design |
| 9 | `582:237` | 98. Cover |
| 10 | `300:3383` | 99.Things |
| 11 | `595:4888` | 🧩 Componentización — Auditoría |
| 12 | `602:5186` | 🔤 Typography |
| 13 | `603:5435` | 🧭 Home Audit — Product Lens |
| 14 | `606:6018` | 🏠 Design v2 |
| 15 | `779:3758` | Things |
| 16 | `619:8813` | 🛒 Product — PDPs |
| 17 | `666:5370` | 🔐 Auth + Mi Cuenta v1 |
| 18 | `670:470` | 🌿 Suscripción — Landing v1 |
| 19 | `721:14429` | 🔣 Icons — v1 |
| 20 | `1025:4437` | 🧪 Explorations |

### Notas de mapeo página → destino (para capas 3-4)

- Home canónico → pág. `603:5435` (🧭 Home Audit — Product Lens) ✅ coincide con plan Task 21.1
- Home v2 exploración → `606:6018` (🏠 Design v2)
- PDP → `238:177` (Product) + `619:8813` (🛒 Product — PDPs)
- Carrito → `333:156` (Cart)
- Mi Cuenta + Auth → `666:5370` (🔐 Auth + Mi Cuenta v1)
- Suscripción → `670:470` (🌿 Suscripción — Landing v1)
- Backoffice → `300:3989` (Backoffice)
- Componentización/Audit → `595:4888`
- Icons → `397:180` (Icons) + `721:14429` (🔣 Icons — v1)
- Typography → `602:5186`

### ⚠️ Páginas del plan que NO aparecen con los node IDs anotados

- **Calendario** — el plan (Task 26.1) citaba `730:24739`; **no existe esa página**. El Gantt de calendario debe estar como frame dentro de otra página (probablemente Home/Product) o se eliminó. **Resolver en Capa 3 antes de migrar Calendario.**
- **Prototype** — el plan (Task 27.1) citaba `696:22802`; **no existe esa página standalone**. El wiring del prototype debe vivir dentro de otra página. **Resolver en Capa 3.**
- Hay páginas "ruido" (`Page design`, `98. Cover`, `99.Things`, `Things`, `🧪 Explorations`) que son candidatas a → Archive o Exploraciones.
