# Bionta — Migración a arquitectura Figma multi-archivo (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el actual archivo único "Bionta Design" a una arquitectura de 5 archivos Figma (Foundations / Icons / Components / Product / Backoffice) con librerías publicables, READMEs internos y System Index maestro.

**Architecture:** Tres archivos librería (Foundations → Icons → Components) que publican variables, styles y componentes. Dos archivos consumidores (Product, Backoffice) consumen las librerías y contienen pantallas. Migración gradual por capas con safety net del archivo actual.

**Tech Stack:**
- **Figma Desktop** (creación de archivos, publicación de librerías, swap de instancias — acciones manuales)
- **MCP figma-console** (operaciones programáticas sobre archivo abierto: crear páginas/sections, mover nodos, variables, prototype wiring)
- **Filesystem + git** (actualizar `.claude/memory/`, commits del progreso)

**Convención de steps:**
- `[MANUAL]` — acción del usuario en Figma Desktop UI
- `[MCP]` — operación vía herramientas `mcp__figma-console__*`
- `[LOCAL]` — operación de filesystem/git
- `[VERIFY]` — comprobación de estado

**Referencia obligatoria:** Spec en `docs/superpowers/specs/2026-05-20-figma-files-architecture-design.md`.

---

## File Structure

**Figma files objetivo (post-migración):**

| File | Rol | Publica | Consume |
|---|---|---|---|
| `Bionta — Foundations` | Tokens base | Variables + styles | — |
| `Bionta — Icons` | Iconografía | Icon components | Foundations |
| `Bionta — Components` | UI kit | Componentes | Foundations + Icons |
| `Bionta — Product` | Pantallas cliente | — | Las 3 librerías |
| `Bionta — Backoffice` | Pantallas internas | — | Las 3 librerías |
| `Bionta Design — Legacy 2026-04 (archived)` | Snapshot | — | — |

**Filesystem / repo:**
- Modify: `.claude/memory/figma_file_bionta_design.md` (Capa 5)
- Modify: `.claude/memory/MEMORY.md` (Capa 5, si cambia el slug)

---

## Capa 0 — Preparación

### Task 1: Duplicar archivo actual como safety net

**Files:**
- Source: Figma file `v34S6c0aQGYqHY1eFIq48z` ("Bionta Design")
- Target: copia nombrada `Bionta Design — Legacy snapshot 2026-05-20`

- [ ] **Step 1.1: Abrir archivo actual en Figma Desktop**

[MANUAL] Abrir `https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design` en Figma Desktop. Confirmar que Figma Desktop Bridge plugin está corriendo (Plugins → Development → Figma Desktop Bridge → Run).

- [ ] **Step 1.2: Duplicar archivo desde la barra superior**

[MANUAL] File menu → Duplicate. Renombrar la copia a `Bionta Design — Legacy snapshot 2026-05-20`. Esta copia queda intocable como referencia.

- [ ] **Step 1.3: Verificar duplicación**

[VERIFY] En la pestaña de archivos del equipo, deben verse:
- `Bionta Design` (el que se migrará)
- `Bionta Design — Legacy snapshot 2026-05-20` (safety net)

- [ ] **Step 1.4: Anotar file key del snapshot**

[MANUAL] Abrir el archivo snapshot y copiar su file key de la URL. Apuntarlo aquí mismo como nota (lo necesitaremos en Capa 5):

```
SNAPSHOT_FILE_KEY = <pegar aquí>
```

---

### Task 2: Inventario del archivo origen

**Goal:** Tener una lista verificable de qué hay que migrar para validar al final.

- [ ] **Step 2.1: Conectar MCP al archivo actual**

[MCP] Verificar conexión:
```
mcp__figma-console__figma_get_status
```
Expected: status `connected` y `fileKey: v34S6c0aQGYqHY1eFIq48z`.

- [ ] **Step 2.2: Capturar inventario de variables**

[MCP] Ejecutar:
```
mcp__figma-console__figma_get_variables
```
Expected: ≥28 color primitives + 36 semantic + variables de typography. Guardar el output como referencia en `docs/superpowers/migration-notes/inventory-2026-05-20.md`.

- [ ] **Step 2.3: Capturar inventario de componentes**

[MCP] Ejecutar:
```
mcp__figma-console__figma_get_design_system_summary
```
Expected: 27 components / 147 variants. Añadir al archivo de inventory.

- [ ] **Step 2.4: Capturar lista de páginas**

[MCP] Ejecutar:
```
mcp__figma-console__figma_get_file_for_plugin
```
Expected: páginas Home, Design System, Components, Icons, Product, Cart, Backoffice, Componentización, Calendario, prototype. Anotar node IDs de cada página.

- [ ] **Step 2.5: Commit del inventario**

[LOCAL]
```bash
git add docs/superpowers/migration-notes/inventory-2026-05-20.md
git commit -m "docs(migration): inventario pre-migración Figma multi-file"
```

---

## Capa 1 — Foundations

### Task 3: Crear archivo `Bionta — Foundations`

- [ ] **Step 3.1: Crear archivo nuevo en el team de Figma**

[MANUAL] En Figma Desktop, en el team de Bionta: New design file. Renombrar inmediatamente a `Bionta — Foundations` (con em-dash `—`, no guion).

- [ ] **Step 3.2: Anotar file key**

[MANUAL] Copiar el file key de la URL y anotarlo:
```
FOUNDATIONS_FILE_KEY = <pegar aquí>
```

- [ ] **Step 3.3: Verificar conexión MCP con el nuevo archivo**

[MCP] Con el archivo abierto:
```
mcp__figma-console__figma_get_status
```
Expected: `fileKey` coincide con `FOUNDATIONS_FILE_KEY`.

---

### Task 4: Configurar páginas internas de Foundations

**Files:** archivo `Bionta — Foundations`

- [ ] **Step 4.1: Crear las páginas en orden**

[MCP] Ejecutar via `figma_execute`:

