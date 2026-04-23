# PRD — Alcance v1 Bionta

- **Producto:** Bionta — cajas de fruta tropical de temporada (DTC)
- **Versión:** v1 (lanzamiento comercial completo)
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-23
- **Estado:** Draft v1 — pendiente de revisión y priorización
- **Archivo Figma:** [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)

---

## 1. TL;DR

v1 es **el lanzamiento comercial completo de Bionta** como tienda DTC de cajas de fruta tropical de temporada. Cubre todo lo necesario para vender, operar y atender a cliente sin hacks: tienda pública con Home + 2 PDPs + carrito + checkout + cuenta de cliente, calendario público de temporada, contenido legal, y un **backoffice funcional para operaciones** (pedidos, calendario semanal, SKUs, clientes, contenido, envíos, descuentos, reports).

**No incluye** suscripción, reviews, referidos, blog, landings SEM, gifting, wishlist ni recomendaciones IA. Eso es v2+.

**Objetivos de v1:**

1. **Vender** — el cliente puede comprar una caja en ≤ 3 clicks desde el Home o la PDP.
2. **Operar** — el equipo puede gestionar el ciclo completo de un pedido desde el backoffice.
3. **Sostener** — sin bases de datos en hojas de cálculo, sin actualizar copy por código, sin enviar emails a mano.

---

## 2. Contexto y objetivos de v1

Bionta hoy tiene un Home de *mood board* pero no tiene storefront funcional. Las piezas de marca (tipografía, paleta, fotografía de producto) están bien; las piezas de producto y operación no existen todavía.

**Lo que valida v1:**

- Que un visitante que llega frío puede entender qué vende Bionta y comprar.
- Que el producto (caja cerrada + personalizable × 2 tamaños) es interpretable para el cliente.
- Que la rotación semanal de fruta tropical **es un moat comunicable**, no un problema logístico invisible.
- Que el equipo puede operar sin dependencia constante de ingeniería.

**Lo que NO valida v1:**

- Modelo de suscripción (pendiente de definir mecánica — ver §10).
- Eficacia de canales de adquisición pagados (eso llega con SEM landings en v2).
- Programa de referidos y virality (v2).

---

## 3. Criterios de "listo para v1" (Definition of Ready to Launch)

v1 se considera listo cuando **todas** estas condiciones se cumplen:

### Producto

- [ ] Las 17 páginas/módulos frontend listados en §4 están implementados, probados y accesibles AA básico.
- [ ] Los 14 módulos de backoffice listados en §5 están implementados y probados con usuarios del equipo.
- [ ] Los 10 casos de uso canónicos de §6 se ejecutan extremo-a-extremo en staging con datos reales.
- [ ] Los textos placeholder (*"Caja de otra cosa"*, *"tomates"*, lorem) están **todos** fuera.
- [ ] El pricing es coherente entre modalidades (bug heredado del Home actual — ver `home-audit-product-lens.md`).
- [ ] Todas las imágenes muestran fruta tropical real, no lechuga/tomates/pimientos.

### Operación

- [ ] El equipo sabe dar de alta fruta/stock para la semana siguiente sin ayuda de ingeniería.
- [ ] El equipo puede procesar un pedido entero (ver → preparar → marcar enviado) sin pedir ayuda.
- [ ] Existe runbook para reembolsos y para fruta agotada a mitad de semana.

### Técnico

- [ ] Pagos reales integrados y probados con al menos 10 transacciones en producción.
- [ ] Emails transaccionales llegan en < 60 s y no caen en spam (SPF/DKIM/DMARC correctos).
- [ ] Responsive funciona en mobile, tablet y desktop (1440 y 1920).
- [ ] Core Web Vitals en PDPs: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- [ ] Error monitoring activo con alerts a Slack/email.
- [ ] Backups automatizados de base de datos con prueba de restauración documentada.

### Legal

- [ ] Términos, Privacidad y Cookies revisados por legal, publicados.
- [ ] Banner de cookies cumple RGPD.
- [ ] Política de devolución acorde con ley de alimentos frescos.

---

## 4. Mapa Frontend — páginas y módulos

Prioridad: **P0** = crítico para vender · **P1** = crítico para operación sostenible · **P2** = completa la experiencia.

Estado: **✓** listo · **◐** PRD hijo escrito, implementación pendiente · **☐** pendiente PRD hijo + implementación.

