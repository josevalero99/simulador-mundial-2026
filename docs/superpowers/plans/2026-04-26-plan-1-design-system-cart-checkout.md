# Plan 1 — Design System: componentes Cart + Checkout + Confirmation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear los 13 componentes Figma necesarios para Cart drawer + página `/carrito` + Checkout single-page + Confirmación, dejándolos listos como instancias para que devs implementen frontend.

**Architecture:** Componentes en archivo Figma `Bionta Design`, sección master `🧩 Components — v1` (`683:8218`). Sub-secciones existentes: `L2 — Molecules` (`683:8220`) y `L3 — Organisms` (`683:8221`). Cada componente como Component Set cuando tiene variants, o Component simple cuando no. Trabajo via Desktop Bridge MCP (`mcp__figma-console__figma_execute`).

**Tech Stack:**
- Figma Desktop + plugin Desktop Bridge
- Tools MCP: `mcp__figma-console__figma_execute`, `mcp__figma-console__figma_capture_screenshot`, `mcp__figma__get_screenshot`
- Tipografía: Clash Display (Bold / Medium / Regular)
- Tokens: yellow `#FFC200`, green `#2F4A2B`, dark `#1E1E1E`, cream `#FAF6EF`, etc.
- Material icons via `figma.createNodeFromSvg()`

**Spec referencia:** `docs/superpowers/specs/2026-04-26-cart-checkout-design.md`

---

## Pre-flight (todas las tasks)

Antes de cada `figma_execute` que cree texto:
```js
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });
```

Tokens canónicos a usar en TODAS las tasks:
```js
const T = {
  yellow:    { r: 1,     g: 0.7607843, b: 0     }, // #FFC200
  green:     { r: 0.184, g: 0.290,     b: 0.169 }, // #2F4A2B
  greenDark: { r: 0.239, g: 0.353,     b: 0.224 }, // #3D5A39
  cream:     { r: 0.980, g: 0.965,     b: 0.937 }, // #FAF6EF
  creamAlt:  { r: 0.945, g: 0.922,     b: 0.871 }, // #F1EBDE
  dark:      { r: 0.118, g: 0.118,     b: 0.118 }, // #1E1E1E
  borderDef: { r: 0.878, g: 0.878,     b: 0.878 }, // #E0E0E0
  borderSubtle:{ r: 0.651, g: 0.651,   b: 0.651 }, // #A6A6A6
  textMuted: { r: 0.42,  g: 0.42,      b: 0.42  }, // #6B6B6B
  white:     { r: 1,     g: 1,         b: 1     },
  red:       { r: 0.819, g: 0.263,     b: 0.263 }, // #D14343
  stepperBg: { r: 0.929, g: 0.929,     b: 0.929 }, // #EDEDED
};
```

---

## File Structure (Figma)

Antes de crear nada nuevo, ampliar la sección master con 3 sub-secciones nuevas para agrupar limpiamente:

```
🧩 Components — v1 (683:8218)
├── L1 — Atoms (683:8219)
├── L2 — Molecules (683:8220)
│   └── [añadir aquí: Cart/Item, Cart/Summary, Checkout/Section,
│        Checkout/ExpressButtons, Checkout/SubscriptionBanner]
├── L3 — Organisms (683:8221)
│   └── [existente]
├── L4 — Page chrome (683:8222)
├── L5 — Cart [NUEVA — drawer + page wrapper + cross-sell]
├── L6 — Checkout [NUEVA — page wrapper]
└── L7 — Order Confirmation [NUEVA — hero + subs card + tracking + account banner + page]
```

---

## Task 1: Crear sub-secciones L5/L6/L7

**Files:**
- Modify: Figma master section `683:8218`

- [ ] **Step 1: Verificar que el master section existe y leer su estructura**

```js
const master = await figma.getNodeByIdAsync('683:8218');
return { exists: !!master, name: master?.name, children: master?.children?.map(c => ({ id: c.id, name: c.name })) };
```

Expected: `master.name === '🧩 Components — v1'`, lista con L1/L2/L3/L4 ya presentes.

- [ ] **Step 2: Crear las 3 sub-secciones nuevas (L5, L6, L7)**

```js
const master = await figma.getNodeByIdAsync('683:8218');
const fases = [
  { name: 'L5 — Cart',                y: 7800,  h: 2000 },
  { name: 'L6 — Checkout',            y: 9900,  h: 1800 },
  { name: 'L7 — Order Confirmation',  y: 11800, h: 2200 },
];
const out = [];
for (const f of fases) {
  const sec = figma.createSection();
  sec.name = f.name;
  master.appendChild(sec);
  sec.x = 100;
  sec.y = f.y;
  sec.resizeWithoutConstraints(11800, f.h);
  out.push({ id: sec.id, name: sec.name });
}
return out;
```

Expected: 3 IDs nuevos. Anotarlos para uso en tasks posteriores (L5_ID, L6_ID, L7_ID).

- [ ] **Step 3: Capturar screenshot del master para verificar layout**

Usar `mcp__figma__get_screenshot` con `nodeId: '683:8218'`. Verificar que las 3 sub-secciones nuevas aparecen al final, sin solapar L1-L4.

---

## Task 2: Cart / Item (Component Set · 3 variants)

**Files:**
- Create: 1 Component Set en sub-sección `L2 — Molecules` (`683:8220`)

**Variants:**
- `Variant=Drawer, Mode=Once` — 380×variable, thumb 64×64, stepper, link Quitar, slot upsell
- `Variant=Drawer, Mode=Subs` — 380×variable, thumb 64×64, sin stepper, link Cambiar+Quitar, precio tachado
- `Variant=Page, Mode=Once` — 656×variable, thumb 96×96, sub-descripción, slot upsell
- `Variant=Page, Mode=Subs` — 656×variable, thumb 96×96, link Editar+Cambiar+Quitar
- Total: 4 variants representativas

- [ ] **Step 1: Inspeccionar spec sección 3 ("Cart Drawer") y sección 4 ("Página /carrito")**

Releer el bloque del spec sobre `Cart / Item`:
- Drawer: thumb 64×64, item gap 12, padding 12, bg white, radius 12.
- Page: thumb 96×96, item gap 16, padding 16, bg white, radius 12, sub-descripción visible.
- Pill discriminador: `once` cream con texto muted · `subs` verde filled white.

- [ ] **Step 2: Crear los 4 variants y combinarlos en Component Set**

```js
const T = { /* tokens del Pre-flight */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

// Helper: crea un pill de cantidad
const makePill = (label, mode) => {
  const f = figma.createFrame();
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.paddingLeft = 8; f.paddingRight = 8; f.paddingTop = 2; f.paddingBottom = 2;
  f.cornerRadius = 100;
  f.fills = mode === 'subs' ? [{ type: 'SOLID', color: T.green }] : [{ type: 'SOLID', color: T.creamAlt }];
  const t = figma.createText();
  t.fontName = { family: 'Clash Display', style: 'Bold' };
  t.fontSize = 10;
  t.letterSpacing = { value: 6, unit: 'PERCENT' };
  t.characters = label.toUpperCase();
  t.fills = [{ type: 'SOLID', color: mode === 'subs' ? T.white : T.textMuted }];
  f.appendChild(t);
  return f;
};

// Helper: crea un stepper sm
const makeStepper = () => {
  const f = figma.createFrame();
  f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(0, 26);
  f.cornerRadius = 100;
  f.fills = [{ type: 'SOLID', color: T.stepperBg }];
  f.paddingLeft = 2; f.paddingRight = 2; f.paddingTop = 2; f.paddingBottom = 2;
  for (const ch of ['−','1','+']) {
    const cell = figma.createFrame();
    cell.layoutMode = 'HORIZONTAL';
    cell.primaryAxisSizingMode = 'FIXED';
    cell.counterAxisSizingMode = 'FIXED';
    cell.primaryAxisAlignItems = 'CENTER';
    cell.counterAxisAlignItems = 'CENTER';
    cell.resize(22, 22);
    cell.fills = [];
    const t = figma.createText();
    t.fontName = { family: 'Clash Display', style: 'Bold' };
    t.fontSize = 12;
    t.characters = ch;
    t.fills = [{ type: 'SOLID', color: T.dark }];
    cell.appendChild(t);
    f.appendChild(cell);
  }
  return f;
};

// Helper: crea un Cart Item
const makeItem = (variant, mode) => {
  const isPage = variant === 'Page';
  const c = figma.createComponent();
  c.name = `Variant=${variant}, Mode=${mode}`;
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'AUTO';
  c.resize(isPage ? 656 : 380, 100);
  c.paddingLeft = isPage ? 16 : 12;
  c.paddingRight = isPage ? 16 : 12;
  c.paddingTop = isPage ? 16 : 12;
  c.paddingBottom = isPage ? 16 : 12;
  c.itemSpacing = isPage ? 16 : 12;
  c.fills = [{ type: 'SOLID', color: T.white }];
  c.cornerRadius = 12;
  c.counterAxisAlignItems = 'MIN';

  // Thumb
  const thumb = figma.createRectangle();
  thumb.name = 'thumb';
  thumb.resize(isPage ? 96 : 64, isPage ? 96 : 64);
  thumb.cornerRadius = 8;
  thumb.fills = [{ type: 'SOLID', color: T.borderDef }];
  c.appendChild(thumb);

  // Meta column
  const meta = figma.createFrame();
  meta.name = 'meta';
  meta.layoutMode = 'VERTICAL';
  meta.primaryAxisSizingMode = 'AUTO';
  meta.counterAxisSizingMode = 'FIXED';
  meta.layoutGrow = 1;
  meta.resize(isPage ? 528 : 280, 0);
  meta.itemSpacing = 8;
  meta.fills = [];

  // Top row (title+price)
  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.primaryAxisSizingMode = 'FIXED';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.layoutAlign = 'STRETCH';
  topRow.itemSpacing = 8;
  topRow.fills = [];
  topRow.counterAxisAlignItems = 'MIN';

  const titleBlock = figma.createFrame();
  titleBlock.layoutMode = 'VERTICAL';
  titleBlock.primaryAxisSizingMode = 'AUTO';
  titleBlock.counterAxisSizingMode = 'AUTO';
  titleBlock.itemSpacing = 4;
  titleBlock.fills = [];
  titleBlock.layoutGrow = 1;

  const title = figma.createText();
  title.fontName = { family: 'Clash Display', style: 'Bold' };
  title.fontSize = isPage ? 18 : 14;
  title.characters = mode === 'subs' ? 'Caja Personalizable Grande' : 'Caja Cerrada Grande';
  title.fills = [{ type: 'SOLID', color: T.dark }];
  titleBlock.appendChild(title);

  if (isPage) {
    const sub = figma.createText();
    sub.fontName = { family: 'Clash Display', style: 'Regular' };
    sub.fontSize = 13;
    sub.characters = 'Surtido tropical por Bionta · 7-9 frutas';
    sub.fills = [{ type: 'SOLID', color: T.textMuted }];
    titleBlock.appendChild(sub);
  }

  titleBlock.appendChild(makePill(mode === 'subs' ? 'Suscripción · cada 2 sem' : 'Compra única', mode));

  topRow.appendChild(titleBlock);

  // Price block
  const priceBlock = figma.createFrame();
  priceBlock.layoutMode = 'VERTICAL';
  priceBlock.primaryAxisSizingMode = 'AUTO';
  priceBlock.counterAxisSizingMode = 'AUTO';
  priceBlock.itemSpacing = 0;
  priceBlock.counterAxisAlignItems = 'MAX';
  priceBlock.fills = [];

  if (mode === 'subs') {
    const oldP = figma.createText();
    oldP.fontName = { family: 'Clash Display', style: 'Regular' };
    oldP.fontSize = 12;
    oldP.characters = '49,50 €';
    oldP.textDecoration = 'STRIKETHROUGH';
    oldP.fills = [{ type: 'SOLID', color: T.borderSubtle }];
    priceBlock.appendChild(oldP);
  }

  const price = figma.createText();
  price.fontName = { family: 'Clash Display', style: 'Bold' };
  price.fontSize = isPage ? 18 : 14;
  price.characters = mode === 'subs' ? '44,55 €' : '49,00 €';
  price.fills = [{ type: 'SOLID', color: T.dark }];
  priceBlock.appendChild(price);

  topRow.appendChild(priceBlock);
  meta.appendChild(topRow);

  // Actions row
  const actions = figma.createFrame();
  actions.layoutMode = 'HORIZONTAL';
  actions.primaryAxisSizingMode = 'AUTO';
  actions.counterAxisSizingMode = 'AUTO';
  actions.itemSpacing = 16;
  actions.counterAxisAlignItems = 'CENTER';
  actions.fills = [];

  if (mode === 'once') {
    actions.appendChild(makeStepper());
  }

  // Add link "Cambiar frecuencia" if subs, or skip
  if (mode === 'subs') {
    const link1 = figma.createText();
    link1.fontName = { family: 'Clash Display', style: 'Medium' };
    link1.fontSize = 13;
    link1.characters = isPage ? 'Editar selección' : 'Cambiar frecuencia';
    link1.textDecoration = 'UNDERLINE';
    link1.fills = [{ type: 'SOLID', color: T.dark }];
    actions.appendChild(link1);

    if (isPage) {
      const link2 = figma.createText();
      link2.fontName = { family: 'Clash Display', style: 'Medium' };
      link2.fontSize = 13;
      link2.characters = 'Cambiar frecuencia';
      link2.textDecoration = 'UNDERLINE';
      link2.fills = [{ type: 'SOLID', color: T.dark }];
      actions.appendChild(link2);
    }
  }

  // Always: Quitar link
  const remove = figma.createText();
  remove.fontName = { family: 'Clash Display', style: 'Medium' };
  remove.fontSize = 13;
  remove.characters = 'Quitar';
  remove.textDecoration = 'UNDERLINE';
  remove.fills = [{ type: 'SOLID', color: T.textMuted }];
  remove.layoutAlign = 'STRETCH';
  actions.appendChild(remove);

  meta.appendChild(actions);
  c.appendChild(meta);
  return c;
};

const variants = [
  makeItem('Drawer', 'Once'),
  makeItem('Drawer', 'Subs'),
  makeItem('Page', 'Once'),
  makeItem('Page', 'Subs'),
];

const moleculesSection = await figma.getNodeByIdAsync('683:8220');
const set = figma.combineAsVariants(variants, moleculesSection);
set.name = 'Cart / Item';

// Layout grid for variants
set.layoutMode = 'HORIZONTAL';
set.itemSpacing = 32;
set.paddingLeft = 32; set.paddingRight = 32; set.paddingTop = 32; set.paddingBottom = 32;
set.primaryAxisSizingMode = 'AUTO';
set.counterAxisSizingMode = 'AUTO';
set.fills = [];
set.strokes = [{ type: 'SOLID', color: T.borderDef }];
set.strokeWeight = 1;
set.dashPattern = [4, 4];

// Position: empty area in L2
set.x = 80;
set.y = 1500;

// Label above
const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Cart / Item';
label.fills = [{ type: 'SOLID', color: T.dark }];
moleculesSection.appendChild(label);
label.x = 80; label.y = 1470;

return { setId: set.id, count: variants.length };
```

