# Análisis de estado y plan de negocio — Bionta v1

- **Producto:** Bionta — cajas de fruta tropical de temporada (DTC)
- **Versión:** v1 — lectura estratégica
- **Fecha:** 2026-04-24
- **Estado:** Draft — segunda opinión para validación con fundador
- **Documentos relacionados:** `prd-v1-alcance.md`, `prd-pdp-caja-cerrada.md`, `prd-pdp-caja-personalizable.md`, `home-audit-product-lens.md`

---

## TL;DR

Bionta está en **pre-ejecución sólida**: PRD v1 disciplinado, backlog Jira de 289 issues y Figma avanzado, pero **cero código** y decisiones de stack abiertas. La fecha de lanzamiento realista-optimista es **30 oct 2026 (soft) / 20 nov 2026 (apertura comercial)** para capturar campaña de Navidad.

Sin suscripción (v1 tal como está): facturación año 1 estimada **35-55K €**, LTV/CAC marginal, requiere **60-115K €** de capital. Con suscripción añadida en mes 6 post-launch (v1.5): facturación año 1 estimada **90-130K €**, LTV/CAC sano (5-10x), requiere **10-60K €** de capital.

**Recomendación:** no lanzar v1 puro. Renombrar como v1.5 e incluir suscripción mínima viable en Sprint 6-7 antes del launch, o como máximo en mes 3 post-launch. El negocio sin recurrencia en DTC fresco perecedero es estructuralmente frágil.

---

## 1. Estado actual del proyecto (2026-04-24)

### 1.1 Lo que está hecho

- PRD maestro v1 con 17 páginas frontend, 14 módulos backoffice y 10 casos de uso canónicos end-to-end.
- PRDs hijos escritos: PDP caja cerrada, PDP caja personalizable, auditoría de Home con propuesta de 11 bloques.
- Backlog Jira en proyecto `KAN`: 11 Epics, 56 historias, 222 subtasks, labels namespaced por disciplina y sprint.
- Sistema tipográfico definido (Clash Display, 10 text styles + 15 variables).
- Auditoría de componentización priorizada P0/P1/P2.
- Fotografía de marca parcial (hero, moodboard).

### 1.2 Lo que no está hecho

- **0 líneas de código.** No hay frontend, backend, base de datos ni integraciones.
- **Stack técnico no decidido.** Pagos (Stripe vs Redsys), email transaccional, CDN de imágenes, hosting — todo abierto en §10 del PRD.
- **Sin fotografía real de producto.** Se depende de una sesión que todavía no está planificada.
- **11 PRDs hijos pendientes** (Home, Cart, Checkout, Auth, Mi Cuenta, Calendario público, Emails, Order confirmation, FAQ, Contacto, Legales + 6 de backoffice).
- **Pricing incoherente** entre modalidades (bug heredado del Home actual).
- **Legales sin redactar.** Términos, Privacidad, Cookies, Política de devolución alimentos frescos.
- **Testimonios reales:** 0 capturados.
- **Matriz de envíos y tarifas:** no definida (coste de Seur Frío / Nacex refrigerado / tiempos por zona).
- **Cobertura geográfica:** sin definir (Península, Baleares, Canarias, Portugal).
- **Suscripción:** explícitamente fuera de v1 aunque aparece en nav ("Menús semanales").

### 1.3 Riesgos estructurales

1. **Team size desconocido.** El PRD dimensiona 1-2 FE + 1 BE + 1 diseño + 1 producto. Si el equipo real es 1 solo founder o 1 founder + 1 freelance, los 16 semanas se convierten en 28-40 semanas.
2. **Sin evidencia de product-market fit.** No hay landing de captura, lista de espera, pre-órdenes ni encuestas. Todo el aprendizaje de demanda ocurre *después* del launch, que es el momento más caro para aprender.
3. **Fresco perecedero sin suscripción = economía frágil.** Cubierto en §5.
4. **"Moat de estacionalidad" no articulado.** La fruta tropical en España es mayoritariamente importada año-round. El diferencial real todavía no tiene narrativa (posibles ángulos: Canarias, ventanas de cosecha, curación editorial, variedades raras).

