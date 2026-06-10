import { describe, it, expect } from 'vitest'
import {
  expectedResult,
  simulateOnce,
  runMonteCarlo,
  matchOutcomeProbs,
  eloExpectedScore,
  eloOutcomeProbs,
  mostLikelyScore,
  MarketFn,
  Rng,
} from '../montecarlo'
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

describe('expectedResult', () => {
  it('a much stronger home team wins clearly more than half the time', () => {
    const rng = mulberry32(42)
    let homeWins = 0
    let awayWins = 0
    const N = 2000
    for (let i = 0; i < N; i++) {
      // ARG (1885 pts, strong) at home vs NZL (1300 pts, weak). The legacy
      // fifaRank callback is now ignored; strength comes from FIFA Elo points.
      const { homeGoals, awayGoals } = expectedResult('ARG', 'NZL', undefined, rng)
      if (homeGoals > awayGoals) homeWins++
      else if (awayGoals > homeGoals) awayWins++
    }
    expect(homeWins).toBeGreaterThan(N / 2)
    expect(homeWins).toBeGreaterThan(awayWins)
  })
})

describe('eloExpectedScore', () => {
  it('a much higher-rated team has E > 0.5', () => {
    // ARG 1885 vs NZL 1300
    expect(eloExpectedScore('ARG', 'NZL')).toBeGreaterThan(0.5)
  })

  it('equal points -> 0.5', () => {
    // CRO (1716) is a real team; compare a team against itself => equal points.
    expect(eloExpectedScore('CRO', 'CRO')).toBeCloseTo(0.5, 10)
  })
})

describe('eloOutcomeProbs', () => {
  it('home/draw/away sum to ~1', () => {
    const p = eloOutcomeProbs('ARG', 'NZL')
    expect(p.home + p.draw + p.away).toBeCloseTo(1, 5)
  })

  it('the stronger home team has higher home prob than away prob', () => {
    const p = eloOutcomeProbs('ARG', 'NZL')
    expect(p.home).toBeGreaterThan(p.away)
  })

  it('closer ratings produce a higher draw share than a big mismatch', () => {
    // ESP 1875 vs FRA 1870 (almost equal) vs ARG 1885 vs NZL 1300 (huge gap).
    const close = eloOutcomeProbs('ESP', 'FRA')
    const mismatch = eloOutcomeProbs('ARG', 'NZL')
    expect(close.draw).toBeGreaterThan(mismatch.draw)
  })
})

describe('matchOutcomeProbs blend', () => {
  it('is exactly the 50/50 average of elo and a fixed market', () => {
    const market: MarketFn = () => ({ home: 0.6, draw: 0.25, away: 0.15 })
    const elo = eloOutcomeProbs('GER', 'JPN')
    const blended = matchOutcomeProbs('GER', 'JPN', undefined, undefined, market)
    expect(blended.home).toBeCloseTo((elo.home + 0.6) / 2, 6)
    expect(blended.draw).toBeCloseTo((elo.draw + 0.25) / 2, 6)
    expect(blended.away).toBeCloseTo((elo.away + 0.15) / 2, 6)
  })

  it('without a market returns the pure Elo probabilities', () => {
    const elo = eloOutcomeProbs('GER', 'JPN')
    const probs = matchOutcomeProbs('GER', 'JPN')
    expect(probs.home).toBeCloseTo(elo.home, 6)
    expect(probs.draw).toBeCloseTo(elo.draw, 6)
    expect(probs.away).toBeCloseTo(elo.away, 6)
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

  it('a market making a weak team a heavy favorite increases its advancement', () => {
    // NZL is the weakest team (1300 pts) in group G. A market that makes NZL a
    // heavy favorite whenever it plays should raise its r32 (advancement) prob.
    const market: MarketFn = (home, away) => {
      if (home === 'NZL') return { home: 0.85, draw: 0.1, away: 0.05 }
      if (away === 'NZL') return { home: 0.05, draw: 0.1, away: 0.85 }
      return null
    }
    const base = runMonteCarlo(500, mulberry32(2026))
    const withMarket = runMonteCarlo(500, mulberry32(2026), undefined, market)
    expect(withMarket['NZL'].r32).toBeGreaterThan(base['NZL'].r32)
  })
})

describe('matchOutcomeProbs', () => {
  it('home/draw/away probabilities sum to ~1', () => {
    const rng = mulberry32(11)
    const p = matchOutcomeProbs('ARG', 'NZL', 1000, rng)
    expect(p.home + p.draw + p.away).toBeCloseTo(1, 5)
  })

  it('a much stronger home team wins more often than the weak away team', () => {
    const rng = mulberry32(33)
    // ARG (rank 1) at home vs NZL (rank 86) away.
    const p = matchOutcomeProbs('ARG', 'NZL', 1000, rng)
    expect(p.home).toBeGreaterThan(p.away)
  })
})

describe('mostLikelyScore', () => {
  it('is deterministic and returns non-negative integers', () => {
    const a = mostLikelyScore('ARG', 'NZL')
    const b = mostLikelyScore('ARG', 'NZL')
    expect(a).toEqual(b)
    expect(Number.isInteger(a.homeGoals)).toBe(true)
    expect(Number.isInteger(a.awayGoals)).toBe(true)
    expect(a.homeGoals).toBeGreaterThanOrEqual(0)
    expect(a.awayGoals).toBeGreaterThanOrEqual(0)
  })

  it('gives the stronger side at least as many goals', () => {
    // ARG (1885 pts) is much stronger than HAI (1315 pts).
    const s = mostLikelyScore('ARG', 'HAI')
    expect(s.homeGoals).toBeGreaterThanOrEqual(s.awayGoals)
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