- [ ] **Step 3: Validar visualmente con screenshot**

```js
return { setId: '<setId del paso anterior>' };
```

Usar `mcp__figma__get_screenshot` con el setId. Comparar contra el spec:
- Drawer/Once: thumb 64, stepper visible, "Quitar" gris.
- Drawer/Subs: thumb 64, sin stepper, precio tachado arriba + precio nuevo abajo.
- Page/Once: thumb 96, sub-descripción "Surtido tropical · 7-9 frutas" visible.
- Page/Subs: thumb 96, links "Editar selección" + "Cambiar frecuencia" + "Quitar".

Si algo no encaja, ajustar y volver a screenshot. Max 2 iteraciones antes de avanzar.

- [ ] **Step 4: Anotar el ID para Task 16 (memoria)**

Anotar: `Cart / Item = <setId>` para registrarlo en memoria al final del plan.

---

## Task 3: Cart / Summary (Component Set · 3 variants)

**Files:**
- Create: 1 Component Set en `L2 — Molecules` (`683:8220`)

**Variants:**
- `Variant=DrawerCompact` — width 332, footer del drawer (subtotal+envío+total+CTA)
- `Variant=PageExtended` — width 360, summary completo de página /carrito (con líneas separadas, ahorro suscripción, info microcopy)
- `Variant=CheckoutAside` — width 360, items list arriba + desglose + trust microcopy + promo

- [ ] **Step 1: Releer spec sección 3 footer drawer + sección 4 sticky summary + sección 5 checkout summary**

Diferencias clave:
- DrawerCompact: solo desglose (subtotal/envío/total) + CTA "Tramitar pedido →" + link "Ver carrito completo".
- PageExtended: Title "RESUMEN" + 4 líneas desglose (subtotal único, suscripción, ahorro, envío) + total + info microcopy (📅 próximo cobro · 🛡 cancela cuando quieras) + CTA + promo collapsable.
- CheckoutAside: Title "RESUMEN DEL PEDIDO" + items mini-list (thumb 48 + título + sub + pill + precio) + desglose + trust microcopy 3 líneas + promo input.

- [ ] **Step 2: Construir los 3 variants y combinar**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const makeRow = (label, value, opts = {}) => {
  const r = figma.createFrame();
  r.layoutMode = 'HORIZONTAL';
  r.primaryAxisSizingMode = 'FIXED';
  r.counterAxisSizingMode = 'AUTO';
  r.layoutAlign = 'STRETCH';
  r.primaryAxisAlignItems = 'SPACE_BETWEEN';
  r.fills = [];

  const lt = figma.createText();
  lt.fontName = { family: 'Clash Display', style: opts.bold ? 'Bold' : 'Regular' };
  lt.fontSize = opts.bold ? 16 : 14;
  lt.characters = label;
  lt.fills = [{ type: 'SOLID', color: opts.green ? T.green : T.dark }];
  r.appendChild(lt);

  const vt = figma.createText();
  vt.fontName = { family: 'Clash Display', style: opts.bold ? 'Bold' : 'Regular' };
  vt.fontSize = opts.bold ? 16 : 14;
  vt.characters = value;
  vt.fills = [{ type: 'SOLID', color: opts.green ? T.green : T.dark }];
  r.appendChild(vt);

  return r;
};

// Variant 1: DrawerCompact
const v1 = figma.createComponent();
v1.name = 'Variant=DrawerCompact';
v1.resize(332, 200);
v1.layoutMode = 'VERTICAL';
v1.primaryAxisSizingMode = 'AUTO';
v1.counterAxisSizingMode = 'FIXED';
v1.itemSpacing = 12;
v1.paddingLeft = 24; v1.paddingRight = 24; v1.paddingTop = 20; v1.paddingBottom = 20;
v1.fills = [];
v1.appendChild(makeRow('Subtotal', '49,00 €'));
v1.appendChild(makeRow('Envío', '4,90 €'));
const div1 = figma.createRectangle();
div1.resize(284, 1);
div1.fills = [{ type: 'SOLID', color: T.borderDef }];
div1.layoutAlign = 'STRETCH';
v1.appendChild(div1);
v1.appendChild(makeRow('Total', '53,90 €', { bold: true }));

const cta1 = figma.createFrame();
cta1.layoutMode = 'HORIZONTAL';
cta1.primaryAxisSizingMode = 'FIXED';
cta1.counterAxisSizingMode = 'AUTO';
cta1.primaryAxisAlignItems = 'CENTER';
cta1.counterAxisAlignItems = 'CENTER';
cta1.layoutAlign = 'STRETCH';
cta1.paddingTop = 12; cta1.paddingBottom = 12;
cta1.cornerRadius = 100;
cta1.fills = [{ type: 'SOLID', color: T.yellow }];
const cta1t = figma.createText();
cta1t.fontName = { family: 'Clash Display', style: 'Bold' };
cta1t.fontSize = 14;
cta1t.characters = 'Tramitar pedido →';
cta1t.fills = [{ type: 'SOLID', color: T.dark }];
cta1.appendChild(cta1t);
v1.appendChild(cta1);

const link1 = figma.createText();
link1.fontName = { family: 'Clash Display', style: 'Medium' };
link1.fontSize = 13;
link1.characters = 'Ver carrito completo';
link1.textDecoration = 'UNDERLINE';
link1.fills = [{ type: 'SOLID', color: T.dark }];
link1.textAlignHorizontal = 'CENTER';
link1.layoutAlign = 'STRETCH';
v1.appendChild(link1);

// Variant 2: PageExtended (similar pero más rico)
// ... [código análogo con líneas: Subtotal único, Suscripción 1ª caja, Ahorro suscripción green, Envío, Total]
// Title "RESUMEN" arriba.
// Info bloque con "📅 próximo cobro" + "🛡 cancela cuando quieras"
// CTA "Tramitar pedido →"
// Promo collapse "¿Tienes código de descuento? ▼"

// Variant 3: CheckoutAside
// Title "RESUMEN DEL PEDIDO"
// 3 mini-items con thumb 48
// Desglose
// Trust microcopy bloque verde claro 3 líneas
// Promo input + Aplicar

// (Por brevedad este ejemplo solo muestra variant 1 completa.
// El agente que ejecute esta task debe construir las 3 variants
// siguiendo el mismo patrón; código completo de las otras 2
// debe seguir el mismo helper makeRow + texts directos)

const moleculesSection = await figma.getNodeByIdAsync('683:8220');
const set = figma.combineAsVariants([v1, /* v2, v3 */], moleculesSection);
set.name = 'Cart / Summary';
set.layoutMode = 'HORIZONTAL';
set.itemSpacing = 32;
set.paddingLeft = 32; set.paddingRight = 32; set.paddingTop = 32; set.paddingBottom = 32;
set.primaryAxisSizingMode = 'AUTO';
set.counterAxisSizingMode = 'AUTO';
set.fills = [];
set.strokes = [{ type: 'SOLID', color: T.borderDef }];
set.strokeWeight = 1;
set.dashPattern = [4, 4];
set.x = 80;
set.y = 1900;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Cart / Summary';
label.fills = [{ type: 'SOLID', color: T.dark }];
moleculesSection.appendChild(label);
label.x = 80; label.y = 1870;

