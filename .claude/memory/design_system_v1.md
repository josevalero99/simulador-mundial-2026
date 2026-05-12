---
name: Design System Bionta — v1 (Figma component library)
description: Catálogo de componentes Figma del DS Bionta v1 con IDs de Component Sets, ubicado en sección "🧩 Components — v1" (master `683:8218`)
type: project
---

**Construido el 2026-04-26** dentro del archivo Figma "Bionta Design", en la página `🏠 Design v2`, sección **"🧩 Components — v1"** (`683:8218`). A futuro toca mover los componentes a una página dedicada del archivo.

**Why:** Devs necesitan un catálogo claro y reutilizable para implementar Bionta v1.5. Se construyeron tras auditar 5 secciones (Home, PDP×2, Landing, Modales, Mi Cuenta) y consolidar patrones repetidos en componentes con variantes.

**How to apply:**
- Antes de crear UI nueva, comprobar si existe ya en el catálogo y usar instancia.
- Ampliar variantes existentes antes de crear nuevos componentes.
- Tokens canónicos: yellow `#FFC200`, green `#2F4A2B`, greenDark `#3D5A39`, dark `#1E1E1E`, cream `#FAF6EF`, creamAlt `#F1EBDE`.
- Yellow `#F2B441` que aparecía en Home → **deprecated**, migrar a `#FFC200`.

## Estructura

| Sección | id |
|---|---|
| 🧩 Components — v1 (master) | `683:8218` |
| L1 — Atoms (primitivos) | `683:8219` |
| L2 — Molecules | `683:8220` |
| L3 — Organisms (Cards & Modals) | `683:8221` |
| L4 — Page chrome (Nav/Footer/Sidebar) | `683:8222` |

## L1 — Atoms (10 sets · 74 variants)

| Component Set | id | Properties |
|---|---|---|
| Button | `683:8300` | Type (Primary/Secondary/Dark/Text/Social-Google/Social-Apple/Add) × Size (sm/md/lg) × Width (Hug/Fill) × Icon (None/Leading/Trailing) × State (Default/Disabled) |
| Input | `683:8326` | Type (Text/Password/Email/Newsletter-dark) × Size (md/lg) × Width × State (Default/Focus/Filled/Error/Disabled) |
| Checkbox | `683:8338` | Shape (Square/Round) × State (Off/On/Disabled) |
| Switch | `683:8346` | State |
| Pill | `683:8369` | Variant (Filled/Outline/Status/Counter) × Color × Size × Dot |
| Badge | `683:8377` | Color |
| QtyStepper | `683:8433` | Size × State |
| SegmentedControl | `683:8466` | Segments × Selected |
| PaginationDots | `683:8480` | Count × Active |
| Divider | `683:8486` | Orientation × Weight |

## L2 — Molecules (6 sets + 1 component · 29 variants)

| Component | id | Properties |
|---|---|---|
| Field | `683:8534` | Label × Helper × State × Required × Type |
| SectionHeader | `683:8568` | Eyebrow × Subhead × Align |
| PageHeader | `683:8596` | Subtitle × Action |
| Breadcrumb | `683:8662` | Levels |
| FAQItem | `683:8677` | State (Open/Closed) |
| Tabs | `683:8733` | Count × Selected |
| TrustColumn | `683:8739` | (single) |

## L3 — Organisms (7 sets · 25 variants)

| Component Set | id | Variants |
|---|---|---|
| Card / Producto | `683:8648` | Large × {None/CTA}, CompactRow × {None/Selectable/CTA} |
| Card / Tier-toggle | `683:8697` | sm/lg × Default/Selected (sirve para SizeBlock y Configurador Presets) |
| Card / Order | `683:8823` | Status (EnCurso/Entregado/Cancelado) |
| Card / Address | `683:8854` | State (Default/Predeterminada) |
| Card / Feature | `683:8911` | Hero/None, Hero/Circle, Compact/Circle |
| Card / Step | `683:8956` | Style (Light/Dark) |
| Modal / Auth | `683:9224` | Variant (Login/Registro/RecuperarPwd/EmailEnviado/NewPassword/LinkCaducado) |

## L4 — Page chrome (4 sets + 2 components · 19 variants)

| Component | id | Variants |
|---|---|---|
| Nav | `683:8940` | State (LoggedOut/LoggedIn) |
| Footer | `683:9055` | Variant (Full/Mínimo) |
| NewsletterBlock | `683:8958` | (single) |
| SidebarItem | `683:9097` | Icon (Home/Inventory/Location/Person/Logout) × State (Default/Active) |
| Sidebar | `683:9226` | (single, wraps 5 items) |
| OrderTimeline | `683:9373` | Step (1..4) |

