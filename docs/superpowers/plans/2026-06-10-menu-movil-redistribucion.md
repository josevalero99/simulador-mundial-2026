# Redistribución del menú móvil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir las 3 filas de chrome del móvil por un bottom tab bar nativo + hojas inferiores (navegación "Más" y acciones), dejando el desktop intacto.

**Architecture:** Un modelo de navegación puro en `lib/nav/tabs.ts` define qué pestañas son primarias (bottom bar) vs secundarias ("Más"), con promoción de "Directo" en modo en vivo. `TabNav` (desktop) y el nuevo `BottomTabBar` (móvil) consumen ese modelo y comparten el mismo estado `active`. Un `BottomSheet` reutilizable sirve tanto al menú "Más" como a la hoja de acciones (`MobileActionBar`). La lógica de guardar/compartir se extrae a un hook (`useSaveShare`) para no duplicarla entre desktop y móvil. La acción "Exportar imagen" (dependiente de la pestaña activa) se publica a la hoja vía un contexto ligero (`MobileActionsContext`). El reparto móvil/desktop es puramente CSS (`sm:hidden` / `hidden sm:flex`) — sin `useMediaQuery`, sin parpadeo de hidratación.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind 3, lucide-react, vitest (entorno node, solo `lib/**/*.test.ts`).

> **Nota de testing:** El repo solo tiene tests de lógica pura en `lib/` (entorno node, sin DOM/testing-library). Por eso **solo la Tarea 1 es TDD**. Las tareas de componentes (2–8) se verifican con `npm run lint` + `npm run build` y el checklist manual de la Tarea 9. No se añade infraestructura de testing de componentes (YAGNI, fuera de alcance del spec).

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `lib/nav/tabs.ts` (nuevo) | Modelo puro: `ALL_TABS` (orden canónico = índices de `page.tsx`), `primaryIndices(liveMode)`, `secondaryIndices(liveMode)`. |
| `lib/nav/tabs.test.ts` (nuevo) | Tests del modelo. |
| `components/nav/tabIcons.tsx` (nuevo) | Mapa `TabKey → LucideIcon` (capa de presentación; fuera del modelo puro). |
| `components/ui/BottomSheet.tsx` (nuevo) | Primitivo: scrim + panel inferior, cierre por scrim/ESC, foco atrapado, solo móvil. |
| `components/actions/useSaveShare.ts` (nuevo) | Hook con la lógica de guardar/compartir (extraída de `SaveShareMenu`). |
| `components/actions/scenarioActions.tsx` (nuevo) | Definición compartida de Simular/Rellenar/Limpiar. |
| `components/actions/MobileActionsContext.tsx` (nuevo) | Contexto para que la pestaña activa registre su acción de exportar. |
| `components/nav/BottomTabBar.tsx` (nuevo) | Barra inferior móvil (4 primarios + "Más"). |
| `components/nav/MobileActionBar.tsx` (nuevo) | Botón `⋯` en cabecera + hoja de acciones (móvil). |
| `components/TabNav.tsx` (modificar) | Consumir `ALL_TABS`/`tabIcons`; pasar a desktop-only (`hidden sm:flex`). |
| `components/SaveShareMenu.tsx` (modificar) | Usar `useSaveShare` (presentación desktop intacta). |
| `components/ActionsMenu.tsx` (modificar) | Usar `SCENARIO_ACTIONS`. |
| `components/group-stage/GroupStageTab.tsx` (modificar) | Acciones desktop-only; registrar export en contexto; toggle inline. |
| `app/page.tsx` (modificar) | Montar provider + `BottomTabBar` + `MobileActionBar`; padding inferior móvil. |

---

## Task 1: Modelo de navegación (TDD)

