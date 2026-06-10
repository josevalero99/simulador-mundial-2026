# Banderas circulares (SVG) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir las banderas emoji por banderas SVG circulares (circle-flags) empaquetadas en `public/flags/`, servidas vía un componente `Flag` que escala con el texto, en toda la app.

**Architecture:** Un script de build descarga las 48 banderas de circle-flags a `public/flags/<iso>.svg` (offline-cacheables). Un mapa puro `isoOf(teamId)` traduce ids a códigos ISO. `Flag.tsx` renderiza un `<img>` de tamaño `1em` (con fallback al emoji). Los pocos sitios que pintaban el emoji directo se convierten a `<Flag>`.

**Tech Stack:** Next.js 14, React 18, TS, Tailwind, vitest (node env, `lib/**/*.test.ts`), scripts `.mjs`.

> **Nota testing:** solo lógica pura en `lib/` va por TDD (Tareas 1 y 2). Componentes con `npm run lint` + `npm run build` + checklist manual.
>
> **Excepción conocida:** `components/porra/PorraEditor.tsx` pinta la bandera dentro de un `<option>` de un `<select>` nativo, que **solo admite texto** — ahí NO se puede usar `<img>`, así que se mantiene el emoji. Es el único sitio que sigue con emoji a propósito.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `lib/data/flags.ts` (nuevo) | `isoOf(teamId)` — mapa puro id→ISO. |
| `lib/data/flags.test.ts` (nuevo) | Tests de `isoOf`. |
| `scripts/buildFlags.mjs` (nuevo) | Descarga las 48 SVG a `public/flags/`. |
| `public/flags/*.svg` (generados, committeados) | Assets servidos. |
| `lib/data/flags-assets.test.ts` (nuevo) | Sanidad: cada id tiene su SVG en disco. |
| `components/ui/Flag.tsx` (modificar) | Render `<img>` circular 1em + fallback emoji. |
| `components/favorite/FavoritePicker.tsx` (modificar) | 1 emoji directo → `<Flag>`. |
| `components/comparador/TeamSelect.tsx` (modificar) | 2 emoji directos → `<Flag>`. |
| `components/comparador/ComparadorTab.tsx` (modificar) | ~10 emoji directos → `<Flag>`. |

---

## Task 1: Mapa isoOf (TDD)

**Files:**
- Create: `lib/data/flags.ts`
- Test: `lib/data/flags.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/data/flags.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isoOf } from './flags'
import { GROUPS, GROUP_IDS } from './groups'

describe('isoOf', () => {
  it('mapea casos concretos (incl. Inglaterra/Escocia)', () => {
    expect(isoOf('ESP')).toBe('es')
    expect(isoOf('BRA')).toBe('br')
    expect(isoOf('ENG')).toBe('gb-eng')
    expect(isoOf('SCO')).toBe('gb-sct')
  })
  it('devuelve undefined para un id desconocido', () => {
    expect(isoOf('XXX')).toBeUndefined()
  })
  it('las 48 selecciones de GROUPS tienen ISO', () => {
    for (const g of GROUP_IDS) {
      for (const id of GROUPS[g]) {
        expect(isoOf(id), id).toBeTruthy()
      }
    }
  })
})
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm run test -- lib/data/flags.test.ts`
Expected: FAIL — no se resuelve `./flags`.

- [ ] **Step 3: Implementar**

`lib/data/flags.ts`:
```ts
/** id de equipo -> código de circle-flags (ISO alpha-2, con casos especiales gb-*). */
const ISO: Record<string, string> = {
  MEX: 'mx', KOR: 'kr', RSA: 'za', CZE: 'cz',
  CAN: 'ca', SUI: 'ch', QAT: 'qa', BIH: 'ba',
  BRA: 'br', MAR: 'ma', SCO: 'gb-sct', HAI: 'ht',
  USA: 'us', AUS: 'au', PAR: 'py', TUR: 'tr',
  GER: 'de', ECU: 'ec', CIV: 'ci', CUW: 'cw',
  NED: 'nl', JPN: 'jp', TUN: 'tn', SWE: 'se',
  BEL: 'be', IRN: 'ir', EGY: 'eg', NZL: 'nz',
  ESP: 'es', URU: 'uy', KSA: 'sa', CPV: 'cv',
  FRA: 'fr', SEN: 'sn', NOR: 'no', IRQ: 'iq',
  ARG: 'ar', AUT: 'at', ALG: 'dz', JOR: 'jo',
  POR: 'pt', COL: 'co', UZB: 'uz', COD: 'cd',
  ENG: 'gb-eng', CRO: 'hr', PAN: 'pa', GHA: 'gh',
}

/** Código de bandera (circle-flags) para un teamId; undefined si no se conoce. */
export function isoOf(teamId: string): string | undefined {
  return ISO[teamId]
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm run test -- lib/data/flags.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/flags.ts lib/data/flags.test.ts
git commit -m "feat(flags): mapa puro isoOf (id -> ISO circle-flags)"
```

---

## Task 2: Descargar las banderas + sanidad

