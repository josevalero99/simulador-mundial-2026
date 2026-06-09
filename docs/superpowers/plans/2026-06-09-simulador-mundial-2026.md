# Simulador Mundial 2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web app that reproduces the "Simulador Mundial 2026": user enters group results, the engine applies FIFA tiebreakers live, computes best thirds, builds the official knockout bracket, and estimates probabilities — using real Dec-5-2025 draw data.

**Architecture:** Next.js 14 App Router, fully client-side. A pure-functions engine (`lib/engine/`) is unit-tested with Vitest; React components render its output. Global session state lives in a `useReducer`+Context store persisted to `localStorage`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Vitest.

---

## File Structure

```
app/{layout,page}.tsx · app/globals.css
components/
  TabNav.tsx
  group-stage/{GroupCard,StandingsTable,ScoreInput,FixtureList,GroupStageTab}.tsx
  thirds/ThirdsTab.tsx
  bracket/{BracketTab,BracketMatch}.tsx
  probabilities/ProbabilitiesTab.tsx
  ui/{Flag,Pill}.tsx
lib/
  types.ts
  data/{teams,groups,fixtures,thirdsAllocation,r32}.ts
  engine/{standings,tiebreakers,bestThirds,bracket,montecarlo}.ts
  store.tsx
lib/engine/__tests__/*.test.ts
```

---

## Phase 0 — Scaffold

### Task 0: Initialize Next.js project