| # | Página / módulo | Prio | Estado | Dependencias | PRD hijo |
|---|---|---|---|---|---|
| 1 | **Home** | P0 | ☐ | Selector, calendario temporada | `prd-home.md` (pendiente) |
| 2 | **PDP Caja Cerrada** | P0 | ◐ | Pricing, stock, calendario | `prd-pdp-caja-cerrada.md` |
| 3 | **PDP Caja Personalizable** | P0 | ◐ | Pricing, stock, calendario, picker | `prd-pdp-caja-personalizable.md` |
| 4 | **Cart** (mini + página) | P0 | ☐ | Pricing, sesión | `prd-cart.md` (pendiente) |
| 5 | **Checkout** multi-step | P0 | ☐ | Pagos, envíos, auth | `prd-checkout.md` (pendiente) |
| 6 | **Order confirmation** | P0 | ☐ | Email transaccional | `prd-order-confirmation.md` |
| 7 | **Auth** (login/register/reset) | P0 | ☐ | Auth backend | `prd-auth.md` (pendiente) |
| 8 | **Mi Cuenta — Dashboard** | P1 | ☐ | Auth, pedidos | `prd-mi-cuenta.md` |
| 9 | **Mi Cuenta — Pedidos** (list + detalle) | P1 | ☐ | Auth, pedidos API | `prd-mi-cuenta.md` |
| 10 | **Mi Cuenta — Direcciones** | P1 | ☐ | Auth | `prd-mi-cuenta.md` |
| 11 | **Mi Cuenta — Perfil** | P1 | ☐ | Auth | `prd-mi-cuenta.md` |
| 12 | **Calendario de temporada** (público) | P1 | ☐ | Calendario backend | `prd-calendario.md` |
| 13 | **FAQ / Ayuda** | P1 | ☐ | Contenido BO | `prd-faq.md` |
| 14 | **Contacto** | P2 | ☐ | Email transaccional | `prd-contacto.md` |
| 15 | **Legales** (Términos / Privacidad / Cookies) | P0 | ☐ | Revisión legal | `prd-legales.md` |
| 16 | **404 / Estados de error** | P1 | ☐ | — | Cubierto en DS |
| 17 | **Emails transaccionales** (5 templates: conf, envío, bienvenida, reset, reembolso) | P0 | ☐ | Email provider | `prd-emails-transaccionales.md` |

**Nota sobre el #16:** no es "página" pero hay que diseñarlo (404, 500, offline, sesión expirada, payment failed). Se trata como set dentro del DS.

### Breakpoints target

- **Mobile:** 360-430 (iPhone SE → Pro Max) → prioridad #1 por comportamiento real DTC alimentación.
- **Tablet:** 768-1024.
- **Desktop:** 1440 canónico (ya usado en diseño actual) + 1920 como segunda validación.

---

## 5. Mapa Backoffice — módulos

Prioridad igual que §4.

| # | Módulo | Prio | Notas |
|---|---|---|---|
| 1 | **Staff login** (+ 2FA opcional v1) | P0 | Cuentas de equipo, roles básicos |
| 2 | **Dashboard** | P1 | KPIs del día: ventas, pedidos pendientes, stock alerts, fruta con poca cobertura |
| 3 | **Pedidos — list** | P0 | Filtros (estado, fecha, cliente, SKU), búsqueda, exportar CSV |
| 4 | **Pedidos — detalle** | P0 | Ver línea, dirección, pagos, acciones: marcar preparado/enviado/entregado, refund (parcial/total), nota interna |
| 5 | **Calendario de temporada** ★ | P0 | **Módulo core Bionta.** Semana ↔ lista de frutas ↔ stock binario/numérico ↔ disponibilidad por modalidad ↔ orden de display. Soporte para planificar 4 semanas adelante. |
| 6 | **Productos** (SKU matrix) | P0 | 4 SKUs base (Cerrada-G, Cerrada-P, Personalizable-G, Personalizable-P): precio, descripción, imágenes principales, capacidad del picker. |
| 7 | **Clientes — list + detalle** | P1 | Datos, historial de pedidos, notas internas, exportar |
| 8 | **Contenido — textos e imágenes** | P1 | CMS-lite: hero copy, hero image, testimonials, banner promo |
| 9 | **Contenido — testimonios** | P1 | CRUD de testimonios con foto, nombre, ciudad, cita, activo/inactivo |
| 10 | **Contenido — FAQ** | P1 | CRUD de preguntas con categoría, orden, activo/inactivo |
| 11 | **Envíos — zonas y tarifas** | P0 | Zonas (código postal / región), tarifa por zona, gratis a partir de X |
| 12 | **Staff — usuarios y roles** | P1 | v1: Admin (todo) y Operaciones (pedidos + calendario). No ACL granular. |
| 13 | **Promo codes** | P1 | %, importe fijo, envío gratis. Fecha inicio/fin, usos máx, 1 por cliente, aplicabilidad (todo, SKU concreto). |
| 14 | **Reports** | P1 | v1: ventas por periodo, top SKU, pedidos pendientes de envío, conversión Home→Compra, export CSV. |

