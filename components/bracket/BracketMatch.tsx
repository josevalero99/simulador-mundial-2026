'use client'

import { TEAMS } from '@/lib/data/teams'
import type { KnockoutMatch } from '@/lib/engine/bracket'
import Flag from '@/components/ui/Flag'

interface BracketMatchProps {
  match: KnockoutMatch
  onPick: (match: number, winner: string) => void
}

interface SideProps {
  teamId: string | null
  selected: boolean
  onClick: () => void
}

function Side({ teamId, selected, onClick }: SideProps) {
  if (teamId === null) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#5a5a5a]">
        <span className="text-base leading-none">—</span>
        <span>Por definir</span>
      </div>
    )
  }
  const team = TEAMS[teamId]
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        selected
          ? 'bg-[#E8B84B] font-semibold text-[#0a0a0a]'
          : 'text-[#f5f5f5] hover:bg-white/10',
      ].join(' ')}
    >
      <Flag teamId={teamId} className="text-base leading-none" />
      <span className="truncate">{team?.name ?? teamId}</span>
    </button>
  )
}

/** A single knockout match: two stacked teams; clicking one picks the winner. */
export default function BracketMatch({ match, onPick }: BracketMatchProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-1">
      <Side
        teamId={match.home}
        selected={match.winner !== null && match.winner === match.home}
        onClick={() => match.home && onPick(match.match, match.home)}
      />
      <div className="my-0.5 border-t border-white/10" />
      <Side
        teamId={match.away}
        selected={match.winner !== null && match.winner === match.away}
        onClick={() => match.away && onPick(match.match, match.away)}
      />
    </div>
  )
}