---

## 2. Fecha de lanzamiento — escenarios

Hoy = 2026-04-24. PRD estima 16 semanas de ejecución desde Sprint 0 arrancado con equipo completo.

| Escenario | Soft launch | Apertura comercial | Condiciones |
|---|---|---|---|
| **Muy optimista** | 2026-08-28 | 2026-10-15 | Equipo completo operando lunes que viene, decisiones §10 cerradas en 2 semanas, fotografía lista en mes 1 |
| **Optimista realista** (recomendado) | 2026-10-30 | 2026-11-20 | Equipo completo en 3-4 semanas, Sprint 0 arranca mediados de mayo, Navidad como launch comercial |
| **Base** | 2027-01-15 | 2027-02-15 | Equipo parcial, 2 meses de fundación antes de Sprint 0 |
| **Pesimista (founder solo)** | 2027-05 / 2027-07 | 2027-07 / 2027-09 | 1 persona con freelancers puntuales, 32-40 semanas de ejecución |

**Target recomendado: 30 octubre 2026 (soft) / 20 noviembre 2026 (apertura).**

Razón: la campaña de Navidad es donde se hace el año en DTC gourmet. Soft launch el 30/10 permite 3 semanas de debug con tráfico controlado antes del peak del 20/11 al 23/12. Todo lo que no esté en el camino crítico de los 10 CUs se recorta o se posterga a v1.1.

---

## 3. Probabilidad de éxito

Dos preguntas distintas que conviene separar.

### 3.1 Probabilidad de llegar a lanzar v1

**~65-70%.** Factores a favor: scope disciplinado, arquitectura estándar, backlog granular, fundador con disciplina de producto. Factores en contra: ejecución (equipo, fotografía, legal, decisiones abiertas), perfeccionismo en diseño puede comerse semanas.

### 3.2 Probabilidad de ser negocio sostenible en 12 meses

- **Sin suscripción (v1 puro):** ~15-20%.
- **Con suscripción (v1.5):** ~35-45%.
- **Con suscripción + moat de estacionalidad articulado:** ~50-60%.

### 3.3 Por qué el número es bajo

- **DTC fresco sin recurrencia tiene economía estructuralmente débil.** Cada pedido único es adquisición nueva; el CAC se come el margen del primer pedido (ver §5.4).
- **El "moat de estacionalidad" es más tesis que realidad.** La fruta tropical en España es importada todo el año. Sin ángulo concreto (Canarias, variedades, curación editorial, trazabilidad), el diferencial se diluye frente a competencia transversal (Mercadona Gourmet, El Corte Inglés, Naranjas Lola ampliando surtido).
- **Logística perecedera es brutal.** Cadena de frío, mermas 5-15%, incidencias en última milla. El coste real solo se aprende operando.
- **CAC DTC food España realista: 25-40€.** Con AOV 40-45€ y margen bruto 35-45% del ticket, el primer pedido pierde dinero o es break-even.

### 3.4 Qué subiría la probabilidad

1. Adelantar la suscripción a antes del launch (v1.5 en vez de v1).
2. Empezar captura de emails y pre-órdenes **ya** con una landing.
3. Articular el moat de estacionalidad con un ángulo concreto y defendible.
4. Cerrar un partner de logística frigorífica con tarifa plana.
5. Asegurar 2-3 colaboraciones con creadores de nicho (gourmet, salud, cocina) antes del launch.

---

## 4. Estimación de facturación año 1 — supuestos comunes

Supuestos usados en ambos escenarios de §5 y §6. Todo orientativo, no son compromisos.

- **Launch comercial:** 2026-11-20.
- **Ventana de año 1:** 2026-11-20 a 2027-11-20 (12 meses post-launch).
- **Mix de tamaño:** 40% Grande (49€) / 60% Pequeña (29€) → AOV blended ≈ **37€**. El PRD apunta a 45€ empujando Grande; asumo AOV realista **40€**.
- **COGS por caja:**
  - Caja Grande (3-4 kg fruta tropical): 15-22€.
  - Caja Pequeña (1.5-2 kg): 8-13€.
  - Incluye packaging (cartón estructural + gel frío + relleno): 2-4€.
  - COGS blended ≈ **14€ (35% del AOV)**.
