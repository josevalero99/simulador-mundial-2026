import { describe, it, expect } from 'vitest'
import { rankThirds } from '../bestThirds'
import { GroupId, StandingRow } from '@/lib/types'

// Minimal StandingRow factory; only the fields used by ranking matter.
const row = (teamId: string, rank: number, points: number, gd = 0, gf = 0): StandingRow => ({
  teamId,
  played: 3,
  won: 0,
  drawn: 0,
  lost: 0,
  gf,
  ga: gf - gd,
  gd,
  points,
  rank,
})

const GROUPS: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

// Build a full standingsByGroup. Each group has 4 ranked rows. We only care about
// the rank-3 row; give each a distinct points value so ordering is unambiguous.
function buildStandings(thirdPoints: Record<GroupId, number>): Record<GroupId, StandingRow[]> {
  const out = {} as Record<GroupId, StandingRow[]>
  for (const g of GROUPS) {
    out[g] = [
      row(`${g}1`, 1, 9),
      row(`${g}2`, 2, 6),
      row(`${g}3`, 3, thirdPoints[g], 0, thirdPoints[g]),
      row(`${g}4`, 4, 0),
    ]
  }
  return out
}

const noTieFifa = () => 1

describe('rankThirds', () => {
  it('returns all 12 thirds in ranked order with exactly 8 qualified', () => {
    // Distinct descending points: A=12, B=11, ... L=1
    const pts = {} as Record<GroupId, number>
    GROUPS.forEach((g, i) => { pts[g] = 12 - i })
    const standings = buildStandings(pts)

    const result = rankThirds(standings, noTieFifa)
    expect(result).toHaveLength(12)
    expect(result.filter(t => t.qualified)).toHaveLength(8)

    // Highest points first -> group A, then B, ...
    expect(result.map(t => t.group)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'])
    // The 8 qualified are A..H
    expect(result.filter(t => t.qualified).map(t => t.group)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
    // Each entry carries the rank-3 row
    expect(result[0].row.teamId).toBe('A3')
    expect(result[0].row.rank).toBe(3)
  })

  it('orders by points desc, then gd desc, then gf desc', () => {
    const standings = buildStandings({} as Record<GroupId, number>)
    // Override three groups to a controlled set; same points, differing gd/gf.
    standings.A[2] = row('A3', 3, 5, 3, 7) // pts5 gd3 gf7
    standings.B[2] = row('B3', 3, 5, 3, 9) // pts5 gd3 gf9  -> beats A on gf
    standings.C[2] = row('C3', 3, 5, 5, 4) // pts5 gd5      -> beats both on gd
    // Make everyone else clearly lower so these three lead.
    for (const g of GROUPS) {
      if (g === 'A' || g === 'B' || g === 'C') continue
      standings[g][2] = row(`${g}3`, 3, 1, 0, 0)
    }
    const result = rankThirds(standings, noTieFifa)
    expect(result.slice(0, 3).map(t => t.group)).toEqual(['C', 'B', 'A'])
  })

  it('breaks an exact points/gd/gf tie by fifaRank ascending', () => {
    const standings = buildStandings({} as Record<GroupId, number>)
    // Two groups fully tied on points/gd/gf.
    standings.A[2] = row('A3', 3, 5, 2, 6)
    standings.B[2] = row('B3', 3, 5, 2, 6)
    for (const g of GROUPS) {
      if (g === 'A' || g === 'B') continue
      standings[g][2] = row(`${g}3`, 3, 1, 0, 0)
    }
    // B3 has a better (lower) fifa rank -> should come first.
    const fifa = (id: string) => (id === 'B3' ? 5 : id === 'A3' ? 10 : 100)
    const result = rankThirds(standings, fifa)
    expect(result.slice(0, 2).map(t => t.group)).toEqual(['B', 'A'])
  })
})