```javascript
await figma.loadAllPagesAsync();
const pageNames = [
  "📘 README",
  "🗺️ System Index",
  "🎨 Color",
  "🔤 Typography",
  "📐 Spacing & Grid",
  "🌀 Effects & Radii",
  "📦 Variable collections",
  "🗑 Archive"
];
const existing = new Set(figma.root.children.map(p => p.name));
for (const name of pageNames) {
  if (!existing.has(name)) {
    const page = figma.createPage();
    page.name = name;
  }
}
// Eliminar página default "Page 1" si está vacía
const defaultPage = figma.root.children.find(p => p.name === "Page 1");
if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();
```

- [ ] **Step 4.2: Verificar páginas creadas**

[MCP]
```
mcp__figma-console__figma_get_file_for_plugin
```
Expected: las 8 páginas listadas en orden.

---

### Task 5: README de Foundations

**Files:** página `📘 README` de Foundations

- [ ] **Step 5.1: Crear frame README con plantilla**

[MCP] En la página `📘 README`, crear un frame de 1440×auto con la plantilla del spec (sección "Plantilla del README"). Bloques:

```
PROPÓSITO          Variables, styles y fundamentos del sistema Bionta.
                   NO contiene iconos ni componentes.
AUDIENCIA          Diseño · Desarrollo
ESTADO             v1 · 2026-05-20 · Owner: Jose Valero
ESTRUCTURA INTERNA Color · Typography · Spacing & Grid · Effects & Radii ·
                   Variable collections · System Index
DEPENDENCIAS       Consume: — · Publica: Variables + styles
CONVENCIONES       Tipografía max weight Medium (nunca Bold)
                   4px grid en paddings/gaps/sizes/radii/strokes
                   Breakpoints: 1440 / 768 / 375
CÓMO CONTRIBUIR    Cualquier cambio republica librería al cerrar sesión
LINKS              → Bionta — Icons · → Components · → Product · → Backoffice
                   → github.com/Azlinraeh/Bionta
                   → biontagourmet.atlassian.net/KAN
```

Usar componente "ReadmeCover" si existe en Components ya migrado; si no, frame con texto plano. (Esta primera iteración será texto plano porque Components aún no existe.)

- [ ] **Step 5.2: Verificar**

[VERIFY] Abrir la página `📘 README` en Figma Desktop. El frame debe ser legible a primera vista al abrir el archivo.

- [ ] **Step 5.3: Commit (notas de migración)**

[LOCAL]
```bash
echo "Capa 1 — Foundations creado y README inicial listo" >> docs/superpowers/migration-notes/migration-log.md
git add docs/superpowers/migration-notes/migration-log.md
git commit -m "docs(migration): capa 1 — Foundations creado con README inicial"
```

---

### Task 6: Migrar Color variables a Foundations

**Files:** páginas `🎨 Color` y `📦 Variable collections` en Foundations

- [ ] **Step 6.1: Capturar definiciones de color del archivo origen**

[MCP] (en el archivo origen `v34S6c0aQGYqHY1eFIq48z`)
```
mcp__figma-console__figma_get_variables
```
Filtrar el output a las collections de color (28 primitives + 36 semantic). Guardar el JSON a `docs/superpowers/migration-notes/color-vars-source.json`.

- [ ] **Step 6.2: Crear variable collections vacías en Foundations**

[MCP] (cambiar al archivo Foundations)
```
mcp__figma-console__figma_create_variable_collection { name: "Color — Primitives" }
mcp__figma-console__figma_create_variable_collection { name: "Color — Semantic", modes: ["Light", "Dark"] }
```

(Si actualmente solo hay modo Light, omitir Dark hasta que el sistema lo soporte.)

- [ ] **Step 6.3: Batch create primitives**

[MCP] Usar `figma_batch_create_variables` con el JSON capturado en 6.1, mapeando cada primitive a la collection `Color — Primitives`. Tipo: COLOR.

- [ ] **Step 6.4: Batch create semantic variables**

[MCP] `figma_batch_create_variables` para las 36 semantic, apuntando aliases a las primitives recién creadas. (Las semantic son aliases — sus valores son referencias a primitives.)

- [ ] **Step 6.5: Showcase en página Color**

[MCP] En la página `🎨 Color`, recrear el showcase actual del archivo origen (swatches en grid con label de variable y valor hex). Usar `figma_get_component_for_development` sobre el showcase original para copiar el layout.

- [ ] **Step 6.6: Verificar**

[VERIFY] En Foundations → página `📦 Variable collections`: deben verse las dos collections con 28 + 36 variables. En la página `🎨 Color` el showcase visualmente coincide con el original.

- [ ] **Step 6.7: Commit nota de migración**

[LOCAL]
```bash
git add docs/superpowers/migration-notes/color-vars-source.json docs/superpowers/migration-notes/migration-log.md
git commit -m "docs(migration): capa 1 — color variables migradas a Foundations"
```

---

### Task 7: Migrar Typography styles + variables

**Files:** página `🔤 Typography` en Foundations

- [ ] **Step 7.1: Capturar text styles del archivo origen**

[MCP] (en archivo origen)
```
mcp__figma-console__figma_get_text_styles
```
Expected: ≥10 styles. Guardar a `docs/superpowers/migration-notes/text-styles-source.json`.

- [ ] **Step 7.2: Capturar variables de typography**

[MCP] (en archivo origen) — del output ya capturado en Task 2.2, filtrar las 15 variables de typography.

- [ ] **Step 7.3: Crear typography variable collection en Foundations**

[MCP] (en Foundations)
```
mcp__figma-console__figma_create_variable_collection { name: "Typography" }
```
Luego `figma_batch_create_variables` con las 15 variables.

- [ ] **Step 7.4: Crear text styles en Foundations**

[MCP] (en Foundations) Para cada style del JSON capturado en 7.1, ejecutar `figma_execute` que cree el style con el font/size/weight/lineHeight correspondiente. Cargar fuentes con `figma.loadFontAsync` antes (Inter + Clash Display). Reference: ver `figma_plugin_api_gotchas.md` memoria.

- [ ] **Step 7.5: Showcase en página Typography**

[MCP] Recrear el showcase tipográfico actual (los 10 styles aplicados a frases reales).

- [ ] **Step 7.6: Verificar regla "max weight Medium"**

