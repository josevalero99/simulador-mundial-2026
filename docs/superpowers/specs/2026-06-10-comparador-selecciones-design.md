# Comparador de selecciones — Diseño

**Fecha:** 2026-06-10
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Problema / Objetivo

Añadir un **comparador de dos selecciones** al Simulador Mundial 2026: elegir A y B y ver, de un vistazo y **mobile-first**, su fuerza (ranking FIFA, Elo), contexto (confederación, grupo), **forma reciente** real, **head-to-head histórico** real, el **enfrentamiento Elo** (1X2 + marcador más probable) y el **% de ser campeón** de cada una.

Idea del backlog (`docs/IDEAS.md` → "Comparador de selecciones").

## Diseño aprobado (Enfoque A — "Versus", mobile-first)

Pantalla en columna única (móvil); en `sm:` se ensancha con más aire / 2 columnas donde encaje. Secciones, de arriba abajo:

1. **Selectores A vs B** — dos `TeamSelect` (dropdown de las 48 selecciones) con un separador "VS" y un botón **⇄** para intercambiar.
2. **Versus hero** — banderas grandes enfrentadas + nombres.
3. **Si se enfrentaran (Elo)** — barra 1X2 (victoria A / empate / victoria B).
4. **Stats comparadas** — filas `valor A · etiqueta · valor B`, con el mejor en dorado: Ranking FIFA, Puntos Elo (`fifaPoints`), Confederación, Grupo.
5. **Forma reciente** — últimos 5 (chips V/E/D de color) por selección. Dato real del dataset.
6. **Cara a cara (histórico)** — totales V/E/D + últimos 3 cruces (fecha + marcador). Dato real del dataset.
7. **Marcador más probable (Elo)** — `mostLikelyScore`.
8. **% de ser campeón** — de cada selección, del Monte Carlo del escenario actual.

## Datos: forma y head-to-head (dataset abierto, empaquetado)

No existen datos de forma/h2h en el repo; se generan en build-time desde un dataset abierto y se **empaquetan** (sin llamadas externas en runtime).

### Script de preparación

`scripts/buildComparadorData.mjs` (patrón de los `scripts/build*.mjs` existentes: `fetch` + `writeFileSync` a `lib/data/`).

- **Fuente:** `https://raw.githubusercontent.com/martj42/international_results/master/results.csv` (todos los partidos internacionales; columnas `date,home_team,away_team,home_score,away_score,tournament,city,country,neutral`).
- **Mapeo de nombres:** un `NAME_TO_ID` en el script traduce los nombres del dataset (inglés) a nuestros ids (`ESP`, `KOR`, `CZE`, `USA`, `IRN`, `RSA`, `CIV`, `CPV`, `COD`, `BIH`, …). El script **avisa por consola** de cualquiera de nuestras 48 selecciones que no consiga mapear (para corregir el mapa).
- **Forma:** para cada una de nuestras 48 selecciones, sus **últimos 5** partidos internacionales (contra cualquier rival; el rival puede no estar entre las 48 → se guarda su nombre del dataset y `oppId: null`). Resultado V/E/D desde la perspectiva del equipo.
- **H2H:** para cada **par** de nuestras 48 selecciones que se hayan enfrentado: totales (jugados, V/E/D) **all-time** + los **últimos 3** cruces.
- **Snapshot:** guarda `SNAPSHOT_DATE` = fecha máxima del dataset usada.

### Salida generada (committeada)

`lib/data/comparadorData.ts`:
```ts
export const SNAPSHOT_DATE: string // 'YYYY-MM-DD'

export interface H2HMeeting { date: string; loId: string; hiId: string; loGoals: number; hiGoals: number }
export interface H2HRecord { played: number; winsLo: number; draws: number; winsHi: number; last: H2HMeeting[] }
/** Clave = `${loId}|${hiId}` con loId < hiId (orden alfabético de ids). */
export const H2H: Record<string, H2HRecord>

export interface FormMatch { date: string; oppName: string; oppId: string | null; gf: number; ga: number; res: 'W' | 'D' | 'L' }
/** teamId → últimos 5, el más reciente primero. */
export const FORM: Record<string, FormMatch[]>
```

### Accesores (lógica pura, testeable)

`lib/data/comparador.ts`:
```ts
import { H2H, FORM, type FormMatch, type H2HMeeting } from './comparadorData'

export interface H2HView { played: number; winsA: number; draws: number; winsB: number; last: H2HMeeting[] }
/** Normaliza la orientación del par y devuelve los totales desde la perspectiva de A. null si no hay datos. */
export function getH2H(idA: string, idB: string): H2HView | null

/** Últimos 5 del equipo (más reciente primero); [] si no hay datos. */
export function getForm(teamId: string): FormMatch[]
```

## Reutilización del motor