return { setId: set.id };
```

> **Nota implementador:** el código mostrado solo construye Variant 1 completa. Los Variants 2 (PageExtended) y 3 (CheckoutAside) se construyen análogamente: Variant 2 añade title eyebrow + desglose más rico (5 líneas incluyendo "Ahorro suscripción" en verde) + info microcopy con iconos + promo collapsable. Variant 3 sustituye desglose por items list en mini-cards (thumb 48×48 + meta + pill + precio) seguido del desglose habitual + trust microcopy en bloque verde claro + promo input directo (no collapsable).

- [ ] **Step 3: Screenshot validation**

Capturar screenshot del set. Validar:
- DrawerCompact: 4 líneas + CTA + link, ancho 332.
- PageExtended: 5+ líneas, ahorro en verde, info microcopy, promo collapsado.
- CheckoutAside: items mini-list arriba, desglose, trust 3 líneas con iconos.

- [ ] **Step 4: Anotar `Cart / Summary = <setId>`**

---

## Task 4: Cart / Drawer (Component Set · 4 variants)

**Files:**
- Create: 1 Component Set en `L5 — Cart` (Task 1)

**Variants:**
- `State=Empty` — empty state con icono + headline + body + CTA "Ver cajas"
- `State=SingleOnce` — 1 instance Cart/Item Drawer/Once + Cart/Summary DrawerCompact
- `State=SingleSubs` — 1 instance Cart/Item Drawer/Subs + banner próximo envío + Cart/Summary DrawerCompact
- `State=Mixed` — section labels "Compra única" / "Suscripción" + N items + Cart/Summary DrawerCompact

- [ ] **Step 1: Verificar dependencias creadas**

Confirmar que existen:
- `Cart / Item` (Task 2)
- `Cart / Summary` (Task 3)

Sin esos componentes no se puede crear el Drawer (usa instances).

- [ ] **Step 2: Construir los 4 variants**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const cartItemSet = await figma.getNodeByIdAsync('<ID Cart/Item de Task 2>');
const cartSummarySet = await figma.getNodeByIdAsync('<ID Cart/Summary de Task 3>');

const makeDrawer = (state) => {
  const c = figma.createComponent();
  c.name = `State=${state}`;
  c.resize(440, state === 'Empty' ? 540 : (state === 'Mixed' ? 720 : 600));
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.itemSpacing = 0;
  c.fills = [{ type: 'SOLID', color: T.cream, opacity: 0.95 }];
  c.effects = [{
    type: 'BACKGROUND_BLUR', radius: 20, visible: true,
  }];

  // Header
  const header = figma.createFrame();
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisSizingMode = 'FIXED';
  header.counterAxisSizingMode = 'AUTO';
  header.layoutAlign = 'STRETCH';
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.counterAxisAlignItems = 'CENTER';
  header.paddingLeft = 24; header.paddingRight = 24; header.paddingTop = 20; header.paddingBottom = 20;
  header.fills = [];

  const title = figma.createText();
  title.fontName = { family: 'Clash Display', style: 'Bold' };
  title.fontSize = 18;
  const counter = state === 'Empty' ? 0 : (state === 'Mixed' ? 3 : 1);
  title.characters = `Carrito (${counter})`;
  title.fills = [{ type: 'SOLID', color: T.dark }];
  header.appendChild(title);

  const close = figma.createText();
  close.fontName = { family: 'Clash Display', style: 'Regular' };
  close.fontSize = 18;
  close.characters = '×';
  close.fills = [{ type: 'SOLID', color: T.dark }];
  header.appendChild(close);

  c.appendChild(header);

  // Body por estado
  if (state === 'Empty') {
    const empty = figma.createFrame();
    empty.layoutMode = 'VERTICAL';
    empty.primaryAxisSizingMode = 'AUTO';
    empty.counterAxisSizingMode = 'FIXED';
    empty.layoutAlign = 'STRETCH';
    empty.layoutGrow = 1;
    empty.primaryAxisAlignItems = 'CENTER';
    empty.counterAxisAlignItems = 'CENTER';
    empty.itemSpacing = 12;
    empty.paddingLeft = 40; empty.paddingRight = 40; empty.paddingTop = 60; empty.paddingBottom = 60;
    empty.fills = [];

    const circle = figma.createFrame();
    circle.layoutMode = 'HORIZONTAL';
    circle.primaryAxisSizingMode = 'FIXED';
    circle.counterAxisSizingMode = 'FIXED';
    circle.primaryAxisAlignItems = 'CENTER';
    circle.counterAxisAlignItems = 'CENTER';
    circle.resize(64, 64);
    circle.cornerRadius = 999;
    circle.fills = [{ type: 'SOLID', color: T.green }];
    const ic = figma.createText();
    ic.fontName = { family: 'Clash Display', style: 'Regular' };
    ic.fontSize = 24;
    ic.characters = '🍊';
    circle.appendChild(ic);
    empty.appendChild(circle);

    const h4 = figma.createText();
    h4.fontName = { family: 'Clash Display', style: 'Bold' };
    h4.fontSize = 18;
    h4.characters = 'Tu carrito está vacío';
    h4.fills = [{ type: 'SOLID', color: T.dark }];
    empty.appendChild(h4);

    const body = figma.createText();
    body.fontName = { family: 'Clash Display', style: 'Regular' };
    body.fontSize = 14;
    body.characters = 'Empieza a llenarlo con tus cajas favoritas de fruta tropical.';
    body.fills = [{ type: 'SOLID', color: T.textMuted }];
    body.textAlignHorizontal = 'CENTER';
    body.resize(240, 36);
    empty.appendChild(body);

    // CTA "Ver cajas" — instance del Button atom
    const buttonSet = await figma.getNodeByIdAsync('683:8300');
    const primary = buttonSet.children.find(v => v.name.includes('Type=Primary, Size=md, Width=Hug, Icon=None, State=Default'));
    const ctaInst = primary.createInstance();
    const ctaLabel = ctaInst.findOne(n => n.type === 'TEXT');
    if (ctaLabel) ctaLabel.characters = 'Ver cajas';
    empty.appendChild(ctaInst);

    c.appendChild(empty);
  } else {
    // Body con items
    const body = figma.createFrame();
    body.layoutMode = 'VERTICAL';
    body.primaryAxisSizingMode = 'AUTO';
    body.counterAxisSizingMode = 'FIXED';
    body.layoutAlign = 'STRETCH';
    body.layoutGrow = 1;
    body.itemSpacing = 16;
    body.paddingLeft = 24; body.paddingRight = 24; body.paddingTop = 16; body.paddingBottom = 16;
    body.fills = [];

    // Insertar instance(s) de Cart/Item según el state
    const itemDrawerOnce = cartItemSet.children.find(v => v.name === 'Variant=Drawer, Mode=Once');
    const itemDrawerSubs = cartItemSet.children.find(v => v.name === 'Variant=Drawer, Mode=Subs');

    if (state === 'SingleOnce') {
      body.appendChild(itemDrawerOnce.createInstance());
    } else if (state === 'SingleSubs') {
      body.appendChild(itemDrawerSubs.createInstance());
      // Banner próximo envío
      const banner = figma.createFrame();
      banner.layoutMode = 'HORIZONTAL';
      banner.primaryAxisSizingMode = 'FIXED';
      banner.counterAxisSizingMode = 'AUTO';
      banner.layoutAlign = 'STRETCH';
      banner.cornerRadius = 8;
      banner.paddingLeft = 12; banner.paddingRight = 12; banner.paddingTop = 8; banner.paddingBottom = 8;
      banner.fills = [{ type: 'SOLID', color: T.yellow, opacity: 0.15 }];
      const t = figma.createText();
      t.fontName = { family: 'Clash Display', style: 'Regular' };
      t.fontSize = 12;
      t.characters = '📅 Próximo envío estimado: jueves 30 abr';
      t.fills = [{ type: 'SOLID', color: T.dark }];
      banner.appendChild(t);
      body.appendChild(banner);
    } else if (state === 'Mixed') {
      // Section "Compra única"
      const lblOnce = figma.createText();
      lblOnce.fontName = { family: 'Clash Display', style: 'Bold' };
      lblOnce.fontSize = 11;
      lblOnce.letterSpacing = { value: 6, unit: 'PERCENT' };
      lblOnce.characters = 'COMPRA ÚNICA';
      lblOnce.fills = [{ type: 'SOLID', color: T.textMuted }];
      body.appendChild(lblOnce);
      body.appendChild(itemDrawerOnce.createInstance());
      const item2 = itemDrawerOnce.createInstance();
      const item2Title = item2.findOne(n => n.type === 'TEXT' && n.characters === 'Caja Cerrada Grande');
      if (item2Title) item2Title.characters = 'Caja Cerrada Pequeña';
      const item2Price = item2.findOne(n => n.type === 'TEXT' && n.characters === '49,00 €');
      if (item2Price) item2Price.characters = '29,00 €';
      body.appendChild(item2);

      const lblSubs = figma.createText();
      lblSubs.fontName = { family: 'Clash Display', style: 'Bold' };
      lblSubs.fontSize = 11;
      lblSubs.letterSpacing = { value: 6, unit: 'PERCENT' };
      lblSubs.characters = 'SUSCRIPCIÓN';
      lblSubs.fills = [{ type: 'SOLID', color: T.textMuted }];
      body.appendChild(lblSubs);
      body.appendChild(itemDrawerSubs.createInstance());
    }

    c.appendChild(body);

    // Footer con Cart/Summary instance
    const summaryDrawer = cartSummarySet.children.find(v => v.name === 'Variant=DrawerCompact');
    if (summaryDrawer) c.appendChild(summaryDrawer.createInstance());
  }

  return c;
};

const variants = [
  await makeDrawer('Empty'),
  await makeDrawer('SingleOnce'),
  await makeDrawer('SingleSubs'),
  await makeDrawer('Mixed'),
];

const L5 = await figma.getNodeByIdAsync('<L5 ID de Task 1>');
const set = figma.combineAsVariants(variants, L5);
set.name = 'Cart / Drawer';
set.layoutMode = 'HORIZONTAL';
set.itemSpacing = 40;
set.paddingLeft = 40; set.paddingRight = 40; set.paddingTop = 40; set.paddingBottom = 40;
set.primaryAxisSizingMode = 'AUTO';
set.counterAxisSizingMode = 'AUTO';
set.fills = [];
set.strokes = [{ type: 'SOLID', color: T.borderDef }];
set.strokeWeight = 1;
set.dashPattern = [4, 4];
set.x = 80; set.y = 100;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Cart / Drawer';
label.fills = [{ type: 'SOLID', color: T.dark }];
L5.appendChild(label);
label.x = 80; label.y = 70;

return { setId: set.id };
```

- [ ] **Step 3: Screenshot validation**

Capturar set. Validar 4 estados:
- Empty: icono naranja + headline + body + botón "Ver cajas".
- SingleOnce: 1 item con stepper + summary drawer al fondo.
- SingleSubs: 1 item subs + banner amarillo + summary drawer.
- Mixed: 2 secciones con labels + N items + summary drawer.

- [ ] **Step 4: Anotar `Cart / Drawer = <setId>`**

---

## Task 5: Cart / Cross-sell card (Component)

**Files:**
- Create: 1 Component en `L5 — Cart`

- [ ] **Step 1: Releer spec sección 4, sub-sección "Cross-sell card"**

Specs: card 656×variable, bg verde `#2F4A2B`, color blanco, grid 2 cols (texto izq + visual der). Eyebrow "SUMA TU CAJA FAVORITA" yellow + headline 22 Bold + body 13 muted-cream + CTA yellow.

- [ ] **Step 2: Construir el component**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'Cart / Cross-sell card';
c.resize(656, 200);
c.layoutMode = 'HORIZONTAL';
c.primaryAxisSizingMode = 'FIXED';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 16;
c.paddingLeft = 20; c.paddingRight = 20; c.paddingTop = 20; c.paddingBottom = 20;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.green }];
c.counterAxisAlignItems = 'CENTER';

// Text column
const textCol = figma.createFrame();
textCol.layoutMode = 'VERTICAL';
textCol.primaryAxisSizingMode = 'AUTO';
textCol.counterAxisSizingMode = 'FIXED';
textCol.layoutGrow = 1;
textCol.itemSpacing = 8;
textCol.fills = [];

const eyebrow = figma.createText();
eyebrow.fontName = { family: 'Clash Display', style: 'Bold' };
eyebrow.fontSize = 10;
eyebrow.letterSpacing = { value: 8, unit: 'PERCENT' };
eyebrow.characters = 'SUMA TU CAJA FAVORITA';
eyebrow.fills = [{ type: 'SOLID', color: T.yellow }];
textCol.appendChild(eyebrow);

