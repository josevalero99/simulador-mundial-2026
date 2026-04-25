# PRD — Auth (Login / Registro / Reset)

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Páginas:** Login, Registro, Solicitar reset, Confirmar reset
- **Rutas propuestas:** `/login`, `/registro`, `/recuperar-contrasena`, `/recuperar-contrasena/confirmar?token=…`
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-25
- **Estado:** Draft v1 — pendiente de revisión
- **Archivo Figma:** [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)

---

## 1. TL;DR

Auth en v1 es **infraestructura de confianza**, no un punto de fricción. Un cliente compra como invitado en checkout y se le ofrece **crear cuenta al final** para guardar pedido, dirección y poder volver a comprar en 1 click. Login y reset existen para clientes que ya tienen cuenta.

**Tres pantallas + un email**: Login, Registro, Solicitar reset (envía email con token) y Confirmar nueva contraseña. No hay social login, no hay magic link, no hay 2FA cliente.

**Objetivos:**

1. **No bloquear la compra.** Checkout siempre permite invitado (account-required nunca).
2. **Recuperar identidad** con un flujo de password reset que funcione a la primera.
3. **Asentar la base** para Mi Cuenta y para emails transaccionales con identidad real.

---

## 2. Contexto y problema

Hoy Bionta no tiene cuentas de cliente. v1 lo necesita para que un cliente vea su pedido en Mi Cuenta (CU-3 del PRD v1), pueda recuperar su contraseña (CU-4) y la operación pueda asociar incidencias a una identidad estable.

**Problema a resolver:**

- Sin cuenta, el cliente no puede consultar su pedido sin llamar/escribir a Bionta.
- Sin auth, no podemos enviar emails transaccionales asociados a un usuario (solo a un pedido huérfano).
- Sin reset, un cliente que olvide la contraseña queda excluido de Mi Cuenta.

**Decisiones tomadas (referencia PRD v1):**

- **Checkout = guest-allowed** con opción "crear cuenta al final". Sin account-required.
- **Auth = email + contraseña.** Magic link va a v2. Social login no entra ni en v2 inicial.
- **Sesión** = cookie httpOnly, SameSite=Lax, expiración razonable (ver §7).
- **Recuperación** = email con token de un solo uso, expiración corta.

---

## 3. Objetivos / No-objetivos / Fuera de alcance

### Objetivos

- Que un cliente con cuenta pueda **iniciar sesión en ≤ 15s** desde que abre `/login`.
- Que un cliente nuevo pueda **crear cuenta en ≤ 30s** desde el modal de checkout.
- Que un cliente que olvide la contraseña pueda **recuperarla sin contacto humano** en menos de 5 minutos.
- Que la **identidad esté asociada al pedido** desde el primer login (no pedidos huérfanos).

### No-objetivos (v1)

- **No** social login (Google, Apple, Facebook).
- **No** magic link (email-only sign-in sin password).
- **No** 2FA en cliente (sí evaluado para staff Admin, fuera de este doc).
- **No** verificación obligatoria de email antes de comprar (se verifica de forma asíncrona).
- **No** auto-merge de cuenta si un guest checkoutó con un email que ya tiene cuenta — esto se maneja con un mensaje claro en el registro post-checkout.

### Fuera de alcance del doc

- Diseño del **modal de "crear cuenta al final del checkout"** — vive en `prd-checkout.md` pendiente.
- Diseño de **Mi Cuenta** — vive en `prd-mi-cuenta.md`.
- **Auth de staff/backoffice** — flujo separado, mismo backend, distinta UI.
- **Mecánica de tokens y backend de sesión** — implementación, no producto.

---

## 4. Usuarios y Jobs to be Done

### Perfil primario — "Cliente que ya compró"

- Compró una vez como invitado, creó cuenta al final del checkout.
- Vuelve a la web 2-6 semanas después.
- No recuerda la contraseña en el 30-40% de los casos (benchmark sector).

**JTBD 1:** *Cuando vuelvo a Bionta tras comprar, quiero entrar a mi cuenta para ver pedidos pasados y comprar otra vez sin volver a escribir mis datos.*

**JTBD 2:** *Cuando olvido la contraseña, quiero recuperarla por email sin tener que escribir a soporte.*

### Perfil secundario — "Cliente nuevo en checkout"

- Llega a checkout como invitado, completa el pago.
- Decide si crear cuenta al final (decisión de bajo coste cognitivo: "guardar mi pedido para verlo luego").

**JTBD 3:** *Cuando acabo de pagar, quiero guardar mi pedido en una cuenta para poder consultarlo y para que la próxima compra sea más rápida.*

---

## 5. Pantallas y flujos

### 5.1 Mapa de flujos

