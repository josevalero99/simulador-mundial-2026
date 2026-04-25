# PRD — Mi Cuenta (Área de cliente)

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Sección:** área autenticada del cliente
- **Rutas propuestas:** `/mi-cuenta`, `/mi-cuenta/pedidos`, `/mi-cuenta/pedidos/:id`, `/mi-cuenta/direcciones`, `/mi-cuenta/perfil`
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-25
- **Estado:** Draft v1 — pendiente de revisión
- **Archivo Figma:** [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)

---

## 1. TL;DR

Mi Cuenta es **el espacio post-compra del cliente**: ver lo que ha pedido, gestionar direcciones y perfil, repetir compra rápido. En v1 es funcional y honesto — no hay suscripciones, ni puntos, ni programa de fidelización. El cliente entra a comprobar el estado de un pedido o a comprar otra vez en 1 click.

**5 pantallas en v1:** Dashboard (landing tras login), Pedidos (lista), Pedido (detalle), Direcciones (CRUD básico), Perfil (datos + cambiar contraseña + cerrar cuenta). Todas comparten un **shell con sidebar de navegación**.

**Objetivos:**

1. **Reducir consultas a soporte** dándole al cliente autonomía para ver estado y dirección de su pedido.
2. **Acelerar la recompra** con direcciones guardadas y CTAs de "volver a comprar".
3. **Dar señales de seriedad** — un cliente que entra a Mi Cuenta debe sentir que la marca opera de forma profesional.

---

## 2. Contexto y problema

Hoy Bionta no tiene Mi Cuenta. El cliente que compró no puede consultar su pedido, cambiar dirección, ni volver a comprar sin re-introducir todos sus datos. El equipo recibe consultas por DM o email que podrían autoresolverse.

**Problema a resolver:**

- Falta de visibilidad post-compra → ansiedad del cliente, tickets de soporte.
- Fricción en recompra → cada compra empieza desde cero.
- Sin historial → no podemos comunicar "ya compraste esto, repite" o construir relación de cliente.

**Decisiones tomadas (referencia PRD v1):**

- Dashboard, Pedidos, Direcciones, Perfil son **P1** (críticos para operación sostenible, no para vender la primera vez).
- Cambiar dirección de un pedido en curso solo si está **"En preparación"** y dentro de una ventana antes del envío (CU-6).
- **No hay suscripción en v1** — Mi Cuenta no muestra ningún hub de suscripción.

---

## 3. Objetivos / No-objetivos / Fuera de alcance

### Objetivos

- Que un cliente pueda **ver el estado de su último pedido en ≤ 2 clicks** desde el header.
- Que un cliente pueda **repetir su última compra en 1 click** (CTA en dashboard y en detalle de pedido).
- Que un cliente pueda **cambiar dirección de envío** de un pedido si todavía está a tiempo, sin contactar a Bionta.
- Que un cliente pueda **gestionar sus direcciones y perfil** de forma autónoma.

### No-objetivos (v1)

- **No** hay gestión de suscripciones (no existe modelo en v1).
- **No** hay wishlist ni favoritos.
- **No** hay puntos, créditos ni programa de fidelización.
- **No** hay invitaciones / referidos.
- **No** hay descarga de facturas en PDF (la confirmación email cubre v1; PDF en v2).
- **No** hay tracking en mapa del envío (solo número de seguimiento si lo da el courier).
- **No** hay reviews de productos comprados.

### Fuera de alcance del doc

- **Auth, login y reset** — `prd-auth.md`.
- **Modal "crear cuenta al final del checkout"** — `prd-checkout.md`.
- **Backoffice de clientes** — vive en `prd-backoffice-pedidos.md` (pendiente).
- **Endpoint backend de pedidos / direcciones** — implementación.
- **Mobile** — fuera de v1 inicial. Se diseña tras desktop.

---

## 4. Usuarios y JTBD

### Perfil primario — "Cliente recurrente"

- Compra cada 2-4 semanas. Tiene 1-2 direcciones (casa, trabajo).
- Consulta Mi Cuenta para ver estado de pedido o repetir compra.

**JTBD 1:** *Cuando hago un pedido, quiero saber en qué estado está sin tener que escribir a Bionta.*
**JTBD 2:** *Cuando me gustó la última caja, quiero pedir lo mismo otra vez sin reintroducir nada.*
**JTBD 3:** *Cuando cambio de dirección (mudanza, vacaciones), quiero actualizarlo sin fricción para futuros pedidos.*

