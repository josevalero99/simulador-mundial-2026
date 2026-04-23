# Auditoría Home — Product Lens

> Lente: Senior Product Lead. Revisión del landing principal de Bionta con foco en conversión, claridad de propuesta y storefront.

- **Fecha:** 2026-04-23
- **Alcance:** Home, breakpoint desktop 1440 (`Home` node `300:2840`)
- **Artefacto en Figma:** página `🧭 Home Audit — Product Lens` (`603:5435`) en archivo *Bionta Design*
- **Archivo Figma:** https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design

---

## 1. TL;DR

**La Home actual es un mood board de marca, no una storefront.** El craft visual es excelente (tipografía Clash Display, paleta amarillo/oscuro, fotografía editorial), pero la página no responde a las preguntas que un visitante nuevo se hace en los primeros 5 segundos:

1. ¿Qué vende esto?
2. ¿Para quién?
3. ¿Cuánto cuesta?
4. ¿Qué hago ahora?

El resultado es una experiencia que comunica *vibe* pero no convierte: cero CTA above the fold, oferta fragmentada, pricing incoherente y placeholders de texto en zonas de producto. La buena noticia: la base de marca y el sistema visual son sólidos, así que las correcciones son de **producto y arquitectura de información**, no de identidad.

---

## 2. Contexto de negocio

Resumen mínimo necesario para evaluar la Home (ver `business_context.md` para la versión canónica):

- **Producto:** cajas de fruta tropical de temporada (papaya, mango, piña…).
- **Modalidades:** caja **cerrada** (surtido fijo) y caja **personalizable** (set acotado de opciones).
- **Tamaños:** Grande y Pequeña, aplicables a ambas modalidades. → **SKU matrix de 4 productos base.**
- **Modelo:** DTC. La nav del Home menciona "Menús semanales" → existe (o se planea) una línea de **suscripción** que hoy no aparece pitcheada.
- **Ángulo tech:** declarado como diferenciador del proyecto, no visible en la Home.
- **Moat:** **estacionalidad** — la rotación semanal de fruta tropical es el activo competitivo y debe ser visible en el Home.

---

## 3. Metodología — qué evalúa la lente Product

La lente Product Lead revisa la página contra cinco dimensiones:

1. **Claridad de propuesta** — en 5 segundos, ¿se entiende qué vende y para quién?
2. **Jerarquía de conversión** — ¿hay CTA primario claro? ¿above the fold? ¿coherente en toda la página?
3. **Arquitectura de oferta** — ¿la estructura de productos en la página refleja la estructura de productos del negocio?
4. **Confianza y prueba social** — ¿qué razones tiene un visitante nuevo para creer y comprar?
5. **Coherencia de datos** — pricing, copy, imágenes y nav: ¿son consistentes y reales (no placeholder)?

Severidad usada en findings:
- 🔴 **Fuga crítica** — bloquea conversión o rompe credibilidad.
- 🟡 **Gap importante** — limita conversión o subutiliza el moat.
- 🟢 **Lo que está bien** — preservar al iterar.

---

## 4. Findings

### 🔴 Fugas críticas

1. **Cero CTA above the fold.**
   El hero no incluye botón primario. El primer punto de fricción es scroll, no decisión. En una storefront DTC esto es un fallo estructural: cada segundo de scroll sin un ancla a la acción reduce la tasa de conversión.

2. **Hero abstracto — no dice qué vende Bionta.**
   El copy hero no contiene las palabras "fruta", "tropical", "caja" ni "temporada". Un visitante que llega desde un anuncio o un share orgánico no puede inferir el producto sin scrollear y leer.

3. **Imagen hero off-brand.**
   La fotografía hero muestra lechuga, tomates y pimientos. Bionta vende fruta tropical. Esta incoherencia entre el visual hero y la oferta real confunde la propuesta y deteriora la confianza desde la primera mirada.

4. **Pricing incoherente entre modalidades.**
   - Cajas personalizables: 29 € / 29 € (Grande y Pequeña al mismo precio)
   - Cajas cerradas: 29 € / 49 € (mismas tallas, distinto precio)
   Imposible que esto sea correcto. O hay un error de precio, o la lógica de pricing no es la que uno asume (modalidad + tamaño). Cualquiera de las dos opciones es una fuga: si es bug, mata venta; si es real, no se explica.

5. **Placeholders en zona de producto.**
   Aparecen literales tipo *"Caja de otra cosa"* y *"tomates"* en la sección de oferta. Placeholders en un landing público comunican "esto no está terminado" y rompen la credibilidad transaccional.

