# Setup Jira — Bionta MVP v1

Guía operativa para dejar el proyecto **KAN** (`biontagourmet.atlassian.net`) con **Sprint 0** + **3 boards por disciplina**.

> Este doc se creó porque el MCP de Atlassian no expone endpoints para crear Sprints, Boards ni Filters. Todo esto se hace una vez desde la UI.

---

## 1. Sprint 0 — trabajo inicial del MVP

El label `sprint/0` ya está aplicado a todos los issues que tienen que arrancar en la fase de fundación. No hay que etiquetar nada más.

### Contenido del Sprint 0

- **Epic** KAN-1 · Fundación técnica y de marca.
- **5 Tareas de Fundación** (KAN-12 → KAN-16): DS publicado, Button normalizado, staging + CI/CD, fotografía real, CDN imágenes.
- **4 Tareas de Management** (KAN-60 → KAN-63): validación del PRD, decisiones técnicas/producto/operación §10.
- **Todas las subtasks hijas** de esos parents.

### JQL del Sprint 0

```jql
project = KAN AND labels = "sprint/0" ORDER BY Rank
```

### Crear el filter en Jira

1. Ir a **Filters → View all filters → Create filter** ([atajo](https://biontagourmet.atlassian.net/issues/?jql=)).
2. Pegar la JQL de arriba.
3. **Save as** → nombre: `Bionta v1 — Sprint 0`.
4. (Opcional) **Share** con el equipo.

### ¿Quieres un "sprint real" de Jira, no un filter?

Los proyectos **team-managed Kanban** (como `KAN`) no tienen sprints nativos. Para activarlos:

- Opción conservadora: dejarlo como label. El filter ya te da la misma funcionalidad visual.
- Opción drástica: **Project settings → Features → activar Sprints** (esto convierte el board en un board de Scrum con backlog + iteraciones). Luego crear el sprint vacío y mover ahí los issues con `sprint/0`.

Recomendación: empezar con el filter. Migrar a sprints nativos solo si el equipo lo pide.

---

## 2. Los 3 boards por disciplina

En team-managed projects hay **1 board por proyecto**. Para tener 3 vistas independientes usamos **saved filters + boards basados en filter**.

### 2.1 Board — Diseño

**Filter:** `Bionta v1 — Diseño`

```jql
project = KAN AND labels = "disc/diseno" ORDER BY Rank
```

Incluye: todas las historias/tareas/subtasks etiquetadas como diseño (Figma, fotografía, DS, microinteracciones).

### 2.2 Board — Desarrollo

**Filter:** `Bionta v1 — Desarrollo`

```jql
project = KAN AND labels in ("disc/frontend", "disc/backend", "disc/qa") ORDER BY Rank
```

Incluye: frontend + backend + QA. (QA se agrupa aquí porque vive en el flujo de desarrollo; si prefieres separarlo, saca la `disc/qa` y crea un 4º board "QA").

### 2.3 Board — Negocio / Management

**Filter:** `Bionta v1 — Negocio`

```jql
project = KAN AND labels in ("disc/mgmt", "disc/ops", "disc/legal") ORDER BY Rank
```

Incluye: decisiones de producto/técnicas/ops, matriz de envíos, testimonios, runbooks, legales, training del equipo, soft launch.

### Crear cada board (mismo procedimiento × 3)

1. **Guardar el filter:** Filters → Create filter → pegar JQL → Save as con el nombre indicado.
2. Ir a **Boards → View all boards → Create board**.
3. Elegir **Kanban**.
4. En "Board from…" elegir **Board from an existing Saved Filter**.
5. Seleccionar el filter creado en el paso 1.
6. Nombre del board: mismo que el filter (ej. `Bionta v1 — Diseño`).
7. Repetir para los otros 2.

> Estos boards son *company-managed-style* construidos sobre filters. Funcionan incluso encima de un proyecto team-managed — el issue vive en `KAN` y aparece en todos los boards que lo matcheen.

---

## 3. Taxonomía de labels (referencia rápida)

Todo el backlog de v1 ya está etiquetado con esta convención:

| Namespace | Valores | Ejemplos de filtro |
|---|---|---|
| `release/` | `v1` | release/v1 |
| `prio/` | `p0`, `p1`, `p2` | prio/p0 |
| `sprint/` | `0`, `1-2`, `3-4`, `5`, `5-6`, `6`, `7`, `continuo` | sprint/0 |
| `disc/` | `diseno`, `frontend`, `backend`, `qa`, `mgmt`, `ops`, `legal` | disc/frontend |
| `area/` | `home`, `pdp`, `cart`, `checkout`, `auth`, `mi-cuenta`, `emails`, `calendario`, `faq`, `contacto`, `legales`, `backoffice`, `ds`, `infra`, `mgmt`, `ops`, `brand`, `quality` | area/home |

### JQL extras útiles

```jql
// Bloqueantes críticos del launch
project = KAN AND labels = "prio/p0" AND statusCategory != Done

// Diseño del sprint 1-2 (Home + PDPs)
project = KAN AND labels = "disc/diseno" AND labels = "sprint/1-2"

// Decisiones abiertas
project = KAN AND parent in (KAN-61, KAN-62, KAN-63)

// Todo lo que depende del calendario BO
project = KAN AND text ~ "KAN-37"

// Mi backlog de diseño para esta semana
project = KAN AND labels = "disc/diseno" AND labels = "sprint/0" AND assignee = currentUser()
```

---

## 4. Backlog total — referencia

- **11 Epics** (KAN-1 → KAN-11).
- **56 Historias/Tareas** (KAN-12 → KAN-67).
- **222 Subtasks** (KAN-68 → KAN-289).
- **Total: 289 issues.**

Documento maestro de alcance: [`docs/prd-v1-alcance.md`](prd-v1-alcance.md).
PRDs hijos: [`docs/prd-pdp-caja-cerrada.md`](prd-pdp-caja-cerrada.md), [`docs/prd-pdp-caja-personalizable.md`](prd-pdp-caja-personalizable.md), [`docs/home-audit-product-lens.md`](home-audit-product-lens.md).

---

## 5. Siguiente paso recomendado

Cuando termines el setup (filters + boards), la primera subtask a mover a **In Progress** es:

- **KAN-260** · Ejecutar sesión 45' de validación del PRD con equipo.

Todo lo demás (decisiones técnicas, fotografía, DS) depende de que esa sesión cierre ownership y criterios.