const h4 = figma.createText();
h4.fontName = { family: 'Clash Display', style: 'Bold' };
h4.fontSize = 22;
h4.characters = '¿Quieres añadir otra caja?';
h4.fills = [{ type: 'SOLID', color: T.white }];
textCol.appendChild(h4);

const body = figma.createText();
body.fontName = { family: 'Clash Display', style: 'Regular' };
body.fontSize = 13;
body.characters = 'Las cajas se envían juntas. Sin coste extra de envío.';
body.fills = [{ type: 'SOLID', color: T.white, opacity: 0.8 }];
textCol.appendChild(body);

// CTA — usar instance Button atom Type=Primary
const buttonSet = await figma.getNodeByIdAsync('683:8300');
const primary = buttonSet.children.find(v => v.name.includes('Type=Primary, Size=md, Width=Hug, Icon=Trailing, State=Default'));
const ctaInst = primary.createInstance();
const ctaLabel = ctaInst.findOne(n => n.type === 'TEXT');
if (ctaLabel) ctaLabel.characters = 'Ver tienda';
textCol.appendChild(ctaInst);

c.appendChild(textCol);

// Visual column (placeholder)
const visual = figma.createRectangle();
visual.resize(280, 160);
visual.cornerRadius = 8;
visual.fills = [{ type: 'GRADIENT_LINEAR', gradientStops: [
  { color: { r: 1, g: 0.8, b: 0.4, a: 1 }, position: 0 },
  { color: { r: 0.95, g: 0.6, b: 0.6, a: 1 }, position: 1 },
], gradientTransform: [[1,0,0],[0,1,0]] }];
c.appendChild(visual);

const L5 = await figma.getNodeByIdAsync('<L5 ID>');
L5.appendChild(c);
c.x = 80; c.y = 800;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Cart / Cross-sell card';
label.fills = [{ type: 'SOLID', color: T.dark }];
L5.appendChild(label);
label.x = 80; label.y = 770;

return { id: c.id };
```

- [ ] **Step 3: Screenshot validation**

Verificar bg verde, eyebrow yellow, título blanco, body opacity 80%, CTA yellow. Visual placeholder OK con gradient.

- [ ] **Step 4: Anotar `Cart / Cross-sell card = <id>`**

---

## Task 6: Cart / Page (Template Frame)

**Files:**
- Create: 1 Frame template (NO Component) en `L5 — Cart`

> **Nota:** este NO es un component reusable — es un template que muestra el layout completo de `/carrito` con instances de los components anteriores. Útil como referencia visual para devs.

- [ ] **Step 1: Construir el frame template 1440×variable**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const f = figma.createFrame();
f.name = 'Cart / Page (template)';
f.resize(1440, 1200);
f.layoutMode = 'VERTICAL';
f.primaryAxisSizingMode = 'AUTO';
f.counterAxisSizingMode = 'FIXED';
f.itemSpacing = 24;
f.paddingLeft = 120; f.paddingRight = 120; f.paddingTop = 24; f.paddingBottom = 80;
f.fills = [{ type: 'SOLID', color: T.cream }];

// Nav instance (683:8940 LoggedOut)
const navSet = await figma.getNodeByIdAsync('683:8940');
const navLogged = navSet.children.find(v => v.name.includes('State=LoggedOut'));
f.appendChild(navLogged.createInstance());

// Breadcrumb
const breadcrumb = figma.createText();
breadcrumb.fontName = { family: 'Clash Display', style: 'Regular' };
breadcrumb.fontSize = 13;
breadcrumb.characters = 'Inicio › Carrito';
breadcrumb.fills = [{ type: 'SOLID', color: T.textMuted }];
f.appendChild(breadcrumb);

// Page header
const h1 = figma.createText();
h1.fontName = { family: 'Clash Display', style: 'Bold' };
h1.fontSize = 28;
h1.characters = 'Tu carrito';
h1.fills = [{ type: 'SOLID', color: T.dark }];
f.appendChild(h1);

const sub = figma.createText();
sub.fontName = { family: 'Clash Display', style: 'Regular' };
sub.fontSize = 14;
sub.characters = 'Revisa tus cajas antes de tramitar el pedido.';
sub.fills = [{ type: 'SOLID', color: T.textMuted }];
f.appendChild(sub);

// Grid 2 columnas (items izq + summary derecha)
const grid = figma.createFrame();
grid.layoutMode = 'HORIZONTAL';
grid.primaryAxisSizingMode = 'FIXED';
grid.counterAxisSizingMode = 'AUTO';
grid.layoutAlign = 'STRETCH';
grid.itemSpacing = 24;
grid.fills = [];

// Items column (720)
const itemsCol = figma.createFrame();
itemsCol.layoutMode = 'VERTICAL';
itemsCol.primaryAxisSizingMode = 'AUTO';
itemsCol.counterAxisSizingMode = 'FIXED';
itemsCol.resize(720, 0);
itemsCol.itemSpacing = 16;
itemsCol.fills = [];

// Section label "Compra única"
const lbl1 = figma.createText();
lbl1.fontName = { family: 'Clash Display', style: 'Bold' };
lbl1.fontSize = 11;
lbl1.letterSpacing = { value: 8, unit: 'PERCENT' };
lbl1.characters = 'COMPRA ÚNICA';
lbl1.fills = [{ type: 'SOLID', color: T.green }];
itemsCol.appendChild(lbl1);

// 2 instances Cart/Item Page/Once
const cartItemSet = await figma.getNodeByIdAsync('<ID Cart/Item de Task 2>');
const itemPageOnce = cartItemSet.children.find(v => v.name === 'Variant=Page, Mode=Once');
itemsCol.appendChild(itemPageOnce.createInstance());
const item2 = itemPageOnce.createInstance();
const item2Title = item2.findOne(n => n.type === 'TEXT' && n.characters === 'Caja Cerrada Grande');
if (item2Title) item2Title.characters = 'Caja Cerrada Pequeña';
const item2Price = item2.findOne(n => n.type === 'TEXT' && n.characters === '49,00 €');
if (item2Price) item2Price.characters = '29,00 €';
itemsCol.appendChild(item2);

// Section label "Suscripción"
const lbl2 = figma.createText();
lbl2.fontName = { family: 'Clash Display', style: 'Bold' };
lbl2.fontSize = 11;
lbl2.letterSpacing = { value: 8, unit: 'PERCENT' };
lbl2.characters = 'SUSCRIPCIÓN';
lbl2.fills = [{ type: 'SOLID', color: T.green }];
itemsCol.appendChild(lbl2);

// 1 instance Page/Subs
const itemPageSubs = cartItemSet.children.find(v => v.name === 'Variant=Page, Mode=Subs');
itemsCol.appendChild(itemPageSubs.createInstance());

// Cross-sell card
const crossSet = await figma.getNodeByIdAsync('<ID Cross-sell card>');
itemsCol.appendChild(crossSet.createInstance());

grid.appendChild(itemsCol);

// Summary column (360 sticky)
const summarySet = await figma.getNodeByIdAsync('<ID Cart/Summary>');
const pageExt = summarySet.children.find(v => v.name === 'Variant=PageExtended');
grid.appendChild(pageExt.createInstance());

f.appendChild(grid);

// Footer instance (683:9055 Variant=Full)
const footerSet = await figma.getNodeByIdAsync('683:9055');
const footerFull = footerSet.children.find(v => v.name.includes('Variant=Full'));
f.appendChild(footerFull.createInstance());

const L5 = await figma.getNodeByIdAsync('<L5 ID>');
L5.appendChild(f);
f.x = 80; f.y = 1100;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Cart / Page (template)';
label.fills = [{ type: 'SOLID', color: T.dark }];
L5.appendChild(label);
label.x = 80; label.y = 1070;

return { id: f.id };
```

- [ ] **Step 2: Screenshot validation**

Capturar el frame y validar:
- Nav arriba con logo Bionta
- Breadcrumb + page header
- Grid 2 cols con 2 cajas únicas + 1 suscripción + cross-sell
- Summary sticky derecha con desglose extendido
- Footer Variant=Full al fondo

- [ ] **Step 3: Anotar `Cart / Page = <id>`**

---

## Task 7: Checkout / Section (Component Set · slot pattern)

**Files:**
- Create: 1 Component Set en `L2 — Molecules`

**Variants:**
- `Variant=Default` — header con eyebrow "PASO N" + título + (opcional) link derecha + slot body
- `Variant=WithLink` — incluye link "¿Ya tienes cuenta? Iniciar sesión" en header

> Más simple: 1 component con boolean property `Header link`.

- [ ] **Step 1: Construir el component con component property text**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'Checkout / Section';
c.resize(720, 240);
c.layoutMode = 'VERTICAL';
c.primaryAxisSizingMode = 'AUTO';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 16;
c.paddingLeft = 20; c.paddingRight = 20; c.paddingTop = 20; c.paddingBottom = 20;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.white }];

// Header
const header = figma.createFrame();
header.name = 'header';
header.layoutMode = 'HORIZONTAL';
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'AUTO';
header.layoutAlign = 'STRETCH';
header.primaryAxisAlignItems = 'SPACE_BETWEEN';
header.counterAxisAlignItems = 'CENTER';
header.fills = [];

const titleCol = figma.createFrame();
titleCol.layoutMode = 'VERTICAL';
titleCol.primaryAxisSizingMode = 'AUTO';
titleCol.counterAxisSizingMode = 'AUTO';
titleCol.itemSpacing = 4;
titleCol.fills = [];

const eyebrow = figma.createText();
eyebrow.fontName = { family: 'Clash Display', style: 'Bold' };
eyebrow.fontSize = 11;
eyebrow.letterSpacing = { value: 8, unit: 'PERCENT' };
eyebrow.characters = 'PASO 1';
eyebrow.fills = [{ type: 'SOLID', color: T.green }];
titleCol.appendChild(eyebrow);

const title = figma.createText();
title.fontName = { family: 'Clash Display', style: 'Bold' };
title.fontSize = 18;
title.characters = 'Datos de contacto';
title.fills = [{ type: 'SOLID', color: T.dark }];
titleCol.appendChild(title);

header.appendChild(titleCol);

const link = figma.createText();
link.name = 'header-link';
link.fontName = { family: 'Clash Display', style: 'Medium' };
link.fontSize = 13;
link.characters = '¿Ya tienes cuenta? Iniciar sesión';
link.textDecoration = 'UNDERLINE';
link.fills = [{ type: 'SOLID', color: T.dark }];
header.appendChild(link);

c.appendChild(header);

// Body slot (placeholder con texto)
const slot = figma.createFrame();
slot.name = 'body-slot';
slot.layoutMode = 'VERTICAL';
slot.primaryAxisSizingMode = 'FIXED';
slot.counterAxisSizingMode = 'FIXED';
slot.layoutAlign = 'STRETCH';
slot.resize(680, 120);
slot.itemSpacing = 12;
slot.fills = [{ type: 'SOLID', color: T.cream }];
slot.cornerRadius = 8;
slot.paddingLeft = 16; slot.paddingRight = 16; slot.paddingTop = 16; slot.paddingBottom = 16;

const slotText = figma.createText();
slotText.fontName = { family: 'Clash Display', style: 'Regular' };
slotText.fontSize = 13;
slotText.characters = '[ Slot for form fields, Stripe Element, etc. ]';
slotText.fills = [{ type: 'SOLID', color: T.textMuted }];
slot.appendChild(slotText);

c.appendChild(slot);

// Component properties (text overrides)
c.addComponentProperty('Eyebrow', 'TEXT', 'PASO 1');
c.addComponentProperty('Title', 'TEXT', 'Datos de contacto');
c.addComponentProperty('Header link', 'TEXT', '¿Ya tienes cuenta? Iniciar sesión');
c.addComponentProperty('Show header link', 'BOOLEAN', true);