### 🟡 Gaps importantes

6. **Oferta fragmentada en dos secciones.**
   Hoy Modalidad y Tamaño viven como cuatro cards separadas (cerrada-G, cerrada-P, personalizable-G, personalizable-P). La estructura mental del producto es **una sola decisión con dos ejes** (Modalidad × Tamaño). Debe colapsar a un **selector único**: dos toggles, un precio, un CTA.

7. **"Menús semanales" en nav, sin pitcheo en la página.**
   Hay un enlace de suscripción en navigation pero ningún módulo en el cuerpo del Home que la explique. La línea de ingresos recurrentes está huérfana en la Home — toda la presión cae sobre venta puntual.

8. **Ángulo tech invisible.**
   El diferenciador "tech" del proyecto no aparece en ningún módulo del Home. Si es real (suscripción flexible, personalización por perfil, trazabilidad, etc.), debe tener un bloque dedicado. Si no es real todavía, conviene quitarlo del posicionamiento del proyecto hasta que lo sea.

9. **Estacionalidad enterrada en microcopy.**
   La rotación semanal de fruta es el moat, pero hoy aparece solo como mención secundaria. Debería ser un módulo propio, idealmente con la fruta real de la semana (foto + nombres + ventana de disponibilidad).

10. **Sin social proof ni trust badges.**
    Cero reseñas, cero menciones en prensa, cero garantías visibles (devolución, frescura, envío). En categoría alimentación + DTC + producto premium, esto es una barrera dura: el visitante necesita razones para confiar en una marca que no conoce.

11. **"Oferta especial" sin CTA ni contexto.**
    Hay un bloque que anuncia una promo pero no incluye CTA propio, ni vigencia, ni mecánica de canje. Es ruido visual sin función transaccional.

### 🟢 Lo que está bien (preservar)

- **Sistema tipográfico Clash Display** — fuerte personalidad, jerarquía clara, escala bien definida.
- **Paleta y tono visual** — amarillo `#FFC200` + oscuro `#1E1E1E` + blanco roto: distintivo y consistente.
- **Densidad y respiración** — el ritmo vertical y el uso de blanco son correctos.
- **Footer y nav** — estructuralmente bien resueltos; no requieren intervención inmediata.

---

## 5. Recomendaciones priorizadas

Cada bloque incluye qué hacer, por qué importa y cómo medir el efecto.

### NOW — Sprint 0–2 · Desbloquear conversión

Foco: que la Home **funcione como storefront**. Sin esto, todo lo demás es decoración.

1. **Hero con CTA dual + copy concreto.**
   - Headline: nombrar producto y temporada (ej. *"Fruta tropical de temporada, en tu puerta"*).
   - Subhead: una línea con frecuencia/origen/garantía.
   - CTA primario: *"Elige tu caja"* (ancla a selector).
   - CTA secundario: *"Cómo funciona"* (ancla a explicación).
   - **Métrica:** % de sesiones que hacen click en CTA hero (target inicial: ≥ 8 %).

2. **Imagen hero de fruta tropical real.**
   Sustituir la foto actual por una composición con la fruta real que vende Bionta (papaya, mango, piña…). Idealmente, foto de la caja abierta con producto reconocible.
   - **Métrica:** bounce rate del hero (debe bajar) y dwell time del primer fold (debe subir).

3. **Selector unificado Modalidad × Tamaño.**
   Un solo módulo con dos toggles (Cerrada/Personalizable, Grande/Pequeña), precio dinámico, breve descripción contextual y CTA *"Añadir al carrito"*. Reemplaza las 4 cards actuales.
   - **Métrica:** add-to-cart rate desde Home (target: x2 vs baseline).

4. **Arreglar pricing incoherente.**
   Definir y publicar una matriz de precios consistente. Si la realidad es que Cerrada-Grande cuesta más que Personalizable-Grande, explicarlo en una línea (ej. *"+20€ por surtido premium"*). No dejar el visitante haciendo arqueología.
   - **Métrica:** abandono en checkout (debe bajar).

5. **Eliminar placeholders.**
   Auditoría rápida de copy en toda la Home. Cualquier literal placeholder fuera. Si una sección no tiene contenido real todavía, ocultarla, no rellenarla con lorem.
   - **Métrica:** trust signals heurísticos en test moderado (n=5).

### NEXT — Sprint 3–6 · Confianza y moat

Foco: explicar el producto, activar la suscripción, y empezar a construir la prueba social.

6. **Bloque "Fruta de esta semana".**
   Módulo dedicado a la rotación: foto del producto fresco de la semana, 3-5 nombres, ventana de disponibilidad ("hasta el domingo"). Esto **es** el moat: hacerlo visible.