**Files:** Create project root files (`package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `vitest.config.ts`).

- [ ] **Step 1: Scaffold app** — run in repo root (project files live alongside existing `docs/`, `.claude/`):

```bash
npx create-next-app@14 . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
If it refuses due to non-empty dir, scaffold in a temp dir and copy `app/`, configs, `package.json` over, then `npm install`. Keep existing `docs/`, `.claude/`, `figma-console-mcp-main/`, `design/`.

- [ ] **Step 2: Add Vitest**

```bash
npm i -D vitest @vitejs/plugin-react
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['lib/**/*.test.ts'] },
})
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Verify** — `npm run dev` serves at :3000 (blank page OK); `npm test` runs (0 tests OK).

- [ ] **Step 4: Add `.gitignore` entries** for `node_modules`, `.next` (create-next-app does this). Commit:

```bash
git add -A && git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

## Phase 1 — Data layer

### Task 1: Core types

**Files:** Create `lib/types.ts`

- [ ] **Step 1: Write types** (no test — type-only file):

```ts
export type Confed = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'
export type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'
export type Matchday = 1 | 2 | 3

export interface Team {
  id: string          // ISO-ish slug, e.g. 'MEX'
  name: string        // Spanish display name
  flag: string        // emoji flag
  confederation: Confed
  pot: 1 | 2 | 3 | 4
  fifaRank: number    // for ranking-based sim + final tiebreaker
}

export interface Match {
  id: string
  group: GroupId
  matchday: Matchday
  date: string        // ISO date 'YYYY-MM-DD'
  home: string        // Team.id
  away: string        // Team.id
  homeGoals: number | null
  awayGoals: number | null
}

export interface StandingRow {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
  rank: number              // 1..4 within group
  tiebreakApplied?: string  // human-readable criterion that decided the tie ('i')
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts && git commit -m "feat(data): core types"
```

### Task 2: Teams data

**Files:** Create `lib/data/teams.ts`

- [ ] **Step 1:** Write `export const TEAMS: Record<string, Team>` for all 48 teams. Source of truth = spec table (verified groups). Each entry: id (3-letter slug), Spanish name, emoji flag, confederation, pot, fifaRank (use approx Nov-2025 FIFA ranking; exact value only matters for ordering, so monotonic ranks per the well-known list are fine). Example shape:

```ts
import { Team } from '@/lib/types'
export const TEAMS: Record<string, Team> = {
  MEX: { id:'MEX', name:'México', flag:'🇲🇽', confederation:'CONCACAF', pot:1, fifaRank:13 },
  KOR: { id:'KOR', name:'Corea del Sur', flag:'🇰🇷', confederation:'AFC', pot:2, fifaRank:23 },
  RSA: { id:'RSA', name:'Sudáfrica', flag:'🇿🇦', confederation:'CAF', pot:3, fifaRank:61 },
  CZE: { id:'CZE', name:'Chequia', flag:'🇨🇿', confederation:'UEFA', pot:4, fifaRank:43 },
  // ...all 48 from the spec table
}
```

- [ ] **Step 2: Test** — `lib/data/teams.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { TEAMS } from './teams'
describe('TEAMS', () => {
  it('has 48 teams', () => { expect(Object.keys(TEAMS)).toHaveLength(48) })
  it('keys match ids', () => {
    for (const [k, t] of Object.entries(TEAMS)) expect(t.id).toBe(k)
  })
  it('has exactly 12 teams per pot', () => {
    for (const p of [1,2,3,4]) {
      expect(Object.values(TEAMS).filter(t => t.pot === p)).toHaveLength(12)
    }
  })
})
```

- [ ] **Step 3:** Run `npm test lib/data/teams.test.ts` → PASS. Commit `feat(data): 48 teams`.

### Task 3: Groups data

**Files:** Create `lib/data/groups.ts`

- [ ] **Step 1:** Write group→team-ids mapping (pot order) from spec:

```ts
import { GroupId } from '@/lib/types'
export const GROUPS: Record<GroupId, string[]> = {
  A: ['MEX','KOR','RSA','CZE'],
  B: ['CAN','SUI','QAT','BIH'],
  C: ['BRA','MAR','SCO','HAI'],
  D: ['USA','AUS','PAR','TUR'],
  E: ['GER','ECU','CIV','CUW'],
  F: ['NED','JPN','TUN','SWE'],
  G: ['BEL','IRN','EGY','NZL'],
  H: ['ESP','URU','KSA','CPV'],
  I: ['FRA','SEN','NOR','IRQ'],
  J: ['ARG','AUT','ALG','JOR'],
  K: ['POR','COL','UZB','COD'],
  L: ['ENG','CRO','PAN','GHA'],
}
export const GROUP_IDS: GroupId[] = ['A','B','C','D','E','F','G','H','I','J','K','L']
```

- [ ] **Step 2: Test** — `lib/data/groups.test.ts`: every group has 4 ids; all 48 ids are unique and exist in `TEAMS`; each group's 4 teams have pots {1,2,3,4}.

```ts
import { describe, it, expect } from 'vitest'
import { GROUPS } from './groups'
import { TEAMS } from './teams'
describe('GROUPS', () => {
  const all = Object.values(GROUPS).flat()
  it('48 unique ids', () => { expect(new Set(all).size).toBe(48) })
  it('all ids exist in TEAMS', () => { all.forEach(id => expect(TEAMS[id]).toBeTruthy()) })
  it('one team per pot in each group', () => {
    for (const ids of Object.values(GROUPS)) {
      expect(ids.map(id => TEAMS[id].pot).sort()).toEqual([1,2,3,4])
    }
  })
})
```

- [ ] **Step 3:** Run → PASS. Commit `feat(data): 12 groups`.

### Task 4: Fixtures generator

**Files:** Create `lib/data/fixtures.ts`

- [ ] **Step 1: Test first** — `lib/data/fixtures.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateFixtures } from './fixtures'
describe('generateFixtures', () => {
  const f = generateFixtures()
  it('produces 72 matches (6 per group × 12)', () => { expect(f).toHaveLength(72) })
  it('each group is a round-robin: each team plays 3 times', () => {
    const byGroup: Record<string, string[]> = {}
    f.forEach(m => { (byGroup[m.group] ??= []).push(m.home, m.away) })
    for (const teams of Object.values(byGroup)) {
      const counts = new Map<string,number>()
      teams.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1))
      expect([...counts.values()].every(c => c === 3)).toBe(true)
    }
  })
  it('every match starts with null scores', () => {
    expect(f.every(m => m.homeGoals === null && m.awayGoals === null)).toBe(true)
  })
  it('unique match ids', () => { expect(new Set(f.map(m => m.id)).size).toBe(72) })
})
```

- [ ] **Step 2: Run** → FAIL (no module).

- [ ] **Step 3: Implement** — standard 4-team round-robin schedule (positions 0..3): MD1 = (0v1, 2v3), MD2 = (0v2, 3v1), MD3 = (3v0, 1v2). Spread matchdays across official windows: MD1 = 2026-06-11, MD2 = 2026-06-18, MD3 = 2026-06-24 (date is informational for the "Por fecha" view).

```ts
import { GROUPS, GROUP_IDS } from './groups'
import { Match, Matchday } from '@/lib/types'
const PAIRS: [number,number][][] = [[[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]]]
const MD_DATES = ['2026-06-11','2026-06-18','2026-06-24']
export function generateFixtures(): Match[] {
  const out: Match[] = []
  for (const g of GROUP_IDS) {
    const ids = GROUPS[g]
    PAIRS.forEach((md, i) => {
      const matchday = (i + 1) as Matchday
      md.forEach(([h, a], j) => {
        out.push({ id:`${g}-${matchday}-${j}`, group:g, matchday, date:MD_DATES[i],
          home:ids[h], away:ids[a], homeGoals:null, awayGoals:null })
      })
    })
  }
  return out
}
```

- [ ] **Step 4: Run** → PASS. Commit `feat(data): round-robin fixtures generator`.

### Task 5: Official R32 pairings + third-place allocation table

**Files:** Create `lib/data/r32.ts`, `lib/data/thirdsAllocation.ts`

- [ ] **Step 1: R32 pairings** — encode the 16 official Round-of-32 slots (spec). Each slot references either a fixed group position or a third-place placeholder set:

```ts
import { GroupId } from '@/lib/types'
export type Slot =
  | { kind: 'pos'; rank: 1 | 2; group: GroupId }
  | { kind: 'third'; from: GroupId[] }       // candidate groups; resolved by allocation table
export interface R32Pairing { match: number; home: Slot; away: Slot }
export const R32: R32Pairing[] = [
  { match:1,  home:{kind:'pos',rank:2,group:'A'}, away:{kind:'pos',rank:2,group:'B'} },
  { match:2,  home:{kind:'pos',rank:1,group:'C'}, away:{kind:'pos',rank:2,group:'F'} },
  { match:3,  home:{kind:'pos',rank:1,group:'E'}, away:{kind:'third',from:['A','B','C','D','F']} },
  { match:4,  home:{kind:'pos',rank:1,group:'F'}, away:{kind:'pos',rank:2,group:'C'} },
  { match:5,  home:{kind:'pos',rank:2,group:'E'}, away:{kind:'pos',rank:2,group:'I'} },
  { match:6,  home:{kind:'pos',rank:1,group:'I'}, away:{kind:'third',from:['C','D','F','G','H']} },
  { match:7,  home:{kind:'pos',rank:1,group:'A'}, away:{kind:'third',from:['C','E','F','H','I']} },
  { match:8,  home:{kind:'pos',rank:1,group:'L'}, away:{kind:'third',from:['E','H','I','J','K']} },
  { match:9,  home:{kind:'pos',rank:1,group:'G'}, away:{kind:'third',from:['A','E','H','I','J']} },
  { match:10, home:{kind:'pos',rank:1,group:'D'}, away:{kind:'third',from:['B','E','F','I','J']} },
  { match:11, home:{kind:'pos',rank:1,group:'H'}, away:{kind:'pos',rank:2,group:'J'} },
  { match:12, home:{kind:'pos',rank:2,group:'K'}, away:{kind:'pos',rank:2,group:'L'} },
  { match:13, home:{kind:'pos',rank:1,group:'B'}, away:{kind:'third',from:['E','F','G','I','J']} },
  { match:14, home:{kind:'pos',rank:2,group:'D'}, away:{kind:'pos',rank:2,group:'G'} },
  { match:15, home:{kind:'pos',rank:1,group:'J'}, away:{kind:'pos',rank:2,group:'H'} },
  { match:16, home:{kind:'pos',rank:1,group:'K'}, away:{kind:'third',from:['D','E','I','J','L']} },
]
```

- [ ] **Step 2: Allocation table** — the official mapping has C(12,8)=495 rows (which 8 of 12 groups' thirds qualify → which group's third goes to which of the 8 third-slots). Obtain it programmatically rather than hand-typing 495 rows:

  Fetch the "Combinations of matches in the round of 32" table from
  `https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage`, parse the 8-qualifier
  combination rows, and emit `lib/data/thirdsAllocation.ts` as:

```ts
// key = sorted qualifying group letters joined, e.g. 'ABCDEFGH'
// value = map from the R32 match number (the 8 third-slots) to the GroupId assigned
export const THIRDS_ALLOCATION: Record<string, Record<number, GroupId>> = { /* generated */ }
```

  Write a one-off generator script `scripts/buildThirdsAllocation.mjs` (committed) that does the
  fetch+parse and writes the file, so the data is reproducible. The 8 third-slots are R32 matches
  3, 6, 7, 8, 9, 10, 13, 16.

- [ ] **Step 3: Test** — `lib/data/thirdsAllocation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { THIRDS_ALLOCATION } from './thirdsAllocation'
describe('THIRDS_ALLOCATION', () => {
  it('has 495 combinations', () => { expect(Object.keys(THIRDS_ALLOCATION)).toHaveLength(495) })
  it('each maps the 8 third-slots to 8 distinct groups from the combo', () => {
    for (const [combo, map] of Object.entries(THIRDS_ALLOCATION)) {
      const slots = Object.keys(map).map(Number).sort((a,b)=>a-b)
      expect(slots).toEqual([3,6,7,8,9,10,13,16])
      const groups = Object.values(map)
      expect(new Set(groups).size).toBe(8)
      groups.forEach(g => expect(combo.includes(g)).toBe(true))
    }
  })
})
```

- [ ] **Step 4: Run** → PASS. Commit `feat(data): official R32 pairings + 495-combo thirds allocation`.

---

## Phase 2 — Engine: standings

### Task 6: Compute raw standings

**Files:** Create `lib/engine/standings.ts`, test `lib/engine/__tests__/standings.test.ts`

- [ ] **Step 1: Test first**:

```ts
import { describe, it, expect } from 'vitest'
import { computeStandings } from '../standings'
import { Match } from '@/lib/types'
const m = (home:string,away:string,hg:number|null,ag:number|null): Match =>
  ({ id:`${home}${away}`, group:'A', matchday:1, date:'', home, away, homeGoals:hg, awayGoals:ag })
describe('computeStandings', () => {
  it('counts a win as 3, draw as 1, loss 0', () => {
    const rows = computeStandings(['X','Y','Z'], [ m('X','Y',2,0), m('Y','Z',1,1) ])
    const X = rows.find(r=>r.teamId==='X')!, Y = rows.find(r=>r.teamId==='Y')!, Z = rows.find(r=>r.teamId==='Z')!
    expect(X.points).toBe(3); expect(X.won).toBe(1); expect(X.gf).toBe(2); expect(X.gd).toBe(2)
    expect(Y.points).toBe(1); expect(Y.played).toBe(2)
    expect(Z.points).toBe(1)
  })
  it('ignores matches with null scores', () => {
    const rows = computeStandings(['X','Y'], [ m('X','Y',null,null) ])
    expect(rows.every(r => r.played === 0 && r.points === 0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** `computeStandings(teamIds, matches): StandingRow[]` — accumulate played/won/drawn/lost/gf/ga/gd/points from matches whose both scores are non-null; `rank` left at 0 (set by tiebreakers). Return one row per teamId.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): raw standings`.

---

## Phase 3 — Engine: FIFA tiebreakers

### Task 7: Order a group with tiebreakers

**Files:** Create `lib/engine/tiebreakers.ts`, test `lib/engine/__tests__/tiebreakers.test.ts`

- [ ] **Step 1: Test first** — cover each criterion, including 2-team and 3-team head-to-head, and the `tiebreakApplied` annotation:

```ts
import { describe, it, expect } from 'vitest'
import { rankGroup } from '../tiebreakers'
import { Match, StandingRow } from '@/lib/types'
// helper builds matches; teams ESP, ITA, GER, FRA with fifaRank lookup injected
// ... (use small inline fifaRank map { ESP:1, ITA:2, GER:3, FRA:4 })

describe('rankGroup', () => {
  it('orders by points then GD then GF', () => {
    // construct results so points differ -> assert rank order
  })
  it('breaks an equal-points tie by head-to-head between the two tied teams', () => {
    // two teams equal on pts/GD/GF overall but A beat B head-to-head -> A ranked above, tiebreakApplied set
  })
  it('falls back to fifaRank when fully level', () => {
    // all identical -> higher fifaRank (lower number) ranked first, tiebreakApplied = 'Ranking FIFA'
  })
})
```

(Write the full match constructions in the test — no placeholders in the real file.)

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** `rankGroup(teamIds, matches, fifaRank: (id)=>number): StandingRow[]`:
  1. `computeStandings`.
  2. Sort by overall: points, gd, gf (desc).
  3. For groups of teams still equal on (points, gd, gf), apply head-to-head mini-table among **only** those teams: h2h points, h2h gd, h2h gf (desc).
  4. Then fair-play (not modeled in v1 → skip/equal) → fifaRank (asc number = better).
  5. Assign `rank` 1..n. Set `tiebreakApplied` to the criterion name on any row whose position over the next team was NOT decided by points (i.e., needed gd or lower). Keep the label human-readable for the `i` tooltip.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): FIFA tiebreakers with explainable 'i'`.

---

## Phase 4 — Engine: best thirds + bracket seeding

### Task 8: Rank the 12 third-placed teams, take best 8

**Files:** Create `lib/engine/bestThirds.ts`, test `lib/engine/__tests__/bestThirds.test.ts`

- [ ] **Step 1: Test first**:

```ts
import { describe, it, expect } from 'vitest'
import { rankThirds } from '../bestThirds'
// input: Record<GroupId, StandingRow[]> (already ranked). rankThirds picks each group's rank-3 row,
// ranks them by points, gd, gf, fifaRank, returns ordered list with {group, row, qualified:boolean}
describe('rankThirds', () => {
  it('returns 12 thirds, marks top 8 qualified', () => {
    // build 12 groups' standings -> assert 8 qualified, 4 not, ordered correctly
  })
})
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** `rankThirds(standingsByGroup, fifaRank)`: take each group's `rank===3` row, sort by points/gd/gf/fifaRank, mark first 8 `qualified:true`. Return `{ group: GroupId; row: StandingRow; qualified: boolean }[]`.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): best-thirds ranking`.

