# PRD — PDP Caja Personalizable

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Página:** Product Detail Page (PDP) de la modalidad **Caja Personalizable**
- **Ruta propuesta:** `/caja-personalizable` (con `?tamano=grande|pequena` para deep-link)
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-23
- **Estado:** Draft v1 — pendiente de revisión
- **Archivo Figma:** [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)

---

## 1. TL;DR

La PDP de Caja Personalizable es la página donde un visitante que quiere **elegir qué frutas recibe** construye su caja dentro del **set acotado disponible esa semana** y compra. Es más compleja que la PDP cerrada porque introduce un **picker de frutas** con reglas de selección (cantidad, límites, tamaño), preview en vivo y estados de validación. Su trabajo es sostener la conversión de un usuario que quiere control, sin dejar que la complejidad del picker mate la decisión.

**Objetivos de negocio:**

1. Capturar al segmento que rechaza la caja cerrada por falta de control sobre el surtido.
2. Apalancar la **temporada visible** como argumento: "puedes elegir lo que hay esta semana".
3. Justificar un diferencial tech real (configurabilidad) sin añadir fricción.

---

## 2. Contexto y problema

Bionta vende cajas de fruta tropical de temporada. La modalidad **personalizable** permite al cliente armar su caja dentro de un **set acotado de opciones** que rota cada semana. Hoy esta modalidad vive como 2 cards en el Home (Grande y Pequeña) sin interfaz de construcción, sin definir cuántas frutas entran en cada tamaño, y sin explicar las reglas al usuario.

**Problema a resolver con esta PDP:**

- No existe interfaz para **construir la caja**. Todo el "personalizable" es hoy texto en el Home.
- Falta definir y comunicar **las reglas de selección** — cuántas frutas, límites por tipo, qué pasa si una opción se agota a mitad de sesión.
- La rotación semanal debe estar reflejada **dentro del picker**, no solo como mención.
- Necesita conversión comparable a la PDP cerrada pero con un flujo de 2 pasos (tamaño → frutas) en vez de 1.

**Relación con otras páginas:**

- **Home:** desde el selector Home, click en "Caja personalizable + tamaño" manda a esta PDP con tamaño preseleccionado (add-to-cart directo no aplica aquí — siempre requiere paso por el picker).
- **PDP Caja Cerrada:** comparte arquitectura y componentes comunes; diverge en el bloque de selección y en el pitch del moat.

---

## 3. Objetivos / No-objetivos / Fuera de alcance

### Objetivos

- Permitir construir una caja válida (selección completa) en ≤ 4 clicks + scroll.
- Hacer **obvias** las reglas (cuántas frutas caben, cuáles están disponibles, cómo agregar/quitar).
- Mostrar preview en vivo de la caja construida.
- Prevenir estados inválidos con feedback inmediato (no validar solo al hacer CTA).

### No-objetivos (v1)

- **No** permitir elegir cantidades >1 por fruta en v1 (cada fruta es "hay o no hay" en la caja). Evaluar v2.
- **No** guardar presets/cajas favoritas ni "última caja" (v2 cuando haya cuenta de usuario madura).
- **No** integrar suscripción en el selector (ver §12).
- **No** ofrecer sustitución automática ante out-of-stock en checkout (v2).

### Fuera de alcance del doc

- Carrito y checkout.
- Lógica de recetario / maridajes / recomendaciones — evaluar en v2 como "+IA".
- Mecánica de regalo o notas personalizadas.

---

## 4. Usuarios y Jobs to be Done

### Perfil primario — "Cliente con preferencias fuertes"

- 30–50 años, sabe lo que le gusta y lo que no.
- Quizá ya probó una caja cerrada y decidió eliminar 1-2 frutas.
- Alta sensibilidad a pagar por cosas que no va a comer.

**JTBD 1:** *Cuando quiero fruta tropical pero no la compro cerrada, quiero poder excluir lo que no me gusta y elegir lo que sí, para no desperdiciar ni pagar de más.*

**JTBD 2:** *Cuando construyo mi caja, quiero ver en tiempo real qué llevo y qué me falta, para no tener que llegar al final para descubrir un error.*

### Perfil secundario — "Foodie curioso"

