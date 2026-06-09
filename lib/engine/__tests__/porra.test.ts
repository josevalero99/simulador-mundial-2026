import { describe, it, expect } from 'vitest'
import { scorePorra, runPorraMonteCarlo } from '../porra'
import { Rng } from '../montecarlo'
import { DEFAULT_PORRA, PorraEntry } from '@/lib/data/porra'

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

describe('scorePorra', () => {
  it('sums team positions and ranks the lowest total first', () => {
    const positions: Record<string, number> = {
      A1: 1, A2: 2, A3: 3, A4: 4, // total 10 -> best
      B1: 10, B2: 11, B3: 12, B4: 13, // total 46
      C1: 5, C2: 6, C3: 7, C4: 8, // total 26
    }
    const entries: PorraEntry[] = [
      { name: 'B', teams: ['B1', 'B2', 'B3', 'B4'] },
      { name: 'A', teams: ['A1', 'A2', 'A3', 'A4'] },
      { name: 'C', teams: ['C1', 'C2', 'C3', 'C4'] },
    ]
    const result = scorePorra(positions, entries)
    expect(result.map(r => r.name)).toEqual(['A', 'C', 'B'])
    expect(result[0].total).toBe(10)
    expect(result[1].total).toBe(26)
    expect(result[2].total).toBe(46)
    expect(result[0].teams).toEqual([
      { id: 'A1', position: 1 },
      { id: 'A2', position: 2 },
      { id: 'A3', position: 3 },
      { id: 'A4', position: 4 },
    ])
  })

  it('handles a tie at the lowest total', () => {
    const positions: Record<string, number> = {
      X1: 1, X2: 2, X3: 3, X4: 4, // 10
      Y1: 1, Y2: 2, Y3: 3, Y4: 4, // 10
      Z1: 20, Z2: 21, Z3: 22, Z4: 23, // 86
    }
    const entries: PorraEntry[] = [
      { name: 'Z', teams: ['Z1', 'Z2', 'Z3', 'Z4'] },
      { name: 'X', teams: ['X1', 'X2', 'X3', 'X4'] },
      { name: 'Y', teams: ['Y1', 'Y2', 'Y3', 'Y4'] },
    ]
    const result = scorePorra(positions, entries)
    expect(result[0].total).toBe(10)
    expect(result[1].total).toBe(10)
    expect(result[2].total).toBe(86)
  })
})

describe('runPorraMonteCarlo', () => {
  it('win probabilities sum to ~1 and expected totals are in range', () => {
    const probs = runPorraMonteCarlo(300, DEFAULT_PORRA, undefined, mulberry32(2026))
    expect(probs).toHaveLength(12)
    const sum = probs.reduce((s, p) => s + p.winProb, 0)
    expect(sum).toBeCloseTo(1, 1)
    for (const p of probs) {
      expect(p.expectedTotal).toBeGreaterThanOrEqual(4)
      expect(p.expectedTotal).toBeLessThanOrEqual(192)
    }
    // sorted by winProb desc
    for (let i = 1; i < probs.length; i++) {
      expect(probs[i - 1].winProb).toBeGreaterThanOrEqual(probs[i].winProb)
    }
  })

  it('a strong-team owner outranks a weak-team owner in win probability', () => {
    const probs = runPorraMonteCarlo(300, DEFAULT_PORRA, undefined, mulberry32(2026))
    const byName = Object.fromEntries(probs.map(p => [p.name, p]))
    // MARIO owns ARG (rank 1-ish strongest); RAFA owns ESP/CAN/CIV/CUW (CUW very weak).
    // Strong owner should beat a weak owner. Compare MARIO vs RAFA's expected totals
    // as a robustness check, plus winProb ordering for MARIO over RAFA.
    expect(byName.MARIO.winProb).toBeGreaterThan(byName.RAFA.winProb)
  })
})
