# Inventario de iconos — origen → Bionta — Icons (Task 12)

## Hallazgo
- Página "Icons" (`397:180`) del origen: solo scaffolding viejo (4 frames, 0 componentes). → ignorar / archivar.
- Página "🔣 Icons — v1" (`721:14429`): **1 SECTION `🔣 Icons — v1` (1400×800)** con los 20 icon components canónicos.
- Los "1351 components" del resumen eran instancias/variantes infladas — los componentes de icono reales son **20**.

## Estructura de cada icono
`COMPONENT "Icon / <name>"` (112×96) → frame `icon` 24×24 → frame `<name>` 24×24 → `VECTOR` 20×20 (fill sólido) + `TEXT` label.
Fills = colores planos, **NO bound a tokens** → copy-paste cross-file no rompe bindings.

## Estrategia: COPY-PASTE cross-file (manual)
Recrear vectores vía MCP sería frágil. Copy-paste preserva geometría exacta. 20 iconos = trivial.

## Los 20 componentes (Material Symbols + marca)
account_circle · arrow_forward · auto_awesome · check_circle · eco · event · expand_less ·
expand_more · inventory_2 · local_shipping · lock_open · pause_circle · percent · redeem ·
savings · schedule · sell · shopping_cart · tune · **bionta** (marca — candidato a mover a 🏷 Logos)

## Pasos
1. [MANUAL] Origen, página "🔣 Icons — v1": seleccionar la SECTION `🔣 Icons — v1` → Cmd+C.
2. [MANUAL] Icons file, página "🔣 Icons — Material": Cmd+V.
3. [MCP] Verificar que llegan 20 componentes (Step 12.3).
4. [MANUAL/MCP] Mover `Icon / bionta` a 🏷 Logos (Task 13) si se decide.