### Principios backoffice v1

- **Operable por no-técnico.** Si requiere una consulta SQL, es bug.
- **Audit trail mínimo:** qué usuario hizo qué cambio crítico (estado de pedido, refund, precio, calendario).
- **Sin builder visual.** Nada de "arrastra bloques". CMS-lite = campos definidos que se editan.

---

## 6. Casos de uso canónicos — 10 flujos end-to-end

Son los flujos que **tienen que funcionar** en v1. Si uno falla, v1 no está listo.

### Frontend (cliente)

1. **CU-1 · Comprar caja cerrada.** Desde Home → selector → PDP cerrada → elige tamaño → add-to-cart → cart → checkout → pago → confirmación + email.

2. **CU-2 · Comprar caja personalizable.** Desde Home → selector → PDP personalizable → elige tamaño → picker (6 ó 3 frutas) → add-to-cart → checkout → pago → confirmación + email.

3. **CU-3 · Registrarse y ver pedidos.** Desde checkout → "Crear cuenta" → pedido se asocia → entra a Mi Cuenta → ve pedido listado y en detalle.

4. **CU-4 · Recuperar contraseña.** Desde login → "Olvidé" → email con token → nueva contraseña → login ok.

5. **CU-5 · Consultar qué hay esta semana sin comprar.** Desde nav → Calendario de temporada → ve frutas activas + próximas semanas.

6. **CU-6 · Cambiar dirección de un pedido en curso.** Desde Mi Cuenta → Pedido → si estado = "En preparación", permitir cambio de dirección hasta X horas antes de envío. Si no, pedir por contacto.

### Backoffice (equipo)

7. **CU-7 · Operar la semana.** Lunes: operador entra a Calendario de temporada → marca frutas disponibles esta semana → ajusta stock → publica. A partir de ese momento la tienda refleja el nuevo surtido.

8. **CU-8 · Procesar un pedido.** Operador entra a Pedidos → abre pedido nuevo → marca "En preparación" → imprime/exporta etiqueta → marca "Enviado" (sistema dispara email de envío).

9. **CU-9 · Reembolsar un pedido.** Operador abre pedido → acción "Reembolsar" (total o parcial) → backend procesa con pasarela → estado cambia → email al cliente.

10. **CU-10 · Publicar un banner promocional.** Operador entra a Contenido → edita banner de home → publica → cambio visible en la home sin deploy.

### Casos de uso que NO están en v1 (lista explícita)

- Suscribirse a entrega recurrente.
- Dejar una review.
- Invitar a un amigo.
- Aplicar varios códigos de descuento en un pedido.
- Cambiar un pedido ya enviado (solo reembolsar).
- Comprar con wallet / Apple Pay / Google Pay (depende de decisión §10).

---

## 7. Cross-cutting

Componentes que no son página pero que afectan a todas las páginas de v1.

### 7.1 Design system

- Biblioteca en Figma (`Bionta Design`) con componentes P0 y P1 de la auditoría `595:4888` publicados.
- Tipografía Clash Display, 10 text styles + 15 variables (ver `typography_system.md`).
- Paleta Bionta: amarillo `#FFC200`, oscuro `#1E1E1E`, blanco roto.
- Outlier a resolver antes de publicar: `Button` DS (node `442:212`) usa Inter — normalizar a Clash Display Medium 16.

### 7.2 Analítica

- **Plataforma:** por definir (GA4 como mínimo; evaluar Mixpanel o PostHog para funnels finos). Ver §10.
- **Eventos core v1:**
  - `home_view`, `home_cta_click`, `home_selector_change`
  - `pdp_view` (con `modalidad`, `tamano`), `pdp_size_change`, `pdp_gallery_interact`, `pdp_seasonal_block_view`
  - `picker_open`, `fruit_add`, `fruit_remove`, `box_complete`
  - `atc`, `cart_view`, `cart_update`, `cart_remove`
  - `checkout_start`, `checkout_step_complete`, `checkout_error`, `purchase`
  - `signup`, `login`, `password_reset_request`
  - `calendar_view`, `faq_view`