**Files:**
- Create: `lib/nav/tabs.ts`
- Test: `lib/nav/tabs.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/nav/tabs.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { ALL_TABS, primaryIndices, secondaryIndices } from './tabs'

describe('navigation model', () => {
  it('define las 8 pestañas en el orden de page.tsx', () => {
    expect(ALL_TABS.map((t) => t.key)).toEqual([
      'grupos', 'terceros', 'eliminatorias', 'probabilidades',
      'porra', 'directo', 'cuotas', 'noticias',
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

  it('primarios + secundarios cubren las 8 pestañas sin solape (ambos modos)', () => {
    for (const live of [false, true]) {
      const all = [...primaryIndices(live), ...secondaryIndices(live)].sort((a, b) => a - b)
      expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    }
  })

  it('el bottom bar siempre tiene 4 destinos primarios', () => {
    expect(primaryIndices(false)).toHaveLength(4)
    expect(primaryIndices(true)).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `npm run test -- lib/nav/tabs.test.ts`
Expected: FAIL — no se puede resolver `./tabs`.

- [ ] **Step 3: Implementar el modelo**

`lib/nav/tabs.ts`:
```ts
export type TabKey =
  | 'grupos'
  | 'terceros'
  | 'eliminatorias'
  | 'probabilidades'
  | 'porra'
  | 'directo'
  | 'cuotas'
  | 'noticias'

export interface TabDef {
  key: TabKey
  /** Etiqueta corta para el bottom bar y las pills. */
  label: string
  /** Nombre completo para aria-label / title. */
  full: string
  /** Color fijo del icono (p. ej. "En directo" siempre rojo). */
  iconColor?: string
}

/**
 * Orden canónico: el índice de cada pestaña DEBE coincidir con el `switch`
 * de `app/page.tsx` (0 = Grupos … 7 = Noticias). Tanto TabNav (desktop) como
 * BottomTabBar (móvil) usan estos índices contra el mismo estado `active`.
 */
export const ALL_TABS: TabDef[] = [
  { key: 'grupos', label: 'Grupos', full: 'Fase de grupos' },
  { key: 'terceros', label: 'Terceros', full: 'Mejores terceros' },
  { key: 'eliminatorias', label: 'Eliminatorias', full: 'Eliminatorias' },
  { key: 'probabilidades', label: 'Probabilidades', full: 'Probabilidades' },
  { key: 'porra', label: 'Porra', full: 'Porra' },
  { key: 'directo', label: 'Directo', full: 'En directo', iconColor: '#E61D25' },
  { key: 'cuotas', label: 'Cuotas', full: 'Cuotas' },
  { key: 'noticias', label: 'Noticias', full: 'Noticias' },
]

const GRUPOS = 0
const TERCEROS = 1
const ELIMINATORIAS = 2
const PROBABILIDADES = 3
const PORRA = 4
const DIRECTO = 5
const CUOTAS = 6
const NOTICIAS = 7

/**
 * Los 4 destinos primarios del bottom bar (la UI añade un 5.º slot "Más").
 * En modo en vivo, "Directo" ocupa el slot de "Porra".
 */
export function primaryIndices(liveMode: boolean): number[] {
  return liveMode
    ? [GRUPOS, ELIMINATORIAS, PROBABILIDADES, DIRECTO]
    : [GRUPOS, ELIMINATORIAS, PROBABILIDADES, PORRA]
}

/** Destinos detrás de la hoja "Más", en orden de aparición. */
export function secondaryIndices(liveMode: boolean): number[] {
  return liveMode
    ? [TERCEROS, PORRA, CUOTAS, NOTICIAS]
    : [TERCEROS, DIRECTO, CUOTAS, NOTICIAS]
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `npm run test -- lib/nav/tabs.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/nav/tabs.ts lib/nav/tabs.test.ts
git commit -m "feat(nav): modelo de navegación primarios/secundarios + promoción de Directo"
```

---

## Task 2: Mapa de iconos + TabNav desktop-only

**Files:**
- Create: `components/nav/tabIcons.tsx`
- Modify: `components/TabNav.tsx`

- [ ] **Step 1: Crear el mapa de iconos**

`components/nav/tabIcons.tsx`:
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
  type LucideIcon,
} from 'lucide-react'
import type { TabKey } from '@/lib/nav/tabs'

/** Icono de cada pestaña. Vive en la capa de presentación, fuera del modelo puro. */
export const TAB_ICONS: Record<TabKey, LucideIcon> = {
  grupos: LayoutGrid,
  terceros: Medal,
  eliminatorias: Swords,
  probabilidades: Percent,
  porra: Ticket,
  directo: Radio,
  cuotas: TrendingUp,
  noticias: Newspaper,
}
```

- [ ] **Step 2: Reescribir TabNav para consumir el modelo y ocultarlo en móvil**

Reemplaza el contenido completo de `components/TabNav.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import { ALL_TABS } from '@/lib/nav/tabs'
import { TAB_ICONS } from '@/components/nav/tabIcons'

interface TabNavProps {
  active: number
  onChange: (i: number) => void
}