**Files:**
- Create: `scripts/buildFlags.mjs`
- Generate + commit: `public/flags/*.svg`
- Test: `lib/data/flags-assets.test.ts`

- [ ] **Step 1: Crear el script**

`scripts/buildFlags.mjs`:
```js
// Descarga las 48 banderas circulares (circle-flags) a public/flags/<iso>.svg.
// Ejecutar: node scripts/buildFlags.mjs   (requiere red)
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = 'https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags'
const ISOS = [
  'mx', 'kr', 'za', 'cz', 'ca', 'ch', 'qa', 'ba',
  'br', 'ma', 'gb-sct', 'ht', 'us', 'au', 'py', 'tr',
  'de', 'ec', 'ci', 'cw', 'nl', 'jp', 'tn', 'se',
  'be', 'ir', 'eg', 'nz', 'es', 'uy', 'sa', 'cv',
  'fr', 'sn', 'no', 'iq', 'ar', 'at', 'dz', 'jo',
  'pt', 'co', 'uz', 'cd', 'gb-eng', 'hr', 'pa', 'gh',
]

mkdirSync(new URL('../public/flags/', import.meta.url), { recursive: true })

let ok = 0
for (const iso of ISOS) {
  const res = await fetch(`${BASE}/${iso}.svg`)
  if (!res.ok) {
    console.error(`FALLO ${iso}: HTTP ${res.status}`)
    process.exit(1)
  }
  const svg = await res.text()
  if (!svg.includes('<svg')) {
    console.error(`FALLO ${iso}: la respuesta no parece SVG`)
    process.exit(1)
  }
  writeFileSync(new URL(`../public/flags/${iso}.svg`, import.meta.url), svg)
  ok++
}
console.log(`OK — ${ok} banderas en public/flags/`)
```

- [ ] **Step 2: Generar las banderas**

Run: `node scripts/buildFlags.mjs`
Expected: imprime `OK — 48 banderas en public/flags/` y crea 48 archivos `.svg`. Si alguna falla (HTTP/no-SVG), el script aborta — revisa el código ISO contra circle-flags y corrige `ISOS`.

- [ ] **Step 3: Escribir el test de sanidad de assets**

`lib/data/flags-assets.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { isoOf } from './flags'
import { GROUPS, GROUP_IDS } from './groups'

describe('flags assets', () => {
  it('cada selección de GROUPS tiene su SVG en public/flags', () => {
    for (const g of GROUP_IDS) {
      for (const id of GROUPS[g]) {
        const iso = isoOf(id)
        expect(iso, `isoOf(${id})`).toBeTruthy()
        const url = new URL(`../../public/flags/${iso}.svg`, import.meta.url)
        const svg = readFileSync(url, 'utf8')
        expect(svg, `${iso}.svg`).toContain('<svg')
      }
    }
  })
})
```

- [ ] **Step 4: Ejecutar el test (pasa con los archivos ya generados)**

Run: `npm run test -- lib/data/flags-assets.test.ts`
Expected: PASS (1 test). Si falla por archivo ausente, re-ejecuta el script del Step 2.

- [ ] **Step 5: Commit**

```bash
git add scripts/buildFlags.mjs public/flags lib/data/flags-assets.test.ts
git commit -m "feat(flags): descargar 48 banderas circulares (circle-flags) + sanidad"
```

---

## Task 3: Reescribir el componente Flag

**Files:**
- Modify (full replace): `components/ui/Flag.tsx`

- [ ] **Step 1: Reemplazar `components/ui/Flag.tsx` ENTERO con:**
```tsx
import { TEAMS } from '@/lib/data/teams'
import { isoOf } from '@/lib/data/flags'

interface FlagProps {
  teamId: string
  className?: string
}

/**
 * Bandera circular (SVG de circle-flags servido desde /flags). Tamaño = 1em,
 * así escala con el font-size del contexto igual que hacía el emoji. Si no hay
 * código ISO conocido, cae al emoji del equipo (último recurso: 🏳️).
 */
export default function Flag({ teamId, className }: FlagProps) {
  const team = TEAMS[teamId]
  const label = team?.name ?? teamId
  const iso = isoOf(teamId)

  if (!iso) {
    return (
      <span role="img" aria-label={label} className={className}>
        {team?.flag ?? '🏳️'}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${iso}.svg`}
      alt={label}
      className={`inline-block h-[1em] w-[1em] shrink-0 rounded-full align-[-0.125em] ${className ?? ''}`}
    />
  )
}
```

- [ ] **Step 2: Lint + build + test**

Run: `npm run lint && npm run build && npm run test`
Expected: lint limpio, build OK, tests verdes. (Esto ya cambia los 19 usos de `<Flag>` en toda la app a banderas circulares.)

- [ ] **Step 3: Commit**

```bash
git add components/ui/Flag.tsx
git commit -m "feat(flags): Flag renderiza SVG circular (1em) con fallback a emoji"
```

---

## Task 4: Convertir los emoji directos a `<Flag>`

**Files:**
- Modify: `components/favorite/FavoritePicker.tsx`
- Modify: `components/comparador/TeamSelect.tsx`
- Modify: `components/comparador/ComparadorTab.tsx`

(NO se toca `components/porra/PorraEditor.tsx`: su bandera vive en un `<option>` nativo que solo admite texto → se queda en emoji.)

- [ ] **Step 1: FavoritePicker — item de lista**

En `components/favorite/FavoritePicker.tsx` (ya importa `Flag`), reemplaza:
```tsx
                <span className="text-base leading-none">{t.flag}</span>
