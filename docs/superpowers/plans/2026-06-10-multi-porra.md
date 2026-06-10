# Multi-porra + desglose en vivo — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir varias porras independientes (cada una reparte las 48 selecciones) con desglose en vivo de la posición de cada selección en el cuadro más probable, manteniendo el único sistema de puntuación actual (posición final).

**Architecture:** Se añade al motor puro una función determinista `mostLikelyFinalRanking` (refactorizando `finalRanking.ts` para compartir el núcleo con la versión aleatoria). El modelo de datos pasa de una porra a un `PorrasState` (`{ porras, activeId }`) persistido en un nuevo `localStorage` con migración automática desde la clave antigua. La UI refactoriza el `PorraTab` monolítico en piezas: selector/gestor, editor flexible, tabla de resultados con filas desplegables y vista de comparación.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Vitest. Motor en funciones puras (`lib/engine/`), estado UI en React con `localStorage`.

Spec: `docs/superpowers/specs/2026-06-10-multi-porra-design.md`.

---

### Task 1: `mostLikelyScore` — marcador determinista

Marcador más probable de un partido bajo el modelo de goles (lambdas de Elo redondeadas, sin azar). Lo usará el ranking determinista para rellenar partidos de grupo vacíos.

**Files:**
- Modify: `lib/engine/montecarlo.ts` (añadir función exportada `mostLikelyScore`, junto a `expectedResult`)
- Test: `lib/engine/__tests__/montecarlo.test.ts` (añadir bloque `describe`)

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `lib/engine/__tests__/montecarlo.test.ts`, antes del cierre del fichero:

```ts
import { mostLikelyScore } from '../montecarlo'

describe('mostLikelyScore', () => {
  it('is deterministic and returns non-negative integers', () => {
    const a = mostLikelyScore('ARG', 'NZL')
    const b = mostLikelyScore('ARG', 'NZL')
    expect(a).toEqual(b)
    expect(Number.isInteger(a.homeGoals)).toBe(true)
    expect(Number.isInteger(a.awayGoals)).toBe(true)
    expect(a.homeGoals).toBeGreaterThanOrEqual(0)
    expect(a.awayGoals).toBeGreaterThanOrEqual(0)
  })

  it('gives the stronger side at least as many goals', () => {
    // ARG (1885 pts) is much stronger than HAI (1315 pts).
    const s = mostLikelyScore('ARG', 'HAI')
    expect(s.homeGoals).toBeGreaterThanOrEqual(s.awayGoals)
  })
})
```

> Nota: `montecarlo.test.ts` ya importa de `'../montecarlo'`. Si prefieres, añade `mostLikelyScore` al import existente en lugar de duplicar la línea `import`.

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run lib/engine/__tests__/montecarlo.test.ts -t mostLikelyScore`
Expected: FAIL — `mostLikelyScore is not a function` / no export.

- [ ] **Step 3: Implementar**

En `lib/engine/montecarlo.ts`, justo después de `expectedResult` (sobre la línea 159), añadir:

```ts
/**
 * Deterministic most-likely scoreline under the Elo goal model: the per-side
 * expected goals (lambdas) rounded to the nearest integer. No randomness, no
 * market blend (market influences knockout picks, not this scoreline). Used to
 * fill unplayed group matches when building the single most-likely ranking.
 */
