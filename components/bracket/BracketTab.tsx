'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { TEAMS } from '@/lib/data/teams'
import { rankGroup } from '@/lib/engine/tiebreakers'
import { resolveR32, buildBracket } from '@/lib/engine/bracket'
import type { GroupId, StandingRow } from '@/lib/types'
import type { KnockoutMatch } from '@/lib/engine/bracket'
import Flag from '@/components/ui/Flag'
import BracketMatch from './BracketMatch'

const fifaRank = (id: string) => TEAMS[id]?.fifaRank ?? 999

interface ColumnProps {
  title: string
  matches: KnockoutMatch[]
  onPick: (match: number, winner: string) => void
}

function Column({ title, matches, onPick }: ColumnProps) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">{title}</h3>
      <div className="flex flex-1 flex-col justify-around gap-3">
        {matches.map((m) => (
          <BracketMatch key={m.match} match={m} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

/** Knockout bracket tab: pick winners round by round; downstream rounds recompute. */
export default function BracketTab() {
  const { state } = useStore()
  const matches = state.matches
  const [picks, setPicks] = useState<Record<number, string>>({})

  const remaining = matches.filter((m) => m.homeGoals === null || m.awayGoals === null).length
  const complete = remaining === 0

  if (!complete) {
    return (
      <div className="rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center">
        <p className="text-lg font-medium text-[#f5f5f5]">
          Completa la fase de grupos para ver el cuadro de eliminatorias.
        </p>
        <p className="mt-2 text-sm text-[#8a8a8a]">
          Quedan {remaining} {remaining === 1 ? 'partido' : 'partidos'} por jugar.
        </p>
      </div>
    )
  }

  const standingsByGroup = Object.fromEntries(
    GROUP_IDS.map((g) => [
      g,
      rankGroup(GROUPS[g], matches.filter((m) => m.group === g), fifaRank),
    ]),
  ) as Record<GroupId, StandingRow[]>

  const r32 = resolveR32(standingsByGroup, fifaRank)

  const pickWinner = (home: string, away: string, match: number): string => {
    const p = picks[match]
    return p === home || p === away ? p : home
  }

  const bracket = buildBracket(r32, pickWinner)

  const onPick = (match: number, winner: string) => {
    setPicks((prev) => ({ ...prev, [match]: winner }))
  }

  const champion = bracket.champion ? TEAMS[bracket.champion] : null

  return (
    <div>
      <p className="mb-5 text-sm text-[#8a8a8a]">
        Elige el ganador de cada cruce; las rondas siguientes se recalculan en cadena.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[960px] items-stretch gap-4">
          <Column title="16avos" matches={bracket.r32} onPick={onPick} />
          <Column title="8vos" matches={bracket.r16} onPick={onPick} />
          <Column title="4tos" matches={bracket.qf} onPick={onPick} />
          <Column title="Semis" matches={bracket.sf} onPick={onPick} />
          <div className="flex min-w-[180px] flex-1 flex-col">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
              Final
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              <BracketMatch match={bracket.final} onPick={onPick} />
              <div className="rounded-lg border border-[#E8B84B]/40 bg-[#E8B84B]/10 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#E8B84B]">
                  Campeón
                </p>
                {champion ? (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Flag teamId={champion.id} className="text-2xl leading-none" />
                    <span className="text-base font-bold text-[#f5f5f5]">{champion.name}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#5a5a5a]">Por definir</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