// Bind properties to nodes
const props = Object.entries(c.componentPropertyDefinitions);
const eyebrowProp = props.find(([k]) => k.startsWith('Eyebrow#'))?.[0];
const titleProp = props.find(([k]) => k.startsWith('Title#'))?.[0];
const linkProp = props.find(([k]) => k.startsWith('Header link#'))?.[0];
const showLinkProp = props.find(([k]) => k.startsWith('Show header link#'))?.[0];

if (eyebrowProp) eyebrow.componentPropertyReferences = { characters: eyebrowProp };
if (titleProp) title.componentPropertyReferences = { characters: titleProp };
if (linkProp) link.componentPropertyReferences = { characters: linkProp };
if (showLinkProp) link.componentPropertyReferences = { ...link.componentPropertyReferences, visible: showLinkProp };

const moleculesSection = await figma.getNodeByIdAsync('683:8220');
moleculesSection.appendChild(c);
c.x = 80; c.y = 2200;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Checkout / Section';
label.fills = [{ type: 'SOLID', color: T.dark }];
moleculesSection.appendChild(label);
label.x = 80; label.y = 2170;

return { id: c.id };
```

- [ ] **Step 2: Screenshot validation**

Capturar component. Verificar:
- Eyebrow "PASO 1" verde
- Título "Datos de contacto" 18 Bold
- Link derecho "¿Ya tienes cuenta? Iniciar sesión"
- Slot body con texto placeholder en gris

- [ ] **Step 3: Anotar `Checkout / Section = <id>`**

---

## Task 8: Checkout / ExpressButtons (Component)

**Files:**
- Create: 1 Component en `L2 — Molecules`

- [ ] **Step 1: Construir Apple Pay + Google Pay buttons**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'Checkout / ExpressButtons';
c.resize(720, 110);
c.layoutMode = 'VERTICAL';
c.primaryAxisSizingMode = 'AUTO';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 12;
c.paddingLeft = 16; c.paddingRight = 16; c.paddingTop = 16; c.paddingBottom = 16;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.white }];

const eyebrow = figma.createText();
eyebrow.fontName = { family: 'Clash Display', style: 'Bold' };
eyebrow.fontSize = 11;
eyebrow.letterSpacing = { value: 8, unit: 'PERCENT' };
eyebrow.characters = 'PAGO RÁPIDO';
eyebrow.fills = [{ type: 'SOLID', color: T.textMuted }];
c.appendChild(eyebrow);

const grid = figma.createFrame();
grid.layoutMode = 'HORIZONTAL';
grid.primaryAxisSizingMode = 'FIXED';
grid.counterAxisSizingMode = 'AUTO';
grid.layoutAlign = 'STRETCH';
grid.itemSpacing = 8;
grid.fills = [];

// Apple Pay button (negro)
const apple = figma.createFrame();
apple.layoutGrow = 1;
apple.layoutMode = 'HORIZONTAL';
apple.primaryAxisSizingMode = 'FIXED';
apple.counterAxisSizingMode = 'FIXED';
apple.resize(0, 48);
apple.primaryAxisAlignItems = 'CENTER';
apple.counterAxisAlignItems = 'CENTER';
apple.cornerRadius = 8;
apple.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
apple.itemSpacing = 6;

const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 21" width="14" height="18"><path d="M14.4 11.13a4.5 4.5 0 0 1 2.16-3.78A4.65 4.65 0 0 0 13 5.5c-1.55-.16-3.05.92-3.83.92-.81 0-2.04-.91-3.36-.88a4.85 4.85 0 0 0-4.07 2.49c-1.74 3.02-.45 7.46 1.24 9.9.83 1.2 1.81 2.53 3.1 2.48 1.25-.05 1.72-.8 3.22-.8 1.5 0 1.93.8 3.24.77 1.34-.02 2.19-1.22 3.01-2.42a10.71 10.71 0 0 0 1.37-2.83 4.4 4.4 0 0 1-2.52-3.99zM11.95 3.84a4.42 4.42 0 0 0 1.01-3.16 4.46 4.46 0 0 0-2.94 1.52 4.18 4.18 0 0 0-1.04 3.05c1.18.04 2.34-.55 2.97-1.41z"/></svg>`;
const appleIcon = figma.createNodeFromSvg(appleSvg);
appleIcon.resize(14, 18);
appleIcon.fills = [];
const tintW = (n) => {
  if (n.type === 'VECTOR' && n.fills) n.fills = [{ type: 'SOLID', color: T.white }];
  if ('children' in n) for (const ch of n.children) tintW(ch);
};
tintW(appleIcon);
apple.appendChild(appleIcon);

const appleT = figma.createText();
appleT.fontName = { family: 'Clash Display', style: 'Bold' };
appleT.fontSize = 14;
appleT.characters = 'Pay';
appleT.fills = [{ type: 'SOLID', color: T.white }];
apple.appendChild(appleT);

grid.appendChild(apple);

// Google Pay button (blanco con stroke)
const google = figma.createFrame();
google.layoutGrow = 1;
google.layoutMode = 'HORIZONTAL';
google.primaryAxisSizingMode = 'FIXED';
google.counterAxisSizingMode = 'FIXED';
google.resize(0, 48);
google.primaryAxisAlignItems = 'CENTER';
google.counterAxisAlignItems = 'CENTER';
google.cornerRadius = 8;
google.fills = [{ type: 'SOLID', color: T.white }];
google.strokes = [{ type: 'SOLID', color: T.borderDef }];
google.strokeWeight = 1;
google.itemSpacing = 6;

const googleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>`;
const googleIcon = figma.createNodeFromSvg(googleSvg);
googleIcon.resize(18, 18);
google.appendChild(googleIcon);

const googleT = figma.createText();
googleT.fontName = { family: 'Clash Display', style: 'Bold' };
googleT.fontSize = 14;
googleT.characters = 'G Pay';
googleT.fills = [{ type: 'SOLID', color: T.dark }];
google.appendChild(googleT);

grid.appendChild(google);

c.appendChild(grid);

const moleculesSection = await figma.getNodeByIdAsync('683:8220');
moleculesSection.appendChild(c);
c.x = 80; c.y = 2500;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Checkout / ExpressButtons';
label.fills = [{ type: 'SOLID', color: T.dark }];
moleculesSection.appendChild(label);
label.x = 80; label.y = 2470;

return { id: c.id };
```

- [ ] **Step 2: Screenshot validation**

Validar:
- Eyebrow "PAGO RÁPIDO" gris
- Apple Pay button negro con logo Apple monocromo + texto "Pay" blanco
- Google Pay button blanco con logo G multicolor + texto "G Pay" dark

- [ ] **Step 3: Anotar `Checkout / ExpressButtons = <id>`**

---

## Task 9: Checkout / SubscriptionBanner (Component)

**Files:**
- Create: 1 Component en `L2 — Molecules`

- [ ] **Step 1: Construir banner con border yellow + body explicativo**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'Checkout / SubscriptionBanner';
c.resize(720, 100);
c.layoutMode = 'VERTICAL';
c.primaryAxisSizingMode = 'AUTO';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 4;
c.paddingLeft = 16; c.paddingRight = 16; c.paddingTop = 16; c.paddingBottom = 16;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.yellow, opacity: 0.1 }];
c.strokes = [{ type: 'SOLID', color: T.yellow }];
c.strokeWeight = 1;

const title = figma.createText();
title.fontName = { family: 'Clash Display', style: 'Bold' };
title.fontSize = 14;
title.characters = '📅 Esto incluye una suscripción';
title.fills = [{ type: 'SOLID', color: T.dark }];
c.appendChild(title);

const body = figma.createText();
body.fontName = { family: 'Clash Display', style: 'Regular' };
body.fontSize = 13;
body.characters = 'Caja Personalizable Grande · cada 2 semanas\nPrimer cobro hoy · próximo cobro estimado 14 may 2026\nCancela cuando quieras desde Mi Cuenta. Sin permanencia.';
body.fills = [{ type: 'SOLID', color: T.dark }];
body.lineHeight = { value: 150, unit: 'PERCENT' };
c.appendChild(body);

// Component properties for body text
c.addComponentProperty('Title', 'TEXT', '📅 Esto incluye una suscripción');
c.addComponentProperty('Body', 'TEXT', body.characters);

const props = Object.entries(c.componentPropertyDefinitions);
const titleProp = props.find(([k]) => k.startsWith('Title#'))?.[0];
const bodyProp = props.find(([k]) => k.startsWith('Body#'))?.[0];
if (titleProp) title.componentPropertyReferences = { characters: titleProp };
if (bodyProp) body.componentPropertyReferences = { characters: bodyProp };

const moleculesSection = await figma.getNodeByIdAsync('683:8220');
moleculesSection.appendChild(c);
c.x = 80; c.y = 2700;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Checkout / SubscriptionBanner';
label.fills = [{ type: 'SOLID', color: T.dark }];
moleculesSection.appendChild(label);
label.x = 80; label.y = 2670;

return { id: c.id };
```

- [ ] **Step 2: Screenshot validation**

Validar bg amarillo claro 10% + stroke yellow + título 14 Bold + body 13 con line-height 150%.

- [ ] **Step 3: Anotar `Checkout / SubscriptionBanner = <id>`**

---

## Task 10: Checkout / Page (Template Frame)

**Files:**
- Create: 1 Frame template en `L6 — Checkout`

- [ ] **Step 1: Construir el template completo del checkout single-page**

> **Estructura:** Nav simplificada + Breadcrumb + Page header + Grid 2 cols (form 720 izq + summary 360 sticky derecha). Form: Express buttons + divider "o paga con tarjeta" + 3 instances Checkout/Section (Paso 1 Datos, Paso 2 Envío, Paso 3 Pago) + SubscriptionBanner + checkbox términos + CTA primary "Pagar X €". Summary: instance Cart/Summary Variant=CheckoutAside.

```js
const T = { /* tokens */ };
// Carga fonts...

const f = figma.createFrame();
f.name = 'Checkout / Page (template)';
f.resize(1440, 1500);
f.layoutMode = 'VERTICAL';
f.primaryAxisSizingMode = 'AUTO';
f.counterAxisSizingMode = 'FIXED';
f.itemSpacing = 24;
f.paddingLeft = 120; f.paddingRight = 120; f.paddingTop = 24; f.paddingBottom = 80;
f.fills = [{ type: 'SOLID', color: T.cream }];

// 1) Nav simplificada — duplicar Nav LoggedOut pero override items "🔒 Pago seguro · Stripe"
const navSet = await figma.getNodeByIdAsync('683:8940');
const navInst = navSet.children.find(v => v.name.includes('State=LoggedOut')).createInstance();
// Override el text de items por "🔒 Pago seguro · Stripe"
// (puede requerir buscar el TEXT específico dentro del nav e setearlo)
f.appendChild(navInst);

// 2) Breadcrumb instance
// const breadcrumbSet = await figma.getNodeByIdAsync('683:8662');
// const breadcrumbLevels2 = breadcrumbSet.children.find(v => v.name.includes('Levels=2'));
// f.appendChild(breadcrumbLevels2.createInstance());

// 3) Page header instance
// const pageHeaderSet = await figma.getNodeByIdAsync('683:8596');
// const phNoAction = pageHeaderSet.children.find(v => v.name.includes('Action=None'));
// f.appendChild(phNoAction.createInstance());

// 4) Grid
const grid = figma.createFrame();
grid.layoutMode = 'HORIZONTAL';
grid.primaryAxisSizingMode = 'FIXED';
grid.counterAxisSizingMode = 'AUTO';
grid.layoutAlign = 'STRETCH';
grid.itemSpacing = 24;
grid.fills = [];

