---
name: Decisión abierta — v1 vs v1.5 (con/sin suscripción)
description: Decisión de negocio crítica no resuelta: lanzar v1 puro (solo transaccional) o v1.5 (con suscripción en el launch)
type: project
---

**Estado a 2026-04-24: ABIERTA. Es la decisión de negocio más importante de los próximos 30 días.**

El PRD maestro (`docs/prd-v1-alcance.md`) define v1 como 100% transaccional DTC, con suscripción explícitamente fuera de alcance. El análisis de negocio (`docs/plan-negocio-v1.md`) concluye que esto hace el negocio estructuralmente frágil.

## Números que sustentan la decisión

| | v1 (sin suscripción) | v1.5 (con suscripción) |
|---|---|---|
| Facturación Y1 estimada | 35-55K€ | 90-130K€ |
| LTV/CAC | 1.37x | 4.8-8.1x |
| Capital necesario Y1 | 85-140K€ | 25-60K€ |
| MRR cierre Y1 | ~0€ | ~11,500€ |
| Prob. supervivencia Y2 | 25-30% | 55-65% |

## Why

- DTC fresco perecedero sin recurrencia tiene economía frágil: primer pedido pierde ~11€ (CAC 30€ vs margen contribución 19€).
- La suscripción transforma LTV de ~41€ a ~169€ (mensual) o ~283€ (quincenal).
- Punto de inflexión: ~150 suscriptores activos (mes 5-6 post-launch) donde MRR cubre 50% de fijos.
- El PRD ya menciona "Menús semanales" en nav — la expectativa de suscripción existe en la IA, pero no se implementa.
- Añadir suscripción mínima viable al launch cuesta ~3-4 semanas de trabajo técnico adicional.

## How to apply

- **Recordar en cualquier conversación sobre roadmap, sprints, scope o fechas** que esta decisión está abierta y pendiente.
- Si el fundador dice "vamos con v1 como está", retar explícitamente: "¿has cerrado la decisión v1 vs v1.5? Los números del análisis apuntan fuerte a v1.5".
- Si aparecen tareas de Jira relacionadas con checkout, Mi Cuenta, backoffice de pedidos o emails transaccionales, notar que la mecánica de suscripción las toca y conviene resolver antes de implementar.
- Si la decisión es "v1 puro": exigir al menos captura de email desde el launch y v1.5 comprometida para mes 2-3 post-launch (no "en v2 cuando haya datos").
- Esta memoria debe actualizarse en cuanto la decisión se cierre (cambiar estado de ABIERTA a RESUELTA + fecha + resultado).

## Próximos hitos que fuerzan resolverla

- Validación del PRD con el equipo (pendiente — acción 1 de §14 del PRD).
- Cierre de decisiones técnicas §10 del PRD.
- Arranque de Sprint 0.
