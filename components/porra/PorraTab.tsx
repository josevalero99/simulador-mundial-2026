'use client'

import { useEffect, useState, useTransition } from 'react'
import { Radio, Trophy } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import { DEFAULT_PORRA, type PorraEntry } from '@/lib/data/porra'
import { runPorraMonteCarlo, type PorraProb } from '@/lib/engine/porra'
import Flag from '@/components/ui/Flag'

const N = 2000
const STORAGE_KEY = 'wc2026-porra'

/** Formats a probability (0..1) as a percentage with 1 decimal. */
function fmtProb(p: number): string {
  if (p > 0 && p < 0.001) return '<0.1%'
  return `${(p * 100).toFixed(1)}%`
}

/** Validates that the parsed value is an array of 12 entries with 4 string teams each. */
function isValidPorra(value: unknown): value is PorraEntry[] {
  if (!Array.isArray(value) || value.length !== 12) return false
  return value.every(
    e =>
      e &&
      typeof e === 'object' &&
      typeof (e as PorraEntry).name === 'string' &&
      Array.isArray((e as PorraEntry).teams) &&
      (e as PorraEntry).teams.length === 4 &&
      (e as PorraEntry).teams.every(t => typeof t === 'string'),
  )
}

/** Result of checking whether entries form a valid partition of all 48 teams. */
interface PartitionCheck {
  valid: boolean
  duplicated: string[]
  unassigned: string[]
}

function checkPartition(entries: PorraEntry[]): PartitionCheck {
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

const teamName = (id: string) => TEAMS[id]?.name ?? id

/** All teams, sorted by name, for the select dropdowns. */
const ALL_TEAMS = Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name, 'es'))

interface BarProps {
  value: number
}

function Bar({ value }: BarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#262626]">
        <div
          className="h-full rounded-full bg-[#E8B84B]"
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a8a8a]">
        {fmtProb(value)}
      </span>
    </div>
  )
}

interface PorraRowProps {
  rank: number
  entry: PorraEntry | undefined
  prob: PorraProb
  isLeader: boolean
}

function PorraRow({ rank, entry, prob, isLeader }: PorraRowProps) {
  return (
    <tr
      className={[
        'border-t border-[#262626]',
        isLeader ? 'bg-[#E8B84B]/5' : '',
      ].join(' ')}
    >
      <td className="py-2.5 pl-2 align-middle">
        <span className="inline-flex h-6 min-w-6 items-center justify-center text-sm font-bold tabular-nums text-[#8a8a8a]">
          {isLeader ? <Trophy size={16} strokeWidth={2} color="#E8B84B" aria-label="Líder" /> : rank}
        </span>
      </td>
      <td className="px-3 align-middle">
        <span className={`font-bold ${isLeader ? 'text-[#E8B84B]' : 'text-[#f5f5f5]'}`}>
          {prob.name}
        </span>
      </td>
      <td className="px-3 align-middle">
        <div className="flex flex-wrap items-center gap-1.5">
          {(entry?.teams ?? []).map((id, i) => (
            <span
              key={`${id}-${i}`}
              title={teamName(id)}
              className="inline-flex items-center gap-1 rounded-full bg-[#1c1c1c] px-2 py-0.5 text-xs text-[#f5f5f5]"
            >
              <Flag teamId={id} className="text-sm leading-none" />
              {id}
            </span>
          ))}
        </div>
      </td>
      <td className="w-44 px-3 align-middle">
        <Bar value={prob.winProb} />
      </td>
      <td className="px-3 text-right align-middle">
        <span className="text-sm font-medium tabular-nums text-[#f5f5f5]">
          {prob.expectedTotal.toFixed(1)}
        </span>
        <span className="ml-1 text-xs text-[#8a8a8a]">pts esperados</span>
      </td>
    </tr>
  )
}

interface PorraEditorProps {
  entries: PorraEntry[]
  onChange: (entries: PorraEntry[]) => void
}

