---
name: Spacing standard — Tailwind 4 px grid
description: Convención obligatoria para paddings, gaps, radii y strokes en todo el archivo Bionta Design
type: project
---

**Decisión 2026-05-01:** todo el spacing del archivo Bionta Design debe estar alineado con la **escala Tailwind de 4 px**. Esto incluye `paddingLeft/Right/Top/Bottom`, `itemSpacing` (gap), `counterAxisSpacing`, anchos y altos fijos de frames con auto-layout, `cornerRadius` y `strokeWeight`.

**Why:** la web final será Tailwind. Si el diseño nace alineado al grid (multiplos de 4), la traducción frontend es 1:1 sin redondeos arbitrarios. Diseños con 6/10/14/18 px obligan al frontend a inventar (¿8 o 12? ¿14 o 16?) y rompen consistencia de spacing entre componentes.

**How to apply:**

- **Paddings, gaps, sizes (cuando son fixed):** múltiplos de 4 → 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96…
- **Radii** (Tailwind set extendido): `0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 9999` (9999 = `rounded-full`).
- **Stroke weights legales:** `0`, `1`, `2`, o múltiplo de 4. **No usar 1.5** (Tailwind no lo tiene).
- **Excepciones aceptadas:**
  - Mobile viewport `375` (iOS estándar) — no hay que forzar a 376.
  - Anchos/altos en HUG (auto) — son derivados de contenido, no se "corrigen" sino se ajustan paddings/gaps internos.
  - Aspectos con razón de marca (ej. logo) — se documenta caso por caso.

**Mapeos típicos al normalizar:**
- 6 → 8 (gap-2)
- 10 → 12 (gap-3)
- 14 → 16 (gap-4)
- 18 → 20 (gap-5)
- 22 → 24
- 38 → 40
- 46 → 48
- 53 → 52 o 56

**Estado del archivo (2026-05-01):**
- ✅ Normalizadas las 6 home variants (`644:4194` Opción A, `675:676` Desktop 1440 en 99.Things, `683:12762` Migrated, `696:22803` 01—Home, `710:2761` Tablet, `710:3204` Mobile) — 1 338 valores corregidos.
- ✅ Componentes master normalizados en cascada: `NavPill` (`683:8914`), `seg-0/seg-1/seg-0-selected/seg-1-selected` (38h → 40h), `chip` (`683:8949`, 67×22 → 68×24), `NewsletterBlock` (`683:8972`, 114h → 116h), `Input` (`683:8963`, 280×46 → 280×48).
- ❌ **Pendiente:** PDPs (`696:23079`, `696:23266`, `619:8876`, `620:9670`, `620:9246`), Cart Page (`696:23627`), Checkout (`696:23809`), Order Confirmation (`696:23842`), Mi Cuenta (8 frames en `🔐 Auth + Mi Cuenta v1`), Suscripción Landing (`675:170`).

**Auditoría rápida (script que dejo de referencia):** caminar recursivamente y reportar nodos donde `value % 4 !== 0` para los props arriba listados, excluyendo `cornerRadius >= 999` (pill), `strokeWeight ∈ {0,1,2}`, `width === 375` (mobile).

**Pitfall conocido:** rounding hacia arriba en el script "más cercano múltiplo" puede mover un frame de 282 → 284 (cards "Lo que hoy está en su mejor momento"). Validar visualmente que no se rompan grids horizontales — en este caso fue inocuo porque la suma 4×284 + 3×24 = 1208 entra en los 1200 con 8px de overflow tolerado por el HUG horizontal.