- 25–40 años, quiere explorar variedades concretas que ha visto en redes.
- Compra ocasionalmente y paga premium por variedad rara.

**JTBD 3:** *Cuando he visto una fruta concreta (ej. rambután), quiero encontrarla y asegurar que viene en mi caja, para no tener que comprarla por separado.*

---

## 5. Arquitectura de información — stack de bloques

Orden de scroll (desktop 1440 canónico):

| # | Bloque | Rol |
|---|--------|-----|
| 1 | Breadcrumb | Ubicación + SEO |
| 2 | **Hero PDP** | Galería + nombre + precio + selector tamaño + CTA "Elegir frutas" |
| 3 | **Picker de frutas** | El bloque diferencial — construcción de la caja con preview |
| 4 | Cómo funciona | 3 pasos (elige tamaño → elige frutas → recibes) |
| 5 | **Disponibilidad esta semana** | Badges cortos + link a calendario completo |
| 6 | Qué incluye | Contenido tipo, peso, origen, packaging |
| 7 | Trío features | Sostenibilidad · Tech · Frescura |
| 8 | Social proof | Testimonios (3) + trust badges |
| 9 | FAQ | 6-8 objeciones reales |
| 10 | Cross-sell | Card hacia PDP Caja Cerrada |
| 11 | Footer | Estándar Bionta |

**Wireframe textual (desktop 1440):**

