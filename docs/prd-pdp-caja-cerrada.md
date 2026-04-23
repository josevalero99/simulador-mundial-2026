# PRD — PDP Caja Cerrada

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Página:** Product Detail Page (PDP) de la modalidad **Caja Cerrada**
- **Ruta propuesta:** `/caja-cerrada` (con `?tamano=grande|pequena` para deep-link)
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-23
- **Estado:** Draft v1 — pendiente de revisión
- **Archivo Figma:** [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)

---

## 1. TL;DR

La PDP de Caja Cerrada es la página donde un visitante que ya sabe que quiere una caja **sin elegir frutas** decide tamaño y compra. Su trabajo principal es convertir — ser a la vez *página de detalle* (qué incluye, de dónde viene) y *página de compra* (añadir al carrito en 1 click). Debe comunicar **la estacionalidad como moat** mostrando qué frutas recibe el cliente esta semana, y reducir fricción con un selector de tamaño simple y un CTA primario claro.

**Objetivos de negocio:**

1. Convertir sesiones que llegan desde el Home selector o desde campañas SEM.
2. Apalancar la estacionalidad (rotación semanal) como argumento de compra.
3. Servir de base técnica y de patrón visual para la PDP de Caja Personalizable.

---

## 2. Contexto y problema

Bionta vende cajas de fruta tropical de temporada en modalidad **cerrada** (surtido fijo definido por Bionta) y **personalizable** (set acotado de opciones). Hoy la oferta vive fragmentada en el Home como 4 cards separadas, sin página de detalle, sin explicación de qué incluye la caja cada semana y sin un patrón de conversión repetible.

**Problema a resolver con esta PDP:**

- Un visitante que quiere la caja cerrada no tiene dónde profundizar: qué va a recibir esta semana, de dónde viene, cómo se entrega, qué garantías hay.
- La rotación semanal (el activo competitivo) no es visible en ningún sitio del flujo de compra.
- El Home sirve para atraer; hace falta una página dedicada que convierta tráfico directo (SEM, SEO, email, referencia) sin depender del selector del Home.

**Relación con otras páginas:**

- **Home:** el selector unificado del Home puede mandar a esta PDP (deep-link con `?tamano=grande`) o ejecutar add-to-cart directo. Esta PDP debe funcionar en ambos casos.
- **PDP Caja Personalizable:** comparte 80% de la estructura; diverge en el bloque de selección (toggle simple aquí vs picker de frutas allá).

---

## 3. Objetivos / No-objetivos / Fuera de alcance

### Objetivos

- Que un visitante pueda, en ≤ 3 clicks desde que entra a la PDP, **añadir al carrito** una Caja Cerrada del tamaño deseado.
- Mostrar, above the fold, la promesa: **qué es**, **cuánto cuesta** y **qué botón pulsar**.
- Hacer visible la **fruta de esta semana** como prueba del moat estacional.
- Reducir objeciones con FAQ, trust badges y testimonios antes del cross-sell.

### No-objetivos (v1)

- **No** integrar el flujo de suscripción en el selector (ver §12).
- **No** mostrar variantes de pago a plazos, financiación ni regalo/gifting (evolución v2+).
- **No** permitir editar el surtido (esa es la PDP personalizable, y este PDP debe redirigir hacia ella como cross-sell).
- **No** mostrar histórico de surtidos de semanas anteriores (se evaluará en v2 como contenido SEO).

### Fuera de alcance del doc

- Diseño del **carrito** y checkout.
- Sistema de **pricing dinámico backend** — este PRD asume que el backend ya expone precio por SKU {modalidad, tamaño}.
- **Integración con backend de inventario/calendario de temporada** — se describe como dependencia, no como requisito interno.

---

## 4. Usuarios y Jobs to be Done

### Perfil primario — "Clienta curiosa de fruta tropical"