- **Envío refrigerado Península:** coste real 8-12€, cobrado al cliente 5-7€, absorbido **~4€/pedido**.
- **Mermas y devoluciones:** 6% del revenue bruto.
- **Margen bruto de contribución por pedido:** AOV 40€ - COGS 14€ - Envío absorbido 4€ - Mermas 2.4€ = **~19.6€/pedido (49%)**.
- **CAC blended (paid + influencer + orgánico):** 28-35€ en régimen, más alto los primeros 3 meses.
- **Pasarela de pagos:** 1.5% descontado ya del margen arriba.

---

## 5. Plan de negocio SIN suscripción (v1 tal como está en el PRD)

### 5.1 Modelo de ingresos

100% transaccional DTC. Cada pedido es adquisición nueva salvo repeat orgánico. No hay lock-in, no hay MRR.

### 5.2 Segmento objetivo

- **Comprador de regalo gourmet** (40% esperado): ocasiones puntuales — cumpleaños, thank-you corporativo, regalo a padres. Ticket alto, frecuencia baja (1-2/año).
- **Foodie curioso urbano** (35%): Madrid/Barcelona/Valencia, 30-45 años, sensible a estacionalidad y marca. Frecuencia 2-4/año si engancha.
- **Comprador ocasional impulsivo** (25%): llega por PR, creador o estacional (Navidad, San Valentín). Frecuencia 1/año.

Sin suscripción, el comprador **más valioso** (foodie recurrente) se comporta igual que el **menos valioso** (impulsivo): compra cuando se acuerda.

### 5.3 Pricing y mix propuesto

| SKU | Precio | Mix esperado |
|---|---|---|
| Caja Cerrada — Grande | 49€ | 25% |
| Caja Cerrada — Pequeña | 29€ | 30% |
| Caja Personalizable — Grande | 49€ | 15% |
| Caja Personalizable — Pequeña | 29€ | 30% |

Mismo precio por tamaño entre modalidades (pendiente confirmar en §10 del PRD).

### 5.4 Unit economics por pedido

| Concepto | € |
|---|---|
| AOV | 40.00 |
| COGS fruta + packaging (35%) | -14.00 |
| Envío (absorbido) | -4.00 |
| Mermas/devoluciones (6%) | -2.40 |
| Pasarela pago (1.5%) | -0.60 |
| **Margen bruto de contribución** | **~19.00 (47%)** |
| CAC blended primer pedido | -30.00 |
| **Contribución primer pedido** | **-11.00** |

**El primer pedido pierde ~11€.** Solo el cliente que hace 2+ pedidos es rentable.

### 5.5 Repeat rate esperado sin suscripción

Basado en rangos típicos DTC food transaccional en España y UK:

- **30% repeat en 6 meses** (orgánico + email marketing + winbacks).
- **Frecuencia media activo:** 2.2 pedidos/12 meses.
- **LTV 12 meses:** 40€ × 2.2 × 47% = **~41€**.
- **LTV/CAC:** 41 / 30 = **1.37x.** Marginalmente viable, sin colchón para errores operativos.

### 5.6 Canales de adquisición propuestos

| Canal | % mix esperado | CAC | Notas |
|---|---|---|---|
| Meta Ads (IG/FB) | 35% | 30-45€ | Visual fuerte (fruta tropical), audiencia foodie/regalo |
| Google Ads (brand + search gourmet) | 15% | 18-25€ | Scaleable limitado, buen CPA |
| Influencer / creator (micro) | 20% | 15-30€ | Crítico para narrativa; 2-3 colabos/mes |
| PR / prensa gastro | 5% | Variable | 1-2 hits al año mueven la aguja |
| Orgánico (SEO + social) | 25% | ~0€ | Escala lenta, 6-12 meses para volumen |