[VERIFY] Inspeccionar todos los text styles creados. Ninguno debe usar Clash Display Bold. Si encuentras algún Bold, está mal — corregir.

- [ ] **Step 7.7: Commit**

[LOCAL]
```bash
git add docs/superpowers/migration-notes/
git commit -m "docs(migration): capa 1 — typography styles + vars migrados"
```

---

### Task 8: Migrar Spacing & Grid + Effects & Radii

**Files:** páginas `📐 Spacing & Grid` y `🌀 Effects & Radii` en Foundations

- [ ] **Step 8.1: Recrear grid styles**

[MCP] En Foundations, recrear los grid styles de los 3 breakpoints (1440 / 768 / 375). Si hay grid variables, migrarlas a una collection `Grid`.

- [ ] **Step 8.2: Recrear effect styles**

[MCP] Capturar effect styles del origen con `figma_get_styles`, recrear en Foundations.

- [ ] **Step 8.3: Crear collection de Radii**

[MCP]
```
mcp__figma-console__figma_create_variable_collection { name: "Radius" }
```
Crear variables `radius/none = 0`, `radius/sm = 4`, `radius/md = 8`, etc. (mapear a los valores actuales usados en el archivo origen).

- [ ] **Step 8.4: Showcase en página Spacing & Grid**

[MCP] Crear un frame que documente visualmente el 4px grid y los 3 breakpoints con anotaciones.

- [ ] **Step 8.5: Verificar**

[VERIFY] Las 4 collections de variables (`Color — Primitives`, `Color — Semantic`, `Typography`, `Grid`/`Radius`) están completas en `📦 Variable collections`.

- [ ] **Step 8.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 1 — spacing/grid/effects/radii migrados"
```

---

### Task 9: System Index en Foundations

**Files:** página `🗺️ System Index` en Foundations

- [ ] **Step 9.1: Crear diagrama de dependencias**

[MCP] En `🗺️ System Index`, crear un frame que muestre visualmente el flujo Foundations → Icons → Components → Product/Backoffice. Usar shapes + connectors (si es FigJam-style no aplica aquí porque es design file; usar rectángulos con flechas).

- [ ] **Step 9.2: Crear tabla de archivos**

[MCP] Crear una tabla con columnas: Archivo · Rol · Publica · Consume · Owner · Link. Filas: las 5 archivos. Inicialmente solo Foundations tiene link real; los demás se rellenan a medida que se crean en capas posteriores.

- [ ] **Step 9.3: Añadir principios del design system**

[MCP] Bloque de texto con:
- Tipografía max weight Medium
- 4px grid
- Breakpoints 1440 / 768 / 375
- Paleta dominante: `#FFC200` · `#1E1E1E` · blanco roto

- [ ] **Step 9.4: Enlaces externos**

[MCP] Lista de links:
- Repo: github.com/Azlinraeh/Bionta
- Jira: biontagourmet.atlassian.net/KAN
- Tokens exportados: `design/tokens/colors.json`, `tailwind.config.ts`, `tokens.css`

- [ ] **Step 9.5: Verificar**

[VERIFY] Abrir la página `🗺️ System Index`. Cualquier persona ajena al proyecto debería entender en <5 minutos qué es Bionta y dónde está cada cosa.

---

### Task 10: Publicar Foundations como librería

- [ ] **Step 10.1: Publicar**

[MANUAL] En Figma Desktop, archivo Foundations: Assets panel → Libraries → Publish library. Description: `v1 inicial — color (28 + 36) + typography (10 styles + 15 vars) + grid + radii`.

- [ ] **Step 10.2: Verificar publicación**

[VERIFY] En cualquier otro archivo del team, abrir Assets panel → Libraries. Debe aparecer `Bionta — Foundations` disponible para activar.

- [ ] **Step 10.3: Commit nota**

[LOCAL]
```bash
git commit -am "docs(migration): capa 1 — Foundations publicado como librería"
```

---

## Capa 1b — Icons

### Task 11: Crear `Bionta — Icons` y configurar páginas

- [ ] **Step 11.1: Crear archivo**

[MANUAL] En el team de Figma: New design file → `Bionta — Icons`. Anotar `ICONS_FILE_KEY`.

- [ ] **Step 11.2: Activar librería Foundations**

[MANUAL] En el archivo Icons: Assets panel → Libraries → activar `Bionta — Foundations`.

- [ ] **Step 11.3: Crear páginas**

[MCP]
```javascript
await figma.loadAllPagesAsync();
const pageNames = ["📘 README", "🔣 Icons — Material", "🏷 Logos", "🧪 Sandbox", "🗑 Archive"];
const existing = new Set(figma.root.children.map(p => p.name));
for (const name of pageNames) {
  if (!existing.has(name)) figma.createPage().name = name;
}
const defaultPage = figma.root.children.find(p => p.name === "Page 1");
if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();
```

- [ ] **Step 11.4: Crear README**

[MCP] En página `📘 README`, frame con plantilla. Bloques:

```
PROPÓSITO     Iconografía oficial de Bionta. Material Symbols + logos.
              NO contiene componentes UI, NO contiene tokens.
AUDIENCIA     Diseño · Desarrollo
DEPENDENCIAS  Consume: Bionta — Foundations
              Publica: icon components
CONVENCIONES  Iconos: SIEMPRE Material Design (referencia memoria
              icon_system_material.md). Nunca símbolos tipográficos.
              Logos: solo versiones oficiales aprobadas.
```

---

### Task 12: Migrar Material icons

- [ ] **Step 12.1: Inventariar iconos del origen**

[MCP] (en archivo origen, página Icons `397:180`) Capturar lista de icon components con `figma_search_components { query: "" }` filtrado por la página.

- [ ] **Step 12.2: Copiar iconos a Icons file**

[MCP] (en archivo Icons) Para cada icon, usar `figma_get_component_for_development_deep` en el origen para obtener su definición, luego recrear en `🔣 Icons — Material` del archivo Icons como component con la misma key/name si es posible.

(Alternativa más rápida pero manual: copy-paste cross-file en Figma Desktop, página a página.)

- [ ] **Step 12.3: Verificar set canónico**

