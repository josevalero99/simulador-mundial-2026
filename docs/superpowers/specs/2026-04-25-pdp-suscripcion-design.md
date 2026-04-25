# Spec — Suscripción (Landing `/menus-semanales` + Toggle en PDPs)

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Pantallas:** Landing de suscripción (`/menus-semanales`) + modificaciones a PDPs Cerrada y Personalizable
- **Documentos afectados:** `docs/prd-v1-alcance.md`, `docs/prd-pdp-caja-cerrada.md`, `docs/prd-pdp-caja-personalizable.md`, `docs/prd-mi-cuenta.md`, `docs/prd-checkout.md` (pendiente)
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-25
- **Estado:** Draft v1 — pendiente de revisión

---

## 1. TL;DR

Cerramos la decisión "v1 vs v1.5" en favor de **v1.5** (suscripción al launch). Diseñamos dos artefactos:

1. **Landing `/menus-semanales`** — sales/explainer page que pitchea el modelo de suscripción y deriva al PDP correspondiente. Es la página que faltaba en el nav.
2. **Toggle dentro de los PDPs existentes** — selector "Una vez" vs "Suscríbeme" como primera decisión del Hero PDP.

**Modelo de suscripción cerrado:**

- **Frecuencias:** semanal o quincenal (default quincenal).
- **Descuento:** 10% off recurrente sobre cada envío + envío gratis siempre.
- **Bienvenida:** 15% off adicional al primer envío (sumado: ~25% off primera caja).
- **Flexibilidad:** modalidad fija al suscribirse; tamaño y skip flexibles desde Mi Cuenta.
- **Compromiso:** ninguno — cancelar en 1 click desde Mi Cuenta.

**No entra en este spec:** mecánica de checkout suscripción (vive en `prd-checkout.md` pendiente), bloque "Mi suscripción" de Mi Cuenta (vive en `prd-mi-cuenta.md`), pricing dinámico backend (asumido como dependencia).

---

## 2. Decisiones cerradas

| Decisión | Valor | Justificación |
|---|---|---|
| **v1 vs v1.5** | v1.5 (suscripción al launch) | Probabilidad de supervivencia Y2 sube de 25-30% a 55-65%; LTV/CAC pasa de 1.37x a 4.8-8.1x (`docs/plan-negocio-v1.md`) |
| **Arquitectura IA** | Híbrido — landing dedicada + toggle en PDPs | Nav "Menús semanales" tiene destino real; SEO específico; decisión final ocurre en el PDP |
| **Ruta de la landing** | `/menus-semanales` | Alineada con el texto del nav existente; SEO mejor que `/suscripcion` para fruta tropical |
| **Frecuencias** | Semanal + Quincenal (default Quincenal) | Mensual rompe moat de frescura; quincenal mejora retención benchmark |
| **Descuento recurrente** | 10% off + envío gratis siempre | Patrón Wild/Mob; benchmark de conversión validado |
| **Bienvenida** | +15% off solo primer envío (acumulable) | Convierte sin necesitar compromiso |
| **Flexibilidad** | Modalidad fija; tamaño + skip flexibles | Forecasting limpio para equipo de fruta; cubre 80% del churn por flexibilidad |
| **Compromiso** | Ninguno — cancela cuando quieras | Producto premium honesto; benchmark conversión > compromiso forzado |
| **Color CTA suscripción** | Verde Bionta `#2f4a2b` (vs amarillo de compra única) | Diferenciación visual de flujo en toda la web |

---

## 3. Landing `/menus-semanales`

### 3.1 Stack de bloques (orden de scroll, desktop 1440 canónico)

| # | Bloque | Rol |
|---|--------|-----|
| 1 | Nav (existente) | — |
| 2 | **Hero** | Pitch + CTA primario que ancla al bloque 4 |
| 3 | **Cómo funciona** | 3 pasos — eliges, recibes, mandas tú |
| 4 | **Elige tu modalidad** | Selector cerrada/personalizable; deriva al PDP con `?suscripcion=true` |
| 5 | **Por qué suscribirte** | 4 cards de beneficios — diferenciador honesto |
| 6 | **Cuánto ahorras** | Comparativa puntual vs suscrito + ahorro a 6 meses |
| 7 | **FAQ** | 6 objeciones específicas de suscripción |
| 8 | **CTA final** | Banner verde con botón que ancla al bloque 4 |
| 9 | Footer (existente) | — |

