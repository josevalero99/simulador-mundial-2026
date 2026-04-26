# Cart + Checkout — Design Spec (v1.5)

**Fecha:** 2026-04-26
**Autor:** Jose Valero (con asistencia Claude)
**Estado:** Pendiente revisión usuario · Implementación tras aprobación
**Scope:** Diseño funcional + visual de Cart drawer, página `/carrito`, Checkout single-page y página de confirmación.

---

## 1. Contexto y alcance

Bionta v1.5 lanza con suscripción al launch. Esta spec cierra los huecos pendientes en el PRD v1 (`prd-cart.md` y `prd-checkout.md` quedaban marcados como pendientes en `prd-v1-alcance.md`).

### Cubre
- **Cart drawer** (acceso rápido desde icono nav o tras "Añadir al carrito")
- **Página `/carrito`** (gestión completa del carrito)
- **Checkout single-page** (`/checkout`)
- **Página de confirmación** (`/pedido/[id]`)
- Flujos de compra única + suscripción + mixed cart
- Variantes guest vs logueado, única vs suscripción

### NO cubre (fuera de scope v1.5 sprint actual)
- Mobile (390) — segunda pasada tras validar Desktop
- Edge cases avanzados — payment failed, sesión expirada, sin stock, fuera de zona — segunda pasada
- Multi-suscripción (varias suscripciones por cliente)
- Wallets distintas a Apple Pay / Google Pay (Bizum, Klarna, etc.)
- Add-ons (chocolate, kombucha, etc.) — no existen en v1.5
- Compras "como regalo" con dirección distinta a facturación múltiple

---

## 2. Decisiones tomadas (resumen)

| Tema | Decisión | Notas |
|---|---|---|
| Arquitectura checkout | **Single-page** | Stripe/Shopify style. Maximiza conversión |
| Acceso al carrito | **Drawer + página `/carrito`** | Drawer = primary, página = gestión completa |
| Auth flow | **Guest puro + auto-cuenta para suscripción** | Magic link al confirmar suscripción |
| Pasarela | **Stripe** (Payment Element + Subscriptions Billing) | Apple Pay / Google Pay express |
| Modelo carrito | **Multi-item (única) + max 1 suscripción** | Mixed cart permitido |
| Upsell suscripción | **Por línea en cart** | Banner inline bajo cada item único |
| Promo codes | **En checkout summary** (colapsado) | También accesibles en página `/carrito` |
| Pagos suscripción | Stripe Subscriptions con primer cobro junto al PaymentIntent de la única | Tarjeta · SEPA opcional |

---

## 3. Sección 1 — Cart Drawer

### Anatomía
- **Posición:** drawer lateral 440px, desplegado desde la derecha
- **Fondo:** cream `#FAF6EF` 78% opacity con backdrop blur
- **Z-index:** sobre la página actual con overlay oscuro 40%
- **Cierre:** click fuera, botón `×`, ESC

### Estructura
1. **Header sticky** — "Carrito (N)" + botón cerrar
2. **Body scrolleable** — items + (opcional) banner próximo envío suscripción
3. **Footer sticky** — desglose totales + CTA primary "Tramitar pedido →" + link "Ver carrito completo"

### Estados

**A · Vacío**
- Icono central en círculo verde (fruta tropical)
- Headline "Tu carrito está vacío"
- Body "Empieza a llenarlo con tus cajas favoritas"
- CTA "Ver cajas" → `/menus-semanales` o tienda

**B · 1 caja única**
- Item card con thumb 64×64, título, pill "Compra única" (gris cream), precio, stepper, link "Quitar"
- **Upsell banner** debajo del stepper: "Conviértela en suscripción y ahorra 10% siempre" + CTA "Activar →"
- Footer: subtotal + envío + total + CTA

**C · 1 suscripción**
- Item card con pill "Suscripción · cada N sem." (verde `#2F4A2B` filled)
- Precio: tachado PVP arriba, precio con 10% off abajo
- Acciones: link "Cambiar frecuencia" + "Quitar" (no hay stepper — cantidad fija = 1)
- **Promo banner**: "📅 Próximo envío estimado: jueves 30 abr"
- Footer: "Primer cobro hoy" + "Cancela cuando quieras desde Mi Cuenta" + CTA "Tramitar suscripción →"

