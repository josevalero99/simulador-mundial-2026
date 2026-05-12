# Bionta — Color tokens design

**Date:** 2026-05-12

## Goal

Sustituir los fills/strokes hardcoded de hex en el archivo Figma "Bionta Design" por un sistema de tokens en dos capas (primitives + semantic) usando Figma Variables, y exportarlo a `tokens.css` + `tailwind.config.ts` para que dev lo consuma. Esto cierra el known gap *"Color tokens hardcoded — Migrar antes de v1.1 grande"* del DS v1.

## Decisions

1. **Dos colecciones, single mode**
   - `Bionta / Color Primitives` — paletas crudas. Sin significado funcional. Solo aquí viven hex.
   - `Bionta / Color Semantic` — aliases con intención (surface/text/border/action/feedback) que apuntan a primitives.
   - Componentes consumen **semantic**, nunca primitives. Si falta una intención, se añade alias antes de usar primitive.
   - Dark mode no entra en v1 — se puede añadir como segundo mode en Semantic sin migración.

2. **Naming**
   - Primitives: `color/{family}/{scale}` estilo Tailwind. Escala 0/50/100…900.
   - Semantic: `{role}/{variant}` plano. Ej. `surface/page`, `text/on-brand`, `action/primary-hover`.
   - Consistente con la colección `Bionta / Typography` ya existente (`font/family/brand`).

3. **Consolidación de la auditoría**
   - 107 colores únicos detectados → reducidos a ~32 primitives + ~30 semantic.
   - 14 beiges ad-hoc → 5 entries en familia `cream`.
   - 11 grises ad-hoc → escala `neutral` (0/50/100/200/300/400/500/600/700/800/900).
   - Yellows duplicados: `#F2B441`, `#E5AD00`, `#D99A2E`, `#FAC938` se consolidan en escala `yellow/300..700`.
   - Logos Google/Apple **excluidos** del sistema (brand assets externos).
   - Disabled se mantiene como `opacity 0.4` aplicada por componente (no se tokeniza).

4. **Handoff a desarrollo**
   - Generar Figma Variables **no es suficiente**. Dev necesita artefactos consumibles en el repo.
   - V1: export manual a `tokens.css` (CSS custom properties) + `tailwind.config.ts` (extend.colors). Ambos viven en el repo.
   - V2 (cuando el sistema se estabilice): considerar Tokens Studio + Git sync o REST API + Style Dictionary.

5. **Migración de componentes**
   - Tras crear las variables, rebind de fills/strokes en secciones `🧩 Components — v1` y `🔄 Migrated to DS — v1`.
   - Hex con match exacto a primitive → bind a semantic alias correspondiente.
   - Hex deprecated conocido (ej. `#F2B441`) → bind a alias canónico (`action/primary` = `yellow/500`).
   - Hex con alpha (overlays) → mantener inline si son single-use; tokenizar si recurren.
   - Hex huérfanos sin match razonable → reportar al final para limpieza posterior.

## Variable inventory

### Primitives — `Bionta / Color Primitives`

```
brand/yellow/50    #FFF8E0   tint para fondos suaves
brand/yellow/300   #FAC938   variant clara
brand/yellow/500   #FFC200   canónico (marca)
brand/yellow/600   #E5AD00   hover
brand/yellow/700   #D99A2E   pressed
brand/green/50     #E3E9DA   success subtle
brand/green/500    #2F4A2B   canónico
brand/green/600    #3D5A39   hover (greenDark legacy)
brand/green/900    #243121   overlay base
cream/50           #FAF6EF   page background canónico
cream/100          #F1EBDE   sunken (creamAlt)
cream/200          #E5DFD2   borders/dividers sobre crema
cream/300          #D9D1C7   decorative
cream/700          #7A7366   texto secundario sobre crema
neutral/0          #FFFFFF
neutral/50         #F5F5F5
neutral/100        #EDEDED
neutral/200        #E0E0E0
neutral/300        #C7C7C7
neutral/400        #A6A6A6
neutral/500        #8C8C8C
neutral/600        #6B6B6B
neutral/700        #4D4D4D
neutral/800        #333333
neutral/900        #1E1E1E   dark canónico
red/50             #FCE6E8
red/500            #ED2933
red/700            #661A1A
```

### Semantic — `Bionta / Color Semantic`

```
surface/page              → cream/50
surface/raised            → neutral/0
surface/sunken            → cream/100
surface/brand             → yellow/500
surface/brand-subtle      → yellow/50
surface/inverse           → green/500
surface/inverse-strong    → neutral/900
surface/success-subtle    → green/50
surface/error-subtle      → red/50

text/primary              → neutral/900
text/secondary            → neutral/600
text/muted                → neutral/500
text/on-brand             → neutral/900
text/on-inverse           → cream/50
text/link                 → green/500
text/error                → red/500

border/subtle             → neutral/200
border/default            → neutral/300
border/strong             → neutral/900
border/brand              → yellow/500
border/inverse            → green/500
border/error              → red/500

action/primary            → yellow/500
action/primary-hover      → yellow/600
action/secondary          → green/500
action/secondary-hover    → green/600

feedback/error            → red/500
feedback/success          → green/500
feedback/warning          → yellow/600
```

## Execution plan (this session)

1. Crear `Bionta / Color Primitives` y sus variables.
2. Crear `Bionta / Color Semantic` y sus variables como aliases.
3. Rebind fills/strokes de componentes DS v1 → semantic.
4. Export `tokens.css` + `tailwind.config.ts` al repo (path TBD durante ejecución).
5. Actualizar memoria del proyecto + commit final.

## Non-goals

- Dark mode (deferred).
- Migración de páginas legacy `Home`, `Cart`, `Product`, `Design System` antiguas — se quedan con hex hardcoded (van a borrarse).
- Tokens de spacing/radius/shadow (ya hay regla 4px grid; spacing tokens van en otra tanda).
