import { Match, StandingRow } from '@/lib/types'
import { computeStandings } from './standings'

/**
 * Ranks a group applying the official FIFA 2026 group tiebreak criteria, in order:
 *   1. Points (desc)
 *   2. Goal difference across all group matches (desc)
 *   3. Goals scored across all group matches (desc)
 *   4. Among the set of teams STILL equal on (points, gd, gf): a head-to-head
 *      mini-table using ONLY the matches played between those tied teams —
 *      (a) h2h points desc, (b) h2h goal difference desc, (c) h2h goals scored desc.
 *   5. Fair play — not modeled (skipped).
 *   6. FIFA ranking — lower number ranks higher (final separator).
 *
 * Returns rows sorted best-first with rank = 1..n and an explainable
 * `tiebreakApplied` label on each row that needed a criterion beyond points to
 * separate it from the immediately lower-ranked row.
 */
export function rankGroup(
  teamIds: string[],
  matches: Match[],
  fifaRank: (teamId: string) => number,
): StandingRow[] {
  const overall = computeStandings(teamIds, matches)
  const byId = new Map(overall.map(r => [r.teamId, r]))

  // Step 1: group teams that are equal on the overall (points, gd, gf) triple.
  // Within each such group the head-to-head mini-table is restricted to matches
  // played only between members of that group.
  const overallKey = (r: StandingRow) => `${r.points}|${r.gd}|${r.gf}`

  // h2h mini-table stats for a given subset of team ids.
  const h2hStats = (subset: string[]): Map<string, { points: number; gd: number; gf: number }> => {
    const members = new Set(subset)
    const seed = computeStandings(subset, matches.filter(mt => members.has(mt.home) && members.has(mt.away)))
    return new Map(seed.map(r => [r.teamId, { points: r.points, gd: r.gd, gf: r.gf }]))
  }

  // Build, per team, an h2h record relative to the set of teams sharing its
  // overall (points, gd, gf) key.
  const clusters = new Map<string, string[]>()
  for (const r of overall) {
    const k = overallKey(r)
    if (!clusters.has(k)) clusters.set(k, [])
    clusters.get(k)!.push(r.teamId)
  }
  const h2hByTeam = new Map<string, { points: number; gd: number; gf: number }>()
  for (const [, subset] of clusters) {
    const stats = h2hStats(subset)
    for (const id of subset) h2hByTeam.set(id, stats.get(id)!)
  }

  const sorted = [...overall].sort((a, b) => compare(a, b))

  function compare(a: StandingRow, b: StandingRow): number {
    if (a.points !== b.points) return b.points - a.points
    if (a.gd !== b.gd) return b.gd - a.gd
    if (a.gf !== b.gf) return b.gf - a.gf
    // Equal on overall (points, gd, gf): head-to-head mini-table among the tied set.
    const ha = h2hByTeam.get(a.teamId)!
    const hb = h2hByTeam.get(b.teamId)!
    if (ha.points !== hb.points) return hb.points - ha.points
    if (ha.gd !== hb.gd) return hb.gd - ha.gd
    if (ha.gf !== hb.gf) return hb.gf - ha.gf
    // Fair play not modeled. Final separator: FIFA ranking (lower = better).
    return fifaRank(a.teamId) - fifaRank(b.teamId)
  }

  // Determine the first criterion that separates `higher` from the immediately
  // lower-ranked `lower`. Only meaningful when their points are equal.
  function separatingLabel(higher: StandingRow, lower: StandingRow): string | undefined {
    if (higher.points !== lower.points) return undefined
    if (higher.gd !== lower.gd) return 'Diferencia de goles'
    if (higher.gf !== lower.gf) return 'Goles a favor'
    const hh = h2hByTeam.get(higher.teamId)!
    const hl = h2hByTeam.get(lower.teamId)!
    if (hh.points !== hl.points || hh.gd !== hl.gd || hh.gf !== hl.gf) return 'Enfrentamiento directo'
    return 'Ranking FIFA'
  }

  return sorted.map((row, i) => {
    const result: StandingRow = { ...row, rank: i + 1, tiebreakApplied: undefined }
    const lower = sorted[i + 1]
    if (lower) {
      const label = separatingLabel(row, lower)
      if (label) result.tiebreakApplied = label
    }
    return result
  })
}