### 5.7 Proyección mensual año 1 — escenario base sin suscripción

| Mes | Pedidos | Facturación | Notas |
|---|---|---|---|
| M1 (nov) | 60 | 2,400€ | Launch + Black Friday |
| M2 (dic) | 120 | 4,800€ | Pico Navidad |
| M3 (ene) | 40 | 1,600€ | Resaca post-Navidad |
| M4 (feb) | 55 | 2,200€ | San Valentín push |
| M5 (mar) | 65 | 2,600€ | |
| M6 (abr) | 75 | 3,000€ | Primera cohorte de repeat visible |
| M7 (may) | 85 | 3,400€ | Día de la madre |
| M8 (jun) | 95 | 3,800€ | Regalo fin de curso |
| M9 (jul) | 70 | 2,800€ | Caída de verano |
| M10 (ago) | 50 | 2,000€ | Mínimo anual |
| M11 (sep) | 85 | 3,400€ | Vuelta, nuevas cohortes |
| M12 (oct) | 110 | 4,400€ | Pre-Navidad |
| **Total Y1** | **910** | **~36,400€** | |

**Rango:** 35-55K€ según efectividad de paid y momento PR. Escenario bull con una viralidad: hasta 75K€. Escenario conservador (solo orgánico): 12-20K€.

### 5.8 Burn rate y capital necesario

**Costes fijos mensuales estimados (operando):**

| Concepto | €/mes |
|---|---|
| Founder (compensación mínima o lucro cesante) | 3,000 |
| 1 freelance técnico (mantenimiento) | 2,500 |
| Almacén + refrigeración | 1,500 |
| Herramientas SaaS (hosting, email, CDN, analytics, pagos) | 400 |
| Atención al cliente + ops part-time | 1,000 |
| Contable + legal | 300 |
| **Fijos/mes** | **~8,700** |
| Paid marketing (escalado) | 1,500 - 3,000 |
| **Burn total/mes** | **10,000 - 12,000** |

**Costes one-time pre-launch:**

| Concepto | € |
|---|---|
| Sesión fotográfica profesional | 5,000 |
| Diseño + branding pulido | 3,000 |
| Legal (términos, privacidad, RGPD) | 2,000 |
| Desarrollo (si hay freelancers externos adicionales) | 15,000 - 40,000 |
| Stock inicial + packaging | 4,000 |
| **One-time** | **~30,000 - 55,000** |

**Año 1 burn total:** 120K - 175K€.
**Año 1 ingresos base:** 36K€.
**Gap de caja año 1 (sin suscripción):** **85K - 140K€ de capital necesario.**

### 5.9 Riesgos específicos del escenario sin suscripción

1. **Dependencia crónica de adquisición paid.** Si subes precios de anuncios o cae el ROAS, el negocio se para en seco.
2. **Estacionalidad doble** (temporada fruta + temporada regalo). Meses flojos (julio-agosto, enero-febrero) casi sin ingresos.
3. **Sin predictibilidad de compras → mermas altas.** Sin suscripción no puedes planificar compra a proveedor con precisión.
4. **Sin moat relacional.** Cualquier competidor que añada suscripción te la quita.

---

## 6. Plan de negocio CON suscripción (v1.5)

### 6.1 Qué es v1.5

v1 tal como está en el PRD + un módulo de suscripción mínimo viable. **Recomendado lanzar en Sprint 6-7 (pre-launch) o en mes 3 post-launch como muy tarde.** No es un rediseño del roadmap; es añadir ~3-4 semanas de trabajo técnico en backoffice + checkout + cuenta.

### 6.2 Mecánica de suscripción propuesta (mínima viable)