- **KPIs baseline** (medir desde el día 1): visits, bounce, CR Home→ATC, CR Home→Purchase, AOV, % nuevos vs recurrentes.

### 7.3 Pagos

- **v1 mínimo:** tarjeta (débito/crédito). Apple Pay / Google Pay se consideran "nice to have" si el proveedor lo da out-of-the-box.
- **Proveedor:** decisión abierta entre Stripe (más ergonómico, buen SDK) y Redsys (bancario español, menos fricción regulatoria). Ver §10.
- **PSD2 / 3DS:** requerido en España. El proveedor lo gestiona.
- **Reembolsos:** totales y parciales desde backoffice. Comunicación al cliente por email automático.

### 7.4 Emails transaccionales

- **Proveedor:** decisión abierta (Postmark / Resend / SendGrid). Ver §10.
- **5 templates mínimos v1:**
  1. Confirmación de pedido.
  2. Pedido enviado (con tracking si aplica).
  3. Bienvenida (tras registro).
  4. Reset de contraseña.
  5. Reembolso procesado / fruta agotada con cambio.
- **Marca:** logo, paleta, tipografía Clash Display — consistencia con web.
- **SPF / DKIM / DMARC:** obligatorio antes de lanzar.

### 7.5 CDN de imágenes

- Necesario para fotos de producto, fruta individual y hero. Compatible con `srcset` / WebP / AVIF.
- Decisión abierta (Cloudinary / imgix / self-hosted en Cloudflare R2).

### 7.6 Error monitoring

- Sentry (frontend + backend) mínimo. Alerts a Slack/email para errores críticos.
- Log de pedidos fallidos con retención 90 días para debugging financiero.

### 7.7 Auth

- **Cliente:** email + contraseña. Magic link opcional en v2.
- **Staff:** email + contraseña. 2FA opcional en v1 (recomendado para rol Admin).
- **Gestión de sesión:** cookie httpOnly, SameSite=Lax, expiración razonable.

### 7.8 Responsive + accesibilidad

- **Mobile first** (360-430) — el comportamiento DTC en alimentación es mayoritariamente móvil.
- **Tablet** (768-1024) — soportado, no protagonista.
- **Desktop** (1440 canónico + 1920) — hero/layouts verificados en los dos.
- **AA básico:** contraste, focus visible, navegación por teclado, ARIA en selectores y picker, alt text en imágenes.

### 7.9 Infraestructura y despliegue

- Staging + producción separados.
- CI/CD mínimo: PR → checks → merge → deploy staging → promote a prod con aprobación.
- Backups DB diarios + prueba trimestral de restauración.

---

## 8. Dependencias críticas

Lo que **bloquea** v1 si no está resuelto a tiempo.

| Dependencia | Owner | Bloquea |
|---|---|---|
| **Backend de calendario de temporada** (API: frutas semana, stock, disponibilidad por modalidad) | Backend | PDPs + Home + Calendario público + Backoffice módulo core |
| **Backend de pricing dinámico** por SKU | Backend | PDPs + Home + Cart + Checkout |
| **Integración pasarela de pago** | Backend + Finanzas | Checkout + Order confirmation + Backoffice refunds |
| **Proveedor de email transaccional** + dominio + registros DNS | Backend + Ops | Onboarding cliente + confirmaciones |
| **Fotografía real de producto** (fruta + cajas) | Brand + Fotografía | Home + PDPs + Calendario + Emails |
| **Copy definitivo revisado por legal** | Brand + Legal | Todas las páginas con copy |
| **Sistema de componentes Figma publicado como librería** | DS | Implementación frontend |
| **Catálogo inicial de 3 testimonios reales** con consentimiento | CRM + Legal | Home + PDPs |
| **Matriz de envíos y tarifas definida** | Ops + Finanzas | Backoffice envíos + Checkout |
| **Políticas legales redactadas** (Términos, Privacidad, Cookies, Devolución) | Legal | Legales + Checkout |
| **Coherencia de pricing** entre modalidades (fix del bug heredado del Home actual) | Finanzas + Producto | Todas las páginas con precio |

---

## 9. Fuera de alcance (v1)

Declarado explícitamente para evitar scope creep.