// LEFT: form column 720
const formCol = figma.createFrame();
formCol.layoutMode = 'VERTICAL';
formCol.primaryAxisSizingMode = 'AUTO';
formCol.counterAxisSizingMode = 'FIXED';
formCol.resize(720, 0);
formCol.itemSpacing = 12;
formCol.fills = [];

// Express buttons instance
const expressSet = await figma.getNodeByIdAsync('<ID Checkout/ExpressButtons>');
formCol.appendChild(expressSet.createInstance());

// Divider "o paga con tarjeta"
const divider = figma.createFrame();
divider.layoutMode = 'HORIZONTAL';
divider.primaryAxisSizingMode = 'FIXED';
divider.counterAxisSizingMode = 'AUTO';
divider.layoutAlign = 'STRETCH';
divider.primaryAxisAlignItems = 'CENTER';
divider.counterAxisAlignItems = 'CENTER';
divider.itemSpacing = 12;
divider.fills = [];
const dl = figma.createRectangle();
dl.resize(0, 1);
dl.layoutGrow = 1;
dl.fills = [{ type: 'SOLID', color: T.borderDef }];
divider.appendChild(dl);
const dt = figma.createText();
dt.fontName = { family: 'Clash Display', style: 'Bold' };
dt.fontSize = 11;
dt.letterSpacing = { value: 8, unit: 'PERCENT' };
dt.characters = 'O PAGA CON TARJETA';
dt.fills = [{ type: 'SOLID', color: T.borderSubtle }];
divider.appendChild(dt);
const dr = figma.createRectangle();
dr.resize(0, 1);
dr.layoutGrow = 1;
dr.fills = [{ type: 'SOLID', color: T.borderDef }];
divider.appendChild(dr);
formCol.appendChild(divider);

// 3 Checkout/Section instances con override
const sectionSet = await figma.getNodeByIdAsync('<ID Checkout/Section>');
const s1 = sectionSet.createInstance();
// override Eyebrow=PASO 1, Title=Datos de contacto, Header link=¿Ya tienes cuenta? Iniciar sesión, Show header link=true
formCol.appendChild(s1);

const s2 = sectionSet.createInstance();
s2.setProperties({
  'Eyebrow': 'PASO 2',
  'Title': 'Dirección de envío',
  'Show header link': false,
});
formCol.appendChild(s2);

const s3 = sectionSet.createInstance();
s3.setProperties({
  'Eyebrow': 'PASO 3',
  'Title': 'Método de pago',
  'Show header link': false,
});
formCol.appendChild(s3);

// SubscriptionBanner
const bannerSet = await figma.getNodeByIdAsync('<ID Checkout/SubscriptionBanner>');
formCol.appendChild(bannerSet.createInstance());

// Checkbox terms (raw frame placeholder o usa Checkbox atom)
// Final CTA Button Primary md Fill — instance
const buttonSet = await figma.getNodeByIdAsync('683:8300');
const primaryFill = buttonSet.children.find(v => v.name.includes('Type=Primary, Size=md, Width=Fill, Icon=None, State=Default'));
const ctaInst = primaryFill.createInstance();
const ctaLabel = ctaInst.findOne(n => n.type === 'TEXT');
if (ctaLabel) ctaLabel.characters = 'Pagar 122,55 € →';
formCol.appendChild(ctaInst);

grid.appendChild(formCol);

// RIGHT: summary sticky 360 — instance Cart/Summary Variant=CheckoutAside
const summarySet = await figma.getNodeByIdAsync('<ID Cart/Summary>');
const checkoutAside = summarySet.children.find(v => v.name === 'Variant=CheckoutAside');
grid.appendChild(checkoutAside.createInstance());

f.appendChild(grid);

const L6 = await figma.getNodeByIdAsync('<L6 ID>');
L6.appendChild(f);
f.x = 80; f.y = 100;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'Checkout / Page (template)';
label.fills = [{ type: 'SOLID', color: T.dark }];
L6.appendChild(label);
label.x = 80; label.y = 70;

return { id: f.id };
```

- [ ] **Step 2: Screenshot validation**

Capturar template completo. Verificar:
- Nav arriba
- Breadcrumb + page header
- Grid 2 cols correcto
- Form con Express buttons + divider + 3 secciones numeradas + banner suscripción + CTA "Pagar X €"
- Summary derecha con items mini-list + desglose + trust + promo

- [ ] **Step 3: Anotar `Checkout / Page = <id>`**

---

## Task 11: OrderConfirmation / Hero (Component Set · variants)

**Files:**
- Create: 1 Component Set en `L7 — Order Confirmation`

**Variants:**
- `Mode=Once-Guest` — "¡Gracias!" + body confirmación email
- `Mode=Subs-Guest` — "¡Bienvenida a tu suscripción!" + body
- `Mode=Mixed-Guest` — "¡Gracias!" + body
- `Mode=Once-Logged` — "¡Gracias!" + body
- `Mode=Subs-Logged` — "¡Tu suscripción está activa!" + body

5 variants (texto cambia, layout idéntico).

- [ ] **Step 1: Construir el hero base**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const makeHero = (mode) => {
  const titles = {
    'Once-Guest': '¡Gracias, María! 🥭',
    'Subs-Guest': '¡Bienvenida, María! 🌿',
    'Mixed-Guest': '¡Gracias, María! 🥭',
    'Once-Logged': '¡Gracias, María! 🥭',
    'Subs-Logged': '¡Tu suscripción está activa! 🌿',
  };
  const subs = {
    'Once-Guest': 'Hemos recibido tu pedido. Te hemos enviado la confirmación a maria@email.com.',
    'Subs-Guest': 'Tu suscripción ha quedado activa. Hemos enviado la confirmación a maria@email.com.',
    'Mixed-Guest': 'Hemos recibido tu pedido. Te hemos enviado la confirmación a maria@email.com.',
    'Once-Logged': 'Hemos recibido tu pedido. Lo verás en Mi Cuenta cuando salga del almacén.',
    'Subs-Logged': 'Tu suscripción ha quedado activa. Gestiónala desde Mi Cuenta cuando quieras.',
  };

  const c = figma.createComponent();
  c.name = `Mode=${mode}`;
  c.resize(1200, 280);
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 8;
  c.paddingLeft = 32; c.paddingRight = 32; c.paddingTop = 48; c.paddingBottom = 48;
  c.cornerRadius = 16;
  c.fills = [{ type: 'SOLID', color: T.green }];
  c.clipsContent = true;

  // Icon circle
  const circle = figma.createFrame();
  circle.layoutMode = 'HORIZONTAL';
  circle.primaryAxisSizingMode = 'FIXED';
  circle.counterAxisSizingMode = 'FIXED';
  circle.primaryAxisAlignItems = 'CENTER';
  circle.counterAxisAlignItems = 'CENTER';
  circle.resize(72, 72);
  circle.cornerRadius = 999;
  circle.fills = [{ type: 'SOLID', color: T.yellow }];
  const ic = figma.createText();
  ic.fontName = { family: 'Clash Display', style: 'Bold' };
  ic.fontSize = 32;
  ic.characters = '✓';
  ic.fills = [{ type: 'SOLID', color: T.dark }];
  circle.appendChild(ic);
  c.appendChild(circle);

  const eyebrow = figma.createText();
  eyebrow.fontName = { family: 'Clash Display', style: 'Bold' };
  eyebrow.fontSize = 11;
  eyebrow.letterSpacing = { value: 8, unit: 'PERCENT' };
  eyebrow.characters = mode.includes('Subs') ? 'SUSCRIPCIÓN ACTIVADA' : 'PEDIDO CONFIRMADO';
  eyebrow.fills = [{ type: 'SOLID', color: T.yellow }];
  c.appendChild(eyebrow);

  const title = figma.createText();
  title.fontName = { family: 'Clash Display', style: 'Bold' };
  title.fontSize = 36;
  title.characters = titles[mode];
  title.fills = [{ type: 'SOLID', color: T.white }];
  title.textAlignHorizontal = 'CENTER';
  c.appendChild(title);

  const sub = figma.createText();
  sub.fontName = { family: 'Clash Display', style: 'Regular' };
  sub.fontSize = 16;
  sub.characters = subs[mode];
  sub.fills = [{ type: 'SOLID', color: T.white, opacity: 0.85 }];
  sub.textAlignHorizontal = 'CENTER';
  sub.resize(720, 22);
  c.appendChild(sub);

  const order = figma.createText();
  order.fontName = { family: 'Clash Display', style: 'Bold' };
  order.fontSize = 14;
  order.characters = 'Pedido #BNT-2026-0142 · 26 abr 2026';
  order.fills = [{ type: 'SOLID', color: T.yellow }];
  c.appendChild(order);

  return c;
};

const variants = ['Once-Guest','Subs-Guest','Mixed-Guest','Once-Logged','Subs-Logged'].map(makeHero);

const L7 = await figma.getNodeByIdAsync('<L7 ID>');
const set = figma.combineAsVariants(variants, L7);
set.name = 'OrderConfirmation / Hero';
set.layoutMode = 'VERTICAL';
set.itemSpacing = 24;
set.paddingLeft = 32; set.paddingRight = 32; set.paddingTop = 32; set.paddingBottom = 32;
set.primaryAxisSizingMode = 'AUTO';
set.counterAxisSizingMode = 'AUTO';
set.fills = [];
set.strokes = [{ type: 'SOLID', color: T.borderDef }];
set.strokeWeight = 1;
set.dashPattern = [4, 4];
set.x = 80; set.y = 100;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'OrderConfirmation / Hero';
label.fills = [{ type: 'SOLID', color: T.dark }];
L7.appendChild(label);
label.x = 80; label.y = 70;

return { setId: set.id };
```

- [ ] **Step 2: Screenshot validation**

Validar 5 variants apiladas con copy distinto pero misma estructura visual: bg verde + check yellow + eyebrow + title + sub + order#.

- [ ] **Step 3: Anotar `OrderConfirmation / Hero = <setId>`**

---

## Task 12: OrderConfirmation / SubscriptionCard (Component)

**Files:**
- Create: 1 Component en `L7 — Order Confirmation`

- [ ] **Step 1: Construir card con grid 2×2 + acciones inline**

> **Estructura:** Card 720×variable con border yellow + bg blanco. Header: Pill verde "Suscripción activa" + título "Caja Personalizable Grande". Grid 2×2 con 4 sub-cards (cream bg) cada una con label uppercase + value: Frecuencia · Próximo cobro · Próximo envío · Precio recurrente. Acciones inline: "Pausar · Saltar · Cambiar · Cancelar".

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Medium' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'OrderConfirmation / SubscriptionCard';
c.resize(720, 280);
c.layoutMode = 'VERTICAL';
c.primaryAxisSizingMode = 'AUTO';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 12;
c.paddingLeft = 20; c.paddingRight = 20; c.paddingTop = 20; c.paddingBottom = 20;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.white }];
c.strokes = [{ type: 'SOLID', color: T.yellow }];
c.strokeWeight = 1;

// Header
const header = figma.createFrame();
header.layoutMode = 'HORIZONTAL';
header.primaryAxisSizingMode = 'FIXED';
header.counterAxisSizingMode = 'AUTO';
header.layoutAlign = 'STRETCH';
header.itemSpacing = 8;
header.counterAxisAlignItems = 'CENTER';
header.fills = [];

// Pill verde
const pill = figma.createFrame();
pill.layoutMode = 'HORIZONTAL';
pill.primaryAxisSizingMode = 'AUTO';
pill.counterAxisSizingMode = 'AUTO';
pill.paddingLeft = 10; pill.paddingRight = 10; pill.paddingTop = 3; pill.paddingBottom = 3;
pill.cornerRadius = 100;
pill.fills = [{ type: 'SOLID', color: T.green }];
const pillT = figma.createText();
pillT.fontName = { family: 'Clash Display', style: 'Bold' };
pillT.fontSize = 10;
pillT.letterSpacing = { value: 6, unit: 'PERCENT' };
pillT.characters = 'SUSCRIPCIÓN ACTIVA';
pillT.fills = [{ type: 'SOLID', color: T.white }];
pill.appendChild(pillT);
header.appendChild(pill);