```
Header → "Iniciar sesión"  ─────────► /login ──► (ok) ──► Mi Cuenta / Dashboard
                                       │
                                       ├──► "Crear cuenta" ──► /registro ──► (ok) ──► Mi Cuenta
                                       │
                                       └──► "¿Olvidaste tu contraseña?" ──► /recuperar-contrasena
                                                                              │
                                                                              ▼
                                                                          email con token
                                                                              │
                                                                              ▼
                                                              /recuperar-contrasena/confirmar?token=…
                                                                              │
                                                                              ▼
                                                                  (set new password) ──► /login (prefilled email)


Checkout (guest) → "Pagar" ──► (ok) ──► Order Confirmation
                                            │
                                            └──► [Crear cuenta] (modal/inline)
                                                       │
                                                       ▼
                                                 cuenta creada, pedido asociado
                                                       │
                                                       ▼
                                                  Mi Cuenta
```

### 5.2 Pantallas v1

| # | Pantalla | Ruta | Prio |
|---|---|---|---|
| 1 | **Login** | `/login` | P0 |
| 2 | **Registro** (estandalone, no checkout) | `/registro` | P0 |
| 3 | **Solicitar reset** | `/recuperar-contrasena` | P0 |
| 4 | **Confirmar reset** (con token) | `/recuperar-contrasena/confirmar?token=…` | P0 |
| 5 | **Email: bienvenida** (post-registro) | n/a | P0 — `prd-emails-transaccionales.md` |
| 6 | **Email: solicitar reset** | n/a | P0 — `prd-emails-transaccionales.md` |
| 7 | **Estado: enlace expirado** (al abrir token caducado) | inline en pantalla 4 | P0 |
| 8 | **Estado: enlace ya usado** | inline en pantalla 4 | P0 |
| 9 | **Estado: cuenta bloqueada por intentos** | inline en pantalla 1 | P1 |

---

## 6. Specs por pantalla

### 6.1 Login (`/login`)

**Layout:**

