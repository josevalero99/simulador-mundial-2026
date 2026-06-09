'use client'

import { useStore } from '@/lib/store'
import { GROUPS } from '@/lib/data/groups'
import { TEAMS } from '@/lib/data/teams'
import { rankGroup } from '@/lib/engine/tiebreakers'
import type { GroupId } from '@/lib/types'
import Flag from '@/components/ui/Flag'

const fifaRank = (id: string) => TEAMS[id]?.fifaRank ?? 999

/** Tailwind background class for a rank's marker dot. */
function rankColor(rank: number): string {
  if (rank === 1 || rank === 2) return 'bg-[#22c55e]'
  if (rank === 3) return 'bg-[#f59e0b]'
  return 'bg-[#52525b]'
}

interface StandingsTableProps {
  groupId: GroupId
}

/** Live group standings, ranked with FIFA tiebreak criteria. */
export default function StandingsTable({ groupId }: StandingsTableProps) {
  const { state } = useStore()
  const matches = state.matches.filter((m) => m.group === groupId)
  const rows = rankGroup(GROUPS[groupId], matches, fifaRank)

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
          <th className="py-1.5 pl-1 text-left font-medium">Equipo</th>
          <th className="px-1 text-right font-medium">Pts</th>
          <th className="px-1 text-right font-medium">PJ</th>
          <th className="px-1 text-right font-medium">G</th>
          <th className="px-1 text-right font-medium">E</th>
          <th className="px-1 text-right font-medium">P</th>
          <th className="px-1 pr-1 text-right font-medium">DG</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const team = TEAMS[row.teamId]
          return (
            <tr key={row.teamId} className="border-t border-[#262626]">
              <td className="py-2 pl-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${rankColor(row.rank)}`} />
                  <Flag teamId={row.teamId} className="text-base leading-none" />
                  <span className="truncate text-[#f5f5f5]">{team?.name ?? row.teamId}</span>
                  {row.tiebreakApplied && (
                    <span
                      title={row.tiebreakApplied}
                      className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-[#1c1c1c] text-[10px] font-bold italic text-[#8a8a8a]"
                    >
                      i
                    </span>
                  )}
                </div>
              </td>
              <td className="px-1 text-right font-bold text-[#f5f5f5]">{row.points}</td>
              <td className="px-1 text-right text-[#8a8a8a]">{row.played}</td>
              <td className="px-1 text-right text-[#8a8a8a]">{row.won}</td>
              <td className="px-1 text-right text-[#8a8a8a]">{row.drawn}</td>
              <td className="px-1 text-right text-[#8a8a8a]">{row.lost}</td>
              <td className="px-1 pr-1 text-right text-[#8a8a8a]">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
