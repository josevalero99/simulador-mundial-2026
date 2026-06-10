# Comparador de selecciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una pestaña "Comparador" (mobile-first) que enfrenta dos selecciones con stats, forma reciente y head-to-head reales, enfrentamiento Elo (1X2 + marcador) y % de campeón.

**Architecture:** Un script de build baja un dataset abierto de partidos internacionales y emite `lib/data/comparadorData.ts` (forma + h2h, empaquetado). Accesores puros leen esos datos. El motor Elo existente (`matchOutcomeProbs`, `mostLikelyScore`) y un hook compartido `useTournamentProbs` (Monte Carlo) alimentan el enfrentamiento y el % campeón. Un `ComparadorTab` compone todo y se integra como pestaña 8 (dentro de "Más" en móvil).

**Tech Stack:** Next.js 14, React 18, TS, Tailwind, lucide-react, vitest (entorno node, solo `lib/**/*.test.ts`). Scripts de datos `.mjs` (patrón `scripts/build*.mjs`).

> **Nota de testing:** El repo solo tiene tests de lógica pura en `lib/` (node, sin DOM). Por eso van por **TDD** las Tareas 2, 3 y 7 (parte tabs). Las tareas de componentes y el script de datos se verifican con `npm run lint` + `npm run build` + checklist manual.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `scripts/buildComparadorData.mjs` (nuevo) | Baja `results.csv`, filtra a las 48 selecciones, mapea nombres→ids, emite el .ts de datos. |
| `lib/data/comparadorData.ts` (generado, committeado) | `SNAPSHOT_DATE`, `H2H`, `FORM` + sus interfaces. |
| `lib/data/comparador.ts` (nuevo) | Accesores puros `pairKey`, `viewH2H`, `getH2H`, `getForm`. |
| `lib/data/comparador.test.ts` (nuevo) | Tests de los accesores. |
| `lib/data/groups.ts` (modificar) | Añadir `groupOf(teamId)`. |
| `lib/data/groupOf.test.ts` (nuevo) | Test de `groupOf`. |
| `components/probabilities/useTournamentProbs.ts` (nuevo) | Hook que memoiza/dispara `runMonteCarlo`. |
| `components/probabilities/ProbabilitiesTab.tsx` (modificar) | Usa el hook (comportamiento idéntico). |
| `components/comparador/TeamSelect.tsx` (nuevo) | Dropdown reutilizable de selecciones. |
| `components/comparador/ComparadorTab.tsx` (nuevo) | Orquesta el comparador (mobile-first). |
| `lib/nav/tabs.ts` (modificar) | Añadir `comparador` (índice 8) + `secondaryIndices`. |
| `lib/nav/tabs.test.ts` (modificar) | Ampliar a 9 tabs. |
| `components/nav/tabIcons.tsx` (modificar) | `comparador: Scale`. |
| `app/page.tsx` (modificar) | `active === 8 && <ComparadorTab />`. |

---

## Task 1: Script de datos + datos generados

**Files:**
- Create: `scripts/buildComparadorData.mjs`
- Generate+commit: `lib/data/comparadorData.ts`

- [ ] **Step 1: Crear el script**