7. **"Cómo funciona" en 3 pasos.**
   Eliges modalidad y tamaño → recibes en X horas/días → mantienes/pausas/cancelas (si hay suscripción). Reduce fricción mental antes de pedir compra.

8. **Pitch de suscripción (activar Menús semanales).**
   Bloque dedicado: qué incluye, qué frecuencia, cómo se pausa, ventaja vs compra suelta. Conecta con el link de nav ya existente.

9. **Social proof + garantías.**
   - Bloque de testimonios con foto real (3 mínimo).
   - Trust badges: frescura garantizada, envío refrigerado, devolución, origen.
   - Si hay menciones en prensa o ratings, sumarlos.

10. **Trío de features (Sostenibilidad / Tech / Frescura).**
    Tres bloques cortos en paralelo, no uno solo monolítico. Cada uno con icono + título + 1 línea. Aquí es donde el ángulo tech entra de forma estructurada.

11. **Oferta de lanzamiento con CTA propio.**
    Si hay promo activa, darle CTA, vigencia y mecánica explícita. Si no la hay, retirar el bloque.

### LATER — Trimestre · Escala y profundidad

12. **FAQ de objeciones reales** (estacionalidad, devolución, pago, frecuencia).
13. **Calendario de temporada** público (qué fruta y cuándo).
14. **Programa de referidos** (impulsa el motor DTC).
15. **Blog / contenido** sobre fruta tropical y origen (SEO + autoridad).
16. **Personalización tech visible** (perfil de sabores, recomendaciones, historial), si la línea tech madura.

---

## 6. Home propuesta — 11 bloques

Estructura completa del nuevo Home, en orden de scroll. Refleja las recomendaciones de NOW + NEXT.

| # | Bloque | Función |
|---|--------|---------|
| 1 | **Top Navbar** | Navegación + acceso a cuenta y carrito |
| 2 | **Hero** | Propuesta + CTA dual + imagen de fruta real |
| 3 | **Fruta de esta semana** | Activar el moat de estacionalidad |
| 4 | **Elige tu caja (selector)** | Decisión de compra unificada Modalidad × Tamaño |
| 5 | **Cómo funciona** | 3 pasos para reducir fricción mental |
| 6 | **Trío de features** | Sostenibilidad · Tech · Frescura |
| 7 | **Pitch suscripción** | Activar Menús semanales como línea recurrente |
| 8 | **Social proof** | Testimonios + trust badges |
| 9 | **Oferta de lanzamiento** | Promo con CTA propio (opcional según vigencia) |
| 10 | **FAQ** | Objeciones reales |
| 11 | **Footer** | Cierre estándar |

El artefacto visual de esta estructura está plasmado como wireframe-stack en la página Figma `🧭 Home Audit — Product Lens` (`603:5435`).

---

## 7. Métricas para validar el rediseño

Definir baseline antes de tocar nada. Sin baseline no hay forma de defender que la nueva Home funciona mejor.

**Funnel de Home:**
- % click en CTA hero
- Add-to-cart rate desde Home
- Scroll depth (% que llegan al selector)
- Bounce rate del hero

**Negocio:**
- Conversión Home → checkout
- AOV (ticket medio)
- % de pedidos con suscripción (cuando se active)

**Cualitativo:**
- Test moderado n=5 con público objetivo: ¿en 5 segundos pueden decir qué vende Bionta y a quién?

---

## 8. Próximos pasos recomendados

1. **Validar la tesis con el equipo** (1 reunión, máx. 30 min). Si hay desacuerdo, debatir con la Home actual y la propuesta lado a lado.
2. **Si se acepta:** arrancar por los dos ítems de NOW de máximo impacto y mínimo esfuerzo:
   - **Hero** (copy + CTA + imagen real)
   - **Selector unificado** (un componente, una decisión)
3. **No pintar, medir.** Antes de invertir sprint en el redesign completo, prototipo navegable + test con 5 usuarios objetivo en 1-2 días.
4. **En paralelo:** auditar y corregir el pricing incoherente (esto es ortogonal al rediseño y debería arreglarse ya).

---

## Apéndice — vínculos

- Auditoría de componentización (cubre los componentes Figma necesarios para implementar esta Home): `.claude/memory/audit_componentization_2026-04-23.md` y página Figma `🧩 Componentización — Auditoría` (`595:4888`).
- Sistema tipográfico (Clash Display + variables): `.claude/memory/typography_system.md`.
- Contexto de negocio: `.claude/memory/business_context.md`.
