import { GroupId, StandingRow } from '@/lib/types'
import { THIRDS_ALLOCATION } from '@/lib/data/thirdsAllocation'
import { R32, Slot, R16, QF, SF, FINAL, BracketEdge } from '@/lib/data/r32'
import { rankThirds } from './bestThirds'

/**
 * Maps each third-slot R32 match number to the group whose 3rd-placed team plays
 * there, for a given set of 8 qualifying groups. The combo is sorted & joined into
 * the THIRDS_ALLOCATION key.
 * @throws if no allocation exists for the combination (e.g. wrong number of groups).
 */
export function allocateThirds(qualifyingGroups: GroupId[]): Record<number, GroupId> {
  const key = [...qualifyingGroups].sort().join('')
  const allocation = THIRDS_ALLOCATION[key]
  if (!allocation) throw new Error('No allocation for combination: ' + key)
  return allocation
}

export interface Tie {
  match: number
  home: string
  away: string
}

/**
 * Resolves every R32 pairing into concrete team ids.
 * - 'pos' slot -> the team in that group whose rank matches the slot.
 * - 'third' slot -> rank the 12 thirds, take the 8 qualifying groups, allocate them
 *   to the third-slot match numbers, then read the source group's rank-3 team.
 * Returns 16 ties ordered by match number (73..88).
 */
export function resolveR32(
  standingsByGroup: Record<GroupId, StandingRow[]>,
  fifaRank: (teamId: string) => number,
): Tie[] {
  const qualifyingGroups = rankThirds(standingsByGroup, fifaRank)
    .filter(t => t.qualified)
    .map(t => t.group)
  const allocation = allocateThirds(qualifyingGroups)

  const teamFor = (match: number, slot: Slot): string => {
    if (slot.kind === 'pos') {
      const r = standingsByGroup[slot.group].find(row => row.rank === slot.rank)
      if (!r) throw new Error(`No rank-${slot.rank} team in group ${slot.group}`)
      return r.teamId
    }
    const sourceGroup = allocation[match]
    if (!sourceGroup) throw new Error(`No third-place allocation for match ${match}`)
    const r = standingsByGroup[sourceGroup].find(row => row.rank === 3)
    if (!r) throw new Error(`No rank-3 team in group ${sourceGroup}`)
    return r.teamId
  }

  return R32.map(({ match, home, away }) => ({
    match,
    home: teamFor(match, home),
    away: teamFor(match, away),
  }))
}

export interface KnockoutMatch {
  match: number
  home: string | null
  away: string | null
  winner: string | null
}

export interface BracketState {
  r32: KnockoutMatch[]
  r16: KnockoutMatch[]
  qf: KnockoutMatch[]
  sf: KnockoutMatch[]
  final: KnockoutMatch
  champion: string | null
}

type PickWinner = (home: string, away: string, match: number) => string

/**
 * Builds the full knockout bracket from the 16 R32 ties.
 * R32 matches are seeded directly from the ties; each subsequent round is built
 * from its BracketEdge (home = winner of from[0], away = winner of from[1]).
 * Adjacency comes entirely from the imported R16/QF/SF/FINAL edges.
 */
export function buildBracket(r32Ties: Tie[], pickWinner: PickWinner): BracketState {
  const winners = new Map<number, string>()

  const r32: KnockoutMatch[] = r32Ties.map(({ match, home, away }) => {
    const winner = pickWinner(home, away, match)
    winners.set(match, winner)
    return { match, home, away, winner }
  })

  const buildRound = (edges: readonly BracketEdge[]): KnockoutMatch[] =>
    edges.map(({ match, from }) => {
      const home = winners.get(from[0]) ?? null
      const away = winners.get(from[1]) ?? null
      const winner = home !== null && away !== null ? pickWinner(home, away, match) : null
      if (winner !== null) winners.set(match, winner)
      return { match, home, away, winner }
    })

  const r16 = buildRound(R16)
  const qf = buildRound(QF)
  const sf = buildRound(SF)
  const [final] = buildRound([FINAL])

  return { r32, r16, qf, sf, final, champion: final.winner }
}