Importar de `lib/engine/montecarlo.ts` (ya existen):
- `matchOutcomeProbs(idA, idB, undefined, undefined, marketFn)` → 1X2 (Elo, con blend de mercado si hay cuotas para el par; si no, Elo puro).
- `mostLikelyScore(idA, idB)` → `{ homeGoals, awayGoals }`.

### % de campeón — hook compartido (DRY)

`runMonteCarlo` devuelve `Record<string, TeamProbs>` (`.champion` 0..1). Hoy `ProbabilitiesTab` lo llama directo. Para no duplicar la llamada:

- Nuevo hook `components/probabilities/useTournamentProbs.ts`: memoiza `runMonteCarlo(N, undefined, base, marketFn)` sobre `[state.matches, marketFn-config]` y devuelve `Record<string, TeamProbs>`.
- `ProbabilitiesTab` se refactoriza para consumirlo (comportamiento idéntico).
- `ComparadorTab` lo consume y lee `.champion` de A y B.

Solo se renderiza el tab activo, así que no hay doble cómputo simultáneo.

## Helper de grupo

Añadir a `lib/data/groups.ts` (no existe):
```ts
export function groupOf(teamId: string): GroupId | undefined
```
(índice inverso de `GROUPS`). Lógica pura, testeable.

## Componentes (mobile-first)

Carpeta `components/comparador/`:
- **`ComparadorTab.tsx`** — compone todo; estado `a`/`b` (ids), defaults: `a = favorito ?? mejor ranking`, `b = mejor ranking distinto de a`. Botón ⇄ intercambia.
- **`TeamSelect.tsx`** — dropdown reutilizable de 48 selecciones (patrón de `FavoritePicker`: lista ordenada por nombre es-ES, bandera + nombre, cierre por click-fuera/ESC). Props `{ value, onChange, exclude? }` (excluye el ya elegido en el otro lado).
- Subcomponentes de presentación, cada uno con una responsabilidad: `VersusHero`, `OutcomeBar` (1X2), `StatRows`, `FormRow`, `H2HPanel`, `ProbableScore`, `ChampionRow`. Reutilizan `Flag` y `Pill` existentes.

`ComparadorTab` se mantiene como composición fina; cada subcomponente recibe datos ya calculados por props.

## Integración como pestaña ("Más" en móvil)

- `lib/nav/tabs.ts`: añadir `'comparador'` a `TabKey` y `ALL_TABS` (**índice 8**, label "Comparador", full "Comparador de selecciones"). Actualizar `secondaryIndices` para incluir 8: por defecto `[1,5,6,7,8]`, en directo `[1,4,6,7,8]`. `primaryIndices` no cambia (sigue 4).
- `components/nav/tabIcons.tsx`: `comparador: Scale` (lucide).
- `app/page.tsx`: `{active === 8 && <ComparadorTab />}`.

## Estados y errores

- **Sin datos** por selección/par (placeholder no mapeado, par sin cruces, sin forma): cada sección muestra "Sin datos" / "Sin enfrentamientos registrados". Las secciones Elo (1X2, marcador, stats con `fifaPoints`) **siempre** funcionan.
- **A == B** imposible: el `exclude` de `TeamSelect` impide elegir el mismo en ambos lados.
- Pie de la sección de datos: "Datos hasta {SNAPSHOT_DATE}".

## Mobile-first

Diseño base = móvil (columna única, la maqueta aprobada). En `sm:`/`md:` se ensancha el contenedor y secciones como Stats/H2H pueden ir a 2 columnas. Nada bloquea desktop, pero la referencia es móvil.

## Testing

Tests de lógica pura (vitest, `lib/**/*.test.ts`):
- `lib/data/comparador.test.ts`: `getH2H` normaliza orientación (A/B y B/A coherentes), devuelve `null` sin datos; `getForm` devuelve [] sin datos y respeta orden.
- `lib/data/groups.test.ts` (ampliar): `groupOf` devuelve el grupo correcto y `undefined` si no existe.
- `lib/nav/tabs.test.ts` (ampliar): 9 tabs; `secondaryIndices` incluye 8 en ambos modos; primarios+secundarios cubren 0..8 sin solape.
- Sanidad del dataset generado: `comparadorData` tiene `FORM`/`H2H` no vacíos y entradas para selecciones top conocidas (p. ej. `ESP`, `ARG`, `BRA`).

Componentes: sin infra de test de componentes en el repo → verificación con `npm run lint` + `npm run build` + checklist manual (mobile-first).

## Fuera de alcance (futuro)

- **Blend de forma en vivo** durante el torneo (usar resultados live para los partidos ya jugados). v1 usa el snapshot; se anota como mejora futura.
- Cuotas outright (campeón) de casa de apuestas: se usa el Monte Carlo del modelo, no `outrights` del proveedor.
- Comparar más de 2 selecciones.
- Refresco automático del dataset (es snapshot manual vía script).