**D · Mixed (2 únicas + 1 suscripción)**
- Items agrupados por sección: label uppercase "Compra única" → N items con pill once · label "Suscripción" → 1 item con pill subs
- Footer: desglose en 4 líneas (subtotal único · suscripción 1ª caja · envío · total)

### Reglas de negocio
- **Stepper** solo en items únicos. Suscripciones tienen cantidad fija = 1.
- **Upsell** aparece solo en items únicos. Si ya hay suscripción en el cart, NO aparece upsell en otros items (max 1 suscripción).
- **Si añade segunda suscripción**, modal de confirmación: "Ya tienes una caja en suscripción. ¿Reemplazar?"
- **Pill Compra única** es discreto (cream con texto muted). Pill Suscripción es prominente (verde filled).

### Componentes DS implicados
- Nuevo: `Cart / Drawer` (organism)
- Nuevo: `Cart / Item` (3 variants: with-stepper, subscription, mixed-row)
- Reutiliza: `QtyStepper`, `Pill / Subscription`, `ProductTag`, `Button / Primary`

---

## 4. Sección 2 — Página `/carrito`

### Anatomía
- **Layout 1440** con padding lateral 120
- **Nav** (logueado o no) sticky arriba
- **Breadcrumb** "Inicio › Carrito"
- **Page header** "Tu carrito" + subtítulo descriptivo
- **Grid 2 columnas:** items 720 izquierda · summary sticky 360 derecha

### Bloques izquierda (items)
- **Agrupación** por sección igual que el drawer ("Compra única" / "Suscripción")
- **Item card** con más espacio: thumb 96×96, título 18 Bold, sub-descripción ("Surtido tropical · 7-9 frutas"), pill, precio
- Acciones más visibles:
  - "Editar selección" (solo personalizables → vuelve a PDP con la selección actual)
  - "Cambiar frecuencia" (solo suscripción)
  - "Quitar"
- **Upsell expandido** con selector de frecuencia inline: dropdown "cada 2 semanas / cada semana" + CTA "Activar →"
- **Cross-sell card** al final (verde): "¿Quieres añadir otra caja?" + visual + CTA "Ver tienda →"

### Bloques derecha (summary sticky)
- **Title** uppercase "RESUMEN"
- **Desglose:**
  - Subtotal compra única
  - Suscripción (1ª caja)
  - Línea verde "Ahorro suscripción" con valor negativo (`−4,95 €`)
  - Envío
  - Total hoy
- **Info microcopy** con iconos:
  - 📅 Próximo cobro estimado (si hay suscripción)
  - 🛡 Cancela cuando quieras · Sin permanencia
- **CTA primary** "Tramitar pedido →"
- **Promo code colapsado:** "¿Tienes código de descuento? ▼" (expande input + botón Aplicar)

### Comportamiento
- **Sticky summary**: al hacer scroll, summary se mantiene visible (top: 24px)
- **Edición inline**: cambiar cantidad / quitar item recalcula summary instantáneo (sin reload)
- **Upsell apply**: convertir item único en suscripción muestra modal corto de confirmación con frecuencia y descuento aplicado, luego mueve el item a la sección Suscripción

### Componentes DS implicados
- Nuevo: `Cart / Page` (organism wrapper)
- Nuevo: `Cart / Item / Expanded` (variant del Cart Item)
- Nuevo: `Cart / Cross-sell card`
- Nuevo: `Cart / Summary` (con desglose extendido)
- Reutiliza: `Nav`, `Breadcrumb`, `PageHeader`, `Button / Primary`, `Footer`

---

## 5. Sección 3 — Checkout single-page (`/checkout`)

### Anatomía
- **Layout 1440** con padding lateral 120
- **Nav simplificada**: solo logo Bionta + microcopy "🔒 Pago seguro · Stripe" (sin items de menú — reduce fugas)
- **Breadcrumb** "Carrito › Finalizar compra"
- **Page header** "Finalizar compra" + subtítulo
- **Grid 2 columnas:** form 720 izquierda · summary sticky 360 derecha

### Express checkout (top del form)
- Card blanca con label "PAGO RÁPIDO"
- 2 botones grid:
  - **Apple Pay** (negro, "Pay" con logo)
  - **Google Pay** (blanco con stroke, "G Pay")
