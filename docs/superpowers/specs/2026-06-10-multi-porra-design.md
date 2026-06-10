# Multi-porra + desglose en vivo — Diseño

_Fecha: 2026-06-10 · Proyecto: Simulador Mundial 2026 · Rama: `feat/simulador-mundial-2026`_

## Contexto

La pestaña **Porra** actual gestiona **una sola** porra fija: 12 participantes × 4 selecciones
que reparten las 48 selecciones del torneo. El estado vive en `localStorage` (`wc2026-porra`) y
la tabla muestra, por participante, la probabilidad de victoria y el total esperado calculados con
una simulación Monte Carlo (`runPorraMonteCarlo`, 2000 simulaciones).

Sistema de puntuación único: cada selección suma su **posición final** (campeón = 1, …, 48º = 48);
gana quien **menos** suma con sus selecciones.

Esta es la primera de cinco mejoras del backlog (`docs/IDEAS.md`). Las otras cuatro
(directo→bracket, comparador+H2H, más mercados de cuotas, estadísticas de jugadores) quedan en cola,
cada una con su propio ciclo spec → plan → implementación.

## Objetivo

Permitir **varias porras independientes** (distintos grupos: amigos, curro, familia…), cada una con
sus propios participantes, y añadir un **desglose en vivo** por participante que muestre la posición
de cada una de sus selecciones. Mantener el **único** sistema de puntuación actual (posición final);
**no** se añade abstracción de reglas configurables (descartado explícitamente).

## Decisiones de alcance (confirmadas)

- **Multi-porra** = varias porras independientes, cada una con sus participantes. Se cambia entre
  ellas; una vista compara el líder actual de cada una.
- **Formato por porra** = reparto **exacto** de las 48 (cada selección asignada una vez, sin
  duplicados ni huecos), pero con **número libre de participantes** y reparto posiblemente
  **desigual** (p. ej. unos con 5 selecciones y otros con 4). La uniformidad no es obligatoria.
- **Reglas de puntuación** = solo "posición final" (la actual). Sin sistema de reglas.
- **Desglose en vivo** = por cada selección de un participante, su **posición entera en el cuadro
  más probable** (escenario determinista según los resultados actuales). Números enteros, intuitivos.
- **Vista "Comparar porras"** incluida en este alcance.
- **Porras compartibles por URL**: fuera de alcance (queda en backlog).

## Modelo de datos y persistencia

```ts
// lib/data/porra.ts
export interface PorraEntry { name: string; teams: string[] }   // sin cambios

export interface Porra {
  id: string         // crypto.randomUUID() con fallback determinista
  name: string       // "Amigos", "Curro"…
  entries: PorraEntry[]
}

export interface PorrasState {
  porras: Porra[]
  activeId: string
}
```

- **Nuevo store local**: `wc2026-porras-v2` → `PorrasState` serializado.
- **Migración automática** al montar:
  - Si existe `wc2026-porras-v2` válido → se usa.
  - Si no, y existe el viejo `wc2026-porra` con una porra válida → se envuelve en
    `{ porras: [{ id, name: "Porra", entries }], activeId: id }`.
  - Si no hay nada → una porra por defecto a partir de `DEFAULT_PORRA`.
  - La migración es idempotente y tolerante a datos corruptos (cae a la porra por defecto).
- **Invariante de partición** por porra: cubre las 48 selecciones exactamente una vez. Se mantiene
  `checkPartition` (ya es agnóstico a la uniformidad). Se generaliza `isValidPorra` para aceptar
  cualquier número de participantes y cualquier número de selecciones por participante (se quitan
  las comprobaciones `length === 12` y `teams.length === 4`); sigue exigiendo que cada participante
  tenga nombre string y `teams` array de strings no vacío.

## Motor (`lib/engine/`, funciones puras + tests)

- **`mostLikelyFinalRanking(matches: Match[], market?: MarketFn): string[]`** — versión
  **determinista** de `simulateFinalRanking`:
  - Rellena los partidos de grupo vacíos con el marcador **más probable** (modelo Elo/mercado, sin
    azar) en lugar de muestreo aleatorio.
  - Elige el ganador de cada cruce de eliminatoria con `modelWinner` (mayor probabilidad), no por
    `rng()`.
  - Respeta los resultados ya fijados en `matches`.
  - Reutiliza `resolveR32`, `buildBracket`, `byQuality` y el ensamblaje por tramos existente.
  - Devuelve las 48 selecciones ordenadas (índice 0 = 1º). Misma entrada → misma salida.
