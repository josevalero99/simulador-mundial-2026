'use client'

import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import type { GroupId, Match } from '@/lib/types'
import Flag from '@/components/ui/Flag'
import ScoreInput from './ScoreInput'

const DATE_FMT = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** Format an ISO date like `2026-06-11` as `JUEVES 11 JUN`. */
function formatDate(iso: string): string {
  const parts = DATE_FMT.formatToParts(new Date(`${iso}T00:00:00Z`))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const weekday = get('weekday')
  const day = get('day')
  const month = get('month').replace('.', '')
  return `${weekday} ${day} ${month}`.toUpperCase()
}

interface MatchRowProps {
  match: Match
}

function MatchRow({ match }: MatchRowProps) {
  const home = TEAMS[match.home]
  const away = TEAMS[match.away]
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-right text-sm text-[#f5f5f5]">
          {home?.name ?? match.home}
        </span>
        <Flag teamId={match.home} className="text-base leading-none" />
      </div>
      <ScoreInput match={match} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Flag teamId={match.away} className="text-base leading-none" />
        <span className="truncate text-sm text-[#f5f5f5]">{away?.name ?? match.away}</span>
      </div>
    </div>
  )
}

/** Group a list of matches by date (ascending) preserving match order within. */
function groupByDate(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    if (!map.has(m.date)) map.set(m.date, [])
    map.get(m.date)!.push(m)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

interface FixtureListProps {
  /** Render fixtures for this group (reads from the store). */
  groupId?: GroupId
  /** Or render an explicit list of matches (used by the "Por fecha" view). */
  matches?: Match[]
  /** Show the group letter on each match row (useful in cross-group lists). */
  showGroup?: boolean
}

/** Matches grouped by matchday with a Spanish date sub-header. */
export default function FixtureList({ groupId, matches, showGroup = false }: FixtureListProps) {
  const { state } = useStore()
  const list = matches ?? (groupId ? state.matches.filter((m) => m.group === groupId) : [])
  const byDate = groupByDate(list)

  return (
    <div className="flex flex-col gap-3">
      {byDate.map(([date, dayMatches]) => (
        <div key={date}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5a]">
            {formatDate(date)}
          </p>
          <div className="divide-y divide-[#1c1c1c]">
            {dayMatches.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                {showGroup && (
                  <span className="w-5 shrink-0 text-center text-[10px] font-bold text-[#5a5a5a]">
                    {m.group}
                  </span>
                )}
                <div className="flex-1">
                  <MatchRow match={m} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