function PorraEditor({ entries, onChange }: PorraEditorProps) {
  const setName = (idx: number, name: string) => {
    const next = entries.map((e, i) => (i === idx ? { ...e, name } : e))
    onChange(next)
  }

  const setTeam = (idx: number, slot: number, teamId: string) => {
    const next = entries.map((e, i) =>
      i === idx ? { ...e, teams: e.teams.map((t, s) => (s === slot ? teamId : t)) } : e,
    )
    onChange(next)
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#262626] bg-[#141414] p-4"
        >
          <input
            type="text"
            value={entry.name}
            onChange={e => setName(idx, e.target.value)}
            aria-label={`Nombre del participante ${idx + 1}`}
            className="mb-3 w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-3 py-1.5 text-sm font-bold text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
          />
          <div className="grid grid-cols-2 gap-2">
            {entry.teams.map((teamId, slot) => (
              <select
                key={slot}
                value={teamId}
                onChange={e => setTeam(idx, slot, e.target.value)}
                aria-label={`${entry.name} · selección ${slot + 1}`}
                className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-2 py-1.5 text-sm text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
              >
                {ALL_TEAMS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.flag} {t.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Porra tab: editable team picks per participant + Monte Carlo win probabilities. */
export default function PorraTab() {
  const { state } = useStore()
  const [entries, setEntries] = useState<PorraEntry[]>(DEFAULT_PORRA)
  const [result, setResult] = useState<PorraProb[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (isValidPorra(parsed)) setEntries(parsed)
    } catch {
      // corrupt/missing → keep DEFAULT_PORRA
    }
  }, [])

  const persist = (next: PorraEntry[]) => {
    setEntries(next)
    setResult(null)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore quota/availability errors
      }
    }
  }

  const handleReset = () => persist(DEFAULT_PORRA)

  const handleCalc = () => {
    const base = state.matches
    startTransition(() => {
      const probs = runPorraMonteCarlo(N, entries, base)
      setResult(probs)
    })
  }

  // In live mode, recompute automatically whenever real results change.
  // (Skipped while editing so the editor stays responsive.)
  useEffect(() => {
    if (!state.liveMode || editing) return
    startTransition(() => {
      setResult(runPorraMonteCarlo(N, entries, state.matches))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.liveMode, state.matches, editing])

  const partition = checkPartition(entries)
  const byName = new Map(entries.map(e => [e.name, e]))
  const leaderName = result && result.length > 0 ? result[0].name : null

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            quien menos sume con sus 4 selecciones.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(e => !e)}
            className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a]"
          >
            {editing ? 'Ver resultados' : 'Editar equipos'}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a]"
            >
              Restaurar equipos
            </button>
          ) : (
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
      </div>

      {!partition.valid && (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b]">
          <span className="mr-1">⚠</span>
          {partition.duplicated.length > 0 && (
            <span>
              {partition.duplicated.map(teamName).join(', ')}{' '}
              {partition.duplicated.length === 1 ? 'está repetido' : 'están repetidos'}.{' '}
            </span>
          )}
          {partition.unassigned.length > 0 && (
            <span>
              {partition.unassigned.map(teamName).join(', ')}{' '}
              {partition.unassigned.length === 1 ? 'sin asignar' : 'sin asignar'}.
            </span>
          )}
        </div>
      )}

      {editing ? (
        <PorraEditor entries={entries} onChange={persist} />
      ) : !result ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-[#8a8a8a]">
          <p className="text-sm leading-relaxed">
            Pulsa Calcular probabilidades para estimar, mediante {N.toLocaleString('es')}{' '}
            simulaciones Monte Carlo, la opción de victoria de cada participante. Puede tardar unos
            segundos.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#262626] bg-[#141414] p-4 sm:p-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                <th className="py-1.5 pl-2 text-left font-medium">#</th>
                <th className="px-3 text-left font-medium">Participante</th>
                <th className="px-3 text-left font-medium">Selecciones</th>
                <th className="px-3 text-left font-medium">Prob. victoria</th>
                <th className="px-3 text-right font-medium">Total esperado</th>
              </tr>
            </thead>
            <tbody>
              {result.map((prob, i) => (
                <PorraRow
                  key={prob.name}
                  rank={i + 1}
                  entry={byName.get(prob.name)}
                  prob={prob}
                  isLeader={prob.name === leaderName}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