`scripts/buildComparadorData.mjs`:
```js
// Genera lib/data/comparadorData.ts con forma reciente y head-to-head de las
// 48 selecciones del Mundial 2026, a partir del dataset abierto martj42.
// Ejecutar: node scripts/buildComparadorData.mjs   (requiere red)
import { writeFileSync } from 'node:fs'

const URL = 'https://raw.githubusercontent.com/martj42/international_results/master/results.csv'

// Nombre del dataset (inglés) -> id interno. Incluye alias conocidos.
const NAME_TO_ID = {
  Mexico: 'MEX', 'South Korea': 'KOR', 'South Africa': 'RSA', 'Czech Republic': 'CZE', Czechia: 'CZE',
  Canada: 'CAN', Switzerland: 'SUI', Qatar: 'QAT', 'Bosnia and Herzegovina': 'BIH',
  Brazil: 'BRA', Morocco: 'MAR', Scotland: 'SCO', Haiti: 'HAI',
  'United States': 'USA', Australia: 'AUS', Paraguay: 'PAR', Turkey: 'TUR', 'Türkiye': 'TUR',
  Germany: 'GER', Ecuador: 'ECU', 'Ivory Coast': 'CIV', 'Curaçao': 'CUW', Curacao: 'CUW',
  Netherlands: 'NED', Japan: 'JPN', Tunisia: 'TUN', Sweden: 'SWE',
  Belgium: 'BEL', Iran: 'IRN', Egypt: 'EGY', 'New Zealand': 'NZL',
  Spain: 'ESP', Uruguay: 'URU', 'Saudi Arabia': 'KSA', 'Cape Verde': 'CPV', 'Cabo Verde': 'CPV',
  France: 'FRA', Senegal: 'SEN', Norway: 'NOR', Iraq: 'IRQ',
  Argentina: 'ARG', Austria: 'AUT', Algeria: 'ALG', Jordan: 'JOR',
  Portugal: 'POR', Colombia: 'COL', Uzbekistan: 'UZB', 'DR Congo': 'COD', 'Congo DR': 'COD',
  England: 'ENG', Croatia: 'CRO', Panama: 'PAN', Ghana: 'GHA',
}
const OUR = new Set(Object.values(NAME_TO_ID))

// Parser CSV mínimo que respeta comillas dobles.
function parseLine(line) {
  const out = []
  let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

const text = await (await fetch(URL)).text()
const lines = text.split('\n').filter((l) => l.trim().length > 0)
const header = parseLine(lines[0])
const col = (name) => header.indexOf(name)
const iDate = col('date'), iH = col('home_team'), iA = col('away_team'), iHG = col('home_score'), iAG = col('away_score')

const matches = []
for (let i = 1; i < lines.length; i++) {
  const f = parseLine(lines[i])
  const hg = Number(f[iHG]), ag = Number(f[iAG])
  if (!Number.isFinite(hg) || !Number.isFinite(ag) || f[iHG] === '' || f[iAG] === '') continue
  matches.push({ date: f[iDate], home: f[iH], away: f[iA], hg, ag })
}
matches.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
const snapshot = matches.length ? matches[matches.length - 1].date : ''

// FORM: últimos 5 por selección.
const formByTeam = {}
const pushForm = (id, oppName, oppId, gf, ga, date) => {
  const res = gf > ga ? 'W' : gf < ga ? 'L' : 'D'
  ;(formByTeam[id] ??= []).push({ date, oppName, oppId, gf, ga, res })
}
for (const m of matches) {
  const idH = NAME_TO_ID[m.home], idA = NAME_TO_ID[m.away]
  if (idH) pushForm(idH, m.away, idA ?? null, m.hg, m.ag, m.date)
  if (idA) pushForm(idA, m.home, idH ?? null, m.ag, m.hg, m.date)
}
const FORM = {}
for (const id of Object.keys(formByTeam)) {
  FORM[id] = formByTeam[id].slice(-5).reverse() // más reciente primero
}

// H2H: pares de nuestras 48 que se han enfrentado.
const h2h = {}
for (const m of matches) {
  const idH = NAME_TO_ID[m.home], idA = NAME_TO_ID[m.away]
  if (!idH || !idA || idH === idA) continue
  const [lo, hi] = idH < idA ? [idH, idA] : [idA, idH]
  const key = `${lo}|${hi}`
  const rec = (h2h[key] ??= { played: 0, winsLo: 0, draws: 0, winsHi: 0, all: [] })
  rec.played++
  const loGoals = idH === lo ? m.hg : m.ag
  const hiGoals = idH === lo ? m.ag : m.hg
  if (loGoals > hiGoals) rec.winsLo++
  else if (loGoals < hiGoals) rec.winsHi++
  else rec.draws++
  rec.all.push({ date: m.date, loId: lo, hiId: hi, loGoals, hiGoals })
}
const H2H = {}
for (const key of Object.keys(h2h)) {
  const r = h2h[key]
  H2H[key] = { played: r.played, winsLo: r.winsLo, draws: r.draws, winsHi: r.winsHi, last: r.all.slice(-3).reverse() }
}

// Aviso: selecciones nuestras sin forma (posible fallo de mapeo).
for (const id of OUR) if (!FORM[id]) console.warn(`[buildComparadorData] sin forma para ${id} (¿mapeo de nombre?)`)

const out = `// AUTO-GENERATED by scripts/buildComparadorData.mjs — no editar a mano.
export const SNAPSHOT_DATE = ${JSON.stringify(snapshot)}

export interface H2HMeeting { date: string; loId: string; hiId: string; loGoals: number; hiGoals: number }
export interface H2HRecord { played: number; winsLo: number; draws: number; winsHi: number; last: H2HMeeting[] }
export const H2H: Record<string, H2HRecord> = ${JSON.stringify(H2H)}

export interface FormMatch { date: string; oppName: string; oppId: string | null; gf: number; ga: number; res: 'W' | 'D' | 'L' }
export const FORM: Record<string, FormMatch[]> = ${JSON.stringify(FORM)}
`
writeFileSync(new URL('../lib/data/comparadorData.ts', import.meta.url), out)
console.log(`OK — ${Object.keys(FORM).length} selecciones con forma, ${Object.keys(H2H).length} pares h2h, snapshot ${snapshot}`)
```

