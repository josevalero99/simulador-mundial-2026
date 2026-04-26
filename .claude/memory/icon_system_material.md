---
name: Sistema de iconos — Material Design (Google)
description: Regla obligatoria — siempre que se creen iconos desde cero (vectoriales, no instancias), usar Material Design icons de Google
type: feedback
---

**Regla:** Siempre que tenga que crear iconos desde cero (no instanciar de un componente existente), usar **Material Design icons de Google** (https://fonts.google.com/icons), no símbolos tipográficos ni primitivas geométricas hechas a mano.

**Why:** En sesión 2026-04-26 el fundador rechazó los iconos hechos a mano (rectángulos rotados componiendo un check) en las cards de Pitch suscripción del PDP. Material Design icons son el sistema estándar y dan calidad visual consistente con el resto del producto.

**How to apply:**

- **Antes de crear un icono nuevo:**
  1. Comprobar si ya existe en la página Figma `Icons` (`397:180`) del archivo Bionta Design — algunos ya están subidos (`plus`, `minus`, `delete-forever`, `shopping_cart`).
  2. Si no existe, importar el SVG oficial de Material Design via `figma.createNodeFromSvg(svgString)`.
  3. Tipo: usar variantes "outlined" (24px) por defecto — coherente con la nav y el resto del DS.
  4. Aplicar fills sobre el vector resultante para teñirlo a la paleta Bionta (verde `#2f4a2b`, amarillo `#FFC200`, etc.).

- **No usar:**
  - Caracteres tipográficos como icono (✓, ×, %, ⏸, ⚙).
  - Rectángulos rotados ni primitivas geométricas para simular checks/closes/etc.
  - Iconos de otra librería (Lucide, Heroicons, Feather) — solo Material si no hay alternativa explícita.

- **Excepciones (sí permitido sin Material):**
  - Logos de marca (Bionta, Google G, Apple) — assets oficiales de cada marca.
  - Letras numéricas en círculos (1, 2, 3) cuando son enumeración explícita, no iconos.

**Referencia rápida — SVG paths comunes:**

- `check` (Material): `M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z`
- `close`: `M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 11.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 12.41 12z`
- `pause_circle_outline`: ver `https://fonts.google.com/icons?icon.query=pause`
- `inventory_2` (caja): `https://fonts.google.com/icons?icon.query=box`

ViewBox estándar Material: `0 0 24 24`.
