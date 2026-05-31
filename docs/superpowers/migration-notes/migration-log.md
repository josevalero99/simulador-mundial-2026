# Migration log — Figma multi-archivo

Registro cronológico del progreso de la migración.

## 2026-05-31

- **Capa 0 · Task 1** — Safety net creado. Archivo origen duplicado y renombrado a
  `Bionta Design — Legacy snapshot 2026-05-20` (key `lDt77i5sEWleOM8CQk9fCI`).
  Snapshot intocable como red de seguridad.
- **Capa 0 · Task 2** — Inventario capturado (`inventory-2026-05-31.md` + `variables-source.json`).
  Hallazgos: 79 variables OK (28+36+15, solo modo único, sin Dark). **Discrepancias con el plan:**
  (1) design system real = 1351 comp / 69 sets, no 27/147 (inflado por variantes de iconos);
  (2) 20 páginas, no ~10; (3) las páginas Calendario (`730:24739`) y Prototype (`696:22802`)
  citadas en el plan NO existen como páginas → resolver en Capa 3.
- **Capa 1 · Task 3-5** — `Bionta — Foundations` creado (key `BKGqaN0gWxAp8ixPWp5SZk`).
  8 páginas internas creadas (README, System Index, Color, Typography, Spacing & Grid,
  Effects & Radii, Variable collections, Archive); "Page 1" eliminada. README inicial
  (texto plano) construido y validado por screenshot. Naming: usuario eligió convención
  `Bionta — Foundations` (rename manual pendiente; key no cambia).
- **Capa 1 · Task 6** — Color variables migradas a Foundations. Collections `Color — Primitives`
  (28) + `Color — Semantic` (36 aliases, 36/36 enlazados OK). Showcase en página 🎨 Color con
  swatches bound a tokens, validado por screenshot. Gotcha resuelto: `resize()` en eje primario
  de auto-layout lo fuerza a FIXED → fijar tamaño tras append + usar `layoutSizingVertical=HUG`.
- **Capa 1 · Task 7** — Typography migrada. Collection `Typography` (15 vars) + 10 text styles
  (todos Clash Display, disponible en el archivo nuevo). Showcase en página 🔤 Typography con
  frases reales, validado por screenshot. ✅ Ningún estilo usa Bold. ⚠️ Price/L y Price/M usan
  Semibold (> Medium) — preservado del origen; tensión con "max weight Medium" anotada para
  revisión futura (fuera de alcance de esta migración estructural).
- **Capa 1 · Task 8** — Spacing/Grid/Effects/Radii (`effects-grid-notes.md`). Origen sin styles
  con nombre → canonicalizados: collection `Radius` (7, escala 4px), 4 effect styles `elevation/*`
  (de sombras reales observadas en scan de 31k nodos), 4 grid styles (Desktop/Tablet/Mobile/Base 4px).
  Showcases en 🌀 Effects & Radii y 📐 Spacing & Grid validados. ⚠️ Origen tenía 2 sistemas de
  sombra paralelos (verde-card + rampa navy) → consolidar a futuro. Total Foundations: 86 vars /
  4 collections, 4 effect + 4 grid + 10 text styles.
