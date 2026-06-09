'use client'

import { Info } from 'lucide-react'
import { useStore } from '@/lib/store'
import { GROUPS } from '@/lib/data/groups'
import { TEAMS } from '@/lib/data/teams'
import { rankGroup } from '@/lib/engine/tiebreakers'
import type { GroupId } from '@/lib/types'
import Flag from '@/components/ui/Flag'

const fifaRank = (id: string) => TEAMS[id]?.fifaRank ?? 999

/** Tailwind classes for a rank's numbered marker badge. */
function rankBadge(rank: number): string {
  if (rank === 1) return 'bg-[#E8B84B] text-black'
  if (rank === 2) return 'bg-[#3CAC3B] text-black'
  if (rank === 3) return 'bg-[#f59e0b] text-black'
  return 'bg-[#2a2a2a] text-[#8a8a8a]'
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
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${rankBadge(row.rank)}`}
                  >
                    {row.rank}
                  </span>
                  <Flag teamId={row.teamId} className="text-base leading-none" />
                  <span className="truncate text-[#f5f5f5]">{team?.name ?? row.teamId}</span>
                  {row.tiebreakApplied && (
                    <span
                      title={row.tiebreakApplied}
                      aria-label={`Desempate aplicado: ${row.tiebreakApplied}`}
                      className="inline-flex shrink-0 cursor-help items-center text-[#8a8a8a]"
                    >
                      <Info size={13} strokeWidth={2} aria-hidden="true" />
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