## Total: 42 component sets/components, ~180 variants (DS v1 + Plan 1 Cart/Checkout)

## Componentes añadidos post-v1 (2026-04-26 tarde)

| Componente | id | Variants |
|---|---|---|
| ProductTag | `683:11053` | Filled / Outline (radius 6, 10px uppercase) |
| Card / Modalidad | `683:12759` | Cerrada/Personalizable × Selected Off/On (4 variants) |
| EmptyState | `683:12681` | NoOrders / NoAddresses / Generic (3 variants) |

## Migración no destructiva — sección `🔄 Migrated to DS — v1` (`683:12761`)

Las 5 páginas/familias se duplicaron y migraron a instancias de los components DS. Los originales quedaron intactos. IDs de las copias migradas:

| Frame migrado | id | Instances DS | Status |
|---|---|---|---|
| Home v2 | `683:12762` | 26 | ⚠️ Faltan section headers, social proof reviews |
| PDP Personalizable | `683:13177` | 45 | ✅ |
| PDP Cerrada | `683:13554` | 29 | ✅ |
| Landing | `683:13866` | ~20 | ⚠️ Footer está raw dentro Block 8 (necesita reorg) |
| Mi Cuenta · Dashboard | `683:14145` | 9 | ⚠️ nextOrderCard + quickActions skipped |
| Mi Cuenta · Pedidos | `683:14214` | 14 | ✅ |
| Mi Cuenta · Pedido detalle | `683:14333` | 13 | ✅ |
| Mi Cuenta · Direcciones | `683:14448` | 12 | ✅ |
| Mi Cuenta · Perfil | `683:14529` | 13 | ✅ |
| 6 Modales (Login/Reg/etc) | `683:14605..14718` | 6 (1 c/u) | ✅ |

## Plan 1 ejecutado (2026-04-26) — Cart + Checkout + Confirmation

13 componentes nuevos en sección master `683:8218`:

### L2 — Molecules (additions)

| Componente | id | Variants/Properties |
|---|---|---|
| Cart / Item | `693:18142` | Variant=Drawer/Page × Mode=Once/Subs (4 variants) |
| Cart / Summary | `693:18325` | Variant=DrawerCompact/PageExtended/CheckoutAside (3 variants) |
| Checkout / Section | `693:18820` | Properties: Eyebrow, Title, Header link, Show header link |
| Checkout / ExpressButtons | `693:19069` | (single — Apple Pay + Google Pay) |
| Checkout / SubscriptionBanner | `693:18891` | Properties: Title, Body |

### L5 — Cart (sub-section `693:18066`)

| Componente | id | Variants |
|---|---|---|
| Cart / Drawer | `693:18643` | State=Empty/SingleOnce/SingleSubs/Mixed (4 variants) |
| Cart / Cross-sell card | `693:18645` | (single) |
| Cart / Page (template) | `693:18656` | (template — frame con instances) |

### L6 — Checkout (sub-section `693:18067`)

| Componente | id | Notas |
|---|---|---|
| Checkout / Page (template) | `693:18914` | (template — frame con instances) |

### L7 — Order Confirmation (sub-section `693:18068`)

| Componente | id | Variants |
|---|---|---|
| OrderConfirmation / Hero | `693:19106` | Mode=Once-Guest/Subs-Guest/Mixed-Guest/Once-Logged/Subs-Logged (5 variants) |
| OrderConfirmation / SubscriptionCard | `696:20983` | (single) — recreado tras desaparición 2026-04-26 |
| OrderConfirmation / TrackingCard | `696:21003` | (single) — recreado |
| OrderConfirmation / AccountBanner | `696:21026` | Variant=MagicLink/Optional (2 variants) — recreado |
| OrderConfirmation / Page (template) | `696:21028` | (template) — recreado |

### Total Plan 1: 13 components / ~25 variants

### Logos oficiales integrados durante Plan 1
- Apple Pay logo monocromo en `Checkout / ExpressButtons`
- Google G logo multicolor en `Checkout / ExpressButtons`
- Logos Google/Apple oficiales también en Button atom Social-Google / Social-Apple (corregidos previamente)

## Decisiones / known gaps