[VERIFY] El número de icons en `🔣 Icons — Material` coincide con el inventario del Step 12.1.

---

### Task 13: Migrar Logos

- [ ] **Step 13.1: Copiar logos oficiales**

[MCP] o [MANUAL] copy-paste de los logos (Bionta + sociales) desde el origen a la página `🏷 Logos` del archivo Icons.

- [ ] **Step 13.2: Verificar**

[VERIFY] Logo Bionta + logos sociales presentes y nombrados con convención clara.

---

### Task 14: Publicar Icons

- [ ] **Step 14.1: Publish**

[MANUAL] Assets panel → Publish library. Description: `Iconografía Bionta v1 — Material + logos`.

- [ ] **Step 14.2: Verificar**

[VERIFY] En el archivo origen, abrir Assets → Libraries → `Bionta — Icons` disponible.

- [ ] **Step 14.3: Actualizar System Index**

[MCP] (en Foundations) En `🗺️ System Index`, completar la fila de Icons con el link real al archivo.

- [ ] **Step 14.4: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 1b — Icons creado y publicado"
```

---

## Capa 2 — Components

### Task 15: Crear `Bionta — Components`

- [ ] **Step 15.1: Crear archivo**

[MANUAL] New design file → `Bionta — Components`. Anotar `COMPONENTS_FILE_KEY`.

- [ ] **Step 15.2: Activar librerías**

[MANUAL] Assets → Libraries → activar `Bionta — Foundations` y `Bionta — Icons`.

- [ ] **Step 15.3: Crear páginas**

[MCP]
```javascript
await figma.loadAllPagesAsync();
const pageNames = ["📘 README", "🧱 Primitives", "🧬 Patterns", "📋 Audit", "🧪 Sandbox", "🗑 Archive"];
const existing = new Set(figma.root.children.map(p => p.name));
for (const name of pageNames) {
  if (!existing.has(name)) figma.createPage().name = name;
}
const defaultPage = figma.root.children.find(p => p.name === "Page 1");
if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();
```

- [ ] **Step 15.4: README**

[MCP] En `📘 README`, plantilla con:

```
PROPÓSITO     Librería UI de Bionta. Primitives + patterns.
AUDIENCIA     Diseño · Desarrollo
DEPENDENCIAS  Consume: Foundations + Icons
              Publica: todos los componentes
CONVENCIONES  Naming variants: PascalCase para component, kebab para variant
              Primitives = bloques de un solo propósito (Button, Input...)
              Patterns = composiciones (Comparativa, Drawer cart...)
```

---

### Task 16: Migrar Primitives (lotes)

**Goal:** Mover los componentes "primitives" del archivo origen al archivo Components. El archivo origen tiene 27 components / 147 variants; lo divido en primitives vs patterns.

- [ ] **Step 16.1: Identificar primitives vs patterns**

[MCP] (en archivo origen) `figma_get_design_system_summary`. Clasificar manualmente cada component:
- Primitive: Button, Input, Card base, Badge, Tag, Checkbox, Radio, SegmentedControl, Avatar, Toggle, etc.
- Pattern: Comparativa card, Tier-toggle, Drawer cart, Calendar Gantt, ProductCard PDP, etc.

Guardar la lista en `docs/superpowers/migration-notes/components-classification.md`.

- [ ] **Step 16.2: Mover primitives lote 1 (botones + inputs)**

[MCP] (en archivo Components, página `🧱 Primitives`) Recrear cada primitive. Para cada uno:
1. En origen: `figma_get_component_for_development_deep` → captura definición.
2. En Components: crear component nuevo con misma estructura, vincular variables y styles a las librerías remotas (Foundations, Icons).
3. Verificar variantes coinciden.

- [ ] **Step 16.3: Mover primitives lote 2 (cards + badges + tags)**

[MCP] Mismo proceso para Card, Badge, Tag, Avatar.

- [ ] **Step 16.4: Mover primitives lote 3 (form controls)**

[MCP] Mismo proceso para Checkbox, Radio, SegmentedControl, Toggle.

- [ ] **Step 16.5: Verificar primitives migrados**

[VERIFY] En página `🧱 Primitives`, count de components coincide con el lote planificado. Visualmente coherente.

- [ ] **Step 16.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 2 — primitives migrados a Components"
```

---

### Task 17: Migrar Patterns

- [ ] **Step 17.1: Mover patterns**

[MCP] (en archivo Components, página `🧬 Patterns`) Recrear cada pattern del archivo origen:
- Comparativa card (regla: lado recomendado saturado, otro neutro con borde fino — referencia memoria `comparativa_card_pattern.md`)
- Tier-toggle
- Drawer cart
- Calendar Gantt
- ProductCard PDP
- Otros que aparezcan en clasificación

- [ ] **Step 17.2: Verificar conteo total**

[VERIFY] Primitives + Patterns = 27 components / 147 variants (aprox; algunas variants pueden consolidarse durante la migración).

- [ ] **Step 17.3: Crear página Audit**

[MCP] En `📋 Audit`, copiar el contenido de la página Componentización `595:4888` del archivo origen (auditoría P0/P1/P2).

---

### Task 18: Publicar Components

- [ ] **Step 18.1: Publish**

[MANUAL] Assets panel → Publish library. Description: `UI kit Bionta v1 — primitives + patterns`.

- [ ] **Step 18.2: Swap library en archivo origen**

[MANUAL] (en archivo origen) Assets → Swap library → seleccionar componentes locales y mapearlos a la nueva `Bionta — Components`. Esto sustituye instances en bulk.

**⚠ Riesgo:** instances con overrides pueden desconectarse. Antes de confirmar el swap, abrir 5 instances al azar en el archivo origen, anotar sus overrides, y verificar que se preservan tras el swap.

- [ ] **Step 18.3: Verificar swap**

[VERIFY] En el archivo origen, las pantallas se renderizan idénticas. Cualquier discrepancia visual indica un swap roto.

- [ ] **Step 18.4: Actualizar System Index**

[MCP] (en Foundations → System Index) Completar fila de Components con link real.

