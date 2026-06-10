import { describe, it, expect } from 'vitest'
import { simulateFinalRanking, finalPositions, mostLikelyFinalRanking } from '../finalRanking'
import { Rng } from '../montecarlo'
import { TEAMS } from '@/lib/data/teams'
import { generateFixtures } from '@/lib/data/fixtures'
import { Match } from '@/lib/types'

// Deterministic seeded RNG so all assertions are stable.
function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ALL_IDS = Object.keys(TEAMS)

describe('simulateFinalRanking', () => {
  it('returns all 48 team ids, distinct, equal to the TEAMS set', () => {
    const ranking = simulateFinalRanking(mulberry32(1))
    expect(ranking).toHaveLength(48)
    expect(new Set(ranking).size).toBe(48)
    expect(new Set(ranking)).toEqual(new Set(ALL_IDS))
  })

  it('is deterministic: same seed -> identical ranking', () => {
    const a = simulateFinalRanking(mulberry32(123))
    const b = simulateFinalRanking(mulberry32(123))
    expect(a).toEqual(b)
  })

  it('still produces a valid 48-team ranking with a heavily-fixed base', () => {
    // Fix group A entirely with lopsided deterministic scores.
    const fixtures = generateFixtures()
    const base: Match[] = fixtures.map(m => {
      if (m.group === 'A') {
        return { ...m, homeGoals: 3, awayGoals: 0 }
      }
      return m
    })
    const ranking = simulateFinalRanking(mulberry32(7), base)
    expect(ranking).toHaveLength(48)
    expect(new Set(ranking).size).toBe(48)
    expect(new Set(ranking)).toEqual(new Set(ALL_IDS))
  })
})

describe('finalPositions', () => {
  it('maps ids to 1..48 with no gaps or dupes; champion -> 1', () => {
    const ranking = simulateFinalRanking(mulberry32(99))
    const pos = finalPositions(ranking)
    expect(Object.keys(pos)).toHaveLength(48)
    const values = Object.values(pos).sort((x, y) => x - y)
    expect(values).toEqual(Array.from({ length: 48 }, (_, i) => i + 1))
    expect(pos[ranking[0]]).toBe(1)
    expect(pos[ranking[47]]).toBe(48)
  })
})

describe('mostLikelyFinalRanking', () => {
  it('returns a valid permutation of the 48 teams', () => {
    const ranking = mostLikelyFinalRanking(generateFixtures())
    expect(ranking).toHaveLength(48)
    expect(new Set(ranking).size).toBe(48)
    expect(new Set(ranking)).toEqual(new Set(ALL_IDS))
  })

  it('is deterministic: same input -> identical ranking', () => {
    const fixtures = generateFixtures()
    const a = mostLikelyFinalRanking(fixtures)
    const b = mostLikelyFinalRanking(fixtures)
    expect(a).toEqual(b)
  })

  it('respects fixed group results (pinning group A changes the ranking)', () => {
    const base: Match[] = generateFixtures().map(m =>
      m.group === 'A' ? { ...m, homeGoals: 3, awayGoals: 0 } : m,
    )
    const pinned = mostLikelyFinalRanking(base)
    const unpinned = mostLikelyFinalRanking(generateFixtures())
    expect(pinned).toHaveLength(48)
    expect(new Set(pinned).size).toBe(48)
    // Pinning group A to lopsided results must influence the final ranking.
    expect(pinned).not.toEqual(unpinned)
  })
})
