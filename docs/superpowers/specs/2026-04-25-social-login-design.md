# Spec — Social Login (Google + Apple) en v1

- **Producto:** Bionta — cajas de fruta tropical de temporada
- **Pantallas afectadas:** `/login`, `/registro`, modal "Crear cuenta" post-checkout (Out-of-scope visual en este spec, queda apuntado para cuando se diseñe `prd-checkout.md`)
- **Documento padre:** `docs/prd-auth.md`
- **Autor:** Product (Bionta)
- **Fecha:** 2026-04-25
- **Estado:** Draft v1 — pendiente de revisión

---

## 1. TL;DR

Reabrimos la decisión "no social login" del PRD de Auth y añadimos **Google + Apple** como alternativa de identidad en v1. Email + contraseña sigue siendo el camino primario (form arriba); Google y Apple aparecen debajo bajo un divider `o continúa con`. Auto-linking silencioso por email coincidente. Cumplimiento RGPD con consentimiento explícito de términos al usar la vía social.

**No entra:** Facebook (revisable v2), magic link (v2), 2FA cliente.

---

## 2. Por qué reabrimos la decisión

Decisión original (PRD §3): "No social login (Google, Apple, Facebook)". Razonamiento implícito: minimizar scope v1 y latency to market.

Razones para reabrir:
1. La fricción de email+password es la principal causa de abandono en signup (benchmarks 25-50% drop). Social login reduce ese drop.
2. El cliente típico de Bionta (perfil compra recurrente cada 2-6 semanas) olvida la contraseña en el 30-40% de los casos. Social la elimina.
3. El coste de implementar Google + Apple OAuth en backend es bajo en comparación con la ganancia de conversión esperada.
4. Apple Sign In es percibido como señal de calidad/privacidad — alineado con el posicionamiento premium de Bionta.

---

## 3. Decisiones cerradas

| Decisión | Valor | Justificación |
|---|---|---|
| **Providers** | Google + Apple | Cobertura suficiente; Facebook se evalúa en v2 según demanda real |
| **Pantallas** | Login, Registro, modal post-checkout | Maximiza conversión en el momento de mayor intención (post-pago) |
| **Posición en form** | Email arriba, social abajo con divider | Mantiene email como identidad primaria; coherente con cuentas v1.0 ya emitidas |
| **Orden Google/Apple** | Google arriba, Apple abajo | Mayor base instalada en España; Apple HIG no exige primer lugar en web |
| **Estilo visual** | Híbrido pragmático | Logos oficiales + tipografía Bionta (Clash Display) + radius 16 — cumple guidelines y mantiene coherencia |
| **Colisión por email** | Auto-linking silencioso | Coherente con §7.4 (auto-merge de pedidos por email); fricción mínima |
| **Apple privacy relay** | Cuenta separada por `sub` | Si Apple oculta el email, no se puede hacer auto-linking — se trata como identidad nueva |
| **Texto botones** | "Continuar con Google" / "Continuar con Apple" | Verbo aceptado por ambas guidelines; coherente entre los dos botones |
| **Scopes solicitados** | Google: `openid email profile`; Apple: `name email` | Data minimization (RGPD) — solo lo imprescindible. `openid` es necesario para recibir el ID token de OIDC. |

---

## 4. Specs visuales

### 4.1 Divider `o continúa con`

- Texto: `o continúa con` (Inter Regular 13, color `#7a7366`).
- Línea: 1px `#e6dfce`, 24px de margen vertical arriba y abajo.
- Texto centrado con padding horizontal 12px sobre la línea.

### 4.2 Botón Google

| Propiedad | Valor |
|---|---|
| Fondo | `#ffffff` |
| Borde | 1px `#d9d2bf` |
| Radius | 16px |
| Altura | 48px |
| Width | full-container |
| Padding | 14px 16px |
| Logo | `G` multicolor oficial 18×18 a la izquierda |
| Gap logo→texto | 12px |
| Texto | `Continuar con Google` — Clash Display Semibold 15, color `#1e1e1e` |

**Estados:**
- Hover: borde `#1e1e1e`.
- Pressed: fondo `#f7f3e8`.
- Loading: spinner 16px en lugar del logo, texto cambia a `Conectando…`.
- Disabled: opacidad 50%, cursor not-allowed.

### 4.3 Botón Apple

| Propiedad | Valor |
|---|---|
| Fondo | `#000000` |
| Borde | ninguno |
| Radius | 16px |
| Altura | 48px |
| Width | full-container |
| Padding | 14px 16px |
| Logo | Asset oficial de Sign in with Apple (logotipo blanco, 16×18) a la izquierda |
| Gap logo→texto | 12px |
| Texto | `Continuar con Apple` — Clash Display Semibold 15, color `#ffffff` |

