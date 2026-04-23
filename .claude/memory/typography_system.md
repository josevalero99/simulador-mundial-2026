---
name: Sistema tipográfico — Bionta
description: Escala, variables y text styles de tipografía (Clash Display), dónde viven y cómo aplicarlos
type: project
---

**Fuente oficial:** Clash Display (pesos disponibles: Extralight, Light, Regular, Medium, Semibold, Bold). El proyecto usa Clash Display para TODO el texto; cualquier otra fuente (ej. Inter) es un outlier a corregir.

**Ubicación:** archivo `Bionta Design` (file key `v34S6c0aQGYqHY1eFIq48z`).
- Página `🔤 Typography` (`602:5186`) — showcase visual.
- Variable collection `Bionta / Typography` (`VariableCollectionId:602:5160`) — 15 variables (family, weights, sizes, line-heights, letter-spacing).
- 10 Text Styles creados y ligados a variables vía `setBoundVariable`.

**Escala (derivada del Home, node 300:2840):**

| Style       | Weight    | Size | Line-height | Uso |
|-------------|-----------|------|-------------|-----|
| Display/XL  | Medium    | 48   | 110%  (-0.5)| Hero 1920 — headline principal |
| Display/L   | Medium    | 36   | 110%  (-0.25)| Hero 1440 |
| Heading/L   | Medium    | 24   | 120%        | Títulos sección y card |
| Body/L      | Regular   | 24   | 140%        | Párrafos destacados / CTA copy |
| Price/L     | Semibold  | 24   | 120%        | Precio principal |
| Body/M      | Regular   | 16   | 140%        | Body por defecto |
| Label/M     | Medium    | 16   | 140%        | Nav, labels |
| Price/M     | Semibold  | 16   | 140%        | Precio inline |
| Body/S      | Regular   | 12   | 140%        | Legal, meta |
| Label/S     | Medium    | 12   | 140%        | Nav pequeña |

**Variables (tokens):**
- `font/family/brand` = "Clash Display"
- `font/weight/{regular,medium,semibold,bold}`
- `font/size/{display-xl=48, display-l=36, heading=24, body=16, body-sm=12}`
- `font/line-height/{display=110, heading=120, body=140}`
- `font/letter-spacing/{none=0, tight=-0.5}`

**Cómo aplicar:**
- En archivos que consumen el DS: seleccionar el Text Style desde el panel de texto.
- En archivos independientes (ej. `Components_web_bionta`): hoy existen como copias locales (mismos nombres, sin binding a variables). Para consumir los "oficiales", publicar `Bionta Design` como librería y suscribirse.

**Aplicado en componentes P1 (`Components_web_bionta`, página `P1`, 2026-04-23):**
- Section Header → Title: `Heading/L`
- Select (ambos variants) → Label: `Label/M`, option labels: `Body/M`
- Option / Leaf → `Body/M`
- Feature Block (ambos variants) → Title: `Display/XL`, Body: `Body/L`
- Hero / Desktop → Headline: `Display/XL`, pill nav: `Label/M`
- Footer / Desktop → logo+nav: `Label/M`, copyright: `Body/S`, legal: `Label/S`

**Outlier detectado (pendiente):**
- Component `Button` del DS de Bionta Design (node `442:212`) sigue usando Inter Semi Bold 16. Normalizar a Clash Display Medium 16 antes de publicar la librería.
