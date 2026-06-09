'use client'

import { useStore } from '@/lib/store'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { TEAMS } from '@/lib/data/teams'
import { rankGroup } from '@/lib/engine/tiebreakers'
import { rankThirds } from '@/lib/engine/bestThirds'
import type { GroupId, StandingRow } from '@/lib/types'
import Flag from '@/components/ui/Flag'
import Pill from '@/components/ui/Pill'

const fifaRank = (id: string) => TEAMS[id]?.fifaRank ?? 999

/** Best-thirds tab: ranks the 12 group third-placed teams; top 8 qualify. */
export default function ThirdsTab() {
  const { state } = useStore()
  const matches = state.matches

  const standingsByGroup = Object.fromEntries(
    GROUP_IDS.map((g) => [
      g,
      rankGroup(GROUPS[g], matches.filter((m) => m.group === g), fifaRank),
    ]),
  ) as Record<GroupId, StandingRow[]>

  const thirds = rankThirds(standingsByGroup, fifaRank)

  return (
    <div className="rounded-2xl border border-[#262626] bg-[#141414] p-4 sm:p-6">
      <h2 className="text-base font-semibold text-[#f5f5f5]">Mejores terceros</h2>
      <p className="mt-1 text-sm text-[#8a8a8a]">
        Los 8 mejores terceros avanzan a dieciseisavos. Se ordenan por puntos, diferencia de goles,
        goles a favor y, por último, ranking FIFA.
      </p>

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
            <th className="px-1 py-1.5 text-left font-medium">#</th>
            <th className="px-1 text-left font-medium">Grupo</th>
            <th className="py-1.5 pl-1 text-left font-medium">Equipo</th>
            <th className="px-1 text-right font-medium">Pts</th>
            <th className="px-1 text-right font-medium">DG</th>
            <th className="px-1 text-right font-medium">GF</th>
            <th className="px-1 pr-1 text-right font-medium" />
          </tr>
        </thead>
        <tbody>
          {thirds.map((t, i) => {
            const team = TEAMS[t.row.teamId]
            return (
              <tr
                key={t.group}
                className={[
                  'border-t border-[#262626]',
                  t.qualified ? 'bg-[#3CAC3B]/10' : 'opacity-50',
                ].join(' ')}
              >
                <td className="px-1 py-2 text-left font-bold text-[#f5f5f5]">{i + 1}</td>
                <td className="px-1 text-left text-[#8a8a8a]">{t.group}</td>
                <td className="py-2 pl-1">
                  <div className="flex items-center gap-2">
                    <Flag teamId={t.row.teamId} className="text-base leading-none" />
                    <span className="truncate text-[#f5f5f5]">{team?.name ?? t.row.teamId}</span>
                  </div>
                </td>
                <td className="px-1 text-right font-bold text-[#f5f5f5]">{t.row.points}</td>
                <td className="px-1 text-right text-[#8a8a8a]">
                  {t.row.gd > 0 ? `+${t.row.gd}` : t.row.gd}
                </td>
                <td className="px-1 text-right text-[#8a8a8a]">{t.row.gf}</td>
                <td className="px-1 pr-1 text-right">
                  {t.qualified ? (
                    <Pill color="green" className="px-2 py-0.5">
                      Clasificado
                    </Pill>
                  ) : (
                    <Pill color="gray" className="px-2 py-0.5">
                      Eliminado
                    </Pill>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