### Perfil secundario — "Cliente con incidencia"

- Su pedido no llegó, o la fruta vino en mal estado, o se equivocó de dirección.

**JTBD 4:** *Cuando algo sale mal con un pedido, quiero ver el detalle y tener un canal claro para reportar la incidencia.*

---

## 5. IA y navegación

### 5.1 Layout global del shell

Todas las pantallas de Mi Cuenta comparten un layout de **sidebar izquierdo (240px) + área de contenido**.

```
┌──────────────────── Header global ─────────────────────┐
│  Logo · Nav · Carrito · Mi cuenta (avatar)             │
├──────────┬─────────────────────────────────────────────┤
│ Sidebar  │ Contenido                                    │
│ 240px    │                                              │
│          │                                              │
│ · Inicio │  [breadcrumb opcional]                       │
│ · Pedidos│  H1                                          │
│ · Direc. │                                              │
│ · Perfil │  …contenido específico…                      │
│          │                                              │
│ ─────    │                                              │
│ Cerrar   │                                              │
│ sesión   │                                              │
└──────────┴─────────────────────────────────────────────┘
```

- **Fondo:** cream `#faf6ef` (la página) — sin cream warm en este caso para que las cards (cream warm) destaquen.
- **Sidebar:** fondo blanco/cream warm, border-right sutil, items con padding 12/16, item activo con fondo verde claro y texto verde oscuro.
- **Header global:** el mismo de la web pública (Tienda · Menús semanales · Sobre Nosotros · Contacto). El icono de "Mi cuenta" en el header lleva al dashboard.

### 5.2 Items de sidebar

| Item | Ruta | Icono |
|---|---|---|
| Inicio | `/mi-cuenta` | home |
| Pedidos | `/mi-cuenta/pedidos` | package |
| Direcciones | `/mi-cuenta/direcciones` | map-pin |
| Perfil | `/mi-cuenta/perfil` | user |
| — | — | — |
| Cerrar sesión | acción | logout |

Item activo destacado. En desktop el sidebar es siempre visible.

---

## 6. Specs por pantalla

### 6.1 Dashboard (`/mi-cuenta`)

**Propósito:** vista de bienvenida tras login. Resumen rápido + accesos directos.

**Bloques (top → bottom):**

1. **Saludo personalizado** — `Hola, {nombre}` (Clash Display Medium 32). Subtítulo: `Esto es lo que tienes en marcha.` (Regular 15, gris).

2. **Card "Próximo pedido" / "Último pedido"** — Card grande cream warm radius 16, padding 28.
   - **Si hay pedido en curso (estado ≠ entregado/cancelado):**
     - Estado con badge color: `Confirmado` / `En preparación` / `Enviado`.
     - Fecha estimada de entrega.
     - 3 thumbnails de fruta del surtido (max).
     - CTA secundario: `Ver detalle` (link verde).
   - **Si no hay pedido en curso pero hay pedidos pasados:**
     - Mostrar el último entregado: "Tu último pedido — entregado el 15/04/2026".
     - CTA primario: `Volver a comprarlo` (amarillo) — añade al carrito el mismo SKU+frutas y lleva a checkout.
   - **Si no hay pedidos:**
     - Empty state: `Aún no has hecho ningún pedido.`
     - CTA primario: `Ver cajas` → `/`.

3. **Acciones rápidas** — fila de 3 cards pequeñas (cream, radius 16, hover sutil):
   - `Ver todos los pedidos` → `/mi-cuenta/pedidos`
   - `Mis direcciones` → `/mi-cuenta/direcciones`
   - `Mi perfil` → `/mi-cuenta/perfil`

4. **Banner contextual** (opcional, P2):
   - Si la temporada cambió o hay fruta nueva esta semana: card cream warm con `Esta semana en Bionta: lichi, mango y guayaba.` + link al calendario.

### 6.2 Pedidos — Lista (`/mi-cuenta/pedidos`)

**Propósito:** ver el historial completo. Filtrar y entrar al detalle.

**Header:**

- H1: `Mis pedidos`
- Subtítulo: `{N} pedidos en total.`
- Filtro (tabs): `Todos` (default) · `En curso` · `Entregados` · `Cancelados`. Counts por tab.

**Lista:** cards apiladas (gap 16), cada card es **clickable** y lleva al detalle.

**Card de pedido:**

