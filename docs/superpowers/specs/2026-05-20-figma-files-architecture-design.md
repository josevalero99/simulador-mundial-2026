# Bionta — Arquitectura de archivos Figma

**Fecha:** 2026-05-20
**Estado:** Spec aprobado (pendiente review escrito)
**Owner:** Jose Valero
**Plan Figma:** Professional (libraries cross-file disponibles)

## Contexto y motivación

Hoy todo Bionta Design vive en un único archivo Figma (`v34S6c0aQGYqHY1eFIq48z`) con páginas Home, Design System, Components, Icons, Product, Cart, Backoffice, Componentización, Calendario y prototipo. El archivo contiene 27 components / 147 variants, 28 color primitives + 36 semantic vars, sistema tipográfico con 10 styles + 15 variables, y un prototipo wired en `696:22802` con 8 frames incluyendo drawer cart overlays y calendar.

La estructura actual tiene tres problemas que esta arquitectura resuelve:

1. **Ningún beneficio de librerías publicables.** Componentes, iconos y tokens viven junto a las pantallas que los consumen; no hay separación productor/consumidor.
2. **Fricción de navegación.** Encontrar una pantalla concreta requiere scroll en el sidebar; canónicas y exploraciones conviven sin distinción visual clara.
3. **Hand-off a desarrollo poco eficiente.** Un dev que entra al proyecto no tiene una landing clara que explique qué hay y dónde.

El objetivo es una estructura multi-archivo profesional que (a) separe librerías de consumidores, (b) ordene cada sección con su canónica y sus exploraciones, y (c) sirva como hand-off claro a desarrollo.

## Decisiones tomadas durante el brainstorming

| Decisión | Elección | Alternativas descartadas |
|---|---|---|
| Plan Figma | Professional (confirmado) | — |
| Granularidad | 5 archivos | 3 archivos (mínimo) · 7+ archivos (granular) |
| Exploraciones | Misma página, dos Sections (`✅ Canonical` + `🧪 Exploraciones`) | Páginas separadas · Página única global de exploraciones |
| Documentación | Cover en cada archivo + System Index maestro en Foundations | Solo master index · Documentación fuera de Figma |
| Migración | Gradual por capas (≥2 sesiones) | Big bang · Greenfield + archivar |

## Arquitectura: 5 archivos

Jerarquía de dependencias (productor → consumidor):

```
🌱 Bionta — Foundations            (publica variables + styles)
        ↓
🔣 Bionta — Icons                  (consume Foundations · publica icon components)
        ↓
🧩 Bionta — Components             (consume Foundations + Icons · publica componentes)
        ↓
🛒 Bionta — Product                (consume las 3 · no publica)
🛠 Bionta — Backoffice             (consume las 3 · no publica)
```

**Naming convention:** `Bionta — <Nombre>` con em-dash. Sin emoji en el título del archivo; los emojis viven en el sidebar de páginas internas.

**El prototipo vive dentro de Product**, no en archivo aparte: Figma maneja mejor el wiring intra-archivo, sin la latencia visible de los cross-file prototype links.

**Product y Backoffice se separan** aunque comparten librerías porque audiencia y ritmo de iteración son distintos (clientes vs. operaciones internas).

## Estructura de páginas por archivo

Convención común: cada archivo abre con `📘 README` y cierra con `🧪 Sandbox` y `🗑 Archive`. Emoji + nombre en el sidebar, orden por flujo lógico (no alfabético).

### 🌱 Bionta — Foundations
```
📘 README
🗺️  System Index            ← mapa maestro con links a los otros 4 archivos
🎨 Color                    ← primitives + semantic + showcase
🔤 Typography               ← styles + showcase (regla: max weight Medium)
📐 Spacing & Grid           ← 4px grid · breakpoints 1440/768/375
🌀 Effects & Radii
📦 Variable collections
🗑 Archive
```

### 🔣 Bionta — Icons
```
📘 README                    ← criterio: Material Symbols, no símbolos tipográficos
🔣 Icons — Material          ← set canónico
🏷 Logos                     ← Bionta + sociales oficiales
🧪 Sandbox
🗑 Archive
```

### 🧩 Bionta — Components
```
📘 README                    ← cómo nombrar variants, qué publica/qué no
🧱 Primitives                ← Button, Input, Card, Badge, SegmentedControl…
🧬 Patterns                  ← Comparativa, Drawer cart, Tier-toggle, Calendar…
📋 Audit                     ← estado de componentización (P0/P1/P2)
🧪 Sandbox
🗑 Archive
```