**Excluidos intencionalmente (YAGNI):**

- "Esta semana recibes" — vive en los PDPs, sería redundante.
- Testimonios — todavía no hay suscriptores reales.
- Trust badges separados — el bloque 5 ya hace ese trabajo.
- Calculadora interactiva de ahorro — bloque 6 estático es más eficaz para B2C.

### 3.2 Bloque 2 — Hero

**Layout:** dos columnas. Izquierda: imagen + 3 badges sobre la imagen. Derecha: copy + CTA.

**Copy:**

- **Title:** `Fruta tropical en tu casa, cada semana.` — Clash Display Medium 56-64.
- **Subtítulo:** `Suscríbete y deja de pensar en fruta. Llega lista, fresca y de temporada.` — Regular 18-20.
- **CTA primario:** `Empieza tu suscripción` — amarillo `#ffc200`, full-width contenedor derecho.
- **Microcopy bajo CTA:** `Primera caja con 25% off · 10% siempre · Sin permanencia` — Regular 13, color `#7a7366`.

**Badges sobre imagen** (píldoras horizontales, fondo cream warm semitransparente, radius 999):
- `🔄 10% siempre`
- `📦 Envío gratis`
- `✕ Sin permanencia`

**Comportamiento del CTA:** scroll suave al bloque 4 "Elige tu modalidad".

### 3.3 Bloque 3 — Cómo funciona

**Layout:** 3 cards horizontales, ancho contenedor 1200px max.

**Cards:**

1. **`1. Eliges tu caja`** — *"Cerrada o personalizable, en pequeña o grande, semanal o quincenal."*
2. **`2. Recibes en tu día`** — *"Fruta tropical de temporada, envío refrigerado a tu domicilio en 24-48 h."*
3. **`3. Tú mandas`** — *"Pausa, salta o cancela en 1 click. Sin permanencia."*

**Specs:**
- Header del bloque: `Cómo funciona` Clash Display Medium 36, centrado, color verde Bionta `#2f4a2b`.
- Subtítulo: `En 3 pasos y sin sorpresas.` Regular 16, gris `#7a7366`.
- Cards: fondo cream warm `#fbf6ef`, radius 16, padding 32, gap 24.
- Iconos: 64×64 ilustrados (placeholders aceptables si aún no hay set). Color verde Bionta.
- Title de paso: Clash Display Semibold 22.
- Body: Regular 15, color text dark `#1e1e1e`, 3-4 líneas.

### 3.4 Bloque 4 — Elige tu modalidad

**Es el bloque que convierte.** El cliente decide aquí y cae en el PDP correspondiente.

**Layout:** dos cards lado a lado, ancho contenedor 1100px.

**Card "Caja Cerrada":**

- Imagen aspect 4:3 superior, radius 12.
- Title: `Caja Cerrada` Clash Display Semibold 28.
- Subtítulo: `Surtido tropical por Bionta` Regular 15 gris.
- Precios: `Pequeña 26,10€ · Grande 44,10€` Semibold 18 + `/envío · 10% off vs puntual` Regular 13 gris.
- Bullets: `✓ Sorpresa cada envío` / `✓ Mejor relación calidad/precio` (tick verde Bionta, texto Regular 14).
- CTA: `Suscribirme a Cerrada` amarillo full-width.
- Click → `/caja-cerrada?suscripcion=true&frecuencia=quincenal`.

**Card "Caja Personalizable":**

- Misma estructura.
- Title: `Caja Personalizable`.
- Subtítulo: `Tú eliges qué fruta llevas`.
- Precios: `Pequeña 28,80€ · Grande 49,50€` (10% off de 32€/55€).
- Bullets: `✓ Eliges dentro del set semanal` / `✓ Control total del surtido`.
- CTA: `Suscribirme a Personalizable` amarillo full-width.
- Click → `/caja-personalizable?suscripcion=true&frecuencia=quincenal`.

**Specs comunes:**
- Cards: fondo blanco, borde 1px `#e6dfce`, radius 16, padding 32, gap 24 entre cards.

### 3.5 Bloque 5 — Por qué suscribirte