**Estados:**
- Hover: fondo `#1e1e1e`.
- Pressed: fondo `#2a2a2a`.
- Loading: spinner blanco 16px en lugar del logo, texto `Conectando…`.
- Disabled: opacidad 50%.

### 4.4 Spacing entre los dos botones

- Gap vertical entre Google y Apple: **12px** (intencionalmente más tight que los 16px del form — agrupa los dos botones sociales visualmente como un par, separado del bloque email).
- Gap entre el último botón social y el divider/footer de la card: 24px.

---

## 5. Estructura por pantalla

### 5.1 Login (`/login`)

```
[Logo Bionta]
Bienvenida de nuevo
Entra a tu cuenta para ver tus pedidos y volver a comprar.

[Email]
[Contraseña + toggle mostrar]
                    ¿Olvidaste tu contraseña?

[ Entrar ]                                ← amarillo primary

──── o continúa con ────                  ← divider nuevo

[ G  Continuar con Google ]               ← nuevo
[    Continuar con Apple  ]               ← nuevo

─────────────────────────
¿Aún no tienes cuenta? Crear cuenta
```

### 5.2 Registro (`/registro`)

```
[Logo Bionta]
Crea tu cuenta
Guarda tus pedidos, direcciones y compra en 1 click la próxima vez.

[Nombre]
[Email]
[Contraseña + toggle mostrar]
☐ Acepto los Términos y Condiciones y la Política de Privacidad.

[ Crear cuenta ]                          ← amarillo primary

──── o continúa con ────

[ G  Continuar con Google ]
[    Continuar con Apple  ]

Al continuar con Google o Apple aceptas
los Términos y Condiciones y la Política
de Privacidad.                            ← Inter Regular 12, gris

─────────────────────────
¿Ya tienes cuenta? Entrar
```

**Nota legal:** el checkbox de términos sigue obligatorio para la vía email. Para la vía social, el consentimiento se da implícitamente al pulsar el botón con el texto explicativo debajo (válido bajo RGPD si el texto es claro y los enlaces a T&C y Privacidad son visibles).

### 5.3 Modal post-checkout

Mismo patrón que Registro pero:
- Sin campo nombre (ya lo sabemos del pedido).
- Email pre-rellenado y no editable.
- Sin checkbox términos visible (heredado del consentimiento del propio checkout).
- Diseño visual queda fuera de scope de este spec; se diseña con `prd-checkout.md`.

---

## 6. Comportamiento

### 6.1 Flujo OK

1. Click en `Continuar con Google` → popup OAuth de Google (no full-page redirect).
2. Usuario consiente en Google → popup se cierra, botón pasa a loading 200-800ms mientras backend valida token.
3. Backend resuelve sesión y la página redirige a `/mi-cuenta` (o respeta `?redirect=`).

Mismo flujo con Apple. Apple solo devuelve nombre + email **la primera vez** que el usuario consiente — backend persiste esos datos en la primera respuesta.

### 6.2 Auto-linking

- Email del proveedor coincide con cuenta email+password existente → backend vincula identidad social a la cuenta de forma silenciosa, entra. Sin pantalla intermedia.
- Email del proveedor coincide con cuenta que ya tiene Google vinculado → entra normal.
- Apple devuelve `@privaterelay.appleid.com` → trata el `sub` de Apple como identidad estable, **no hace auto-linking por email**, crea cuenta nueva.

### 6.3 Errores

| Estado | Mensaje | Tratamiento |
|---|---|---|
| Usuario cancela popup | (silencioso, vuelve al estado default) | No es error |
| Popup bloqueado | `Activa los popups para entrar con Google/Apple, o usa email y contraseña.` | Inline bajo los botones |
| Error de red | `No hemos podido conectar. Inténtalo de nuevo.` | Inline |
| Token inválido | `El servicio no está disponible. Entra con email y contraseña mientras lo solucionamos.` | Inline |
| Email no verificado en Google | `Tu cuenta de Google necesita un email verificado para continuar.` | Inline |

### 6.4 Concurrencia

Cuando un botón está en loading, los otros botones (social y email) se deshabilitan (atenuados) hasta que resuelva. Evita dobles auths concurrentes.

---

## 7. Integraciones backend (resumen, detalle en implementación)

