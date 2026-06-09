import { describe, it, expect } from 'vitest'
import {
  initialState,
  reducer,
  rankingResult,
  parseStored,
  type AppState,
} from './store'
import type { Match } from '@/lib/types'

function seededRng(seed: number): () => number {
  // simple deterministic LCG
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

describe('initialState', () => {
  it('produces 72 matches all with null scores', () => {
    const s = initialState()
    expect(s.matches).toHaveLength(72)
    expect(s.matches.every((m) => m.homeGoals === null && m.awayGoals === null)).toBe(true)
  })
})

describe('SET_SCORE', () => {
  it('updates only the targeted match, leaves others null, immutably', () => {
    const s = initialState()
    const target = s.matches[5]
    const next = reducer(s, {
      type: 'SET_SCORE',
      id: target.id,
      homeGoals: 2,
      awayGoals: 1,
    })

    const updated = next.matches.find((m) => m.id === target.id)!
    expect(updated.homeGoals).toBe(2)
    expect(updated.awayGoals).toBe(1)

    // every other match still null
    expect(
      next.matches
        .filter((m) => m.id !== target.id)
        .every((m) => m.homeGoals === null && m.awayGoals === null),
    ).toBe(true)

    // original state not mutated
    expect(s.matches[5].homeGoals).toBe(null)
    expect(next).not.toBe(s)
    expect(next.matches).not.toBe(s.matches)
  })

  it('can set scores back to null', () => {
    const s = initialState()
    const id = s.matches[0].id
    const filled = reducer(s, { type: 'SET_SCORE', id, homeGoals: 3, awayGoals: 0 })
    const cleared = reducer(filled, { type: 'SET_SCORE', id, homeGoals: null, awayGoals: null })
    const m = cleared.matches.find((x) => x.id === id)!
    expect(m.homeGoals).toBe(null)
    expect(m.awayGoals).toBe(null)
  })
})

describe('rankingResult helper', () => {
  it('gives the stronger (lower rank) team more goals', () => {
    // ARG rank 1 vs JOR rank 64
    const r = rankingResult('ARG', 'JOR')
    expect(r.homeGoals).toBeGreaterThan(r.awayGoals)
  })

  it('is deterministic for a given pairing', () => {
    expect(rankingResult('BRA', 'HAI')).toEqual(rankingResult('BRA', 'HAI'))
  })

  it('caps goals at 5', () => {
    const r = rankingResult('ARG', 'JOR')
    expect(r.homeGoals).toBeLessThanOrEqual(5)
    expect(r.awayGoals).toBeLessThanOrEqual(5)
  })
})

describe('SIMULATE_BY_RANKING', () => {
  it('leaves no null scores across all 72 matches', () => {
    const next = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    expect(next.matches).toHaveLength(72)
    expect(next.matches.every((m) => m.homeGoals !== null && m.awayGoals !== null)).toBe(true)
  })

  it('is deterministic (same output twice)', () => {
    const a = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const b = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    expect(a.matches).toEqual(b.matches)
  })

  it('a strong-vs-weak pairing yields the stronger team more goals', () => {
    const next = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    // ARG (rank 1) vs JOR (rank 64) regardless of which side ARG plays on.
    const argJor = next.matches.find(
      (m) =>
        (m.home === 'ARG' && m.away === 'JOR') || (m.home === 'JOR' && m.away === 'ARG'),
    )!
    const argGoals = argJor.home === 'ARG' ? argJor.homeGoals! : argJor.awayGoals!
    const jorGoals = argJor.home === 'ARG' ? argJor.awayGoals! : argJor.homeGoals!
    expect(argGoals).toBeGreaterThan(jorGoals)
  })

  it('is immutable (does not mutate input)', () => {
    const s = initialState()
    reducer(s, { type: 'SIMULATE_BY_RANKING' })
    expect(s.matches.every((m) => m.homeGoals === null)).toBe(true)
  })
})

describe('FILL_SCENARIO', () => {
  it('leaves no null scores with a seeded rng', () => {
    const next = reducer(initialState(), { type: 'FILL_SCENARIO', rng: seededRng(42) })
    expect(next.matches.every((m) => m.homeGoals !== null && m.awayGoals !== null)).toBe(true)
  })

  it('is reproducible for the same seed', () => {
    const a = reducer(initialState(), { type: 'FILL_SCENARIO', rng: seededRng(7) })
    const b = reducer(initialState(), { type: 'FILL_SCENARIO', rng: seededRng(7) })
    expect(a.matches).toEqual(b.matches)
  })

  it('produces goals in the 0-4 range', () => {
    const next = reducer(initialState(), { type: 'FILL_SCENARIO', rng: seededRng(99) })
    for (const m of next.matches) {
      expect(m.homeGoals!).toBeGreaterThanOrEqual(0)
      expect(m.homeGoals!).toBeLessThanOrEqual(4)
      expect(m.awayGoals!).toBeGreaterThanOrEqual(0)
      expect(m.awayGoals!).toBeLessThanOrEqual(4)
    }
  })
})

describe('CLEAR', () => {
  it('returns all scores to null from a filled state', () => {
    const filled = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const cleared = reducer(filled, { type: 'CLEAR' })
    expect(cleared.matches.every((m) => m.homeGoals === null && m.awayGoals === null)).toBe(true)
    // immutable
    expect(filled.matches.some((m) => m.homeGoals !== null)).toBe(true)
  })
})

describe('parseStored', () => {
  it('returns null for null input', () => {
    expect(parseStored(null)).toBe(null)
  })

  it('returns null for corrupt JSON', () => {
    expect(parseStored('{not json')).toBe(null)
  })

  it('returns null when shape mismatches (no matches array)', () => {
    expect(parseStored(JSON.stringify({ foo: 'bar' }))).toBe(null)
  })

  it('returns null when matches length is wrong', () => {
    expect(parseStored(JSON.stringify({ matches: [] }))).toBe(null)
  })

  it('returns the state for a valid stored payload', () => {
    const s = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const parsed = parseStored(JSON.stringify(s)) as AppState
    expect(parsed).not.toBe(null)
    expect(parsed.matches).toHaveLength(72)
    expect(parsed.matches).toEqual(s.matches)
  })

  it('normalizes liveMode/manualBackup on a valid parse (always manual on reload)', () => {
    const s = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const parsed = parseStored(JSON.stringify(s)) as AppState
    expect(parsed.liveMode).toBe(false)
    expect(parsed.manualBackup).toBe(null)
  })

  it('loads legacy {matches}-only payloads, normalized to manual mode', () => {
    const legacy = JSON.stringify({ matches: initialState().matches })
    const parsed = parseStored(legacy) as AppState
    expect(parsed).not.toBe(null)
    expect(parsed.matches).toHaveLength(72)
    expect(parsed.liveMode).toBe(false)
    expect(parsed.manualBackup).toBe(null)
  })
})

describe('live mode', () => {
  it('ENABLE_LIVE clears scores, sets liveMode, backs up prior matches', () => {
    const filled = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const live = reducer(filled, { type: 'ENABLE_LIVE' })
    expect(live.liveMode).toBe(true)
    expect(live.matches.every((m) => m.homeGoals === null && m.awayGoals === null)).toBe(true)
    expect(live.manualBackup).not.toBe(null)
    expect(live.manualBackup).toHaveLength(72)
    // backup preserves the prior (filled) scores
    expect(live.manualBackup!.some((m) => m.homeGoals !== null)).toBe(true)
    expect(live.manualBackup).toEqual(filled.matches)
  })

  it('APPLY_LIVE_RESULTS orients goals by team identity even when a/b are swapped', () => {
    const fixtures: Match[] = [
      {
        id: 'A-1-0',
        group: 'A',
        matchday: 1,
        date: '2026-06-11',
        home: 'MEX',
        away: 'RSA',
        homeGoals: null,
        awayGoals: null,
      },
    ]
    const state: AppState = { matches: fixtures, liveMode: true, manualBackup: null }
    // result has a/b swapped relative to fixture (a=RSA away, b=MEX home)
    const next = reducer(state, {
      type: 'APPLY_LIVE_RESULTS',
      results: [{ a: 'RSA', b: 'MEX', ga: 1, gb: 3 }],
    })
    const m = next.matches[0]
    // fixture.home is MEX, which is b in the result -> gets gb=3
    expect(m.homeGoals).toBe(3)
    expect(m.awayGoals).toBe(1)
    expect(next.liveMode).toBe(true)
  })

  it('APPLY_LIVE_RESULTS leaves non-matching fixtures unchanged', () => {
    const fixtures: Match[] = [
      {
        id: 'A-1-0',
        group: 'A',
        matchday: 1,
        date: '2026-06-11',
        home: 'MEX',
        away: 'RSA',
        homeGoals: null,
        awayGoals: null,
      },
    ]
    const state: AppState = { matches: fixtures, liveMode: true, manualBackup: null }
    const next = reducer(state, {
      type: 'APPLY_LIVE_RESULTS',
      results: [{ a: 'CAN', b: 'SUI', ga: 2, gb: 0 }],
    })
    expect(next.matches[0].homeGoals).toBe(null)
    expect(next.matches[0].awayGoals).toBe(null)
  })

  it('DISABLE_LIVE restores manualBackup and clears it', () => {
    const filled = reducer(initialState(), { type: 'SIMULATE_BY_RANKING' })
    const live = reducer(filled, { type: 'ENABLE_LIVE' })
    const back = reducer(live, { type: 'DISABLE_LIVE' })
    expect(back.liveMode).toBe(false)
    expect(back.manualBackup).toBe(null)
    expect(back.matches).toEqual(filled.matches)
  })

  it('DISABLE_LIVE with no backup clears scores', () => {
    const state: AppState = {
      matches: initialState().matches.map((m) => ({ ...m, homeGoals: 1, awayGoals: 0 })),
      liveMode: true,
      manualBackup: null,
    }
    const back = reducer(state, { type: 'DISABLE_LIVE' })
    expect(back.liveMode).toBe(false)
    expect(back.matches.every((m) => m.homeGoals === null && m.awayGoals === null)).toBe(true)
  })
})