### Task 9: Allocate qualified thirds to R32 slots

**Files:** Create `lib/engine/bracket.ts` (allocation part), test `lib/engine/__tests__/allocateThirds.test.ts`

- [ ] **Step 1: Test first**:

```ts
import { describe, it, expect } from 'vitest'
import { allocateThirds } from '../bracket'
describe('allocateThirds', () => {
  it('maps the 8 qualifying groups to R32 third-slots via the official table', () => {
    const combo = ['A','B','C','D','E','F','G','H'] // example qualifying groups
    const map = allocateThirds(combo) // -> Record<matchNumber, GroupId> for slots 3,6,7,8,9,10,13,16
    expect(new Set(Object.values(map)).size).toBe(8)
    expect(Object.keys(map).map(Number).sort((a,b)=>a-b)).toEqual([3,6,7,8,9,10,13,16])
    Object.values(map).forEach(g => expect(combo).toContain(g))
  })
})
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** `allocateThirds(qualifyingGroups: GroupId[]): Record<number, GroupId>` — sort the 8 groups, join to a key, look up `THIRDS_ALLOCATION[key]`. Throw a clear error if the combo isn't found (means a data bug).

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): allocate thirds to R32`.

### Task 10: Resolve R32 fixtures from standings

**Files:** Modify `lib/engine/bracket.ts`, test `lib/engine/__tests__/resolveR32.test.ts`