```
por:
```tsx
                <Flag teamId={t.id} className="text-base leading-none" />
```

- [ ] **Step 2: TeamSelect — botón e items**

En `components/comparador/TeamSelect.tsx`:

(a) Añade el import (junto a los otros):
```tsx
import Flag from '@/components/ui/Flag'
```
(b) Reemplaza la del botón:
```tsx
        <span className="text-base leading-none">{team?.flag ?? '🏳️'}</span>
```
por:
```tsx
        <Flag teamId={value} className="text-base leading-none" />
```
(c) Reemplaza la del item de lista:
```tsx
                <span className="text-base leading-none">{t.flag}</span>
```
por:
```tsx
                <Flag teamId={t.id} className="text-base leading-none" />
```

- [ ] **Step 3: ComparadorTab — todos los emoji directos**

En `components/comparador/ComparadorTab.tsx`:

(a) Añade el import (junto a los otros):
```tsx
import Flag from '@/components/ui/Flag'
```
(b) Hero — reemplaza:
```tsx
          <span className="text-4xl leading-none">{teamA.flag}</span>
```
por `<Flag teamId={a} className="text-4xl leading-none" />`, y la de teamB:
```tsx
          <span className="text-4xl leading-none">{teamB.flag}</span>
```
por `<Flag teamId={b} className="text-4xl leading-none" />`.

(c) Forma — reemplaza:
```tsx
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
```
por:
```tsx
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]"><Flag teamId={a} /> {teamA.name}</span>
```
y la de teamB:
```tsx
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
```
por:
```tsx
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]"><Flag teamId={b} /> {teamB.name}</span>
```

(d) H2H — reemplaza `{teamA.flag} gana` y `{teamB.flag} gana`:
```tsx
              <div><div className="text-xl font-extrabold text-[#E8B84B]">{h2h.winsA}</div><div className="text-[9px] uppercase text-[#777]">{teamA.flag} gana</div></div>
```
→ `...text-[#777]"><Flag teamId={a} /> gana</div></div>` ; y
```tsx
              <div><div className="text-xl font-extrabold text-[#f5f5f5]">{h2h.winsB}</div><div className="text-[9px] uppercase text-[#777]">{teamB.flag} gana</div></div>
```
→ `...text-[#777]"><Flag teamId={b} /> gana</div></div>`.

(e) Marcador — reemplaza:
```tsx
          <span>{teamA.flag}</span>
```
por `<Flag teamId={a} className="text-xl" />` ; y
```tsx
          <span>{teamB.flag}</span>
```
por `<Flag teamId={b} className="text-xl" />`.
(En el marcador damos `text-xl` para que la bandera no quede minúscula junto a los números grandes.)

(f) % campeón — reemplaza:
```tsx
              <span className="text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
```
por:
```tsx
              <span className="text-[#f5f5f5]"><Flag teamId={a} /> {teamA.name}</span>
```
y la de teamB:
```tsx
              <span className="text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
```
por:
```tsx
              <span className="text-[#f5f5f5]"><Flag teamId={b} /> {teamB.name}</span>
```

- [ ] **Step 4: Lint + build + test**

Run: `npm run lint && npm run build && npm run test`
Expected: lint limpio (sin `{x.flag}` directos restantes salvo PorraEditor), build OK, tests verdes.

- [ ] **Step 5: Checklist manual (`npm run dev`, móvil)**

- [ ] Banderas **circulares** en: standings (Grupos), fixtures, terceros, bracket, probabilidades, cuotas, porra (resultados), comparador (hero/forma/h2h/marcador/campeón), picker "Mi selección", banner próximo partido, TeamSelect.
- [ ] Tamaño coherente con el texto en cada sitio (si en algún sitio se ven pequeñas, se puede subir el `1em` del `Flag` a `1.1em`).
- [ ] El selector de porra (`PorraEditor`, `<select>`) sigue mostrando emoji (esperado).
- [ ] **Offline**: tras cargar una vez, en modo avión las banderas siguen apareciendo. Si no, añadir runtime-cache de `/flags/` en el service worker.
- [ ] Inglaterra y Escocia muestran sus banderas (gb-eng / gb-sct), no la del Reino Unido.

- [ ] **Step 6: Commit**

```bash
git add components/favorite/FavoritePicker.tsx components/comparador/TeamSelect.tsx components/comparador/ComparadorTab.tsx
git commit -m "feat(flags): usar Flag (circular) en los sitios con emoji directo"
```