```
┌──────────────────────────────────────────────────────────┐
│ Pedido #BNT-2026-0142             Estado: En preparación │
│ 22/04/2026                        ──────────────────     │
│                                                          │
│ Caja Personalizable Grande · 6 frutas                    │
│ [thumb][thumb][thumb][thumb][thumb][thumb]               │
│                                                          │
│ Total: 49,00 €              [Ver detalle →]              │
└──────────────────────────────────────────────────────────┘
```

- Fondo cream warm radius 16, padding 24.
- Estado con badge color (ver §7.1).
- Thumbnails de fruta cuando aplique (cerrada muestra surtido del momento).
- CTA `Ver detalle →` en verde.

**Estados de la lista:**

- Default: cards.
- Vacío (sin pedidos): empty state con ilustración + CTA `Ver cajas` → `/`.
- Vacío en tab filtrado: `No tienes pedidos {entregados|cancelados}.` sin CTA.
- Loading: skeletons de 3 cards.

**Paginación:** infinite scroll con un `Cargar más` botón al final cuando hay >10. v1 no necesita filtros por fecha.

### 6.3 Pedido — Detalle (`/mi-cuenta/pedidos/:id`)

**Propósito:** todo lo que el cliente necesita saber sobre un pedido + acciones disponibles.

**Layout:** 2 columnas en desktop — izquierda (60%) contenido principal, derecha (40%) sidebar de resumen.

**Bloques (columna izquierda):**

1. **Breadcrumb:** `Mis pedidos / Pedido #BNT-2026-0142`.
2. **Header:** `Pedido #BNT-2026-0142` (Medium 28). Subtítulo: `Realizado el 22/04/2026.`.
3. **Línea de tiempo del estado** — stepper horizontal con 4 hitos:
   - `Confirmado` (siempre done).
   - `En preparación`.
   - `Enviado`.
   - `Entregado`.
   - Hitos pasados en verde, hito actual destacado, futuros en gris.
   - Si fue **cancelado** o **reembolsado**: stepper se reemplaza por banner: `Pedido cancelado el 23/04/2026. Reembolso procesado.`
4. **Detalle del pedido** — bloque "Lo que llevas":
   - Tarjeta del SKU (Caja Cerrada Grande / Personalizable Pequeña / etc.).
   - Si Personalizable: lista de frutas elegidas con thumbnail.
   - Si Cerrada: lista del surtido enviado esa semana.
5. **Dirección de envío** — card cream warm:
   - Nombre, calle, ciudad, CP.
   - Si estado = `Confirmado` o `En preparación` (y dentro de la ventana — ver §7.2): botón `Cambiar dirección` (link verde).
   - Si fuera de ventana: texto helper `Para cambiar la dirección, contáctanos.` con link a `/contacto`.
6. **Pago** — card cream warm:
   - Método (·· 4242), total cobrado.
   - Si reembolso: línea adicional con `Reembolso procesado: -X €`.

**Sidebar (columna derecha) — sticky:**

- **Resumen** — subtotal, envío, total.
- **Acciones:**
  - `Volver a comprar` (CTA primario amarillo) — clona el pedido al carrito y lleva a checkout.
  - `Necesito ayuda con este pedido` (link verde) → `/contacto?pedido=BNT-2026-0142` (prerellena).
  - Si hay `tracking_url`: `Seguir envío` (botón secundario).

**Estados:**

- Pedido no existe / no es del usuario: 404 con texto `No encontramos este pedido.`.

### 6.4 Direcciones (`/mi-cuenta/direcciones`)

**Propósito:** CRUD básico de direcciones de envío.

**Header:**

- H1: `Mis direcciones`
- CTA primario derecha: `Añadir dirección` (amarillo).

**Lista:** cards en grid 2 columnas (gap 16) en desktop.

**Card de dirección:**

```
┌──────────────────────────────────┐
│ Casa                  [Por defecto]│
│                                   │
│ María García                      │
│ Calle Mayor 12, 3º B              │
│ 28001 Madrid                      │
│ +34 600 000 000                   │
│                                   │
│ [Editar] [Eliminar]               │
└──────────────────────────────────┘
```

- Card cream warm radius 16 padding 24.
- Badge `Por defecto` si aplica (verde con texto blanco).
- Acciones: `Editar` (link verde), `Eliminar` (link gris), `Marcar como predeterminada` (si no lo es).

**Modal "Añadir / Editar dirección":**