- [ ] **Step 1: Test first** — given full standings for all 12 groups, `resolveR32` returns 16 concrete `{home: teamId, away: teamId}` matchups using `R32` pairings + `allocateThirds`. Test asserts e.g. match 1 = (2nd of A vs 2nd of B), and that a third-slot resolves to the correct group's rank-3 team.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** `resolveR32(standingsByGroup): { match:number; home:string; away:string }[]`:
  - winners/runners-up read directly from each group's ranked rows;
  - qualified thirds via `rankThirds` → `allocateThirds`;
  - for each `R32` pairing, resolve `pos` slots directly and `third` slots through the allocation map.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): resolve R32 matchups`.

### Task 11: Knockout progression

**Files:** Modify `lib/engine/bracket.ts`, test `lib/engine/__tests__/bracket.test.ts`

- [ ] **Step 1: Test first** — `advanceBracket(r32, winners)` where `winners` is a map of match→winning teamId; assert it produces R16 (8), QF (4), SF (2), Final (1) following standard bracket adjacency (R32 match 1 winner vs match 2 winner, etc., per official bracket order).

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** a `BracketState` type (rounds: r32/r16/qf/sf/final, each a list of `{home, away, winner?}`) and `advanceBracket` that folds winners up the tree. Adjacency: round N match `i` feeds round N+1 match `floor(i/2)`.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): knockout progression`.

