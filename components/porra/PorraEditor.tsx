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
                <div key={`${teamId}-${slot}`} className="flex items-center gap-1">
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