- Tras click → Stripe gestiona el flujo completo (datos contacto + dirección + pago) en un único modal nativo. Vuelve a la confirmación.
- **Divider** "o paga con tarjeta" debajo

### Form steps (lineales, NO colapsadas)

**Paso 1 — Datos de contacto**
- Header: "PASO 1" eyebrow + "Datos de contacto" + link discreto derecha "¿Ya tienes cuenta? **Iniciar sesión**" (abre modal Auth/Login)
- Campos:
  - Email (full width) + helper "Te enviaremos la confirmación a este email"
  - Nombre + Apellido (grid 2 columnas)
  - Teléfono (full width)

**Paso 2 — Dirección de envío**
- Header: "PASO 2" + "Dirección de envío"
- Campos:
  - Search "Buscar dirección" con autocomplete Google Places + helper
  - Calle y número + Piso/puerta (grid 2 cols)
  - Código postal + Ciudad (grid 2 cols)
- Checkbox: "Usar la misma dirección para facturación" (default checked)
- Si el usuario está logueado y tiene direcciones guardadas: bloque arriba "Usar dirección guardada" → dropdown selector (diseño detallado en próxima iteración)

**Paso 3 — Método de pago**
- Header: "PASO 3" + "Método de pago" + label derecha "🔒 Stripe"
- **Stripe Payment Element** mounted directly:
  - Tabs: Tarjeta (default) · SEPA (solo si hay suscripción)
  - Form de Stripe nativo: nº tarjeta + MM/AA + CVC
  - Stripe se encarga de validación, 3DS, etc.

**Banner suscripción** (solo si hay suscripción en cart)
- Card con border yellow `#FFC200` y bg amarillo claro
- Headline "📅 Esto incluye una suscripción"
- Body: "**[Nombre caja]** · cada N semanas · Primer cobro hoy · próximo cobro estimado **[fecha]** · Cancela cuando quieras desde Mi Cuenta"

**Paso 4 — Términos**
- Checkbox "Acepto los Términos y Condiciones y la Política de Privacidad. Al confirmar la suscripción autorizo cobros recurrentes a mi método de pago."
- Required para enviar

**CTA final**
- Botón Primary full-width "Pagar 122,55 € →" (texto dinámico según total y modo)
  - Solo única: "Pagar X €"
  - Solo suscripción: "Activar suscripción · X €"
  - Mixed: "Pagar X €"
- Helper bajo CTA: "🔒 Tu pago está protegido por Stripe · 256-bit SSL"

### Bloques derecha (summary sticky)
- **Title** "RESUMEN DEL PEDIDO"
- **Items list** (compactos): thumb 48×48 + título + sub "×N · única/cada N sem" + pill + precio
- **Desglose:**
  - Subtotal
  - Línea verde Ahorro suscripción (negativo)
  - Envío
  - Total hoy (bold 16)
- **Trust microcopy** en bloque verde claro:
  - 🛡 Cancela cuando quieras sin penalización
  - 📦 Envío gratuito en este pedido
  - 💚 Frescura garantizada · 24-48h
- **Promo code** input + botón "Aplicar" (colapsado al pie del summary, NO expandido por defecto)

### Lógica de pago Stripe
- Si solo única: **PaymentIntent** ⇒ confirmación
- Si solo suscripción: **Subscription create** con `payment_behavior=default_incomplete` ⇒ confirmar PaymentIntent del primer cobro ⇒ confirmación
- Si mixed: **PaymentIntent** del subtotal único + **Subscription** con primer cobro a la misma tarjeta ⇒ confirmación
- **Apple/Google Pay**: Stripe Express Checkout Element gestiona ambos casos transparente

### Componentes DS implicados
- Nuevo: `Checkout / Page` (organism wrapper)
- Nuevo: `Checkout / Section` (numerada con eyebrow)
- Nuevo: `Checkout / ExpressButtons` (con Apple/Google Pay)
- Nuevo: `Checkout / SubscriptionBanner`
- Nuevo: `Checkout / Summary` (versión compacta con items)
- Reutiliza: `Nav` (simplificada), `Breadcrumb`, `PageHeader`, `Field`, `Input`, `Checkbox`, `Button / Primary`

---

## 6. Sección 4 — Confirmación (`/pedido/[id]`)

