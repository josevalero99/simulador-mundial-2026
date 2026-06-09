import { describe, it, expect } from 'vitest'
import { DEFAULT_PORRA } from './porra'
import { TEAMS } from './teams'

describe('DEFAULT_PORRA', () => {
  it('has 12 entries of 4 teams each', () => {
    expect(DEFAULT_PORRA).toHaveLength(12)
    for (const e of DEFAULT_PORRA) {
      expect(e.teams).toHaveLength(4)
    }
  })

  it('is a valid partition: 48 distinct ids, all existing in TEAMS', () => {
    const all = DEFAULT_PORRA.flatMap(e => e.teams)
    expect(all).toHaveLength(48)
    expect(new Set(all).size).toBe(48)
    for (const id of all) {
      expect(TEAMS[id], `team ${id} should exist`).toBeDefined()
    }
    // Equal to the full set of teams.
    expect(new Set(all)).toEqual(new Set(Object.keys(TEAMS)))
  })
})