- 28–45 años, urbana, valora producto fresco y origen.
- Llega desde IG, recomendación o SEM con intención moderada-alta.
- No quiere decidir fruta a fruta: confía en el criterio de Bionta.

**JTBD 1:** *Cuando quiero probar la fruta tropical de Bionta, quiero una caja con surtido pensado por expertos, para no tener que investigar qué combina con qué.*

**JTBD 2:** *Cuando pienso en comprar fruta online, quiero saber qué voy a recibir exactamente esta semana, para no sentir que compro a ciegas.*

### Perfil secundario — "Comprador de regalo"

- 30–55 años, busca regalar algo premium y poco común.
- Tiempo limitado, alta sensibilidad a la estética del packaging y al plazo de entrega.

**JTBD 3:** *Cuando quiero regalar algo que sorprenda, quiero elegir rápido un formato bonito, para resolver el regalo en 2 minutos.*

---

## 5. Arquitectura de información — stack de bloques

Orden de scroll (desktop 1440 como canónico, mobile como adaptación):

| # | Bloque | Rol |
|---|--------|-----|
| 1 | Breadcrumb | Ubicación + SEO |
| 2 | **Hero PDP** | Galería + nombre + precio + selector tamaño + CTA primario |
| 3 | **Esta semana recibes** | Moat estacional — fotos de las 5-8 frutas reales de la semana |
| 4 | Cómo funciona | 3 pasos (elige tamaño → recibes en 24-48h → disfrutas) |
| 5 | Qué incluye | Contenido tipo, peso total, origen, formato de entrega |
| 6 | Trío features | Sostenibilidad · Tech · Frescura |
| 7 | Social proof | Testimonios (3) + trust badges (frescura, envío, devolución) |
| 8 | FAQ | 6-8 objeciones reales |
| 9 | Cross-sell | Card hacia PDP Caja Personalizable |
| 10 | Footer | Estándar Bionta |

**Wireframe textual (desktop 1440):**

