---
name: Sistema de tokens de color — Bionta
description: 28 primitives + 36 semantic Figma variables, exportadas a tokens.css / tailwind.config.ts / colors.json. Cierra el gap "Color tokens hardcoded" del DS v1.
metadata:
  type: project
---

**Construido el 2026-05-12** dentro del archivo Figma "Bionta Design" (file key `v34S6c0aQGYqHY1eFIq48z`). Cierra el known gap *"Color tokens hardcoded como RGB en fills — no se usaron Figma Variables"* registrado en [[design_system_v1]].

**Why:** dev necesita tokens consumibles para implementar Bionta v1.5 sin acoplarse a hex hardcoded. Diseño necesita una sola fuente de verdad para cambios de paleta. Cumple la regla de [[design_system_v1]] de que componentes referencien tokens en vez de fills crudos.

**How to apply:**
- Componentes nuevos en Figma → bind fills/strokes a variables `Bionta / Color Semantic` (NUNCA a Primitives directamente).
- Componentes nuevos en código → consumir `--color-{role}-{variant}` o `colors.{role}.{variant}` desde `design/tokens/`.
- Si falta una intención semántica, **primero añadir alias** en la colección Semantic, luego usarlo.
- Cambios de paleta brand → editar primitives; los aliases (y por tanto componentes) heredan automáticamente.

## Estructura

Dos colecciones en Figma, single mode (dark mode aplazado, se añadirá como segundo mode en Semantic sin migración).

| Colección | id | Vars | Mode |
|---|---|---|---|
| Bionta / Color Primitives | `VariableCollectionId:987:3211` | 28 | `Default` (`987:0`) |
| Bionta / Color Semantic | `VariableCollectionId:987:3240` | 36 | `Default` |

## Primitives (28)

Naming `color/{family}/{scale}` estilo Tailwind. Escala 0→900.

```
brand/yellow:  50 #FFF8E0 · 300 #FAC938 · 500 #FFC200 · 600 #E5AD00 · 700 #D99A2E
brand/green:   50 #E3E9DA · 500 #2F4A2B · 600 #3D5A39 · 900 #243121
cream:         50 #FAF6EF · 100 #F1EBDE · 200 #E5DFD2 · 300 #D9D1C7 · 700 #7A7366
neutral:       0..900 (escala completa de grises)
red:           50 #FCE6E8 · 500 #ED2933 · 700 #661A1A
```

## Semantic (36)

Naming `{role}/{variant}`. Roles: `surface`, `text`, `border`, `action`, `feedback`.

Highlights:
- `surface/page` = cream/50 — fondo de página por defecto
- `surface/raised` = neutral/0 — cards
- `surface/brand` = yellow/500 — heroes, badges
- `text/primary` = neutral/900 — texto principal
- `text/on-brand` = neutral/900 — texto sobre yellow (NO blanco)
- `text/on-inverse` = cream/50 — texto sobre green/dark
- `action/primary` = yellow/500 — buttons primarios
- `action/primary-hover` = yellow/600 — hover de buttons primarios

Lista completa en `design/tokens/tokens.css`.

## Rebind ejecutado

Pass 1 + 2 sobre secciones `🧩 Components — v1` (`683:8218`) y `🔄 Migrated to DS — v1` (`683:12761`):

| Métrica | Fills | Strokes |
|---|---|---|
| Total paints SOLID | 1822 | 192 |
| Bindados | 1715 (94.1%) | 170 (88.5%) |
| Skippeados (opacity < 1) | 65 | 16 |
| Orphans (no tocados) | 42 | 6 |

511 nodos dentro de instances no se tocaron — heredan del master automáticamente.

### Orphans intencionalmente fuera del sistema
- **Logos Google**: `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` — brand assets externos.
- **Logo Apple**: `#000000` — brand asset externo.
- **Cart legacy page** (no `🏠 Design v2`): `#F5C241`, `#CCB24D`, `#FFF6DB`.
- **Single-use raros** (probable iteración intermedia): `#D14343`, `#9EA87C`, `#7B4EFF`, `#4D5A46`, `#F2D14D`, `#B8362F`, `#4A8B4A`, `#F7F5ED`, `#F0EBE0`.

### Mapeos de tolerancia aplicados
- Yellow legacy `#F2B441` → `surface/brand` (yellow/500). Cierra deprecation marcada en [[design_system_v1]].
- Yellows hover ad-hoc `#E5AD00`/`#D99A2E` → `action/primary-hover`.
- Cream variants ad-hoc (`#F9F7F2`, `#F2EADE`, `#F6F2E8`, `#EDE8D9`, `#FBF6EF`, `#F5F1EA`) → `surface/page` o `surface/sunken` según luminosidad.
- Neutrals ad-hoc `#444444`, `#404040`, `#2E2E2E` → `text/secondary-strong` o `text/primary`.

## Handoff a desarrollo

Tres archivos en `design/tokens/`:

| Archivo | Para |
|---|---|
| `tokens.css` | CSS custom properties. Import directo en cualquier stack. |
| `tailwind.config.ts` | Export `biontaColors` para `theme.extend.colors`. Permite `bg-surface-page`, `text-text-primary`. |
| `colors.json` | Source of truth en formato W3C Design Tokens. Para Style Dictionary o pipelines futuros. |

**Re-export**: cuando cambien los Figma Variables, regenerar los 3 archivos manualmente (read variables del file y reescribir). Pipeline automatizado (Tokens Studio + Git sync o REST API + Style Dictionary) queda para v1.1 si el sistema se estabiliza.

## Reglas operativas

1. **Componentes Figma**: bind a Semantic, nunca a Primitives.
2. **Componentes código**: `var(--color-{role}-{variant})` o `colors.{role}.{variant}` (Tailwind).
3. **Disabled state**: sigue siendo `opacity: 0.4` aplicado por componente (decisión heredada de [[design_system_v1]]). NO se tokeniza.
4. **Overlays con alpha**: no se bindean en v1. Si un overlay específico recurre mucho, tokenizarlo como primitive nuevo con alpha precalculado.
5. **Brand assets externos** (logos Google, Apple): no entran al sistema. Se mantienen hardcoded.
6. **Dark mode**: aplazado. Cuando se añada, se hace como segundo mode en Semantic (los Primitives se mantienen single-mode).

## Spec design doc

`docs/superpowers/specs/2026-05-12-color-tokens-design.md`