```
┌────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR PILL                          [cuenta] [carrito]   │
├────────────────────────────────────────────────────────────────┤
│  Inicio / Cajas / Caja personalizable                          │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   CAJA PERSONALIZABLE                        │
│  │              │   Tú eliges qué fruta tropical llevas        │
│  │  [galería    │                                              │
│  │   producto]  │   ( ) Pequeña · 29 €  ( ) Grande · 49 €      │
│  │              │                                              │
│  │  [dot dot]   │   [ ELEGIR FRUTAS ↓ ]                        │
│  └──────────────┘   ✓ Envío refrigerado · Entrega en 24-48 h   │
├────────────────────────────────────────────────────────────────┤
│  CONSTRUYE TU CAJA                         [ 3 / 6 elegidas ]  │
│                                                                │
│  ┌────────────────────────────┐   ┌──────────────────┐         │
│  │ Disponibles esta semana    │   │ Tu caja          │         │
│  │                            │   │                  │         │
│  │ [papaya]  [mango]  [piña]  │   │ 1. Mango         │         │
│  │ [guayaba] [lichi] [fruta]  │   │ 2. Lichi         │         │
│  │ [coco]    [...]            │   │ 3. Coco          │         │
│  │                            │   │ __ libre         │         │
│  │                            │   │ __ libre         │         │
│  │                            │   │ __ libre         │         │
│  └────────────────────────────┘   └──────────────────┘         │
│                                                                │
│              [ AÑADIR AL CARRITO — 49 € ]  (deshab. si <6)    │
├────────────────────────────────────────────────────────────────┤
│  CÓMO FUNCIONA                                                 │
│  1. Elige tamaño  2. Elige frutas  3. Recibes en 24-48 h       │
├────────────────────────────────────────────────────────────────┤
│  DISPONIBILIDAD ESTA SEMANA                                    │
│  [papaya] [mango] [piña] [guayaba] [...]   Ver calendario →    │
├────────────────────────────────────────────────────────────────┤
│  QUÉ INCLUYE · TRÍO FEATURES · SOCIAL PROOF · FAQ              │
├────────────────────────────────────────────────────────────────┤
│  ¿Prefieres que elijamos por ti? → Caja cerrada                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Requisitos funcionales por bloque

### 6.1 Breadcrumb

- Ruta: `Inicio / Cajas / Caja personalizable`.
- Componente: **Breadcrumbs** (primitivo DS).
- Estilo: `Label/S`.

### 6.2 Hero PDP

**Estructura (2 columnas desktop, stack vertical mobile):**

- **Columna izquierda — Galería:**
  - Mínimo 3 imágenes: caja abierta con fruta variada, caja cerrada con branding, detalle del picker físico (la caja con separadores).
  - Dots.
  - **No usar** las fotos off-brand del Home actual.

- **Columna derecha — Información y compra:**
  - Título: `Display/L` — **"Caja personalizable"**.
  - Subtítulo: `Body/L` — *"Tú eliges qué fruta tropical llevas dentro de nuestra selección de la semana."*.
  - Selector tamaño: dos pills — "Pequeña" | "Grande".
    - Default: **Grande** (consistencia con PDP cerrada).
    - Precio dinámico por opción (v1: mismo precio por tamaño que la cerrada, pendiente de confirmación por pricing — ver §12).
  - CTA primario: **"Elegir frutas ↓"** — scroll suave al bloque picker (no añade al carrito).
  - Micro-trust debajo: *"✓ Envío refrigerado · Entrega en 24-48 h · Devolución garantizada"*.

**Comportamiento:**

- Cambiar tamaño actualiza **la capacidad del picker** (§6.3) y el precio.
- Si el usuario ya había elegido frutas y reduce el tamaño, advertir: *"Cambiar a Pequeña mantendrá 4 de 6 frutas. ¿Continuar?"* → confirmar antes de descartar.
- Deep-link: `/caja-personalizable?tamano=pequena` preselecciona.

### 6.3 Picker de frutas (bloque diferencial)

**El corazón del PDP.** Este bloque debe ser: claro, tolerante al error, y divertido de usar.

**Layout (2 columnas dentro del bloque):**

- **Izquierda — "Disponibles esta semana":**
  - Grid de **cards de fruta disponibles** (8-14 según semana).
  - Cada card: foto 1:1, nombre (`Label/M`), origen + maduración (`Body/S`), botón **"Añadir"** o check si ya está en la caja.
  - Cards agotadas esa semana: deshabilitadas con overlay "Agotada esta semana".

- **Derecha — "Tu caja":**
  - Título: `Heading/L` — **"Tu caja"** + contador superior: **"3 / 6 elegidas"** (Grande) o **"2 / 3 elegidas"** (Pequeña).
  - Lista vertical de **slots** con el tamaño máximo de la caja:
    - Slots llenos: nombre de la fruta + botón "Quitar" (X).
    - Slots vacíos: placeholder *"Elige una fruta"* con icono +.
  - Debajo: **CTA "Añadir al carrito — {precio}"**. Deshabilitado hasta que la caja esté completa.
  - Mensaje contextual:
    - Incompleta: *"Te faltan {n} frutas para completar tu caja."*
    - Completa: *"¡Perfecto! Tu caja está lista."*

**Reglas de selección v1:**

- **Tamaños y capacidad:** Grande = **6 frutas**, Pequeña = **3 frutas**. (Números propuestos, validar con ops.)
- **Cantidades:** 1 unidad por fruta seleccionada (no se puede elegir 2 mangos en v1).
- **Mínimo para convertir:** caja completa (no se permite caja parcial).
- **Sustitución:** si una fruta se agota entre selección y checkout, el backend devuelve error; UI muestra el slot como "Agotada, elige otra" y bloquea checkout hasta reemplazo.

**Comportamiento:**

- Click en fruta disponible → se añade al primer slot vacío → card cambia a estado "elegida".
- Click en "Quitar" slot → se libera el slot → card en disponibles vuelve a clickeable.
- Si intenta añadir una fruta cuando la caja está llena → toast: *"Tu caja está llena. Quita una fruta para cambiarla."*.
- CTA "Añadir al carrito" deshabilitado mientras la caja no esté completa, con tooltip explicativo al hover/focus.

**Fuente de datos:** endpoint de calendario de temporada (mismo que PDP cerrada, §11).

### 6.4 Cómo funciona

- Tres pasos con **Feature Block**:
  1. **Eliges tamaño** — *"Pequeña (3 frutas) o Grande (6 frutas)."*
  2. **Construyes tu caja** — *"Elige dentro de lo disponible esta semana."*
  3. **Recibes en 24-48 h** — *"Envío refrigerado. Fresca, lista para comer."*

### 6.5 Disponibilidad esta semana (badges)

- Título: `Heading/L` — **"Disponibilidad esta semana"**.
- Subtítulo: `Body/M` — *"Lo que podrás elegir hasta el domingo 23:59."*.
- Fila horizontal de **badges** (componente **Badge & Chip** existente en DS) con nombre de cada fruta disponible.
- Link a la derecha: **"Ver calendario completo →"** que lleva a `/calendario-temporada` (v2 si no existe todavía, ver §12).

**Diferencia con PDP cerrada:** aquí el bloque es más ligero porque las frutas "grandes" viven dentro del picker (§6.3). Aquí actúa como mini-recordatorio + puente al calendario.

### 6.6 Qué incluye

- Lista de 4-5 líneas con pictograma + texto:
  - "Hasta 6 variedades a tu elección"
  - "Peso aprox. 3,5 kg (Grande) / 2 kg (Pequeña)"
  - "Packaging 100% reciclable"
  - "Origen trazable por QR"
  - "Rotación semanal — siempre temporada"

### 6.7 Trío features

- **Sostenibilidad**, **Tech**, **Frescura** — mismo patrón que PDP cerrada pero el bloque **Tech** aquí puede subir el acento: *"Tu caja, a tu medida. Reconfigurable cada semana."*.

### 6.8 Social proof

- 3 testimonios con énfasis en **personalización** (ej. *"Elijo solo lo que me gusta, nada se tira"*).
- Trust badges: frescura, envío refrigerado, devolución, origen.

### 6.9 FAQ

- 6-8 preguntas colapsables, con énfasis en el picker:
  - ¿Qué pasa si una fruta se agota mientras construyo la caja?
  - ¿Puedo elegir 2 de la misma fruta? *(no v1, sí v2)*.
  - ¿Por qué Grande lleva 6 frutas y Pequeña 3?
  - ¿Por qué no hay más opciones?
  - ¿Con qué frecuencia cambia la selección?
  - ¿Puedo cambiar las frutas después de pedir? *(no — una vez en el carrito, cierra)*.
  - ¿Qué diferencia hay con la Caja Cerrada? *(enlaza a PDP cerrada)*.
  - ¿Puedo pausar o cancelar si me suscribo? *(placeholder v2)*.

### 6.10 Cross-sell

- Copy: **"¿Prefieres que elijamos por ti?"**.
- Sub: *"Nuestro equipo selecciona cada semana un surtido tropical pensado para descubrir variedades."*.
- CTA: **"Ver caja cerrada →"** → linkea a `/caja-cerrada?tamano=grande` (mantiene tamaño si ya eligió).

### 6.11 Footer

- Componente **Footer** estándar.

---

## 7. Flujos

### 7.1 Happy path — desde Home selector

1. Usuario hace click en "Ver detalles" personalizable/Grande desde Home.
2. Aterriza en `/caja-personalizable?tamano=grande`.
3. Click en "Elegir frutas ↓" → scroll suave al picker.
4. Añade 6 frutas → caja completa.
5. Click "Añadir al carrito — 49 €" → mini-cart se abre.

### 7.2 Happy path — tráfico directo

1. Usuario aterriza en `/caja-personalizable`.
2. Default "Grande". Ve el hero, lee subtítulo, scrollea al picker.
3. Explora cards, añade 6 frutas, convierte.

### 7.3 Flujo cambio de tamaño con caja en construcción

1. Usuario tiene 4 de 6 frutas elegidas en Grande.
2. Cambia a Pequeña (3 frutas).
3. Modal de confirmación: *"Pasarás de 6 a 3 frutas. Mantendremos las 3 primeras elegidas. ¿Continuar?"*.
4. Confirma → se recorta a 3; las cards descartadas vuelven a disponibles.

### 7.4 Flujo out-of-stock en medio de sesión

1. Usuario elige mango. 2 minutos después, backend marca mango agotado.
2. Al intentar añadir al carrito, se valida y el slot "Mango" muestra estado "Agotada — elige otra" en rojo.
3. CTA deshabilitado hasta que reemplaza.

### 7.5 Flujo cross-sell (ida y vuelta)

- PDP personalizable → cross-sell → PDP cerrada → cross-sell de vuelta: mantener selecciones como estado cliente solo dentro de la misma sesión, no persistir cross-page.

---

## 8. Estados y edge cases

| Estado | Comportamiento |
|---|---|
| **Caja vacía** | CTA principal del hero dice "Elegir frutas ↓", no "Añadir al carrito". CTA del picker deshabilitado con mensaje "Te faltan X frutas". |
| **Caja parcial** | Contador muestra "n / N". CTA deshabilitado. Mensaje contextual guía al usuario. |
| **Caja completa** | CTA activado, mensaje de celebración (sutil, sin confetti). |
| **Exceso de selección** (intento de añadir con caja llena) | Toast informativo, no silencio. |
| **Fruta agotada durante sesión** | Card en estado deshabilitado. Si ya está en la caja: slot en estado alerta "Agotada esta semana" + botón "Elegir otra". |
| **Cambio de tamaño con caja llena** | Modal de confirmación ANTES de descartar. |
| **Calendario de temporada no disponible (fallo API)** | Picker muestra estado de error: *"No podemos cargar las frutas de esta semana. Reintenta en un momento."* + botón "Reintentar". Hero + CTA "Elegir frutas" deshabilitado. |
| **Tamaño Grande agotado (sin capacidad operativa esta semana)** | Pill "Grande" deshabilitada; default pasa a "Pequeña"; banner informativo *"Grande vuelve la próxima semana"*. |
| **Usuario con carrito que tenía personalizable previa** | Al entrar a PDP, el picker muestra la caja anterior precargada, con botón "Editar" y "Ya en carrito"; evitar duplicación silenciosa. |
| **Mobile** | Picker pasa a 1 columna: primero "Tu caja" sticky arriba (collapsible), luego "Disponibles" en grid 2 col. CTA sticky al fondo. |

---

## 9. Componentes Figma referenciados

Referencias a la **Auditoría de componentización** (`595:4888`) — [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design).

| Bloque PDP | Componente requerido | Prioridad auditoría | Estado |
|---|---|---|---|
| Top Navbar | **Top Navbar Pill** | P0 | Por crear |
| Breadcrumb | **Breadcrumbs** | Existente | Ok |
| Hero — galería | **Hero/Banner Carrusel** | P1 | Por crear |
| Hero — CTA "Elegir frutas" | **Primary CTA** (variante scroll-to, no add-to-cart) | P0 | Validar Button set |
| Selector tamaño | **Checkbox + Leaf Option** | P1 | Por crear |
| Picker — card fruta | **Product Card "Caja"** (variante "Fruta seleccionable") | P0 | Por crear — estados: default / elegida / agotada |
| Picker — slot caja | Slot component nuevo — NO existe | — | Marcar en auditoría v2 |
| Picker — contador | Counter badge — usar **Badge & Chip** variante numérica | Existente | Validar variantes |
| Picker — CTA | **Primary CTA** (estado disabled importante) | P0 | Validar |
| Disponibilidad semana | **Badge & Chip** (fila horizontal) | Existente | Ok |
| Cómo funciona / Features | **Feature Block** | P1 | Ya creado |
| FAQ | Acordeón — no existe | — | Marcar auditoría v2 |
| Footer | **Footer** | P1 | Ya creado |

**Tipografía:** mismas text styles que PDP cerrada (Display/L, Heading/L, Body/L, Body/M, Label/M, Price/L, Body/S, Label/S).

**Estados específicos a diseñar:**

- Card fruta: `default` · `hover` · `elegida` · `agotada` · `disabled`.
- Slot caja: `vacío` · `lleno` · `alerta-agotada`.
- CTA picker: `deshabilitado` · `activo`.

---

## 10. Métricas de éxito

**Primarias (funnel):**

- **Completion rate del picker:** % de sesiones que entran al picker y completan la caja. *Target v1: ≥ 45%.*
- **Add-to-cart rate (ATC) sobre sesiones PDP:** *Target v1: ≥ 5% directo, ≥ 10% desde Home.*
- **Tiempo en picker:** mediana esperada 60-120 s. < 30 s huele a frustración, > 240 s a indecisión.

**Secundarias:**

- **Interacciones de add/remove en el picker:** promedio por sesión que convierte. Benchmark interno.
- **% que cambia tamaño después de empezar a elegir.** Si es alto, revisar jerarquía (quizá elegir tamaño antes de abrir picker no está claro).
- **Scroll depth** a "Disponibilidad esta semana" y "FAQ".

**Cualitativas:**

- Test n=5: ¿entienden las reglas (n frutas máximas) sin leer la FAQ? ¿cómo reaccionan a una fruta agotada?

---

## 11. Dependencias

| Dependencia | Owner | Bloquea |
|---|---|---|
| **API calendario de temporada** — lista frutas disponibles con meta (foto, nombre, origen, stock binario) | Backend + Contenido | §6.3 Picker |
| **Stock en tiempo real por fruta** — para validar en ATC y al cambiar tamaño | Backend | §8 edge cases |
| **Pricing por SKU {personalizable, tamaño}** | Backend | Hero + CTA picker |
| **Definición de capacidades** — ¿Grande=6? ¿Pequeña=3? | Operaciones + Logística | §6.3 reglas |
| **CDN fotos fruta individual** (no solo cajas) | Brand + Fotografía | Cards del picker |
| **Sistema de componentes Figma** — P0 + P1 + nuevos estados de card | Design System | Implementación |
| **Analítica** — eventos `pdp_view`, `picker_open`, `fruit_add`, `fruit_remove`, `box_complete`, `pdp_atc`, `size_change_midway` | Data | Métricas |
| **Página de calendario de temporada** (`/calendario-temporada`) | Contenido + Frontend | §6.5 link (puede ir a v2 si no existe) |
| **Testimonios reales** con énfasis personalización | CRM + Legal | §6.8 |
| **Copy brand y legal** | Brand + Legal | Todos los bloques |

---

## 12. Decisiones abiertas

- **Capacidades del picker.** Grande=6, Pequeña=3 son propuestas. Validar con operaciones: volumen real, peso por fruta, coste de packaging.
- **Pricing personalizable vs cerrada.** v1 asume mismo precio por tamaño (29 / 49). Pricing puede querer diferenciar (+X € por personalización, o -X € por flexibilidad). Pendiente de finanzas.
- **Cantidades >1 por fruta.** v1: no. v2: evaluar si genera valor o complica. Depende de data del picker post-lanzamiento.
- **Suscripción personalizada.** ¿El cliente guarda su caja y se suscribe a esa combinación? Pendiente de mecánica suscripción (ver §13).
- **Guardar caja favorita / presets.** v2 cuando exista cuenta madura y reuso semanal.
- **Página de calendario de temporada.** Existe o no a fecha de lanzamiento. Plan B: el link de §6.5 puede ser eliminado si la página no está lista.
- **CTA sticky en mobile** dentro del picker.
- **Recomendaciones / pairings tipo "si llevas piña, prueba lichi"** — potencial diferenciador tech, evaluar en v2.

---

## 13. Próximos pasos / v2

**v2 — mecánica suscripción definida:**

- Opción de "Suscribirme a esta caja" desde la caja completada — el sistema recuerda la combinación o permite elegir nueva cada semana.
- Bloque pitch suscripción con CTA propio a `/suscripcion`.

**v2 — picker evolucionado:**

- Guardar favoritos / presets.
- Cantidades múltiples por fruta.
- Pairings / recomendaciones (IA opcional — "quienes llevan papaya también llevan…").
- Sustitución automática ante OOS con preferencia del cliente configurada.

**v2 — marketing:**

- Landings SEM por fruta estrella (`/caja-personalizable/mango`).
- "Caja de la semana" curada por un chef/foodie invitado.

**Iteración técnica:**

- Accesibilidad AA en picker (teclado, ARIA live para contador, focus management al cambiar tamaño).
- Core Web Vitals — INP bajo en el picker (cada añadir/quitar debe responder < 100 ms).
- Internacionalización.

---

## Apéndice — vínculos

- Home audit: `docs/home-audit-product-lens.md`.
- Auditoría componentización: `.claude/memory/audit_componentization_2026-04-23.md`, página Figma `🧩 Componentización — Auditoría` (`595:4888`).
- Sistema tipográfico: `.claude/memory/typography_system.md`, página Figma `🔤 Typography` (`602:5186`).
- Contexto de negocio: `.claude/memory/business_context.md`.
- PRD hermano: `docs/prd-pdp-caja-cerrada.md`.