```
┌────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR PILL                          [cuenta] [carrito]   │
├────────────────────────────────────────────────────────────────┤
│  Inicio / Cajas / Caja cerrada                                 │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   CAJA CERRADA                               │
│  │              │   Surtido tropical por Bionta                │
│  │  [galería    │                                              │
│  │   producto]  │   ( ) Pequeña · 29 €  ( ) Grande · 49 €      │
│  │              │                                              │
│  │  [dot dot]   │   [ AÑADIR AL CARRITO — 49 € ]               │
│  └──────────────┘   ✓ Envío refrigerado · Entrega en 24-48 h   │
├────────────────────────────────────────────────────────────────┤
│  ESTA SEMANA RECIBES                                           │
│  [ 5-8 frutas con foto cuadrada + nombre + origen ]            │
│  Disponible hasta domingo 23:59                                │
├────────────────────────────────────────────────────────────────┤
│  CÓMO FUNCIONA                                                 │
│  1. Elige tamaño   2. Recibes en 24-48 h   3. Disfrutas        │
├────────────────────────────────────────────────────────────────┤
│  QUÉ INCLUYE                                                   │
│  · 5-8 variedades · 3,5 kg aprox · Papel reciclado · Origen    │
├────────────────────────────────────────────────────────────────┤
│  [ Sostenibilidad ]  [ Tech ]  [ Frescura ]                    │
├────────────────────────────────────────────────────────────────┤
│  LO QUE DICEN                                                  │
│  "..." — nombre  |  "..." — nombre  |  "..." — nombre          │
│  ✓ frescura   ✓ envío refrigerado   ✓ devolución               │
├────────────────────────────────────────────────────────────────┤
│  FAQ — 6-8 preguntas colapsables                               │
├────────────────────────────────────────────────────────────────┤
│  ¿Prefieres elegir tú las frutas? → Caja personalizable        │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Requisitos funcionales por bloque

### 6.1 Breadcrumb

- Ruta: `Inicio / Cajas / Caja cerrada`.
- Componente: **Breadcrumbs** (primitivo ya existente en DS, `Design System` page `147:2`).
- Estilo: `Label/S` Medium 12.
- Links activos excepto el último.

### 6.2 Hero PDP

**Estructura (2 columnas desktop, stack vertical mobile):**

- **Columna izquierda — Galería:**
  - Imagen principal cuadrada 1:1, mínimo 3 imágenes.
  - Navegación por dots (referenciar **Carousel Indicator (Dots)**, P2 auditoría).
  - Imagen 1: caja abierta con fruta real; Imagen 2: caja cerrada con branding; Imagen 3: fruta individual en detalle.
  - **No usar** fotos con lechuga/tomates/pimientos (bug actual del Home).

- **Columna derecha — Información y compra:**
  - Título: `Display/L` Medium 36 — **"Caja cerrada"**
  - Subtítulo: `Body/L` Regular 24 — *"Surtido tropical elegido por Bionta, fresco cada semana."*
  - Selector tamaño: dos radio toggles o pills — **"Pequeña"** | **"Grande"** (usa **Checkbox + Leaf Option** extendido, P1 auditoría).
    - Default: **Grande** (mayor AOV).
    - Precio dinámico junto a cada opción: `"Pequeña · 29 €"` / `"Grande · 49 €"`.
    - Precio principal `Price/L` Semibold 24 refleja el tamaño seleccionado.
  - CTA primario: **"Añadir al carrito — {precio}"** — referencia **Primary CTA** (P0 auditoría), fill-width, iconEnd opcional (carrito).
  - Línea de micro-trust debajo del CTA: `Body/S` Regular 12 — *"✓ Envío refrigerado · Entrega en 24-48 h · Devolución garantizada"*.

**Comportamiento:**

- Cambiar tamaño actualiza precio inline y precio del CTA sin recargar.
- Deep-link soportado: `/caja-cerrada?tamano=pequena` preselecciona "Pequeña" al cargar.
- Click en CTA añade 1 unidad del SKU `{cerrada, tamaño-actual}` al carrito y abre el **mini-cart** (no navega).

### 6.3 Esta semana recibes (moat)

**El bloque diferencial.** Es el argumento de compra más fuerte en categoría fruta fresca: el cliente sabe exactamente qué va a recibir.

- Título sección: `Heading/L` Medium 24 — **"Esta semana recibes"**.
- Subtítulo opcional: `Body/M` Regular 16 — *"Seleccionado por nuestro equipo. Rota cada semana."*.
- Grid de **5-8 cards de fruta**:
  - Foto cuadrada 1:1 (producto real, fondo claro neutro).
  - Nombre de la fruta: `Label/M` Medium 16.
  - Origen + maduración: `Body/S` Regular 12 — ej. *"Papaya · Costa Rica · Lista para comer"*.
- Ventana de vigencia (debajo del grid, alineado a la derecha): `Body/S` Regular 12 — **"Disponible hasta el domingo 23:59"**.
- Fallback para semana en transición (ver §8 Estados y edge cases).

**Fuente de datos:** endpoint de calendario de temporada (ver §11 Dependencias) — nunca hardcodear.

### 6.4 Cómo funciona

- Título: `Heading/L` Medium 24 — **"Cómo funciona"**.
- Tres columnas, cada una con **icono + título + 1 línea**:
  1. **Eliges tamaño** — *"Pequeña o Grande. Sin complicaciones."*
  2. **Recibimos tu pedido** — *"Envío refrigerado en 24-48 h."*
  3. **Disfrutas fruta de temporada** — *"Fresca, tropical y lista para comer."*
- Usar componente **Feature Block** (P1 auditoría, ya creado en `Components_web_bionta` página P1).

### 6.5 Qué incluye

- Título: `Heading/L` Medium 24 — **"Qué incluye la caja"**.
- Lista de 4-5 líneas con pictograma + texto (`Body/M`):
  - "5-8 variedades de fruta tropical"
  - "Peso aprox. 3,5 kg (Grande) / 2 kg (Pequeña)"
  - "Packaging 100% reciclable"
  - "Origen trazable por QR en la caja"
  - "Sin fruta madurada artificialmente"

### 6.6 Trío features

- Tres bloques en paralelo, no uno monolítico (recomendación del home audit §5).
- **Sostenibilidad** — empaque, transporte local donde se pueda, zero food-waste.
- **Tech** — seguimiento del pedido, QR de trazabilidad, gestión de cuenta.
- **Frescura** — ventana de 24-48 h, cadena de frío, "del árbol a tu puerta".
- Componente: **Feature Block** (P1 auditoría), variante de 3 columnas.

### 6.7 Social proof

- Título: `Heading/L` Medium 24 — **"Lo que dicen"**.
- 3 testimonios mínimo, cada uno con: foto real (no stock), nombre + ciudad, rating (opcional), cita breve (1-2 líneas).
- Debajo: fila horizontal de **trust badges** (4 máx.): frescura garantizada, envío refrigerado, devolución 100%, origen verificado.

### 6.8 FAQ

- Título: `Heading/L` Medium 24 — **"Preguntas frecuentes"**.
- 6-8 preguntas en formato acordeón. Objeciones reales:
  - ¿Qué pasa si alguna fruta no llega en buen estado?
  - ¿Puedo cambiar el surtido?
  - ¿A qué ciudades entregáis?
  - ¿En qué franja horaria llega?
  - ¿La fruta es ecológica?
  - ¿Puedo regalar una caja?
  - ¿Qué diferencia hay entre la Cerrada y la Personalizable?
  - ¿Puedo pausar o cancelar si me suscribo? *(placeholder para v2 suscripción)*.

### 6.9 Cross-sell

- Card horizontal o sección ancho completo.
- Copy: **"¿Prefieres elegir tú las frutas?"** — `Heading/L` 24.
- Sub: *"Construye tu caja eligiendo dentro de nuestra selección semanal."* — `Body/M` 16.
- CTA secundario: **"Ver caja personalizable →"** — linkea a `/caja-personalizable`.
- Imagen: foto de picker/caja personalizada (distinta a la del hero).

### 6.10 Footer

- Componente **Footer** (P1 auditoría, ya creado).
- Sin cambios específicos para la PDP.

---

## 7. Flujos

### 7.1 Happy path — desde Home selector

1. Usuario hace click en "Ver detalles" desde el selector Home (tamaño grande pre-seleccionado).
2. Aterriza en `/caja-cerrada?tamano=grande`.
3. Lee "Esta semana recibes" → convencido.
4. Click en CTA "Añadir al carrito — 49 €".
5. Mini-cart se abre con el producto dentro.

### 7.2 Happy path — tráfico directo (SEM/SEO)

1. Usuario aterriza en `/caja-cerrada` sin parámetros.
2. Default "Grande" preseleccionado.
3. Cambia a "Pequeña" — precio y CTA se actualizan a 29 €.
4. Scroll hasta "Cómo funciona" y "Trust badges" para despejar dudas.
5. Vuelve arriba (CTA sticky opcional en v2), añade al carrito.

### 7.3 Flujo cross-sell

1. Usuario duda en la PDP cerrada, scrollea hasta cross-sell.
2. Click en "Ver caja personalizable".
3. Navega a `/caja-personalizable` manteniendo el tamaño seleccionado (`?tamano=grande`).

### 7.4 Flujo deep-link

- `/caja-cerrada` → default "Grande".
- `/caja-cerrada?tamano=pequena` → "Pequeña" preseleccionada, precio 29 €.
- Parámetro inválido (ej. `?tamano=xl`) → fallback a "Grande" + sin mostrar error al usuario.

---

## 8. Estados y edge cases

| Estado | Comportamiento |
|---|---|
| **Tamaño agotado** | Toggle del tamaño agotado se muestra deshabilitado + badge "Agotado esta semana"; CTA cambia a "Avísame cuando vuelva" → captura email. |
| **Toda la caja cerrada agotada** | Hero pasa a estado "Vuelve en {X} días"; se oculta selector; CTA único "Avísame cuando vuelva" + cross-sell prominente a Personalizable. |
| **Semana en transición (jueves 23:59 → domingo reset)** | Bloque "Esta semana recibes" muestra *"Mostrando próximo surtido disponible"* + fecha de reset. |
| **Calendario de temporada no disponible (fallo API)** | Bloque "Esta semana recibes" se oculta; se muestra micro-copy en el Hero: *"Surtido rotativo según temporada"*. No bloquea compra. |
| **Precio backend no disponible** | Botón CTA deshabilitado con mensaje discreto "No podemos mostrar el precio ahora, recarga la página". Nunca mostrar 0 € ni texto placeholder. |
| **Usuario regresa con carrito con producto** | Mini-cart muestra cantidad actualizada; CTA "Añadir al carrito" incrementa cantidad y muestra toast "Ya tenías 1. Ahora llevas 2.". |
| **Mobile vs desktop** | Hero pasa a stack vertical: galería full-width arriba, info abajo. Selector tamaño mantiene dos pills. CTA sticky en bottom de viewport al scrollear. |

---

## 9. Componentes Figma referenciados

Referencias a la **Auditoría de componentización** (página Figma `595:4888`) del archivo [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design).

| Bloque PDP | Componente requerido | Prioridad auditoría | Estado |
|---|---|---|---|
| Top Navbar | **Top Navbar Pill** | P0 | Por crear (contenedor + mobile) |
| Breadcrumb | **Breadcrumbs** | Existente | Ok |
| Hero — galería | **Hero/Banner Carrusel** | P1 | Por crear |
| Hero — CTA | **Primary CTA "Añadir al carrito"** | P0 | Validar Button set antes |
| Hero — selector tamaño | **Checkbox + Leaf Option** (extiende Checkbox + Text) | P1 | Por crear |
| Esta semana recibes | **Product Card "Caja"** (variante "Fruta card") | P0 | Por crear — evaluar si es variante o componente nuevo |
| Cómo funciona / Features | **Feature Block** | P1 | Ya creado en `Components_web_bionta` página P1 |
| Cross-sell | **Product Card "Caja"** (variante horizontal) | P0 | Por crear |
| FAQ | Acordeón — no existe aún | No priorizado | Marcar en auditoría v2 |
| Footer | **Footer** | P1 | Ya creado |

**Tipografía (ver `typography_system.md`):** Display/L, Heading/L, Body/L, Body/M, Label/M, Price/L, Body/S, Label/S.

**Color (paleta Bionta):** amarillo `#FFC200` (CTA primario y acentos), oscuro `#1E1E1E` (texto), blanco roto (fondo).