### 🛒 Bionta — Product
```
📘 README                    ← convenciones, breakpoints, dónde publicar dudas
🏠 Home                      ← ✅ Canonical  +  🧪 Exploraciones
🛍 PDP                       ← ✅ Canonical  +  🧪 Exploraciones
🛒 Carrito                   ← ✅ Canonical  +  🧪 Exploraciones
💳 Checkout                  ← ✅ Canonical  +  🧪 Exploraciones
👤 Mi Cuenta                 ← ✅ Canonical  +  🧪 Exploraciones
📅 Calendario de temporada   ← ✅ Canonical  +  🧪 Exploraciones
📦 Estados                   ← empty / error / loading
🎬 Prototype — User Journey v1
🧪 Sandbox
🗑 Archive
```

### 🛠 Bionta — Backoffice
```
📘 README
🏠 Dashboard
📦 Cajas (gestión)
👥 Clientes / pedidos
🛒 Operaciones
🎬 Prototype — Backoffice
🧪 Sandbox
🗑 Archive
```

### Reglas que aplican a todos los archivos

1. **Cada página de sección** tiene dos `Section` de Figma: `✅ Canonical` y `🧪 Exploraciones`. Sin excepciones — si no hay exploraciones aún, la Section existe vacía con un placeholder.
2. **Cada frame canónico** está en los 3 breakpoints (1440 / 768 / 375) cuando aplica. Convención de nombre: `[Screen] — Tablet/Mobile`.
3. **`🗑 Archive`** es el limbo de huérfanos antes de borrar. Los 13 marcados en `cleanup_pending_2026-05-01.md` viven aquí durante la migración.
4. **`🧪 Sandbox`** es scratch personal — nadie consume nada de ahí; se vacía cada trimestre.

## Documentación: Covers y System Index

### Plantilla del `📘 README` (idéntica en los 5 archivos)

```
PROPÓSITO              Una frase: qué hay aquí y qué NO hay aquí.
AUDIENCIA              Diseño · Desarrollo · Stakeholders
ESTADO                 Versión · Última actualización · Owner
ESTRUCTURA INTERNA     Lista de páginas con 1 línea cada una
DEPENDENCIAS           Librerías que consume → links · Librerías que publica → qué expone
CONVENCIONES           Reglas específicas del archivo
CÓMO CONTRIBUIR        Workflow + dónde reportar bugs
LINKS                  → Otros archivos Bionta · Repo (github.com/Azlinraeh/Bionta) · Jira KAN
```

### `🗺️ System Index` (sólo en Foundations)

Mapa maestro con diagrama visual del flujo de dependencias + tabla:

| Archivo | Rol | Publica | Consume | Owner | Link |
|---|---|---|---|---|---|
| Foundations | Tokens base | Variables + styles | — | Jose | → |
| Icons | Iconografía | Icon components | Foundations | Jose | → |
| Components | UI kit | Componentes | Foundations + Icons | Jose | → |
| Product | Pantallas cliente | — | Todas | Jose | → |
| Backoffice | Pantallas internas | — | Todas | Jose | → |

Debajo: **principios del design system** (tipografía max weight Medium, 4px grid, breakpoints 1440/768/375, paleta dominante amarillo `#FFC200` + oscuro `#1E1E1E` + blanco roto), **changelog** del sistema, y **enlaces externos** (repo `github.com/Azlinraeh/Bionta`, Jira project KAN en `biontagourmet.atlassian.net`, tokens exportados en `design/tokens/` — `colors.json`, `tailwind.config.ts`, `tokens.css`).

### Hand-off a desarrollo

El System Index es la **landing oficial para dev**:

1. Dev abre Foundations → `🗺️ System Index` → entiende qué es Bionta en 5 minutos.
2. Cada `📘 README` interno apunta al repo local y a `design/tokens/`.
3. Para implementar una pantalla, va a Product → página de la sección → Section `✅ Canonical`. Las `🧪 Exploraciones` se ignoran salvo discusión explícita.

## Migración por capas

Una capa por sesión, en orden estricto. Cada capa termina con validación antes de empezar la siguiente.

### Capa 0 — Preparación
- Duplicar archivo actual → `Bionta Design — Legacy 2026-05` como safety net (no se toca).
- Inventario de lo que existe: 27 components / 147 variants · 28 + 36 vars · prototype 8 frames · 13 huérfanos + 8 candidatos.