| Sistema | Cómo | Cuándo |
|---|---|---|
| **Google Identity Services** | OIDC, scopes `openid email profile` | Click botón Google |
| **Sign in with Apple** | OAuth 2.0 / OIDC con JWT firmado, scopes `name email` | Click botón Apple |
| **Backend auth service** | Endpoint `/auth/social/{provider}` que recibe el token, valida, crea/recupera cuenta, emite cookie de sesión | Tras callback OAuth |

---

## 8. Eventos analytics

Extiende §9 del PRD de Auth.

| Evento | Trigger | Props |
|---|---|---|
| `social_login_click` | Click en botón Google/Apple | `provider` (google/apple), `source` (login/registro/checkout_modal) |
| `social_login_success` | Sesión iniciada vía social | `provider`, `is_new_account` (true/false), `linked_to_existing` (true/false) |
| `social_login_error` | Cualquier error del flujo OAuth | `provider`, `error_code` |

---

## 9. Métricas de éxito (8 semanas post-launch)

Extiende §10 del PRD de Auth.

- **% de signups vía social** (de `/registro` y modal post-checkout): hipótesis ≥ 30%. Validar.
- **% de logins vía social**: tracking informativo, sin objetivo.
- **Tasa de error social_login_error / social_login_click**: ≤ 5%. Si sube, indicar problema con popup blockers o config OAuth.

---

## 10. Cambios a aplicar al PRD `prd-auth.md`

Lista de ediciones concretas para mantener el PRD coherente:

| § | Cambio |
|---|---|
| §2 Decisiones tomadas | Sustituir "Auth = email + contraseña. Magic link va a v2. Social login no entra ni en v2 inicial." por "Auth = email + contraseña + social login (Google + Apple). Magic link va a v2." |
| §3 No-objetivos | Quitar "No social login (Google, Apple, Facebook)". Añadir "No Facebook login (revisable v2 según demanda)." y "No magic link (v2)." |
| §5.2 Pantallas v1 | Añadir nota a Login y Registro: "Incluye botones de Google y Apple bajo el form email." |
| §6.1 Login | Nueva subsección `Social login` referenciando este spec |
| §6.2 Registro | Misma subsección + nota sobre texto legal RGPD |
| §7 | Nueva §7.6 `Social login` con providers, scopes, auto-linking, manejo Apple relay |
| §8 Integraciones | Nueva fila `OAuth Providers — Google Identity / Sign in with Apple` |
| §9 Analytics | Añadir 3 eventos de social login |
| §10 Métricas | Añadir % signups social como hipótesis |
| §11 Decisiones cerradas | Añadir filas: providers, orden, auto-linking, Apple relay |

---

## 11. Scope de cambios en Figma

Cuando Desktop Bridge esté conectado:

1. Localizar la card de Login (`node-id 666:5370`) y la card de Registro.
2. Crear dos componentes nuevos en la página `Components` (`147:3`):
   - `Button / Social / Google` con variantes default, hover, pressed, loading, disabled.
   - `Button / Social / Apple` con las mismas variantes.
3. Insertar en la card de Login: divider `o continúa con` + instancias de los dos botones.
4. Insertar en la card de Registro: lo mismo + reposicionar checkbox de términos arriba del divider + texto legal pequeño bajo los botones sociales.
5. Screenshots de validación después de cada cambio.

**Fuera de scope de este pase:**
- Pantallas de reset de contraseña (no llevan social login).
- Estados de error como mocks separados (viven como notas en este spec).
- Modal post-checkout completo (pendiente de `prd-checkout.md`).

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Apple bloquea la cuenta de developer si no respetamos guidelines de su botón | Estilo híbrido respeta logo, contraste, espaciado y texto permitido. Revisar con Apple antes de producción. |
| Auto-linking silencioso percibido como inseguro | Documentar en T&C que tener acceso al email es prueba suficiente de identidad (alineado con password reset). Riesgo bajo en práctica. |
| Popup blockers bloquean OAuth | Mensaje de error claro + fallback a email/password siempre disponible. |
| Apple privacy relay rompe el modelo de "email único = cuenta única" | Tratamos el `sub` de Apple como identidad estable; el email relay se persiste como contacto. Si el relay se desactiva (Apple permite al usuario revocar), el cliente debe poder cambiar email manualmente en Mi Cuenta (out-of-scope v1, evaluar en `prd-mi-cuenta.md`). |

---

## Apéndice — vínculos

- PRD Auth: `docs/prd-auth.md`
- PRD v1: `docs/prd-v1-alcance.md`
- Archivo Figma: [Bionta Design](https://www.figma.com/design/v34S6c0aQGYqHY1eFIq48z/Bionta-Design)
- Google Identity Services docs: <https://developers.google.com/identity/gsi/web>
- Sign in with Apple JS docs: <https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js>