**Layout:** 4 cards en grid (4×1 desktop, 2×2 tablet, 1×4 mobile).

**Cards:**

| # | Title | Body |
|---|---|---|
| 1 | `10% siempre` | *"Sobre cada caja, no solo la primera."* |
| 2 | `Envío gratis` | *"En todos tus envíos. Siempre."* |
| 3 | `Sin permanencia` | *"Cancelas en 1 click desde Mi Cuenta."* |
| 4 | `Pausa, salta o cancela` | *"Vacaciones, semana de poca fruta, lo que sea."* |

**Specs:**
- Header del bloque: `Por qué suscribirte` Clash Display Medium 36, centrado.
- Subtítulo: `Beneficios reales, no permanencias disfrazadas.` Regular 16, gris.
- Cards: fondo cream warm `#fbf6ef`, sin borde, radius 16, padding 28, gap 16.
- Iconos: 48×48, color verde Bionta. Sugerencias: porcentaje, caja con tilde, X con círculo, pause/skip.
- Title: Clash Display Semibold 18, una línea.
- Body: Regular 14, dos a tres líneas.

**Decisión de copy clave:** Card 1 dice intencionalmente *"Sobre cada caja, no solo la primera"* para diferenciar de competidores que ofrecen "10% en tu primera caja" como bienvenida. En Bionta el 10% es **estructural**, recurrente.

### 3.6 Bloque 6 — Cuánto ahorras

**Layout:** tabla simple, dos columnas (`Compra puntual` / `Suscripción`), ancho 900px max.

**Filas:**

| Producto | Compra puntual | Suscripción | Δ |
|---|---|---|---|
| **Caja Cerrada** | | | |
| Pequeña | 29 € | 26,10 € | -10% |
| Grande | 49 € | 44,10 € | -10% |
| **Caja Personalizable** | | | |
| Pequeña | 32 € | 28,80 € | -10% |
| Grande | 55 € | 49,50 € | -10% |
| **Envío** | 4,90 € | Gratis | -4,90 € |
| **Permanencia** | — | Ninguna | — |

**Filas destacadas (fondo cream warm, padding extra):**

- *Ahorro a 6 meses (Cerrada Grande quincenal, 13 envíos): **127,40 €***
- *Ahorro a 6 meses (Cerrada Grande semanal, 26 envíos): **254,80 €***

> Cálculo: por cada envío de Cerrada Grande, una compra puntual cuesta 49€ + 4,90€ de envío = 53,90€. La suscripción cuesta 44,10€ con envío gratis. Ahorro por envío: 9,80€. Multiplicado por la cadencia de 6 meses.

**Specs:**
- Header del bloque: `Cuánto ahorras` Clash Display Medium 36, centrado.
- Subtítulo: `La suscripción siempre sale más barata. Sin trucos.` Regular 16, gris.
- Tabla: fondo blanco, borde 1px `#e6dfce`, radius 16, padding 32.
- Header de tabla: Clash Display Semibold 16 gris.
- Categorías de modalidad: Semibold 15 negro, alineadas izquierda.
- Tamaños indentados 16px, Regular 14.
- Columna "Compra puntual": Regular 15 gris `#7a7366`.
- Columna "Suscripción": Semibold 15 verde Bionta `#2f4a2b`.
- Etiqueta `-10%`: pill amarilla pequeña Semibold 11.

**Pricing asumido (confirmar con números reales):** Cerrada 29/49€, Personalizable 32/55€. Si el pricing real difiere, actualizar la tabla.

### 3.7 Bloque 7 — FAQ específica de suscripción

**Layout:** acordeón vertical, ancho 800px max, items separados con gap 8.

**Las 6 preguntas:**