### Anatomía
- **Layout 1440** con padding 120
- **Nav** completa
- **Hero celebratorio** verde a full width
- **Grid 2 columnas:** detalle 720 izquierda + aside 360 derecha
- **Bottom CTAs** centrados al final

### Hero
- Bg verde `#2F4A2B` con halos amarillos sutiles (radial gradients)
- Icono check 72×72 amarillo redondo
- Eyebrow "PEDIDO CONFIRMADO" yellow uppercase
- Title 36 Bold "¡Gracias, María! 🥭"
- Sub: "Hemos recibido tu pedido. Te hemos enviado la confirmación a **maria@email.com**"
- Order number "Pedido #BNT-2026-0142 · 26 abr 2026"

### Bloques izquierda

**Account creation banner** (solo guest+suscripción)
- Bg amarillo gradient
- Icono llave en círculo blanco
- Title "Activa tu cuenta para gestionar la suscripción"
- Body explica magic link enviado + opción crear contraseña
- CTA "Crear contraseña →" (abre modal Auth/Registro precompletado)

> Variante guest + única: banner gris suave "Crea una cuenta para hacer seguimiento" (no obligatorio).

**Subscription card** (solo si hay suscripción)
- Border yellow + bg blanco
- Pill verde "Suscripción activa"
- Title "Caja Personalizable Grande"
- Grid 2×2 con 4 datos:
  - Frecuencia
  - Próximo cobro
  - Próximo envío (cobro + 1 día)
  - Precio recurrente (con "10% off")
- Acciones inline: "Pausar · Saltar próximo envío · Cambiar · Cancelar"

**Resumen pedido**
- Items con pills + precios
- Bloque desglose 2×2: SUBTOTAL · ENVÍO · AHORRO SUSCRIPCIÓN (verde) · TOTAL COBRADO

**Detalles**
- Bloque 2 columnas: DIRECCIÓN DE ENVÍO + PAGO (tarjeta •••• 4242 + fecha cobro)

### Bloques derecha (aside)

**Tracking card** (verde)
- Title "📦 Tu primera caja llega..."
- ETA grande yellow "Jueves 30 abril"
- Body explicativo
- CTA "Ver estado del pedido →"

**Help block** (blanco)
- Title "¿Necesitas algo?"
- 3 rows: Email · Teléfono · Centro de ayuda

### Bottom CTAs
- Primary "Ir a Mi Cuenta →"
- Secondary "Seguir comprando"

### Variantes implícitas

| Variante | Account banner | Subs card | Hero copy |
|---|---|---|---|
| Guest + única | Gris suave (opcional) | NO | "¡Gracias!" |
| Guest + suscripción | Yellow (magic link) | SÍ destacado | "¡Bienvenida a tu suscripción!" |
| Logueado + única | NO | NO | "¡Gracias!" |
| Logueado + suscripción | NO (ya tiene cuenta) | SÍ destacado | "¡Tu suscripción está activa!" |
| Mixed | Yellow si guest | SÍ destacado | "¡Gracias!" |

### Componentes DS implicados
- Nuevo: `OrderConfirmation / Hero`
- Nuevo: `OrderConfirmation / SubscriptionCard`
- Nuevo: `OrderConfirmation / TrackingCard`
- Nuevo: `OrderConfirmation / AccountBanner` (variants: yellow magic-link, gris opcional)
- Reutiliza: `Nav`, `Footer`, `Button / Primary`, `Button / Secondary`

---

## 7. Componentes nuevos al DS (resumen)

A añadir a la sección `🧩 Components — v1` (`683:8218`) tras implementación:

### Molecules
- `Cart / Item` (variants: drawer-row, expanded-row, mixed-row sin stepper)
- `Cart / Summary` (variants: compact drawer · extended page · checkout-aside)
- `Checkout / Section` (numerada con eyebrow PASO N · slot para children)
- `Checkout / ExpressButtons` (Apple Pay + Google Pay layout)
- `Checkout / SubscriptionBanner` (border yellow + body)

### Organisms
- `Cart / Drawer`
- `Cart / Page` (wrapper)
- `Cart / Cross-sell card`
- `Checkout / Page` (wrapper)
- `OrderConfirmation / Hero`
- `OrderConfirmation / SubscriptionCard`
- `OrderConfirmation / TrackingCard`
- `OrderConfirmation / AccountBanner`

---

