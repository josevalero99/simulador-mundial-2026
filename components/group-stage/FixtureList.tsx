'use client'

import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import type { GroupId, Match } from '@/lib/types'
import Flag from '@/components/ui/Flag'
import ScoreInput from './ScoreInput'
import { timeES, dayES, byKickoff } from '@/lib/format'

interface MatchRowProps {
  match: Match
}

function MatchRow({ match }: MatchRowProps) {
  const home = TEAMS[match.home]
  const away = TEAMS[match.away]
  const time = timeES(match.kickoff)
  return (
    <div className="py-1.5">
      {time && (
        <div className="mb-1 text-center text-[11px] tabular-nums text-[#8a8a8a]">{time}</div>
      )}
      <div className="flex items-center gap-2">
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
    </div>
  )
}

/**
 * Group a list of matches by their Spanish (Madrid) calendar day, ordered
 * chronologically by kickoff. Matches within a day are sorted by kickoff too.
 */
function groupByDay(matches: Match[]): [string, Match[]][] {
  const sorted = [...matches].sort(byKickoff)
  const order: string[] = []
  const map = new Map<string, Match[]>()
  for (const m of sorted) {
    const key = dayES(m.kickoff) || m.date
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(m)
  }
  return order.map((key) => [key, map.get(key)!])
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
  const byDay = groupByDay(list)

  return (
    <div className="flex flex-col gap-3">
      {byDay.map(([day, dayMatches]) => (
        <div key={day}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5a]">
            {day.toUpperCase()}
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
