---
name: Jira — backlog v1 Bionta
description: Estructura completa del backlog de v1 en KAN (289 issues), convención de labels y JQL/boards por disciplina
type: reference
---

Backlog v1 creado el 2026-04-24 en proyecto `KAN` (MVP Bionta) del site `biontagourmet.atlassian.net`.

## Estructura

- **11 Epics**: KAN-1 → KAN-11.
- **56 Historias/Tareas**: KAN-12 → KAN-67.
- **222 Subtasks**: KAN-68 → KAN-289.
- **Total**: 289 issues.

## Mapa de Epics

| Key | Epic | Sprint |
|---|---|---|
| KAN-1 | E1 · Fundación técnica y de marca | 0 |
| KAN-2 | E2 · Storefront — Home v2 | 1-2 |
| KAN-3 | E3 · Storefront — PDPs | 1-2 |
| KAN-4 | E4 · Cart + Checkout + Pagos | 3-4 |
| KAN-5 | E5 · Emails transaccionales | 3-4 |
| KAN-6 | E6 · Auth + Mi Cuenta | 5 |
| KAN-7 | E7 · Contenido público y confianza | 5-6 |
| KAN-8 | E8 · Backoffice — Core operaciones | 1-2 y 3-4 |
| KAN-9 | E9 · Backoffice — Soporte operación | 6 |
| KAN-10 | E10 · Calidad, performance y lanzamiento | 7 |
| KAN-11 | E11 · Management y negocio | continuo |

## Convención de labels (namespaced)

- `release/v1`
- `prio/p0` · `prio/p1` · `prio/p2`
- `sprint/0` · `sprint/1-2` · `sprint/3-4` · `sprint/5` · `sprint/5-6` · `sprint/6` · `sprint/7` · `sprint/continuo`
- `disc/diseno` · `disc/frontend` · `disc/backend` · `disc/qa` · `disc/mgmt` · `disc/ops` · `disc/legal`
- `area/home` · `area/pdp` · `area/cart` · `area/checkout` · `area/auth` · `area/mi-cuenta` · `area/emails` · `area/calendario` · `area/faq` · `area/contacto` · `area/legales` · `area/backoffice` · `area/ds` · `area/infra` · `area/mgmt` · `area/ops` · `area/brand` · `area/quality`

## JQL / Boards por disciplina

- **Sprint 0**: `project = KAN AND labels = "sprint/0" ORDER BY Rank`
- **Board Diseño**: `project = KAN AND labels = "disc/diseno" ORDER BY Rank`
- **Board Desarrollo**: `project = KAN AND labels in ("disc/frontend", "disc/backend", "disc/qa") ORDER BY Rank`
- **Board Negocio**: `project = KAN AND labels in ("disc/mgmt", "disc/ops", "disc/legal") ORDER BY Rank`

## Limitaciones del MCP de Atlassian

El Atlassian Remote MCP Server v1 **no expone** endpoints para crear Sprints, Boards ni Filters (solo issues y páginas Confluence). Sprint 0 y los 3 boards hay que crearlos desde la UI siguiendo `docs/jira-setup.md`.

## How to apply

- Al crear issues nuevas de v1, respetar la convención de labels para que caigan automáticamente en el board correcto.
- Antes de proponer tareas, revisar los parents relevantes (ej. tocar Home → revisar hijos de KAN-2).
- La primera subtask accionable es **KAN-260** (validación PRD con equipo); casi todo depende de ella.

## Referencias

- `docs/jira-setup.md` — guía paso a paso UI.
- `docs/prd-v1-alcance.md` — PRD maestro.
- `.claude/memory/jira_setup.md` — cloudId + credenciales básicas del site.