/**
 * Navegación de pestañas en DESKTOP (oculta en móvil, donde manda el
 * BottomTabBar). Fila horizontal de pills con scroll-snap; la pestaña activa
 * se auto-centra. Controlada por `active` / `onChange`.
 */
export default function TabNav({ active, onChange }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    tabRefs.current[active]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <div
      role="tablist"
      aria-label="Secciones del simulador"
      className="no-scrollbar hidden flex-nowrap gap-2 overflow-x-auto sm:flex"
      style={{ scrollSnapType: 'x proximity' }}
    >
      {ALL_TABS.map((tab, i) => {
        const isActive = i === active
        const Icon = TAB_ICONS[tab.key]
        const computedIconColor = tab.iconColor ?? (isActive ? '#0a0a0a' : undefined)
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[i] = node
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.full}
            title={tab.full}
            onClick={() => onChange(i)}
            style={{ scrollSnapAlign: 'start' }}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-[#E8B84B] bg-[#E8B84B] text-[#0a0a0a]'
                : 'border-white/10 bg-white/5 text-[#f5f5f5] backdrop-blur-md hover:border-white/20 hover:bg-white/10',
            ].join(' ')}
          >
            <Icon
              size={16}
              strokeWidth={2}
              color={computedIconColor}
              className={tab.iconColor ? '' : isActive ? '' : 'text-[#8a8a8a]'}
              aria-hidden="true"
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add components/nav/tabIcons.tsx components/TabNav.tsx
git commit -m "refactor(nav): TabNav consume el modelo compartido y queda desktop-only"
```

---

## Task 3: Primitivo BottomSheet

**Files:**
- Create: `components/ui/BottomSheet.tsx`

- [ ] **Step 1: Crear el componente**

`components/ui/BottomSheet.tsx`:
```tsx
'use client'

import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

/**
 * Hoja inferior reutilizable (solo móvil). Scrim que cierra al pulsar, cierre
 * con ESC, bloqueo de scroll del body y foco devuelto al disparador al cerrar.
 * Sin gestos de arrastre (YAGNI).
 */
export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-[#16161c]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none backdrop-blur-xl"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
        {title && (
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/ui/BottomSheet.tsx
git commit -m "feat(ui): primitivo BottomSheet reutilizable (móvil)"
```

---

## Task 4: Extraer lógica de acciones (DRY)

**Files:**
- Create: `components/actions/useSaveShare.ts`
- Create: `components/actions/scenarioActions.tsx`
- Modify: `components/SaveShareMenu.tsx`
- Modify: `components/ActionsMenu.tsx`

- [ ] **Step 1: Crear el hook `useSaveShare`**

`components/actions/useSaveShare.ts`:
```ts
'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { encodeScenario, decodeScenario } from '@/lib/share'

const SAVES_KEY = 'wc2026-saves'
const MAX_SAVES = 20

export interface SavedPrediction {
  name: string
  e: string
  savedAt: string
}

export function readSaves(): SavedPrediction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SAVES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (x): x is SavedPrediction =>
        x &&
        typeof x.name === 'string' &&
        typeof x.e === 'string' &&
        typeof x.savedAt === 'string',
    )
  } catch {
    return []
  }
}

export function writeSaves(saves: SavedPrediction[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SAVES_KEY, JSON.stringify(saves))
  } catch {
    // ignore quota errors
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export interface SaveShare {
  copied: boolean
  saves: SavedPrediction[]
  refresh: () => void
  handleShare: () => Promise<void>
  handleSave: () => void
  handleLoad: (e: string) => void
  handleDelete: (savedAt: string) => void
}

/** Lógica compartida de guardar/compartir, reusada por el dropdown desktop y la hoja móvil. */
export function useSaveShare(): SaveShare {
  const { state, dispatch } = useStore()
  const [copied, setCopied] = useState(false)
  const [saves, setSaves] = useState<SavedPrediction[]>([])

  const refresh = () => setSaves(readSaves())

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}?e=${encodeScenario(state.matches)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      try {
        window.prompt('Copia el enlace:', url)
      } catch {
        // ignore
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (typeof window === 'undefined') return
    const name = window.prompt('Nombre de la predicción')
    if (!name || !name.trim()) return
    const entry: SavedPrediction = {
      name: name.trim(),
      e: encodeScenario(state.matches),
      savedAt: new Date().toISOString(),
    }
    const next = [entry, ...readSaves()].slice(0, MAX_SAVES)
    writeSaves(next)
    setSaves(next)
  }

  const handleLoad = (e: string) => {
    const scores = decodeScenario(e)
    if (scores) dispatch({ type: 'APPLY_SCENARIO', scores })
  }

  const handleDelete = (savedAt: string) => {
    const next = readSaves().filter((s) => s.savedAt !== savedAt)
    writeSaves(next)
    setSaves(next)
  }

  return { copied, saves, refresh, handleShare, handleSave, handleLoad, handleDelete }
}
```

- [ ] **Step 2: Crear las acciones de escenario compartidas**

`components/actions/scenarioActions.tsx`:
```tsx
import { Wand2, Dices, Eraser } from 'lucide-react'
import type React from 'react'
import type { Action } from '@/lib/store'

export interface ScenarioAction {
  icon: React.ReactNode
  label: string
  danger?: boolean
  run: (dispatch: React.Dispatch<Action>) => void
}

/** Acciones globales de escenario, compartidas por el dropdown desktop y la hoja móvil. */
export const SCENARIO_ACTIONS: ScenarioAction[] = [
  {
    icon: <Wand2 size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Simular por ranking',
    run: (d) => d({ type: 'SIMULATE_BY_RANKING' }),
  },
  {
    icon: <Dices size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Rellenar escenario',
    run: (d) => d({ type: 'FILL_SCENARIO' }),
  },
  {
    icon: <Eraser size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Limpiar',
    danger: true,
    run: (d) => d({ type: 'CLEAR' }),
  },
]
```

- [ ] **Step 3: Refactor `ActionsMenu` para usar `SCENARIO_ACTIONS`**

Reemplaza el bloque `const item = ...` y el contenido del `<div role="menu">` en `components/ActionsMenu.tsx`. El componente queda:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SCENARIO_ACTIONS } from '@/components/actions/scenarioActions'

/** "Acciones" dropdown (desktop): Simular por ranking / Rellenar escenario / Limpiar. */
export default function ActionsMenu() {
  const { dispatch } = useStore()
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

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#E8B84B] px-3 py-1 text-xs font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c]"
      >
        Acciones
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16161c]/55 p-1 shadow-xl backdrop-blur-xl"
        >
          {SCENARIO_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={() => {
                a.run(dispatch)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Refactor `SaveShareMenu` para usar el hook**

En `components/SaveShareMenu.tsx`: elimina las constantes/funciones `SAVES_KEY`, `MAX_SAVES`, `SavedPrediction`, `readSaves`, `writeSaves`, `formatDate` y los handlers locales; sustitúyelos por el hook. El componente queda:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Bookmark, Link2, Trash2, ChevronDown, FolderOpen } from 'lucide-react'
import { useSaveShare, formatDate } from '@/components/actions/useSaveShare'

/** "Guardar / Compartir" (desktop): comparte un enlace y gestiona predicciones guardadas. */
export default function SaveShareMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { copied, saves, refresh, handleShare, handleSave, handleLoad, handleDelete } = useSaveShare()

  useEffect(() => {
    if (!open) return
    refresh()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#f5f5f5] backdrop-blur-md transition-colors hover:bg-white/10"
      >
        <Share2 size={13} strokeWidth={2} aria-hidden="true" />
        Guardar / Compartir
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16161c]/55 p-1 shadow-xl backdrop-blur-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleShare()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
          >
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
            {copied ? '¡Enlace copiado!' : 'Compartir enlace'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSave}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
          >
            <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
            Guardar predicción
          </button>

          <div className="my-1 border-t border-white/10" />

          {saves.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#8a8a8a]">Sin predicciones guardadas</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {saves.map((s) => (
                <li key={s.savedAt} className="flex items-center gap-1 rounded-lg hover:bg-white/10">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleLoad(s.e)
                      setOpen(false)
                    }}
                    title="Cargar predicción"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                  >
                    <FolderOpen size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#8a8a8a]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[#f5f5f5]">{s.name}</span>
                      <span className="block text-[10px] text-[#8a8a8a]">{formatDate(s.savedAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.savedAt)}
                    aria-label={`Eliminar ${s.name}`}
                    title="Eliminar"
                    className="mr-1 shrink-0 rounded-lg p-1.5 text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#E61D25]"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores. Verifica que no quedan imports sin usar en `SaveShareMenu.tsx` ni `ActionsMenu.tsx`.

- [ ] **Step 6: Commit**

```bash
git add components/actions/useSaveShare.ts components/actions/scenarioActions.tsx components/ActionsMenu.tsx components/SaveShareMenu.tsx
git commit -m "refactor(actions): extraer lógica de guardar/compartir y acciones de escenario (DRY)"
```

---

## Task 5: Contexto de acción contextual (exportar)

**Files:**
- Create: `components/actions/MobileActionsContext.tsx`

- [ ] **Step 1: Crear el contexto**

`components/actions/MobileActionsContext.tsx`:
```tsx
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface ContextualAction {
  label: string
  run: () => void
}

interface MobileActionsValue {
  exportAction: ContextualAction | null
  setExportAction: (a: ContextualAction | null) => void
}

const Ctx = createContext<MobileActionsValue | null>(null)

export function MobileActionsProvider({ children }: { children: React.ReactNode }) {
  const [exportAction, setExportAction] = useState<ContextualAction | null>(null)
  const value = useMemo(() => ({ exportAction, setExportAction }), [exportAction])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMobileActions(): MobileActionsValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMobileActions must be used within MobileActionsProvider')
  return ctx
}

/**
 * Registra una acción de exportar mientras el componente que llama esté montado.
 * Pasa `run` memoizado (useCallback) para evitar re-registros en cada render.
 */
export function useRegisterExport(label: string | null, run: (() => void) | null) {
  const { setExportAction } = useMobileActions()
  useEffect(() => {
    if (label && run) setExportAction({ label, run })
    else setExportAction(null)
    return () => setExportAction(null)
  }, [label, run, setExportAction])
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/actions/MobileActionsContext.tsx
git commit -m "feat(actions): contexto para registrar la acción de exportar contextual"
```

---

## Task 6: MobileActionBar (botón ⋯ + hoja de acciones)

**Files:**
- Create: `components/nav/MobileActionBar.tsx`

- [ ] **Step 1: Crear el componente**

`components/nav/MobileActionBar.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { MoreHorizontal, Link2, Bookmark, Trash2, FolderOpen, ImageDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import BottomSheet from '@/components/ui/BottomSheet'
import { SCENARIO_ACTIONS } from '@/components/actions/scenarioActions'
import { useSaveShare, formatDate } from '@/components/actions/useSaveShare'
import { useMobileActions } from '@/components/actions/MobileActionsContext'

const ITEM = 'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-white/10'
const LABEL = 'px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#777]'

/** Botón "⋯" en la cabecera (solo móvil) que abre la hoja de acciones. */
export default function MobileActionBar() {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const { copied, saves, refresh, handleShare, handleSave, handleLoad, handleDelete } = useSaveShare()
  const { exportAction } = useMobileActions()

  const openSheet = () => {
    refresh()
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Acciones"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f5f5f5] backdrop-blur-md sm:hidden"
      >
        <MoreHorizontal size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Acciones">
        <div className="mb-2">
          <p className={LABEL}>Simulación</p>
          {SCENARIO_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.run(dispatch)
                setOpen(false)
              }}
              className={`${ITEM} ${a.danger ? 'text-[#E16B6B]' : 'text-[#f5f5f5]'}`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 pt-2">
          <p className={LABEL}>Guardar / Compartir</p>
          <button type="button" onClick={() => void handleShare()} className={`${ITEM} text-[#f5f5f5]`}>
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
            {copied ? '¡Enlace copiado!' : 'Compartir enlace'}
          </button>
          <button type="button" onClick={handleSave} className={`${ITEM} text-[#f5f5f5]`}>
            <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
            Guardar predicción
          </button>
          {exportAction && (
            <button
              type="button"
              onClick={() => {
                exportAction.run()
                setOpen(false)
              }}
              className={`${ITEM} text-[#f5f5f5]`}
            >
              <ImageDown size={16} strokeWidth={2} aria-hidden="true" />
              {exportAction.label}
            </button>
          )}
        </div>

        {saves.length > 0 && (
          <div className="mt-1 border-t border-white/10 pt-2">
            <p className={LABEL}>Guardadas</p>
            <ul className="max-h-56 overflow-y-auto">
              {saves.map((s) => (
                <li key={s.savedAt} className="flex items-center gap-1 rounded-lg hover:bg-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleLoad(s.e)
                      setOpen(false)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left"
                  >
                    <FolderOpen size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#8a8a8a]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[#f5f5f5]">{s.name}</span>
                      <span className="block text-[10px] text-[#8a8a8a]">{formatDate(s.savedAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.savedAt)}
                    aria-label={`Eliminar ${s.name}`}
                    className="mr-1 shrink-0 rounded-lg p-1.5 text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#E61D25]"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/nav/MobileActionBar.tsx
git commit -m "feat(nav): MobileActionBar — hoja de acciones desde la cabecera (móvil)"
```

---

## Task 7: BottomTabBar (barra inferior + hoja "Más")

**Files:**
- Create: `components/nav/BottomTabBar.tsx`

- [ ] **Step 1: Crear el componente**

`components/nav/BottomTabBar.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ALL_TABS, primaryIndices, secondaryIndices } from '@/lib/nav/tabs'
import { TAB_ICONS } from '@/components/nav/tabIcons'
import BottomSheet from '@/components/ui/BottomSheet'

interface BottomTabBarProps {
  active: number
  onChange: (i: number) => void
}

/** Navegación principal en MÓVIL: 4 destinos primarios + "Más". Oculta en desktop. */
export default function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  const { state } = useStore()
  const [moreOpen, setMoreOpen] = useState(false)
  const primary = primaryIndices(state.liveMode)
  const secondary = secondaryIndices(state.liveMode)
  const moreActive = secondary.includes(active)

  const select = (i: number) => {
    onChange(i)
    setMoreOpen(false)
  }

  const itemCls = (isActive: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium ${
      isActive ? 'text-[#E8B84B]' : 'text-[#7a7a7a]'
    }`

  return (
    <>
      <nav
        role="tablist"
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      >
        {primary.map((i) => {
          const tab = ALL_TABS[i]
          const Icon = TAB_ICONS[tab.key]
          const isActive = i === active
          const color = tab.iconColor ?? (isActive ? '#E8B84B' : '#7a7a7a')
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.full}
              onClick={() => select(i)}
              className={itemCls(isActive)}
            >
              <Icon size={20} strokeWidth={2} color={color} aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-label="Más secciones"
          onClick={() => setMoreOpen(true)}
          className={itemCls(moreActive)}
        >
          <Menu size={20} strokeWidth={2} color={moreActive ? '#E8B84B' : '#7a7a7a'} aria-hidden="true" />
          Más
        </button>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Más secciones">
        {secondary.map((i) => {
          const tab = ALL_TABS[i]
          const Icon = TAB_ICONS[tab.key]
          const isActive = i === active
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => select(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                isActive ? 'text-[#E8B84B]' : 'text-[#f5f5f5]'
              }`}
            >
              <Icon size={18} strokeWidth={2} color={tab.iconColor} aria-hidden="true" />
              {tab.full}
            </button>
          )
        })}
      </BottomSheet>
    </>
  )
}
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/nav/BottomTabBar.tsx
git commit -m "feat(nav): BottomTabBar móvil con hoja \"Más\""
```

---

## Task 8: Cableado en page.tsx y GroupStageTab

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/group-stage/GroupStageTab.tsx`

- [ ] **Step 1: GroupStageTab — acciones desktop-only + registrar export**

En `components/group-stage/GroupStageTab.tsx`:

1. Cambia los imports superiores a:
```tsx
'use client'

import { useCallback, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { useStore } from '@/lib/store'
import { GROUP_IDS } from '@/lib/data/groups'
import { exportElementToPng } from '@/lib/exportImage'
import { useRegisterExport } from '@/components/actions/MobileActionsContext'
import ActionsMenu from '@/components/ActionsMenu'
import SaveShareMenu from '@/components/SaveShareMenu'
import ExportButton from '@/components/ui/ExportButton'
import GroupCard from './GroupCard'
import FixtureList from './FixtureList'
```

2. Justo después de `const gridRef = useRef<HTMLDivElement>(null)` añade el registro de export:
```tsx
  const handleExport = useCallback(() => {
    if (gridRef.current) void exportElementToPng(gridRef.current, 'grupos-mundial-2026.png')
  }, [])
  useRegisterExport('Exportar imagen', handleExport)
```

3. Reemplaza la fila de acciones (el `<div className="flex flex-wrap items-center justify-start gap-2">…</div>` completo) por:
```tsx
      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <ActionsMenu />
          <SaveShareMenu />
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md sm:ml-auto">
          <button
            type="button"
            onClick={() => setView('groups')}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              view === 'groups' ? 'bg-[#E8B84B] text-[#0a0a0a]' : 'text-[#8a8a8a] hover:text-[#f5f5f5]',
            ].join(' ')}
          >
            Por grupos
          </button>
          <button
            type="button"
            onClick={() => setView('date')}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              view === 'date' ? 'bg-[#E8B84B] text-[#0a0a0a]' : 'text-[#8a8a8a] hover:text-[#f5f5f5]',
            ].join(' ')}
          >
            Por fecha
          </button>
        </div>
        <div className="hidden sm:inline-flex">
          <ExportButton targetRef={gridRef} filename="grupos-mundial-2026.png" label="Exportar imagen" />
        </div>
      </div>
```

- [ ] **Step 2: page.tsx — provider, barras móviles y padding inferior**

En `app/page.tsx`:

1. Añade imports:
```tsx
import BottomTabBar from '@/components/nav/BottomTabBar'
import MobileActionBar from '@/components/nav/MobileActionBar'
import { MobileActionsProvider } from '@/components/actions/MobileActionsContext'
```

2. En el componente `Home`, envuelve `<Dashboard />` con el provider:
```tsx
export default function Home() {
  return (
    <StoreProvider>
      <OddsProvider>
        <FavoriteProvider>
          <MobileActionsProvider>
            <Dashboard />
          </MobileActionsProvider>
        </FavoriteProvider>
      </OddsProvider>
    </StoreProvider>
  )
}
```

3. Cambia el padding del `<main>` para reservar sitio a la barra inferior en móvil:
```tsx
    <main className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-6 sm:py-12">
```

4. En el `<div className="self-end sm:self-auto shrink-0">` que envuelve `<FavoritePicker />`, añade el botón de acciones móvil delante:
```tsx
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <MobileActionBar />
          <FavoritePicker />
        </div>
```

5. Justo antes de cerrar `</main>` (después del `<div className="mt-6">…</div>` que renderiza el contenido de la pestaña), añade la barra inferior:
```tsx
      <BottomTabBar active={active} onChange={setActive} />
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/group-stage/GroupStageTab.tsx
git commit -m "feat(nav): cablear BottomTabBar y hoja de acciones; export contextual en Grupos"
```

---

## Task 9: Verificación final

**Files:** ninguno (verificación).

- [ ] **Step 1: Suite completa + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: todos los tests verdes, lint limpio, build OK.

- [ ] **Step 2: Checklist manual (DevTools en modo móvil, p. ej. iPhone 12)**

Run: `npm run dev` y abre http://localhost:3000 con el viewport en móvil.

Verifica:
- [ ] En móvil **no** aparecen las pills de pestañas arriba; aparece la **barra inferior** con Grupos · Eliminatorias · Probabilidades · Porra · Más.
- [ ] Tocar cada destino cambia el contenido y resalta el icono en dorado.
- [ ] "Más" abre una hoja con Terceros · Directo · Cuotas · Noticias; al elegir uno, el contenido cambia y "Más" queda resaltado.
- [ ] La hoja cierra con: tocar fuera (scrim) y con la tecla Esc (teclado externo / emulado).
- [ ] El botón **⋯** de la cabecera abre la hoja de acciones: Simular / Rellenar / Limpiar + Compartir enlace / Guardar predicción.
- [ ] En la pestaña **Grupos**, la hoja de acciones muestra además **Exportar imagen**; en otras pestañas (p. ej. Probabilidades) **no** aparece esa opción.
- [ ] "Compartir enlace" muestra "¡Enlace copiado!"; "Guardar predicción" añade una entrada que luego aparece bajo "Guardadas".
- [ ] Activa el modo en directo (pestaña Directo → activar): **Directo** sube al bottom bar (icono rojo) y **Porra** pasa a "Más".
- [ ] El contenido no queda tapado por la barra inferior al hacer scroll hasta el final.
- [ ] **Desktop** (viewport ≥ 640px): todo igual que antes — pills arriba, dropdowns de Acciones y Guardar/Compartir, botón Exportar inline; **sin** barra inferior ni botón ⋯.

- [ ] **Step 3: Commit (si hubo ajustes del checklist)**

```bash
git add -A
git commit -m "fix(nav): ajustes tras verificación manual del menú móvil"
```
