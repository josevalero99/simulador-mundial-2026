import { Match, GroupId, StandingRow } from '@/lib/types'
import { TEAMS } from '@/lib/data/teams'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { generateFixtures } from '@/lib/data/fixtures'
import { rankGroup } from './tiebreakers'
import { resolveR32, buildBracket, Tie, KnockoutMatch } from './bracket'
import { Rng, MarketFn, sampleScore, eloExpectedScore, mostLikelyScore, matchOutcomeProbs } from './montecarlo'

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

/** Fills an unplayed match with a concrete scoreline. */
type FillScore = (home: string, away: string) => { homeGoals: number; awayGoals: number }
/** Picks the winner of a knockout tie (no draws). */
type PickWinner = (home: string, away: string) => string

/**
 * Core ranking builder shared by the random and deterministic variants.
 * `base`, when supplied, pins the listed group matches' non-null scores;
 * remaining null group matches are filled via `fillScore`; knockout winners
 * (and the third-place match) are decided via `pickWinner`.
 *
 * @returns the 48 team ids ordered by final classification (index 0 = 1st).
 */
function buildRankingFromScenario(
  base: Match[] | undefined,
  fillScore: FillScore,
  pickWinner: PickWinner,
): string[] {
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

  // 2. Fill remaining null group matches.
  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) {
      const { homeGoals, awayGoals } = fillScore(m.home, m.away)
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
  const bracket = buildBracket(r32, (home, away) => pickWinner(home, away))

  const quality = byQuality(stats)
  const sortByQuality = (ids: string[]): string[] => [...ids].sort(quality)

  // 5. Build the ranking by tiers (best -> worst).
  const champion = bracket.champion
  if (champion === null) throw new Error('Bracket has no champion')

  const runnerUp = loserOf(bracket.final)

  const sfLosers = bracket.sf.map(loserOf)
  if (sfLosers.length !== 2) throw new Error('Expected exactly 2 SF matches')
  const thirdPlaceWinner = pickWinner(sfLosers[0], sfLosers[1])
  const thirdPlaceLoser = thirdPlaceWinner === sfLosers[0] ? sfLosers[1] : sfLosers[0]

  const qfLosers = sortByQuality(bracket.qf.map(loserOf))
  const r16Losers = sortByQuality(bracket.r16.map(loserOf))
  const r32Losers = sortByQuality(bracket.r32.map(loserOf))

  const inR32 = new Set<string>()
  for (const tie of r32) {
    inR32.add(tie.home)
    inR32.add(tie.away)
  }
  const eliminatedInGroup = sortByQuality(Object.keys(TEAMS).filter(id => !inR32.has(id)))

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

  if (ranking.length !== 48 || new Set(ranking).size !== 48) {
    throw new Error(
      `Final ranking is not a valid permutation of 48 teams (got ${ranking.length}, ${new Set(ranking).size} unique)`,
    )
  }

  return ranking
}

/**
 * Simulates one full tournament and derives the complete 1..48 final
 * classification using random scorelines and random knockout winners.
 */
export function simulateFinalRanking(rng: Rng, base?: Match[], market?: MarketFn): string[] {
  return buildRankingFromScenario(
    base,
    (home, away) => sampleScore(home, away, market, rng),
    (home, away) => (rng() < eloExpectedScore(home, away) ? home : away),
  )
}

/**
 * Builds the single most-likely 1..48 final classification for the current
 * scenario: unplayed group matches use the deterministic most-likely scoreline
 * and every knockout tie is won by the model's favorite (market-blended 1X2).
 * Fully deterministic — same `matches` in, same ranking out.
 */
export function mostLikelyFinalRanking(matches: Match[], market?: MarketFn): string[] {
  const modelWinner = (home: string, away: string): string => {
    const p = matchOutcomeProbs(home, away, 0, undefined, market)
    return p.home >= p.away ? home : away
  }
  return buildRankingFromScenario(matches, (h, a) => mostLikelyScore(h, a), modelWinner)
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