- [ ] **Step 18.5: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 2 — Components publicado + swap en origen"
```

---

## Capa 3 — Product

### Task 19: Crear `Bionta — Product` y configurar páginas

- [ ] **Step 19.1: Crear archivo**

[MANUAL] New design file → `Bionta — Product`. Anotar `PRODUCT_FILE_KEY`.

- [ ] **Step 19.2: Activar las 3 librerías**

[MANUAL] Assets → Libraries → activar Foundations + Icons + Components.

- [ ] **Step 19.3: Crear las páginas en orden**

[MCP]
```javascript
await figma.loadAllPagesAsync();
const pageNames = [
  "📘 README",
  "🏠 Home",
  "🛍 PDP",
  "🛒 Carrito",
  "💳 Checkout",
  "👤 Mi Cuenta",
  "📅 Calendario de temporada",
  "📦 Estados",
  "🎬 Prototype — User Journey v1",
  "🧪 Sandbox",
  "🗑 Archive"
];
const existing = new Set(figma.root.children.map(p => p.name));
for (const name of pageNames) {
  if (!existing.has(name)) figma.createPage().name = name;
}
const defaultPage = figma.root.children.find(p => p.name === "Page 1");
if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();
```

- [ ] **Step 19.4: Crear Sections Canonical + Exploraciones en cada página de pantalla**

[MCP] Para cada una de las 6 páginas de pantallas (Home, PDP, Carrito, Checkout, Mi Cuenta, Calendario):

```javascript
const targetPages = ["🏠 Home", "🛍 PDP", "🛒 Carrito", "💳 Checkout", "👤 Mi Cuenta", "📅 Calendario de temporada"];
for (const pageName of targetPages) {
  const page = figma.root.children.find(p => p.name === pageName);
  if (!page) continue;
  await figma.setCurrentPageAsync(page);

  // Crear section Canonical
  const canonical = figma.createSection();
  canonical.name = "✅ Canonical";
  canonical.x = 0; canonical.y = 0;

  // Crear section Exploraciones
  const explorations = figma.createSection();
  explorations.name = "🧪 Exploraciones";
  explorations.x = 0; explorations.y = 3000;
}
```

- [ ] **Step 19.5: Verificar**

[VERIFY] Cada página de pantalla tiene exactamente dos sections vacías con los nombres correctos.

---

### Task 20: README de Product

- [ ] **Step 20.1: Crear README cover**

[MCP] En `📘 README`:

```
PROPÓSITO     Pantallas cliente: Home, PDP, Carrito, Checkout, Mi Cuenta,
              Calendario. Incluye el prototype del user journey v1.
AUDIENCIA     Diseño · Desarrollo · Producto · Stakeholders
DEPENDENCIAS  Consume: Foundations + Icons + Components
              Publica: —
CONVENCIONES  Cada página tiene ✅ Canonical + 🧪 Exploraciones.
              Frames canónicos en breakpoints 1440 / 768 / 375.
              Convención: [Screen] — Tablet/Mobile.
              Para implementación, dev mira solo ✅ Canonical.
LINKS         → Foundations · Icons · Components · Backoffice
              → github.com/Azlinraeh/Bionta
              → biontagourmet.atlassian.net/KAN
```

---

### Task 21: Migrar Home → Product

- [ ] **Step 21.1: Identificar frames canónicos vs exploraciones**

[MCP] (en archivo origen, página Home `300:2840` y derivadas) Listar frames. El home canónico actual está en página `603:5435` (11 bloques, ver `home_audit_product_lens.md`). Todo lo demás es exploración.

Guardar mapeo en `docs/superpowers/migration-notes/home-migration-map.md`.

- [ ] **Step 21.2: Copiar canonical**

[MANUAL o MCP] Copy frames canónicos (Home 1440 + 768 + 375) al Section `✅ Canonical` de la página `🏠 Home` en Product. Verificar que después del paste, las referencias a componentes apuntan a la librería remota `Bionta — Components` (no a copias locales).

- [ ] **Step 21.3: Copiar exploraciones**

[MANUAL o MCP] Copy resto de variantes/exploraciones al Section `🧪 Exploraciones`. Etiquetar cada una con nombre descriptivo (`v1 legacy`, `hero alt`, etc.).

- [ ] **Step 21.4: Verificar rebindings**

[VERIFY] Abrir un frame canónico en Product. Inspeccionar 3-5 component instances. Su "Main component" debe apuntar a la librería remota Components, no a un component local. Si hay locales, hacer Swap library.

- [ ] **Step 21.5: Variable rebind sweep**

[MCP] (en archivo Product) Buscar fills/strokes sin variable bound:
```javascript
const orphans = [];
figma.root.children.forEach(page => {
  if (!page.name.startsWith("🏠")) return;
  // ... walk children, check fills, identify orphans
});
```
Si hay >0 orphans, rebindear a la librería Foundations correspondiente.

- [ ] **Step 21.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — Home migrado a Product"
```

---

### Task 22: Migrar PDP → Product

- [ ] **Step 22.1: Identificar canonical vs exploraciones PDP**

[MCP] (archivo origen, página Product `238:177`) Listar frames. Identificar canonical (versión vigente PDP caja cerrada + caja personalizable; referencia PRDs en `docs/prd-pdp-*`).

Guardar mapeo en `docs/superpowers/migration-notes/pdp-migration-map.md`.

- [ ] **Step 22.2: Copiar canonical**

[MANUAL o MCP] Copy frames canónicos PDP (caja cerrada + caja personalizable, en 1440 + 768 + 375) al Section `✅ Canonical` de la página `🛍 PDP` en Product.

- [ ] **Step 22.3: Copiar exploraciones**

[MANUAL o MCP] Copy variantes no canónicas al Section `🧪 Exploraciones`. Etiquetar cada una con nombre descriptivo.

- [ ] **Step 22.4: Verificar rebindings**

[VERIFY] Abrir un frame canónico PDP en Product. Inspeccionar 3-5 instances. Sus "Main component" deben apuntar a `Bionta — Components` (remoto), no a copias locales. Si hay locales, hacer Swap library.

- [ ] **Step 22.5: Variable rebind sweep**