### Capa 1 — Foundations + Icons (paralelo, sin dependencias)
- Crear `Bionta — Foundations` vacío.
- Mover Variable Collections, styles, grid → publicar.
- Crear `Bionta — Icons` vacío; conectarlo como consumer de Foundations.
- Mover icon components (Material + logos) → publicar.
- **Validación:** el archivo actual sigue funcionando porque las librerías se consumen "remote". No hay rewire necesario aún.

### Capa 2 — Components
- Crear `Bionta — Components` vacío; conectarlo como consumer de Foundations + Icons.
- Mover los 27 components (Primitives + Patterns).
- Republicar como librería.
- **Validación:** en el archivo actual, "Swap library" detecta todos los components movidos → un solo swap masivo.
- **Riesgo conocido:** instances con overrides pueden desconectarse; revisar uno a uno antes del swap.

### Capa 3 — Product (split del archivo actual)
- Crear `Bionta — Product` con todas las páginas de sección preconfiguradas (cada una con `✅ Canonical` + `🧪 Exploraciones`).
- Copiar página por página desde el archivo actual.
- **Prototipo:** re-wire al final de la capa, todo en un mismo archivo.
- Cleanup: huérfanos del memo → 13 a `🗑 Archive`, 8 candidatos a revisar antes de archivar.

### Capa 4 — Backoffice (split del archivo actual)
- Crear `Bionta — Backoffice`.
- Mover página `300:3989` (Backoffice) y derivadas.

### Capa 5 — Cierre
- Archivar `Bionta Design` original como read-only.
- Renombrar a `Bionta Design — Legacy 2026-04 (archived)`.
- Actualizar memoria del proyecto (`.claude/memory/figma_file_bionta_design.md`) con los 5 file keys nuevos y deprecar el actual.

## Convenciones operativas (vinculantes tras migración)

1. **Publicación de librerías.** Foundations / Icons / Components publican manualmente al cerrar cada sesión que tocó system. El mensaje del publish describe qué cambió (changelog implícito).
2. **Promoción Exploración → Canonical.** Decisión explícita del owner. Al promover: se duplica al Section `✅ Canonical`; la versión antigua va a `🧪 Exploraciones` con prefijo `[deprecated]` o directamente a `🗑 Archive`. Nunca dos canonicals del mismo screen conviviendo.
3. **Huérfanos.** Cualquier frame que ya no se usa va a `🗑 Archive` con fecha (`Archived 2026-05-20`). Cada trimestre se purga lo más viejo que 90 días.
4. **Memoria del proyecto.** `.claude/memory/figma_file_bionta_design.md` se reescribe para listar los 5 file keys nuevos. Cada referencia a node IDs en memoria se anota con su archivo de origen.

## Riesgos conocidos y mitigación

| Riesgo | Mitigación |
|---|---|
| Component instances pierden vínculo al mover | Usar "Swap library" en un único paso; revisar overrides antes |
| Variable bindings rotos al consumir Foundations remoto | Sweep `rebind` por archivo tras Capa 1 |
| Prototipo se desincroniza al copiar pantallas | Re-wire al final de Capa 3, todo en un mismo archivo |
| MCP / Desktop Bridge confunde file keys viejos vs nuevos | Actualizar memoria + invalidar node IDs cacheados |

## Criterios de éxito

La migración se da por completada cuando:

- Los 5 archivos existen, con `📘 README` cumplimentado y `🗺️ System Index` activo en Foundations.
- Foundations, Icons y Components publican como librerías y Product + Backoffice las consumen sin warnings.
- El prototipo `User Journey v1` está re-wired y funcional en `Bionta — Product`.
- Los 13 huérfanos del memo `cleanup_pending_2026-05-01` están en `🗑 Archive` (no eliminados todavía).
- `.claude/memory/figma_file_bionta_design.md` refleja los 5 file keys nuevos.
- El archivo original está renombrado a `Bionta Design — Legacy 2026-04 (archived)`.

## Fuera de alcance (no se hace en esta migración)

- Rediseño de pantallas, componentes o tokens. Esta es una reorganización estructural, no una iteración de diseño.
- Cambios en breakpoints, naming de variables o tipografía. Las convenciones actuales se conservan.
- Creación de pantallas nuevas. Las pantallas existentes se mueven tal cual; cualquier rediseño se hace después.
- Integración con Notion / docs externos. La documentación vive en Figma (READMEs + System Index).