- **Frecuencias:** mensual o quincenal (quincenal empuja LTV; mensual empuja adopción).
- **Modalidad bloqueable:** el suscriptor elige Caja Cerrada o Personalizable al suscribirse. Cambios se permiten para la siguiente entrega.
- **Descuento vs one-off:** 10% sobre precio caja (esto es *hook* psicológico, no margen regalado: la recurrencia paga de sobra).
- **Gestión desde Mi Cuenta:** pausar, saltar entrega concreta, cambiar dirección, cancelar.
- **Sin permanencia.** Cancelable en cualquier momento. Cobro el día de preparación, no al suscribirse.
- **Upsell en confirmación de compra:** "Conviértela en recurrente y ahorra 10%" en la pantalla post-compra.
- **Email drip de conversión:** secuencia de 4 emails a compradores one-time a los 14, 30, 60 y 90 días empujando suscripción.

### 6.3 Unit economics con suscripción

| Concepto | One-time | Suscripción mensual | Suscripción quincenal |
|---|---|---|---|
| AOV/pedido | 40.00 | 36.00 (10% off) | 36.00 |
| Margen bruto contribución (47%) | 19.00 | 16.92 | 16.92 |
| Pedidos año típico activo | 2.2 | 10 | 20 |
| Churn mensual asumido | n/a | 10% | 12% |
| Vida media (meses) | n/a | 10 | 8.3 |
| Pedidos por LTV | 2.2 | 10 | 16.7 |
| **LTV bruto (contribución)** | **~41€** | **~169€** | **~283€** |
| CAC blended | 30 | 35 | 35 |
| **LTV/CAC** | **1.37x** | **4.8x** | **8.1x** |

**Diferencia clave:** el suscriptor mensual genera **4x el LTV** del cliente transaccional. El quincenal **7x**.

### 6.4 Proyección mensual año 1 — escenario base con suscripción

Asumo v1.5 listo en el launch (20 nov 2026). Si entra 3 meses después, desplaza todo ~2 meses.

**Supuestos de adquisición:**
- 40% de los compradores one-time convierten a suscripción en 60 días.
- Churn mensual 10%.
- Suscripción mensual domina (80%) vs quincenal (20%).
- Campañas específicas de suscripción desde M1.

| Mes | Pedidos one-time | Subs activos | Pedidos suscripción | Facturación total |
|---|---|---|---|---|
| M1 (nov) | 50 | 15 | 8 | 2,300€ |
| M2 (dic) | 110 | 45 | 30 | 5,480€ |
| M3 (ene) | 35 | 80 | 60 | 3,560€ |
| M4 (feb) | 50 | 110 | 85 | 5,060€ |
| M5 (mar) | 60 | 145 | 115 | 6,540€ |
| M6 (abr) | 70 | 180 | 145 | 8,020€ |
| M7 (may) | 80 | 215 | 175 | 9,500€ |
| M8 (jun) | 90 | 245 | 200 | 10,800€ |
| M9 (jul) | 65 | 260 | 215 | 10,340€ |
| M10 (ago) | 45 | 255 | 210 | 9,360€ |
| M11 (sep) | 80 | 275 | 225 | 11,300€ |
| M12 (oct) | 100 | 300 | 250 | 13,000€ |
| **Total Y1** | **835** | — | **1,718** | **~95,260€** |

**Rango:** 90K - 130K€ según efectividad de conversión a suscripción y churn real.

### 6.5 MRR al final de año 1

- 300 suscriptores × 36€ × mix mensual/quincenal = ~11,500€ **MRR al cerrar año 1**.
- Eso es un run-rate anual de ~138K€ solo de suscripción + ~50K€ transaccional ≈ **180-200K€ anualizado al empezar año 2**.

Este es el punto de inflexión: año 2 se empieza con caja predecible, no con adquisición desde cero.

### 6.6 Burn rate y capital necesario

Costes fijos mensuales similares a §5.8 (**~8,700€/mes**) + paid (1,500-3,000€/mes).

**Año 1 burn total:** ~130K€ (ligeramente superior porque el paid escala con suscripción).
**Año 1 ingresos base:** 95K€.
**Gap de caja año 1 (con suscripción):** **25K - 60K€ de capital necesario.**

Factor diferencial: el gap no solo es 3-4x menor, sino que el año 2 arranca con MRR cubriendo ~85% de los fijos desde el mes 1. Eso sí es un negocio.

