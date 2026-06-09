import { describe, it, expect } from 'vitest'
import { expectedResult, simulateOnce, runMonteCarlo, Rng } from '../montecarlo'
import { TEAMS } from '@/lib/data/teams'
import { GROUPS } from '@/lib/data/groups'
import { generateFixtures } from '@/lib/data/fixtures'

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

const fifaRank = (id: string) => TEAMS[id].fifaRank

describe('expectedResult', () => {
  it('a much stronger home team wins clearly more than half the time', () => {
    const rng = mulberry32(42)
    let homeWins = 0
    let awayWins = 0
    const N = 2000
    for (let i = 0; i < N; i++) {
      // home rank 1 (strong) vs away rank 99 (weak)
      const { homeGoals, awayGoals } = expectedResult(
        'STRONG',
        'WEAK',
        (id) => (id === 'STRONG' ? 1 : 99),
        rng,
      )
      if (homeGoals > awayGoals) homeWins++
      else if (awayGoals > homeGoals) awayWins++
    }
    expect(homeWins).toBeGreaterThan(N / 2)
    expect(homeWins).toBeGreaterThan(awayWins)
  })
})

describe('runMonteCarlo', () => {
  it('champion probabilities across all teams sum to ~1', () => {
    const rng = mulberry32(7)
    const probs = runMonteCarlo(300, rng)
    const total = Object.values(probs).reduce((s, p) => s + p.champion, 0)
    expect(total).toBeCloseTo(1, 1)
  })

  it('every team has cumulative monotonic stage probabilities', () => {
    const rng = mulberry32(123)
    const probs = runMonteCarlo(300, rng)
    for (const [, p] of Object.entries(probs)) {
      expect(p.r32).toBeGreaterThanOrEqual(p.r16)
      expect(p.r16).toBeGreaterThanOrEqual(p.qf)
      expect(p.qf).toBeGreaterThanOrEqual(p.sf)
      expect(p.sf).toBeGreaterThanOrEqual(p.final)
      expect(p.final).toBeGreaterThanOrEqual(p.champion)
    }
  })

  it('a strong team is more likely to be champion than a weak team', () => {
    const rng = mulberry32(99)
    const probs = runMonteCarlo(400, rng)
    expect(probs['ARG'].champion).toBeGreaterThan(probs['NZL'].champion)
  })
})

describe('simulateOnce with base seeding', () => {
  it('respects fixed non-null scores from base', () => {
    // Fully fix every match in group A with deterministic lopsided results so the
    // group A standings are deterministic regardless of rng.
    const base = generateFixtures()
    const [a0, a1, a2, a3] = GROUPS.A
    const fixed = new Map<string, [number, number]>()
    // Make a clear ordering: a0 beats everyone, a1 second, a2 third, a3 last.
    const setScore = (home: string, away: string, hg: number, ag: number) => {
      for (const m of base) {
        if (m.group === 'A' && m.home === home && m.away === away) {
          m.homeGoals = hg
          m.awayGoals = ag
        }
        if (m.group === 'A' && m.home === away && m.away === home) {
          m.homeGoals = ag
          m.awayGoals = hg
        }
      }
    }
    setScore(a0, a1, 3, 0)
    setScore(a0, a2, 3, 0)
    setScore(a0, a3, 3, 0)
    setScore(a1, a2, 2, 0)
    setScore(a1, a3, 2, 0)
    setScore(a2, a3, 1, 0)
    void fixed

    // Run several seeded simulations; group A standings must be identical each time.
    for (const seed of [1, 2, 3, 4, 5]) {
      const res = simulateOnce(mulberry32(seed), base)
      // a0 won all 3 group games -> reaches at least r32 (group winners always qualify)
      expect(res.reached[a0]).not.toBe('group')
      // a3 lost all 3 -> finished last in group -> stays at 'group'
      expect(res.reached[a3]).toBe('group')
    }
  })
})
