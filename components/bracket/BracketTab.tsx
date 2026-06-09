'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { TEAMS } from '@/lib/data/teams'
import { rankGroup } from '@/lib/engine/tiebreakers'
import { resolveR32, buildBracket } from '@/lib/engine/bracket'
import { matchOutcomeProbs, runMonteCarlo } from '@/lib/engine/montecarlo'
import type { TeamProbs } from '@/lib/engine/montecarlo'
import type { GroupId, StandingRow } from '@/lib/types'
import type { KnockoutMatch, BracketState } from '@/lib/engine/bracket'
import Flag from '@/components/ui/Flag'
import { useOdds } from '@/components/odds/OddsProvider'
import { useFavorite } from '@/components/favorite/FavoriteProvider'
import BracketMatch from './BracketMatch'

const fifaRank = (id: string) => TEAMS[id]?.fifaRank ?? 999

/** Monte Carlo samples used for the favorite's road probabilities. */
const MC_SAMPLES = 1500

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

// The 6 knockout rounds, ordered, with their TeamProbs key and a short label.
const ROAD_STEPS: { key: keyof TeamProbs; label: string }[] = [
  { key: 'r32', label: '16avos' },
  { key: 'r16', label: '8vos' },
  { key: 'qf', label: '4tos' },
  { key: 'sf', label: 'Semis' },
  { key: 'final', label: 'Final' },
  { key: 'champion', label: 'Campeón' },
]

interface RoadPanelProps {
  favorite: string
  probs: TeamProbs | undefined
  bracket: BracketState
}

/** Walks the current bracket and lists the favorite's opponent per round. */
function projectedOpponents(favorite: string, bracket: BracketState) {
  const rounds: { label: string; matches: KnockoutMatch[] }[] = [
    { label: '16avos', matches: bracket.r32 },
    { label: '8vos', matches: bracket.r16 },
    { label: '4tos', matches: bracket.qf },
    { label: 'Semis', matches: bracket.sf },
    { label: 'Final', matches: [bracket.final] },
  ]
  const out: { label: string; opponent: string }[] = []
  for (const round of rounds) {
    const m = round.matches.find((g) => g.home === favorite || g.away === favorite)
    if (!m) break
    const opp = m.home === favorite ? m.away : m.home
    if (opp === null) break
    out.push({ label: round.label, opponent: opp })
  }
  return out
}

/** Favorite's road to the title: stepped cumulative probabilities + projected opponents. */
function RoadPanel({ favorite, probs, bracket }: RoadPanelProps) {
  const team = TEAMS[favorite]
  const opponents = projectedOpponents(favorite, bracket)

  return (
    <div className="mb-5 rounded-2xl border border-[#E8B84B]/30 bg-[#16161c]/55 backdrop-blur-xl p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#f5f5f5]">
        <span className="uppercase tracking-wider text-[#8a8a8a]">Camino al título</span>
        <span className="text-[#8a8a8a]">—</span>
        <Flag teamId={favorite} className="text-lg leading-none" />
        <span className="text-[#E8B84B]">{team?.name ?? favorite}</span>
      </h2>

      {/* Stepped road: cumulative probability per round. */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-[560px] items-stretch gap-2">
          {ROAD_STEPS.map((step) => {
            const p = probs ? probs[step.key] : 0
            const pct = Math.round(p * 100)
            const likely = p > 0.5
            return (
              <div
                key={step.key}
                className={[
                  'flex flex-1 flex-col gap-1.5 rounded-lg border p-2.5 transition-colors',
                  likely
                    ? 'border-[#E8B84B]/40 bg-[#E8B84B]/10'
                    : 'border-white/10 bg-white/[0.03]',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-[10px] font-semibold uppercase tracking-wider',
                    likely ? 'text-[#E8B84B]' : 'text-[#8a8a8a]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
                <span
                  className={[
                    'text-base font-bold tabular-nums',
                    likely ? 'text-[#f5f5f5]' : 'text-[#5a5a5a]',
                  ].join(' ')}
                >
                  {pct}%
                </span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={['h-full rounded-full', likely ? 'bg-[#E8B84B]' : 'bg-[#3CAC3B]'].join(
                      ' ',
                    )}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Projected opponents from the current bracket picks. */}
      <div className="mt-4">
        {opponents.length === 0 ? (
          <p className="text-sm text-[#8a8a8a]">
            {team?.name ?? favorite} no está en el cuadro con el escenario actual.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {opponents.map(({ label, opponent }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm"
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">
                  {label}:
                </span>
                <span className="text-[#8a8a8a]">vs</span>
                <Flag teamId={opponent} className="text-base leading-none" />
                <span className="text-[#f5f5f5]">{TEAMS[opponent]?.name ?? opponent}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Knockout bracket tab: pick winners round by round; downstream rounds recompute. */
export default function BracketTab() {
  const { state } = useStore()
  const matches = state.matches
  const { marketFn } = useOdds()
  const { favorite } = useFavorite()
  const [picks, setPicks] = useState<Record<number, string>>({})

  const remaining = matches.filter((m) => m.homeGoals === null || m.awayGoals === null).length
  const complete = remaining === 0

  // Monte Carlo for the favorite's road. Memoized on the fixed scores + favorite +
  // market so it only reruns when those change (acceptable cost on this tab).
  const matchesKey = useMemo(
    () => matches.map((m) => `${m.id}:${m.homeGoals}-${m.awayGoals}`).join('|'),
    [matches],
  )
  const mcProbs = useMemo<Record<string, TeamProbs> | null>(() => {
    if (!complete || !favorite) return null
    return runMonteCarlo(MC_SAMPLES, undefined, matches, marketFn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, favorite, matchesKey, marketFn])

  if (!complete) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-12 text-center">
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

  // Model favorite for a single tie (ignores draw — knockouts need a winner).
  const modelWinner = (home: string, away: string): string => {
    const p = matchOutcomeProbs(home, away, 0, undefined, marketFn)
    return p.home >= p.away ? home : away
  }

  // Seed every pick with the model's most-likely winner per match. Built through
  // buildBracket so later rounds use the chosen earlier-round winners.
  const fillMostProbable = () => {
    const auto: Record<number, string> = {}
    buildBracket(r32, (h, a, m) => {
      const w = modelWinner(h, a)
      auto[m] = w
      return w
    })
    setPicks(auto)
  }

  const champion = bracket.champion ? TEAMS[bracket.champion] : null

  // Show the road panel when a favorite is set and they're one of the 32 R32 teams.
  const favoriteInBracket =
    favorite !== null && r32.some((t) => t.home === favorite || t.away === favorite)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={fillMostProbable}
          className="rounded-lg bg-[#E8B84B] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f0c560]"
        >
          Cuadro más probable
        </button>
        <button
          type="button"
          onClick={() => setPicks({})}
          className="text-sm font-medium text-[#8a8a8a] transition-colors hover:text-[#f5f5f5]"
        >
          Reiniciar
        </button>
        <p className="text-sm text-[#8a8a8a]">
          Elige el ganador de cada cruce; las rondas siguientes se recalculan en cadena.
        </p>
      </div>

      {favoriteInBracket && (
        <RoadPanel favorite={favorite!} probs={mcProbs?.[favorite!]} bracket={bracket} />
      )}

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