### 6.7 Riesgos específicos del escenario con suscripción

1. **Churn real mayor al asumido** (15%+ mensual en vez de 10%). Mitigar con primera caja excepcional + email onboarding + pausar fácil.
2. **Cancelaciones en bloque en meses flojos** (agosto, enero). Mitigar con opción "saltar" en vez de cancelar.
3. **Rotura de stock en semanas con alta demanda de suscripción.** Mitigar con calendario de temporada (§5 BO del PRD) planificando 4 semanas adelante.
4. **Complejidad técnica en checkout y Mi Cuenta.** Añade 3-4 semanas. Aceptable si se compensa con el impacto en LTV.
5. **Soporte post-venta sube.** Pausas, saltos, cambios de dirección: 2-3x más interacciones que one-time. Requiere BO afinado o crece el coste de ops.

---

## 7. Comparativa y recomendación

### 7.1 Lado a lado

| Métrica | Sin suscripción (v1) | Con suscripción (v1.5) |
|---|---|---|
| Facturación año 1 | 35-55K€ | 90-130K€ |
| LTV/CAC | 1.37x | 4.8x (mensual) / 8.1x (quincenal) |
| Capital necesario año 1 | 85-140K€ | 25-60K€ |
| MRR al cierre Y1 | ~0€ | ~11,500€ |
| Run-rate inicio Y2 | ~45K€ | ~180-200K€ |
| Predictibilidad operativa | Baja | Alta |
| Complejidad técnica añadida | 0 (ya planificado) | +3-4 semanas |
| Probabilidad de supervivencia Y2 | ~25-30% | ~55-65% |

### 7.2 Punto de inflexión

La suscripción transforma Bionta de "DTC transaccional frágil" a "DTC recurrente viable" en cuanto cruza **~150 suscriptores activos** (el punto donde el MRR cubre ~50% de costes fijos). Con la proyección base eso ocurre en **mes 5-6 post-launch**.

### 7.3 Recomendación

1. **Reclasificar v1 como v1.5** y empujar la suscripción al launch.
2. Si eso es imposible operativamente (equipo pequeño, fecha comprometida), lanzar v1 sin suscripción pero **con la mecánica ya diseñada y con email capture desde el día 1** para tener lista de intención cuando v1.5 salga en mes 2-3.
3. **No lanzar v1 puro con intención de añadir suscripción "en v2 cuando haya datos".** Es el camino hacia cerrar en mes 10.

---

## 8. Próximos pasos accionables

### 8.1 Esta semana (2026-04-28 al 05-04)

1. **Landing de captura viva.** Una página con hero, promesa de valor, fecha tentativa de launch y captura de email. 2 días de trabajo con un builder (Framer, Webflow, Carrd). Empieza a construir lista.
2. **Decidir stack.** Propuesta default sensata: Next.js + Vercel (frontend), Supabase o Neon + Prisma (backend), Stripe (pagos), Resend (email), Cloudflare R2 (imágenes), PostHog (analytics). Esto desbloquea Sprint 0.
3. **Sesión de validación del PRD con el equipo** (la acción 1 de §14 del PRD).
4. **Cerrar pricing coherente** (49€ Grande / 29€ Pequeña en ambas modalidades).

### 8.2 Este mes (mayo 2026)

5. **Decidir si v1 o v1.5 antes del launch.** Es *la* decisión de negocio del proyecto.
6. **Planificar sesión fotográfica** de producto y fruta individual.
7. **Redactar briefing legal** a abogado (términos, privacidad, cookies, devolución alimentos frescos).
8. **Cerrar partner logístico frigorífico** (Seur Frío, Nacex, Correos Express Frío) con tarifa plana negociada.
9. **Articular el moat de estacionalidad.** Workshop de 2 horas: ¿Canarias? ¿variedades raras? ¿curación editorial? ¿trazabilidad con QR? Una frase clara y defendible.

### 8.3 Antes de Sprint 0