- Card centrada (max ~440px ancho), sobre fondo cream warm (`#f1ebde`).
- Logo Bionta arriba (link a `/`).
- Header: `Bienvenida de nuevo` (Clash Display Medium 28).
- Subtítulo: `Entra a tu cuenta para ver tus pedidos y volver a comprar.` (Regular 15, gris #7a7366).
- Form vertical, gap 16.

**Campos:**

| Campo | Tipo | Validación | Mensaje de error |
|---|---|---|---|
| Email | `input[type=email]` | required, formato email | `Introduce un email válido.` |
| Contraseña | `input[type=password]` con toggle "mostrar" | required, min 1 carácter (la validación de fortaleza es del backend) | `Introduce tu contraseña.` |

**Acciones:**

- **Botón primario:** `Entrar` — amarillo `#ffc200`, texto dark, full-width, Semibold 15.
- **Link secundario:** `¿Olvidaste tu contraseña?` → `/recuperar-contrasena` (debajo del campo password, alineado a la derecha).
- **Pie de card:** `¿Aún no tienes cuenta? Crear cuenta` → `/registro` (link verde `#2f4a2b`, separado por divider sutil).

**Estados:**

| Estado | Comportamiento |
|---|---|
| Default | Form vacío, botón habilitado. |
| Loading | Botón muestra spinner y texto `Entrando…`, deshabilitado. Inputs deshabilitados. |
| Error credenciales | Mensaje bajo el form: `Email o contraseña incorrectos.` (no especificar cuál — seguridad). Roja sobre fondo crema, sin shake. |
| Error red | `No hemos podido conectar. Inténtalo de nuevo.` |
| Cuenta bloqueada | (Si tras N intentos fallidos — ver §7.2) `Demasiados intentos. Espera 15 minutos o recupera tu contraseña.` |
| Sesión expirada (al volver) | Banner top: `Tu sesión ha expirado. Vuelve a entrar.` |

**Redirecciones:**

- Default tras login OK: `/mi-cuenta` (Dashboard).
- Si llegó con `?redirect=<ruta>`: respetar el redirect siempre que sea ruta interna (whitelist).
- Si llegó desde checkout (cookie `bionta_redirect_after_login=/checkout`): volver a checkout.

### 6.2 Registro (`/registro`)

**Layout:** mismo patrón que Login (card centrada, fondo cream warm).

**Header:** `Crea tu cuenta`
**Subtítulo:** `Guarda tus pedidos, direcciones y compra en 1 click la próxima vez.`

**Campos:**

| Campo | Tipo | Validación | Mensaje de error |
|---|---|---|---|
| Nombre | text | required, min 2 chars | `Indícanos cómo te llamamos.` |
| Email | email | required, formato email, único | `Introduce un email válido.` / `Ya existe una cuenta con este email. ¿Quieres entrar?` (link a /login) |
| Contraseña | password con toggle mostrar | required, min 8 chars, debe contener al menos 1 letra y 1 número | `Mínimo 8 caracteres con al menos una letra y un número.` |
| Acepto términos | checkbox | required | `Necesitas aceptar los términos para continuar.` |

**Sin** confirmación de contraseña (toggle mostrar es suficiente, evita fricción innecesaria).

**Acciones:**

- **Botón primario:** `Crear cuenta` (amarillo, full-width).
- **Pie de card:** `¿Ya tienes cuenta? Entrar` → `/login`.

**Texto legal del checkbox:** `Acepto los Términos y Condiciones y la Política de Privacidad.` (links abren en nueva pestaña).

**Comportamiento post-registro:**

1. Crear cuenta en backend, iniciar sesión automática.
2. Disparar email de bienvenida (asíncrono, no bloquea UI).
3. Redirigir a `/mi-cuenta` o respetar `?redirect=`.

**Estados:** mismos patrones que Login (default, loading, error red, error de validación inline por campo).

### 6.3 Solicitar reset (`/recuperar-contrasena`)

**Layout:** card centrada, mismo lenguaje.

**Header:** `Recupera tu contraseña`
**Subtítulo:** `Te enviaremos un email con un enlace para crear una nueva.`

**Campos:**

| Campo | Tipo | Validación |
|---|---|---|
| Email | email | required, formato email |

**Acciones:**

- **Botón primario:** `Enviar enlace` (amarillo).
- **Link:** `Volver a iniciar sesión` → `/login`.

**Comportamiento:**

- **Siempre** mostrar el mismo mensaje de éxito tras submit (haya cuenta o no), para no filtrar qué emails están registrados:
  > **Revisa tu correo.** Si hay una cuenta asociada a `usuario@email.com`, recibirás un enlace para crear una nueva contraseña en los próximos minutos.
- Email enviado **solo si la cuenta existe** (decisión de seguridad clásica).
- Botón `Reenviar` disponible tras 60s.

### 6.4 Confirmar reset (`/recuperar-contrasena/confirmar?token=…`)

**Layout:** card centrada.

**Header:** `Crea una contraseña nueva`
**Subtítulo:** `Para tu cuenta bionta@email.com.` (mostrar email solo si el token es válido).

**Campos:**

| Campo | Tipo | Validación |
|---|---|---|
| Nueva contraseña | password con toggle | min 8 chars + letra + número |

**Acciones:**

- **Botón primario:** `Guardar y entrar`. Tras OK: cierra sesiones activas en otros dispositivos, inicia nueva sesión, redirige a `/mi-cuenta`.

**Estados de error específicos (P0):**

| Estado | Mensaje | Acción |
|---|---|---|
| Token inválido o malformado | `Este enlace no es válido. Solicita uno nuevo.` | Botón `Solicitar nuevo enlace` → `/recuperar-contrasena` |
| Token expirado | `Este enlace ha caducado. Los enlaces son válidos durante 30 minutos.` | Botón `Solicitar nuevo enlace` |
| Token ya usado | `Este enlace ya se ha usado. Si necesitas cambiar la contraseña, solicita uno nuevo.` | Botón `Solicitar nuevo enlace` |

---

## 7. Reglas de negocio

### 7.1 Sesión

- **Tipo:** cookie httpOnly, SameSite=Lax, Secure en producción.
- **Duración:** 30 días sliding (se renueva en cada request autenticada).
- **Logout:** invalida la cookie en backend y frontend; lleva a `/`.
- **Multi-dispositivo:** permitido (sesiones simultáneas en N dispositivos). El reset de contraseña invalida todas.

### 7.2 Password y antiabuso

- **Política de contraseña:** mínimo 8 chars + al menos 1 letra + 1 número. Sin obligar mayúsculas ni símbolos (más seguro y menos fricción que reglas estrictas — alineado con NIST 2024).
- **Hashing:** bcrypt o argon2 en backend (decisión técnica, no de producto).
- **Rate limit login:** 5 intentos fallidos por (email, IP) en 15 min → bloqueo temporal de 15 min con mensaje.
- **Rate limit reset:** 3 solicitudes de reset por email en 15 min → silencioso (mostrar mensaje genérico igualmente).
- **Token reset:** un solo uso, expira en 30 min, invalidado al usarse o al solicitar uno nuevo.

### 7.3 Email único

- Un email = una cuenta. Si alguien intenta registrarse con un email existente, mostrar el error con link a `/login`.

### 7.4 Asociación de pedido

- Un pedido hecho como invitado guarda el email del comprador.
- Si más tarde se crea cuenta con ese mismo email, **todos los pedidos previos con ese email se asocian automáticamente** a la cuenta. Esto permite ver historial completo desde el primer login.
- Si el email no coincide, no se asocia (no merge automático ambiguo).

### 7.5 Verificación de email

- v1: **no bloqueante**. Email de bienvenida con un link de verificación opcional. Si no se verifica, no se restringen funcionalidades. Razonamiento: el cliente ya pagó como invitado, exigir verificación añade fricción sin ganancia clara.
- v2: evaluable según incidencias.

---

## 8. Integraciones

| Sistema | Cómo | Cuándo |
|---|---|---|
| **Email transaccional** | Trigger `signup` → bienvenida; `password_reset_request` → email con token. | Inmediato, asíncrono |
| **Mi Cuenta** | Tras login OK, redirige a `/mi-cuenta`. La sesión se asume desde ahí. | En cada login |
| **Checkout** | Modal "Crear cuenta" se sirve tras pago OK con email pre-rellenado. Reutiliza el endpoint de `/registro`. | Solo al final del checkout |
| **Header global** | Si no hay sesión: `Iniciar sesión`. Si hay sesión: `Mi cuenta` (avatar/icono). | Siempre |

---

## 9. Eventos analytics

Eventos a emitir desde el frontend (alineado con §7.2 de PRD v1):

| Evento | Trigger | Props |
|---|---|---|
| `signup_view` | Carga `/registro` o modal post-checkout | `source` (page/checkout) |
| `signup_submit` | Click en `Crear cuenta` | `source` |
| `signup_success` | Cuenta creada y sesión iniciada | `source`, `user_id` |
| `signup_error` | Error de validación o backend | `source`, `error_code`, `field` |
| `login_view` | Carga `/login` | `redirect_to` (si aplica) |
| `login_submit` | Click en `Entrar` | — |
| `login_success` | Sesión iniciada | `user_id` |
| `login_error` | Error | `error_code` |
| `password_reset_request` | Submit en `/recuperar-contrasena` | — |
| `password_reset_complete` | Submit en `/recuperar-contrasena/confirmar` con token válido | — |
| `logout` | Click en logout | `from_page` |

Sin tracking de PII (email, contraseñas) — solo `user_id` opaco.

---

## 10. Métricas de éxito (8 semanas post-launch)

- **Tasa de registro post-checkout:** ≥ 35% de pedidos como invitado terminan creando cuenta. (Benchmark: 25-50% según fricción).
- **Tasa de login exitoso:** ≥ 90% de los `login_submit` terminan en `login_success` al primer intento.
- **Tasa de uso de reset:** % de usuarios que solicita reset tras failed login → ≥ 60% (significa que el flujo es descubrible).
- **Tasa de éxito reset:** ≥ 80% de `password_reset_request` terminan en `password_reset_complete` en menos de 24h.
- **Soporte por incidencias auth:** ≤ 1% de cuentas activas/mes generan ticket de soporte de auth.

---

## 11. Decisiones cerradas (v1)

Decisiones tomadas para v1. Reabrir requiere acuerdo explícito.

- **Destino post-registro desde checkout:** redirigir al **detalle del pedido recién hecho** (más relevante que el dashboard en ese momento). Si el registro es desde `/registro` directo, redirigir a `/mi-cuenta` (dashboard).
- **Anti-abuso visible (CAPTCHA tras 3 fallos):** **no en v1**. Solo rate limit silencioso de §7.2. Se reevalúa según logs si aparece tráfico abusivo.
- **Registro pide nombre:** **sí**. Campos = nombre + email + password + checkbox términos. El nombre se usa en bienvenida del email y header de Mi Cuenta.
- **Retención de cuentas inactivas:** aviso a los **18 meses** sin actividad, baja automática (anonimización) a los **24 meses**. Texto incluido en T&C.
- **Checkbox "Mantener sesión iniciada":** **no**. Sliding 30 días por defecto sin checkbox. Más simple, menos decisión cognitiva.

---

## 12. Próximos pasos

1. **Revisar este PRD** con el equipo (15 min).
2. **Cerrar §11** decisiones abiertas.
3. **Diseñar las 4 pantallas** en Figma desktop con el lenguaje establecido (cards radius 16, paleta cream/green/yellow, Clash Display).
4. **Coordinar con `prd-emails-transaccionales.md`** los textos de los emails de bienvenida y reset.
5. **Coordinar con `prd-checkout.md`** el modal de "crear cuenta al final" para reutilizar componente y endpoint.

---

## Apéndice — vínculos

- PRD v1: `docs/prd-v1-alcance.md` (este doc cubre #7 Auth).
- PRD Mi Cuenta: `docs/prd-mi-cuenta.md` (asociado).
- Casos de uso afectados: CU-3 (registro post-checkout), CU-4 (recuperar contraseña).
- Archivo Figma: [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design).
