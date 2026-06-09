'use client'

import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import type { GroupId, Match } from '@/lib/types'
import Flag from '@/components/ui/Flag'
import ScoreInput from './ScoreInput'
import { timeES, dayES, byKickoff } from '@/lib/format'

interface MatchRowProps {
  match: Match
  /** Prefix the centered header with the group letter (cross-group lists). */
  showGroup?: boolean
}

function MatchRow({ match, showGroup = false }: MatchRowProps) {
  const home = TEAMS[match.home]
  const away = TEAMS[match.away]
  const day = dayES(match.kickoff) || match.date
  const time = timeES(match.kickoff)
  const header = [showGroup ? `Grupo ${match.group}` : null, day, time].filter(Boolean).join(' · ')

  return (
    <div className="py-2">
      {header && (
        <div className="mb-1 text-center text-[11px] uppercase tracking-wide tabular-nums text-[#8a8a8a]">
          {header}
        </div>
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

interface FixtureListProps {
  /** Render fixtures for this group (reads from the store). */
  groupId?: GroupId
  /** Or render an explicit list of matches (used by the "Por fecha" view). */
  matches?: Match[]
  /** Show the group letter in each match header (useful in cross-group lists). */
  showGroup?: boolean
}

/** Matches ordered chronologically by Spanish kickoff; each shows day · hora centered above. */
export default function FixtureList({ groupId, matches, showGroup = false }: FixtureListProps) {
  const { state } = useStore()
  const list = (
    matches ?? (groupId ? state.matches.filter((m) => m.group === groupId) : [])
  )
    .slice()
    .sort(byKickoff)

  return (
    <div className="divide-y divide-[#1c1c1c]">
      {list.map((m) => (
        <MatchRow key={m.id} match={m} showGroup={showGroup} />
      ))}
    </div>
  )
}