10. **Validar 3 testimonios con consentimiento** (pueden ser amigos/family que hayan probado muestras).
11. **Matriz de envíos y tarifas cerrada.**
12. **Cobertura geográfica decidida.** Mi sugerencia: Península + Baleares en v1, Canarias v2, Portugal v2.
13. **5-10 usuarios target identificados** para test de usabilidad en Sprint 7.

### 8.4 Antes del launch (Sprint 7)

14. **Pre-launch con lista de espera:** 2 semanas antes, email con código de descuento early-bird del 15% a los 500-1000 primeros inscritos.
15. **2-3 colaboraciones con creadores** cerradas y con contenido rodado antes del día 1.
16. **1 hit de prensa** (El Español, Gastroactitud, Directo al Paladar) asegurado para la primera semana.
17. **Operativa probada** con 20-30 pedidos reales internos la semana previa.

---

## 9. Supuestos clave y sensibilidad

### 9.1 Lo que tiene que ser cierto para que el plan base funcione

- AOV se mantiene en 37-40€ (no cae a 32€ por mix malo).
- COGS blended se mantiene en ~35% (no sube a 45% por mermas altas o proveedor caro).
- CAC blended en régimen 28-35€ (no se dispara a 50€+ por saturación de canales).
- Churn de suscripción se mantiene < 12% mensual.
- Logística refrigerada cuesta < 12€/envío real.

### 9.2 Qué rompe el plan

- **COGS > 45%** (fruta tropical escasa, proveedor único, mermas descontroladas). El negocio se vuelve flat de contribución.
- **CAC > 50€ sostenido.** El plan sin suscripción queda inviable y el con suscripción se retrasa a breakeven Y2 tardío.
- **Churn > 18%.** La ventaja de suscripción desaparece.
- **Incidencia logística > 10%.** Matará el NPS y el boca-oreja.

### 9.3 Variables que más mueven la aguja

Ordenadas por impacto:

1. **Lanzar con suscripción o sin.** +50-100% facturación Y1.
2. **Timing del launch.** Pillar Navidad vs perderla: +30-50% Y1.
3. **Churn de suscripción.** Cada 2pp de mejora = +15% LTV.
4. **Eficacia del paid.** CAC bajando de 35 a 25 = +25% contribution margin.
5. **AOV mix.** Default Grande bien empujado = +10% revenue con mismo volumen.

---

## 10. Benchmarks de referencia (orientativos, no auditados)

- **HelloFresh / Gousto (meal kits DTC):** churn mensual 6-9%, CAC ~50€, LTV ~250€. Operativa a escala que Bionta no tendrá en Y1.
- **Oddbox / Abel & Cole (fruta/verdura UK):** retention alto, suscripción como core. AOV similar al proyectado Bionta.
- **Naranjas Lola, Naturitas (España):** DTC fruta nicho, tickets similares, sin suscripción robusta — creciendo lento.
- **Weekend Bakery / Panifesto (gourmet España):** DTC premium sin suscripción, escala limitada a 300-500K€/año sin cambio de modelo.
- **Tropical fruit specialty (EU):** casi inexistente organizado. Principal competencia es Amazon Fresh, El Corte Inglés gourmet y fruterías premium urbanas. **Oportunidad real existe**, pero el moat hay que construirlo.

---

## 11. Conclusión

Bionta tiene los ingredientes conceptuales bien puestos: PRD disciplinado, producto con narrativa, disciplina de founder. Le falta lo que le falta a todos los proyectos en este punto: ejecución, validación de demanda y decisión sobre el modelo recurrente.

Si se lanza v1 tal como está en el PRD actual, el camino más probable es un negocio marginal de 40K€ el primer año que requiere capital externo para sobrevivir. Si se lanza v1.5 con suscripción, el camino más probable es un negocio con ~100K€ el primer año y run-rate de 180-200K al arrancar el segundo, que se puede bootstrapping con capital moderado.

**La decisión de si v1 incluye suscripción o no es la decisión más importante de los próximos 30 días.** Todo lo demás es ejecución.
