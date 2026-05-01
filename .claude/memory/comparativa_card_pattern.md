---
name: Patrón de Comparativa — neutral + un saturado
description: Para tablas/cards donde se compara plan A vs plan B, mantener UN solo lado saturado para que el ojo gane la opción recomendada sin esfuerzo
type: feedback
---

**Regla:** cuando una surface compara dos opciones (ej. Compra puntual vs Suscripción semanal), **solo una mitad debe llevar fondo saturado**. La otra mitad va a fondo neutro (cream/white) con borde fino, texto en color de marca y CTA ghost.

**Why:** dos saturados pegados (verde Bionta + amarillo Bionta) producen empate visual. El usuario no sabe a dónde mirar primero, y el "RECOMENDADO" pequeño no compensa. Bajar el lado no-prioritario a neutro hace que el saturado **gane sin gritar** y respeta la jerarquía de negocio (suscripción > compra puntual). Patrón usado por Notion, Linear, Spotify en sus pricing tables.

**How to apply:**

- **Lado neutro** (compra puntual, plan low):
  - Fill: cream brand (`{ r: 0.961, g: 0.945, b: 0.918 }`)
  - Stroke: 1px verde Bionta (`{ r: 0.184, g: 0.290, b: 0.169 }`)
  - Textos e iconos: verde Bionta
  - CTA: ghost (sin fill, borde verde, texto verde)
- **Lado ganador** (suscripción, plan recomendado):
  - Fill: amarillo Bionta saturado (`{ r: 0.949, g: 0.706, b: 0.255 }`)
  - **Drop shadow suave** verde para elevarlo (`color: dark green @ 18% opacity, offset y=12, radius=32`)
  - Textos: verde oscuro (contraste sobre amarillo)
  - **Badge "RECOMENDADO"** en pill verde sólido con texto cream (no como texto suelto sin tratamiento, que se pierde)
  - CTA: solid verde Bionta con texto cream

**No es dark pattern:** la opción "perdedora" sigue clara, legible y clickable. Solo le quitamos el peso visual proporcional a su prioridad de negocio. Si fuera dark pattern, la esconderíamos o haríamos imposible de elegir.

**Cuándo NO usar:**
- Comparativas neutras donde NO hay un ganador comercial (ej. Plan Pequeño vs Plan Grande con audiencias distintas) → ambos pueden quedar neutros con un selector arriba.
- Tablas con 3+ opciones — el patrón se rompe; ahí va una columna destacada con tratamiento de elevación, las demás neutras.

**Aplicado en:** sección `Pitch suscripción` de Home v2 — Migrated (`683:12940` original mantenido, `728:18712` v2 con el patrón aplicado, ambos viven uno encima del otro para validar). Pendiente propagar a las demás home variants (Opción A, 01—Home, Tablet, Mobile) si se valida.