1. **`¿Puedo cancelar cuando quiera?`** *"Sí. En 1 click desde Mi Cuenta. Sin permanencia, sin penalización, sin formularios. Si cancelas antes del próximo envío, no se te cobra."*
2. **`¿Puedo saltarme un envío si voy de vacaciones?`** *"Sí. Desde Mi Cuenta puedes saltar uno o varios envíos puntuales sin cancelar tu suscripción. Cuando vuelvas, sigues con tu cadencia."*
3. **`¿Puedo cambiar de tamaño?`** *"Sí. Desde Mi Cuenta cambias entre Pequeña y Grande cuando quieras. El cambio aplica al siguiente envío. La modalidad (cerrada/personalizable) sí queda fija al suscribirte — para cambiarla, cancela y vuelve a suscribirte."*
4. **`¿Y si una semana no me gusta lo que llega?`** *"Si no estás contenta, escríbenos y lo solucionamos: cambio, crédito o reembolso del envío. Es así de simple."*
5. **`¿Qué fruta llega cada semana?`** *"Depende de la temporada — ese es el punto. Cada semana mostramos en /caja-cerrada qué surtido va. En personalizable ves el set disponible al construir tu caja."* + link `Ver el surtido de esta semana →` al PDP cerrada.
6. **`¿Qué pasa si no hay stock de mi modalidad?`** *"Te avisamos por email 48h antes del envío y te ofrecemos: recibir la otra modalidad (sin penalización), saltar el envío o cancelar la suscripción. Tú decides."*

**Specs:**
- Header del bloque: `Preguntas frecuentes` Clash Display Medium 36, centrado.
- Subtítulo: `Si no encuentras tu duda, escríbenos a hola@bionta.com.` Regular 14, gris.
- Acordeón: fondo blanco, borde 1px `#e6dfce`, radius 12, padding 24, gap 8.
- Pregunta: Clash Display Semibold 16 alineada izquierda + icono `[+]` 16×16 verde Bionta a la derecha.
- Estado expandido: icono → `[−]`, fondo card cream warm, respuesta visible padding superior 16, body Regular 15 line-height 1.5.
- Animación: 200ms ease-in-out.

### 3.8 Bloque 8 — CTA final

**Layout:** banner full-bleed, fondo verde Bionta `#2f4a2b`, padding vertical 80, contenido centrado max 720.

**Copy:**
- Header: `Empieza tu suscripción` Clash Display Medium 48, color cream warm `#f1ebde`.
- Subtítulo: `Primera caja con 25% off · 10% siempre · Envío gratis` Regular 18, color cream warm 80% opacity.
- CTA: `Elegir mi caja` amarillo `#ffc200`, texto negro Semibold 16, radius 16, padding 18/40, sombra suave.
- Microcopy: `Cancela cuando quieras` Regular 13 cream warm 60% opacity.
- Comportamiento: scroll suave al bloque 4.

---

## 4. Toggle dentro de los PDPs existentes

### 4.1 Dónde se inserta

Dentro del **Hero PDP** de Cerrada y Personalizable, **encima del selector de tamaño actual**. Pasa a ser la primera decisión del Hero.

### 4.2 Layout (modificación al Hero PDP)

```
┌──────────────┐   CAJA CERRADA
│              │   Surtido tropical por Bionta
│  [galería]   │
│              │   ¿Cómo la quieres?                          ← NUEVO
│  [dot dot]   │   ┌──────────────┐  ┌──────────────┐         ← NUEVO
│              │   │ ◯ Una vez    │  │ ⦿ Suscríbeme │         ← NUEVO
│              │   │   49 €       │  │   44,10€/env │         ← NUEVO
│              │   │              │  │   10% siempre │         ← NUEVO
│              │   │              │  │   + envío gratis│       ← NUEVO
│              │   └──────────────┘  └──────────────┘         ← NUEVO
│              │                                              ← NUEVO
│              │   Frecuencia (solo si Suscríbeme):           ← NUEVO
│              │   ◯ Semanal   ⦿ Quincenal                   ← NUEVO
│              │                                              ← NUEVO
│              │   ( ) Pequeña · 26,10€  (●) Grande · 44,10€  ← actualizado
│              │
│              │   [ EMPEZAR MI SUSCRIPCIÓN — 44,10€/envío ] ← actualizado
└──────────────┘   ✓ Envío refrigerado · Sin permanencia      ← actualizado
```

### 4.3 Specs del toggle "¿Cómo la quieres?"