- `finalPositions(ranking)` — sin cambios.
- `scorePorra(positions, entries)` — sin cambios; ya funciona con cualquier número de participantes.
- **Desglose**: se calcula una vez `mostLikelyFinalRanking(state.matches, marketFn)` →
  `finalPositions` → por cada selección de cada participante, su posición entera; el total más
  probable del participante es la suma de esas posiciones.

Las columnas principales de la tabla siguen siendo **Monte Carlo** (probabilidad de victoria y total
esperado). El desglose desplegable muestra la **posición en el cuadro más probable** por selección y
su suma. Son dos métricas distintas y se etiquetan como tales en la UI.

## UI (`components/porra/`)

Se refactoriza el `PorraTab` monolítico (~350 líneas) en piezas con responsabilidad única:

```
components/porra/
  PorraTab.tsx        // orquestador: estado de porras, store local, migración, modos (editar/comparar)
  PorraSwitcher.tsx   // dropdown de la porra activa + acciones (nueva / renombrar / duplicar / borrar)
  PorraEditor.tsx     // editor flexible: +/- participante, +/- selección por participante, contador 48
  PorraResults.tsx    // tabla MC con filas desplegables (desglose por selección)
  PorraCompare.tsx    // vista "Comparar porras": líder actual de cada porra
lib/data/porra.ts     // tipos (Porra, PorrasState) + DEFAULT_PORRA + helpers (newPorra, migrate, validación)
```

Layout (respeta el estilo liquid-glass oscuro existente):

```
Porra            [● En directo]            [ Amigos ▾ ]  [+ Nueva] [⋯]
"Cada selección puntúa según su puesto final…"            └ selector  └ renombrar / duplicar / borrar

[ Comparar porras ]  [ Editar equipos ]  [ Calcular probabilidades ]

┌─ tabla resultados (porra activa) ───────────────────────────────┐
│ #   Participante   Selecciones      Prob.vict.   Total esp.   ▸  │
│ 🏆  JOSE          🇫🇷🇳🇴🇸🇦🇯🇴        31.2% ▓▓▓      58.4       ▾  │
│     └ desglose (cuadro más probable):                            │
│        🇫🇷 Francia 2 · 🇳🇴 Noruega 19 · 🇸🇦 41 · 🇯🇴 44 = 106     │
└──────────────────────────────────────────────────────────────────┘
```

- **PorraSwitcher**: selector de porra activa + menú de acciones. "Nueva" crea una porra a partir de
  `DEFAULT_PORRA`; "Duplicar" clona la activa con nombre " (copia)"; "Borrar" pide confirmación y, si
  era la activa, pasa a otra (no se permite quedarse con cero porras: al borrar la última se recrea
  la por defecto). Reutiliza el estilo de menú/botón de `ActionsMenu`.
- **PorraEditor** (flexible): añadir/quitar participante, añadir/quitar selección por participante,
  con un **contador en vivo "X/48 asignadas"** y avisos de duplicados/huecos (reutiliza
  `checkPartition`). Mantiene el aviso ámbar actual cuando la partición no es válida.
- **PorraResults**: igual que la tabla actual (MC), con cada fila **desplegable** para mostrar el
  desglose determinista por selección. El desglose se recalcula con cada cambio de resultados.
- **PorraCompare**: tabla compacta, una fila por porra (nombre, nº de participantes, líder actual y su
  probabilidad/total). Botón para volver a la porra activa.
- **Modo directo**: se mantiene el comportamiento actual — recálculo automático de MC cuando cambian
  los resultados reales; el desglose determinista también se recalcula.

## Tests (Vitest, motor puro)

- `mostLikelyFinalRanking`:
  - determinista (misma entrada → misma salida en varias ejecuciones),
  - devuelve una permutación válida de las 48 selecciones,
  - respeta los resultados ya fijados en `matches`,
  - el campeón coincide con el favorito del modelo en la cadena de cruces.
- `migrate`:
  - envuelve una porra antigua (`wc2026-porra`) en `PorrasState`,
  - es idempotente sobre un `PorrasState` ya válido,
  - cae a la porra por defecto ante datos corruptos.
- `isValidPorra` generalizado: acepta 8×6, 16×3 y repartos desiguales que sumen 48; rechaza
  duplicados y huecos.
- `newPorra(name)`: id único, `entries` = clon de `DEFAULT_PORRA`.
- `scorePorra` con número de participantes distinto de 12 (caso no-12).

Sin tests E2E (siguen en backlog). La validación visual se hace levantando la app (`npm run dev`).

## Fuera de alcance

- Sistemas de puntuación alternativos (por fase, por victoria, bonus campeón).
- Porras compartibles por URL.
- Clasificación histórica temporal (evolución del líder a lo largo del torneo); "comparar porras"
  es una foto del estado actual, no una serie temporal.
