---
name: Tipografía — peso máximo Clash Display Medium
description: Regla obligatoria — NUNCA usar Clash Display Bold en ningún diseño. El peso máximo es Medium.
type: feedback
---

**Regla:** El peso máximo de tipografía en todos los diseños Bionta es **Clash Display Medium**. Nunca usar Bold (ni Semibold ni más pesados).

**Why:** Decisión del fundador 2026-04-26. Los Bold cargaban demasiado los diseños y reducían el peso visual de los elementos amarillos (la marca). Medium da suficiente jerarquía sin saturar.

**How to apply:**

- **Crear nuevos textos:** usar `{ family: 'Clash Display', style: 'Medium' }` para títulos, prices, eyebrows uppercase, button labels, totales — TODO lo que antes era Bold.
- **Pesos disponibles para usar:**
  - **Medium** — titles, prices, eyebrows, button labels, totales, pills, números display, items destacados.
  - **Regular** — body text, helpers, sub-descriptions, links secundarios, footer text, precios tachados.
- **NO usar:** Bold, Semibold, ExtraBold, Black, ni cualquier peso > Medium.
- **Diferenciación de jerarquía** sin Bold:
  - Tamaño: H1 = 32-40 Medium, H2 = 22-28 Medium, body = 14-16 Regular.
  - Color: text-dark `#1E1E1E` para titles, text-muted `#6B6B6B` para body secundario.
  - LetterSpacing: eyebrows uppercase con `letterSpacing: 8%`.
  - Color/peso (yellow `#FFC200` o green `#2F4A2B`) para realzar.

**Excepciones permitidas:**
- Logo Bionta (asset oficial, mantiene su peso original).
- Logos de marca externos (Google G, Apple, etc.) — assets oficiales.
- Tipografía dentro de iconos importados que mantienen su peso original (poco común).

**Cuando se viole esta regla:** auditar el archivo y reemplazar Bold → Medium en bloque.
