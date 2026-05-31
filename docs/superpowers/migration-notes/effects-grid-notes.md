# Notas — Effects, Grid, Radius (Task 8)

## Hallazgo clave
El archivo origen **no tiene effect/grid/paint styles con nombre** — todo se aplicaba directo a nodos.
Scan de 31.032 nodos: 164 con efectos, 15 sombras distintas.

## Sombras observadas (canonicalizadas en Foundations)
⚠️ Había **dos sistemas de sombra paralelos** en el origen — consolidar en el futuro:

1. **Card on-brand (verde-tintada)** — `y16 b40 s0 rgba(30,42,27,0.22)` — ×54 usos (dominante).
   → `elevation/card`
2. **Rampa Material-like navy** — `rgba(19,25,39,…)` de 2 capas, graduada y4→y18 — ~más rungs.
   → `elevation/sm` (y4 b4 s-2 .08 / y2 b4 s-2 .12)
   → `elevation/md` (y10 b32 s-4 .10 / y6 b14 s-6 .12) — el ×20 más popular
   → `elevation/lg` (y18 b88 s-4 .14 / y8 b28 s-6 .12)

(La `b0 s3 rgba(174,182,251,1)` ×55 es el anillo de selección de Figma, no una sombra real — ignorada.)

## Grid styles (nuevos, canonicalizados — origen no tenía)
- `Grid/Desktop · 1440` — 12 col · margin 120 · gutter 24 · STRETCH
- `Grid/Tablet · 768` — 8 col · margin 32 · gutter 24
- `Grid/Mobile · 375` — 4 col · margin 20 · gutter 16
- `Grid/Base · 4px` — patrón GRID 4px

## Radius collection (nueva, escala 4px)
none 0 · sm 4 · md 8 · lg 12 · xl 16 · 2xl 24 · pill 999

## Spacing
No tokenizado como variables (origen tampoco lo tenía). Documentado como escala visual 4px
(4·8·12·16·20·24·32·40·48·64) en la página 📐 Spacing & Grid.

> Valores de grid/radius son propuestas canónicas razonables (4px-friendly) — revisar con el equipo si algún breakpoint o radio difiere del uso real.
