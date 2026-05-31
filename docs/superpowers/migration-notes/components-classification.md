# Clasificación de componentes — Capa 2

## Hallazgo: 4 sistemas de componentes en el origen
1. **Página "Design System"** — UI kit genérico/legacy (37 sets, Button 150 variants…). Plantilla, NO Bionta. → IGNORAR (salvo cherry-pick).
2. **Sección "🧩 Components — v1"** (`683:8218`, página "🏠 Design v2") — **el sistema canónico de Bionta**, atomic L1-L7. → MIGRAR.
3. **Página "Things"** — duplicado exacto de v1. → IGNORAR (backup).
4. **Página "Components"** — scaffolding viejo (Button + FAQ). → IGNORAR.

## Decisión del usuario (2026-05-31)
- Migrar **solo v1** + **cherry-pick** del legacy: **Avatar, Alert, Tooltip, Loader, Progress Bar**.
- Organización: **L1-L2 → página Primitives · L3-L7 → página Patterns** (preservando sub-secciones).

## Estructura de v1 (`683:8218`, 12000×16524)
| Sub-sección | sets | comps | Destino |
|---|---|---|---|
| L1 — Atoms (primitivos) | 11 | 0 | 🧱 Primitives |
| L2 — Molecules | 8 | 4 | 🧱 Primitives |
| L3 — Organisms (Cards & Modals) | 9 | 0 | 🧬 Patterns |
| L4 — Page chrome (Nav/Footer/Sidebar) | 4 | 2 | 🧬 Patterns |
| L5 — Cart | 1 | 3 | 🧬 Patterns |
| L6 — Checkout | 0 | 1 | 🧬 Patterns |
| L7 — Order Confirmation | 2 | 2 | 🧬 Patterns |
| 📚 Doc primitives | 0 | 1 | 🧱 Primitives |

**L1 Atoms:** Button · Input · Checkbox · Switch · Pill · Badge · QtyStepper · SegmentedControl · PaginationDots · Divider · ProductTag
**L2 Molecules:** Field · SectionHeader · PageHeader · Breadcrumb · FAQItem · Tabs · Cart/Item · Cart/Summary
**L3 Organisms:** Card/Producto · Card/Tier-toggle · Card/Order · Card/Address · Card/Feature · Card/Step · Modal/Auth · EmptyState · Card/Modalidad
**L4 Page chrome:** Nav · Footer · SidebarItem · OrderTimeline
**L5 Cart:** Cart/Drawer · **L6 Checkout** · **L7 OrderConfirmation:** Hero · AccountBanner

## Plan de ejecución
1. [MANUAL] Copiar sección entera `🧩 Components — v1` (`683:8218`) → pegar en Components / página 🧱 Primitives. NO "Copy variables".
2. [MCP] Mover sub-secciones L3-L7 a página 🧬 Patterns; dejar L1-L2 + Doc en Primitives.
3. [MCP] **Sweep de re-binding de tokens a Foundations** (match por nombre — vars migradas 1:1). Reportar no-matcheados.
4. [MANUAL] Cherry-pick legacy: Avatar, Alert, Tooltip, Loader, Progress Bar (página Design System) → pegar en Primitives → rebind.
5. [MCP] Auditoría (página 📋 Audit) + verificación de conteo.
6. [MANUAL] Publicar Components (Task 18) + swap library en origen (⚠️ con cuidado).