| Campo | Tipo | Required |
|---|---|---|
| Alias (Casa, Trabajo…) | text | sí |
| Nombre completo del destinatario | text | sí |
| Teléfono | tel | sí |
| Calle y número | text | sí |
| Piso / puerta (opcional) | text | no |
| Código postal | text (5 dígitos) | sí, validar contra zonas de envío |
| Ciudad | text | sí |
| Provincia | select (lista España) | sí |
| Notas para el repartidor (opcional) | textarea | no |
| `Marcar como dirección predeterminada` | checkbox | no |

**Validaciones:**

- CP fuera de cobertura → mensaje inline: `Por ahora no enviamos a este código postal. Consulta zonas en /envios.`
- Una y solo una dirección puede ser predeterminada. Si se marca otra, la anterior se desmarca.

**Estado vacío:** ilustración + `Aún no has guardado direcciones.` + CTA `Añadir dirección`.

**Eliminar:** confirmación inline (`¿Eliminar "Casa"?`) con botón rojo. No permitir eliminar la única dirección predeterminada si hay pedido en curso usándola — mostrar tooltip con razón.

### 6.5 Perfil (`/mi-cuenta/perfil`)

**Propósito:** datos personales + seguridad + zona peligrosa.

**Bloques:**

1. **Tus datos** — card cream warm:
   - Avatar (placeholder iniciales en círculo verde).
   - `Nombre` (editable inline o con botón `Editar`).
   - `Email` (read-only en v1; cambiar email es flujo aparte que no entra en v1).
   - Botón `Guardar cambios` aparece tras editar.

2. **Comunicaciones** — card cream warm:
   - Toggle `Quiero recibir emails sobre temporada y novedades.` (default ON, salvo opt-out previo).
   - Texto helper: `Los emails transaccionales (confirmación de pedido, envío, etc.) los recibirás siempre.`

3. **Seguridad** — card cream warm:
   - Botón `Cambiar contraseña` → modal con: `Contraseña actual` + `Nueva contraseña` (con mismas reglas que registro).
   - Mensaje de éxito tras cambio: `Contraseña actualizada. Cerramos las sesiones en otros dispositivos por seguridad.`

4. **Zona peligrosa** — card con borde rojo sutil:
   - Botón `Eliminar mi cuenta` (texto rojo).
   - Modal de confirmación con doble paso: explicar consecuencias (pedidos pasados quedan anonimizados, no se pueden recuperar) + escribir `eliminar` para confirmar.
   - Tras eliminar: cierre de sesión, redirige a `/` con mensaje toast `Tu cuenta ha sido eliminada.`.

---

## 7. Reglas de negocio

### 7.1 Estados de pedido

| Estado | Color badge | Cuándo |
|---|---|---|
| `Confirmado` | Amarillo | Pago OK, antes de empezar preparación |
| `En preparación` | Verde claro | Operación marcó como en preparación |
| `Enviado` | Verde oscuro | Operación marcó como enviado |
| `Entregado` | Verde + check | Estado final OK |
| `Cancelado` | Gris | Cancelación pre-envío |
| `Reembolsado` | Gris | Reembolso total tras envío |
| `Reembolso parcial` | Gris claro | Reembolso parcial |

### 7.2 Ventana para cambiar dirección

- Permitido si estado = `Confirmado` o `En preparación` Y faltan **≥ 12h** para el corte logístico del pedido.
- Si fuera de ventana: bloquear edición y mostrar `Para cambiar la dirección, contáctanos.`
- El corte logístico depende de la fecha estimada de envío (campo del backend).

### 7.3 "Volver a comprar"

- Clona el pedido en el carrito: mismo SKU, mismo tamaño, en personalizable mismas frutas si todavía están disponibles esta semana.
- Si alguna fruta no está disponible: mensaje al añadir → `Algunas frutas no están esta semana. Te las hemos sustituido por las disponibles más parecidas.` + lleva al carrito para que el cliente revise.
- Si el SKU cambió de precio desde la última compra: respetar precio actual (no congelar precio histórico).

### 7.4 Eliminar cuenta

- **No borra pedidos** (auditoría legal y operativa). Pedidos quedan asociados a un usuario "eliminado_{id}".
- Anonimiza nombre, email, teléfono y direcciones del usuario.
- Email recibe confirmación final: `Tu cuenta ha sido eliminada.`
- Plazo de recuperación: en v1, no hay undo. Lo señalamos en la confirmación.

### 7.5 Sesión