export function mostLikelyScore(
  homeId: string,
  awayId: string,
): { homeGoals: number; awayGoals: number } {
  const { lh, la } = lambdas(homeId, awayId)
  return { homeGoals: Math.round(lh), awayGoals: Math.round(la) }
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `npx vitest run lib/engine/__tests__/montecarlo.test.ts -t mostLikelyScore`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/engine/montecarlo.ts lib/engine/__tests__/montecarlo.test.ts
git commit -m "feat(engine): mostLikelyScore — marcador determinista del modelo Elo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `mostLikelyFinalRanking` — ranking determinista (refactor de `finalRanking.ts`)

Se extrae el núcleo de `simulateFinalRanking` a un helper que recibe la función de relleno de marcador y la de elección de ganador, y se añade la variante determinista que usa `mostLikelyScore` + el ganador más probable del modelo.

**Files:**
- Modify: `lib/engine/finalRanking.ts` (extraer núcleo + añadir `mostLikelyFinalRanking`)
- Test: `lib/engine/__tests__/finalRanking.test.ts` (añadir bloque `describe`)

- [ ] **Step 1: Escribir el test que falla**

Añadir al final de `lib/engine/__tests__/finalRanking.test.ts`:

```ts
import { mostLikelyFinalRanking } from '../finalRanking'

describe('mostLikelyFinalRanking', () => {
  it('returns a valid permutation of the 48 teams', () => {
    const ranking = mostLikelyFinalRanking(generateFixtures())
    expect(ranking).toHaveLength(48)
    expect(new Set(ranking).size).toBe(48)
    expect(new Set(ranking)).toEqual(new Set(ALL_IDS))
  })

  it('is deterministic: same input -> identical ranking', () => {
    const a = mostLikelyFinalRanking(generateFixtures())
    const b = mostLikelyFinalRanking(generateFixtures())
    expect(a).toEqual(b)
  })

  it('respects fixed group results (group A all 3-0 home)', () => {
    const base: Match[] = generateFixtures().map(m =>
      m.group === 'A' ? { ...m, homeGoals: 3, awayGoals: 0 } : m,
    )
    const ranking = mostLikelyFinalRanking(base)
    expect(ranking).toHaveLength(48)
    expect(new Set(ranking).size).toBe(48)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run lib/engine/__tests__/finalRanking.test.ts -t mostLikelyFinalRanking`
Expected: FAIL — `mostLikelyFinalRanking is not a function`.

- [ ] **Step 3: Refactorizar e implementar**

Reescribir `lib/engine/finalRanking.ts`. Mantener intactos los imports, `GroupStats`, `byQuality`, `loserOf` y `finalPositions`. Sustituir el cuerpo de `simulateFinalRanking` por un núcleo compartido + dos envoltorios.

Cambiar el import de `montecarlo` para incluir `mostLikelyScore` y `matchOutcomeProbs`:

```ts
import { Rng, MarketFn, sampleScore, eloExpectedScore, mostLikelyScore, matchOutcomeProbs } from './montecarlo'
```

Reemplazar la función `simulateFinalRanking` (líneas 48–151) por lo siguiente (las funciones `byQuality`, `loserOf` y `finalPositions` se conservan tal cual):

```ts
/** Fills an unplayed match with a concrete scoreline. */
type FillScore = (home: string, away: string) => { homeGoals: number; awayGoals: number }
/** Picks the winner of a knockout tie (no draws). */
type PickWinner = (home: string, away: string) => string

/**
 * Core ranking builder shared by the random and deterministic variants.
 * `base`, when supplied, pins the listed group matches' non-null scores;
 * remaining null group matches are filled via `fillScore`; knockout winners
 * (and the third-place match) are decided via `pickWinner`.
 *
 * @returns the 48 team ids ordered by final classification (index 0 = 1st).
 */
function buildRankingFromScenario(
  base: Match[] | undefined,
  fillScore: FillScore,
  pickWinner: PickWinner,
): string[] {
  const fifaRank = (id: string): number => TEAMS[id].fifaRank

  // 1. Canonical fixtures + fixed scores from `base`.
  const matches = generateFixtures()
  if (base) {
    const fixed = new Map<string, [number, number]>()
    for (const m of base) {
      if (m.homeGoals !== null && m.awayGoals !== null) {
        fixed.set(m.id, [m.homeGoals, m.awayGoals])
      }
    }
    for (const m of matches) {
      const f = fixed.get(m.id)
      if (f) {
        m.homeGoals = f[0]
        m.awayGoals = f[1]
      }
    }
  }

  // 2. Fill remaining null group matches.
  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) {
      const { homeGoals, awayGoals } = fillScore(m.home, m.away)
      m.homeGoals = homeGoals
      m.awayGoals = awayGoals
    }
  }

  // 3. Rank each group.
  const standingsByGroup = {} as Record<GroupId, StandingRow[]>
  const matchesByGroup = new Map<GroupId, Match[]>()
  for (const g of GROUP_IDS) matchesByGroup.set(g, [])
  for (const m of matches) matchesByGroup.get(m.group)!.push(m)
  for (const g of GROUP_IDS) {
    standingsByGroup[g] = rankGroup(GROUPS[g], matchesByGroup.get(g)!, fifaRank)
  }

  // Per-team group stats for tier tiebreaks.
  const stats: Record<string, GroupStats> = {}
  for (const g of GROUP_IDS) {
    for (const row of standingsByGroup[g]) {
      stats[row.teamId] = { points: row.points, gd: row.gd, gf: row.gf }
    }
  }

  // 4. Resolve R32 and build the bracket.
  const r32: Tie[] = resolveR32(standingsByGroup, fifaRank)
  const bracket = buildBracket(r32, (home, away) => pickWinner(home, away))

  const quality = byQuality(stats)
  const sortByQuality = (ids: string[]): string[] => [...ids].sort(quality)

  // 5. Build the ranking by tiers (best -> worst).
  const champion = bracket.champion
  if (champion === null) throw new Error('Bracket has no champion')

  const runnerUp = loserOf(bracket.final)

  const sfLosers = bracket.sf.map(loserOf)
  if (sfLosers.length !== 2) throw new Error('Expected exactly 2 SF matches')
  const thirdPlaceWinner = pickWinner(sfLosers[0], sfLosers[1])
  const thirdPlaceLoser = thirdPlaceWinner === sfLosers[0] ? sfLosers[1] : sfLosers[0]

  const qfLosers = sortByQuality(bracket.qf.map(loserOf))
  const r16Losers = sortByQuality(bracket.r16.map(loserOf))
  const r32Losers = sortByQuality(bracket.r32.map(loserOf))

  const inR32 = new Set<string>()
  for (const tie of r32) {
    inR32.add(tie.home)
    inR32.add(tie.away)
  }
  const eliminatedInGroup = sortByQuality(Object.keys(TEAMS).filter(id => !inR32.has(id)))

  const ranking: string[] = [
    champion,
    runnerUp,
    thirdPlaceWinner,
    thirdPlaceLoser,
    ...qfLosers,
    ...r16Losers,
    ...r32Losers,
    ...eliminatedInGroup,
  ]

  if (ranking.length !== 48 || new Set(ranking).size !== 48) {
    throw new Error(
      `Final ranking is not a valid permutation of 48 teams (got ${ranking.length}, ${new Set(ranking).size} unique)`,
    )
  }

  return ranking
}

/**
 * Simulates one full tournament and derives the complete 1..48 final
 * classification using random scorelines and random knockout winners.
 */
export function simulateFinalRanking(rng: Rng, base?: Match[], market?: MarketFn): string[] {
  return buildRankingFromScenario(
    base,
    (home, away) => sampleScore(home, away, market, rng),
    (home, away) => (rng() < eloExpectedScore(home, away) ? home : away),
  )
}

/**
 * Builds the single most-likely 1..48 final classification for the current
 * scenario: unplayed group matches use the deterministic most-likely scoreline
 * and every knockout tie is won by the model's favorite (market-blended 1X2).
 * Fully deterministic — same `matches` in, same ranking out.
 */
export function mostLikelyFinalRanking(matches: Match[], market?: MarketFn): string[] {
  const modelWinner = (home: string, away: string): string => {
    const p = matchOutcomeProbs(home, away, 0, undefined, market)
    return p.home >= p.away ? home : away
  }
  return buildRankingFromScenario(matches, (h, a) => mostLikelyScore(h, a), modelWinner)
}
```

- [ ] **Step 4: Ejecutar los tests del fichero y verificar que pasan (incluidos los antiguos)**

Run: `npx vitest run lib/engine/__tests__/finalRanking.test.ts`
Expected: PASS — los tests antiguos de `simulateFinalRanking`/`finalPositions` siguen verdes y los 3 nuevos de `mostLikelyFinalRanking` pasan.

- [ ] **Step 5: Ejecutar toda la suite del motor (no romper nada)**

Run: `npm test`
Expected: PASS — todos los ficheros (132 tests previos + los nuevos).

- [ ] **Step 6: Commit**

```bash
git add lib/engine/finalRanking.ts lib/engine/__tests__/finalRanking.test.ts
git commit -m "feat(engine): mostLikelyFinalRanking — ranking determinista (núcleo compartido)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Modelo de datos multi-porra (`lib/data/porra.ts`)

Tipos `Porra`/`PorrasState`, helpers `genId`/`newPorra`, validación generalizada (`isValidPorra`/`isValidEntry`/`isValidPorrasState`), `checkPartition` (movida desde el componente) y `migrate`.

**Files:**
- Modify: `lib/data/porra.ts`
- Test: `lib/data/porra.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Reescribir `lib/data/porra.test.ts` con (si el fichero tiene tests previos del `DEFAULT_PORRA`, conservarlos y añadir estos bloques):

```ts
import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PORRA,
  newPorra,
  isValidPorra,
  checkPartition,
  migrate,
  isValidPorrasState,
  type PorraEntry,
  type PorrasState,
} from './porra'
import { TEAMS } from './teams'

describe('isValidPorra (generalizado)', () => {
  it('accepts any participant count and uneven team counts', () => {
    const eightBySix: PorraEntry[] = Array.from({ length: 8 }, (_, i) => ({
      name: `P${i}`,
      teams: ['A', 'B', 'C', 'D', 'E', 'F'],
    }))
    expect(isValidPorra(eightBySix)).toBe(true)

    const uneven: PorraEntry[] = [
      { name: 'X', teams: ['A', 'B', 'C', 'D', 'E'] },
      { name: 'Y', teams: ['F', 'G', 'H'] },
    ]
    expect(isValidPorra(uneven)).toBe(true)
  })

  it('rejects empty array, empty teams and non-string teams', () => {
    expect(isValidPorra([])).toBe(false)
    expect(isValidPorra([{ name: 'X', teams: [] }])).toBe(false)
    expect(isValidPorra([{ name: 'X', teams: [1 as unknown as string] }])).toBe(false)
    expect(isValidPorra('nope')).toBe(false)
  })
})

describe('checkPartition', () => {
  it('the default porra is a valid partition of all 48 teams', () => {
    const check = checkPartition(DEFAULT_PORRA)
    expect(check.valid).toBe(true)
    expect(check.duplicated).toEqual([])
    expect(check.unassigned).toEqual([])
  })

  it('flags duplicates and unassigned teams', () => {
    const allIds = Object.keys(TEAMS)
    // One entry holds two copies of the first team; the last team is left out.
    const entries: PorraEntry[] = [
      { name: 'A', teams: [allIds[0], allIds[0]] },
      { name: 'B', teams: allIds.slice(1, allIds.length - 1) },
    ]
    const check = checkPartition(entries)
    expect(check.valid).toBe(false)
    expect(check.duplicated).toContain(allIds[0])
    expect(check.unassigned).toContain(allIds[allIds.length - 1])
  })
})

describe('newPorra', () => {
  it('clones DEFAULT_PORRA and gives a unique id', () => {
    const a = newPorra('Amigos')
    const b = newPorra('Curro')
    expect(a.name).toBe('Amigos')
    expect(a.id).not.toBe(b.id)
    expect(a.entries).toEqual(DEFAULT_PORRA)
    // deep clone, not the same references
    expect(a.entries).not.toBe(DEFAULT_PORRA)
    a.entries[0].teams[0] = 'ZZZ'
    expect(DEFAULT_PORRA[0].teams[0]).not.toBe('ZZZ')
  })
})

describe('migrate', () => {
  it('wraps a legacy single porra into a PorrasState', () => {
    const state = migrate(null, DEFAULT_PORRA)
    expect(isValidPorrasState(state)).toBe(true)
    expect(state.porras).toHaveLength(1)
    expect(state.porras[0].name).toBe('Porra')
    expect(state.porras[0].entries).toEqual(DEFAULT_PORRA)
    expect(state.activeId).toBe(state.porras[0].id)
  })

  it('is idempotent on an already-valid PorrasState', () => {
    const first = migrate(null, DEFAULT_PORRA)
    const second = migrate(first, null)
    expect(second).toEqual(first)
  })

  it('repairs an activeId that points to no porra', () => {
    const valid = migrate(null, DEFAULT_PORRA)
    const broken: PorrasState = { porras: valid.porras, activeId: 'ghost' }
    const fixed = migrate(broken, null)
    expect(fixed.activeId).toBe(fixed.porras[0].id)
  })

  it('falls back to a default porra on corrupt input', () => {
    const state = migrate({ junk: true }, 'also junk')
    expect(isValidPorrasState(state)).toBe(true)
    expect(state.porras[0].entries).toEqual(DEFAULT_PORRA)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npx vitest run lib/data/porra.test.ts`
Expected: FAIL — `newPorra`/`checkPartition`/`migrate`/`isValidPorrasState` no existen.

- [ ] **Step 3: Implementar**

Reescribir `lib/data/porra.ts` conservando `DEFAULT_PORRA` exactamente como está y añadiendo el resto:

```ts
import { TEAMS } from '@/lib/data/teams'

/** A porra participant and the national teams they own. */
export interface PorraEntry {
  name: string
  teams: string[]
}

/** A named porra: a set of participants that partition the 48 teams. */
export interface Porra {
  id: string
  name: string
  entries: PorraEntry[]
}

/** The full persisted state: all porras plus which one is active. */
export interface PorrasState {
  porras: Porra[]
  activeId: string
}

/**
 * The default porra: 12 participants, 4 teams each, partitioning all 48 teams.
 * (Best-effort decode of a screenshot; what matters is a valid partition.)
 */
export const DEFAULT_PORRA: PorraEntry[] = [
  { name: 'JUANCAR', teams: ['POR', 'SWE', 'CZE', 'BIH'] },
  { name: 'HERNAN', teams: ['BRA', 'MAR', 'SEN', 'HAI'] },
  { name: 'RAFA', teams: ['ESP', 'CAN', 'CIV', 'CUW'] },
  { name: 'JOSE', teams: ['FRA', 'NOR', 'KSA', 'JOR'] },
  { name: 'MARIO', teams: ['ARG', 'RSA', 'AUS', 'EGY'] },
  { name: 'ALVARO', teams: ['GER', 'JPN', 'KOR', 'NZL'] },
  { name: 'ROBER', teams: ['ENG', 'TUR', 'AUT', 'QAT'] },
  { name: 'JOHN', teams: ['NED', 'USA', 'IRN', 'UZB'] },
  { name: 'JULIO', teams: ['COL', 'URU', 'PAR', 'TUN'] },
  { name: 'JUANBA', teams: ['BEL', 'ECU', 'ALG', 'GHA'] },
  { name: 'PABLO', teams: ['CPV', 'CRO', 'IRQ', 'COD'] },
  { name: 'JAIME', teams: ['SUI', 'MEX', 'SCO', 'PAN'] },
]

let _idCounter = 0

/** Unique id: crypto.randomUUID when available, else a monotonic fallback. */
export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  _idCounter += 1
  return `porra-${_idCounter}-${Math.floor(performance.now?.() ?? _idCounter)}`
}

/** Deep-clones DEFAULT_PORRA into a fresh named porra with a unique id. */
export function newPorra(name: string): Porra {
  return {
    id: genId(),
    name,
    entries: DEFAULT_PORRA.map(e => ({ name: e.name, teams: [...e.teams] })),
  }
}

function isValidEntry(e: unknown): e is PorraEntry {
  return (
    !!e &&
    typeof e === 'object' &&
    typeof (e as PorraEntry).name === 'string' &&
    Array.isArray((e as PorraEntry).teams) &&
    (e as PorraEntry).teams.length > 0 &&
    (e as PorraEntry).teams.every(t => typeof t === 'string')
  )
}

/** Shape check only (not a partition check): a non-empty array of valid entries. */
export function isValidPorra(value: unknown): value is PorraEntry[] {
  return Array.isArray(value) && value.length > 0 && value.every(isValidEntry)
}

export function isValidPorrasState(value: unknown): value is PorrasState {
  if (!value || typeof value !== 'object') return false
  const v = value as PorrasState
  return (
    Array.isArray(v.porras) &&
    v.porras.length > 0 &&
    v.porras.every(
      p =>
        !!p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        isValidPorra(p.entries),
    ) &&
    typeof v.activeId === 'string'
  )
}

/** Result of checking whether entries form a valid partition of all 48 teams. */
export interface PartitionCheck {
  valid: boolean
  duplicated: string[]
  unassigned: string[]
}

export function checkPartition(entries: PorraEntry[]): PartitionCheck {
  const counts: Record<string, number> = {}
  for (const e of entries) {
    for (const id of e.teams) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  const duplicated = Object.keys(counts).filter(id => counts[id] > 1)
  const unassigned = Object.keys(TEAMS).filter(id => !counts[id])
  return {
    valid: duplicated.length === 0 && unassigned.length === 0,
    duplicated,
    unassigned,
  }
}

/**
 * Produces a valid PorrasState from the raw values of the new (`v2Raw`) and the
 * legacy single-porra (`oldRaw`) storage keys. Idempotent on a valid state;
 * repairs a dangling activeId; falls back to a fresh default porra.
 */
export function migrate(v2Raw: unknown, oldRaw: unknown): PorrasState {
  if (isValidPorrasState(v2Raw)) {
    const exists = v2Raw.porras.some(p => p.id === v2Raw.activeId)
    return exists ? v2Raw : { porras: v2Raw.porras, activeId: v2Raw.porras[0].id }
  }
  if (isValidPorra(oldRaw)) {
    const p: Porra = { id: genId(), name: 'Porra', entries: oldRaw }
    return { porras: [p], activeId: p.id }
  }
  const p = newPorra('Porra')
  return { porras: [p], activeId: p.id }
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `npx vitest run lib/data/porra.test.ts`
Expected: PASS (todos los bloques nuevos).

- [ ] **Step 5: Commit**

```bash
git add lib/data/porra.ts lib/data/porra.test.ts
git commit -m "feat(data): modelo multi-porra — Porra/PorrasState, newPorra, migrate, checkPartition

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: UI — refactor de `PorraTab` en piezas (switcher, editor flexible, resultados con desglose, comparar)

Sin tests unitarios (UI); verificación con `npm test` (no regresión del motor), `npm run lint`, `npm run build` y `npm run dev`.

**Files:**
- Create: `components/porra/PorraSwitcher.tsx`
- Create: `components/porra/PorraEditor.tsx`
- Create: `components/porra/PorraResults.tsx`
- Create: `components/porra/PorraCompare.tsx`
- Rewrite: `components/porra/PorraTab.tsx`

- [ ] **Step 1: `PorraSwitcher.tsx`**

```tsx
'use client'

import { Plus } from 'lucide-react'
import type { Porra } from '@/lib/data/porra'

interface Props {
  porras: Porra[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

/** Active-porra selector plus management actions (new / rename / duplicate / delete). */
export default function PorraSwitcher({
  porras,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const btn =
    'rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-white/10 hover:border-white/20'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={activeId}
        onChange={e => onSelect(e.target.value)}
        aria-label="Porra activa"
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
      >
        {porras.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.entries.length} part.
          </option>
        ))}
      </select>
      <button type="button" onClick={onNew} className={btn}>
        <Plus size={14} className="mr-1 inline" strokeWidth={2} aria-hidden="true" />
        Nueva
      </button>
      <button type="button" onClick={() => onRename(activeId)} className={btn}>
        Renombrar
      </button>
      <button type="button" onClick={() => onDuplicate(activeId)} className={btn}>
        Duplicar
      </button>
      <button type="button" onClick={() => onDelete(activeId)} className={btn}>
        Borrar
      </button>
    </div>
  )
}
```

- [ ] **Step 2: `PorraEditor.tsx`** (editor flexible con contador 48)

```tsx
'use client'

import { X, Plus } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import { checkPartition, type PorraEntry } from '@/lib/data/porra'

/** All teams, sorted by name, for the select dropdowns. */
const ALL_TEAMS = Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name, 'es'))
const TOTAL = Object.keys(TEAMS).length // 48
const teamName = (id: string) => TEAMS[id]?.name ?? id

interface Props {
  entries: PorraEntry[]
  onChange: (entries: PorraEntry[]) => void
}

/** Flexible porra editor: add/remove participants and team slots; live 48-counter. */
export default function PorraEditor({ entries, onChange }: Props) {
  const assigned = entries.reduce((s, e) => s + e.teams.length, 0)
  const partition = checkPartition(entries)

  const setName = (idx: number, name: string) =>
    onChange(entries.map((e, i) => (i === idx ? { ...e, name } : e)))

  const setTeam = (idx: number, slot: number, teamId: string) =>
    onChange(
      entries.map((e, i) =>
        i === idx ? { ...e, teams: e.teams.map((t, s) => (s === slot ? teamId : t)) } : e,
      ),
    )

  const addTeam = (idx: number) =>
    onChange(
      entries.map((e, i) =>
        i === idx ? { ...e, teams: [...e.teams, ALL_TEAMS[0].id] } : e,
      ),
    )

  const removeTeam = (idx: number, slot: number) =>
    onChange(
      entries.map((e, i) =>
        i === idx ? { ...e, teams: e.teams.filter((_, s) => s !== slot) } : e,
      ),
    )

  const addParticipant = () =>
    onChange([...entries, { name: `Participante ${entries.length + 1}`, teams: [ALL_TEAMS[0].id] }])

  const removeParticipant = (idx: number) => onChange(entries.filter((_, i) => i !== idx))

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`rounded-full px-3 py-1 font-semibold tabular-nums ${
            assigned === TOTAL && partition.valid
              ? 'bg-[#22c55e]/15 text-[#22c55e]'
              : 'bg-white/5 text-[#8a8a8a]'
          }`}
        >
          {assigned}/{TOTAL} asignadas
        </span>
        {partition.duplicated.length > 0 && (
          <span className="text-[#f59e0b]">
            Duplicadas: {partition.duplicated.map(teamName).join(', ')}
          </span>
        )}
        {partition.unassigned.length > 0 && (
          <span className="text-[#f59e0b]">
            Sin asignar: {partition.unassigned.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={entry.name}
                onChange={e => setName(idx, e.target.value)}
                aria-label={`Nombre del participante ${idx + 1}`}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
              />
              <button
                type="button"
                onClick={() => removeParticipant(idx)}
                aria-label={`Quitar ${entry.name}`}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 text-[#8a8a8a] transition-colors hover:text-[#E61D25]"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {entry.teams.map((teamId, slot) => (
                <div key={slot} className="flex items-center gap-1">
                  <select
                    value={teamId}
                    onChange={e => setTeam(idx, slot, e.target.value)}
                    aria-label={`${entry.name} · selección ${slot + 1}`}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
                  >
                    {ALL_TEAMS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.flag} {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTeam(idx, slot)}
                    aria-label={`Quitar selección ${slot + 1} de ${entry.name}`}
                    className="shrink-0 text-[#8a8a8a] transition-colors hover:text-[#E61D25]"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addTeam(idx)}
              className="mt-2 text-xs font-medium text-[#8a8a8a] transition-colors hover:text-[#E8B84B]"
            >
              <Plus size={12} className="mr-1 inline" strokeWidth={2} aria-hidden="true" />
              Añadir selección
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addParticipant}
        className="mt-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-white/10 hover:border-white/20"
      >
        <Plus size={14} className="mr-1 inline" strokeWidth={2} aria-hidden="true" />
        Añadir participante
      </button>
    </div>
  )
}
```

- [ ] **Step 3: `PorraResults.tsx`** (tabla MC con filas desplegables para el desglose determinista)

```tsx
'use client'

import { useState } from 'react'
import { Trophy, ChevronDown, ChevronRight } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import type { PorraEntry } from '@/lib/data/porra'
import type { PorraProb } from '@/lib/engine/porra'
import Flag from '@/components/ui/Flag'

const teamName = (id: string) => TEAMS[id]?.name ?? id

function fmtProb(p: number): string {
  if (p > 0 && p < 0.001) return '<0.1%'
  return `${(p * 100).toFixed(1)}%`
}

interface Props {
  result: PorraProb[]
  byName: Map<string, PorraEntry>
  /** Position of each team in the single most-likely final ranking (1..48). */
  positions: Record<string, number>
}

/** Results table (Monte Carlo) with an expandable per-team breakdown row. */
export default function PorraResults({ result, byName, positions }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const leaderName = result.length > 0 ? result[0].name : null

  const toggle = (name: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4 sm:p-6">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
            <th className="py-1.5 pl-2 text-left font-medium">#</th>
            <th className="px-3 text-left font-medium">Participante</th>
            <th className="px-3 text-left font-medium">Selecciones</th>
            <th className="px-3 text-left font-medium">Prob. victoria</th>
            <th className="px-3 text-right font-medium">Total esperado</th>
            <th className="px-2" />
          </tr>
        </thead>
        <tbody>
          {result.map((prob, i) => {
            const entry = byName.get(prob.name)
            const teams = entry?.teams ?? []
            const isLeader = prob.name === leaderName
            const isOpen = open.has(prob.name)
            const mostLikelyTotal = teams.reduce((s, id) => s + (positions[id] ?? 0), 0)
            return (
              <>
                <tr
                  key={prob.name}
                  onClick={() => toggle(prob.name)}
                  className={[
                    'cursor-pointer border-t border-white/10',
                    isLeader ? 'bg-[#E8B84B]/5' : '',
                  ].join(' ')}
                >
                  <td className="py-2.5 pl-2 align-middle">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center text-sm font-bold tabular-nums text-[#8a8a8a]">
                      {isLeader ? (
                        <Trophy size={16} strokeWidth={2} color="#E8B84B" aria-label="Líder" />
                      ) : (
                        i + 1
                      )}
                    </span>
                  </td>
                  <td className="px-3 align-middle">
                    <span className={`font-bold ${isLeader ? 'text-[#E8B84B]' : 'text-[#f5f5f5]'}`}>
                      {prob.name}
                    </span>
                  </td>
                  <td className="px-3 align-middle">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {teams.map((id, idx) => (
                        <span
                          key={`${id}-${idx}`}
                          title={teamName(id)}
                          className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-0.5 text-xs text-[#f5f5f5]"
                        >
                          <Flag teamId={id} className="text-sm leading-none" />
                          {id}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="w-44 px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#262626]">
                        <div
                          className="h-full rounded-full bg-[#E8B84B]"
                          style={{ width: `${Math.max(0, Math.min(1, prob.winProb)) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a8a8a]">
                        {fmtProb(prob.winProb)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 text-right align-middle">
                    <span className="text-sm font-medium tabular-nums text-[#f5f5f5]">
                      {prob.expectedTotal.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-2 align-middle text-[#8a8a8a]">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${prob.name}-desglose`} className="bg-black/20">
                    <td />
                    <td colSpan={5} className="px-3 pb-3">
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                        Posición en el cuadro más probable
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#f5f5f5]">
                        {teams.map((id, idx) => (
                          <span key={`${id}-${idx}`} className="inline-flex items-center gap-1.5">
                            <Flag teamId={id} className="text-sm leading-none" />
                            {teamName(id)}
                            <span className="font-bold tabular-nums text-[#E8B84B]">
                              {positions[id] ?? '—'}
                            </span>
                          </span>
                        ))}
                        <span className="text-[#8a8a8a]">
                          = <span className="font-bold tabular-nums text-[#f5f5f5]">{mostLikelyTotal}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

> Nota lint: el `<>...</>` dentro de `.map` necesita `key`. Como el fragmento no admite `key`, envolver cada iteración no es trivial; sustituye el `<>` por la lista `[<tr key=… />, isOpen && <tr key=… />]` devuelta directamente desde el `.map` (React acepta arrays de elementos con key). Es decir, devuelve `return [mainRow, detailRow].filter(Boolean)` con sus `key` ya puestos en cada `<tr>`. Verifica con `npm run lint`.

- [ ] **Step 4: `PorraCompare.tsx`** (líder actual de cada porra por total más probable)

```tsx
'use client'

import { Trophy } from 'lucide-react'
import { scorePorra } from '@/lib/engine/porra'
import type { Porra } from '@/lib/data/porra'

interface Props {
  porras: Porra[]
  activeId: string
  /** Position of each team in the single most-likely final ranking (1..48). */
  positions: Record<string, number>
  onSelect: (id: string) => void
}

/** Compact overview: the current leader of every porra by most-likely total. */
export default function PorraCompare({ porras, activeId, positions, onSelect }: Props) {
  const rows = porras.map(p => {
    const scored = scorePorra(positions, p.entries)
    const leader = scored[0]
    return { porra: p, leaderName: leader?.name ?? '—', leaderTotal: leader?.total ?? 0 }
  })

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4 sm:p-6">
      <p className="mb-3 text-sm text-[#8a8a8a]">
        Líder actual de cada porra según el cuadro más probable (menor total).
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
            <th className="py-1.5 pl-2 text-left font-medium">Porra</th>
            <th className="px-3 text-left font-medium">Participantes</th>
            <th className="px-3 text-left font-medium">Líder actual</th>
            <th className="px-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ porra, leaderName, leaderTotal }) => (
            <tr
              key={porra.id}
              onClick={() => onSelect(porra.id)}
              className={[
                'cursor-pointer border-t border-white/10 hover:bg-white/5',
                porra.id === activeId ? 'bg-[#E8B84B]/5' : '',
              ].join(' ')}
            >
              <td className="py-2.5 pl-2 align-middle font-bold text-[#f5f5f5]">{porra.name}</td>
              <td className="px-3 align-middle tabular-nums text-[#8a8a8a]">{porra.entries.length}</td>
              <td className="px-3 align-middle">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#E8B84B]">
                  <Trophy size={14} strokeWidth={2} aria-hidden="true" />
                  {leaderName}
                </span>
              </td>
              <td className="px-3 text-right align-middle tabular-nums text-[#f5f5f5]">{leaderTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Reescribir `PorraTab.tsx`** (orquestador)

```tsx
'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Radio } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useOdds } from '@/components/odds/OddsProvider'
import {
  migrate,
  newPorra,
  type Porra,
  type PorrasState,
} from '@/lib/data/porra'
import { runPorraMonteCarlo, type PorraProb } from '@/lib/engine/porra'
import { mostLikelyFinalRanking, finalPositions } from '@/lib/engine/finalRanking'
import PorraSwitcher from './PorraSwitcher'
import PorraEditor from './PorraEditor'
import PorraResults from './PorraResults'
import PorraCompare from './PorraCompare'

const N = 2000
const V2_KEY = 'wc2026-porras-v2'
const OLD_KEY = 'wc2026-porra'

type Mode = 'results' | 'editing' | 'compare'

function readJson(key: string): unknown {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function PorraTab() {
  const { state } = useStore()
  const { marketFn } = useOdds()
  const [data, setData] = useState<PorrasState>(() => migrate(null, null))
  const [mode, setMode] = useState<Mode>('results')
  const [result, setResult] = useState<PorraProb[] | null>(null)
  const [isPending, startTransition] = useTransition()

  // Hydrate (and migrate) from localStorage on mount.
  useEffect(() => {
    setData(migrate(readJson(V2_KEY), readJson(OLD_KEY)))
  }, [])

  const persist = (next: PorrasState) => {
    setData(next)
    setResult(null)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(V2_KEY, JSON.stringify(next))
      } catch {
        // ignore quota/availability errors
      }
    }
  }

  const active: Porra =
    data.porras.find(p => p.id === data.activeId) ?? data.porras[0]

  const setEntries = (entries: Porra['entries']) =>
    persist({
      ...data,
      porras: data.porras.map(p => (p.id === active.id ? { ...p, entries } : p)),
    })

  const onSelect = (id: string) => {
    persist({ ...data, activeId: id })
    setMode('results')
  }

  const onNew = () => {
    const p = newPorra(`Porra ${data.porras.length + 1}`)
    persist({ porras: [...data.porras, p], activeId: p.id })
    setMode('editing')
  }

  const onRename = (id: string) => {
    const current = data.porras.find(p => p.id === id)
    const name = window.prompt('Nombre de la porra', current?.name ?? '')
    if (name && name.trim()) {
      persist({ ...data, porras: data.porras.map(p => (p.id === id ? { ...p, name: name.trim() } : p)) })
    }
  }

  const onDuplicate = (id: string) => {
    const current = data.porras.find(p => p.id === id)
    if (!current) return
    const copy = newPorra(`${current.name} (copia)`)
    copy.entries = current.entries.map(e => ({ name: e.name, teams: [...e.teams] }))
    persist({ porras: [...data.porras, copy], activeId: copy.id })
  }

  const onDelete = (id: string) => {
    if (!window.confirm('¿Borrar esta porra?')) return
    const remaining = data.porras.filter(p => p.id !== id)
    if (remaining.length === 0) {
      // Never leave zero porras: recreate the default.
      persist(migrate(null, null))
      return
    }
    const activeId = id === data.activeId ? remaining[0].id : data.activeId
    persist({ porras: remaining, activeId })
  }

  // Single most-likely final ranking for the current scenario, shared by the
  // breakdown (PorraResults) and the compare view (PorraCompare). Memoized on
  // the fixed scores + market so it only recomputes when those change.
  const matchesKey = useMemo(
    () => state.matches.map(m => `${m.id}:${m.homeGoals}-${m.awayGoals}`).join('|'),
    [state.matches],
  )
  const positions = useMemo<Record<string, number>>(() => {
    return finalPositions(mostLikelyFinalRanking(state.matches, marketFn))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesKey, marketFn])

  const handleCalc = () => {
    startTransition(() => {
      setResult(runPorraMonteCarlo(N, active.entries, state.matches, undefined, marketFn))
    })
  }

  // Live mode: recompute MC automatically when real results change (unless editing).
  useEffect(() => {
    if (!state.liveMode || mode === 'editing') return
    startTransition(() => {
      setResult(runPorraMonteCarlo(N, active.entries, state.matches, undefined, marketFn))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.liveMode, state.matches, mode, active.id])

  const byName = new Map(active.entries.map(e => [e.name, e]))

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#f5f5f5]">Porra</h2>
            {state.liveMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E61D25]/15 px-2 py-0.5 text-xs font-semibold text-[#E61D25]">
                <Radio size={12} strokeWidth={2} aria-hidden="true" /> En directo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#8a8a8a]">
            Cada selección puntúa según su clasificación final (campeón = 1, …, 48º = 48). Gana
            quien menos sume con sus selecciones.
          </p>
        </div>
        <PorraSwitcher
          porras={data.porras}
          activeId={active.id}
          onSelect={onSelect}
          onNew={onNew}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode(mode === 'compare' ? 'results' : 'compare')}
          className="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-white/10 hover:border-white/20"
        >
          {mode === 'compare' ? 'Ver porra' : 'Comparar porras'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'editing' ? 'results' : 'editing')}
          className="rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-white/10 hover:border-white/20"
        >
          {mode === 'editing' ? 'Ver resultados' : 'Editar equipos'}
        </button>
        {mode !== 'editing' && mode !== 'compare' && (
          <button
            type="button"
            onClick={handleCalc}
            disabled={isPending}
            className="rounded-full bg-[#E8B84B] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Calculando…' : 'Calcular probabilidades'}
          </button>
        )}
      </div>

      {mode === 'compare' ? (
        <PorraCompare
          porras={data.porras}
          activeId={active.id}
          positions={positions}
          onSelect={onSelect}
        />
      ) : mode === 'editing' ? (
        <PorraEditor entries={active.entries} onChange={setEntries} />
      ) : !result ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-12 text-center text-[#8a8a8a]">
          <p className="text-sm leading-relaxed">
            Pulsa Calcular probabilidades para estimar, mediante {N.toLocaleString('es')}{' '}
            simulaciones Monte Carlo, la opción de victoria de cada participante. Despliega una fila
            para ver la posición de cada selección en el cuadro más probable.
          </p>
        </div>
      ) : (
        <PorraResults result={result} byName={byName} positions={positions} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verificar tests del motor (no regresión)**

Run: `npm test`
Expected: PASS — toda la suite (los UI no tienen tests).

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: sin errores. Si aparece el aviso de `key` en el fragmento de `PorraResults`, aplicar la nota del Step 3 (devolver array `[mainRow, detailRow]` con `key`).

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build de producción correcto, sin errores de tipos.

- [ ] **Step 9: Verificación manual (dev)**

Run: `npm run dev` y abrir http://localhost:3000 → pestaña Porra. Comprobar:
1. La porra existente se conserva (migración desde `wc2026-porra`).
2. "Nueva" crea una porra y entra en edición; "Renombrar"/"Duplicar"/"Borrar" funcionan; borrar la última recrea la por defecto.
3. Editor flexible: añadir/quitar participante y selecciones; el contador "X/48" y los avisos de duplicados/sin asignar se actualizan en vivo.
4. "Calcular probabilidades" muestra la tabla; al desplegar una fila aparece la posición de cada selección en el cuadro más probable y su suma.
5. "Comparar porras" lista todas con su líder actual; clic en una fila la activa.

- [ ] **Step 10: Commit**

```bash
git add components/porra/
git commit -m "feat(porra): multi-porra + desglose en vivo + comparar (refactor del tab)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Actualizar backlog y README

**Files:**
- Modify: `docs/IDEAS.md`
- Modify: `README.md`

- [ ] **Step 1: Quitar la idea ya implementada del backlog**

En `docs/IDEAS.md`, sección "## Porra", eliminar la línea de **Multi-porra** y la de **Desglose en vivo** (ya implementadas). Dejar **Reglas configurables** (sigue pendiente, descartada en esta iteración). Actualizar la línea de estado final a "6 fases de mejoras completadas (… , multi-porra + desglose)".

- [ ] **Step 2: Mencionar multi-porra en el README**

En `README.md`, en la descripción de la pestaña Porra (o en "Funcionalidad"), añadir una frase: varias porras independientes con desglose en vivo (posición de cada selección en el cuadro más probable) y vista para comparar el líder de cada porra.

- [ ] **Step 3: Commit**

```bash
git add docs/IDEAS.md README.md
git commit -m "docs: multi-porra implementada — actualizar backlog y README

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (autor del plan)

- **Cobertura del spec:**
  - Varias porras independientes → Tasks 3 (modelo) + 4 (switcher/orquestador). ✓
  - Reparto exacto flexible (nº libre de participantes, reparto desigual) → `isValidPorra` generalizado (T3) + `PorraEditor` flexible con contador 48 (T4). ✓
  - Único sistema de puntuación (posición final) → sin cambios en `scorePorra`/`runPorraMonteCarlo`. ✓
  - Desglose en vivo = posición en el cuadro más probable → `mostLikelyScore` (T1) + `mostLikelyFinalRanking` (T2) + filas desplegables (T4). ✓
  - Comparar porras (foto actual) → `PorraCompare` por total más probable (T4). ✓
  - Migración desde la clave antigua → `migrate` (T3) + hidratación (T4). ✓
  - Borrar última porra recrea la por defecto → `onDelete` (T4). ✓
  - Duplicar añade " (copia)" → `onDuplicate` (T4). ✓
  - Tests del motor (determinismo, permutación, fijados; migración; validación; newPorra) → Tasks 1–3. ✓
- **Placeholders:** ninguno; todo el código está completo.
- **Consistencia de tipos:** `Porra`, `PorrasState`, `PorraEntry`, `PartitionCheck`, `PorraProb`, `mostLikelyFinalRanking(matches, market?)`, `finalPositions`, `scorePorra(positions, entries)`, `migrate(v2Raw, oldRaw)`, `newPorra(name)` coinciden entre tasks y con las firmas reales del repo (verificadas en `montecarlo.ts`/`bracket.ts`/`finalRanking.ts`).
- **Decisión documentada:** "Comparar porras" usa el **total más probable** (no Monte Carlo por porra) para evitar N×2000 simulaciones; coherente con la métrica del desglose. Renombrar/borrar usan `window.prompt`/`confirm` (pragmático para v1).
