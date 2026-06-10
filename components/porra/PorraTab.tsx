'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Radio } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useOdds } from '@/components/odds/OddsProvider'
import {
  checkPartition,
  migrate,
  newPorra,
  type Porra,
  type PorrasState,
} from '@/lib/data/porra'
import { TEAMS } from '@/lib/data/teams'
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

  const writeStorage = (next: PorrasState) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(V2_KEY, JSON.stringify(next))
      } catch {
        // ignore quota/availability errors
      }
    }
  }

  // Mutations that change entries or switch porra → MC result no longer valid.
  const persist = (next: PorrasState) => {
    setData(next)
    setResult(null)
    writeStorage(next)
  }

  // Metadata-only change (rename): keep the displayed result.
  const persistMeta = (next: PorrasState) => {
    setData(next)
    writeStorage(next)
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
      persistMeta({ ...data, porras: data.porras.map(p => (p.id === id ? { ...p, name: name.trim() } : p)) })
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
    // active.entries intentionally excluded: re-run on porra switch (active.id), not per-keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.liveMode, state.matches, mode, active.id])

  const partition = checkPartition(active.entries)

  const byName = useMemo(
    () => new Map(active.entries.map(e => [e.name, e])),
    [active.entries],
  )

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

      {!partition.valid && (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b]">
          <span className="mr-1">⚠</span>
          {partition.duplicated.length > 0 && (
            <span>
              {partition.duplicated.map(id => TEAMS[id]?.name ?? id).join(', ')}{' '}
              {partition.duplicated.length === 1 ? 'está repetido' : 'están repetidos'}.{' '}
            </span>
          )}
          {partition.unassigned.length > 0 && (
            <span>{partition.unassigned.length} sin asignar.</span>
          )}
        </div>
      )}

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
            disabled={isPending || !partition.valid}
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