- **Suscripción / Menús semanales.** Se menciona en nav pero no se pitchea ni se implementa. PDPs lo mencionan en "Próximos pasos".
- **Reviews / ratings** post-compra.
- **Programa de referidos.**
- **Blog / contenido editorial.**
- **Landings SEM por fruta** (`/caja-cerrada/mango` etc.).
- **Gifting / regalo** (envío a tercero, mensaje personalizado).
- **Wishlist / favoritos.**
- **Recomendaciones IA / pairings** ("si llevas piña, prueba lichi").
- **Guardar presets / "mi última caja"** en picker personalizable.
- **Multi-idioma.** v1 es solo ES. CAT/EN en v2.
- **Multi-moneda.** v1 es solo EUR.
- **Gift cards.**
- **Pago a plazos / financiación.**
- **B2B / pedidos grandes empresa.**

---

## 10. Decisiones abiertas

Pendientes de resolver antes o durante la ejecución de v1.

### Producto

- **Checkout: guest o account-required.** Propuesta: **guest allowed**, con opción "crear cuenta al final". Menos fricción, sigue permitiendo CRM.
- **Default de tamaño** en PDPs. Propuesta: **Grande** (maximiza AOV). Validar post-lanzamiento con A/B.
- **Capacidades del picker personalizable.** Propuesta: Grande=6 / Pequeña=3. Confirmar con operaciones.
- **Coherencia de pricing** entre modalidades. Propuesta: Cerrada vs Personalizable con mismo precio por tamaño (29/49). Confirmar con finanzas.
- **CMS-lite vs hardcoded.** Propuesta: **CMS-lite** (campos definidos editables desde backoffice) — nada de page builder. Detalle pendiente.
- **CTA sticky mobile** en PDPs y Cart. Validar con prototipo.

### Técnico

- **Proveedor de pago.** Stripe vs Redsys. Criterios: coste por transacción, soporte PSD2, facilidad de refunds desde backoffice, soporte Apple Pay/Google Pay out-of-the-box.
- **Proveedor de email transaccional.** Postmark / Resend / SendGrid. Criterios: deliverability, templates, logs, coste.
- **CDN de imágenes.** Cloudinary / imgix / Cloudflare R2 + workers.
- **Stack analítico.** GA4 obligatorio. Añadir PostHog o Mixpanel para funnels finos.
- **2FA staff.** Obligatorio para Admin en v1, opcional para Operaciones.
- **Auth magic link** para clientes. v2.
- **Hosting backend + frontend.** Decidir (Vercel / Cloudflare / propio).

### Operación

- **Ventana de entrega.** 24-48h asumido en copy; confirmar con logística.
- **Cobertura geográfica v1.** ¿España peninsular? ¿Baleares? ¿Canarias? ¿Portugal?
- **Política de sustitución** si fruta se agota entre pedido y envío. Propuesta: contactar al cliente por email con opciones (sustituir / reembolsar).
- **SLA de atención al cliente.** Definir antes de publicar Contacto.

---

## 11. Ruta de ejecución sugerida

Orden de sprints orientativo. Asume equipo pequeño (1-2 frontend, 1 backend, 1 diseño, 1 producto).

### Sprint 0 — Fundación (semanas 1-2)

- Publicar librería DS en Figma (P0 + P1 de auditoría).
- Definir stack técnico (frontend, backend, DB, pagos, email, CDN, hosting).
- Configurar staging + CI/CD mínimo.
- Cerrar decisiones abiertas técnicas (§10).
- Fotografía real de producto (sesión inicial).

### Sprint 1-2 — Storefront crítico (semanas 3-6)

- Implementar Home (nueva versión con 11 bloques del audit).
- Implementar PDP Cerrada + PDP Personalizable.
- Backoffice: Calendario de temporada (módulo core) + Productos.
- Backend: API de pricing, stock, calendario.

### Sprint 3-4 — Transacción (semanas 7-10)

- Cart (mini + página).
- Checkout multi-step.
- Integración pagos + Order confirmation.
- Emails transaccionales (5 templates).
- Backoffice: Pedidos (list + detalle) + refunds.

### Sprint 5 — Cuenta y confianza (semanas 11-12)

- Auth (login/register/reset).
- Mi Cuenta (dashboard + pedidos + direcciones + perfil).
- Calendario de temporada público.
- FAQ.
- Backoffice: Clientes.

### Sprint 6 — Operación sostenible (semanas 13-14)

- Backoffice: Contenido (textos/imágenes, testimonios, FAQ), Envíos, Staff, Promo codes, Reports.
- Legales + Cookies.
- 404 y estados de error.
- Contacto.

### Sprint 7 — Hardening y lanzamiento (semanas 15-16)

