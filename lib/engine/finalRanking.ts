import { Match, GroupId, StandingRow } from '@/lib/types'
import { TEAMS } from '@/lib/data/teams'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { generateFixtures } from '@/lib/data/fixtures'
import { rankGroup } from './tiebreakers'
import { resolveR32, buildBracket, Tie, KnockoutMatch } from './bracket'
import { Rng, MarketFn, sampleScore, eloExpectedScore } from './montecarlo'

/** Per-team group-stage stats used to break ties within a tier. */
interface GroupStats {
  points: number
  gd: number
  gf: number
}

/**
 * Comparator that sorts team ids by descending group-stage quality:
 *   higher points, then higher gd, then higher gf, then LOWER fifaRank.
 * Better teams sort earlier (so they get the smaller position within a tier).
 */
function byQuality(stats: Record<string, GroupStats>): (a: string, b: string) => number {
  return (a, b) => {
    const sa = stats[a]
    const sb = stats[b]
    if (sb.points !== sa.points) return sb.points - sa.points
    if (sb.gd !== sa.gd) return sb.gd - sa.gd
    if (sb.gf !== sa.gf) return sb.gf - sa.gf
    return TEAMS[a].fifaRank - TEAMS[b].fifaRank
  }
}

/** Loser of a knockout match (the side that is not the winner). */
function loserOf(m: KnockoutMatch): string {
  if (m.winner === null) throw new Error(`Match ${m.match} has no winner`)
  const loser = m.winner === m.home ? m.away : m.home
  if (loser === null) throw new Error(`Match ${m.match} has no loser`)
  return loser
}

/**
 * Simulates one full tournament and derives the complete 1..48 final
 * classification. Mirrors `simulateOnce` steps 1–4 to build the bracket, then
 * assembles the ranking tier by tier (best -> worst). `base`, when supplied,
 * pins the listed group matches' non-null scores (same semantics as elsewhere).
 *
 * @returns the 48 team ids ordered by final classification (index 0 = 1st).
 */
export function simulateFinalRanking(rng: Rng, base?: Match[], market?: MarketFn): string[] {
  const fifaRank = (id: string): number => TEAMS[id].fifaRank

  // 1. Canonical fixtures + fixed scores from `base`.
  const matches = generateFixtures()
  if (base) {
    const fixed = new Map<string, [number, number]>()
    for (const m of base) {
      if (m.homeGoals !== null && m.awayGoals !== null) {
        fixed.set(m.id, [m.homeGoals, m.awayGoals])
      }
    }
    for (const m of matches) {
      const f = fixed.get(m.id)
      if (f) {
        m.homeGoals = f[0]
        m.awayGoals = f[1]
      }
    }
  }

  // 2. Fill remaining null group matches via the (market-blended) Elo model.
  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) {
      const { homeGoals, awayGoals } = sampleScore(m.home, m.away, market, rng)
      m.homeGoals = homeGoals
      m.awayGoals = awayGoals
    }
  }

  // 3. Rank each group.
  const standingsByGroup = {} as Record<GroupId, StandingRow[]>
  const matchesByGroup = new Map<GroupId, Match[]>()
  for (const g of GROUP_IDS) matchesByGroup.set(g, [])
  for (const m of matches) matchesByGroup.get(m.group)!.push(m)
  for (const g of GROUP_IDS) {
    standingsByGroup[g] = rankGroup(GROUPS[g], matchesByGroup.get(g)!, fifaRank)
  }

  // Per-team group stats for tier tiebreaks.
  const stats: Record<string, GroupStats> = {}
  for (const g of GROUP_IDS) {
    for (const row of standingsByGroup[g]) {
      stats[row.teamId] = { points: row.points, gd: row.gd, gf: row.gf }
    }
  }

  // 4. Resolve R32 and build the bracket.
  const r32: Tie[] = resolveR32(standingsByGroup, fifaRank)
  const pickWinner = (home: string, away: string): string =>
    rng() < eloExpectedScore(home, away) ? home : away
  const bracket = buildBracket(r32, pickWinner)

  const quality = byQuality(stats)
  const sortByQuality = (ids: string[]): string[] => [...ids].sort(quality)

  // 5. Build the ranking by tiers (best -> worst).
  const champion = bracket.champion
  if (champion === null) throw new Error('Bracket has no champion')

  // 2nd = loser of the final.
  const runnerUp = loserOf(bracket.final)

  // 3rd / 4th = the two SF losers, decided by a third-place match.
  const sfLosers = bracket.sf.map(loserOf)
  if (sfLosers.length !== 2) throw new Error('Expected exactly 2 SF matches')
  const thirdPlaceWinner = pickWinner(sfLosers[0], sfLosers[1])
  const thirdPlaceLoser = thirdPlaceWinner === sfLosers[0] ? sfLosers[1] : sfLosers[0]

  // 5th–8th: QF losers by group stats.
  const qfLosers = sortByQuality(bracket.qf.map(loserOf))
  // 9th–16th: R16 losers by group stats.
  const r16Losers = sortByQuality(bracket.r16.map(loserOf))
  // 17th–32nd: R32 losers by group stats.
  const r32Losers = sortByQuality(bracket.r32.map(loserOf))

  // 33rd–48th: teams that never reached R32 (all minus the 32 in R32 ties).
  const inR32 = new Set<string>()
  for (const tie of r32) {
    inR32.add(tie.home)
    inR32.add(tie.away)
  }
  const eliminatedInGroup = sortByQuality(
    Object.keys(TEAMS).filter(id => !inR32.has(id)),
  )

  const ranking: string[] = [
    champion,
    runnerUp,
    thirdPlaceWinner,
    thirdPlaceLoser,
    ...qfLosers,
    ...r16Losers,
    ...r32Losers,
    ...eliminatedInGroup,
  ]

  // Sanity: exactly the 48 team ids, each once.
  if (ranking.length !== 48 || new Set(ranking).size !== 48) {
    throw new Error(`Final ranking is not a valid permutation of 48 teams (got ${ranking.length}, ${new Set(ranking).size} unique)`)
  }

  return ranking
}

/**
 * Maps each team id to its 1-based final position (ranking[0] -> 1).
 */
export function finalPositions(ranking: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  ranking.forEach((id, i) => {
    out[id] = i + 1
  })
  return out
}
