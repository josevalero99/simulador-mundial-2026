---
name: Auditoría de componentización — Home (2026-04-23)
description: Priorización P0/P1/P2 de elementos a componentizar en el landing de Bionta, plasmada en página Figma
type: project
---

Auditoría realizada sobre `Home` (node `300:2840`) el 2026-04-23. Resultado plasmado en la página **🧩 Componentización — Auditoría** (`595:4888`) del archivo Bionta Design.

**Por qué:** el landing repite patrones (product cards, CTAs, dropdowns, etc.) sin componentes dedicados en el DS. El DS actual solo tiene primitivos (Button set, Checkbox + Text, Navbar Top Items, Avatar, Breadcrumbs, Tooltip, Progress Bar, Loader, Badge & Chip). Faltan composites específicos del flujo de compra.

**How to apply:** al tocar el landing o cualquier pantalla nueva, consultar esta página antes de crear elementos desde cero. El orden de implementación recomendado es P0 → P1 → P2.

Priorización:

- **P0 (Crítico)**: Product Card "Caja", Primary CTA "Añadir al carrito" (validar antes el Button set existente), Top Navbar Pill (contenedor + versión mobile).
- **P1 (Alto)**: Section Header, Dropdown/Select, Checkbox + Leaf Option (extender "Checkbox + Text"), Hero/Banner Carrusel, Feature Block, Footer.
- **P2 (Medio)**: Icon Button (Cart/Account), Carousel Indicator (Dots), Mobile Top Bar (¿variante de Top Navbar?), Price Display (resolver con text style en lugar de componente).

Notas clave:
- Antes de crear Primary CTA nuevo, auditar el Button set actual — probablemente basta con añadir variantes (fill-width + iconEnd).
- "Checkbox + Leaf Option" debería extender el "Checkbox + Text" existente, no crear uno nuevo.
- Price Display: preferir text style antes que componente.
- Mobile Top Bar: decidir si es variante del Top Navbar (P0) o componente separado.
