'use client'

import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import type { GroupId, Match } from '@/lib/types'
import Flag from '@/components/ui/Flag'
import ScoreInput from './ScoreInput'
import { timeES, dayES, byKickoff } from '@/lib/format'
import { TrendingUp } from 'lucide-react'
import { useOdds, type OutcomeCell } from '@/components/odds/OddsProvider'

/**
 * Compact 1X2 row: bookmaker odds with the favourite (lowest odd) in gold, plus
 * a green value marker (▲ +Npp) on outcomes where our model's probability beats
 * the de-vigged implied probability by ≥ 3 points.
 */
function OddsLine({ home, away }: { home: string; away: string }) {
  const { valueForPair } = useOdds()
  const v = valueForPair(home, away)
  if (!v) return null
  const min = Math.min(v.home.odds, v.draw.odds, v.away.odds)

  const cell = (label: string, c: OutcomeCell) => {
    const fav = c.odds === min
    const hasValue = c.value >= 0.03
    return (
      <span
        title={`Cuota ${c.odds.toFixed(2)} · implícita ${(c.implied * 100).toFixed(0)}% · modelo ${(c.model * 100).toFixed(0)}% · valor ${c.value >= 0 ? '+' : ''}${(c.value * 100).toFixed(0)} pp`}
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 tabular-nums ${
          fav ? 'bg-[#E8B84B]/15 text-[#E8B84B]' : 'text-[#8a8a8a]'
        }`}
      >
        <span className="text-[#5a5a5a]">{label}</span>
        {c.odds.toFixed(2)}
        {hasValue && (
          <span className="inline-flex items-center gap-0.5 text-[#3CAC3B]">
            <TrendingUp size={9} strokeWidth={2.5} aria-hidden="true" />+{Math.round(c.value * 100)}
          </span>
        )}
      </span>
    )
  }

  return (
    <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px]">
      {cell('1', v.home)}
      {cell('X', v.draw)}
      {cell('2', v.away)}
    </div>
  )
}

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
      <OddsLine home={match.home} away={match.away} />
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