- Header: `¿Cómo la quieres?` Clash Display Semibold 14, alineado izquierda.
- Layout: dos cards lado a lado, mismo ancho, gap 12.
- **Card "Una vez":** fondo blanco, borde 1px `#e6dfce`, radius 12, padding 16. Radio button izquierdo. Title `Una vez` Semibold 15. Precio `49€` Regular 14 gris.
- **Card "Suscríbeme" (activa):** fondo cream warm `#fbf6ef`, borde 2px verde Bionta `#2f4a2b`. Title `Suscríbeme` Semibold 15. Precio `44,10€/envío` Regular 14 verde Bionta. Microcopy `10% siempre + envío gratis` Regular 12 gris.
- Radio buttons: 16×16, verde Bionta cuando seleccionado, gris `#d9d2bf` cuando no.
- Comportamiento: click cambia selección; la otra se desselecciona.

### 4.4 Selector de frecuencia (condicional)

- Aparece **solo si "Suscríbeme" está activo**. Si está inactivo, no existe.
- Layout: dos radio buttons inline horizontales, gap 24.
- Default: `Quincenal`.
- Animación: fade-in 200ms al aparecer, fade-out al desaparecer.

### 4.5 Cambios dinámicos en el resto del Hero

**Selector de tamaño:** los precios mostrados cambian según el toggle.

| Modo | Pequeña | Grande |
|---|---|---|
| Una vez | 29 € | 49 € |
| Suscríbeme | 26,10 € | 44,10 € |

**CTA primario:** texto y color cambian dinámicamente.

| Modo | Texto | Color |
|---|---|---|
| Una vez | `AÑADIR AL CARRITO — 49€` | Amarillo `#ffc200` |
| Suscríbeme | `EMPEZAR MI SUSCRIPCIÓN — 44,10€/envío` | Verde Bionta `#2f4a2b` |

**Trust microcopy debajo del CTA:**

| Modo | Texto |
|---|---|
| Una vez | `Envío refrigerado · Entrega 24-48h` |
| Suscríbeme | `Envío refrigerado · Sin permanencia · Cancela cuando quieras` |

### 4.6 Comportamiento al click del CTA suscripción

- No abre el carrito directamente.
- **Cerrada:** lleva al **checkout en modo suscripción** con modalidad/tamaño/frecuencia/descuento pre-rellenados.
- **Personalizable:** lleva primero al **picker de frutas** (sin elegir frutas no se puede empezar la suscripción), y luego al checkout suscripción tras validar la caja.

El detalle del checkout suscripción vive en `prd-checkout.md` (pendiente).

### 4.7 Diferenciación visual amarillo vs verde

Decisión deliberada: **amarillo = compra puntual; verde = suscripción** en toda la web. Permite al usuario distinguir el flujo en cualquier punto sin leer copy. La landing usa amarillo en bloques 2 y 8 porque ahí no hay flujo aún (es marketing); el verde aparece en el banner del bloque 8 como "señalando" hacia el flujo de suscripción que comienza al hacer click.

---

## 5. Cambios pendientes en otros documentos

| Doc | Cambio |
|---|---|
| `prd-v1-alcance.md` | Quitar suscripción de "fuera de alcance"; añadir como caso de uso CU-#; actualizar §scope, §pantallas, §métricas, §timeline |
| `prd-pdp-caja-cerrada.md` | Eliminar §3 No-objetivo "No integrar el flujo de suscripción"; añadir referencia al toggle del Hero según §4 de este spec |
| `prd-pdp-caja-personalizable.md` | Mismo cambio |
| `prd-mi-cuenta.md` | Añadir bloque "Mi suscripción" — pausar, saltar, cambiar tamaño, cancelar |
| `prd-checkout.md` (nuevo) | Diseñar checkout que contemple ambos flujos: compra única y suscripción (pre-rellenado, cobro recurrente, calendario de envíos) |
| `prd-emails-transaccionales.md` (nuevo) | Añadir emails: confirmación de suscripción, recordatorio "próximo envío en X días", aviso 48h antes si no hay stock, confirmación de pausa/skip/cancelación |

**Backoffice (consecuencia operativa):**

- Gestión de cohortes de suscriptores.
- Calendario de envíos por semana (forecast por modalidad/tamaño/frecuencia).
- Panel de pausas/skips/cancelaciones para soporte.

---

## 6. Eventos analytics

A integrar con la analítica existente de PDPs.