---

## Phase 5 — Engine: Monte Carlo

### Task 12: Ranking-based result model + simulation

**Files:** Create `lib/engine/montecarlo.ts`, test `lib/engine/__tests__/montecarlo.test.ts`

- [ ] **Step 1: Test first** — deterministic with injected RNG:

```ts
import { describe, it, expect } from 'vitest'
import { simulateOnce, runMonteCarlo } from '../montecarlo'
describe('montecarlo', () => {
  it('higher-ranked team wins more often over many runs', () => {
    const probs = runMonteCarlo(2000, () => 0.5) // see impl: rng injectable
    // assert a strong team (low fifaRank) has higher championship prob than a weak one
  })
  it('probabilities for a stage sum to ~1 across all teams', () => {
    const probs = runMonteCarlo(1000)
    const total = Object.values(probs).reduce((s,p)=>s+p.champion,0)
    expect(total).toBeCloseTo(1, 1)
  })
})
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement**:
  - `expectedResult(a,b,rng)` — win/draw/loss sampled from a logistic on fifaRank difference (e.g. `pA = 1/(1+10^((rankA-rankB)/k))`), producing plausible scorelines.
  - `simulateOnce(rng)` — fill all group matches, run standings+tiebreakers+thirds+bracket+advance, return per-team reached-stage flags + champion.
  - `runMonteCarlo(n, rng=Math.random)` — aggregate to `Record<teamId, { r32:%, r16:%, qf:%, sf:%, final:%, champion:% }>`. RNG injectable for tests.

- [ ] **Step 4: Run** → PASS. Commit `feat(engine): Monte Carlo probabilities`.

---

## Phase 6 — Store

### Task 13: Session store with localStorage

**Files:** Create `lib/store.tsx`, test `lib/store.test.ts` (reducer only)

- [ ] **Step 1: Test first** — reducer pure-function tests: `SET_SCORE` updates a match; `SIMULATE_BY_RANKING` fills all; `CLEAR` resets to null scores; corrupt persisted JSON → initial state.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** reducer + `StoreProvider`/`useStore` Context. State = `{ matches: Match[] }` seeded from `generateFixtures()`. Actions: `SET_SCORE`, `SIMULATE_BY_RANKING` (uses montecarlo's `expectedResult` once), `FILL_SCENARIO` (random plausible), `CLEAR`. Persist `matches` to `localStorage` on change; hydrate on mount with try/catch.

- [ ] **Step 4: Run** → PASS. Commit `feat(store): session state + persistence`.

---

## Phase 7 — UI

> UI tasks: no unit tests (validated visually). After each, run `npm run dev` and check the page. Dark theme tokens in `globals.css`: bg `#0a0a0a`/`#101010`, card `#161616`, accent lime `#c6f24e`, qualified-1/2 green, third amber, eliminated gray.