[MCP] (en archivo Product, página `🛍 PDP`) Buscar fills/strokes sin variable bound; rebindear a Foundations.

- [ ] **Step 22.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — PDP migrado a Product"
```

---

### Task 23: Migrar Carrito → Product

**Notas específicas:** incluye drawer cart overlays (parte del prototipo). En esta task se migran sólo los frames; el wiring se rehace en Task 27.

- [ ] **Step 23.1: Identificar canonical vs exploraciones Carrito**

[MCP] (archivo origen, página Cart `333:156`) Listar frames. Identificar canonical vigente. Guardar mapeo en `docs/superpowers/migration-notes/carrito-migration-map.md`.

- [ ] **Step 23.2: Copiar canonical**

[MANUAL o MCP] Copy frames canónicos Carrito (incluidos drawer cart overlays) al Section `✅ Canonical` de `🛒 Carrito` en Product.

- [ ] **Step 23.3: Copiar exploraciones**

[MANUAL o MCP] Copy variantes al Section `🧪 Exploraciones`.

- [ ] **Step 23.4: Verificar rebindings**

[VERIFY] Instances apuntan a librería remota Components.

- [ ] **Step 23.5: Variable rebind sweep**

[MCP] Mismo procedimiento que Step 21.5, sobre página `🛒 Carrito`.

- [ ] **Step 23.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — Carrito migrado a Product (drawer overlays incluidos)"
```

---

### Task 24: Migrar Checkout → Product

**Notas específicas:** Checkout no tiene página dedicada en el inventario; sus frames están dispersos en el archivo origen.

- [ ] **Step 24.1: Localizar frames de Checkout en origen**

[MCP] (archivo origen) `figma_search_components { query: "checkout" }` y `figma_search_components { query: "pago" }`. Anotar todos los frames encontrados en `docs/superpowers/migration-notes/checkout-migration-map.md`.

- [ ] **Step 24.2: Copiar canonical**

[MANUAL o MCP] Copy frames de la versión Checkout vigente (referencia PRD `docs/prd-v1-alcance.md` para qué pantallas constituyen el flow Checkout v1.5) al Section `✅ Canonical` de `💳 Checkout` en Product.

- [ ] **Step 24.3: Copiar exploraciones**

[MANUAL o MCP] Copy variantes al Section `🧪 Exploraciones`.

- [ ] **Step 24.4: Verificar rebindings**

[VERIFY] Instances apuntan a librería remota Components.

- [ ] **Step 24.5: Variable rebind sweep**

[MCP] Mismo procedimiento que Step 21.5, sobre página `💳 Checkout`.

- [ ] **Step 24.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — Checkout migrado a Product"
```

---

### Task 25: Migrar Mi Cuenta → Product

**Notas específicas:** referencia PRD `docs/prd-mi-cuenta.md` para alcance v1.5.

- [ ] **Step 25.1: Identificar canonical vs exploraciones Mi Cuenta**

[MCP] (archivo origen) Localizar frames de Mi Cuenta. Guardar mapeo en `docs/superpowers/migration-notes/mi-cuenta-migration-map.md`.

- [ ] **Step 25.2: Copiar canonical**

[MANUAL o MCP] Copy frames Mi Cuenta canónicos al Section `✅ Canonical` de `👤 Mi Cuenta` en Product.

- [ ] **Step 25.3: Copiar exploraciones**

[MANUAL o MCP] Copy variantes al Section `🧪 Exploraciones`.

- [ ] **Step 25.4: Verificar rebindings**

[VERIFY] Instances apuntan a librería remota Components.

- [ ] **Step 25.5: Variable rebind sweep**

[MCP] Mismo procedimiento que Step 21.5, sobre página `👤 Mi Cuenta`.

- [ ] **Step 25.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — Mi Cuenta migrado a Product"
```

---

### Task 26: Migrar Calendario → Product

- [ ] **Step 26.1: Copiar calendario**

[MCP] (archivo origen, página `730:24739`) Copy del Gantt anual 12 frutas × 12 meses al Section `✅ Canonical` de `📅 Calendario de temporada` en Product.

- [ ] **Step 26.2: Re-aplicar conexión desde Home**

Esto se hace al re-wire del prototype en Task 27.

- [ ] **Step 26.3: Bug pending: Mango Tommy peak wrap**

[VERIFY] El bug del Mango Tommy peak wrap (referencia memoria `calendar_page.md`) persiste tras la migración. **NO se arregla en esta migración** (fuera de alcance — esto es solo reorganización estructural). Anotar en `migration-log.md` que sigue abierto.

- [ ] **Step 26.4: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — Calendario migrado (Mango Tommy bug sigue abierto)"
```

---

### Task 27: Re-wire prototype User Journey v1

- [ ] **Step 27.1: Capturar wiring actual del origen**

[MCP] (archivo origen, página prototype `696:22802`) Capturar todas las reactions/interactions con `figma_get_design_context`. Guardar a `docs/superpowers/migration-notes/prototype-wiring-source.json`.

Wiring esperado: 8 frames clickables incluyendo drawer cart overlays, calendar y breadcrumbs (referencia `prototype_user_journey.md`).

- [ ] **Step 27.2: Copiar prototype frames a Product**

[MCP] Copy frames del prototipo del origen a página `🎬 Prototype — User Journey v1` en Product.

- [ ] **Step 27.3: Recrear interactions**

[MCP] Para cada reaction capturada en 27.1, crear la equivalente en Product apuntando al frame correspondiente. **Gotcha:** OVERLAY no acepta SMART_ANIMATE (referencia `figma_plugin_api_gotchas.md`).

- [ ] **Step 27.4: Probar el prototype**

[MANUAL] En Figma Desktop, abrir el prototype y recorrer el user journey completo. Cada paso debe funcionar (Home → PDP → Carrito → Checkout → ... → Calendar → vuelta).

- [ ] **Step 27.5: Verificar drawer cart overlays**

[VERIFY] Los overlays del drawer cart se abren correctamente desde cualquier pantalla. Si alguno falla, anotar y arreglar.

- [ ] **Step 27.6: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — prototype User Journey v1 re-wired"
```

---

### Task 28: Cleanup de huérfanos en Product