| Evento | Trigger | Props |
|---|---|---|
| `subscription_landing_view` | Carga `/menus-semanales` | `referrer` |
| `subscription_landing_cta_click` | Click en CTA hero o final | `position` (hero/final) |
| `subscription_modality_select` | Click en `Suscribirme a Cerrada/Personalizable` (bloque 4) | `modality`, `frecuencia` |
| `subscription_faq_open` | Click en una pregunta | `question_id` |
| `pdp_toggle_subscription` | Click en toggle "Suscríbeme" en PDP | `pdp` (cerrada/personalizable), `from` (default/manual) |
| `pdp_frequency_select` | Click en frecuencia en PDP | `pdp`, `frequency` |
| `subscription_checkout_start` | Click CTA `EMPEZAR MI SUSCRIPCIÓN` en PDP | `modality`, `size`, `frequency`, `total_first_box`, `total_recurring` |

---

## 7. Métricas de éxito (8 semanas post-launch)

- **% sesiones con `subscription_landing_view`** que terminan en `subscription_modality_select`: ≥ 25%.
- **% PDP sessions con `pdp_toggle_subscription` activado** (al menos una vez en la sesión): ≥ 30%.
- **% checkouts iniciados como suscripción** (`subscription_checkout_start` / total checkouts): ≥ 20% (hipótesis a validar).
- **Conversión cohorte suscripción** (de `subscription_checkout_start` a primer envío cobrado): ≥ 75%.
- **Churn al primer envío** (suscriptores que cancelan antes del 2º envío): ≤ 25% (por debajo del benchmark sin compromiso).
- **Suscriptores activos cierre Y1:** ≥ 150 (punto de inflexión definido en `plan-negocio-v1.md`).

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Cliente se confunde entre landing y PDP — siente repetición | Bloque 4 (selector modalidad) deriva al PDP; copy de la landing NO repite explicación de modalidades, solo pitchea el modelo recurrente |
| Toggle del PDP genera confusión con el selector de tamaño | El toggle se inserta **encima** y con header explícito `¿Cómo la quieres?`; cambio de color del CTA refuerza la diferencia de flujo |
| Cliente activa suscripción sin entenderla | Microcopy del CTA dice `EMPEZAR MI SUSCRIPCIÓN — 44,10€/envío` (no oculta el "/envío"); FAQ de la landing y trust microcopy del PDP refuerzan "cancela cuando quieras" |
| Stock-out semanal genera churn | FAQ pregunta 6 + email 48h antes con opciones (otra modalidad / saltar / cancelar) — comunica la incertidumbre antes de que duela |
| Modalidad fija percibida como rigidez | Copy de FAQ pregunta 3 reconoce la limitación + ofrece la salida (cancelar y resuscribirte). Es honesto, no esconde el trade-off |

---

## 9. Scope de cambios en Figma

Cuando ejecutemos:

1. **Crear nueva página Figma** `🌿 Suscripción — Landing v1` o trabajar dentro de la página existente `🏠 Home v2 — Propuesta` según convenga.
2. **Construir landing `/menus-semanales`** con los 9 bloques en frame Desktop 1440 (canónico) — los breakpoints adicionales se derivan después.
3. **Modificar PDPs existentes** (`/caja-cerrada` y `/caja-personalizable`) — insertar toggle `¿Cómo la quieres?` + selector de frecuencia condicional + actualizar precios dinámicos del selector de tamaño + actualizar CTA primario texto y color.
4. **Reutilizar componentes existentes** del design system (botones, cards, FAQ accordion si existe).
5. **Screenshots de validación** después de cada bloque mayor.

**Fuera de scope de este pase:**

- Diseño completo del checkout suscripción (vive en `prd-checkout.md`).
- Diseño del bloque "Mi suscripción" en Mi Cuenta.
- Variantes mobile de la landing — primero Desktop 1440, luego adaptación.
- Componentización formal de las cards de modalidad como Components con variantes.

---

## Apéndice — vínculos

- Memoria de decisión: `.claude/memory/decision_v1_vs_v15.md`
- Plan de negocio: `docs/plan-negocio-v1.md`
- PRD v1 alcance: `docs/prd-v1-alcance.md`
- PRD PDP Cerrada: `docs/prd-pdp-caja-cerrada.md`
- PRD PDP Personalizable: `docs/prd-pdp-caja-personalizable.md`
- PRD Mi Cuenta: `docs/prd-mi-cuenta.md`
- Archivo Figma: [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)