- QA end-to-end de los 10 casos de uso.
- Accesibilidad AA pass.
- Performance (Core Web Vitals).
- Pruebas de pagos en producción.
- Entrenamiento del equipo en backoffice.
- Soft launch con audiencia acotada.

**Tiempo total orientativo:** ~16 semanas. Ajustar según tamaño real del equipo y decisiones de §10.

---

## 12. Índice de PRDs hijos

PRDs ya escritos:

- ✓ `docs/prd-pdp-caja-cerrada.md`
- ✓ `docs/prd-pdp-caja-personalizable.md`
- ✓ `docs/home-audit-product-lens.md` (audit, no PRD, base para PRD Home)

PRDs pendientes de escribir (orden sugerido):

1. `prd-home.md` — nueva Home con los 11 bloques.
2. `prd-cart.md` — mini-cart + página de carrito.
3. `prd-checkout.md` — checkout multi-step.
4. `prd-auth.md` — login/register/reset.
5. `prd-backoffice-calendario.md` — módulo core Bionta.
6. `prd-backoffice-pedidos.md` — gestión de pedidos.
7. `prd-mi-cuenta.md` — sección cliente autenticado.
8. `prd-calendario.md` — calendario público.
9. `prd-emails-transaccionales.md` — 5 templates.
10. `prd-order-confirmation.md` — thank you + post-compra.
11. `prd-faq.md`, `prd-contacto.md`, `prd-legales.md` — páginas de contenido.
12. `prd-backoffice-contenido.md`, `prd-backoffice-envios.md`, `prd-backoffice-promo.md`, `prd-backoffice-reports.md`, `prd-backoffice-clientes.md`, `prd-backoffice-staff.md`.

---

## 13. Métricas de v1

**Si v1 funcionó, estas métricas deberían estar en verde 8 semanas post-lanzamiento.**

### Producto (conversión)

- **Conversión Home → compra:** ≥ 1.5% (benchmark DTC alimentación premium).
- **CR PDP → ATC:** ≥ 6% (tráfico directo), ≥ 12% (desde Home selector).
- **CR Checkout → Pago:** ≥ 70% (iniciado → completado).
- **AOV:** ≥ 45 € (empuje vía default Grande + cross-sell).
- **Bounce rate Home:** ≤ 45%.

### Operación

- **Pedidos procesados sin intervención de ingeniería:** 100%.
- **Tiempo medio orden → envío:** ≤ 24h.
- **% de pedidos con incidencia (reembolso o sustitución):** ≤ 5%.
- **Tiempo de respuesta a contacto cliente:** ≤ 24h laborables.

### Técnico

- **Core Web Vitals PDP:** LCP < 2.5s p75, INP < 200ms p75, CLS < 0.1 p75.
- **Uptime:** ≥ 99.5%.
- **Error rate frontend:** < 0.5% de sesiones con error bloqueante.
- **Deliverability email:** ≥ 95% inbox (no spam).

### Cualitativas

- Test moderado n=10 con clientes reales 4 semanas post-launch: ¿pueden explicar qué es Bionta, cómo funciona y qué recibirán esta semana?
- Encuesta NPS post-primera-entrega: benchmark inicial ≥ 30.

---

## 14. Próximos pasos

1. **Validar este PRD con el equipo** (1 sesión, 45 min). Cerrar §10 decisiones técnicas antes de arrancar sprint 0.
2. **Priorizar orden de PRDs hijos.** La lista de §12 es sugerencia; ajustar según equipo disponible.
3. **Cerrar pricing coherente.** Es ortogonal al rediseño y debe resolverse ya (ver `home-audit-product-lens.md`).
4. **Sesión de fotografía real.** Producto sin fotos reales bloquea casi todo.
5. **Arrancar sprint 0** con fundación (DS, stack, staging, CI/CD).

---

## Apéndice — vínculos

- Auditoría Home: `docs/home-audit-product-lens.md`.
- PRD PDP Caja Cerrada: `docs/prd-pdp-caja-cerrada.md`.
- PRD PDP Caja Personalizable: `docs/prd-pdp-caja-personalizable.md`.
- Contexto de negocio: `.claude/memory/business_context.md`.
- Auditoría componentización: `.claude/memory/audit_componentization_2026-04-23.md`, página Figma `🧩 Componentización — Auditoría` (`595:4888`).
- Sistema tipográfico: `.claude/memory/typography_system.md`, página Figma `🔤 Typography` (`602:5186`).
- Archivo Figma: [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design).