## 8. Casos de uso end-to-end (cubiertos)

Mapa contra los CU del `prd-v1-alcance.md`:

- **CU-1** Comprar caja cerrada → Cart drawer 1-item única → /checkout single-page → confirmación guest+única
- **CU-2** Comprar caja personalizable → mismo flujo, item con "Editar selección"
- **CU-3** Registrarse desde checkout → "Iniciar sesión" en Paso 1 → modal Auth (existente)
- **CU-11** Suscribirse desde landing → /caja-cerrada con `?suscripcion=true` → Cart drawer 1-item suscripción → /checkout con banner suscripción → confirmación guest+suscripción con magic link
- **CU-12** Suscribirse desde PDP → toggle activo en PDP → mismo flujo que CU-11

---

## 9. Open issues (post-design)

Items que el design valida pero requieren decisiones operativas/técnicas para implementar:

1. **Frecuencias soportadas v1.5**: el design asume "cada semana" y "cada 2 semanas". ¿Queremos también "cada 4 semanas"? Stripe Subscriptions soporta cualquiera; es decisión de producto.

2. **Tarifas envío**: el design muestra "Gratis" en suscripción y "4,90 €" en única pequeña. Se necesita matriz de envíos por zona/CP definida (P0 en `prd-v1-alcance.md` §279).

3. **SEPA para suscripción**: ¿activar tab SEPA en Payment Element? Reduce coste de transacción (~0.35 € fijo vs % tarjeta) pero añade fricción. Recomendación: activar tras validar que el público lo prefiere.

4. **Apple Pay / Google Pay merchant setup**: requiere dominio verificado en Stripe + cert Apple. ~1 día de trabajo backend antes del lanzamiento.

5. **Magic link template**: el email de auto-cuenta tras suscripción es uno de los 8 emails transaccionales. Falta copy + diseño (cubierto en `prd-emails-transaccionales.md`).

6. **Promo codes en cart vs checkout**: el design los pone en checkout. ¿Permitimos también en cart drawer? Decisión de UX (más fricción por validación AJAX). Recomendación: solo en checkout para v1.5.

7. **Out of stock en checkout**: si el último item se agota mientras el usuario llena el form, ¿qué pasa? Necesita micro-flow (notificar + permitir continuar sin ese item). Edge case fuera de scope happy path.

8. **Direcciones múltiples (logueado)**: el design menciona dropdown "Usar dirección guardada" pero no la diseñamos. Iteración tras login flow validado.

---

## 10. Métricas de éxito (acordes al PRD)

- **CR Cart → Checkout**: ≥ 60%
- **CR Checkout → Pago**: ≥ 70% (criterio v1)
- **% checkouts iniciados con upsell suscripción aplicado en cart**: > 8% (hipótesis nueva)
- **Tasa de conversión Apple Pay / Google Pay**: > 30% del express
- **Tasa de auto-creación de cuenta tras suscripción guest**: ≥ 80% (clicks en magic link)

---

## 11. Roadmap implementación (alto nivel)

Para `writing-plans` skill posterior. NO ejecutar todavía.

1. **Backend**:
   - Modelo Cart (en sesión + persistido cuando logueado)
   - API `/cart` (POST/GET/PATCH/DELETE)
   - Stripe SDK setup (PaymentIntent + Subscriptions + Webhooks)
   - API `/checkout/create` que monte PaymentIntent + Subscription según items
   - Webhook `payment_intent.succeeded` y `customer.subscription.created` → crea Order + Subscription en DB
   - API `/orders/[id]` para confirmación

2. **Frontend**:
   - Estado global Cart (Zustand/Redux según stack del proyecto)
   - Cart drawer (componente)
   - Página /carrito
   - Página /checkout con Stripe Payment Element
   - Página /pedido/[id]
   - Modal Auth integrado en Paso 1 del checkout

3. **Componentes DS**:
   - Crear los componentes nuevos en sección Figma `🧩 Components — v1`
   - Integrar con Storybook (o equivalente)

4. **Backoffice**:
   - Actualizar módulo Pedidos para soportar pedidos mixed (única + suscripción) → requiere ajustes en módulo Suscripciones

5. **QA**:
   - Tests E2E de los 5 CU canónicos
   - Test pagos en sandbox + 10 transacciones reales pre-launch (criterio v1)
