---
name: Decisión cerrada — v1.5 con suscripción al launch
description: La decisión "v1 vs v1.5" se cerró el 2026-04-25 en favor de v1.5 (suscripción al launch). Histórico y consecuencias.
type: project
---

**Estado a 2026-04-25: RESUELTA — v1.5 (con suscripción al launch).**

## Resolución

El fundador cerró la decisión en favor de v1.5: la suscripción entra al launch de Bionta como parte del producto, no como evolución posterior. La conversación que la cerró arrancó con la petición de diseñar la página de suscripción en Figma; al confrontar la decisión abierta, el fundador confirmó "vamos con v1.5".

## Why se eligió v1.5

- DTC fresco perecedero sin recurrencia tiene economía frágil: primer pedido pierde ~11€ (CAC 30€ vs margen contribución 19€).
- La suscripción transforma LTV de ~41€ a ~169€ (mensual) o ~283€ (quincenal).
- Punto de inflexión: ~150 suscriptores activos (mes 5-6 post-launch) donde MRR cubre 50% de fijos.
- Probabilidad de supervivencia Y2: 25-30% (v1) vs 55-65% (v1.5).
- Capital necesario Y1: 85-140K€ (v1) vs 25-60K€ (v1.5).
- "Menús semanales" ya está en nav del Home — la expectativa de suscripción existe en la IA.

## Consecuencias inmediatas (a aplicar en próximos commits)

**PRDs que se reabren:**
- `prd-v1-alcance.md` — quitar suscripción de "fuera de alcance"; añadir como CU-#.
- `prd-pdp-caja-cerrada.md` §3 — eliminar "No integrar el flujo de suscripción en el selector".
- `prd-pdp-caja-personalizable.md` §3 — mismo cambio.
- `prd-mi-cuenta.md` — añadir bloque "Mi suscripción" (pausar, saltar, cancelar, cambiar dirección/frecuencia).
- `prd-checkout.md` (pendiente de escribir) — desde el inicio debe contemplar checkout de suscripción.

**Nuevos artefactos a producir:**
- PRD/spec de la página de suscripción (en curso, sesión 2026-04-25).
- PRD de emails transaccionales debe incluir: recordatorio "próximo envío en X días", confirmación de pausa/cancelación.

**Backoffice:**
- Gestión de cohortes de suscriptores, calendario de envíos por semana, panel de pausas/cancelaciones.

**Coste estimado:** ~3-4 semanas de trabajo técnico adicional al launch (per `plan-negocio-v1.md`).

## How to apply

- Tratar v1.5 como el alcance de facto del launch en cualquier conversación de scope, sprints, fechas.
- Cuando aparezcan los items "Consecuencias inmediatas", ofrecer hacerlos en orden o por separado — son varios commits.
- Si el fundador retrocede ("¿y si volvemos a v1 puro?"), referenciar este documento y los números que sustentan la decisión, no relitigar de cero.
- La suscripción es ahora un **producto de primera clase**, no un add-on — debe tener visibilidad en Home, nav, checkout y Mi Cuenta.

## Decisión histórica original (2026-04-24)

La decisión original quedó documentada como abierta el 2026-04-24 con un análisis detallado de números (ver `docs/plan-negocio-v1.md`). La decisión se cerró 1 día después, alineada con la recomendación del análisis.