const title = figma.createText();
title.fontName = { family: 'Clash Display', style: 'Bold' };
title.fontSize = 18;
title.characters = 'Caja Personalizable Grande';
title.fills = [{ type: 'SOLID', color: T.dark }];
header.appendChild(title);

c.appendChild(header);

// Grid 2×2
const grid = figma.createFrame();
grid.layoutMode = 'HORIZONTAL';
grid.primaryAxisSizingMode = 'FIXED';
grid.counterAxisSizingMode = 'AUTO';
grid.layoutAlign = 'STRETCH';
grid.itemSpacing = 12;
grid.layoutWrap = 'WRAP';
grid.fills = [];

const items = [
  ['FRECUENCIA', 'Cada 2 semanas'],
  ['PRÓXIMO COBRO', '14 may 2026'],
  ['PRÓXIMO ENVÍO', '15 may 2026'],
  ['PRECIO RECURRENTE', '44,55 € · 10% off'],
];
for (const [label, value] of items) {
  const cell = figma.createFrame();
  cell.layoutMode = 'VERTICAL';
  cell.primaryAxisSizingMode = 'AUTO';
  cell.counterAxisSizingMode = 'FIXED';
  cell.resize(332, 60);
  cell.itemSpacing = 4;
  cell.paddingLeft = 12; cell.paddingRight = 12; cell.paddingTop = 12; cell.paddingBottom = 12;
  cell.cornerRadius = 8;
  cell.fills = [{ type: 'SOLID', color: T.cream }];

  const lt = figma.createText();
  lt.fontName = { family: 'Clash Display', style: 'Bold' };
  lt.fontSize = 11;
  lt.letterSpacing = { value: 8, unit: 'PERCENT' };
  lt.characters = label;
  lt.fills = [{ type: 'SOLID', color: T.textMuted }];
  cell.appendChild(lt);

  const vt = figma.createText();
  vt.fontName = { family: 'Clash Display', style: 'Bold' };
  vt.fontSize = 14;
  vt.characters = value;
  vt.fills = [{ type: 'SOLID', color: T.dark }];
  cell.appendChild(vt);

  grid.appendChild(cell);
}
c.appendChild(grid);

// Acciones inline
const actions = figma.createText();
actions.fontName = { family: 'Clash Display', style: 'Medium' };
actions.fontSize = 13;
actions.characters = 'Pausar · Saltar próximo envío · Cambiar · Cancelar';
actions.fills = [{ type: 'SOLID', color: T.dark }];
c.appendChild(actions);

const L7 = await figma.getNodeByIdAsync('<L7 ID>');
L7.appendChild(c);
c.x = 80; c.y = 700;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'OrderConfirmation / SubscriptionCard';
label.fills = [{ type: 'SOLID', color: T.dark }];
L7.appendChild(label);
label.x = 80; label.y = 670;

return { id: c.id };
```

- [ ] **Step 2: Screenshot validation**

Verificar pill verde + título + grid 2×2 con 4 cells cream + acciones bottom.

- [ ] **Step 3: Anotar `OrderConfirmation / SubscriptionCard = <id>`**

---

## Task 13: OrderConfirmation / TrackingCard (Component)

**Files:**
- Create: 1 Component en `L7 — Order Confirmation`

- [ ] **Step 1: Construir aside tracking 360×variable**

> **Estructura:** Card 360×280, bg verde `#2F4A2B`, color blanco. Title "📦 Tu primera caja llega..." 16 Bold. ETA 22 Bold yellow. Body 13 cream-muted. CTA yellow "Ver estado del pedido →".

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const c = figma.createComponent();
c.name = 'OrderConfirmation / TrackingCard';
c.resize(360, 240);
c.layoutMode = 'VERTICAL';
c.primaryAxisSizingMode = 'AUTO';
c.counterAxisSizingMode = 'FIXED';
c.itemSpacing = 8;
c.paddingLeft = 20; c.paddingRight = 20; c.paddingTop = 20; c.paddingBottom = 20;
c.cornerRadius = 12;
c.fills = [{ type: 'SOLID', color: T.green }];

const title = figma.createText();
title.fontName = { family: 'Clash Display', style: 'Bold' };
title.fontSize = 16;
title.characters = '📦 Tu primera caja llega...';
title.fills = [{ type: 'SOLID', color: T.white }];
c.appendChild(title);

const eta = figma.createText();
eta.fontName = { family: 'Clash Display', style: 'Bold' };
eta.fontSize = 22;
eta.characters = 'Jueves 30 abril';
eta.fills = [{ type: 'SOLID', color: T.yellow }];
c.appendChild(eta);

const body = figma.createText();
body.fontName = { family: 'Clash Display', style: 'Regular' };
body.fontSize = 13;
body.characters = 'Te avisaremos por email cuando salga del almacén con el código de seguimiento.\n\nRecuerda: la fruta llega refrigerada y lista para consumir.';
body.fills = [{ type: 'SOLID', color: T.white, opacity: 0.85 }];
body.lineHeight = { value: 150, unit: 'PERCENT' };
c.appendChild(body);

// CTA Button Primary md Fill — instance con label override
const buttonSet = await figma.getNodeByIdAsync('683:8300');
const primaryFill = buttonSet.children.find(v => v.name.includes('Type=Primary, Size=md, Width=Fill, Icon=None, State=Default'));
const ctaInst = primaryFill.createInstance();
const ctaLabel = ctaInst.findOne(n => n.type === 'TEXT');
if (ctaLabel) ctaLabel.characters = 'Ver estado del pedido →';
c.appendChild(ctaInst);

const L7 = await figma.getNodeByIdAsync('<L7 ID>');
L7.appendChild(c);
c.x = 80; c.y = 1000;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'OrderConfirmation / TrackingCard';
label.fills = [{ type: 'SOLID', color: T.dark }];
L7.appendChild(label);
label.x = 80; label.y = 970;

return { id: c.id };
```

- [ ] **Step 2: Screenshot validation**

Verificar bg verde, title 16 Bold blanco, ETA 22 Bold yellow grande, body con line-height 150%, CTA yellow "Ver estado".

- [ ] **Step 3: Anotar `OrderConfirmation / TrackingCard = <id>`**

---

## Task 14: OrderConfirmation / AccountBanner (Component Set · 2 variants)

**Files:**
- Create: 1 Component Set en `L7 — Order Confirmation`

**Variants:**
- `Variant=MagicLink` (yellow gradient bg) — para guest+suscripción
- `Variant=Optional` (gris suave bg) — para guest+única

- [ ] **Step 1: Construir 2 variants**

```js
const T = { /* tokens */ };
await figma.loadFontAsync({ family: 'Clash Display', style: 'Bold' });
await figma.loadFontAsync({ family: 'Clash Display', style: 'Regular' });

const makeBanner = (variant) => {
  const isYellow = variant === 'MagicLink';
  const c = figma.createComponent();
  c.name = `Variant=${variant}`;
  c.resize(720, 100);
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'AUTO';
  c.itemSpacing = 16;
  c.paddingLeft = 20; c.paddingRight = 20; c.paddingTop = 20; c.paddingBottom = 20;
  c.cornerRadius = 12;
  c.counterAxisAlignItems = 'CENTER';
  if (isYellow) {
    c.fills = [{ type: 'GRADIENT_LINEAR', gradientStops: [
      { color: { r: 1, g: 0.7607843, b: 0, a: 1 }, position: 0 },
      { color: { r: 1, g: 0.847, b: 0.29, a: 1 }, position: 1 },
    ], gradientTransform: [[1,0,0],[0,1,0]] }];
  } else {
    c.fills = [{ type: 'SOLID', color: T.creamAlt }];
  }

  const icon = figma.createFrame();
  icon.layoutMode = 'HORIZONTAL';
  icon.primaryAxisSizingMode = 'FIXED';
  icon.counterAxisSizingMode = 'FIXED';
  icon.primaryAxisAlignItems = 'CENTER';
  icon.counterAxisAlignItems = 'CENTER';
  icon.resize(48, 48);
  icon.cornerRadius = 100;
  icon.fills = [{ type: 'SOLID', color: T.white }];
  const ic = figma.createText();
  ic.fontName = { family: 'Clash Display', style: 'Regular' };
  ic.fontSize = 22;
  ic.characters = isYellow ? '🔑' : '👤';
  icon.appendChild(ic);
  c.appendChild(icon);

  const meta = figma.createFrame();
  meta.layoutMode = 'VERTICAL';
  meta.primaryAxisSizingMode = 'AUTO';
  meta.counterAxisSizingMode = 'FIXED';
  meta.layoutGrow = 1;
  meta.itemSpacing = 4;
  meta.fills = [];

  const title = figma.createText();
  title.fontName = { family: 'Clash Display', style: 'Bold' };
  title.fontSize = 16;
  title.characters = isYellow
    ? 'Activa tu cuenta para gestionar la suscripción'
    : 'Crea una cuenta para hacer seguimiento';
  title.fills = [{ type: 'SOLID', color: T.dark }];
  meta.appendChild(title);

  const body = figma.createText();
  body.fontName = { family: 'Clash Display', style: 'Regular' };
  body.fontSize = 13;
  body.characters = isYellow
    ? 'Te hemos enviado un enlace mágico a maria@email.com. Pincha en el email y entrarás directo a tu cuenta — sin contraseña que recordar.'
    : 'Recibirás emails con el estado del pedido. Crear una cuenta te permite verlo todo desde Mi Cuenta.';
  body.fills = [{ type: 'SOLID', color: T.dark }];
  body.lineHeight = { value: 150, unit: 'PERCENT' };
  meta.appendChild(body);

  c.appendChild(meta);

  // CTA
  const ctaCol = figma.createFrame();
  ctaCol.layoutMode = 'HORIZONTAL';
  ctaCol.primaryAxisSizingMode = 'AUTO';
  ctaCol.counterAxisSizingMode = 'AUTO';
  ctaCol.fills = [];

  const buttonSet = await figma.getNodeByIdAsync('683:8300');
  const targetType = isYellow ? 'Type=Dark' : 'Type=Secondary';
  const variant = buttonSet.children.find(v => v.name.includes(targetType) && v.name.includes('Size=md, Width=Hug, Icon=None'));
  const ctaInst = variant.createInstance();
  const ctaLabel = ctaInst.findOne(n => n.type === 'TEXT');
  if (ctaLabel) ctaLabel.characters = isYellow ? 'Crear contraseña →' : 'Crear cuenta';
  ctaCol.appendChild(ctaInst);

  c.appendChild(ctaCol);

  return c;
};

const variants = [await makeBanner('MagicLink'), await makeBanner('Optional')];

const L7 = await figma.getNodeByIdAsync('<L7 ID>');
const set = figma.combineAsVariants(variants, L7);
set.name = 'OrderConfirmation / AccountBanner';
set.layoutMode = 'VERTICAL';
set.itemSpacing = 24;
set.paddingLeft = 32; set.paddingRight = 32; set.paddingTop = 32; set.paddingBottom = 32;
set.primaryAxisSizingMode = 'AUTO';
set.counterAxisSizingMode = 'AUTO';
set.fills = [];
set.strokes = [{ type: 'SOLID', color: T.borderDef }];
set.strokeWeight = 1;
set.dashPattern = [4, 4];
set.x = 80; set.y = 1300;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'OrderConfirmation / AccountBanner';
label.fills = [{ type: 'SOLID', color: T.dark }];
L7.appendChild(label);
label.x = 80; label.y = 1270;

