import { describe, it, expect } from 'vitest'
import { resolveR32 } from '../bracket'
import { THIRDS_ALLOCATION } from '@/lib/data/thirdsAllocation'
import { GroupId, StandingRow } from '@/lib/types'

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

// Each group has rows ranked 1..4. Team ids are `<group><rank>` e.g. 'A1','A2','A3'.
// Thirds: A–H get 9 points, I–L get 3 points, so qualifying combo is exactly A–H.
function buildStandings(): Record<GroupId, StandingRow[]> {
  const out = {} as Record<GroupId, StandingRow[]>
  for (const g of GROUPS) {
    const thirdPts = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(g) ? 9 : 3
    out[g] = [
      row(`${g}1`, 1, 18),
      row(`${g}2`, 2, 12),
      row(`${g}3`, 3, thirdPts),
      row(`${g}4`, 4, 0),
    ]
  }
  return out
}

const fifa = () => 1

describe('resolveR32', () => {
  it('produces 16 ties ordered by match number 73..88', () => {
    const ties = resolveR32(buildStandings(), fifa)
    expect(ties).toHaveLength(16)
    expect(ties.map(t => t.match)).toEqual([73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88])
  })

  it('resolves positional slots (match 73 = 2nd-of-A vs 2nd-of-B)', () => {
    const ties = resolveR32(buildStandings(), fifa)
    const m73 = ties.find(t => t.match === 73)!
    expect(m73.home).toBe('A2')
    expect(m73.away).toBe('B2')

    // Match 74: 1st-of-C (home) vs 2nd-of-F (away)
    const m74 = ties.find(t => t.match === 74)!
    expect(m74.home).toBe('C1')
    expect(m74.away).toBe('F2')
  })

  it('resolves third-place slots via THIRDS_ALLOCATION for combo ABCDEFGH', () => {
    const ties = resolveR32(buildStandings(), fifa)
    const allocation = THIRDS_ALLOCATION['ABCDEFGH']

    // Match 79 away = rank-3 team of the allocated source group.
    const m79 = ties.find(t => t.match === 79)!
    const src79 = allocation[79] // 'H'
    expect(m79.away).toBe(`${src79}3`)
    expect(m79.home).toBe('A1') // match 79 home is 1st-of-A

    // Match 75 away = 3rd of allocation[75].
    const m75 = ties.find(t => t.match === 75)!
    expect(m75.away).toBe(`${allocation[75]}3`)
    expect(m75.home).toBe('E1') // match 75 home is 1st-of-E
  })
})