**Goal:** Aplicar el cleanup pendiente del memo `cleanup_pending_2026-05-01.md` (13 huérfanos + 8 candidatos).

- [ ] **Step 28.1: Localizar los 13 huérfanos**

[MCP] (en archivo Product) Buscar los frames listados como huérfanos en el memo. Mover cada uno al Section `🗑 Archive` o página `🗑 Archive`.

- [ ] **Step 28.2: Revisar los 8 candidatos**

[MANUAL] Inspeccionar cada uno de los 8 candidatos del memo. Decidir caso por caso: si está obsoleto → mover a `🗑 Archive`; si es exploración válida → mover a Section `🧪 Exploraciones` de la página correspondiente.

- [ ] **Step 28.3: Verificar verificación de imágenes en surfaces**

[VERIFY] Surfaces marcados sin verificar imágenes en el memo: confirmar que en Product las imágenes están bien (no roto, no placeholder genérico).

- [ ] **Step 28.4: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 3 — cleanup huérfanos aplicado en Product"
```

---

### Task 29: Actualizar System Index con Product

- [ ] **Step 29.1: Completar fila Product**

[MCP] (en Foundations → System Index) Completar la fila Product con link real al archivo.

- [ ] **Step 29.2: Republicar Foundations**

[MANUAL] Assets → Publish library con el cambio en System Index. (Aunque System Index no se publica formalmente, republish refresca el archivo.)

---

## Capa 4 — Backoffice

### Task 30: Crear `Bionta — Backoffice` y migrar

- [ ] **Step 30.1: Crear archivo**

[MANUAL] New design file → `Bionta — Backoffice`. Anotar `BACKOFFICE_FILE_KEY`.

- [ ] **Step 30.2: Activar librerías**

[MANUAL] Assets → Libraries → activar Foundations + Icons + Components.

- [ ] **Step 30.3: Crear páginas**

[MCP]
```javascript
await figma.loadAllPagesAsync();
const pageNames = [
  "📘 README",
  "🏠 Dashboard",
  "📦 Cajas (gestión)",
  "👥 Clientes / pedidos",
  "🛒 Operaciones",
  "🎬 Prototype — Backoffice",
  "🧪 Sandbox",
  "🗑 Archive"
];
const existing = new Set(figma.root.children.map(p => p.name));
for (const name of pageNames) {
  if (!existing.has(name)) figma.createPage().name = name;
}
const defaultPage = figma.root.children.find(p => p.name === "Page 1");
if (defaultPage && defaultPage.children.length === 0) defaultPage.remove();
```

- [ ] **Step 30.4: README**

[MCP] En `📘 README`:

```
PROPÓSITO     Pantallas internas de operaciones. Dashboard, gestión de cajas,
              clientes, pedidos.
AUDIENCIA     Diseño · Desarrollo · Operaciones
DEPENDENCIAS  Consume: Foundations + Icons + Components
              Publica: —
CONVENCIONES  Ritmo de iteración independiente de Product. Cambios
              aquí no afectan al user journey cliente.
```

- [ ] **Step 30.5: Copiar contenido de Backoffice**

[MANUAL o MCP] Copy frames de la página Backoffice `300:3989` del origen a las páginas correspondientes en `Bionta — Backoffice`. Distribuir según naturaleza (dashboard, cajas, clientes, etc.).

- [ ] **Step 30.6: Crear sections Canonical + Exploraciones**

[MCP] Para cada página de pantalla en Backoffice (`🏠 Dashboard`, `📦 Cajas`, `👥 Clientes / pedidos`, `🛒 Operaciones`), crear dos sections:

```javascript
const targetPages = ["🏠 Dashboard", "📦 Cajas (gestión)", "👥 Clientes / pedidos", "🛒 Operaciones"];
for (const pageName of targetPages) {
  const page = figma.root.children.find(p => p.name === pageName);
  if (!page) continue;
  await figma.setCurrentPageAsync(page);

  const canonical = figma.createSection();
  canonical.name = "✅ Canonical";
  canonical.x = 0; canonical.y = 0;

  const explorations = figma.createSection();
  explorations.name = "🧪 Exploraciones";
  explorations.x = 0; explorations.y = 3000;
}
```

- [ ] **Step 30.7: Verificar rebindings**

[VERIFY] Abrir un frame canónico de Backoffice. Inspeccionar 3-5 component instances. Su "Main component" debe apuntar a la librería remota `Bionta — Components`, no a copias locales. Si hay locales, hacer Swap library.

- [ ] **Step 30.8: Actualizar System Index**

[MCP] (en Foundations) Completar fila Backoffice con link real.

- [ ] **Step 30.9: Commit**

[LOCAL]
```bash
git commit -am "docs(migration): capa 4 — Backoffice migrado y System Index completo"
```

---

## Capa 5 — Cierre

### Task 31: Archivar archivo original

- [ ] **Step 31.1: Verificar que todo está migrado**

[VERIFY] Recorrer cada página del archivo origen. Cada contenido debe tener equivalente en uno de los 5 nuevos archivos. Si encuentras algo no migrado, decidir: ¿es huérfano (→ Archive) o se omitió por error (→ migrar)?

- [ ] **Step 31.2: Renombrar archivo origen**

[MANUAL] (en archivo origen `v34S6c0aQGYqHY1eFIq48z`) Renombrar a `Bionta Design — Legacy 2026-04 (archived)`.

- [ ] **Step 31.3: Mover a carpeta Archive en el team**

[MANUAL] Si el team tiene carpeta de archivados, mover el archivo allí. Si no, crear carpeta `Archive` y mover.

- [ ] **Step 31.4: Despublicar librerías del archivo origen**

[MANUAL] (en archivo origen) Assets → Libraries → Unpublish. Esto evita confusión: las nuevas librerías son las canónicas.

---

### Task 32: Actualizar memoria del proyecto

**Files:**
- Modify: `.claude/memory/figma_file_bionta_design.md`
- Modify: `.claude/memory/MEMORY.md`

- [ ] **Step 32.1: Reescribir `figma_file_bionta_design.md`**

[LOCAL] Reemplazar el contenido. Estructura nueva:

```markdown
---
name: Figma files — Bionta Design System (multi-file)
description: 5 archivos Figma de la arquitectura post-migración 2026-05-20. File keys + roles.
type: reference
---