- [ ] **Step 2: Generar los datos**

Run: `node scripts/buildComparadorData.mjs`
Expected: imprime `OK — 48 selecciones con forma, NNN pares h2h, snapshot YYYY-MM-DD` y crea `lib/data/comparadorData.ts`. Si aparece algún `sin forma para XXX`, corrige `NAME_TO_ID` y re-ejecuta.

- [ ] **Step 3: Sanidad rápida**

Run: `node -e "const d=require('@swc/register')||0" 2>/dev/null; npx tsx -e "import('./lib/data/comparadorData.ts').then(m=>console.log('ESP form', (m.FORM['ESP']||[]).length, '| ARG|BRA?', !!m.H2H['ARG|BRA']))"`
Expected: `ESP form 5 | ARG|BRA? true` (o similar; ESP con forma y el par ARG|BRA existe). Si `tsx` no está, basta con abrir el archivo y comprobar a ojo que `FORM` y `H2H` no están vacíos.

- [ ] **Step 4: Commit**

```bash
git add scripts/buildComparadorData.mjs lib/data/comparadorData.ts
git commit -m "feat(data): script + dataset empaquetado de forma y head-to-head"
```

---

## Task 2: Accesores de datos (TDD)

**Files:**
- Create: `lib/data/comparador.ts`
- Test: `lib/data/comparador.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/data/comparador.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { pairKey, viewH2H, getH2H, getForm } from './comparador'

describe('comparador accesores', () => {
  it('pairKey ordena los ids alfabéticamente', () => {
    expect(pairKey('ESP', 'ARG')).toBe('ARG|ESP')
    expect(pairKey('ARG', 'ESP')).toBe('ARG|ESP')
  })

  it('viewH2H normaliza la orientación a la perspectiva de A', () => {
    const rec = { played: 3, winsLo: 2, draws: 0, winsHi: 1, last: [] }
    // lo = 'ARG', hi = 'ESP'
    expect(viewH2H(rec, 'ARG', 'ESP')).toEqual({ played: 3, winsA: 2, draws: 0, winsB: 1, last: [] })
    expect(viewH2H(rec, 'ESP', 'ARG')).toEqual({ played: 3, winsA: 1, draws: 0, winsB: 2, last: [] })
  })

  it('viewH2H devuelve null sin datos o sin partidos', () => {
    expect(viewH2H(undefined, 'ARG', 'ESP')).toBeNull()
    expect(viewH2H({ played: 0, winsLo: 0, draws: 0, winsHi: 0, last: [] }, 'ARG', 'ESP')).toBeNull()
  })

  it('getForm devuelve [] para un id desconocido', () => {
    expect(getForm('XXX')).toEqual([])
  })

  it('datos generados: forma de selecciones top y h2h clásico existen', () => {
    expect(getForm('ESP').length).toBeGreaterThan(0)
    expect(getForm('ESP').length).toBeLessThanOrEqual(5)
    expect(getH2H('ARG', 'BRA')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm run test -- lib/data/comparador.test.ts`
Expected: FAIL — no se resuelve `./comparador`.

- [ ] **Step 3: Implementar los accesores**

`lib/data/comparador.ts`:
```ts
import { H2H, FORM, type FormMatch, type H2HMeeting, type H2HRecord } from './comparadorData'

export interface H2HView {
  played: number
  winsA: number
  draws: number
  winsB: number
  last: H2HMeeting[]
}

/** Clave de par ordenada alfabéticamente por id. */
export function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`
}

/** Normaliza un H2HRecord (en orden lo/hi) a la perspectiva de A. null si no hay partidos. */
export function viewH2H(rec: H2HRecord | undefined, idA: string, idB: string): H2HView | null {
  if (!rec || rec.played === 0) return null
  const aIsLo = idA < idB
  return {
    played: rec.played,
    winsA: aIsLo ? rec.winsLo : rec.winsHi,
    draws: rec.draws,
    winsB: aIsLo ? rec.winsHi : rec.winsLo,
    last: rec.last,
  }
}

/** Head-to-head entre A y B desde la perspectiva de A. null si no hay datos. */
export function getH2H(idA: string, idB: string): H2HView | null {
  return viewH2H(H2H[pairKey(idA, idB)], idA, idB)
}