### Task 14: Shell — layout, header, TabNav

**Files:** Modify `app/layout.tsx`, `app/page.tsx`, `app/globals.css`; create `components/TabNav.tsx`, `components/ui/{Flag,Pill}.tsx`

- [ ] **Step 1:** Header: "COPA MUNDIAL · 48 SELECCIONES" eyebrow, "Simulador Mundial 2026" title, subtitle, action buttons (Simular por ranking / Rellenar escenario / Limpiar wired to store). Tabs: Fase de grupos · Mejores terceros · Eliminatorias · Probabilidades (local `useState` active tab). Wrap `app/page.tsx` in `StoreProvider`.
- [ ] **Step 2:** Verify visually. Commit `feat(ui): shell + tabs + actions`.

### Task 15: Group stage tab

**Files:** Create `components/group-stage/{GroupStageTab,GroupCard,StandingsTable,ScoreInput,FixtureList}.tsx`

- [ ] **Step 1:** `GroupStageTab` renders 12 `GroupCard`s in a responsive grid, with "Por grupos"/"Por fecha" toggle and the legend row. `GroupCard` shows `StandingsTable` (rank dot color by position, `i` badge with tooltip from `tiebreakApplied`, columns PTS PJ G E P DG) computed live via `rankGroup`, plus `FixtureList` of the group's 6 matches grouped by matchday with `ScoreInput` (two number inputs) dispatching `SET_SCORE`.
- [ ] **Step 2:** Verify visually against reference image. Commit `feat(ui): group stage tab`.