- Acceso a Mi Cuenta sin sesión → redirigir a `/login?redirect=<ruta>` y volver tras login.
- Sesión expirada en navegación: banner top y redirigir a login al siguiente click protegido.

---

## 8. Estados vacíos y errores

| Pantalla | Estado vacío | Estado error |
|---|---|---|
| Dashboard | Sin pedidos: hero "Empieza por aquí" + CTA `Ver cajas` | Si fallo carga: `No hemos podido cargar tus datos.` con `Reintentar` |
| Pedidos lista | Sin pedidos: ilustración + CTA `Ver cajas` | Idem |
| Pedido detalle | n/a (404 si no existe) | 404 amistoso con CTA `Volver a mis pedidos` |
| Direcciones | Sin direcciones: card empty + CTA `Añadir dirección` | Idem |
| Perfil | n/a | Idem |

---

## 9. Eventos analytics

| Evento | Trigger | Props |
|---|---|---|
| `account_view` | Carga `/mi-cuenta` | `has_orders` (bool) |
| `account_orders_view` | Carga `/mi-cuenta/pedidos` | `tab`, `count` |
| `account_order_detail_view` | Carga `/mi-cuenta/pedidos/:id` | `order_id`, `status` |
| `account_reorder_click` | Click en `Volver a comprar` | `order_id`, `from` (dashboard/detail) |
| `account_address_add` | Crear dirección | — |
| `account_address_edit` | Editar dirección | — |
| `account_address_delete` | Eliminar dirección | — |
| `account_address_set_default` | Marcar predeterminada | — |
| `account_profile_update` | Guardar cambios perfil | `field` |
| `account_password_change` | Cambiar contraseña OK | — |
| `account_delete_request` | Confirmar eliminación cuenta | — |
| `account_change_address_attempt` | Click en cambiar dirección de pedido | `order_id`, `allowed` (bool) |

---

## 10. Métricas de éxito (8 semanas post-launch)

- **Tasa de uso de Mi Cuenta:** ≥ 60% de clientes con cuenta entran a Mi Cuenta al menos 1 vez/mes.
- **% de recompra desde "Volver a comprar":** ≥ 20% de los pedidos del cliente recurrente vienen de este CTA.
- **Reducción de tickets soporte por estado de pedido:** ≥ 40% vs baseline pre-launch.
- **% de cambios de dirección autoservicio:** ≥ 70% de los clientes que querían cambiar dirección lo hacen sin contactar.
- **Latencia de carga:** < 1.5s para Dashboard y Pedidos lista p75.

---

## 11. Decisiones cerradas (v1)

Decisiones tomadas para v1. Reabrir requiere acuerdo explícito.

- **Tracking del envío:** **solo link externo** al tracking del courier en el detalle del pedido. No integramos UI propia ni mapa.
- **Facturas PDF:** **no en v1**. La confirmación email tiene los datos legales suficientes. Reevaluable en v2 si aparece demanda fiscal real.
- **Cambiar email:** **no en v1**. Email es read-only en Perfil. Cambiar email implica flujo de re-verificación + manejo de identidad delicado, va a v2 si hay demanda.
- **"Próxima entrega" predicha en Dashboard:** **no**. Solo mostramos el campo `Próximo pedido` si existe explícitamente en el backend. No predecimos.
- **Eliminación de cuenta:** **soft delete con anonimización** (ver §7.4). Hard delete solo bajo petición legal explícita por RGPD, gestionado vía contacto, no autoservicio.
- **Sidebar de Mi Cuenta:** **fijo a 240px** en desktop v1. Colapsable es ergonomía móvil, se aborda en el mobile pass.

---

## 12. Próximos pasos

1. **Revisar este PRD** con el equipo (15 min).
2. **Cerrar §11** decisiones abiertas.
3. **Diseñar las 5 pantallas** en Figma desktop con el lenguaje establecido (cream/cream warm, cards radius 16, paleta verde/amarillo, Clash Display).
4. **Crear el shell de Mi Cuenta** como componente reutilizable (sidebar + content area).
5. **Coordinar con `prd-backoffice-pedidos.md`** la matriz de estados (mismo enum compartido entre frontend y backoffice).

---

## Apéndice — vínculos

- PRD v1: `docs/prd-v1-alcance.md` (este doc cubre #8-11 Mi Cuenta).
- PRD Auth: `docs/prd-auth.md`.
- Casos de uso afectados: CU-3 (registro post-checkout y ver pedidos), CU-6 (cambiar dirección de pedido en curso).
- Archivo Figma: [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design).