/** Últimos 5 partidos del equipo (más reciente primero); [] si no hay datos. */
export function getForm(teamId: string): FormMatch[] {
  return FORM[teamId] ?? []
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm run test -- lib/data/comparador.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/comparador.ts lib/data/comparador.test.ts
git commit -m "feat(comparador): accesores puros de forma y head-to-head"
```

---

## Task 3: Helper groupOf (TDD)

**Files:**
- Modify: `lib/data/groups.ts`
- Test: `lib/data/groupOf.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/data/groupOf.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { groupOf } from './groups'

describe('groupOf', () => {
  it('devuelve el grupo de un equipo', () => {
    expect(groupOf('MEX')).toBe('A')
    expect(groupOf('ESP')).toBe('H')
    expect(groupOf('ARG')).toBe('J')
  })
  it('devuelve undefined si el equipo no está en ningún grupo', () => {
    expect(groupOf('XXX')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm run test -- lib/data/groupOf.test.ts`
Expected: FAIL — `groupOf` no exportado.

- [ ] **Step 3: Implementar**

Añade al final de `lib/data/groups.ts`:
```ts
/** Devuelve el grupo (A..L) al que pertenece un equipo, o undefined. */
export function groupOf(teamId: string): GroupId | undefined {
  for (const g of GROUP_IDS) {
    if (GROUPS[g].includes(teamId)) return g
  }
  return undefined
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm run test -- lib/data/groupOf.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/groups.ts lib/data/groupOf.test.ts
git commit -m "feat(data): helper groupOf(teamId)"
```

---

## Task 4: Hook useTournamentProbs + refactor ProbabilitiesTab

**Files:**
- Create: `components/probabilities/useTournamentProbs.ts`
- Modify: `components/probabilities/ProbabilitiesTab.tsx`

- [ ] **Step 1: Crear el hook**

`components/probabilities/useTournamentProbs.ts`:
```ts
'use client'

import { useCallback, useState, useTransition } from 'react'
import { useStore } from '@/lib/store'
import { useOdds } from '@/components/odds/OddsProvider'
import { runMonteCarlo, type TeamProbs } from '@/lib/engine/montecarlo'

export interface TournamentProbs {
  probs: Record<string, TeamProbs> | null
  computing: boolean
  /** Dispara el Monte Carlo sobre el escenario actual. */
  compute: () => void
}

/**
 * Monte Carlo del torneo, compartido. No se ejecuta solo: el consumidor llama
 * a `compute()` (botón en Probabilidades, en montaje en el Comparador).
 */
export function useTournamentProbs(n: number): TournamentProbs {
  const { state } = useStore()
  const { marketFn } = useOdds()
  const [probs, setProbs] = useState<Record<string, TeamProbs> | null>(null)
  const [computing, startTransition] = useTransition()

  const compute = useCallback(() => {
    const base = state.matches
    startTransition(() => setProbs(runMonteCarlo(n, undefined, base, marketFn)))
  }, [state.matches, marketFn, n])

  return { probs, computing, compute }
}
```

- [ ] **Step 2: Refactor ProbabilitiesTab para usar el hook**

Reemplaza el contenido COMPLETO de `components/probabilities/ProbabilitiesTab.tsx`:
```tsx
'use client'

import { Radio } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import { useTournamentProbs } from './useTournamentProbs'
import Flag from '@/components/ui/Flag'

const N = 2000

/** Formats a probability (0..1) as a percentage with 1 decimal. */
function fmt(p: number): string {
  if (p > 0 && p < 0.001) return '<0.1%'
  return `${(p * 100).toFixed(1)}%`
}

interface BarProps {
  value: number
  color: string
}

function Bar({ value, color }: BarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#262626]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a8a8a]">
        {fmt(value)}
      </span>
    </div>
  )
}

/** Monte Carlo probabilities tab: estimates each team's deep-run chances. */
export default function ProbabilitiesTab() {
  const { state } = useStore()
  const { probs, computing, compute } = useTournamentProbs(N)

  const rows = probs ? Object.entries(probs).sort((a, b) => b[1].champion - a[1].champion) : []

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#f5f5f5]">Probabilidades</h2>
            {state.liveMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E61D25]/15 px-2 py-0.5 text-xs font-semibold text-[#E61D25]">
                <Radio size={12} strokeWidth={2} aria-hidden="true" /> En directo
              </span>
            )}
          </div>
          {probs && (
            <p className="mt-1 text-sm text-[#8a8a8a]">
              {N.toLocaleString('es')} simulaciones ejecutadas.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={compute}
          disabled={computing}
          className="shrink-0 rounded-full bg-[#E8B84B] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {computing ? 'Calculando…' : 'Calcular probabilidades'}
        </button>
      </div>

      {!probs ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-12 text-center text-[#8a8a8a]">
          <p className="text-sm leading-relaxed">
            Pulsa Calcular para estimar las probabilidades mediante simulación Monte Carlo sobre el
            escenario actual.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4 sm:p-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                <th className="py-1.5 pl-1 text-left font-medium">Equipo</th>
                <th className="px-3 text-left font-medium">Campeón</th>
                <th className="px-3 text-left font-medium">Final</th>
                <th className="px-3 text-left font-medium">Semis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([id, p]) => {
                const team = TEAMS[id]
                return (
                  <tr key={id} className="border-t border-white/10">
                    <td className="py-2 pl-1">
                      <div className="flex items-center gap-2">
                        <Flag teamId={id} className="text-base leading-none" />
                        <span className="truncate text-[#f5f5f5]">{team?.name ?? id}</span>
                      </div>
                    </td>
                    <td className="w-44 px-3"><Bar value={p.champion} color="bg-[#E8B84B]" /></td>
                    <td className="w-44 px-3"><Bar value={p.final} color="bg-[#3CAC3B]" /></td>
                    <td className="w-44 px-3"><Bar value={p.sf} color="bg-[#3CAC3B]" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Lint + build + test**

Run: `npm run lint && npm run build && npm run test`
Expected: sin errores; tests verdes. (Comportamiento de Probabilidades idéntico: botón → tabla.)

- [ ] **Step 4: Commit**

```bash
git add components/probabilities/useTournamentProbs.ts components/probabilities/ProbabilitiesTab.tsx
git commit -m "refactor(probabilities): extraer useTournamentProbs (reutilizable por comparador)"
```

---

## Task 5: TeamSelect (dropdown reutilizable)

**Files:**
- Create: `components/comparador/TeamSelect.tsx`

- [ ] **Step 1: Crear el componente**

`components/comparador/TeamSelect.tsx`:
```tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'

interface TeamSelectProps {
  value: string
  onChange: (id: string) => void
  /** Id que no se puede elegir aquí (el del otro lado). */
  exclude?: string
}

/** Dropdown para elegir una selección (lista de 48, ordenada por nombre). */
export default function TeamSelect({ value, onChange, exclude }: TeamSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const teams = useMemo(
    () => Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [],
  )

  const team = TEAMS[value]

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-[#f5f5f5] backdrop-blur-md transition-colors hover:bg-white/10"
      >
        <span className="text-base leading-none">{team?.flag ?? '🏳️'}</span>
        <span className="truncate">{team?.name ?? 'Elegir'}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-30 mt-2 max-h-80 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-white/10 bg-[#16161c]/90 p-1 shadow-xl backdrop-blur-xl"
        >
          {teams.map((t) => {
            const disabled = t.id === exclude
            const active = t.id === value
            return (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => {
                  onChange(t.id)
                  setOpen(false)
                }}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  disabled
                    ? 'cursor-not-allowed text-[#5a5a5a]'
                    : active
                      ? 'bg-[#E8B84B]/15 text-[#E8B84B]'
                      : 'text-[#f5f5f5] hover:bg-white/10',
                ].join(' ')}
              >
                <span className="text-base leading-none">{t.flag}</span>
                <span className="truncate">{t.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/comparador/TeamSelect.tsx
git commit -m "feat(comparador): TeamSelect — dropdown reutilizable de selecciones"
```

---

## Task 6: ComparadorTab

**Files:**
- Create: `components/comparador/ComparadorTab.tsx`

- [ ] **Step 1: Crear el componente**

`components/comparador/ComparadorTab.tsx`:
```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import { useOdds } from '@/components/odds/OddsProvider'
import { useFavorite } from '@/components/favorite/FavoriteProvider'
import { matchOutcomeProbs, mostLikelyScore } from '@/lib/engine/montecarlo'
import { getH2H, getForm } from '@/lib/data/comparador'
import { SNAPSHOT_DATE, type FormMatch } from '@/lib/data/comparadorData'
import { groupOf } from '@/lib/data/groups'
import { useTournamentProbs } from '@/components/probabilities/useTournamentProbs'
import TeamSelect from './TeamSelect'

const SECTION = 'rounded-2xl border border-white/10 bg-[#16161c]/55 p-4 backdrop-blur-xl'
const LABEL = 'mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#777]'
const pct = (p: number) => `${Math.round(p * 100)}%`

/** Por defecto: favorito (o mejor ranking) y el siguiente mejor distinto. */
function defaults(favorite: string | null): [string, string] {
  const ranked = Object.values(TEAMS).sort((a, b) => a.fifaRank - b.fifaRank)
  const a = favorite && TEAMS[favorite] ? favorite : ranked[0].id
  const b = ranked.find((t) => t.id !== a)?.id ?? ranked[1].id
  return [a, b]
}

function FormChips({ form }: { form: FormMatch[] }) {
  if (form.length === 0) return <span className="text-xs text-[#777]">Sin datos</span>
  const cls = { W: 'bg-[#3CAC3B] text-[#0a0a0a]', D: 'bg-[#52525b] text-[#f5f5f5]', L: 'bg-[#E16B6B] text-[#0a0a0a]' }
  const letter = { W: 'V', D: 'E', L: 'D' } as const
  return (
    <span className="flex gap-1">
      {form.map((m, i) => (
        <span
          key={i}
          title={`${m.gf}-${m.ga} vs ${m.oppName}`}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-extrabold ${cls[m.res]}`}
        >
          {letter[m.res]}
        </span>
      ))}
    </span>
  )
}

export default function ComparadorTab() {
  const { favorite } = useFavorite()
  const { marketFn } = useOdds()
  const [[ia, ib]] = useState(() => defaults(favorite))
  const [a, setA] = useState(ia)
  const [b, setB] = useState(ib)

  const teamA = TEAMS[a]
  const teamB = TEAMS[b]

  const outcome = useMemo(() => matchOutcomeProbs(a, b, undefined, undefined, marketFn), [a, b, marketFn])
  const score = useMemo(() => mostLikelyScore(a, b), [a, b])
  const h2h = useMemo(() => getH2H(a, b), [a, b])
  const formA = useMemo(() => getForm(a), [a])
  const formB = useMemo(() => getForm(b), [b])
  const groupA = groupOf(a)
  const groupB = groupOf(b)

  // % campeón (Monte Carlo del escenario), calculado al entrar y al cambiar escenario.
  const { probs, computing, compute } = useTournamentProbs(1500)
  useEffect(() => {
    compute()
  }, [compute])

  const champA = probs?.[a]?.champion
  const champB = probs?.[b]?.champion

  const swap = () => {
    setA(b)
    setB(a)
  }

  // Fila de stat con la mejor en dorado. lowerBetter para ranking.
  const statRow = (label: string, va: number | string, vb: number | string, winner: 'a' | 'b' | null) => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/[0.06] py-2 last:border-0">
      <span className={`text-right text-sm font-bold ${winner === 'a' ? 'text-[#E8B84B]' : 'text-[#cfcfcf]'}`}>{va}</span>
      <span className="text-center text-[9px] uppercase tracking-wide text-[#777]">{label}</span>
      <span className={`text-left text-sm font-bold ${winner === 'b' ? 'text-[#E8B84B]' : 'text-[#cfcfcf]'}`}>{vb}</span>
    </div>
  )

  const rankWinner = teamA.fifaRank === teamB.fifaRank ? null : teamA.fifaRank < teamB.fifaRank ? 'a' : 'b'
  const eloWinner = teamA.fifaPoints === teamB.fifaPoints ? null : teamA.fifaPoints > teamB.fifaPoints ? 'a' : 'b'

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      {/* selectores */}
      <div className="flex items-center gap-2">
        <TeamSelect value={a} onChange={setA} exclude={b} />
        <button
          type="button"
          onClick={swap}
          aria-label="Intercambiar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8B84B] transition-colors hover:bg-white/10"
        >
          <ArrowLeftRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <TeamSelect value={b} onChange={setB} exclude={a} />
      </div>

      {/* versus hero */}
      <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{teamA.flag}</span>
          <span className="text-xs font-bold text-[#f5f5f5]">{teamA.name}</span>
        </div>
        <span className="text-lg font-extrabold text-[#E8B84B]">VS</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{teamB.flag}</span>
          <span className="text-xs font-bold text-[#f5f5f5]">{teamB.name}</span>
        </div>
      </div>

      {/* 1X2 Elo */}
      <div className={SECTION}>
        <div className={LABEL}>Si se enfrentaran (modelo Elo)</div>
        <div className="flex h-7 overflow-hidden rounded-lg text-[10px] font-bold">
          <div className="flex items-center justify-center bg-[#7aa2ff] text-[#0a0a0a]" style={{ width: `${outcome.home * 100}%` }}>{pct(outcome.home)}</div>
          <div className="flex items-center justify-center bg-[#52525b] text-[#f5f5f5]" style={{ width: `${outcome.draw * 100}%` }}>X {pct(outcome.draw)}</div>
          <div className="flex items-center justify-center bg-[#E8B84B] text-[#0a0a0a]" style={{ width: `${outcome.away * 100}%` }}>{pct(outcome.away)}</div>
        </div>
      </div>

      {/* stats */}
      <div className={SECTION}>
        {statRow('Ranking FIFA', teamA.fifaRank, teamB.fifaRank, rankWinner)}
        {statRow('Puntos Elo', teamA.fifaPoints, teamB.fifaPoints, eloWinner)}
        {statRow('Confederación', teamA.confederation, teamB.confederation, null)}
        {statRow('Grupo', groupA ? `Grupo ${groupA}` : '—', groupB ? `Grupo ${groupB}` : '—', null)}
      </div>

      {/* forma */}
      <div className={SECTION}>
        <div className={LABEL}>Forma reciente (últimos 5)</div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
          <FormChips form={formA} />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
          <FormChips form={formB} />
        </div>
      </div>

      {/* h2h */}
      <div className={SECTION}>
        <div className={LABEL}>Cara a cara (histórico)</div>
        {h2h ? (
          <>
            <div className="mb-2 flex items-center justify-around text-center">
              <div><div className="text-xl font-extrabold text-[#E8B84B]">{h2h.winsA}</div><div className="text-[9px] uppercase text-[#777]">{teamA.flag} gana</div></div>
              <div><div className="text-xl font-extrabold text-[#8a8a8a]">{h2h.draws}</div><div className="text-[9px] uppercase text-[#777]">empates</div></div>
              <div><div className="text-xl font-extrabold text-[#f5f5f5]">{h2h.winsB}</div><div className="text-[9px] uppercase text-[#777]">{teamB.flag} gana</div></div>
            </div>
            <div className="text-[11px] leading-relaxed text-[#bdbdbd]">
              {h2h.played} partidos
              {h2h.last.map((m, i) => (
                <span key={i}> · {m.date.slice(0, 4)}: {TEAMS[m.loId]?.name ?? m.loId} {m.loGoals}–{m.hiGoals} {TEAMS[m.hiId]?.name ?? m.hiId}</span>
              ))}
            </div>
          </>
        ) : (
          <span className="text-xs text-[#777]">Sin enfrentamientos registrados</span>
        )}
      </div>

      {/* marcador más probable */}
      <div className="rounded-2xl border border-[#E8B84B]/25 bg-[#E8B84B]/[0.08] p-4">
        <div className={LABEL}>Marcador más probable (Elo)</div>
        <div className="flex items-center justify-center gap-3 text-sm text-[#f5f5f5]">
          <span>{teamA.flag}</span>
          <span className="rounded-lg bg-white/[0.06] px-3 py-0.5 text-2xl font-extrabold text-white">{score.homeGoals}</span>
          <span>–</span>
          <span className="rounded-lg bg-white/[0.06] px-3 py-0.5 text-2xl font-extrabold text-white">{score.awayGoals}</span>
          <span>{teamB.flag}</span>
        </div>
      </div>

      {/* % campeón */}
      <div className={SECTION}>
        <div className={LABEL}>🏆 Probabilidad de ser campeón</div>
        {computing && !probs ? (
          <span className="text-xs text-[#777]">Calculando…</span>
        ) : (
          <>
            <div className="flex items-center justify-between py-1 text-xs font-semibold">
              <span className="text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
              <span className="text-[#E8B84B]">{champA != null ? pct(champA) : '—'}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-xs font-semibold">
              <span className="text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
              <span className="text-[#f5f5f5]">{champB != null ? pct(champB) : '—'}</span>
            </div>
          </>
        )}
      </div>

      <p className="px-1 pb-2 text-center text-[10px] text-[#5a5a5a]">Forma y cara a cara: datos hasta {SNAPSHOT_DATE}.</p>
    </div>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/comparador/ComparadorTab.tsx
git commit -m "feat(comparador): ComparadorTab (versus, stats, forma, h2h, Elo, campeón)"
```

---

## Task 7: Integración como pestaña (TDD tabs) + wiring

**Files:**
- Modify: `lib/nav/tabs.ts`
- Modify: `lib/nav/tabs.test.ts`
- Modify: `components/nav/tabIcons.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Actualizar el test de tabs (debe fallar)**

En `lib/nav/tabs.test.ts`, reemplaza el cuerpo del `describe('navigation model', ...)` por:
```ts
  it('define las 9 pestañas en el orden de page.tsx', () => {
    expect(ALL_TABS.map((t) => t.key)).toEqual([
      'grupos', 'terceros', 'eliminatorias', 'probabilidades',
      'porra', 'directo', 'cuotas', 'noticias', 'comparador',
    ])
  })

  it('bottom bar por defecto = Grupos, Eliminatorias, Probabilidades, Porra', () => {
    expect(primaryIndices(false)).toEqual([0, 2, 3, 4])
  })

  it('promociona Directo sobre Porra en modo en vivo', () => {
    expect(primaryIndices(true)).toContain(5)
    expect(primaryIndices(true)).not.toContain(4)
    expect(secondaryIndices(true)).toContain(4)
    expect(secondaryIndices(true)).not.toContain(5)
  })

  it('Comparador (8) es secundario en ambos modos', () => {
    expect(secondaryIndices(false)).toContain(8)
    expect(secondaryIndices(true)).toContain(8)
    expect(primaryIndices(false)).not.toContain(8)
  })

  it('primarios + secundarios cubren las 9 pestañas sin solape (ambos modos)', () => {
    for (const live of [false, true]) {
      const all = [...primaryIndices(live), ...secondaryIndices(live)].sort((a, b) => a - b)
      expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    }
  })

  it('el bottom bar siempre tiene 4 destinos primarios', () => {
    expect(primaryIndices(false)).toHaveLength(4)
    expect(primaryIndices(true)).toHaveLength(4)
  })
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm run test -- lib/nav/tabs.test.ts`
Expected: FAIL (faltan 'comparador' e índice 8).

- [ ] **Step 3: Actualizar el modelo**

En `lib/nav/tabs.ts`:

(a) Añade `'comparador'` al final del union `TabKey`:
```ts
  | 'noticias'
  | 'comparador'
```

(b) Añade la entrada al final de `ALL_TABS`:
```ts
  { key: 'noticias', label: 'Noticias', full: 'Noticias' },
  { key: 'comparador', label: 'Comparador', full: 'Comparador de selecciones' },
]
```

(c) Añade la constante de índice y mete `COMPARADOR` en los secundarios:
```ts
const NOTICIAS = 7
const COMPARADOR = 8
```
```ts
export function secondaryIndices(liveMode: boolean): number[] {
  return liveMode
    ? [TERCEROS, PORRA, CUOTAS, NOTICIAS, COMPARADOR]
    : [TERCEROS, DIRECTO, CUOTAS, NOTICIAS, COMPARADOR]
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm run test -- lib/nav/tabs.test.ts`
Expected: PASS.

- [ ] **Step 5: Añadir el icono**

En `components/nav/tabIcons.tsx`: añade `Scale` al import de lucide-react y la entrada al mapa:
```tsx
import {
  LayoutGrid,
  Medal,
  Swords,
  Percent,
  Ticket,
  Radio,
  TrendingUp,
  Newspaper,
  Scale,
  type LucideIcon,
} from 'lucide-react'
```
```tsx
  noticias: Newspaper,
  comparador: Scale,
}
```

- [ ] **Step 6: Renderizar la pestaña en page.tsx**

En `app/page.tsx`:

(a) Importa el componente junto a los demás tabs:
```tsx
import ComparadorTab from '@/components/comparador/ComparadorTab'
```

(b) Añade el caso en el switch, después de Noticias:
```tsx
        {active === 7 && <NoticiasTab />}
        {active === 8 && <ComparadorTab />}
```

- [ ] **Step 7: Lint + build + test completo**

Run: `npm run lint && npm run build && npm run test`
Expected: lint limpio, build OK, todos los tests verdes.

- [ ] **Step 8: Checklist manual (`npm run dev`, móvil)**

- [ ] En móvil, "Más" muestra ahora **Comparador** (con icono balanza). Al abrirlo se ve el comparador.
- [ ] Por defecto compara dos selecciones (favorito si lo hay + otra). Cambiar A o B con los selectores actualiza todo; el ya elegido aparece deshabilitado en el otro selector.
- [ ] El botón ⇄ intercambia A y B.
- [ ] Se ven: versus, barra 1X2, stats (mejor en dorado), forma (chips V/E/D), cara a cara (V/E/D + últimos cruces), marcador más probable, % campeón ("Calculando…" un instante y luego los %).
- [ ] Un par sin h2h muestra "Sin enfrentamientos registrados"; una selección sin forma muestra "Sin datos".
- [ ] Pie "Datos hasta {fecha}".
- [ ] Desktop (≥640px): se ve centrado/ensanchado sin romperse; Probabilidades sigue funcionando igual que antes (botón → tabla).

- [ ] **Step 9: Commit**

```bash
git add lib/nav/tabs.ts lib/nav/tabs.test.ts components/nav/tabIcons.tsx app/page.tsx
git commit -m "feat(comparador): integrar pestaña Comparador (8, en Más)"
```