### Task 16: Best thirds tab

**Files:** Create `components/thirds/ThirdsTab.tsx`

- [ ] **Step 1:** Build standings for all groups, call `rankThirds`, render a single table of 12 rows; top-8 highlighted (amber/green), bottom-4 dimmed. Show group letter, flag, team, PTS/DG/GF.
- [ ] **Step 2:** Verify. Commit `feat(ui): best thirds tab`.

### Task 17: Bracket tab

**Files:** Create `components/bracket/{BracketTab,BracketMatch}.tsx`

- [ ] **Step 1:** If all 12 groups complete → `resolveR32` and render columns R32→Final; clicking a team in a match sets it as winner (local state map) and `advanceBracket` re-renders downstream. If incomplete → show "Completa la fase de grupos" placeholder. `BracketMatch` shows both teams with flags, selectable.
- [ ] **Step 2:** Verify. Commit `feat(ui): knockout bracket tab`.

### Task 18: Probabilities tab

**Files:** Create `components/probabilities/ProbabilitiesTab.tsx`

- [ ] **Step 1:** "Calcular" button runs `runMonteCarlo(2000)` (in a `useTransition` so UI stays responsive) over the current scenario; render a sortable table of teams with bars for champion/final/SF %. Show run count.
- [ ] **Step 2:** Verify. Commit `feat(ui): probabilities tab`.

---

## Phase 8 — Polish

### Task 19: Visual pass against reference

**Files:** `app/globals.css`, component tweaks

- [ ] **Step 1:** Match spacing, fonts (bold condensed title), rounded cards, lime primary button, monospace-ish score chips. Mobile responsive (cards stack).
- [ ] **Step 2:** Final `npm run build` passes with no type errors. Commit `style: visual polish to match reference`.

### Task 20: README + run instructions

- [ ] **Step 1:** Short `README.md`: what it is, `npm install`, `npm run dev`, `npm test`, data sources, scope notes.
- [ ] **Step 2:** Commit `docs: readme`.

---

## Self-Review notes

- **Spec coverage:** stack (T0), real data/groups (T2–T3), fixtures (T4), tiebreakers w/ `i` (T7), best thirds (T8) + official 495-table allocation (T5/T9), official R32 + bracket (T5,T10,T11), Monte Carlo (T12), 4 tabs (T14–T18), localStorage (T13), 3 action buttons (T13/T14). ✓
- **Types:** `Team/Match/StandingRow/GroupId` defined in T1 and reused; `Slot/R32Pairing` in T5; engine signatures consistent across T6–T12.
- **Data realism caveat:** `fifaRank` values approximate Nov-2025 ordering — only relative order matters (final tiebreaker + sim weighting). Logged here, not silently assumed.
- **Known heavy step:** T5 step 2 fetches/parses the 495-row Wikipedia table via a committed generator script — reproducible, not hand-typed.