---

## 10. Métricas de éxito

**Primarias (funnel PDP → compra):**

- **Add-to-cart rate (ATC):** % de sesiones PDP que hacen click en CTA. *Target v1: ≥ 6% tráfico directo, ≥ 12% tráfico desde Home selector.*
- **Conversión PDP → checkout iniciado:** *Target v1: ≥ 4%.*
- **Tiempo hasta ATC:** mediana < 45 s para usuarios que convierten.

**Secundarias (engagement):**

- **Scroll depth:** % que llega al bloque "Esta semana recibes". *Target: ≥ 60%.*
- **Interacción con galería:** % que cambia imagen. *Target: ≥ 25%.*
- **Toggle tamaño:** % que cambia la preselección. *Target: 10-20%* (demasiado alto o demasiado bajo es señal a investigar).

**Cualitativas:**

- Test moderado n=5 con público objetivo: en 5 segundos en la PDP, ¿pueden decir qué reciben, cuánto cuesta y qué deben hacer?

**Baseline:** medir la semana previa al lanzamiento con la experiencia actual (Home → email/contacto). Sin baseline no hay forma de defender que la PDP mejora.

---

## 11. Dependencias

| Dependencia | Owner | Bloquea |
|---|---|---|
| **Backend de inventario/stock por SKU** — saber si Grande/Pequeña está disponible en tiempo real | Backend | Estado §8 "Tamaño agotado" |
| **Calendario de temporada** — API que devuelva frutas de la semana con foto, nombre, origen, ventana | Backend + Contenido | Bloque §6.3 |
| **Pricing backend** — precio por SKU {cerrada, tamaño} | Backend | Hero §6.2 |
| **CDN de imágenes producto** — fruta real (sin lechuga/tomates) | Brand + Fotografía | Hero §6.2 + bloque semana §6.3 |
| **Sistema de componentes Figma** — P0 y P1 creados y publicados | Design System | Implementación completa |
| **Analítica** — eventos `pdp_view`, `pdp_atc`, `size_toggle`, `gallery_interact`, `seasonal_block_view` | Data | Métricas §10 |
| **Testimonios reales** — mínimo 3 con foto y consentimiento | CRM + Legal | Bloque §6.7 |
| **Copy definitivo** — revisión brand + legal de FAQ y micro-trust | Brand | Todos los bloques con copy |

