'use client'

import { TEAMS } from '@/lib/data/teams'
import type { KnockoutMatch } from '@/lib/engine/bracket'
import Flag from '@/components/ui/Flag'
import { useFavorite } from '@/components/favorite/FavoriteProvider'

interface BracketMatchProps {
  match: KnockoutMatch
  onPick: (match: number, winner: string) => void
}

interface SideProps {
  teamId: string | null
  selected: boolean
  isFavorite: boolean
  onClick: () => void
}

function Side({ teamId, selected, isFavorite, onClick }: SideProps) {
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
          : isFavorite
            ? 'text-[#E8B84B] ring-1 ring-inset ring-[#E8B84B]/40 hover:bg-white/10'
            : 'text-[#f5f5f5] hover:bg-white/10',
      ].join(' ')}
    >
      <Flag teamId={teamId} className="text-base leading-none" />
      <span className="truncate">{team?.name ?? teamId}</span>
      {isFavorite && !selected && (
        <span
          aria-hidden="true"
          className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8B84B]"
        />
      )}
    </button>
  )
}

/** A single knockout match: two stacked teams; clicking one picks the winner. */
export default function BracketMatch({ match, onPick }: BracketMatchProps) {
  const { favorite } = useFavorite()
  return (
    <div className="rounded-lg border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-1">
      <Side
        teamId={match.home}
        selected={match.winner !== null && match.winner === match.home}
        isFavorite={favorite !== null && match.home === favorite}
        onClick={() => match.home && onPick(match.match, match.home)}
      />
      <div className="my-0.5 border-t border-white/10" />
      <Side
        teamId={match.away}
        selected={match.winner !== null && match.winner === match.away}
        isFavorite={favorite !== null && match.away === favorite}
        onClick={() => match.away && onPick(match.match, match.away)}
      />
    </div>
  )
}