- **Logo Bionta**: placeholder texto "BIONTA" en Nav y Footer brand col → reemplazar por SVG real.
- ~~Logos sociales (Google/Apple)~~ → resuelto 2026-05-01 (ver "Fixes post-build").
- **Disabled state**: implementado vía `opacity 0.4` en lugar de recolorear tokens. Más fácil de overridear en código.
- **Pill neutral filled** no existe en atoms — Tabs L2 usa frames raw como fallback (bg `#F5F5F5`). A iterar en v1.1 añadiendo `Pill / Filled / Neutral`.
- **Material icons**: todos importados via SVG path (no caracteres tipográficos ni primitivas). ViewBox 24×24.
- **No hay Hover state** — Figma no anima, así que solo Default/Disabled. Hover queda para CSS en código.
- ~~**Color tokens hardcoded**~~ → resuelto 2026-05-12 (ver [[color_tokens_system]]). 28 primitives + 36 semantic vars creadas, rebind 94.1% fills.
- **Text Styles** no creados — sizes/weights inline en cada componente. Promover Clash Display 12/14/16/18/22/40 Bold/Medium/Regular antes de v1.1.

## Atoms ya existentes (página Icons `397:180` — legacy)

Página antigua con 4 entradas: `plus`, `minus`, `delete-forever`, `shopping_cart`. Sustituida por catálogo nuevo `🔣 Icons — v1` (`721:14429`).

## Catálogo de iconos canónico — `🔣 Icons — v1` (`721:14429`)

**Creado 2026-05-01** como source-of-truth para Material Symbols outlined. 19 iconos como Components nombrados `Icon / [name]`, 24×24, instanciables. Sección root `721:14430`, grid `721:14433`.

| Icono | Component id | Icono | Component id |
|---|---|---|---|
| account_circle | `721:14439` | lock_open | `721:14499` |
| arrow_forward | `721:14445` | pause_circle | `721:14505` |
| auto_awesome | `721:14451` | percent | `721:14511` |
| check_circle | `721:14457` | redeem | `721:14517` |
| eco | `721:14463` | savings | `721:14523` |
| event | `721:14469` | schedule | `721:14529` |
| expand_less | `721:14475` | sell | `721:14535` |
| expand_more | `721:14481` | shopping_cart | `721:14541` |
| inventory_2 | `721:14487` | tune | `721:14547` |
| local_shipping | `721:14493` | bionta | `726:16267` |

**Nota eco**: el Component `Icon / eco` contiene el SVG `nature` (árbol) por preferencia explícita del usuario, no el `eco` canónico de Material.

**Bionta icon**: `Icon / bionta` (`726:16267`) usa el `leaf` legacy de la página "Design System" (`152:7228`) como base — 2 vectores, hoja con tallo. Brand green fill.

**How to apply**: para añadir un icono nuevo a una pantalla, instanciar desde este catálogo (ya no clonar inline desde otra pantalla). Si falta el icono, descargar SVG outlined de Material Symbols con URL `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/[name]/default/24px.svg` (wght400, opsz24, fill0), pegar como vector vía `figma.createNodeFromSvg`, convertir a Component con nombre `Icon / [snake_case]`, y añadir aquí.

## Fixes post-build

**2026-05-01 — Overflow de texto en toggles PDP**: ancho FIJO en componentes con texto HUG hacía que labels largas desbordaran. Patrón aplicado: container + segmento → HUG horizontal, padding H 16px.

| Componente | id | Cambio |
|---|---|---|
| SegmentedControl | `683:8466` (5 variants) | container 248→HUG, segmentos 120→HUG con padding H 16px. Afectaba Modalidad/Tamaño en PDP (8 instancias). |
| Card / Tier-toggle (sm) | `683:8682`, `683:8686` | container 146→HUG. LG variants (`683:8691`, `683:8696`) intactas — no desbordan y mantienen ancho intencional para grid Configurador. |

**Regla**: cualquier componente con label HUG dentro de container FIXED es candidato a desborde si el texto crece. Default a HUG en container salvo que la grid externa lo requiera FIXED.

**2026-05-01 — Logos sociales oficiales**: 8 frames placeholder (4 Google + 4 Apple) en páginas `🏠 Design v2` y `🔐 Auth + Mi Cuenta v1` reemplazados por clones de los assets oficiales del Button atom (`logo-google` `683:11028` y `logo-apple` `683:11033`). Eliminado el known gap "Logos sociales (Google/Apple): placeholders coloreados".

**2026-05-01 — Limpieza masiva de iconos inline**: 103 usos de iconos en las 4 páginas activas reemplazados por SVGs Material Symbols outlined oficiales descargados de Google Fonts (`wght400`, `opsz24`, `fill0`). Antes había mezcla de pesos (200/400), `local_shipping` filled, `tune` con icono `psychiatry` (cerebro). Fills preservados por icono. Excepción: 1 usage de `tune` (`644:4330`, 44×44 en Home v2) saltado por si era placeholder de planta brand.