---

## 12. Decisiones abiertas

- **Suscripción en PDP.** v1 no integra suscripción. Pendiente definir (a) mecánica de frecuencia, pausa y cancelación; (b) si suscribirse descuenta precio o suma beneficios; (c) si aparece como toggle en el selector o como bloque pitch separado con CTA propio a `/suscripcion`. Ver §13 v2.
- **Reviews/ratings reales.** v1 usa testimonios curados. Evaluar si en v2 se añade sistema de reviews post-compra (tipo Trustpilot o propio).
- **CTA sticky en mobile.** Pro: mejora ATC en scroll largo. Contra: tapa contenido. Validar con prototipo antes de decidir.
- **Default de tamaño.** v1 asume "Grande" como default (maximiza AOV). Validar con A/B test post-lanzamiento.
- **Ratio imagen galería.** v1 asume 1:1. Evaluar 4:5 si las fotos de fruta ganan con verticalidad.
- **Programa de referidos / regalo.** No incluido. Potencial v2 según tracción del modelo regalo.

---

## 13. Próximos pasos / v2

**v2 — cuando se resuelva mecánica de suscripción:**

- Bloque **"Recibe cada semana"** con toggle de frecuencia (semanal/quincenal/mensual) y CTA propio.
- Opción de convertir el ATC en "Suscribirme" desde el mismo selector, ahorrando X% vs compra puntual.

**v2 — cuando haya histórico suficiente:**

- Sección "Surtidos anteriores" (SEO long-tail por fruta).
- Reviews reales ligadas a pedidos.

**v2 — marketing:**

- Landing SEM específica por fruta (ej. `/caja-cerrada/mango`) que reutiliza la PDP con hero personalizado.
- Regalo — formato envoltorio + mensaje.

**Iteración técnica:**

- Internacionalización (ES / CAT / EN).
- Accesibilidad AA completa (contraste, focus, ARIA en selector y galería).
- Core Web Vitals — LCP < 2,5 s con hero image optimizada.

---

## Apéndice — vínculos

- Home audit (origen del selector unificado): `docs/home-audit-product-lens.md`.
- Auditoría componentización: `.claude/memory/audit_componentization_2026-04-23.md`, página Figma `🧩 Componentización — Auditoría` (`595:4888`).
- Sistema tipográfico: `.claude/memory/typography_system.md`, página Figma `🔤 Typography` (`602:5186`).
- Contexto de negocio: `.claude/memory/business_context.md`.
- PRD hermano: `docs/prd-pdp-caja-personalizable.md`.