Arquitectura multi-archivo activa desde 2026-05-20.
Spec: docs/superpowers/specs/2026-05-20-figma-files-architecture-design.md

Archivos activos:

| Nombre | File key | Rol |
|---|---|---|
| Bionta — Foundations | <FOUNDATIONS_FILE_KEY> | Tokens base. Publica variables + styles. |
| Bionta — Icons | <ICONS_FILE_KEY> | Iconografía. Publica icon components. |
| Bionta — Components | <COMPONENTS_FILE_KEY> | UI kit. Publica componentes. |
| Bionta — Product | <PRODUCT_FILE_KEY> | Pantallas cliente. No publica. |
| Bionta — Backoffice | <BACKOFFICE_FILE_KEY> | Pantallas internas. No publica. |

Archivado:
- v34S6c0aQGYqHY1eFIq48z — `Bionta Design — Legacy 2026-04 (archived)`.
  Snapshot intermedio: `Bionta Design — Legacy snapshot 2026-05-20` (SNAPSHOT_FILE_KEY).

Para trabajar desde Claude:
1. Figma Desktop Bridge plugin corriendo (Plugins → Development → Figma Desktop Bridge → Run).
2. Abrir el archivo concreto sobre el que vas a operar.
3. `mcp__figma-console__figma_get_status` confirma el fileKey.

⚠ Los node IDs cacheados de la era pre-2026-05-20 NO son válidos en los nuevos archivos. Re-capturarlos antes de usarlos.
```

Substituir cada `<*_FILE_KEY>` con los valores anotados durante la migración.

- [ ] **Step 32.2: Actualizar entrada en MEMORY.md**

[LOCAL] En `.claude/memory/MEMORY.md` reemplazar la línea actual:

```
- [Figma file — Bionta Design](figma_file_bionta_design.md) — file key, páginas clave, conexión vía Desktop Bridge.
```

por:

```
- [Figma files — Bionta Design System](figma_file_bionta_design.md) — 5 archivos post-migración 2026-05-20. File keys + roles.
```

- [ ] **Step 32.3: Verificar memoria coherente**

[VERIFY] Leer ambos archivos. Los 5 file keys deben estar presentes y ser distintos.

- [ ] **Step 32.4: Anotar referencias a node IDs obsoletas**

[LOCAL] Grep en `.claude/memory/`:
```bash
rg "node\s*ID" /Users/josevalero/personal-projects/Bionta/.claude/memory/
rg "[0-9]+:[0-9]+" /Users/josevalero/personal-projects/Bionta/.claude/memory/
```

Para cada hallazgo, añadir nota en el archivo correspondiente: `⚠ Node ID válido en archivo origen pre-2026-05-20. Re-capturar en el archivo destino.` (no eliminar el ID viejo — sirve de pista para localizar el equivalente).

- [ ] **Step 32.5: Commit final**

[LOCAL]
```bash
git add .claude/memory/
git commit -m "$(cat <<'EOF'
docs(memory): post-migración Figma — actualizar a arquitectura multi-archivo

5 archivos activos (Foundations · Icons · Components · Product · Backoffice).
Archivo legacy renombrado y despublicado. Node IDs pre-2026-05-20 anotados
como inválidos hasta re-captura.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 33: Verificación final de criterios de éxito

**Goal:** Validar que se cumplen los criterios definidos en el spec.

- [ ] **Step 33.1: Checklist de éxito (del spec)**

[VERIFY] Verificar uno a uno:

- [ ] Los 5 archivos existen.
- [ ] Cada uno tiene `📘 README` cumplimentado.
- [ ] Foundations tiene `🗺️ System Index` con tabla completa de los 5 archivos.
- [ ] Foundations, Icons y Components publican como librerías sin warnings.
- [ ] Product + Backoffice consumen las 3 librerías (en Assets → Libraries aparecen activas).
- [ ] Prototype `User Journey v1` está re-wired y funciona end-to-end.
- [ ] 13 huérfanos del memo `cleanup_pending_2026-05-01` están en `🗑 Archive` (no eliminados todavía).
- [ ] `.claude/memory/figma_file_bionta_design.md` refleja los 5 file keys nuevos.
- [ ] Archivo original renombrado a `Bionta Design — Legacy 2026-04 (archived)`.

- [ ] **Step 33.2: Si todo verde, anunciar migración completa**

[LOCAL] Añadir entrada final a `docs/superpowers/migration-notes/migration-log.md`:

```
2026-XX-XX — Migración completada. Criterios de éxito verificados.
```

```bash
git commit -am "docs(migration): migración Figma multi-archivo completada"
```

---

## Notas para el ejecutor

**Por qué este plan no es estrictamente TDD:**
La mayor parte del trabajo es reorganización de assets en Figma, no escritura de código. Donde hay código (scripts MCP), va precedido de una captura de estado origen y seguido de una verificación visual o programática. Esa pareja "captura → ejecuta → verifica" es el análogo aquí del ciclo TDD red→green.

**Sobre los comandos MCP:**
Los nombres de tools como `mcp__figma-console__figma_get_status` están listados en el system reminder del MCP figma-console. Si alguno falla con InputValidationError, usar ToolSearch para cargar su schema antes.

**Sobre los pasos `[MANUAL]`:**
Estos requieren acción del usuario en Figma Desktop UI. El ejecutor (agent) debe pausar y pedir al usuario que los realice, esperando confirmación antes de continuar. No hay forma de automatizarlos vía MCP.

**Sobre el orden de las capas:**
Capa 1 → 1b → 2 → 3 → 4 → 5 es estricto. Saltarse el orden rompe las dependencias de librerías (e.g., publicar Components antes que Foundations + Icons resulta en variable bindings rotos).

**Si una capa se rompe a mitad:**
El safety net `Bionta Design — Legacy snapshot 2026-05-20` permanece intocable. En el peor caso, se descartan los nuevos archivos parciales y se reinicia la capa.