return { setId: set.id };
```

- [ ] **Step 2: Screenshot validation**

Verificar:
- MagicLink: bg gradient yellow + icon 🔑 + title + body + CTA dark "Crear contraseña →"
- Optional: bg cream alt + icon 👤 + title + body + CTA secondary "Crear cuenta"

- [ ] **Step 3: Anotar `OrderConfirmation / AccountBanner = <setId>`**

---

## Task 15: OrderConfirmation / Page (Template Frame)

**Files:**
- Create: 1 Frame template en `L7 — Order Confirmation`

> **Estructura:** Nav + Hero (Mode=Mixed-Guest) + Grid 2 cols con detalle izq y aside derecha. Detalle: AccountBanner MagicLink + SubscriptionCard + Section "RESUMEN DEL PEDIDO" + Section "DETALLES" (dirección + pago). Aside: TrackingCard + Help block. Bottom CTAs Primary + Secondary.

- [ ] **Step 1: Construir el template completo**

```js
const T = { /* tokens */ };
// Carga fonts...

const f = figma.createFrame();
f.name = 'OrderConfirmation / Page (template)';
f.resize(1440, 1600);
f.layoutMode = 'VERTICAL';
f.primaryAxisSizingMode = 'AUTO';
f.counterAxisSizingMode = 'FIXED';
f.itemSpacing = 24;
f.paddingLeft = 120; f.paddingRight = 120; f.paddingTop = 24; f.paddingBottom = 80;
f.fills = [{ type: 'SOLID', color: T.cream }];

// Nav LoggedOut (or LoggedIn según variant — aquí guest)
const navSet = await figma.getNodeByIdAsync('683:8940');
const navInst = navSet.children.find(v => v.name.includes('State=LoggedOut')).createInstance();
f.appendChild(navInst);

// Hero (Mode=Mixed-Guest)
const heroSet = await figma.getNodeByIdAsync('<ID OrderConfirmation/Hero>');
const heroMixed = heroSet.children.find(v => v.name === 'Mode=Mixed-Guest');
f.appendChild(heroMixed.createInstance());

// Grid 2 cols
const grid = figma.createFrame();
grid.layoutMode = 'HORIZONTAL';
grid.primaryAxisSizingMode = 'FIXED';
grid.counterAxisSizingMode = 'AUTO';
grid.layoutAlign = 'STRETCH';
grid.itemSpacing = 24;
grid.fills = [];

// LEFT: detail (720)
const leftCol = figma.createFrame();
leftCol.layoutMode = 'VERTICAL';
leftCol.primaryAxisSizingMode = 'AUTO';
leftCol.counterAxisSizingMode = 'FIXED';
leftCol.resize(720, 0);
leftCol.itemSpacing = 12;
leftCol.fills = [];

// AccountBanner MagicLink instance
const accSet = await figma.getNodeByIdAsync('<ID AccountBanner>');
const accMagic = accSet.children.find(v => v.name === 'Variant=MagicLink');
leftCol.appendChild(accMagic.createInstance());

// SubscriptionCard instance
const subsSet = await figma.getNodeByIdAsync('<ID SubscriptionCard>');
leftCol.appendChild(subsSet.createInstance());

// Section "RESUMEN DEL PEDIDO" — frame raw con items
// (este es un bloque específico; el implementador decide si lo encapsula como component nuevo o lo deja raw)

// Section "DETALLES" — dirección + pago

grid.appendChild(leftCol);

// RIGHT: aside (360)
const rightCol = figma.createFrame();
rightCol.layoutMode = 'VERTICAL';
rightCol.primaryAxisSizingMode = 'AUTO';
rightCol.counterAxisSizingMode = 'FIXED';
rightCol.resize(360, 0);
rightCol.itemSpacing = 12;
rightCol.fills = [];

// TrackingCard instance
const trackSet = await figma.getNodeByIdAsync('<ID TrackingCard>');
rightCol.appendChild(trackSet.createInstance());

// Help block raw frame con email/tel/ayuda
const help = figma.createFrame();
help.layoutMode = 'VERTICAL';
help.primaryAxisSizingMode = 'AUTO';
help.counterAxisSizingMode = 'FIXED';
help.layoutAlign = 'STRETCH';
help.itemSpacing = 6;
help.paddingLeft = 20; help.paddingRight = 20; help.paddingTop = 20; help.paddingBottom = 20;
help.cornerRadius = 12;
help.fills = [{ type: 'SOLID', color: T.white }];

const helpTitle = figma.createText();
helpTitle.fontName = { family: 'Clash Display', style: 'Bold' };
helpTitle.fontSize = 14;
helpTitle.characters = '¿Necesitas algo?';
helpTitle.fills = [{ type: 'SOLID', color: T.dark }];
help.appendChild(helpTitle);

for (const line of ['📧 hola@bionta.com', '📞 +34 900 00 00 00', '❓ Centro de ayuda']) {
  const t = figma.createText();
  t.fontName = { family: 'Clash Display', style: 'Regular' };
  t.fontSize = 13;
  t.characters = line;
  t.fills = [{ type: 'SOLID', color: T.dark }];
  help.appendChild(t);
}
rightCol.appendChild(help);

grid.appendChild(rightCol);

f.appendChild(grid);

// Bottom CTAs
const ctas = figma.createFrame();
ctas.layoutMode = 'HORIZONTAL';
ctas.primaryAxisSizingMode = 'AUTO';
ctas.counterAxisSizingMode = 'AUTO';
ctas.itemSpacing = 12;
ctas.fills = [];
ctas.layoutAlign = 'CENTER';

const buttonSet = await figma.getNodeByIdAsync('683:8300');
const primaryHug = buttonSet.children.find(v => v.name.includes('Type=Primary, Size=md, Width=Hug, Icon=Trailing, State=Default'));
const ctaPrimary = primaryHug.createInstance();
const cl1 = ctaPrimary.findOne(n => n.type === 'TEXT');
if (cl1) cl1.characters = 'Ir a Mi Cuenta';
ctas.appendChild(ctaPrimary);

const secondaryHug = buttonSet.children.find(v => v.name.includes('Type=Secondary, Size=md, Width=Hug, Icon=None, State=Default'));
const ctaSecondary = secondaryHug.createInstance();
const cl2 = ctaSecondary.findOne(n => n.type === 'TEXT');
if (cl2) cl2.characters = 'Seguir comprando';
ctas.appendChild(ctaSecondary);

f.appendChild(ctas);

const L7 = await figma.getNodeByIdAsync('<L7 ID>');
L7.appendChild(f);
f.x = 80; f.y = 1500;

const label = figma.createText();
label.fontName = { family: 'Clash Display', style: 'Bold' };
label.fontSize = 16;
label.characters = 'OrderConfirmation / Page (template)';
label.fills = [{ type: 'SOLID', color: T.dark }];
L7.appendChild(label);
label.x = 80; label.y = 1470;

return { id: f.id };
```

- [ ] **Step 2: Screenshot validation**

Verificar full-page template con:
- Nav arriba
- Hero verde celebratorio
- Grid 2 cols: AccountBanner + SubscriptionCard izq · TrackingCard + Help derecha
- Bottom CTAs centrados

- [ ] **Step 3: Anotar `OrderConfirmation / Page = <id>`**

---

## Task 16: Actualizar memoria del proyecto + commit

**Files:**
- Modify: `.claude/memory/design_system_v1.md`
- Modify: `.claude/memory/MEMORY.md`

- [ ] **Step 1: Recolectar todos los IDs anotados en tasks 1-15**

Dispondrás de:
- L5 ID, L6 ID, L7 ID
- Cart / Item, Cart / Summary, Cart / Drawer, Cart / Cross-sell card, Cart / Page
- Checkout / Section, Checkout / ExpressButtons, Checkout / SubscriptionBanner, Checkout / Page
- OrderConfirmation / Hero, OrderConfirmation / SubscriptionCard, OrderConfirmation / TrackingCard, OrderConfirmation / AccountBanner, OrderConfirmation / Page

- [ ] **Step 2: Append a `design_system_v1.md` una sección "L5 / L6 / L7 — Cart + Checkout + Confirmation"**

```markdown
## L5 — Cart (4 components · ~12 variants)

| Component Set | id | Variants |
|---|---|---|
| Cart / Drawer | `<id>` | State (Empty/SingleOnce/SingleSubs/Mixed) |
| Cart / Cross-sell card | `<id>` | (single) |
| Cart / Page (template) | `<id>` | — |

## L6 — Checkout (1 template + 3 molecules)

| Component | id | Variants |
|---|---|---|
| Checkout / Section | `<id>` | (single, properties: Eyebrow, Title, Header link, Show header link) |
| Checkout / ExpressButtons | `<id>` | (single) |
| Checkout / SubscriptionBanner | `<id>` | (single, properties: Title, Body) |
| Checkout / Page (template) | `<id>` | — |

## L7 — Order Confirmation (4 organisms + 1 template)

| Component | id | Variants |
|---|---|---|
| OrderConfirmation / Hero | `<id>` | Mode (Once-Guest/Subs-Guest/Mixed-Guest/Once-Logged/Subs-Logged) |
| OrderConfirmation / SubscriptionCard | `<id>` | (single) |
| OrderConfirmation / TrackingCard | `<id>` | (single) |
| OrderConfirmation / AccountBanner | `<id>` | Variant (MagicLink/Optional) |
| OrderConfirmation / Page (template) | `<id>` | — |

## L2 (additions) — Cart/Checkout molecules

| Component | id | Variants |
|---|---|---|
| Cart / Item | `<id>` | Variant (Drawer/Page) × Mode (Once/Subs) |
| Cart / Summary | `<id>` | Variant (DrawerCompact/PageExtended/CheckoutAside) |
```

Reemplazar `<id>` por los reales.

- [ ] **Step 3: Actualizar el header del archivo (total)**

Cambiar:
```
## Total: 29 component sets/components, ~155 variants
```
A:
```
## Total: 42 component sets/components, ~180 variants

## Componentes añadidos en Plan 1 Cart+Checkout (2026-04-26)

13 componentes nuevos en L2/L5/L6/L7 + 3 sub-secciones nuevas en master.
```

- [ ] **Step 4: Append entry en `MEMORY.md` index**

```markdown
- [Plan 1 Cart+Checkout DS](design_system_v1.md#l5--cart) — 13 components nuevos en sección master 683:8218.
```

(o más simple: dejar el index igual ya que `design_system_v1.md` ya está enlazado)

- [ ] **Step 5: Commit**

```bash
git add .claude/memory/design_system_v1.md .claude/memory/MEMORY.md
git commit -m "$(cat <<'EOF'
chore(memory): document cart+checkout DS components

Plan 1 ejecutado: 13 components nuevos en master 683:8218 distribuidos en
L2 (Cart/Item, Cart/Summary, Checkout/Section, ExpressButtons, SubsBanner)
y nuevas L5 Cart, L6 Checkout, L7 Order Confirmation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit creado, working tree limpio.

---

## Self-Review Checklist (post-execution)

Tras completar Task 16, validar:

- [ ] **Spec coverage:** los 13 components listados en spec sec 7 están todos en Figma.
- [ ] **Visual parity:** cada component matches su descripción en spec sec 3-6 (cart drawer 4 estados, /carrito, checkout single-page, confirmation 5 variantes).
- [ ] **No placeholders:** todos los componentes tienen contenido real (no "TBD").
- [ ] **IDs documentados:** memoria actualizada con todos los IDs.
- [ ] **Type consistency:** los component property names son consistentes (ej. "Eyebrow" no "eyebrow" en algunas tasks).

Si encuentras algo, fix inline. No re-review — fix and move on.
